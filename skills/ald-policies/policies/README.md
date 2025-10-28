# ALD Policies — Complete Policy System

**155 opinionated policies** for building production-ready web applications.

This is the complete policy system for the ALD (Autonomous Learning & Development) workflow. These policies are **learned patterns** from past implementations, validated by real-world usage, and continuously evolved through the curator system.

---

## Overview

The policy system is organized into **17 categories** covering all aspects of modern web development:

| Category | Policies | File |
|----------|----------|------|
| **1. Database** | 13 policies | [database.md](./database.md) |
| **2. UI/UX** | 14 policies | [ui-ux.md](./ui-ux.md) |
| **3. Code Quality** | 17 policies | [code-quality.md](./code-quality.md) |
| **4. Security** | 13 policies | [security.md](./security.md) |
| **5. API Design** | 10 policies | [api-design.md](./api-design.md) |
| **6. Testing** | 8 policies | [testing.md](./testing.md) |
| **7. Performance** | 8 policies | [performance.md](./performance.md) |
| **8. Git & CI/CD** | 8 policies | [git-cicd.md](./git-cicd.md) |
| **9. Logging & Monitoring** | 6 policies | [logging-monitoring.md](./logging-monitoring.md) |
| **10. Sprint Management** | 12 policies | See [ald-sprint](../../ald-sprint/policies/) |
| **11. External Integrations** | 11 policies | [external-integrations.md](./external-integrations.md) |
| **12. MCP Usage Details ⭐** | 4 policies | [mcp-usage.md](./mcp-usage.md) |
| **13. Error Recovery ⭐** | 6 policies | [error-recovery.md](./error-recovery.md) |
| **14. State Management ⭐** | 7 policies | [state-management.md](./state-management.md) |
| **15. Data Fetching ⭐** | 6 policies | [data-fetching.md](./data-fetching.md) |
| **16. File Uploads ⭐** | 5 policies | [file-uploads.md](./file-uploads.md) |
| **17. Forms & Validation ⭐** | 7 policies | [forms-validation.md](./forms-validation.md) |
| **TOTAL** | **155 policies** | |

---

## Philosophy

### Why Policies?

Policies capture **validated patterns** that prevent common mistakes. Instead of reinventing solutions or making the same errors, we encode learned wisdom into enforceable rules.

**Traditional approach**:
```
Task → Implement (improvise) → Errors → Fix → Repeat
```

**Policy-driven approach**:
```
Task → Load Policies → Implement (following patterns) → Validate → Done ✅
```

### Policy Levels

- **MUST**: Non-negotiable requirement (security, correctness)
- **SHOULD**: Strong recommendation (best practice, maintainability)
- **MAY**: Optional optimization (context-dependent)

### How Policies Evolve

1. **Pattern Detected**: Curator identifies recurring pattern (≥3 occurrences)
2. **Validation**: Pattern validated across multiple projects
3. **Promotion**: Pattern becomes policy
4. **Enforcement**: Policy enforced in future implementations
5. **Iteration**: Policy refined based on feedback

---

## Quick Reference

### Database (13 policies)

1. **Explicit Primary Keys** - Every table must have explicit PK
2. **Index All Foreign Keys** - FKs must have indexes
3. **Composite Indexes** - Optimize frequent joins
4. **No SELECT *** - Always specify columns
5. **Migrations with down()** - Enable rollbacks
6. **EXPLAIN ANALYZE** - Validate query performance
7. **Avoid N+1 Queries** - Batch-load related data
8. **Use Database Constraints** - Enforce integrity at DB level
9. **Naming Conventions** - snake_case, plural tables, boolean prefixes
10. **Soft Deletes** - Use deleted_at for user data
11. **Audit Trails** - Track created_by, updated_by, deleted_by
12. **Timestamps Mandatory** - All tables need created_at, updated_at
13. **Data Seeding Strategy** - Separate seeds from migrations

### UI/UX (14 policies)

