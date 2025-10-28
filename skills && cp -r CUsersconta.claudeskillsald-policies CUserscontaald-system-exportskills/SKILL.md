---
name: ald-memory
description: Manages persistent contextual memory across conversations. Use when starting any development task to load project context, tech stack preferences, coding standards, and learned patterns. Also use to update memory after completing tasks or discovering new patterns.
---

# ALD Memory System

This skill provides persistent memory for the Autonomous Learning & Development (ALD) system. It maintains context across conversations to ensure consistency and apply learned patterns.

## When to Invoke

**Automatically invoke this skill when:**
- Starting any new development task (to load context)
- User mentions a specific project name
- Completing a task (to update patterns/learnings)
- User asks about preferences or past decisions
- Need to recall tech stack, coding standards, or project-specific rules

## Memory Structure

### 1. Global Memory (`memory/global.json`)
Stores cross-project preferences and standards.

```json
{
  "ui": {
    "stack": "Next.js + Tailwind + shadcn/ui",
    "preferences": ["TypeScript strict mode", "Component composition over inheritance"]
  },
  "database": {
    "rules": ["Explicit PKs", "Index on FKs", "No SELECT *", "Migration with down()"],
    "preferred_orm": "Drizzle"
  },
  "code_style": {
    "principles": ["Small components", "SRP", "DRY", "Strict typing"],
    "testing": ["Unit tests for business logic", "E2E for critical flows"]
  },
  "updated_at": "2025-10-23"
}
```

### 2. Project Memory (`memory/projects/{project-name}.json`)
One file per project with specific context.

```json
{
  "project_name": "ERP HMC",
  "stack": {
    "frontend": "Next.js 14 + App Router",
    "backend": "Supabase Edge Functions",
    "database": "PostgreSQL + Drizzle ORM",
    "auth": "Supabase Auth"
  },
  "conventions": [
    "API routes in /app/api/",
    "Components in /components/ with index.ts exports",
    "Types in /types/ per domain"
  ],
  "gotchas": [
    "Auth middleware must check session on server components",
    "Edge functions need CORS headers for browser calls"
  ],
  "updated_at": "2025-10-23"
}
```

### 3. Patterns (`memory/patterns.json`)
Recurring patterns and solutions that worked.

```json
{
  "patterns": [
    {
      "id": "pattern_001",
      "category": "database",
      "title": "Composite indexes for FK joins",
      "problem": "Slow queries with sequential scans on FK columns",
      "solution": "Create composite index (fk_col, parent_id) for frequently joined FKs",
      "frequency": 5,
      "last_applied": "2025-10-20"
    },
    {
      "id": "pattern_002",
      "category": "ui",
      "title": "Server/Client component split",
      "problem": "Client components causing unnecessary hydration",
      "solution": "Keep parent as Server Component, only mark interactive children as 'use client'",
      "frequency": 8,
      "last_applied": "2025-10-22"
    }
  ],
  "updated_at": "2025-10-23"
}
```

## How to Use Memory

### Reading Memory
Before starting a task:
1. Check if project exists in `memory/projects/`
2. Load relevant global preferences from `memory/global.json`
3. Check `memory/patterns.json` for applicable patterns

### Updating Memory
After completing a task or discovering a pattern:
1. Update project-specific learnings in `memory/projects/{project}.json`
2. If pattern applies globally, update `memory/global.json`
3. If pattern is recurring, add/update in `memory/patterns.json` with incremented frequency

### Creating New Project Memory
When working on a new project:
1. Create `memory/projects/{project-name}.json`
2. Populate with stack, conventions, and initial context
3. Update as you learn project-specific patterns

## Operating Principles

1. **Read Before Act**: Always check memory before implementing
2. **Update After Success**: Record what worked
3. **Increment Patterns**: Track frequency of recurring solutions
4. **Keep It Fresh**: Update `updated_at` timestamps
5. **Stay Lean**: Remove outdated or invalidated patterns

## Integration with Other Skills

- **ald-policies**: Policies are enforced based on memory context
- **ald-curator**: Curator updates patterns after analyzing runs
- **ald-orchestrator**: Orchestrator loads memory at workflow start
- **ald-tester**: Tester validates against project conventions from memory
- **ald-sprint** ⭐: Sprint context is loaded automatically with project memory

## Sprint Context Integration ⭐

### Structure

Project memory files now include `current_sprint` field:

```json
{
  "project_name": "Marketplace Peças Industriais",
  "stack": {
    "frontend": "Next.js 14",
    "database": "PostgreSQL + Drizzle",
    "auth": "Supabase Auth"
  },
  "current_sprint": {
    "active": true,
    "sprint_id": "sprint-008-products-crud",
    "goal": "Implementar CRUD completo de produtos para vendedores",
    "scope": {
      "in_scope": [
        "app/dashboard/seller/products/**",
        "components/products/**",
        "db/schema/products.ts",
        "lib/validations/product-schema.ts"
      ],
      "off_limits": [
        "app/auth/**",
        "app/checkout/**",
        "db/schema/users.ts",
        "db/schema/orders.ts"
      ]
    },
    "tasks": [
      { "id": 1, "title": "Criar schema products", "status": "completed" },
      { "id": 2, "title": "Criar API routes CRUD", "status": "in_progress" },
      { "id": 3, "title": "Criar UI de listagem", "status": "pending" }
    ]
  },
  "updated_at": "2025-10-23"
}
```

