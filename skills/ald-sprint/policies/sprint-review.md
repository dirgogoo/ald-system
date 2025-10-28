# Sprint Review Policies

Políticas para validar completude de sprints com zero regressões.

---

## Policy 10.9 — Definition of Done

**MUST**: Sprint só está completa quando TODOS os critérios são atendidos.

**Rationale**: "Quase pronto" não é pronto. DoD previne trabalho incompleto.

**Critérios Obrigatórios**:

### 1. Funcionalidade ✅
- [ ] Todas as tasks marcadas como `completed`
- [ ] Sprint goal foi atingido (deliverable existe e funciona)
- [ ] Features funcionam conforme esperado

### 2. Testes Técnicos ✅
- [ ] Build passa: `npm run build` sem erros
- [ ] Unit tests passam: `npm test`
- [ ] Integration tests passam (se aplicável)
- [ ] Novos testes adicionados para novas features

### 3. Console Limpo ✅
- [ ] Zero erros no console (browser + server)
- [ ] Warnings justificados (ex: Next.js deprecations conhecidas)

### 4. UX Validada ✅
- [ ] Feature testada manualmente como usuário real
- [ ] Fluxo completo funciona (clicks, forms, navegação)
- [ ] Loading states aparecem corretamente
- [ ] Error states tratados

### 5. Policies Seguidas ✅
- [ ] Código segue políticas relevantes (database, UI, security, etc)
- [ ] Sprint policies seguidas (scope isolation, etc)

### 6. Regressões ❌
- [ ] **ZERO regressões detectadas**
- [ ] Testes antigos continuam passando
- [ ] Funcionalidades existentes não foram quebradas

### 7. Documentação (se necessário) ✅
- [ ] README atualizado (se mudanças de setup)
- [ ] API docs atualizadas (se endpoints mudaram)
- [ ] Comentários adicionados em lógica complexa

**Implementation**:
```typescript
// ✅ Good - DoD checklist completo

async function validateSprintCompletion(sprint: Sprint): Promise<ValidationResult> {
  const checks = [];

  // 1. All tasks completed?
  const incompleteTasks = sprint.tasks.filter(t => t.status !== 'completed');
  checks.push({
    criterion: "All tasks completed",
    passed: incompleteTasks.length === 0,
    details: incompleteTasks.length > 0
      ? `${incompleteTasks.length} tasks pending`
      : "All tasks completed"
  });

  // 2. Build passes?
  const buildResult = await runCommand('npm run build');
  checks.push({
    criterion: "Build passes",
    passed: buildResult.exitCode === 0,
    details: buildResult.stderr || "Build successful"
  });

  // 3. Tests pass?
  const testResult = await runCommand('npm test');
  checks.push({
    criterion: "Tests pass",
    passed: testResult.exitCode === 0,
    details: testResult.stdout.match(/(\d+) passed/)?.[1] + " tests passed"
  });

  // 4. Regression check
  const regressionCheck = compareTests(
    sprint.regression_baseline,
    testResult
  );
  checks.push({
    criterion: "No regressions",
    passed: regressionCheck.regressions.length === 0,
    details: regressionCheck.verdict
  });

  // 5. Console clean? (manual verification)
  checks.push({
    criterion: "Console clean",
    passed: null, // Requires manual check
    details: "Manual verification required"
  });

  const allPassed = checks.every(c => c.passed !== false);

  return {
    complete: allPassed,
    checks,
    blockers: checks.filter(c => c.passed === false)
  };
}

// ❌ Bad - Incomplete validation
function validateSprintCompletion(sprint: Sprint) {
  // Só verifica tasks
  return sprint.tasks.every(t => t.status === 'completed');
  // Não valida build, tests, regressões, UX, etc 😱
}
```

**Quando DoD Falha**:
```
❌ SPRINT NOT COMPLETE

Definition of Done: FAILED

Failing criteria:
✅ Tasks: 4/4 completed
✅ Build: Passed
❌ Tests: 1 regression detected
   - Test: "Auth - login flow"
   - Reason: Modified shared validation function
✅ Console: Clean
⏳ UX: Not tested yet

Required actions:
1. Fix regression (revert or fix validation function)
2. Re-run tests until passing
3. Test UX manually
4. Re-validate DoD

Sprint status: IN_PROGRESS (not completed)
```

---

## Policy 10.10 — Sprint Validation Checklist

**SHOULD**: Usar ald-tester para validação completa da sprint.

**Rationale**: ald-tester simula usuário real, valida de ponta a ponta.

**Workflow de Validação**:

**Step 1**: Invocar ald-tester
```bash
# Claude invoca ald-tester após implementação completa
ald-tester --mode=sprint --sprint-id=sprint-008-checkout
```

**Step 2**: ald-tester executa validações

```json
{
  "validation": {
    "technical": {
      "build": { "passed": true, "score": 1.0 },
      "typescript": { "passed": true, "score": 1.0 },
      "tests": { "passed": true, "score": 1.0 }
    },
    "functional": {
      "checkout_flow": {
        "passed": true,
        "steps_validated": [
          "Add item to cart",
          "Navigate to checkout",
          "Fill payment form",
          "Submit payment",
          "Confirm order created"
        ]
      }
    },
    "regression": {
      "baseline": { "passed": 45, "failed": 0 },
      "current": { "passed": 48, "failed": 0 },
      "verdict": "✅ NO REGRESSIONS"
    },
    "policies_followed": {
      "sprint_scope_isolation": { "passed": true },
      "security": { "passed": true },
      "ui_ux": { "passed": true }
    }
  },
  "overall_result": {
    "passed": true,
    "score": 0.98,
    "summary": "Sprint validated successfully. Zero regressions, all features working."
  }
}
```

**Step 3**: Analisar resultado

Se `passed: true`:
- ✅ Sprint completa
- Mover para `history/`
- Invocar ald-curator (retrospective)

Se `passed: false`:
- ❌ Sprint não completa
- Identificar falhas
- Corrigir e re-validar

**Exemplo de Falha**:
```json
{
  "overall_result": {
    "passed": false,
    "score": 0.75,
    "blockers": [
      {
        "type": "regression",
        "severity": "critical",
        "description": "Auth login test failing after checkout changes",
        "action_required": "Revert lib/validate.ts or fix breaking change"
      }
    ]
  }
}
```

**Validação Manual Adicional**:

Além do ald-tester, validar manualmente:

```markdown
## Manual Validation Checklist

- [ ] Dev server rodando sem erros
- [ ] Navegação entre páginas funciona
- [ ] Forms submetem corretamente
- [ ] Loading states aparecem
- [ ] Error messages são claras
- [ ] Mobile responsive (testar no responsive mode)
- [ ] Sem console errors (browser DevTools)
- [ ] Network requests retornam 200/201/204 (Network tab)
```

---

## Anti-Patterns to Avoid

❌ **Marcar sprint completa sem validação**
❌ **Aceitar "quase funciona"** (bugs conhecidos deixados para depois)
❌ **Ignorar regressões** ("vou arrumar depois")
❌ **Pular testes manuais** (confiar só em unit tests)
❌ **Console com erros** ("é só warning")
❌ **DoD incompleto** (faltando critérios)

---

**Last Updated**: 2025-10-23
**Policy Count**: 2
