# ald-sprint — Sprint Management for ALD

**Scope-based sprint system** for organizing development work with built-in protection against scope creep and regressions.

---

## Purpose

Organize development into **focused sprints** with:
- Clear goals and deliverables
- Scope isolation (only modify relevant files)
- Regression prevention (old tests must pass)
- Learning capture (retros → policies)

**Key Difference**: Sprints are **scope-based, not time-based**. A sprint to "setup auth" might take 20 minutes. A sprint to "build checkout" might take 2 days. Duration doesn't matter — **scope** does.

---

## Workflow Integration

### New ALD Workflow (with Sprints)

```
0. 🏃 SPRINT CHECK ⭐ (ald-sprint)
   ├─ Sprint ativa? Read active/current-sprint.json
   ├─ Tarefa no escopo? Validar goal + files
   └─ Fora do escopo? Alertar usuário
   ↓
1. 🧠 LOAD MEMORY (ald-memory)
   └─ Incluir sprint context
   ↓
2. 📜 LOAD POLICIES (ald-policies)
   └─ SEMPRE incluir: sprint-scope-isolation.md
   ↓
3. 🎯 ORCHESTRATE → EXECUTE → TEST (+ regression) → CURATE
```

---

## Sprint Lifecycle

### 1. PLAN

**Objetivo**: Definir sprint goal e scope boundaries.

**Workflow**:
```
User: "Vou implementar checkout com Stripe"

Claude:
1. Cria sprint-XXX-checkout.json
2. Define goal: "Implementar checkout completo com Stripe"
3. Identifica scope:
   IN_SCOPE:
     - app/checkout/**
     - components/checkout/**
     - lib/stripe.ts
   OFF_LIMITS:
     - app/auth/**
     - app/products/**
4. Lista deliverables:
   - Criar schema de orders
   - Integrar Stripe
   - Criar UI de checkout
   - Testes E2E
5. Salva em active/current-sprint.json
```

**Policies Aplicadas**:
- Policy 10.1: Sprint Goal Definition
- Policy 10.2: Task Breakdown Strategy

---

### 2. EXECUTE

**Objetivo**: Implementar tasks respeitando scope boundaries.

**Workflow**:
```
Para cada task:

1. Sprint Awareness Check (Policy 10.5)
   ✅ Sprint ativa: checkout
   ✅ Task: "Criar schema de orders"
   ✅ Arquivo: db/schema/orders.ts (in_scope)

2. Impact Analysis (se shared code)
   Se modificar arquivo usado em > 1 lugar:
   - grep -r "functionName" app/
   - Analisar impacto
   - Decidir: modificar, criar v2, ou pedir permissão

3. Implementar seguindo policies

4. Atualizar progress
   - Marcar task como "completed"
   - Registrar decisões/blockers
```

**Policies Aplicadas**:
- Policy 10.3: Progress Tracking
- Policy 10.4: Blocker Management
- Policy 10.5: Sprint Awareness Check
- Policy 10.6: Scope Boundary Enforcement
- Policy 10.8: Change Impact Analysis

**Exemplo de Bloqueio**:
```
Task: "Adiciona validação no login"

Claude:
⚠️ SPRINT SCOPE VIOLATION

Sprint ativa: "Implementar checkout"
Task solicitada: "validação no login"

❌ app/auth/login está em OFF_LIMITS

Opções:
1. Finalizar sprint checkout, criar nova sprint "Auth Fixes"
2. Adicionar auth ao scope (expande sprint)
3. Executar fora de sprint
4. Cancelar e focar na sprint atual

Como prefere?
```

---

### 3. REVIEW

**Objetivo**: Validar completude da sprint sem regressões.

**Workflow**:
```
1. Verificar todas tasks completadas
   ✅ 4/4 tasks: completed

2. Rodar ald-tester
   ✅ Build passed
   ✅ Novos testes: 5/5 passed

3. Regression Check
   Baseline: 45 tests passed
   Current: 50 tests passed (45 antigos + 5 novos)
   ✅ NO REGRESSIONS

4. Se tudo passou:
   - Mover sprint para history/
   - Atualizar memory (remover current_sprint)

5. Se falhou:
   - Identificar pendências
   - Sprint continua ativa
```

**Policies Aplicadas**:
- Policy 10.7: Regression Prevention
- Policy 10.9: Definition of Done
- Policy 10.10: Sprint Validation Checklist

---

### 4. RETROSPECT

**Objetivo**: Capturar learnings e gerar políticas.

