---
name: ald-orchestrator
description: Coordinates the complete ALD workflow cycle. Use when starting a new task or task list to manage the ANALYZER→EXECUTOR→TESTER→INSTRUCTOR→CURATOR flow. Ensures all tasks complete successfully with proper validation and learning.
---

# ALD Orchestrator System

This skill is the **conductor** of the ALD system. It coordinates all other skills to ensure tasks are completed properly, validated thoroughly, and learnings are captured.

## When to Invoke

**Automatically invoke this skill when:**
- User requests a new development task
- Starting a task list
- Managing complex multi-step workflows
- Need to coordinate multiple skills
- Ensuring proper execution flow

**Do NOT invoke when:**
- Answering simple questions
- Reading/exploring code
- User just wants explanation (no implementation)

## Orchestration Cycle

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR START                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  1. ANALYZER (Task Decomposition)     │
        │     - Load memory (ald-memory)        │
        │     - Break down task                 │
        │     - Create task_spec                │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2. EXECUTOR (Implementation)         │
        │     - Load policies (ald-policies)    │
        │     - Implement based on task_spec    │
        │     - Follow policies strictly        │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  3. TESTER (Validation)              │
        │     - Technical tests                 │
        │     - UX validation                   │
        │     - Generate checks report          │
        └───────────────────────────────────────┘
                            ↓
                    ┌──────────┐
                    │ Passed?  │
                    └──────────┘
                    ↙         ↘
                 YES           NO
                  ↓             ↓
        ┌─────────────┐  ┌─────────────────────┐
        │  DONE ✓     │  │  4. INSTRUCTOR      │
        └─────────────┘  │     - Diagnose      │
                         │     - Create patch  │
                         └─────────────────────┘
                                   ↓
                         ┌─────────────────────┐
                         │  Back to EXECUTOR   │
                         │  (Apply patch)      │
                         └─────────────────────┘
                                   ↓
                         ┌─────────────────────┐
                         │  Back to TESTER     │
                         │  (Re-validate)      │
                         └─────────────────────┘
                                   ↓
                         (Loop until passed)

                         When ALL tasks done:
                                   ↓
        ┌───────────────────────────────────────┐
        │  5. CURATOR (Learning)                │
        │     - Analyze runs                    │
        │     - Create/update policies          │
        │     - Update memory                   │
        │     - Cleanup old runs                │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │         ORCHESTRATOR END               │
        └───────────────────────────────────────┘