1. **Server Components First** - Default to Server Components
2. **Small Components** - Single responsibility, < 150 lines
3. **Accessibility Mandatory** - Semantic HTML, ARIA, keyboard nav
4. **Mobile-First Responsive** - Design for mobile, enhance up
5. **Loading/Error States** - Handle all async states
6. **Optimistic UI** - Immediate feedback, rollback on error
7. **Form Validation** - Client + Server validation
8. **Consistent Design System** - Use design tokens (shadcn/ui)
9. **Error Boundaries Required** - Catch crashes, prevent app-wide failure
10. **Suspense Boundaries** - Lazy load heavy components
11. **Data Fetching Patterns** - Server for static, Client for user data
12. **Form Validation UX** - Show errors on blur, not keystroke
13. **Empty States Required** - Meaningful empty states with CTAs
14. **Skeleton vs Spinner** - Skeletons for layout, spinners for actions

### Code Quality (16 policies)

1. **Strict TypeScript Mode** - Explicit types, no implicit any
2. **DRY** - Extract repeated logic (≥2 duplications)
3. **Single Responsibility** - One function, one purpose
4. **Early Returns** - Reduce nesting, improve readability
5. **Meaningful Names** - Descriptive, intention-revealing
6. **Error Handling Mandatory** - Never silent catch
7. **No Magic Numbers** - Extract to named constants
8. **Immutability** - Prefer immutable operations
9. **Test Critical Logic** - Unit tests for business logic
10. **No Dead Code** - Remove commented code, unused imports
11. **File Organization** - Feature-based structure
12. **Comments Guidelines** - Comment WHY, not WHAT
13. **API Response Format** - Standardized {success, data, error}
14. **Enum vs Union Types** - Prefer union types (no runtime cost)
15. **Avoid Barrel Exports** - Direct imports (better tree-shaking)
16. **Naming Consistency Across Layers** ⭐ - Same semantic names (DB → Code)

### Security (13 policies)

1. **Never Trust User Input** - Validate + sanitize server-side
2. **Parameterized Queries** - Prevent SQL injection
3. **Proper Authentication** - Use established libraries (Supabase, Auth0)
4. **Protect Logs** - Never log passwords, tokens, PII
5. **Environment Variables** - No hardcoded secrets
6. **Rate Limiting** - Protect public endpoints
7. **Row-Level Security** - RLS for multi-tenant data
8. **Sanitize HTML** - Prevent XSS attacks
9. **HTTPS Everywhere** - Enforce in production
10. **Least Privilege** - Minimum necessary permissions
11. **CSRF Protection** - Protect mutations (Server Actions)
12. **Content Security Policy** - CSP headers to prevent XSS
13. **Secrets Rotation** - Rotate keys every 90 days

### API Design (10 policies)

1. **RESTful Resource Naming** - Plural nouns, kebab-case
2. **HTTP Status Codes** - Correct status for all responses
3. **Pagination Standard** - Cursor-based for > 20 items
4. **Filtering and Sorting** - Support via query params
5. **API Versioning** - URL path versioning (/api/v1)
6. **Error Response Format** - Consistent {success, error}
7. **Rate Limiting Headers** - X-RateLimit-* headers
8. **CORS Configuration** - Explicit origin whitelisting
9. **Input Validation** - Zod schemas for all inputs
10. **API Documentation** - OpenAPI/Swagger or JSDoc

### Testing (8 policies)

1. **Unit Test Coverage** - 80%+ on business logic
2. **Integration Tests** - Test with real database
3. **E2E for Critical Paths** - Auth, purchase, data creation
4. **Mock vs Real Data** - Mock external services only
5. **Test Naming** - "should [behavior] when [condition]"
6. **AAA Pattern** - Arrange-Act-Assert structure
7. **Test Isolation** - Independent tests, any order
8. **Snapshot Testing** - Use sparingly (stable output only)

### Performance (8 policies)