### How Claude Uses Sprint Context

1. **Ao carregar memory**: Sprint context é incluído automaticamente
2. **Antes de implementar**: Verifica se tarefa está no scope
3. **Ao modificar arquivo**: Valida se arquivo está no in_scope
4. **Ao completar task**: Atualiza status no memory

### When Sprint is Not Active

If `current_sprint.active` is `false` or field doesn't exist:
- Claude asks: "Deseja criar sprint para esta tarefa?"
- User can choose to work with or without sprint tracking

### Updating Sprint Context

Sprint context is synchronized:
- When sprint is created: Added to memory
- When task completed: Updated in memory
- When sprint finished: Removed from memory, moved to history

---

## Integration Memory ⭐ NEW

### Purpose

Avoid re-learning how to integrate the same external API/service multiple times. Store integration patterns, gotchas, and SDK versions for future reuse.

### When to Use

**BEFORE integrating external API**:
- Check if `integrations.[api_name]` exists in project memory
- If exists: Reuse version, patterns, gotchas
- If not: Follow external-integrations policies (11.6-11.11)

**AFTER successful integration**:
- Save integration details to memory
- Document gotchas discovered
- Include SDK version used

### Structure

Each integration entry in project memory includes:

```json
{
  "integrations": {
    "[api_name]": {
      "type": "backend|payment|analytics|email|...",
      "version": "SDK version used (e.g., 'stripe v10.0.0')",
      "features_used": ["list", "of", "features", "implemented"],
      "gotchas": [
        "Mistake to avoid 1",
        "Mistake to avoid 2",
        "Important configuration detail"
      ],
      "docs_reference": "https://official-docs-url.com",
      "integrated_at": "2025-10-23"
    }
  }
}
```

### Example: Supabase Integration

```json
{
  "project_name": "Marketplace Peças Industriais",
  "integrations": {
    "supabase": {
      "type": "backend",
      "version": "@supabase/supabase-js v2.39.0",
      "features_used": ["auth", "database", "storage", "realtime"],
      "gotchas": [
        "RLS policies obrigatórias para multi-tenant data isolation",
        "Session check em Server Components: cookies().get('supabase-auth-token')",
        "Edge functions precisam CORS headers explícitos para browser calls",
        "Service role key NUNCA deve ir para o client (apenas server-side)"
      ],
      "docs_reference": "https://supabase.com/docs",
      "integrated_at": "2025-10-23"
    },
    "stripe": {
      "type": "payment",
      "version": "stripe v10.0.0",
      "features_used": ["checkout", "webhooks", "payment-intents"],
      "gotchas": [
        "Webhook signatures MUST be verified: stripe.webhooks.constructEvent()",
        "Use idempotency keys para charges (prevent duplicate payments)",
        "Test mode vs Live mode: different API key prefixes (pk_test vs pk_live)",
        "Webhooks devem ser registrados no Stripe Dashboard"
      ],
      "docs_reference": "https://stripe.com/docs/api",
      "integrated_at": "2025-10-23"
    }
  }
}
```

### Workflow

#### Before Integration (Memory-First Pattern)

**Step 1**: Read project memory
```bash
Read: ~/.claude/skills/ald-memory/memory/projects/[project-name].json
```

**Step 2**: Check integrations section
```json
// If exists:
{
  "integrations": {
    "supabase": { ... } // ✅ Found!
  }
}
```

**Step 3**: Reuse patterns
- Use same SDK version (compatibility)
- Follow documented gotchas (avoid past mistakes)
- Check features_used (avoid duplicate work)
- Reference docs if needed

**Step 4**: If doesn't exist
- Follow full workflow: SDK search → Docs research → Implementation
- Save to memory after success (Policy 11.11)

#### After Integration (Save to Memory)

**When**: After integration passes validation (ald-tester)

**Step 1**: Add entry to integrations
```json
{
  "integrations": {
    "[new_api]": {
      "type": "category",
      "version": "SDK version",
      "features_used": ["implemented features"],
      "gotchas": ["discovered during implementation"],
      "docs_reference": "official docs URL",
      "integrated_at": "YYYY-MM-DD"
    }
  }
}
```

**Step 2**: Update timestamp
```json
{
  "updated_at": "2025-10-23"
}
```

### Benefits

✅ **No Re-Research**: Context instantly available next time
✅ **Version Tracking**: Know which SDK version works
✅ **Gotchas Documented**: Avoid repeating same mistakes
✅ **Features Mapped**: Know what's already implemented
✅ **Docs Reference**: Quick access to official documentation

### Integration Categories

Common categories for `type` field:

- **backend**: Supabase, Firebase, AWS Amplify
- **payment**: Stripe, Mercado Pago, PayPal
- **analytics**: Google Analytics, Mixpanel, Amplitude
- **email**: Resend, SendGrid, Mailgun
- **storage**: AWS S3, Cloudinary, Uploadcare
- **auth**: Auth0, Clerk, NextAuth
- **monitoring**: Sentry, LogRocket, Datadog

### Related Policies

- **Policy 11.6**: Memory-First Pattern (MUST check before integrating)
- **Policy 11.11**: Save to Memory (MUST save after success)

See: `ald-policies/policies/external-integrations.md`

### Integration with Other Skills

- **ald-policies**: External integrations policies (11.6, 11.11)
- **ald-tester**: Validates integrations work correctly
- **ald-curator**: Learns from integration patterns over time
