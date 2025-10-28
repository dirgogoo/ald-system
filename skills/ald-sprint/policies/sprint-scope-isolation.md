# Sprint Scope Isolation Policies

Políticas CRÍTICAS para proteger contra scope creep, modificações acidentais e regressões.

---

## Policy 10.6 — Scope Boundary Enforcement

**MUST**: Só modificar arquivos dentro do `in_scope` da sprint ativa.

**Rationale**: Previne scope creep, modificações acidentais, efeitos colaterais inesperados.

**Implementation**:
```typescript
// ✅ Good - Respeitando scope boundaries

// Sprint: "Implementar checkout"
// in_scope: ["app/checkout/**", "lib/stripe.ts"]
// off_limits: ["app/auth/**", "app/products/**"]

// Task: "Criar formulário de pagamento"
Edit: app/checkout/payment-form.tsx    // ✅ IN_SCOPE
Edit: components/checkout/card.tsx     // ✅ IN_SCOPE
Edit: lib/stripe.ts                    // ✅ IN_SCOPE

// ❌ Bad - Violando scope

Edit: app/auth/login/page.tsx          // ❌ OFF_LIMITS!
// Por que estamos tocando em login durante sprint de checkout?

Edit: db/schema/users.ts               // ❌ OFF_LIMITS!
// Users não tem relação com checkout

Edit: app/products/[id]/page.tsx       // ❌ OFF_LIMITS!
// Products está fora do escopo desta sprint
```

**Validação Automática**:

Antes de cada Edit:
```typescript
function validateFileEdit(filePath: string, sprint: Sprint): ValidationResult {
  // 1. Check se arquivo está no in_scope
  const isInScope = sprint.scope.in_scope.some(pattern =>
    matchesGlob(filePath, pattern)
  );

  if (isInScope) {
    return { valid: true };
  }

  // 2. Check se arquivo está no off_limits
  const isOffLimits = sprint.scope.off_limits.some(pattern =>
    matchesGlob(filePath, pattern)
  );

  if (isOffLimits) {
    return {
      valid: false,
      reason: `File ${filePath} is in off_limits`,
      action: "BLOCK_AND_ALERT"
    };
  }

  // 3. Arquivo não está em nenhuma lista (shared code?)
  return {
    valid: false,
    reason: `File ${filePath} not in sprint scope`,
    action: "REQUIRE_IMPACT_ANALYSIS"
  };
}
```

**Casos Especiais - Shared Code**:

Se precisar modificar código compartilhado (usado em > 1 lugar):

```typescript
// Exemplo: lib/utils/format.ts (usado em 5 lugares)

// ⚠️ Alerta obrigatório:
⚠️ SHARED CODE MODIFICATION DETECTED

File: lib/utils/format.ts
Usage: 5 locations (checkout, products, auth, admin, emails)
Sprint scope: checkout only

This file is used OUTSIDE current sprint scope.

Required: Impact Analysis (Policy 10.8)

Options:
1. Create sprint-specific function (formatCheckoutDate)
2. Extend existing function (backward compatible)
3. Add file to sprint scope (expand scope + get permission)

Recommend: Option 1 (safest)
```

**Exceções Permitidas**:

Casos onde modificar fora do scope é OK:

1. **Bugfix Crítico**: Produução quebrada, precisa fix imediato
   - Requer permissão explícita do usuário
   - Documentar em `decisions`

2. **Dependência Descoberta**: Sprint revelou dependência não planejada
   - Exemplo: Checkout precisa modificar cart logic
   - Requer adicionar ao scope + usuário aprovar

3. **Shared Utils**: Adicionar função nova (não modificar existente)
   - Criar `libUtils/checkoutHelpers.ts` ao invés de modificar `lib/utils.ts`

---

## Policy 10.7 — Regression Prevention

**MUST**: Garantir que testes antigos continuam passando após sprint.

**Rationale**: Sprint não pode quebrar funcionalidades existentes.

**Workflow Obrigatório**:

**Antes da Sprint** (Baseline):
```bash
# 1. Rodar todos os testes
npm test

# 2. Salvar baseline
npm test > tests-baseline.txt

# 3. Registrar em sprint
{
  "regression_baseline": {
    "tests_passed": 45,
    "tests_failed": 0,
    "timestamp": "2025-10-23T19:00:00Z"
  }
}
```

**Durante Sprint**:
- Adicionar novos testes para novas features
- Não modificar testes antigos (a menos que refactoring justificado)

**Após Sprint** (Validation):
```bash
# 1. Rodar testes novamente
npm test

# 2. Comparar
{
  "regression_check": {
    "baseline": { "passed": 45, "failed": 0 },
    "current": { "passed": 47, "failed": 0 },
    "new_tests": 2,
    "regressions": [],
    "verdict": "✅ NO REGRESSIONS"
  }
}
```

**Se Regressão Detectada**:
```json
{
  "regression_check": {
    "baseline": { "passed": 45, "failed": 0 },
    "current": { "passed": 44, "failed": 1 },
    "new_tests": 2,
    "regressions": [
      {
        "test": "Auth - should login with valid credentials",
        "file": "app/auth/login.test.ts",
        "status": "FAILED",
        "error": "TypeError: undefined is not a function",
        "likely_cause": "Modified shared validation in lib/validate.ts"
      }
    ],
    "verdict": "❌ REGRESSION DETECTED"
  }
}
```

