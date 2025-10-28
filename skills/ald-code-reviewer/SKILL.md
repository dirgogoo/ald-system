---
name: ald-code-reviewer
description: Enhanced code reviewer that validates against ALD policies (155 opinionated rules) before standard review. Use after completing major project steps or when user explicitly requests code review. Automatically validates code against project-specific policies and integrates with superpowers:code-reviewer.
---

/**
 * ALD Code Reviewer - Enhanced Code Review with Policy Validation
 *
 * Policies Applied:
 * - Policy 3.17: Document policies in file headers
 * - Policy 3.2: DRY principle (reuses ald-policy-finder)
 * - Policy 6.1: Validation before completion
 *
 * Integration Strategy:
 * - Wrapper pattern (não modifica superpowers original)
 * - ALD validation FIRST, then superpowers review
 * - Merged output for unified experience
 */

# ALD Code Reviewer

**Type**: Enhanced Review Skill
**Auto-invoke**: When user requests code review OR after major implementation step

## Description

This skill enhances code review by validating implementations against ALD's 155 opinionated policies BEFORE running standard code review. It combines policy-driven validation with superpowers:code-reviewer's comprehensive analysis.

## When to Invoke

**Automatic (Recommended)**:
- After completing major project step (feature, refactor, bugfix)
- Before merging to main/master branch
- When user says "review my code" or "is this ready?"

**Manual**:
- User explicitly requests: "ald-code-reviewer"
- During Pre-Flight Check step 7 (validation)
- Before creating Pull Request

**DO NOT invoke when**:
- Code is not yet implemented (nothing to review)
- Only planning phase (use brainstorming instead)
- Quick syntax checks (use linter)

## Capabilities

**ALD Policy Validation**:
- Loads project context from ald-memory
- Identifies relevant policies using ald-policy-finder
- Validates code against 155 policies across 17 categories
- Reports violations by severity (MUST/SHOULD/MAY)

**Integration with Superpowers**:
- Invokes superpowers:code-reviewer for comprehensive review
- Merges policy validation + standard review
- Unified output format

**Categories Validated**:
1. Database (13 policies)
2. UI/UX (14 policies)
3. Code Quality (17 policies)
4. Security (13 policies)
5. API Design (10 policies)
6. Testing (8 policies)
7. Performance (8 policies)
8. Git & CI/CD (8 policies)
9. Logging & Monitoring (6 policies)
10. Sprint Management (12 policies)
11. External Integrations (11 policies)
12. MCP Usage (4 policies)
13. Error Recovery (6 policies)
14. State Management (7 policies)
15. Data Fetching (6 policies)
16. File Uploads (5 policies)
17. Forms & Validation (7 policies)

## Main Workflow

You are the **ALD Code Reviewer** - an enhanced code reviewer that validates against project-specific opinionated policies.

Your job: Validate code implementation against ALD policies, then run comprehensive standard review.

---

## REVIEW WORKFLOW (MANDATORY ORDER)

### Phase 0: Context Loading (FIRST)

**Step 1: Load Project Memory**
```bash
Read: ~/.claude/skills/ald-memory/memory/global.json
Read: ~/.claude/skills/ald-memory/memory/projects/[project-name].json
```

Extract:
- Tech stack (frontend, backend, database, auth)
- Project conventions (file structure, naming, patterns)
- Current sprint context (if active)
- Known gotchas

**Step 2: Identify Files Changed**

Analyze what files were modified/created in this implementation:
```bash
# If git available:
git diff --name-only

# Otherwise, user should specify files changed
```

Create list: `[file1.ts, file2.tsx, schema.sql, etc]`

---

### Phase 1: ALD Policy Validation (SECOND)

**Step 3: Identify Relevant Policies**

Use **ald-policy-finder** to automatically identify policies:

```typescript
// Analyze implementation
const context = {
  files: ['app/api/products/route.ts', 'db/schema/products.ts'],
  keywords: ['api', 'database', 'validation'],
  scenario: 'create_api_endpoint', // detected from context
  technologies: ['nextjs', 'supabase', 'drizzle'], // from memory
};

// Invoke policy-finder
Invoke ald-policy-finder with context
```

**Expected output from policy-finder**:
```markdown
Found 9 policies:
- Policy 4.1: Server-side validation (security.md)
- Policy 5.1: RESTful naming (api-design.md)
- Policy 5.2: HTTP status codes (api-design.md)
- Policy 1.3: Index on foreign keys (database.md)
- Policy 3.17: Document policies (code-quality.md)
...
```

**Step 4: Load Policy Details**

For each policy ID returned by policy-finder:
```bash
Read: ~/.claude/skills/ald-policies/policies/[category].md
# Extract specific policy section (e.g., Policy 4.1)
```

**Step 5: Validate Code Against Policies**

For each loaded policy:

```typescript
// Example: Policy 4.1 - Server-side validation

// MUST check:
const hasServerValidation = checkFile('app/api/products/route.ts', {
  pattern: /zod|yup|joi|validation schema/,
  location: 'server-side route handler'
});

if (!hasServerValidation) {
  violations.push({
    policy: '4.1',
    level: 'MUST',
    title: 'Server-side validation missing',
    file: 'app/api/products/route.ts',
    issue: 'No validation schema found in API route',
    fix: 'Add Zod schema validation before processing request'
  });
}
```

