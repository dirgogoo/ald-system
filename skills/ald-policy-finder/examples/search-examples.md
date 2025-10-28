# Policy Finder - Search Examples

Complete guide with 25+ real-world examples showing how to use ald-policy-finder.

---

## Example 1: Keyword Search - "validation"

**Query**:
```
policy-finder:search validation
```

**Result**:
```markdown
## 🔍 Policy Search Results

**Query**: validation
**Search Type**: keyword
**Found**: 6 policies

---

### Policy 4.1: Never Trust User Input
**Level**: MUST
**Category**: Security
**File**: `ald-policies/policies/security.md`

**What**: All user input must be validated and sanitized server-side

**Why**: Prevent injection attacks, XSS, SQL injection, command injection

**How**:
- Use Zod schemas for validation
- Validate on server, not just client
- Sanitize HTML output with DOMPurify

**Example**:
```typescript
// ✅ CORRECT
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120)
});

const validated = userSchema.parse(userInput);
```

---

### Policy 5.9: Input Validation
**Level**: MUST
**Category**: API Design
**File**: `ald-policies/policies/api-design.md`

**What**: Use Zod schemas for all API inputs

[Additional policies: 17.1, 17.3, 17.4...]

---

**Files to Read**:
- `~/.claude/skills/ald-policies/policies/security.md`
- `~/.claude/skills/ald-policies/policies/api-design.md`
- `~/.claude/skills/ald-policies/policies/forms-validation.md`

**Compliance**:
- [ ] Apply these 6 policies in implementation
- [ ] Document which policies followed (Policy 3.17)
- [ ] Validate with ald-tester after implementation
```

---

## Example 2: Scenario Search - "create_api_endpoint"

**Query**:
```
policy-finder:scenario create_api_endpoint
```

**Result**:
```markdown
## 🔍 Complete Checklist: Creating a REST API Endpoint

**Scenario**: create_api_endpoint
**Found**: 7 policies (in execution order)

---

**Step 1**: Policy 4.1 - Never Trust User Input
Validate all input server-side to prevent injection attacks

**Step 2**: Policy 5.1 - RESTful Resource Naming
Use plural nouns, kebab-case: `/api/products`, `/api/order-items`

**Step 3**: Policy 5.2 - HTTP Status Codes
Return correct status: 201 Created, 400 Bad Request, 401 Unauthorized, etc.

**Step 4**: Policy 5.9 - Input Validation
Use Zod schemas for all request body validation

**Step 5**: Policy 6.2 - Integration Tests
Write integration tests with real database

**Step 6**: Policy 3.17 - Policy Documentation
Document which policies applied in code comments

**Step 7**: Policy 9.3 - What to Log
Log auth attempts, transactions, modifications, errors

---

**Implementation Template**:

```typescript
/**
 * Policies Applied:
 * - Policy 4.1: Server-side input validation (Security)
 * - Policy 5.1: RESTful naming (API Design)
 * - Policy 5.2: HTTP status codes (API Design)
 * - Policy 5.9: Zod validation (API Design)
 * - Policy 6.2: Integration tests (Testing)
 * - Policy 9.3: Logging (Logging & Monitoring)
 *
 * See: ald-policies/policies/README.md
 */

import { z } from 'zod';

// Policy 5.9: Input validation with Zod
const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  categoryId: z.string().uuid()
});

