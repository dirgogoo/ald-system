# Impact Analysis Template

**Use this template** when modifying shared code (functions/components used in multiple places).

---

## File/Function Being Modified

**Path**: `path/to/file.ts`
**Function/Component**: `functionName` or `ComponentName`

---

## Step 1: Identify Usage

Search codebase to find where this code is used:

```bash
grep -r "functionName" app/
grep -r "ComponentName" app/
```

**Results**:
```
app/module1/file1.ts:15:  const result = functionName(data);
app/module2/file2.ts:42:  return functionName(input);
app/module3/file3.ts:78:  await functionName(payload);
components/feature/comp.tsx:12:  <ComponentName {...props} />
components/other/comp2.tsx:25:  <ComponentName variant="large" />
```

**Usage Count**: [N] locations

---

## Step 2: Analyze Current Signature

**Current**:
```typescript
// Function
export function functionName(param1: Type1): ReturnType {
  // implementation
}

// or Component
export function ComponentName({ prop1, prop2 }: Props) {
  // implementation
}
```

**Planned Change**:
```typescript
// What you plan to change
export function functionName(param1: Type1, newParam?: Type2): ReturnType {
  // new implementation
}
```

---

## Step 3: Breaking Change Analysis

Is this change **breaking**?

- [ ] **Signature changed** (added/removed/reordered params)
- [ ] **Return type changed** (different structure)
- [ ] **Behavior changed** (same input → different output)
- [ ] **Side effects added** (now mutates, makes API calls, etc)

**Verdict**: ✅ Non-breaking / ❌ Breaking change

---

## Step 4: Impact Assessment

For each usage location, analyze impact:

| File | Usage | Breaking? | Action Needed |
|------|-------|-----------|---------------|
| app/module1/file1.ts:15 | `functionName(data)` | ❌ No | None (backward compatible) |
| app/module2/file2.ts:42 | `functionName(input)` | ✅ Yes | Update to pass newParam |
| app/module3/file3.ts:78 | `functionName(payload)` | ✅ Yes | Update call site |

**Total Impacted Files**: [N]

---

## Step 5: Decision Matrix

Choose approach based on impact:

### Option A: Modify Existing (if non-breaking)

**Pros**:
- Single implementation
- No code duplication

**Cons**:
- Must ensure backward compatibility

**When to Use**:
- Change is non-breaking (optional param, extended behavior)
- All usages can work with new version

### Option B: Create New Version (v2, variant)

**Pros**:
- No risk of breaking existing code
- Clean separation of concerns

**Cons**:
- Code duplication
- Need to migrate old usages eventually

**When to Use**:
- Breaking change
- High risk of regression
- Multiple different use cases

**Example**:
```typescript
// Keep old function
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Add new function
export function calculateTotalWithDiscount(
  items: Item[],
  coupon: Coupon
): number {
  const total = calculateTotal(items); // Reuse old
  return applyDiscount(total, coupon); // Add new logic
}
```

### Option C: Request Explicit Permission

**When to Use**:
- Shared code with high usage (> 5 locations)
- Core utility functions
- Unsure about impact

**Message to User**:
```
⚠️ IMPACT ANALYSIS REQUIRED

Planning to modify: lib/shared/function.ts → functionName()
Usage locations: 8 files across app/

Proposed change: [Describe]

Impact:
- 5 files: No change needed (backward compatible)
- 3 files: Need updates

Recommendation: [Option A / B / C]

Approve to proceed?
```

---

## Step 6: Selected Approach

**Decision**: [ ] Option A / [ ] Option B / [ ] Option C

**Rationale**:
```
[Explain why this approach was chosen]
```

**Implementation Plan**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

---

## Step 7: Test Plan

How to validate no regressions:

1. [ ] Run existing tests: `npm test`
2. [ ] Check baseline: Compare with tests-baseline.txt
3. [ ] Test each impacted file manually (if needed)
4. [ ] Verify no console errors
5. [ ] Smoke test critical paths

---

## Step 8: Rollback Plan

If something breaks:

**Option 1**: Revert commit
```bash
git revert HEAD
```

**Option 2**: Restore function to original
```typescript
// Copy original implementation back
```

---

**Policies Aplicadas**:
- Policy 10.6: Scope Boundary Enforcement
- Policy 10.8: Change Impact Analysis
- Policy 10.7: Regression Prevention