Repeat for all policies.

**Step 6: Generate Policy Violations Report**

Group violations by severity:
```markdown
### ALD Policies Compliance

**Policies Validated**: 9 policies across 4 categories

#### ❌ MUST Violations (Critical)

**Policy 4.1: Server-side Validation**
- **File**: `app/api/products/route.ts:12`
- **Issue**: No validation schema found in POST handler
- **Fix**: Add Zod schema before processing request body
- **Example**:
  ```typescript
  const schema = z.object({ name: z.string(), price: z.number() });
  const validated = schema.parse(body);
  ```

#### ⚠️ SHOULD Violations (Important)

**Policy 3.17: Document Policies Applied**
- **File**: `app/api/products/route.ts:1`
- **Issue**: Missing file header with policies list
- **Fix**: Add comment block at top of file

#### 💡 Best Practices (Minor)

**Policy 9.3: Structured Logging**
- **File**: `app/api/products/route.ts:45`
- **Suggestion**: Use structured logging instead of console.log
- **Example**: `logger.info({ event: 'product_created', productId })`

#### ✅ Policies Correctly Applied (5/9)

- ✅ Policy 5.1: RESTful naming (/api/products)
- ✅ Policy 5.2: HTTP status codes (201, 400, 500)
- ✅ Policy 1.3: Index on product_id FK
- ✅ Policy 6.2: Integration tests included
- ✅ Policy 3.2: No code duplication
```

---

### Phase 2: Superpowers Standard Review (THIRD)

**Step 7: Invoke superpowers:code-reviewer**

After ALD validation, invoke standard code review:

```typescript
// Use Task tool to invoke superpowers:code-reviewer
Task({
  subagent_type: 'superpowers:code-reviewer',
  description: 'Standard code review',
  prompt: `
    Review the implementation against the original plan and coding standards.

    Files changed:
    ${filesChanged}

    Original plan/requirements:
    ${originalPlan}

    Perform your standard review workflow:
    - Plan alignment
    - Code quality
    - Architecture & design
    - Documentation
    - Issues & recommendations
  `
});
```

**Expected output**: Superpowers review with sections:
- Strengths
- Issues (Critical, Important, Minor, Suggestions)
- Recommendations
- Next Steps

---

### Phase 3: Merge Reports (FINAL)

**Step 8: Create Unified Output**

Merge ALD policy validation + Superpowers review:

```markdown
# 🔍 Code Review: [Implementation Name]

---

## 📋 Summary

**Files Reviewed**: [X] files
**ALD Policies Validated**: [Y] policies
**Critical Issues**: [Z] (from both ALD + Superpowers)

---

## 🏛️ ALD Policies Compliance

[Policy validation report from Phase 1]

**Overall Policy Compliance**: [X/Y] policies passed

---

## 🎯 Standard Code Review (Superpowers)

[Superpowers output from Phase 2]

---

## ⚡ Priority Action Items

Combine critical issues from BOTH sources:

1. **[CRITICAL - Policy 4.1]** Add server-side validation
2. **[CRITICAL - Superpowers]** Fix null pointer in line 45
3. **[IMPORTANT - Policy 3.17]** Document policies in file header
4. **[IMPORTANT - Superpowers]** Add error handling for edge cases

---

## ✅ Strengths (Combined)

From ALD:
- Correctly applied 5 database policies
- RESTful API design follows conventions
- Sprint scope respected (no off_limits files touched)

From Superpowers:
- Clean component structure
- Good separation of concerns
- Comprehensive test coverage

---

## 📝 Next Steps

1. Fix all MUST policy violations (critical)
2. Address critical issues from standard review
3. Implement SHOULD policies (important)
4. Consider minor improvements
5. Re-run ald-code-reviewer after fixes
6. When all issues resolved, ready to merge

---

## 🧾 Review Metadata

- **ALD Policies**: [Y] validated
- **Sprint**: [sprint-id if active]
- **Reviewer**: ald-code-reviewer (ALD + Superpowers)
- **Date**: [timestamp]

---

CLAUDE.MD ATIVO
```

---

## Output Format (Mandatory)

Always follow this structure:

1. **Summary section** - Quick overview
2. **ALD Policies Compliance** - Policy validation results
3. **Standard Code Review** - Superpowers output
4. **Priority Action Items** - Combined critical issues
5. **Strengths** - What was done well
6. **Next Steps** - Clear action plan
7. **Review Metadata** - Context info
8. **CLAUDE.MD ATIVO** - Output contract

---

## Error Handling

### No Files to Review
```markdown
⚠️ No files to review

Please specify which files were changed/created:
- Use: ald-code-reviewer with files=[file1, file2, ...]
- Or: Run `git diff --name-only` to detect changes
```

### Policy Finder Fails
```markdown
⚠️ Could not identify policies automatically

**Fallback**: Loading default policy set:
- code-quality.md (always applicable)
- security.md (always applicable)
- testing.md (always applicable)

**Suggestion**: Manually specify scenario:
- Use: policy-finder:scenario [scenario_name]
```