1. **Page Load Targets** - LCP < 2.5s, FCP < 1.8s
2. **Core Web Vitals Monitoring** - Track LCP, FID, CLS
3. **Image Optimization** - Next.js Image component, WebP/AVIF
4. **Code Splitting** - Lazy load heavy components
5. **Caching Strategies** - Multi-layer (CDN, Browser, Server, DB)
6. **Database Query Optimization** - EXPLAIN ANALYZE, indexes
7. **Bundle Size Limits** - Initial JS < 200kb gzipped
8. **Lazy Loading** - Defer below-the-fold content

### Git & CI/CD (8 policies)

1. **Commit Message Format** - Conventional commits (feat, fix, etc)
2. **Branch Naming** - feature/, fix/, hotfix/
3. **Pull Request Requirements** - Tests, build, review, no conflicts
4. **Code Review Checklist** - Functionality, quality, security
5. **CI Pipeline** - Lint, typecheck, test, build on every PR
6. **Deployment Strategy** - Auto-deploy main, preview for PRs
7. **Rollback Procedure** - Documented rollback plan
8. **Environment Variables** - Secure secret management (Vercel)

### Logging & Monitoring (6 policies)

1. **Log Levels** - DEBUG, INFO, WARN, ERROR, FATAL
2. **Structured Logging** - JSON format (machine-readable)
3. **What to Log** - Auth, transactions, modifications, errors
4. **Error Tracking** - Sentry for production errors
5. **Performance Monitoring** - Track latency, error rate, resources
6. **Audit Logs** - Compliance trail for sensitive operations

---

## Usage

### When Implementing a Feature

1. **Load Memory**: Read project context from `ald-memory`
2. **Load Relevant Policies**: Identify which categories apply
   - Database work? → Read `database.md` + `security.md`
   - UI work? → Read `ui-ux.md` + `code-quality.md`
   - API work? → Read `api-design.md` + `security.md` + `testing.md`
3. **Implement**: Follow loaded policies
4. **Validate**: Use `ald-tester` to verify compliance
5. **Curate**: Use `ald-curator` to capture learnings

### Example: Creating a New API Endpoint

**Step 1**: Load policies
```
Read: api-design.md (10 policies)
Read: security.md (13 policies)
Read: testing.md (8 policies)
```

**Step 2**: Implement following policies
- Policy 5.1 (RESTful naming): `POST /api/products`
- Policy 5.2 (Status codes): Return 201 on success
- Policy 5.9 (Validation): Zod schema for input
- Policy 4.1 (Input validation): Server-side validation
- Policy 4.6 (Rate limiting): Add rate limiting
- Policy 6.2 (Integration tests): Test with real DB

**Step 3**: Validate with ald-tester
- Build passes? ✅
- Tests pass? ✅
- Console clean? ✅
- Policies followed? ✅

**Step 4**: Mark complete

---

## Policy Enforcement

Policies are enforced through:

1. **PRE-FLIGHT CHECK**: Required before implementation
2. **ald-tester**: Validates policy compliance
3. **Code Review**: Reviewers check policy adherence
4. **CI Pipeline**: Automated checks (lint, test, build)
5. **ald-curator**: Tracks violations, suggests improvements

---

## Contributing to Policies

Policies evolve based on real-world patterns. To propose a new policy:

1. **Detect Pattern**: Identify recurring pattern (≥3 occurrences)
2. **Document**: Write clear rationale, implementation, examples
3. **Validate**: Test across multiple scenarios
4. **Submit**: Add to `ald-curator/feedback.json` as pattern candidate
5. **Review**: Curator promotes validated patterns to policies

---

## Files Structure

```
ald-policies/
├── README.md                    (this file)
├── policies/
│   ├── database.md              (13 policies)
│   ├── ui-ux.md                 (14 policies)
│   ├── code-quality.md          (16 policies)
│   ├── security.md              (13 policies)
│   ├── api-design.md            (10 policies)
│   ├── testing.md               (8 policies)
│   ├── performance.md           (8 policies)
│   ├── git-cicd.md              (8 policies)
│   └── logging-monitoring.md    (6 policies)
└── examples/                    (optional: full code examples)
```

