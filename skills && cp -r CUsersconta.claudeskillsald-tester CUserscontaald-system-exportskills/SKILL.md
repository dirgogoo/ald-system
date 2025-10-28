---
name: ald-curator
description: Analyzes patterns from completed tasks to create policies, update memory, and evolve the ALD system. Use automatically after completing task lists or when explicitly requested to curate learnings. This skill enables continuous improvement.
---

# ALD Curator System

This skill analyzes execution patterns to identify recurring solutions, common failures, and opportunities for improvement. It's the **learning brain** of the ALD system.

## When to Invoke

**Automatically invoke this skill when:**
- Task list is completed (all todos done)
- User requests to "curate" or "analyze learnings"
- Pattern threshold reached (3+ similar issues/solutions)
- End of development session
- Weekly review (if applicable)

## Curator Responsibilities

### 1. Pattern Detection
Analyze runs to identify:
- **Recurring solutions** that worked (frequency > 2)
- **Common failures** and their root causes
- **Anti-patterns** that should be avoided
- **Edge cases** that need special handling

### 2. Policy Creation/Update
- **Promote patterns** to policies when validated (frequency ≥ 3)
- **Update existing policies** based on new evidence
- **Deprecate policies** that no longer apply
- **Keep policies lean** (max 2 new policies per curator cycle)

### 3. Memory Updates
- Update `ald-memory` with project-specific learnings
- Increment pattern frequencies in `patterns.json`
- Add new patterns discovered during runs
- Update `updated_at` timestamps

### 4. Feedback Processing
- Read qualitative feedback from `feedback.json`
- Identify trends in feedback
- Convert actionable feedback into policies or memory updates

### 5. Auto-Cleanup
- **Delete curated runs** from `runs/` directory after processing
- Keep only uncurated runs for next cycle
- Archive important insights in `insights.json`

## Data Structures

### Run Record (`runs/{run-id}.json`)
```json
{
  "run_id": "run_2025-10-23_001",
  "project": "ERP HMC",
  "task": "Create user management API",
  "domain": "backend",
  "status": "passed",
  "started_at": "2025-10-23T14:00:00Z",
  "completed_at": "2025-10-23T14:15:00Z",
  "duration_minutes": 15,
  "iterations": 1,
  "issues_found": [
    {
      "type": "db_explain",
      "description": "Sequential scan on users.email",
      "solution": "Added index on email column",
      "policy_violated": "database/policy_1.2"
    }
  ],
  "tests_passed": true,
  "code_quality_score": 0.95,
  "curated": false
}
```

### Insights Record (`insights.json`)
```json
{
  "insights": [
    {
      "id": "insight_001",
      "date": "2025-10-23",
      "category": "database",
      "title": "Email columns frequently queried need indexes",
      "description": "Observed 5 instances where email column queries caused sequential scans",
      "action_taken": "Added to database policies: always index email columns",
      "impact": "Query performance improved by 10x on average",
      "frequency": 5
    }
  ],
  "updated_at": "2025-10-23"
}
```

### Feedback Record (`feedback.json`)
```json
{
  "feedback": [
    {
      "date": "2025-10-23",
      "note": "User registration endpoint initially missing input validation",
      "tags": ["security", "validation"],
      "action": "Added to security policies: always validate input on server"
    }
  ],
  "updated_at": "2025-10-23"
}
```

## Curation Process

### Step 1: Load Uncurated Runs
```typescript
const runs = await loadRuns('~/.claude/skills/ald-curator/runs/');
const uncurated = runs.filter(run => !run.curated);
```

### Step 2: Detect Patterns
```typescript
// Group issues by type and solution
const patterns = detectPatterns(uncurated);

// Example pattern
{
  "issue_type": "db_explain/sequential_scan",
  "common_solution": "Add index on FK column",
  "frequency": 4,
  "projects": ["ERP HMC", "Health Dashboard"]
}
```

### Step 3: Promote to Policies (if frequency ≥ 3)
```typescript
if (pattern.frequency >= 3 && !policyExists(pattern)) {
  await createPolicy({
    domain: pattern.domain,
    title: pattern.title,
    body: generatePolicyText(pattern)
  });
}
```

### Step 4: Update Memory
```typescript
// Update patterns.json
await updatePatterns(pattern);

// Update project memory if project-specific
if (pattern.projects.length === 1) {
  await updateProjectMemory(pattern.projects[0], pattern);
}
```

### Step 5: Generate Insights
```typescript
const insight = {
  id: generateId(),
  date: new Date(),
  category: pattern.domain,
  title: summarizePattern(pattern),
  description: describePattern(pattern),
  action_taken: describeAction(pattern),
  frequency: pattern.frequency
};

await saveInsight(insight);
```

### Step 6: Cleanup
```typescript
// Mark runs as curated
for (const run of processedRuns) {
  run.curated = true;
  await saveRun(run);
}

// Delete curated runs older than 7 days
const oldRuns = runs.filter(r =>
  r.curated && daysSince(r.completed_at) > 7
);
await deleteRuns(oldRuns);
```

## Curation Rules

### Policy Promotion Criteria
- **Frequency**: Pattern observed ≥ 3 times
- **Validity**: Pattern actually solved the problem
- **Generality**: Applies to multiple scenarios (not one-off)
- **Non-conflict**: Doesn't contradict existing policies

### Policy Update Criteria
- **Evidence**: New data contradicts existing policy
- **Evolution**: Better solution discovered
- **Deprecation**: Policy no longer relevant

### Maximum New Policies Per Cycle
- **Limit**: 2 new policies maximum
- **Rationale**: Keep policies lean and focused
- **Priority**: Most frequent and impactful patterns first

## Integration with Other Skills

- **ald-memory**: Updates patterns and project memory
- **ald-policies**: Creates/updates policy files
- **ald-tester**: Learns from test failures
- **ald-orchestrator**: Triggered by orchestrator after task completion

## Curator Output

After curation, provide summary:
```
📊 Curator Report
─────────────────
Runs Analyzed: 5
Patterns Detected: 3
New Policies: 1
  • Database Policy 1.9: Index email columns for lookup queries
Memory Updates: 2
  • ERP HMC: Added gotcha about email indexing
  • Patterns: Incremented "email_index" frequency to 5
Runs Cleaned: 3 (older than 7 days)

Next Steps: Policies updated, memory fresh, ready for next cycle.
```

## Best Practices

1. **Run curator after every task list completion** (not just periodically)
2. **Be conservative with policy creation** (quality over quantity)
3. **Always cleanup old runs** to keep context lean
4. **Document why** patterns were promoted to policies
5. **Track frequency** to validate pattern importance
6. **Update timestamps** on all modified files

## Sprint-Based Learning ⭐

Curator now processes completed sprints to detect patterns:

**Analyzes**:
- Scope violations frequency
- Regression occurrences
- Common sprint patterns (≥3 sprints)

**Promotes**: Validated sprint patterns → policies

Example: "CRUD sprints always involve schema + API + UI + tests" (3 occurrences) → Create Policy
