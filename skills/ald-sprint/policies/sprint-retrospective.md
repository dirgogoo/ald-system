# Sprint Retrospective Policies

Políticas para capturar learnings e promover melhoria contínua.

---

## Policy 10.11 — Learning Capture

**MUST**: Documentar learnings de forma estruturada após cada sprint.

**Rationale**: Learnings não documentados são perdidos. Structured format permite análise pelo curator.

**Structured Format**:

### 1. What Went Well ✅

Lista de sucessos e aspectos positivos:
```markdown
## What Went Well

1. Stripe integration foi mais rápida que esperado
   - Docs claras
   - SDK bem estruturado
   - Poucos edge cases

2. Zero regressões detectadas
   - Scope isolation funcionou
   - Impact analysis preveniu breaking changes

3. All tasks completed within sprint
   - Boa decomposição das tasks
   - Sem blockers críticos
```

### 2. What Could Be Improved 🔧

Áreas para melhoria (não culpa, mas oportunidade):
```markdown
## What Could Be Improved

1. Scope expandiu durante sprint
   - Inicialmente: checkout only
   - Final: checkout + email notifications
   - Lesson: Considerar notificações no planning inicial

2. Shared code modification foi arriscada
   - Modificamos lib/validate.ts
   - Quase causou regressão em auth
   - Lesson: Sempre criar função nova ao invés de modificar shared

3. Faltou considerar edge case: expired cards
   - Descoberto apenas em teste manual
   - Lesson: Adicionar edge case checklist no planning
```

### 3. Blockers Encountered 🚧

Documentar blockers e resoluções:
```markdown
## Blockers

| Blocker | Impact | Resolution | Prevention |
|---------|--------|------------|------------|
| Missing Stripe test key | High | Got from PM in 15min | Add credential checklist to planning |
| Cart state conflict | Medium | Refactored state management | Better state architecture needed |
```

### 4. Patterns Detected 🔍

Identificar patterns para o curator promover:
```markdown
## Patterns Detected

**Pattern 1: Payment Integration Flow**
- Frequency: 2nd sprint with payment integration
- Pattern: Schema → SDK integration → UI → Webhooks → Tests
- Recommendation: Create "Payment Integration Sprint Template"
- Benefit: Next payment integration sprint follows proven pattern

**Pattern 2: Email Notification Coupling**
- Frequency: 3rd sprint needing email notifications
- Pattern: Checkout needs emails, orders needs emails, auth needs emails
- Recommendation: Create reusable email system early
- Benefit: Avoid repeating email integration in every sprint
```

**Implementation**:
```typescript
// ✅ Good - Structured learning capture

const retrospective = {
  sprint_id: "sprint-008-checkout",
  completed_at: "2025-10-23T22:00:00Z",

  what_went_well: [
    "Stripe integration simpler than expected",
    "Zero regressions detected",
    "Scope isolation policies prevented issues"
  ],

  what_could_improve: [
    "Scope expanded during sprint (checkout → checkout + emails)",
    "Edge case (expired cards) discovered late",
    "Almost modified shared code unsafely"
  ],

  blockers: [
    {
      blocker: "Missing Stripe test key",
      impact: "high",
      resolution: "Got from PM",
      prevention: "Add credential checklist to planning"
    }
  ],

  patterns_detected: [
    {
      name: "Payment Integration Flow",
      frequency: 2,
      pattern: "Schema → SDK → UI → Webhooks → Tests",
      recommendation: "Create reusable template"
    }
  ],

  metrics: {
    tasks_completed: 4,
    tasks_added: 1,
    scope_changes: 1,
    regressions: 0
  }
};

// Salvar em history/sprint-008-checkout-retro.json
await saveRetrospective(retrospective);

// ❌ Bad - Unstructured learning
// "Foi bem, sem problemas"
// "Demorou um pouco mas deu certo"
// Learnings perdidos, não podem ser analisados pelo curator 😱
```

---

## Policy 10.12 — Continuous Improvement

**MUST**: Alimentar curator com learnings para evolução do sistema.

**Rationale**: Retrospectivas só têm valor se levam a melhorias. Curator transforma learnings em políticas.

**Workflow de Melhoria Contínua**:

