---
name: ald-policies
description: Enforces coding policies and best practices before generating code. Use automatically when implementing features, writing database migrations, creating UI components, or making architectural decisions. Policies are opinionated rules learned from past experience.
---

# ALD Policies System

This skill contains **opinionated policies** that must be followed during development. Each policy is born from patterns observed in production and validated through the ALD curator process.

## When to Invoke

**Automatically invoke this skill when:**
- Writing any code (check code-quality policies)
- Creating/modifying database schemas (check database policies)
- Building UI components (check ui-ux policies)
- Handling user data or auth (check security policies)
- Making architectural decisions
- Before generating any implementation

## Policy Structure

Each policy file contains rules organized by domain. Policies are:
- **Short and opinionated** (no ambiguity)
- **Action-oriented** (clear dos and don'ts)
- **Validated** (proven to work in production)
- **Living** (updated by curator based on outcomes)

## Policy Domains

### 1. Database Policies (`policies/database.md`)
Rules for schema design, queries, migrations, and performance.

### 2. UI/UX Policies (`policies/ui-ux.md`)
Rules for component structure, accessibility, responsiveness, and user experience.

### 3. Code Quality Policies (`policies/code-quality.md`)
Rules for code structure, typing, testing, and maintainability.

### 4. Security Policies (`policies/security.md`)
Rules for authentication, authorization, data handling, and secure coding.

## How to Apply Policies

### Before Implementation
1. Read relevant policy files based on task type
2. Check if any policies apply to current task
3. Follow policy rules strictly
4. If policy seems wrong, flag for curator review (don't ignore)

### During Code Review
1. Validate generated code against policies
2. Ensure no anti-patterns are present
3. If violation found, refactor immediately

### Reporting Violations
If you encounter a situation where:
- Policy doesn't apply or seems outdated
- Policy conflicts with project requirements
- New pattern emerges that should become policy

**Action**: Document in curator feedback for policy review/update.

## Policy Enforcement Levels

- **MUST**: Non-negotiable, always enforce
- **SHOULD**: Strong recommendation, exceptions need justification
- **CONSIDER**: Guideline, apply when applicable

## Integration with Other Skills

- **ald-memory**: Policies are contextualized by project memory
- **ald-curator**: Curator creates/updates policies from patterns
- **ald-tester**: Tester validates policy compliance
- **ald-orchestrator**: Orchestrator checks policies before execution

## Policy Evolution

Policies are not static:
1. **Curator analyzes runs** → identifies recurring patterns
2. **Pattern validated** (frequency > 3) → promoted to policy
3. **Policy applied** → monitored for effectiveness
4. **Policy updated/deprecated** based on outcomes

Keep policies **lean and actionable** - max 2 new policies per curator cycle.
