# Sprint Retrospective Template

## Sprint: [Sprint ID - Goal]

**Completed At**: [Timestamp]

---

## What Went Well ✅

List successes and positive aspects:

1. [Example: "Stripe integration foi mais rápida que esperado"]
2. [Example: "Nenhuma regressão detectada"]
3. [Example: "Scope bem definido, sem desvios"]

---

## What Could Be Improved 🔧

Areas for improvement:

1. [Example: "Precisei expandir scope para incluir email notifications"]
2. [Example: "Impact analysis de shared code poderia ser mais rigorosa"]
3. [Example: "Faltou considerar edge case X no planejamento"]

---

## Blockers Encountered 🚧

List blockers and how they were resolved:

| Blocker | Impact | Resolution | Time to Resolve |
|---------|--------|------------|-----------------|
| [Example: "Missing Stripe API key"] | High | Got key from PM | Quick |
| [Example: "Dependency on feature X"] | Medium | Implemented workaround | Moderate |

---

## Scope Changes 📝

If scope changed, analyze why:

| What Changed | Why | Could It Be Avoided? |
|--------------|-----|----------------------|
| Added email.ts | Checkout needs confirmations | No, legitimate requirement |
| Expanded to include cart | Related feature | Maybe, could be separate sprint |

---

## Patterns Detected 🔍

Identify recurring patterns for curator:

**Pattern 1**: [Name]
- **Description**: [What pattern was observed]
- **Frequency**: [How many times in this/previous sprints]
- **Recommendation**: [Should this become a policy?]

**Example**:
- **Pattern**: "CRUD sprints sempre envolvem: schema + API + UI + tests"
- **Frequency**: Observed in 3 sprints (products, orders, categories)
- **Recommendation**: Create policy "CRUD Sprint Template"

---

## Learnings Captured 📚

Key learnings for future sprints:

1. **Technical**:
   - [Example: "Stripe Checkout is simpler than Payment Intents for MVP"]
   - [Example: "Always check shared code usage with grep before modifying"]

2. **Process**:
   - [Example: "Scope isolation policies prevented 2 potential regressions"]
   - [Example: "Impact analysis template is very useful"]

3. **Tooling**:
   - [Example: "Regression baseline saved us from breaking auth flow"]

---

## Metrics 📊

### Tasks
- **Total**: [N]
- **Completed**: [N]
- **Added During Sprint**: [N]
- **Removed**: [N]

### Code
- **Files Modified**: [N]
- **New Tests Added**: [N]
- **Lines Changed**: [+X -Y] (optional)

### Quality
- **Regression Check**: ✅ Pass / ❌ Fail
- **Build Status**: ✅ Pass / ❌ Fail
- **All Tests**: [N] passed, [N] failed
- **Baseline Comparison**: [N] antigos + [N] novos = [N] total

---

## Actions for Next Sprint 🎯

Based on retrospective, what to improve:

1. [ ] [Action item 1]
2. [ ] [Action item 2]
3. [ ] [Consider promoting pattern X to policy]

---

## Curator Integration 🤖

**For ald-curator to process**:

```json
{
  "sprint_id": "sprint-XXX",
  "goal": "[Goal]",
  "completed_at": "[Timestamp]",
  "patterns_detected": [
    {
      "name": "Pattern 1",
      "frequency": 3,
      "recommendation": "Promote to policy"
    }
  ],
  "scope_violations": 0,
  "regressions_detected": 0,
  "learnings": [
    "Learning 1",
    "Learning 2"
  ]
}
```

---

**Policies Aplicadas**:
- Policy 10.11: Learning Capture
- Policy 10.12: Continuous Improvement