**Ação Obrigatória** se regressão:
```
❌ SPRINT NOT COMPLETE - REGRESSION DETECTED

Test failed: Auth - should login with valid credentials
Likely cause: Modified lib/validate.ts during checkout sprint

REQUIRED ACTIONS:
1. ❌ Sprint cannot be marked as completed
2. 🔧 Revert changes to lib/validate.ts
3. 🔍 Find alternative approach that doesn't break auth
4. ✅ Re-test until no regressions

Sprint status: BLOCKED until regression fixed
```

**Rationale para Rigidez**:
- Regressões custam caro (usuários afetados, tempo de debug)
- Melhor prevenir do que remediar
- Sprint não pode "quebrar o que já funciona"

---

## Policy 10.8 — Change Impact Analysis

**MUST**: Analisar impacto ANTES de modificar código compartilhado.

**Rationale**: Código usado em múltiplos lugares requer análise cuidadosa.

**Quando Aplicar**:
- Modificar funções/componentes usados em > 1 lugar
- Alterar schemas de banco de dados
- Mudar assinaturas de APIs
- Refatorar código em `lib/`, `utils/`, `components/ui/`

**Workflow Obrigatório**:

**Step 1**: Identificar se código é compartilhado
```bash
# Antes de modificar: lib/utils/format.ts

# Procurar onde é usado
grep -r "import.*format" app/
grep -r "from.*format" app/

# Resultado
app/checkout/page.tsx:2: import { formatDate } from '@/lib/utils/format';
app/products/[id]/page.tsx:5: import { formatDate, formatCurrency } from '@/lib/utils/format';
app/admin/reports/page.tsx:3: import { formatDate } from '@/lib/utils/format';
components/invoice/invoice.tsx:8: import { formatCurrency } from '@/lib/utils/format';

# Usado em: 4 arquivos (checkout, products, admin, invoice)
# ⚠️ SHARED CODE - Requer impact analysis
```

**Step 2**: Preencher template de análise

Usar `templates/impact-analysis-template.md`:

```markdown
## Impact Analysis

**File**: lib/utils/format.ts
**Function**: formatDate
**Usage**: 3 locations
**Sprint**: checkout

**Planned Change**: Add timezone support

**Breaking?**: ✅ Yes (new required parameter)

**Impacted Files**:
- app/checkout/page.tsx ✅ Can update (in scope)
- app/products/[id]/page.tsx ❌ Out of scope
- app/admin/reports/page.tsx ❌ Out of scope

**Decision**: Create new function formatDateWithTimezone()
- Keep old formatDate() unchanged
- New function for checkout use
- No breaking changes
```

**Step 3**: Escolher abordagem

**Option A**: Modificar (se não-breaking)
```typescript
// ✅ Backward compatible
export function formatDate(
  date: Date,
  timezone?: string // Optional param
): string {
  // Implementation
}

// All existing calls still work (no timezone = default)
```

**Option B**: Criar versão nova (se breaking)
```typescript
// ✅ Keep old version
export function formatDate(date: Date): string {
  // Original implementation
}

// ✅ Add new version
export function formatDateWithTimezone(
  date: Date,
  timezone: string
): string {
  // New implementation
}

// Usage in checkout (sprint scope):
import { formatDateWithTimezone } from '@/lib/utils/format';
const formatted = formatDateWithTimezone(order.date, 'America/Sao_Paulo');
```

**Option C**: Pedir permissão explícita
```
⚠️ SHARED CODE IMPACT ANALYSIS

Planning to modify: lib/utils/format.ts → formatDate()

Current usage: 3 files (checkout ✅, products ❌, admin ❌)
Planned change: Add timezone parameter (BREAKING CHANGE)

Impact:
- 1 file in scope (can update)
- 2 files out of scope (cannot touch during this sprint)

Recommendation: Create formatDateWithTimezone() (Option B)

Approve to proceed?
```

**Step 4**: Executar decisão
- Se Option A/B: Implementar
- Se Option C: Aguardar permissão

**Step 5**: Documentar decisão
```json
{
  "decisions": [
    {
      "what": "Created formatDateWithTimezone() ao invés de modificar formatDate()",
      "why": "formatDate() é usado em products/admin (fora do scope). Modificar quebraria 2 features.",
      "impact_analysis": "templates/impact-analysis-2025-10-23.md",
      "timestamp": "2025-10-23T20:00:00Z"
    }
  ]
}
```

---

## Anti-Patterns to Avoid

❌ **Modificar arquivos off_limits sem permissão**
❌ **Ignorar regressões** ("1 teste falhou mas a feature tá pronta")
❌ **Modificar shared code sem impact analysis**
❌ **Aceitar scope creep** ("já que estou aqui, vou arrumar isso também")
❌ **Pular regression baseline** (não saber se quebrou algo)
❌ **Breaking changes em código compartilhado**

---

**Last Updated**: 2025-10-23
**Policy Count**: 3
