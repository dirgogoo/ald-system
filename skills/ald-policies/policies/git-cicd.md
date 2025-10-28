# Git & CI/CD Policies

Opinionated rules for version control, collaboration, and deployment automation.

---

## Policy 8.1 — Commit Message Format

**MUST**: Follow conventional commits format for all commit messages.

**Format**: `<type>(<scope>): <subject>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build, tooling, dependencies

**Implementation**:
```bash
# ✅ Good - Conventional commits
feat(auth): add email verification flow
fix(products): resolve duplicate product creation bug
docs(readme): update installation instructions
refactor(api): extract validation logic to separate file
test(checkout): add E2E tests for payment flow
chore(deps): upgrade next to 14.2.0

# With body for breaking changes
feat(api): redesign product response format

BREAKING CHANGE: Product API now returns {data: {...}} instead of {...}

# ❌ Bad - Vague commits
git commit -m "fix stuff"
git commit -m "changes"
git commit -m "wip"
git commit -m "asdfasdf"
```

**Benefits**:
- Auto-generate changelogs
- Semantic versioning automation
- Easier code review
- Better git history navigation

---

## Policy 8.2 — Branch Naming Convention

**MUST**: Use descriptive branch names following pattern: `<type>/<short-description>`

**Types**:
- `feature/` - New features
- `fix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions

**Implementation**:
```bash
# ✅ Good - Descriptive branch names
feature/email-verification
fix/duplicate-product-creation
hotfix/payment-gateway-timeout
refactor/extract-validation-logic
docs/update-api-documentation
test/add-checkout-e2e-tests

# ❌ Bad - Vague or personal branches
my-branch
dev
test
fix
feature123
```

**Branch Strategy**:
- `main` - Production-ready code
- `develop` - Integration branch (optional)
- `feature/*` - Feature branches (from main)
- `hotfix/*` - Emergency fixes (from main)

---

## Policy 8.3 — Pull Request Requirements

**MUST**: Every PR must meet these criteria before merge:

**Required**:
1. ✅ **Description**: Clear description of changes
2. ✅ **Tests**: Tests pass (unit + integration + E2E)
3. ✅ **Build**: Build succeeds
4. ✅ **Review**: At least 1 approval (team > 2 people)
5. ✅ **No conflicts**: Branch up-to-date with main
6. ✅ **Linked issue**: References issue/ticket

**Optional but Recommended**:
- Screenshots (UI changes)
- Performance impact (Lighthouse scores)
- Breaking changes documented

**Implementation**:
```markdown
# ✅ Good - Complete PR description
## Summary
Implements email verification flow for new user signups.

## Changes
- Added `/auth/verify-email` route
- Created `EmailVerificationToken` table
- Integrated with SendGrid for email delivery
- Added E2E test for verification flow

## Testing
- ✅ Unit tests: `lib/email.test.ts`
- ✅ Integration: `app/api/auth/verify/route.test.ts`
- ✅ E2E: `e2e/email-verification.spec.ts`

## Screenshots
[Attach screenshot of verification email and success page]

## Related Issues
Closes #123

## Breaking Changes
None

---

# ❌ Bad - Minimal PR
"Added email verification"
```

---

## Policy 8.4 — Code Review Checklist

**MUST**: Reviewers must verify these items before approval:

**Functionality**:
- ✅ Code solves stated problem
- ✅ No obvious bugs
- ✅ Edge cases handled

**Code Quality**:
- ✅ Follows project conventions
- ✅ No duplicated code (DRY)
- ✅ Readable and maintainable
- ✅ Appropriate abstractions

**Testing**:
- ✅ Tests cover new code
- ✅ Tests are meaningful (not just coverage)
- ✅ All tests pass

**Security**:
- ✅ No hardcoded secrets
- ✅ Input validation present
- ✅ SQL injection prevented
- ✅ XSS prevented

**Performance**:
- ✅ No obvious performance issues
- ✅ Database queries optimized
- ✅ Large files lazy-loaded

**Documentation**:
- ✅ Complex logic commented
- ✅ README updated (if needed)
- ✅ API docs updated (if API changed)

**Implementation**:
```typescript
// ✅ Good - Review comments
// Reviewer: "Could we extract this validation logic to a separate function?"
// Reviewer: "This query might be slow on large tables. Can we add an index?"
// Reviewer: "Great work! LGTM 🚀"

// ❌ Bad - Rubber stamp reviews
// Reviewer: "LGTM" (without actually reading code 😱)
```

