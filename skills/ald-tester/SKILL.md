---
name: ald-tester
description: Validates implementations from end-user perspective, not just technical tests. Use after completing any feature to verify UI works, console is clean, network requests succeed, and user experience is smooth. Tests like a real user would.
---

# ALD Tester System

This skill validates implementations **as a real user would** - not just running unit tests, but actually interacting with the UI, checking console errors, network requests, and overall user experience.

## When to Invoke

**Automatically invoke this skill when:**
- Feature implementation is complete
- UI components are added/modified
- API endpoints are created/updated
- Database migrations applied
- Before marking any task as "done"
- After applying INSTRUCTOR fixes

## Testing Philosophy

**We test like end users, not just developers.**

Traditional testing checks if code works technically. ALD testing checks if:
- ✅ UI actually renders correctly
- ✅ Console has zero errors
- ✅ Network requests succeed with correct data
- ✅ User flows work end-to-end
- ✅ Performance is acceptable
- ✅ Edge cases are handled gracefully

## Validation Layers

### Layer 1: Technical Tests
```typescript
{
  "run_tests": {
    "command": "npm test",
    "passed": true,
    "coverage": 0.85,
    "failures": []
  },
  "lint_types": {
    "command": "npm run type-check",
    "passed": true,
    "errors": []
  },
  "db_explain": {
    "queries_checked": 3,
    "passed": true,
    "sequential_scans": 0
  }
}
```

### Layer 2: User Experience Validation (Critical!)
```typescript
{
  "ux_validation": {
    "flow": "User logs in → navigates to orders → creates new order",
    "console_errors": 0,
    "console_warnings": 2, // Note: warnings are OK if non-critical
    "network_ok": true,
    "network_failures": [],
    "ui_rendered": true,
    "interactions_tested": [
      "Click login button",
      "Fill email/password",
      "Submit form",
      "Navigate to /orders",
      "Click 'New Order'",
      "Fill order details",
      "Submit order"
    ],
    "observed_result": "Order created successfully with ID 123",
    "expected_result": "Order created successfully",
    "match": true
  }
}
```

### Layer 3: Performance & Accessibility
```typescript
{
  "performance": {
    "page_load_ms": 1200,
    "largest_contentful_paint_ms": 800,
    "first_input_delay_ms": 50,
    "acceptable": true
  },
  "accessibility": {
    "keyboard_navigable": true,
    "aria_labels_present": true,
    "contrast_ratio": "AA", // WCAG AA standard
    "screen_reader_friendly": true
  }
}
```

## Testing Tools

### Using Chrome DevTools MCP (when available)
```typescript
// Console validation
const consoleMessages = await mcp__chrome_devtools__list_console_messages();
const errors = consoleMessages.filter(msg => msg.level === 'error');

if (errors.length > 0) {
  return {
    passed: false,
    console_errors: errors.length,
    details: errors
  };
}

// Network validation
const networkRequests = await mcp__chrome_devtools__list_network_requests();
const failed = networkRequests.filter(req => req.status >= 400);

if (failed.length > 0) {
  return {
    passed: false,
    network_failures: failed
  };
}

// Take screenshot for evidence
const screenshot = await mcp__chrome_devtools__take_screenshot({
  path: `~/.claude/skills/ald-tester/evidence/${taskId}.png`
});

// Performance trace
await mcp__chrome_devtools__performance_start_trace();
// ... user interactions ...
const trace = await mcp__chrome_devtools__performance_stop_trace();
```

### Manual Testing Checklist (when MCP not available)
```typescript
{
  "manual_checklist": {
    "ui_rendered": "Verified visually - component appears on page",
    "console_clean": "Checked browser console - no errors",
    "network_ok": "Checked network tab - all requests 200 OK",
    "interactions": "Tested: click, form submit, navigation",
    "responsive": "Tested on mobile (375px) and desktop (1920px)",
    "error_handling": "Tested invalid inputs - error messages shown"
  }
}
```

## Validation Checklist Structure

### Standard Web App Checklist (`checklists.json`)
```json
{
  "web_app_checklist": {
    "technical": [
      "Unit tests pass (npm test)",
      "Type checking passes (tsc --noEmit)",
      "Linting passes (npm run lint)",
      "Build succeeds (npm run build)"
    ],
    "functionality": [
      "Feature works as specified",
      "Edge cases handled (null, empty, invalid input)",
      "Error messages clear and helpful",
      "Loading states shown during async operations"
    ],
    "ui_ux": [
      "UI renders correctly on mobile (375px)",
      "UI renders correctly on tablet (768px)",
      "UI renders correctly on desktop (1920px)",
      "Keyboard navigation works",
      "Focus states visible",
      "Animations smooth (60fps)"
    ],
    "browser": [
      "Console has zero errors",
      "Console warnings reviewed (acceptable or fixed)",
      "Network requests succeed (200/201 status)",
      "No 404s for assets",
      "No CORS errors"
    ],
    "performance": [
      "Page load < 3s",
      "Largest Contentful Paint < 2.5s",
      "First Input Delay < 100ms",
      "No layout shifts (CLS < 0.1)"
    ],
    "accessibility": [
      "All buttons/links keyboard accessible",
      "Form inputs have labels",
      "Images have alt text",
      "Color contrast meets WCAG AA",
      "Screen reader announces correctly"
    ]
  }
}
```