**Step 1**: Após retrospective, invocar curator
```typescript
// Claude invoca curator com sprint completada
await invokeCurator({
  type: "sprint_analysis",
  sprint_id: "sprint-008-checkout",
  retrospective: retrospective
});
```

**Step 2**: Curator analisa sprint

```typescript
// Curator processa
const analysis = {
  // 1. Detecta patterns
  patterns: [
    {
      name: "Payment Integration Flow",
      occurrences: 2, // Visto em 2 sprints
      status: "candidate", // Não é policy ainda (precisa 3+)
      recommendation: "Monitor for 3rd occurrence"
    },
    {
      name: "Email Notification Coupling",
      occurrences: 3, // Visto em 3 sprints! ⭐
      status: "validated_pattern", // Promover a policy
      recommendation: "CREATE POLICY: Early Email System Setup"
    }
  ],

  // 2. Identifica anti-patterns
  anti_patterns: [
    {
      issue: "Scope expansion (checkout → checkout + emails)",
      frequency: 2,
      recommendation: "Add policy: Consider dependencies in planning"
    }
  ],

  // 3. Registra feedback
  feedback: {
    date: "2025-10-23",
    run_id: "sprint-008-checkout",
    note: "Sprint de checkout revelou pattern: features sempre precisam notificações",
    tags: ["email", "notifications", "pattern"],
    impact: "Medium - próximas sprints podem planejar melhor",
    lesson_learned: "Considerar email/notifications no planning inicial"
  }
};
```

**Step 3**: Curator aplica melhorias

Se pattern validado (≥3 occurrences):
```typescript
// Criar nova policy
const newPolicy = {
  id: "Policy 2.15",
  category: "UI/UX",
  title: "Email Notifications Required",
  content: `
    **SHOULD**: Planejar sistema de email notifications early.

    **Rationale**: 3 sprints (auth, checkout, orders) precisaram emails.

    **Pattern**: Features sempre precisam confirmar ações via email.

    **Implementation**:
    - Sprint de Auth? → Considerar email verification
    - Sprint de Checkout? → Considerar order confirmation
    - Sprint de Orders? → Considerar status updates
  `
};

// Adicionar a ald-policies/policies/ui-ux.md
await addPolicy("ui-ux.md", newPolicy);
```

**Step 4**: Feedback loop completo

```
Sprint → Retrospective → Curator Analysis → New Policy → Next Sprint
                                    ↑                         ↓
                                    └───── Applies Policy ────┘
```

**Exemplo Completo**:
```markdown
## Improvement Cycle Example

### Sprint 1: Auth
- Learnings: "Precisamos de email verification"
- Pattern detected: "Email notifications (1x)"

### Sprint 2: Checkout
- Learnings: "Checkout precisa email de confirmação"
- Pattern detected: "Email notifications (2x)"

### Sprint 3: Orders
- Learnings: "Orders precisam status updates via email"
- Pattern detected: "Email notifications (3x)" ⭐

### Curator Action
- Pattern validated (≥3 occurrences)
- Create Policy 2.15: "Email Notifications Required"
- Add to ui-ux.md

### Sprint 4: Products
- Planning phase: Checks policies
- Finds Policy 2.15: Email Notifications
- Claude: "Based on past sprints, consider email notifications for:
  - Product approval (seller)
  - Product published (seller)
  - Low stock alert (seller)"
- User: "Good catch! Let's add that to scope"

### Result
- Learning from sprints 1-3 improved sprint 4 planning
- No need to expand scope mid-sprint
- Feature more complete from the start
```

**Actions for Improvement**:

Based on retrospective, criar action items:
```markdown
## Action Items

1. [ ] Add "Consider email notifications" to planning checklist
2. [ ] Create reusable email template system
3. [ ] Document edge case checklist for payment integrations
4. [ ] Update impact analysis template based on learnings

Assigned to: Curator (auto-apply) + User (review policies)
```

---

## Anti-Patterns to Avoid

❌ **Skip retrospective** ("sprint done, move on")
❌ **Vague learnings** ("foi bem")
❌ **No action items** (retrospective sem follow-up)
❌ **Blame culture** ("fulano errou X")
❌ **Not feeding curator** (learnings não viram policies)
❌ **Ignoring patterns** (mesmo problema 3x, não documenta)

---

**Last Updated**: 2025-10-23
**Policy Count**: 2