---

## Policy 8.5 — CI Pipeline (Automated Checks)

**MUST**: Run these checks on every PR automatically:

**Required Checks**:
1. ✅ **Lint**: ESLint + Prettier
2. ✅ **Type Check**: TypeScript strict mode
3. ✅ **Unit Tests**: All unit tests pass
4. ✅ **Integration Tests**: API tests pass
5. ✅ **Build**: Production build succeeds
6. ✅ **E2E Tests**: Critical paths pass (on main merge)

**Implementation**:
```yaml
# ✅ Good - GitHub Actions workflow
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

# ❌ Bad - No CI pipeline
# Manual testing only, regressions slip through 😱
```

---

## Policy 8.6 — Deployment Strategy

**MUST**: Use automated deployments with preview environments.

**Environments**:
- **Production**: `main` branch → Auto-deploy to production
- **Preview**: Every PR → Deploy preview URL
- **Staging** (optional): `develop` branch → Staging environment

**Rationale**: Catch issues before production, enable stakeholder review.

**Implementation**:
```yaml
# ✅ Good - Vercel auto-deployment (default)
# Every push to main → Production
# Every PR → Preview URL (pr-123.vercel.app)

# next.config.js
module.exports = {
  // Vercel automatically handles this
  // Preview: Uses NEXT_PUBLIC_API_URL from preview env
  // Production: Uses NEXT_PUBLIC_API_URL from production env
};

# ❌ Bad - Manual deployments
# SSH into server, git pull, npm run build, pm2 restart
# Error-prone, no rollback, downtime 😱
```

**Deployment Checklist**:
1. ✅ All CI checks pass
2. ✅ Database migrations run (before deploy)
3. ✅ Environment variables updated
4. ✅ Smoke test after deploy
5. ✅ Rollback plan ready

---

## Policy 8.7 — Rollback Procedure

**MUST**: Have documented rollback procedure for production issues.

**Rationale**: Minimize downtime when bugs reach production.

**Implementation**:
```bash
# ✅ Good - Quick rollback options

# Option 1: Vercel instant rollback (preferred)
# Go to Vercel dashboard → Deployments → Redeploy previous version
# Or CLI: vercel rollback

# Option 2: Git revert + redeploy
git revert HEAD
git push origin main
# Vercel auto-deploys reverted version

# Option 3: Redeploy specific commit
git checkout abc123
git push origin main --force  # Use with caution!

# Database rollback (if migration failed)
npm run db:rollback  # Runs down() migration

# ❌ Bad - No rollback plan
# Production is down, scrambling to fix 😱
# Users affected for hours
```

**Rollback Triggers**:
- Critical bug in production
- Performance degradation (p95 latency > 2x baseline)
- Error rate spike (> 5%)
- Database migration failure

---

## Policy 8.8 — Environment Variable Management

**MUST**: Manage secrets securely across environments.

**Rules**:
- ✅ Never commit `.env` files to git
- ✅ Use platform secret management (Vercel, AWS Secrets Manager)
- ✅ Different secrets per environment
- ✅ Rotate secrets regularly (see Security Policy 4.13)
- ❌ Don't hardcode secrets in code

**Implementation**:
```bash
# ✅ Good - .gitignore
.env.local
.env.*.local
.env.production

# ✅ Good - Environment template
# .env.example (committed to git)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
NEXT_PUBLIC_API_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ✅ Good - Vercel environment variables
# Dashboard → Settings → Environment Variables
# Separate values for:
# - Production
# - Preview
# - Development

# ❌ Bad - Committed secrets
# .env (committed to git with real values 😱)
DATABASE_URL=postgresql://admin:RealPassword123@prod.db:5432/app
STRIPE_SECRET_KEY=sk_live_REAL_KEY  # Exposed! 😱
```

**Best Practices**:
- Use Vercel Environment Variables UI
- Prefix public vars with `NEXT_PUBLIC_`
- Document required env vars in README
- Use tools like `doppler` or `1password` for team secret sharing

---

## Anti-Patterns to Avoid

❌ **Vague commit messages** ("fix", "wip", "changes")
❌ **Long-lived feature branches** (merge often!)
❌ **Merging without code review**
❌ **No CI/CD pipeline**
❌ **Manual deployments**
❌ **No rollback plan**
❌ **Committing secrets to git**
❌ **Skipping tests to deploy faster**

---

**Last Updated**: 2025-10-23
**Policy Count**: 8