```

## Workflow State Management

### State File (`workflow-state.json`)
```json
{
  "current_phase": "executor",
  "task_list": [
    {
      "id": "task_001",
      "title": "Create user API",
      "status": "in_progress",
      "phase": "executor",
      "iterations": 1,
      "max_iterations": 5
    },
    {
      "id": "task_002",
      "title": "Add user UI",
      "status": "pending",
      "phase": null,
      "iterations": 0,
      "max_iterations": 5
    }
  ],
  "current_task_id": "task_001",
  "run_id": "run_2025-10-23_001",
  "started_at": "2025-10-23T14:00:00Z",
  "updated_at": "2025-10-23T14:15:00Z"
}
```

### Task Queue (`task-queue.json`)
```json
{
  "queue": [
    {
      "id": "task_001",
      "project": "ERP HMC",
      "title": "Create user management API",
      "domain": "backend",
      "priority": "high",
      "max_iterations": 5,
      "added_at": "2025-10-23T14:00:00Z"
    }
  ],
  "completed": [],
  "failed": [],
  "updated_at": "2025-10-23"
}
```

## Orchestrator Responsibilities

### 1. Task Initialization
```typescript
async function initializeTask(userRequest: string) {
  // Load memory for context
  const memory = await loadSkill('ald-memory');

  // Invoke analyzer to create task_spec
  const taskSpec = await analyzeTask(userRequest, memory);

  // Create run record
  const run = {
    run_id: generateRunId(),
    project: taskSpec.project,
    task: taskSpec.title,
    domain: taskSpec.domain,
    started_at: new Date(),
    status: 'in_progress'
  };

  await saveRun(run);

  return taskSpec;
}
```

### 2. Execution Coordination
```typescript
async function executeTask(taskSpec: TaskSpec) {
  // Load policies
  const policies = await loadSkill('ald-policies');

  // Execute implementation
  const implementation = await implement(taskSpec, policies);

  // Update run with implementation details
  await updateRun({
    implementation_complete: true,
    files_modified: implementation.files
  });

  return implementation;
}
```

### 3. Validation Loop
```typescript
async function validateTask(taskSpec: TaskSpec) {
  let iterations = 0;
  const maxIterations = taskSpec.max_iterations || 5;

  while (iterations < maxIterations) {
    iterations++;

    // Run tester
    const testResult = await runTester(taskSpec);

    if (testResult.overall_passed) {
      // Success! Update run and continue
      await updateRun({
        status: 'passed',
        iterations,
        test_result: testResult,
        completed_at: new Date()
      });

      return { passed: true, iterations };
    }

    // Failed - invoke instructor
    const patch = await invokeInstructor(testResult);

    // Apply patch (back to executor)
    await applyPatch(patch);

    // Update run with iteration info
    await updateRun({
      iterations,
      last_failure: testResult,
      last_patch: patch
    });

    // Loop - will re-test
  }

  // Max iterations reached without success
  await updateRun({
    status: 'failed',
    iterations,
    failure_reason: 'Max iterations reached without passing validation'
  });

  return { passed: false, iterations };
}
```

### 4. Curator Invocation
```typescript
async function runCurator() {
  // Triggered when task list completes
  const curator = await loadSkill('ald-curator');

  // Analyze all uncurated runs
  const analysis = await curator.analyzeRuns();

  // Update policies if patterns found
  if (analysis.new_policies.length > 0) {
    await updatePolicies(analysis.new_policies);
  }

  // Update memory with learnings
  if (analysis.memory_updates.length > 0) {
    await updateMemory(analysis.memory_updates);
  }

  // Cleanup old runs
  await curator.cleanup();

  return analysis;
}
```

## Decision Logic

### When to Invoke Each Skill

**ald-memory**:
- At workflow start (load context)
- After curator completes (update learnings)

**ald-policies**:
- Before executor runs (load rules)
- After curator completes (if new policies created)

**ald-tester**:
- After executor completes implementation
- After instructor patches applied (re-validation)

**ald-curator**:
- When ALL tasks in task list complete
- When user explicitly requests curation
- Max: once per task list completion

### Iteration Limits

**Why limit iterations?**
- Prevent infinite loops
- Force re-thinking if stuck
- Capture failures for learning

**Default limit**: 5 iterations per task
**When to increase**: Complex tasks, multiple integration points
**When to decrease**: Simple tasks, clear requirements

### Failure Handling

**If task fails after max iterations**:
1. Mark run as 'failed'
2. Save all failure details
3. Ask user for guidance
4. Curator will analyze failure pattern

**Never**:
- Skip validation to "force success"
- Mark failed task as passed
- Hide failures from user

## Integration with CLAUDE.md Concepts

### Roles Mapping
- **ANALYZER**: Built into orchestrator (task decomposition phase)
- **EXECUTOR**: Claude executing with policies loaded
- **TESTER**: ald-tester skill
- **INSTRUCTOR**: Built into orchestrator (patch generation phase)
- **CURATOR**: ald-curator skill
- **ORCHESTRATOR**: This skill

### Authority Order (from CLAUDE.md)
1. Output contract (task completion standard)
2. Orchestrator workflow rules
3. Active skill instructions
4. Policies from ald-policies
5. Memory from ald-memory

## Best Practices

1. **Always load memory first** - Context is crucial
2. **Enforce policies strictly** - No shortcuts
3. **Loop until perfect** - Never compromise on validation
4. **Run curator after completion** - Learning is mandatory
5. **Keep state updated** - Helps debugging and resuming
6. **Limit iterations reasonably** - Prevent infinite loops
7. **Document failures clearly** - Help curator learn

## Output Format

### During Execution
```
🎯 Orchestrator: Starting task "Create user API"
📖 Phase: ANALYZER
   ✓ Memory loaded (project: ERP HMC)
   ✓ Task spec created (3 subtasks)

📖 Phase: EXECUTOR
   ✓ Policies loaded (36 rules)
   ⚙️ Implementing...
   ✓ Implementation complete

📖 Phase: TESTER
   ⚙️ Running validation...
   ✓ Technical tests: PASSED
   ✓ UX validation: PASSED
   ✓ Overall: PASSED

✅ Task completed in 1 iteration

📖 Phase: CURATOR (all tasks done)
   ⚙️ Analyzing runs...
   ✓ 1 pattern detected
   ✓ Memory updated
   ✓ 1 run cleaned up

🎉 Workflow complete!
```

### On Failure
```
🎯 Orchestrator: Starting validation (iteration 1/5)
📖 Phase: TESTER
   ⚙️ Running validation...
   ✗ Console errors: 1
   ✗ Overall: FAILED

📖 Phase: INSTRUCTOR
   🔍 Diagnosing...
   ✓ Issue: Missing import statement
   ✓ Patch created

📖 Phase: EXECUTOR (applying patch)
   ✓ Patch applied

🔄 Re-running validation (iteration 2/5)...
```

## Sprint Coordination ⭐

Orchestrator now coordinates sprint phases:

**Phase 0: Sprint Check** (before ANALYZER)
- Verify sprint ativa
- Validate task scope
- Alert if scope violation

**Commands**:
- sprint:plan <goal> - Create new sprint
- sprint:execute - Execute with scope check
- sprint:review - Validate + regression check
- sprint:retro - Capture learnings