**Workflow**:
```
1. Analisar sprint completada
   - O que funcionou bem?
   - Quais blockers encontrados?
   - Precisou expandir scope? Por quê?
   - Alguma regressão detectada?

2. Identificar patterns
   Se ≥3 sprints similares, detectar padrão:
   Ex: "Sprints de CRUD sempre envolvem: schema + API + UI + tests"

3. Curator processa
   - Registrar em feedback.json
   - Se pattern validado: promover a policy

4. Limpar sprint ativa
   - Remover active/current-sprint.json
   - Sprint disponível em history/ para análise futura
```

**Policies Aplicadas**:
- Policy 10.11: Learning Capture
- Policy 10.12: Continuous Improvement

---

## Sprint Format

### active/current-sprint.json

```json
{
  "sprint_id": "sprint-008-checkout",
  "status": "in_progress",
  "goal": "Implementar checkout completo com Stripe",
  "started_at": "2025-10-23T19:00:00Z",
  "scope": {
    "in_scope": [
      "app/checkout/**",
      "components/checkout/**",
      "lib/stripe.ts",
      "db/schema/orders.ts"
    ],
    "off_limits": [
      "app/auth/**",
      "app/products/**",
      "db/schema/users.ts"
    ]
  },
  "tasks": [
    {
      "id": "task-1",
      "title": "Criar schema de orders",
      "status": "completed",
      "files_modified": ["db/schema/orders.ts"]
    },
    {
      "id": "task-2",
      "title": "Integrar Stripe",
      "status": "in_progress",
      "files_modified": ["lib/stripe.ts"]
    },
    {
      "id": "task-3",
      "title": "Criar UI de checkout",
      "status": "pending",
      "files_modified": []
    }
  ],
  "blockers": [],
  "decisions": [
    {
      "what": "Usamos Stripe Checkout ao invés de Payment Intents",
      "why": "Mais simples para MVP",
      "timestamp": "2025-10-23T19:30:00Z"
    }
  ],
  "regression_baseline": {
    "tests_passed": 45,
    "tests_failed": 0,
    "timestamp": "2025-10-23T19:00:00Z"
  }
}
```

---

## Policies (12 total)

### Sprint Planning (2 policies)
- **10.1**: Sprint Goal Definition (SMART: Specific, Measurable, Achievable, Relevant)
- **10.2**: Task Breakdown Strategy (clear deliverables, sem estimativas)

### Sprint Execution (3 policies)
- **10.3**: Progress Tracking (tasks completadas, status, decisões)
- **10.4**: Blocker Management (identificar, registrar, resolver)
- **10.5**: Sprint Awareness Check (SEMPRE verificar sprint ativa)

### Sprint Scope Isolation (3 policies - CRÍTICAS)
- **10.6**: Scope Boundary Enforcement (só modificar in_scope)
- **10.7**: Regression Prevention (testes antigos devem passar)
- **10.8**: Change Impact Analysis (analisar antes de modificar shared)

### Sprint Review (2 policies)
- **10.9**: Definition of Done (build + tests + UX + no regressions)
- **10.10**: Sprint Validation Checklist (validação completa)

### Sprint Retrospective (2 policies)
- **10.11**: Learning Capture (structured format)
- **10.12**: Continuous Improvement (learnings → curator → policies)

---

## Integration with ALD Skills

### ald-memory
- Carrega sprint context automaticamente
- Inclui `current_sprint` no contexto de memória

### ald-orchestrator
- Coordena 4 fases: PLAN → EXECUTE → REVIEW → RETRO
- Verifica scope antes de executar tasks

### ald-curator
- Processa sprints completadas
- Detecta patterns (≥3 occurrences)
- Promove patterns a policies

### ald-tester
- Valida sprints completas
- Regression check (baseline vs current)

### ald-policies
- 12 novas políticas de sprint
- Total: 96 → 108 políticas

---

## Key Benefits

✅ **Scope Isolation**: Protege contra modificações acidentais fora do escopo
✅ **Regression Prevention**: Garante que código antigo continua funcionando
✅ **Impact Analysis**: Analisa impacto antes de modificar shared code
✅ **Clear Goals**: Sprint goal define claramente o que entregar
✅ **Learning Capture**: Retros alimentam sistema de políticas
✅ **No Time Pressure**: Foco em escopo, não em cronômetro
✅ **Complete Tracking**: Histórico completo de todas sprints

---

## Anti-Patterns

❌ **Ignorar sprint ativa** (sempre verificar Step 0)
❌ **Modificar arquivos off_limits sem permissão**
❌ **Aceitar regressões** ("testes antigos falharam mas task tá pronta")
❌ **Scope creep** (adicionar tasks não relacionadas ao goal)
❌ **Skip retrospective** (perder learnings)
❌ **Modificar shared code sem análise de impacto**

---

**Version**: 1.0.0
**Last Updated**: 2025-10-23
**Integration**: Complete (memory, orchestrator, curator, tester, policies)