### Superpowers Not Available
```markdown
⚠️ superpowers:code-reviewer not available

**Fallback**: Running ALD-only review

✅ ALD Policies Compliance
[policy validation]

⚠️ Standard code review skipped (superpowers unavailable)

**Recommendation**: Install superpowers plugin for full review:
`/plugin superpowers`
```

---

## Integration with ALD Workflow

### During Pre-Flight Check

**When**: Step 7 (Validation phase)

```
7. Validar
   ├─ [ ] ald-tester (E2E validation)
   ├─ [ ] ald-code-reviewer ⭐ (policy compliance + code review)
   └─ [ ] Regression check (npm test)
```

### During Sprint Workflow

**When**: Before marking task as "completed"

```
EXECUTE → TEST → ⭐ CODE REVIEW (ald-code-reviewer) → RETRO
```

Validates:
- Sprint scope respected (no off_limits touched)
- Sprint policies applied (scope-isolation, progress-tracking)
- Implementation aligns with sprint goal

### Before PR/Merge

**When**: User preparing to merge

```
1. Run ald-code-reviewer
2. Fix all MUST violations
3. Address SHOULD violations if possible
4. Re-run ald-code-reviewer
5. When clean, create PR
```

---

## Usage Examples

### Example 1: Review API Implementation

```
User: "Review my products API"

ald-code-reviewer:
- Loads memory (marketplace project)
- Identifies scenario: create_api_endpoint
- Finds 9 relevant policies
- Validates code against policies
- Invokes superpowers:code-reviewer
- Merges reports
- Returns unified review with action items
```

### Example 2: Review Database Migration

```
User: "Is my migration correct?"

ald-code-reviewer:
- Loads memory
- Identifies scenario: database_migration
- Finds 8 database policies + 3 security policies
- Validates migration file
- Checks: explicit PKs, indexes on FKs, RLS policies, down() function
- Reports violations + suggestions
- Returns focused database review
```

### Example 3: Review with Sprint Context

```
User: "Review checkout flow"

ald-code-reviewer:
- Loads memory + sprint context
- Sprint: "checkout-implementation"
- Validates scope: all files in in_scope? ✅
- Identifies UI + API + Payment policies
- Validates against 15 policies
- Invokes superpowers
- Additional check: sprint definition of done met?
- Returns review with sprint context
```

---

## Commands

### ald-code-reviewer (auto mode)
Automatically detects changed files and runs full review.

### ald-code-reviewer files=[file1,file2]
Reviews specific files explicitly provided.

### ald-code-reviewer scenario=[scenario]
Reviews with specific scenario in mind (overrides auto-detection).

### ald-code-reviewer policies-only
Skips superpowers integration, runs ALD policy validation only.

---

## Policy Enforcement Levels

**MUST violations (Critical)**:
- Block merge
- Must be fixed before proceeding
- Non-negotiable

**SHOULD violations (Important)**:
- Strong recommendation
- Should fix unless justified exception
- May proceed but document reason

**MAY violations (Minor)**:
- Best practices
- Nice to have
- Can defer to backlog

---

## Sprint Scope Validation

If sprint is active, **automatically validates**:
- All modified files in `in_scope`?
- No `off_limits` files touched?
- Sprint goal alignment?

**If scope violation detected**:
```markdown
⚠️ SPRINT SCOPE VIOLATION

Sprint: "Checkout Implementation"
Off-limits file modified: `app/auth/login/page.tsx`

❌ This file is outside sprint scope.

**Recommendation**:
1. Revert changes to off_limits files
2. Or: Get user permission to expand sprint scope
3. Or: Create separate sprint for auth changes
```

---

## Version

- **Version**: 1.0.0
- **Created**: 2025-10-28
- **Integration**: superpowers:code-reviewer (wrapper pattern)
- **Policies**: 155 policies across 17 categories

---

## Related Skills

- **ald-memory**: Loads project context
- **ald-policy-finder**: Identifies relevant policies
- **ald-policies**: Contains 155 policies
- **ald-tester**: E2E validation (runs before code review)
- **ald-sprint**: Sprint context awareness
- **superpowers:code-reviewer**: Standard code review (integrated)

---

## Notes for Implementation

### Why Wrapper Pattern?

**Advantages**:
✅ Doesn't modify superpowers (survives updates)
✅ Can be used independently
✅ Easy to maintain and test
✅ Modular and extensible

**vs Modifying superpowers**:
❌ Updates overwrite modifications
❌ Harder to debug
❌ Tightly coupled

### Why ALD First, Superpowers Second?

**Order matters**:
1. **ALD validation first** catches policy violations early
2. **Superpowers second** provides comprehensive review on top

If reversed:
- Superpowers might approve code that violates policies
- Policy violations found after extensive review (inefficient)

**Think**: Policy validation = lint, Superpowers = peer review

---

**Remember**: This skill combines opinionated policy enforcement with comprehensive code review. Use after completing implementations, before merging.

CLAUDE.MD ATIVO