---

## Version History

| Version | Date | Policies | Notable Changes |
|---------|------|----------|----------------|
| **v1.3.1 ⭐** | 2025-10-23 | 155 | Added Policy 3.17: Code Documentation (document policies in code) |
| v1.3 | 2025-10-23 | 154 | Added 6 categories: MCP Usage, Error Recovery, State, Data Fetching, Uploads, Forms (+35) |
| v1.2 | 2025-10-23 | 119 | Added External Integrations (11 policies - MCP + API) |
| v1.1 | 2025-10-23 | 108 | Added Sprint Management (12 policies) |
| v1.0 | 2025-10-23 | 96 | Initial complete policy system |
| v0.3 | 2025-10-23 | 56 | Added Phase 1 expansions |
| v0.2 | 2025-10-23 | 36 | Baseline from initial marketplace project |
| v0.1 | 2025-10-22 | 1 | Single RLS policy proof-of-concept |

---

## Integration with ALD System

This policy system is one component of the complete ALD system:

```
ALD System (Autonomous Learning & Development)
│
├── ald-memory/           → Contextual memory (projects, preferences, integrations)
├── ald-policies/         → This policy system (155 policies) ⭐
├── ald-curator/          → Learning & evolution (feedback → policies)
├── ald-tester/           → Validation (technical + UX + policies)
├── ald-orchestrator/     → Workflow coordination
└── ald-sprint/           → Sprint management (12 policies)
```

**Workflow**:
```
Task → Load Memory → Load Policies → Execute → Test → Curate → Learn
                         ↑                                        ↓
                         └────────── Policies Evolve ────────────┘
```

---

## Key Principles

1. **Opinionated but Flexible**: Strong defaults, override when justified
2. **Evidence-Based**: Policies derived from real implementations
3. **Continuously Evolving**: Curator promotes patterns to policies
4. **Enforceable**: Validation through tooling (ald-tester)
5. **Practical**: Real-world examples, not theoretical ideals

---

**Last Updated**: 2025-10-23
**Total Policies**: 155
**System Version**: ALD v1.3.1 ⭐

---

## Quick Links

- [Database Policies](./database.md) - Schema design, queries, migrations
- [UI/UX Policies](./ui-ux.md) - Components, accessibility, responsive design
- [Code Quality Policies](./code-quality.md) - TypeScript, DRY, naming conventions
- [Security Policies](./security.md) - Authentication, validation, RLS
- [API Design Policies](./api-design.md) - REST, status codes, pagination
- [Testing Policies](./testing.md) - Unit, integration, E2E tests
- [Performance Policies](./performance.md) - Core Web Vitals, optimization
- [Git & CI/CD Policies](./git-cicd.md) - Commits, PRs, deployments
- [Logging & Monitoring Policies](./logging-monitoring.md) - Observability, audit logs
- [Sprint Management Policies](../../ald-sprint/policies/) - Planning, execution, scope isolation, review, retrospective
- [External Integrations Policies](./external-integrations.md) - MCPs, SDKs, documentation, memory-first pattern
- [MCP Usage Details Policies ⭐](./mcp-usage.md) - Supabase, Chrome DevTools, Git, Vercel MCPs
- [Error Recovery Policies ⭐](./error-recovery.md) - Retry, fallbacks, circuit breakers, error boundaries
- [State Management Policies ⭐](./state-management.md) - Server/client state, Context, Zustand, URL state
- [Data Fetching Policies ⭐](./data-fetching.md) - Server Components, React Query, parallel fetching, prefetch
- [File Uploads Policies ⭐](./file-uploads.md) - Size limits, optimization, progress, chunked uploads
- [Forms & Validation Policies ⭐](./forms-validation.md) - Validation, error messages, accessibility

---

**Remember**: These policies are here to **prevent past mistakes** and **accelerate development**. Follow them by default, but override when context demands it. Document exceptions and feed them back to the curator for system evolution.

🚀 **With 155 policies, you're building on the shoulders of giants (previous implementations).**