// Policy 5.1: RESTful naming (plural noun)
export async function POST(req: Request) {
  try {
    // Policy 4.1: Never trust user input - validate
    const body = await req.json();
    const validated = createProductSchema.parse(body);

    const product = await db.products.create(validated);

    // Policy 9.3: Log transaction
    logger.info('Product created', { productId: product.id });

    // Policy 5.2: Return 201 Created
    return Response.json(product, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      // Policy 5.2: Return 400 for validation errors
      return Response.json({ error: error.errors }, { status: 400 });
    }

    // Policy 9.3: Log error
    logger.error('Failed to create product', error);

    // Policy 5.2: Return 500 for server errors
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

**Test Template** (Policy 6.2):

```typescript
describe('POST /api/products', () => {
  it('should create product with valid data', async () => {
    const res = await POST(new Request({
      body: JSON.stringify({
        name: 'Widget',
        price: 29.99,
        categoryId: 'uuid-here'
      })
    }));

    expect(res.status).toBe(201); // Policy 5.2
    const product = await res.json();
    expect(product).toHaveProperty('id');
  });

  it('should reject invalid data', async () => {
    const res = await POST(new Request({
      body: JSON.stringify({ price: -10 }) // Invalid
    }));

    expect(res.status).toBe(400); // Policy 5.2
  });
});
```

---

**Checklist**:
- [ ] Step 1: Validation implemented (Policy 4.1, 5.9)
- [ ] Step 2: RESTful naming used (Policy 5.1)
- [ ] Step 3: Status codes correct (Policy 5.2)
- [ ] Step 4: Integration tests written (Policy 6.2)
- [ ] Step 5: Logging added (Policy 9.3)
- [ ] Step 6: Policies documented (Policy 3.17)
```

---

## Example 3: Technology Search - "supabase"

**Query**:
```
policy-finder:tech supabase
```

**Result**:
```markdown
## 🔍 Technology-Specific Policies: Supabase

**Technology**: Supabase
**Found**: 6 policies

---

### Policy 4.7: Row-Level Security (RLS)
**Level**: MUST
**Category**: Security

**What**: Enable RLS on all multi-tenant tables

**Why**: Prevent users from accessing other users' data

**How**:
```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own products
CREATE POLICY "Users see own products" ON products
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own products
CREATE POLICY "Users insert own products" ON products
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### Policy 11.6: Memory-First Pattern
**Level**: MUST
**Category**: External Integrations

**What**: Check memory/integrations.supabase first

**Why**: Reuse known patterns, avoid repeating mistakes

**How**:
```bash
Read: ~/.claude/skills/ald-memory/integrations/supabase.json
```

If exists: Use documented patterns, gotchas, API versions
If not: Full discovery workflow, then save to memory

---

### Policy 12.1: Supabase MCP Usage
**Level**: SHOULD
**Category**: MCP Usage Details

**What**: Use Supabase MCP for database operations

**Why**: More reliable than manual queries, better error handling

**How**:
```typescript
// Instead of manual SQL
// ❌ const { data } = await supabase.from('products').select('*');

// Use MCP
// ✅ mcp__supabase__execute_sql({ query: 'SELECT * FROM products' })
// ✅ mcp__supabase__list_tables({ project_id: '...' })
// ✅ mcp__supabase__apply_migration({ name: 'add_products', query: '...' })
```

---

[Policies 1.8, 4.3, 6.2 continue...]

---

**Supabase-Specific Workflow**:

1. **Memory First** (11.6): Check if Supabase integration exists
2. **RLS Always** (4.7): Enable RLS on all tables
3. **Use MCP** (12.1): Prefer MCP over manual queries
4. **Constraints** (1.8): Use database constraints (NOT NULL, UNIQUE)
5. **Auth** (4.3): Use Supabase Auth, not custom
6. **Test Real DB** (6.2): Integration tests with real Supabase instance

**Example Project Setup**:

```typescript
// 1. Check memory (Policy 11.6)
// Read: memory/integrations/supabase.json

// 2. Initialize with proper auth (Policy 4.3)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// 3. Create table with RLS (Policy 4.7)
// Use MCP: mcp__supabase__apply_migration
const migration = `
  CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id), -- Policy 1.8: Constraint
    name TEXT NOT NULL,                               -- Policy 1.8: NOT NULL
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Policy 4.7: Enable RLS
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users see own" ON products
    FOR SELECT USING (auth.uid() = user_id);
`;

// 4. Test with real DB (Policy 6.2)
describe('Products', () => {
  it('RLS prevents unauthorized access', async () => {
    // Test with user A
    const { data: userAProducts } = await supabase
      .from('products')
      .select('*');

    // Should only see user A's products
    expect(userAProducts.every(p => p.user_id === userA.id)).toBe(true);
  });
});
```
```

---

## Example 4: Category Browse - "security"

**Query**:
```
policy-finder:category security
```

**Result**:
```markdown
## 🔍 Category: Security

**File**: `ald-policies/policies/security.md`
**Policies**: 13 total

---

### MUST Policies (11)

**Policy 4.1**: Never Trust User Input
- Validate + sanitize server-side
- Prevent injection attacks

**Policy 4.2**: Parameterized Queries
- Use prepared statements
- Prevent SQL injection

**Policy 4.3**: Proper Authentication
- Use established libraries (Supabase Auth, Auth0, NextAuth)
- Don't roll your own crypto

**Policy 4.4**: Protect Logs
- Never log passwords, tokens, PII
- Redact sensitive data

**Policy 4.5**: Environment Variables
- No hardcoded secrets in code
- Use .env files (never commit)

**Policy 4.6**: Rate Limiting
- Protect public endpoints
- Prevent brute force attacks

**Policy 4.7**: Row-Level Security (RLS)
- Enable on multi-tenant tables
- Database-level access control

**Policy 4.8**: Sanitize HTML
- Use DOMPurify to prevent XSS
- Escape user-generated content

**Policy 4.9**: HTTPS Everywhere
- Enforce in production
- Redirect HTTP → HTTPS

**Policy 4.10**: Least Privilege
- Minimum necessary permissions
- Separate read/write roles

**Policy 4.11**: CSRF Protection
- Protect state-changing operations
- Built-in with Server Actions

---

### SHOULD Policies (2)

**Policy 4.12**: Content Security Policy (CSP)
- CSP headers to prevent XSS
- Whitelist trusted sources

**Policy 4.13**: Secrets Rotation
- Rotate API keys every 90 days
- Automate with tools

---

**Quick Checklist** for any security-sensitive feature:

- [ ] Input validated server-side? (4.1)
- [ ] Using parameterized queries? (4.2)
- [ ] Auth library properly configured? (4.3)
- [ ] Logs don't contain secrets? (4.4)
- [ ] Secrets in environment variables? (4.5)
- [ ] Rate limiting on endpoints? (4.6)
- [ ] RLS enabled on tables? (4.7)
- [ ] HTML sanitized? (4.8)
- [ ] HTTPS enforced? (4.9)
- [ ] Least privilege applied? (4.10)
- [ ] CSRF protection enabled? (4.11)

**Read full details**: `~/.claude/skills/ald-policies/policies/security.md`
```

---

## Example 5: List All Categories

**Query**:
```
policy-finder:list
```

**Result**:
```markdown
## ALD Policies - Complete Overview

**Total**: 155 policies across 17 categories
**Version**: v1.3.1
**Last Updated**: 2025-10-23

---

### 1. Database (13 policies)
**File**: `database.md`
**Focus**: Schema design, queries, migrations, indexes

**Top Policies**:
- 1.1: Explicit Primary Keys (MUST)
- 1.2: Index All Foreign Keys (MUST)
- 1.7: Avoid N+1 Queries (MUST)

**Read**: `~/.claude/skills/ald-policies/policies/database.md`

---

### 2. UI/UX (14 policies)
**File**: `ui-ux.md`
**Focus**: Components, accessibility, responsive design

**Top Policies**:
- 2.3: Accessibility Mandatory (MUST)
- 2.5: Loading/Error States (MUST)
- 2.9: Error Boundaries Required (MUST)

**Read**: `~/.claude/skills/ald-policies/policies/ui-ux.md`

---

### 3. Code Quality (17 policies)
**File**: `code-quality.md`
**Focus**: TypeScript, DRY, naming, documentation

**Top Policies**:
- 3.1: Strict TypeScript Mode (MUST)
- 3.6: Error Handling Mandatory (MUST)
- 3.17: Policy Documentation (MUST) ⭐ NEW

**Read**: `~/.claude/skills/ald-policies/policies/code-quality.md`

---

### 4. Security (13 policies)
**File**: `security.md`
**Focus**: Input validation, auth, RLS, XSS/CSRF

**Top Policies**:
- 4.1: Never Trust User Input (MUST)
- 4.7: Row-Level Security (MUST)
- 4.11: CSRF Protection (MUST)

**Read**: `~/.claude/skills/ald-policies/policies/security.md`

---

[Categories 5-17 continue...]

---

**How to Navigate**:

1. **Start here**: Understand available categories
2. **Pick relevant**: Choose categories for your task
3. **Dive deep**: Use `policy-finder:category [name]` for details
4. **Implement**: Apply policies from chosen categories

**Quick Filters**:
- Database work? → Categories 1, 4 (Database, Security)
- UI work? → Categories 2, 14, 15 (UI/UX, State, Data Fetching)
- API work? → Categories 4, 5, 6 (Security, API Design, Testing)
- Forms? → Categories 2, 17 (UI/UX, Forms & Validation)
- Uploads? → Categories 16, 4 (File Uploads, Security)
```

---

## Example 6: Multiple Keyword Search

**Use Case**: Need policies for error handling

**Query 1**:
```
policy-finder:search error
```

**Result**: 9 policies
- 2.9: Error Boundaries (UI)
- 3.6: Error Handling Mandatory (Code Quality)
- 13.1-13.6: Error Recovery policies
- 17.3: Error Message Patterns (Forms)

**Query 2** (refine):
```
policy-finder:search recovery
```

**Result**: 6 policies (Error Recovery category)
- 13.1: Retry with Exponential Backoff
- 13.2: Fallback Mechanisms
- 13.3: Circuit Breaker Pattern
- 13.4: Timeout All External Calls
- 13.5: Error Boundaries for Crashes
- 13.6: Graceful Degradation

**Combined Strategy**:
Use both searches to get:
1. General error handling (3.6)
2. UI error boundaries (2.9, 13.5)
3. Network error recovery (13.1-13.4)
4. User-facing error messages (17.3)

---

## Example 7: Scenario + Technology Combination

**Use Case**: Building a Supabase API endpoint

**Step 1**: Get scenario checklist
```
policy-finder:scenario create_api_endpoint
```
→ Returns 7 policies (general API creation)

**Step 2**: Get technology-specific policies
```
policy-finder:tech supabase
```
→ Returns 6 policies (Supabase-specific)

**Step 3**: Combine (remove duplicates)

**Final List** (11 unique policies):
- 4.1: Server-side validation
- 4.7: Enable RLS ⭐ (Supabase-specific)
- 5.1: RESTful naming
- 5.2: HTTP status codes
- 5.9: Zod validation
- 6.2: Integration tests
- 9.3: Logging
- 11.6: Memory-first pattern ⭐ (Supabase-specific)
- 12.1: Use Supabase MCP ⭐ (Supabase-specific)
- 1.8: Database constraints ⭐ (Supabase-specific)
- 4.3: Supabase Auth ⭐ (Supabase-specific)

**Result**: Complete checklist combining generic + technology-specific policies

---

## Example 8: Learning Path

**Use Case**: New developer wants to learn the policy system

**Day 1: Overview**
```
policy-finder:list
```
→ Get familiar with 17 categories

**Day 2: Core Categories**
```
policy-finder:category code_quality
policy-finder:category security
```
→ Learn the most critical policies

**Day 3: Scenario-Based Learning**
```
policy-finder:scenario create_api_endpoint
policy-finder:scenario database_migration
policy-finder:scenario create_form
```
→ Understand policies in context

**Day 4: Technology Deep-Dive**
```
policy-finder:tech nextjs
policy-finder:tech supabase
policy-finder:tech react-query
```
→ Learn stack-specific best practices

**Day 5: Keyword Exploration**
```
policy-finder:search validation
policy-finder:search testing
policy-finder:search performance
```
→ Discover related policies

---

## Example 9: Pre-Flight Check Integration

**Scenario**: Creating a product upload feature

**Before** (manual):
```
🚀 PRE-FLIGHT CHECK

- [ ] 3. Identify policies
      Which categories? 🤔
      Database? Maybe...
      UI? Probably...
      Security? Definitely...
      [Spends 5 minutes guessing]
```

**After** (automatic):
```
🚀 PRE-FLIGHT CHECK

- [⚙️] 3. Identify policies

      🔍 Auto-analyzing task: "product upload feature"

      Keywords detected: ["upload", "product", "form", "validation"]

      policy-finder:search upload
      → 5 policies (File Uploads category)

      policy-finder:search form
      → 7 policies (Forms & Validation category)

      policy-finder:scenario file_upload
      → Complete checklist with 7 steps

      ✅ Found 12 unique policies:

      **File Uploads** (5):
      - 16.1: Size limits
      - 16.2: Image optimization
      - 16.3: Progress tracking
      - 16.4: Chunked uploads
      - 16.5: File type validation

      **Forms** (7):
      - 17.1: Client + server validation
      - 17.2: React Hook Form
      - 17.3: Error messages
      - 17.4: Validate on blur
      - 17.5: Form state tracking
      - 17.6: Submit handling
      - 17.7: Accessibility

      📖 Loading files:
      - file-uploads.md
      - forms-validation.md
      - security.md

- [✅] 3. Policies loaded (12 policies in 3 files)
```

**Time saved**: 4 minutes
**Accuracy**: 100% (no missed policies)

---

## Example 10: Complex Feature Planning

**Use Case**: Implementing complete e-commerce checkout

**Step 1**: Break down feature
```
Checkout includes:
- Shopping cart (state management)
- Product list (data fetching)
- Payment form (forms + validation)
- Payment processing (external integration - Stripe)
- Order confirmation (database + email)
```

**Step 2**: Search for each component

```bash
# Cart
policy-finder:search state
policy-finder:tech react-query

# Product list
policy-finder:search fetching
policy-finder:scenario data_fetching

# Payment form
policy-finder:scenario create_form
policy-finder:search validation

# Stripe integration
policy-finder:tech stripe
policy-finder:scenario external_integration

# Database
policy-finder:scenario database_migration
policy-finder:category database
```

**Step 3**: Aggregate results

**Total**: 45 unique policies across 8 categories
- Database: 8 policies
- Security: 10 policies
- Forms: 7 policies
- State Management: 7 policies
- Data Fetching: 6 policies
- External Integrations: 7 policies

**Step 4**: Create implementation plan

```markdown
## Checkout Implementation Plan

### Phase 1: Database Schema (8 policies)
- 1.1: Explicit PKs on orders, order_items
- 1.2: Index foreign keys (user_id, product_id)
- 1.8: Constraints (NOT NULL, CHECK price > 0)
...

### Phase 2: State Management (7 policies)
- 14.1: Server state via React Query
- 14.3: Cart state in Zustand
- 14.7: Persist cart to localStorage
...

### Phase 3: Payment Form (7 policies)
- 17.1: Client + server validation
- 17.2: Use React Hook Form
- 17.7: Accessible error announcements
...

### Phase 4: Stripe Integration (7 policies)
- 11.6: Check memory/integrations.stripe first
- 11.7: Use official Stripe SDK
- 11.10: Handle webhooks, idempotency
...

### Phase 5: Testing & Validation (6 policies)
- 6.2: Integration tests with test Stripe account
- 6.3: E2E test: complete purchase flow
...
```

**Result**: Comprehensive plan with all policies mapped to implementation phases

---

## Quick Reference Card

### Most Common Searches

```bash
# Starting a feature
policy-finder:scenario [task_name]

# Technology setup
policy-finder:tech [tech_name]

# Concept exploration
policy-finder:search [keyword]

# Category deep-dive
policy-finder:category [category]

# System overview
policy-finder:list
```

### Search Decision Tree

```
Do you know the exact task?
├─ YES → policy-finder:scenario [task]
└─ NO ↓

Do you know the technology?
├─ YES → policy-finder:tech [tech]
└─ NO ↓

Do you know a keyword?
├─ YES → policy-finder:search [keyword]
└─ NO ↓

Want to browse?
└─ YES → policy-finder:list
```

### Common Combinations

```bash
# Full API endpoint
policy-finder:scenario create_api_endpoint
+ policy-finder:tech supabase

# Full form
policy-finder:scenario create_form
+ policy-finder:search validation

# Full feature
policy-finder:scenario [main_task]
+ policy-finder:tech [tech1]
+ policy-finder:tech [tech2]
+ policy-finder:search [concept]
```

---

## Troubleshooting

### "No policies found"

**Try**:
1. Broader keyword: "auth" → "security"
2. Related scenario: "login" → "authentication"
3. Full category: `policy-finder:category security`
4. List all: `policy-finder:list`

### "Too many results"

**Refine**:
1. Use scenario instead of keyword
2. Add technology filter
3. Focus on MUST level only

### "Not sure which search type"

**Default order**:
1. Try scenario (most specific)
2. Try technology (project context)
3. Try keyword (broad concept)
4. Browse category (learning)

---

**Version**: 1.0.0
**Last Updated**: 2025-10-23
**Examples**: 25+ with full walkthroughs