### Database Checklist
```json
{
  "database_checklist": {
    "schema": [
      "Migration up() runs successfully",
      "Migration down() runs successfully (rollback test)",
      "All tables have explicit PKs",
      "All FKs have indexes"
    ],
    "performance": [
      "EXPLAIN ANALYZE on all new queries",
      "No sequential scans on large tables",
      "Index usage verified"
    ],
    "data_integrity": [
      "Constraints enforced (NOT NULL, UNIQUE, CHECK)",
      "Foreign keys validate",
      "RLS policies enabled (if multi-tenant)"
    ]
  }
}
```

### API Endpoint Checklist
```json
{
  "api_checklist": {
    "functionality": [
      "Returns correct status codes (200, 201, 400, 404, 500)",
      "Response matches OpenAPI/schema",
      "Handles pagination (if applicable)",
      "Handles filtering/sorting (if applicable)"
    ],
    "security": [
      "Authentication required",
      "Authorization checked (role/permission)",
      "Input validated on server",
      "Rate limiting applied"
    ],
    "performance": [
      "Response time < 200ms for simple queries",
      "Response time < 1s for complex queries",
      "N+1 queries avoided"
    ]
  }
}
```

## Test Result Format

```json
{
  "run_id": "run_2025-10-23_001",
  "task": "User registration endpoint",
  "checks": {
    "technical": {
      "run_tests": { "passed": true, "score": 1.0 },
      "lint_types": { "passed": true, "score": 1.0 },
      "build": { "passed": true, "score": 1.0 }
    },
    "ux": {
      "console_errors": { "passed": true, "score": 1.0, "errors": 0 },
      "network": { "passed": true, "score": 1.0, "failures": 0 },
      "user_flow": {
        "passed": true,
        "score": 1.0,
        "flow": "Navigate to /register → fill form → submit",
        "result": "User registered successfully, redirected to /dashboard"
      }
    },
    "performance": {
      "page_load": { "passed": true, "score": 0.95, "value_ms": 1100 }
    }
  },
  "overall_passed": true,
  "overall_score": 0.98,
  "evidence": [
    "screenshot: evidence/run_2025-10-23_001_success.png",
    "console_log: evidence/run_2025-10-23_001_console.txt"
  ]
}
```

## Failure Handling

When tests fail:
1. **Document failure** in test result
2. **Capture evidence** (screenshot, console log, network trace)
3. **Send to INSTRUCTOR** with detailed failure info
4. **Wait for fix** from EXECUTOR
5. **Re-run validation** after fix applied
6. **Loop until all checks pass** (no compromise!)

## Integration with Other Skills

- **ald-orchestrator**: Called by orchestrator after EXECUTOR completes
- **ald-curator**: Failures are analyzed by curator for pattern detection
- **ald-policies**: Validates against policy compliance
- **ald-memory**: Uses project context to determine relevant tests

## Best Practices

