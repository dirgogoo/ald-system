# Sprint Execution Policies

Políticas para executar sprints mantendo foco, rastreando progresso e respeitando scope.

---

## Policy 10.3 — Progress Tracking

**MUST**: Atualizar status das tasks conforme progresso.

**Rationale**: Visibilidade do progresso, identificação precoce de blockers.

**Status Values**:
- `pending`: Task não iniciada
- `in_progress`: Task sendo trabalhada
- `completed`: Task finalizada e validada

**Implementation**:
```json
// ✅ Good - Progress tracking

{
  "tasks": [
    {
      "id": "task-1",
      "title": "Criar schema de orders",
      "status": "completed",
      "files_modified": ["db/schema/orders.ts"],
      "completed_at": "2025-10-23T19:15:00Z"
    },
    {
      "id": "task-2",
      "title": "Integrar Stripe",
      "status": "in_progress",
      "files_modified": ["lib/stripe.ts"],
      "notes": "Payment Intent criado, falta Webhook"
    },
    {
      "id": "task-3",
      "title": "Criar UI checkout",
      "status": "pending",
      "files_modified": []
    }
  ]
}

// ❌ Bad - No tracking
// Tasks listadas mas nunca atualizadas
// Não sabe o que está completo
```

**Quando Atualizar**:
- **Ao iniciar task**: Marcar como `in_progress`
- **Ao completar task**: Marcar como `completed` + timestamp
- **Se bloquear**: Adicionar em `blockers`

**Decisions Log**:

Registrar decisões importantes tomadas durante sprint:

```json
{
  "decisions": [
    {
      "what": "Usar Stripe Checkout ao invés de Payment Intents",
      "why": "Mais simples para MVP, menos código custom",
      "timestamp": "2025-10-23T19:30:00Z",
      "task": "task-2"
    }
  ]
}
```

---

## Policy 10.4 — Blocker Management

**MUST**: Registrar blockers imediatamente quando detectados.

**Rationale**: Blockers não documentados atrasam sprint silenciosamente.

**Blocker Structure**:
```json
{
  "id": "blocker-1",
  "description": "Missing Stripe API key",
  "impact": "high", // low, medium, high, critical
  "status": "resolved", // pending, in_progress, resolved
  "resolution": "Got test key from PM",
  "detected_at": "2025-10-23T19:00:00Z",
  "resolved_at": "2025-10-23T19:15:00Z"
}
```

**Implementation**:
```typescript
// ✅ Good - Blocker tracking

// Detectou blocker:
const blocker = {
  id: "blocker-1",
  description: "Database migration failed - constraint violation",
  impact: "critical",
  status: "in_progress",
  detected_at: new Date().toISOString()
};

// Adicionou em current-sprint.json
sprint.blockers.push(blocker);

// Resolveu:
blocker.status = "resolved";
blocker.resolution = "Fixed foreign key constraint in migration";
blocker.resolved_at = new Date().toISOString();

// ❌ Bad - Blocker silencioso
// Encontrou blocker, não registrou
// Passou horas resolvendo
// Nenhum registro do que aconteceu
// Próxima sprint: mesmo blocker pode acontecer
```

**Common Blockers**:
- Missing API keys/credentials
- Dependency on external service
- Waiting for design/approval
- Technical complexity underestimated
- Scope violation detected

---

## Policy 10.5 — Sprint Awareness Check

**MUST**: SEMPRE verificar sprint ativa antes de implementar qualquer código.

**Rationale**: Previne work fora do escopo, garante foco na sprint atual.

**Workflow Obrigatório**:

**Step 1**: Ao receber tarefa do usuário
```typescript
// 1. Carregar sprint ativa
const sprint = await readFile('active/current-sprint.json');

// 2. Se não existe sprint
if (!sprint) {
  askUser("Nenhuma sprint ativa. Deseja criar uma sprint para esta tarefa?");
}

// 3. Se existe sprint
if (sprint) {
  validateTaskScope(userTask, sprint);
}
```

**Step 2**: Validar scope da tarefa
```typescript
function validateTaskScope(task: string, sprint: Sprint): ValidationResult {
  // Tarefa relacionada ao sprint goal?
  const isRelated = taskRelatedToGoal(task, sprint.goal);

  if (!isRelated) {
    return {
      valid: false,
      reason: "Task fora do escopo da sprint atual",
      alert: `⚠️ Sprint ativa: "${sprint.goal}"\nTask solicitada: "${task}"\n\n❌ Não relacionadas`
    };
  }

  // Arquivos que serão modificados estão no scope?
  const filesToModify = identifyFiles(task);
  const outOfScope = filesToModify.filter(file =>
    !matchesPattern(file, sprint.scope.in_scope)
  );

  if (outOfScope.length > 0) {
    return {
      valid: false,
      reason: "Arquivos fora do scope",
      alert: `⚠️ Arquivos fora do scope:\n${outOfScope.join('\n')}\n\noff_limits:\n${sprint.scope.off_limits.join('\n')}`
    };
  }

  return { valid: true };
}
```

**Step 3**: Alertar usuário se fora do escopo
```
⚠️ SPRINT SCOPE VIOLATION

Sprint ativa: "Implementar checkout com Stripe"
Task solicitada: "Corrigir bug no login"

❌ Esta tarefa está FORA DO ESCOPO da sprint atual.

Arquivos a modificar: app/auth/login/page.tsx
Status: Em off_limits (app/auth/**)

Opções:
1. Finalizar sprint atual e criar nova sprint "Auth Fixes"
2. Adicionar app/auth/** ao scope da sprint (expande escopo)
3. Executar task fora de sprint (sem tracking)
4. Cancelar e continuar focado na sprint atual

Como prefere proceder?
```

**Quando NÃO Alertar**:
- Task claramente relacionada ao goal
- Arquivos no in_scope
- Mudanças mínimas em shared code (com impact analysis)

**Exemplo de Validação Correta**:
```
Sprint: "Implementar checkout com Stripe"

✅ Task: "Adicionar loading state no botão de pagamento"
   → Relacionado: SIM (checkout)
   → Arquivos: components/checkout/payment-button.tsx
   → No scope: SIM (components/checkout/**)
   → Conclusão: PROSSEGUIR

❌ Task: "Adicionar validação no form de cadastro"
   → Relacionado: NÃO (cadastro ≠ checkout)
   → Arquivos: app/auth/register/page.tsx
   → No scope: NÃO (app/auth/** está em off_limits)
   → Conclusão: ALERTAR USUÁRIO
```

---

## Anti-Patterns to Avoid

❌ **Não atualizar status das tasks**
❌ **Ignorar blockers** (não registrar)
❌ **Pular sprint awareness check** (implementar sem verificar sprint)
❌ **Modificar arquivos off_limits sem permissão**
❌ **Não documentar decisões importantes**
❌ **Aceitar scope creep silenciosamente**

---

**Last Updated**: 2025-10-23
**Policy Count**: 3
