---
name: ald-system
description: Autonomous Learning & Development system with 155 validated policies, persistent memory, sprint management, E2E testing, continuous learning, and intelligent code review
---

# ALD System - Autonomous Learning & Development

**Version**: 1.3.2
**Status**: ✅ Production Ready

## 🎯 What is ALD System?

**ALD (Autonomous Learning & Development)** is a complete AI-assisted development system featuring:

- 🧠 **Persistent Memory** - Context across conversations
- 📜 **155 Validated Policies** - 17 categories covering full dev lifecycle
- 🎯 **Sprint Management** - Scope isolation and regression prevention
- ✅ **E2E Testing** - Validation as end user
- 🔄 **Continuous Learning** - Self-improving system
- 👨‍💻 **Code Review** - Policy validation + quality checks
- 🔍 **Policy Finder** - Intelligent policy search
- 🎭 **Orchestrator** - Workflow coordination

---

## 📦 Included Skills (8 total)

1. **ald-memory** - Persistent context management
2. **ald-policies** - 155 policies in 17 categories
3. **ald-curator** - Pattern detection and learning
4. **ald-tester** - E2E validation as end user
5. **ald-orchestrator** - Workflow coordination
6. **ald-sprint** - Sprint management with scope isolation
7. **ald-policy-finder** - Intelligent policy search
8. **ald-code-reviewer** - Code review with policy validation

---

## 🚀 How It Works

When you start any development task, ALD automatically activates:

```
User: "Create an API endpoint for products"

Claude:
🚀 PRE-FLIGHT CHECK - API de produtos

- [✅] Sprint Check: In scope
- [✅] Memory loaded: your-project.json
- [✅] Policies identified (9 policies):
      - security.md
      - api-design.md
      - database.md
      ...

[Implementation following policies]

✅ Complete! All policies followed.

CLAUDE.MD ATIVO
```

---

## 🏛️ System Controller

The core ALD rules and workflow are defined in **`CLAUDE.md`**.

This file contains:
- Output contract (CLAUDE.MD ATIVO mandatory)
- Authority hierarchy
- Workflow rules (0. Sprint Check → 1. Memory → 2. Policies → 3. Orchestrate)
- Pre-flight check requirements
- Quality gates
- Anti-patterns to avoid

**Read the complete operational manual**: [CLAUDE.md](./CLAUDE.md)

---

## 📊 155 Policies in 17 Categories

### Database (13 policies)
- Explicit PKs, indexes on FKs
- RLS policies mandatory
- Migrations with rollback

### UI/UX (14 policies)
- Component composition
- Accessibility
- Performance

### Code Quality (17 policies)
- DRY, SOLID
- Error handling
- Documentation

### Security (13 policies)
- Server-side validation
- Authentication patterns
- Data protection

### API Design (10 policies)
- RESTful naming
- HTTP status codes
- Versioning

### Testing (8 policies)
- Unit, integration, E2E
- Coverage requirements

### Performance (8 policies)
- Optimization patterns
- Caching strategies

### Git/CI-CD (8 policies)
- Commit conventions
- PR workflows

### Logging/Monitoring (6 policies)
- Structured logging
- Metrics tracking

### External Integrations (11 policies)
- API documentation
- SDK usage
- Error recovery

### MCP Usage (4 policies)
- Priority: MCP > SDK > HTTP
- Auto-detection

### Error Recovery (6 policies)
- Graceful degradation
- Retry strategies

### State Management (7 policies)
- Client state patterns
- Cache invalidation

### Data Fetching (6 policies)
- Loading states
- Error boundaries

### File Uploads (5 policies)
- Validation
- Storage patterns

### Forms/Validation (7 policies)
- Client + server validation
- User feedback

### Sprint Scope Isolation (12 policies)
- Boundary enforcement
- Regression prevention

**Full policies**: `skills/ald-policies/policies/*.md`

---

## 🔄 Workflow

```
0. 🏃 SPRINT CHECK (if sprint active)
   ↓
1. 🧠 LOAD MEMORY (project context)
   ↓
2. 📜 IDENTIFY POLICIES (via policy-finder)
   ↓
3. 🎯 ORCHESTRATE
   ├─ ANALYZE (decompose task)
   ├─ EXECUTE (implement with policies)
   ├─ TEST (E2E validation)
   ├─ Loop if fails
   └─ CURATE (learn patterns)
```

---

## 🎯 Sprint Management

Create sprints for complex features:

```
User: "I'm implementing checkout with Stripe"

Claude: "Create sprint for 'checkout'?"

[After confirmation]

Sprint created: sprint-008-checkout
- Goal: Checkout completo com Stripe
- Scope: app/checkout/**, lib/stripe.ts
- Off-limits: app/auth/**, app/products/**

[All subsequent implementations validate against scope]
```

---

## 🧪 Code Review

```
User: "Review with ald-code-reviewer"

Claude:
# 🔍 Code Review: Checkout Implementation

## 🏛️ ALD Policies Compliance
- ✅ 9/10 policies applied correctly
- ❌ Policy 4.1: Missing server-side validation
  Fix: Add Zod schema to route.ts:12

## 🎯 Superpowers Review
[Standard code review output]

## ⚡ Priority Actions
1. [CRITICAL] Add validation
2. [IMPORTANT] Add file header
```

---

## 🤝 Integrates With

- **Nexus Orchestrator** - Master workflow coordinator
- **Superpowers** - Structured workflows
- **MCPs** - Supabase, Chrome DevTools, GitHub

---

## 📖 Usage

### Automatic Activation

ALD activates automatically when you request development tasks:

```
User: "Add users table"
→ ALD pre-flight check runs
→ Loads memory + policies
→ Implements following best practices
→ Validates completeness
```

### Manual Skill Invocation

```bash
# Load memory
Skill("ald-memory")

# Find relevant policies
Skill("ald-policy-finder")

# Review code
Skill("ald-code-reviewer")

# Create sprint
Skill("ald-sprint")
```

---

## 🎓 Learn More

- **CLAUDE.md** - Complete system controller (757 lines)
- **docs/MIGRATION.md** - Migration from original CLAUDE.md
- **docs/HOW_TO_ENFORCE_ALD.md** - User enforcement guide
- **skills/*/SKILL.md** - Individual skill documentation

---

## 📝 License

MIT License - see [LICENSE](./LICENSE)

---

## 🙏 Credits

Developed by **dirgogoo** with ❤️

**Repository**: https://github.com/dirgogoo/ald-system
**Issues**: https://github.com/dirgogoo/ald-system/issues

---

CLAUDE.MD ATIVO