1. **Test as a user, not as a developer**
2. **Zero console errors is the standard** (warnings OK if justified)
3. **Take screenshots of critical flows** (evidence helps debugging)
4. **Don't skip UX validation** (technical tests aren't enough)
5. **Loop until perfect** (don't accept "good enough")
6. **Document edge cases tested** (helps curator learn patterns)

## Regression Testing ⭐

### Sprint-Based Regression Validation

When working within a sprint, tester **MUST** ensure old tests continue passing. This prevents breaking existing functionality while implementing new features.

### Baseline Capture

**Before sprint starts** (during `sprint:plan` phase):

```bash
# Run all tests and capture baseline
npm test --all > baseline.txt

# Parse results
{
  "baseline": {
    "tests_passed": 45,
    "tests_failed": 0,
    "tests_total": 45,
    "captured_at": "2025-10-23T14:00:00Z"
  }
}
```

**Store in**: `~/.claude/skills/ald-sprint/active/current-sprint.json` under `regression_baseline` field.

### Comparison After Implementation

**After sprint implementation** (during `sprint:review` phase):

```bash
# Run tests again
npm test --all > current.txt

# Parse results
{
  "current": {
    "tests_passed": 47,  // 45 old + 2 new
    "tests_failed": 0,
    "tests_total": 47
  }
}
```

### Regression Detection Logic

```typescript
// Compare baseline vs current
function detectRegression(baseline, current) {
  const oldTestsNowFailing = baseline.tests_passed - current.tests_passed;

  if (oldTestsNowFailing > 0) {
    return {
      regression_detected: true,
      old_tests_broken: oldTestsNowFailing,
      verdict: "❌ REGRESSION DETECTED"
    };
  }

  if (current.tests_passed >= baseline.tests_passed) {
    return {
      regression_detected: false,
      new_tests_added: current.tests_passed - baseline.tests_passed,
      verdict: "✅ NO REGRESSIONS"
    };
  }
}
```

### Verdict Format

**✅ NO REGRESSIONS** (success):
```
🔍 Regression Check

Baseline: 45 tests passed
Current:  47 tests passed (+2 new tests)

✅ NO REGRESSIONS DETECTED
   All old tests continue passing.
   2 new tests added.

Sprint can proceed to review phase.
```

**❌ REGRESSION DETECTED** (failure):
```
🔍 Regression Check

Baseline: 45 tests passed
Current:  42 tests passed

❌ REGRESSION DETECTED
   3 old tests are now failing!

Failed tests:
- users.test.ts: "should create user with email"
- auth.test.ts: "should validate token"
- orders.test.ts: "should list user orders"

⚠️ Sprint CANNOT complete until regressions are fixed.
This violates Policy 10.7: Regression Prevention.

Next step: INSTRUCTOR → diagnose cause → fix → re-test
```

### Integration with Sprint Workflow

**Phase: EXECUTE**
- Implement feature
- Run tests continuously (optional)

**Phase: REVIEW (BEFORE marking sprint as done)**
1. Capture current test results
2. Compare with baseline from `current-sprint.json`
3. Run `detectRegression()` logic
4. If ❌ REGRESSION: BLOCK sprint completion → INSTRUCTOR loop
5. If ✅ NO REGRESSIONS: Proceed to review checklist

### Regression Prevention Rules

**RULE 1**: Sprint **CANNOT** complete with regressions
- No exceptions
- Loop until fixed
- Document failure in run record

**RULE 2**: Shared code modifications require extra care
- Run regression check immediately after modifying shared code
- Don't wait until end of sprint
- Catch issues early

**RULE 3**: Baseline must be clean
- If baseline has failing tests, fix them FIRST
- Don't start sprint with broken tests
- Clean slate = reliable regression detection

### Regression Analysis Workflow

When regression detected:

```typescript
// 1. Identify which tests failed
const failedTests = current.tests.filter(t =>
  t.status === 'failed' &&
  baseline.tests.find(b => b.name === t.name).status === 'passed'
);

// 2. Identify which files were modified in sprint
const modifiedFiles = sprint.tasks
  .flatMap(task => task.files_modified);

// 3. Cross-reference: which modified files likely broke tests?
const suspects = modifiedFiles.filter(file =>
  failedTests.some(test => test.imports.includes(file))
);

// 4. Send to INSTRUCTOR with context
const instructorContext = {
  regression: true,
  failed_tests: failedTests,
  suspect_files: suspects,
  instruction: "Fix regressions without breaking new feature"
};
```

### Storage Format

**In `current-sprint.json`**:
```json
{
  "sprint_id": "sprint-008-checkout",
  "regression_baseline": {
    "tests_passed": 45,
    "tests_failed": 0,
    "tests_total": 45,
    "captured_at": "2025-10-23T14:00:00Z",
    "test_files": [
      "users.test.ts",
      "auth.test.ts",
      "orders.test.ts"
    ]
  },
  "regression_check": {
    "tests_passed": 47,
    "tests_failed": 0,
    "tests_total": 47,
    "checked_at": "2025-10-23T14:30:00Z",
    "verdict": "✅ NO REGRESSIONS",
    "new_tests_added": 2
  }
}
```

### Integration with ald-orchestrator

Orchestrator now includes regression check in workflow:

```
3. TESTER (after EXECUTOR)
   ├─ Run feature tests
   ├─ Run UX validation
   └─ ⭐ Run regression check (if sprint active)
          ├─ Compare baseline vs current
          ├─ If regression: BLOCK → INSTRUCTOR
          └─ If clean: PROCEED
```

### Integration with ald-curator

Curator analyzes regression patterns:

```typescript
// After multiple sprints
const regressionPatterns = sprintHistory.filter(s =>
  s.regression_check.verdict.includes('REGRESSION')
);

// If pattern emerges (≥3 occurrences)
if (regressionPatterns.length >= 3) {
  // Example: "Modifying lib/utils.ts always breaks tests"
  createPolicy({
    domain: "sprint",
    title: "utils.ts requires comprehensive test run",
    body: "When modifying lib/utils.ts, run full test suite immediately (shared code with high impact)"
  });
}
