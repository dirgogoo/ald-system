# External Integrations Policies

**Category 11 - External Integrations**

**11 policies** for integrating external services, APIs, and tools.

---

## Philosophy

External integrations are a critical part of modern web development. These policies ensure:
- **MCPs are used** when available (for Claude's tools)
- **Memory is checked** before reimplementing (avoid duplicate work)
- **Documentation is followed** (not improvised)
- **Patterns are saved** for reuse

---

## Policy Groups

### A) MCP Usage (for Claude's Tools) - 5 policies
### B) External API Implementation (for Program Code) - 6 policies

---

## A) MCP USAGE (For Claude's Tools)

These policies apply when **Claude** needs to use a tool or service (not implementing in user's code).

### Policy 11.1: MCP-First for Claude Tools

**Level**: MUST

**Rule**: Before making HTTP requests manually, ALWAYS check if an MCP exists for that service.

**Rationale**: MCPs provide better error handling, type safety, and are optimized for Claude's workflow.

**Implementation**:

```typescript
// ❌ BAD: Manual HTTP request
const response = await fetch('https://supabase.com/docs/api/search?q=RLS');
const data = await response.json();

// ✅ GOOD: Use MCP
const docs = await mcp__supabase__search_docs({
  graphql_query: `{ searchDocs(query: "RLS") { nodes { title href content } } }`
});
```

**Available MCPs** (as of 2025-10-23):
- `mcp__supabase__*` - Supabase docs, projects, migrations, SQL
- `mcp__chrome-devtools__*` - Browser automation, testing, screenshots

---

### Policy 11.2: List Available MCPs

**Level**: SHOULD

**Rule**: When starting an integration task, list available MCPs to identify opportunities.

**Implementation**:

```markdown
🔌 Integration Check: Supabase

Available MCPs for Supabase:
- mcp__supabase__search_docs (documentation lookup)
- mcp__supabase__list_projects (project management)
- mcp__supabase__execute_sql (database queries)
- mcp__supabase__get_advisors (security/performance checks)

Decision: Use mcp__supabase__search_docs to fetch auth docs
```

**How to list**: Check tool descriptions that start with `mcp__[service]__*`

---

### Policy 11.3: MCP Priority Order

**Level**: SHOULD

**Rule**: When multiple options exist, follow this priority order for Claude's tools:

```
1st: MCP (if available)
2nd: SDK (official library)
3rd: HTTP requests (direct fetch)
```

**Example**:

```typescript
// Scenario: Fetch Supabase documentation

// 1st Choice: MCP ✅
await mcp__supabase__search_docs({ query: "authentication" });

// 2nd Choice: SDK (if MCP doesn't exist)
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);

// 3rd Choice: HTTP (last resort)
await fetch('https://api.supabase.com/docs');
```

---

### Policy 11.4: Document MCP Absence

**Level**: MAY

**Rule**: If an MCP doesn't exist for a frequently-used service (≥3 times), document it in curator feedback.

**Implementation**:

```json
// In ~/.claude/skills/ald-curator/feedback.json
{
  "feedback": [
    {
      "date": "2025-10-23",
      "note": "Used Stripe API 3+ times via HTTP. Opportunity: Create mcp__stripe MCP",
      "tags": ["mcp-opportunity", "stripe", "integration"],
      "action": "Consider building Stripe MCP for future efficiency"
    }
  ]
}
```

**Purpose**: Help identify opportunities for creating new MCPs.

---

### Policy 11.5: MCP Best Practices

**Level**: MUST

**Rule**: When using MCPs, follow these practices:

1. **Validate Parameters**: Check required params before calling
2. **Handle Errors**: MCPs can fail (network, permissions, etc)
3. **Read Tool Descriptions**: Don't assume MCP capabilities
4. **Check Return Format**: Parse response correctly

**Example**:

```typescript
// ❌ BAD: No error handling, assumed params
const result = await mcp__supabase__execute_sql({ query: "SELECT *" });
console.log(result.data);

// ✅ GOOD: Validated params, error handling
try {
  const result = await mcp__supabase__execute_sql({
    project_id: "abc123", // Required param
    query: "SELECT id, email FROM users LIMIT 10" // Specific columns
  });

  if (result.error) {
    console.error('SQL execution failed:', result.error);
    return;
  }

  console.log('Query results:', result.data);
} catch (error) {
  console.error('MCP call failed:', error);
}
```

---

## B) EXTERNAL API IMPLEMENTATION (For Program Code)

These policies apply when **implementing integrations** in the user's codebase (not Claude's tools).

### Policy 11.6: Memory-First Pattern ⭐

**Level**: MUST

**Rule**: Before implementing any external API, ALWAYS check if it was already integrated in this project.

**Implementation**:

**Step 1**: Read project memory
```bash
Read: ~/.claude/skills/ald-memory/memory/projects/[project-name].json
```

**Step 2**: Check `integrations` section
```json
{
  "integrations": {
    "supabase": {
      "version": "@supabase/supabase-js v2.39.0",
      "features_used": ["auth", "database"],
      "gotchas": [
        "RLS policies required for multi-tenant",
        "Session check needed in Server Components"
      ]
    }
  }
}
```

**Step 3**: Reuse patterns if exists
- Use same SDK version
- Follow documented gotchas
- Check features_used (avoid duplicate work)

**Step 4**: If doesn't exist, follow full workflow (policies 11.7-11.11)

**Example**:

```markdown
🔌 Integration Check: Supabase Auth

Memory Check:
✅ Found: integrations.supabase
   - Version: @supabase/supabase-js v2.39.0
   - Gotchas: RLS required, Session check in Server Components

Decision: Reuse existing patterns, follow gotchas
```

---

### Policy 11.7: SDK over HTTP

**Level**: MUST

**Rule**: Always use official SDK when available. Never implement HTTP requests manually if SDK exists.

**Rationale**: SDKs provide type safety, error handling, retries, and follow API best practices.

**Implementation**:

```typescript
// ❌ BAD: Manual HTTP requests
const createUser = async (email: string, password: string) => {
  const response = await fetch('https://[project].supabase.co/auth/v1/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ email, password })
  });

  return response.json();
};

// ✅ GOOD: Official SDK
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const createUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw error;
  return data;
};
```

**How to find SDK**:
```bash
npm search [service-name]
# Example: npm search stripe
# Result: stripe (official), stripe-js, @stripe/stripe-js
```

---

### Policy 11.8: Documentation-First ⭐

**Level**: MUST

**Rule**: Before implementing ANY external API integration, READ the official documentation for the specific feature.

**Rationale**: Prevents incorrect implementations, security issues, and wasted time.

**Implementation**:

**Step 1**: Find official docs
```typescript
// Use WebSearch or WebFetch
WebSearch: "[service] [feature] documentation"
// Example: "Supabase authentication documentation"
```

**Step 2**: Read relevant section
```typescript
WebFetch: {
  url: "https://supabase.com/docs/guides/auth/auth-email",
  prompt: "How to implement email authentication with sign up and sign in?"
}
```

**Step 3**: Implement exactly as documented
```typescript
// Don't improvise - follow the official example
const { data, error } = await supabase.auth.signUp({
  email: 'example@email.com',
  password: 'example-password',
  options: {
    emailRedirectTo: 'https://example.com/welcome'
  }
});
```

**Step 4**: Adapt to project conventions
```typescript
// Now adapt with project patterns (error handling, types, etc)
```

**Example Flow**:

```markdown
🔌 Integrating Supabase Auth

1. Documentation Search:
   WebSearch: "Supabase email authentication documentation 2025"

2. Fetch Official Docs:
   WebFetch: https://supabase.com/docs/guides/auth/auth-email

3. Read Key Sections:
   - Sign up with email
   - Sign in with email
   - Email verification
   - Session management

4. Implement Following Docs:
   [Copy official example]

5. Adapt to Project:
   - Add TypeScript types
   - Add error handling (project conventions)
   - Add loading states
```

---

### Policy 11.9: Follow User Docs ⭐⭐⭐

**Level**: MUST (MAXIMUM PRIORITY)

**Rule**: If user provides specific documentation, follow it LITERALLY. Do not improvise or assume "better ways".

**Rationale**: User may have internal APIs, custom configurations, or specific requirements that differ from standard docs.

**Implementation**:

```markdown
Scenario 1: User provides URL
───────────────────────────
User: "Integrate our payment API. Follow this doc: https://docs.company.com/api/payment"

Claude:
1. ✅ WebFetch the provided URL
2. ✅ Read entire document
3. ✅ Implement EXACTLY as described
4. ❌ DO NOT improvise
5. ❌ DO NOT assume "standard REST practices"
6. ✅ If unclear, ASK user (don't guess)

Scenario 2: User provides file
───────────────────────────
User: "Follow the integration guide in ./docs/api-integration.md"

Claude:
1. ✅ Read ./docs/api-integration.md
2. ✅ Follow step-by-step
3. ✅ Use exact endpoints, headers, params mentioned
4. ❌ DO NOT skip steps
5. ❌ DO NOT "optimize" without permission

Scenario 3: User provides inline instructions
───────────────────────────
User: "Call POST /api/v2/orders with { items, total, userId } in body"

Claude:
1. ✅ Use EXACT endpoint: POST /api/v2/orders
2. ✅ Use EXACT payload structure: { items, total, userId }
3. ❌ DO NOT add extra fields
4. ❌ DO NOT change to /api/v1 or /api/orders
```

**Example**:

```typescript
// User said: "POST /api/custom/checkout with { cart_id, customer_email }"

// ✅ CORRECT: Follow literally
await fetch('/api/custom/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cart_id: cartId,
    customer_email: email
  })
});

// ❌ WRONG: Improvising
await fetch('/api/checkout', { // Changed endpoint!
  method: 'POST',
  body: JSON.stringify({
    cartId: cartId, // Changed to camelCase!
    email: email, // Changed field name!
    items: cartItems // Added extra field!
  })
});
```

**Golden Rule**: When user provides docs → ZERO improvisation

---

### Policy 11.10: API Integration Checklist

**Level**: MUST

**Rule**: Every external API integration MUST follow this checklist.

**Checklist**:

```markdown
□ 1. Memory-First Check
     ├─ Read memory/projects/[project].json
     ├─ Check integrations.[api_name]
     └─ If exists: Reuse version, gotchas, patterns

□ 2. SDK Availability
     ├─ npm search [api-name]
     ├─ Check official SDK exists
     └─ If yes: Use SDK (don't use fetch)

□ 3. Documentation Research
     ├─ WebSearch: "[service] [feature] documentation"
     ├─ WebFetch: Read official docs
     └─ Understand: authentication, endpoints, payload format

□ 4. User Documentation Priority
     ├─ User provided docs? (URL, file, inline)
     ├─ If YES: FOLLOW LITERALLY (Policy 11.9)
     └─ If NO: Follow official docs (Policy 11.8)

□ 5. Implementation
     ├─ Use SDK (if available)
     ├─ Follow docs exactly
     ├─ Add error handling
     └─ Add TypeScript types

□ 6. Validation
     ├─ Run ald-tester
     ├─ Test success case
     ├─ Test error cases
     └─ Check console (0 errors)

□ 7. Save to Memory
     ├─ Add to integrations section
     ├─ Document gotchas discovered
     ├─ Include SDK version
     └─ Update timestamp
```

**Example Usage**:

```markdown
🔌 Integrating Stripe Checkout

✅ 1. Memory Check: integrations.stripe NOT found
✅ 2. SDK Check: npm search stripe → "stripe" v10.0.0 (official)
✅ 3. Docs Research: WebFetch https://stripe.com/docs/checkout
✅ 4. User Docs: None provided → Using official docs
✅ 5. Implementation: [code using stripe SDK]
✅ 6. Validation: Tests passed, console clean
✅ 7. Saved to Memory: integrations.stripe added
```

---

### Policy 11.11: Save to Memory

**Level**: MUST

**Rule**: After SUCCESSFUL integration, save integration details to project memory for future reuse.

**Implementation**:

**Step 1**: After integration passes validation, update memory

```json
// In: ~/.claude/skills/ald-memory/memory/projects/[project].json

{
  "project_name": "Marketplace Peças Industriais",
  "stack": { ... },
  "integrations": {
    "stripe": {
      "type": "payment",
      "version": "stripe v10.0.0",
      "features_used": ["checkout", "webhooks"],
      "gotchas": [
        "Webhook signatures MUST be verified (stripe.webhooks.constructEvent)",
        "Use idempotency keys for charges to prevent duplicates",
        "Test mode vs Live mode keys (different prefixes)"
      ],
      "docs_reference": "https://stripe.com/docs/api",
      "integrated_at": "2025-10-23"
    },
    "supabase": {
      "type": "backend",
      "version": "@supabase/supabase-js v2.39.0",
      "features_used": ["auth", "database", "storage"],
      "gotchas": [
        "RLS policies required for multi-tenant data isolation",
        "Session check in Server Components (cookies().get('supabase-auth-token'))",
        "Edge functions need explicit CORS headers for browser calls"
      ],
      "docs_reference": "https://supabase.com/docs",
      "integrated_at": "2025-10-23"
    }
  },
  "updated_at": "2025-10-23"
}
```

**Step 2**: Update timestamp

```json
{
  "updated_at": "2025-10-23"
}
```

**What to include**:
- **type**: Category (payment, backend, analytics, email, etc)
- **version**: SDK version used (for compatibility checks)
- **features_used**: List of features implemented
- **gotchas**: Mistakes to avoid (learned during implementation)
- **docs_reference**: Official docs URL
- **integrated_at**: When integration was completed

**Benefits**:
- Next time: Instant context reload (no re-research)
- Version tracking: Know which SDK version works
- Gotchas: Avoid repeating same mistakes
- Features: Know what's already implemented

---

## Quick Reference

### When to Use Each Policy

| Scenario | Policy |
|----------|--------|
| Claude needs to fetch Supabase docs | 11.1 (MCP-First) |
| Starting integration task | 11.2 (List MCPs) |
| Multiple options available | 11.3 (MCP Priority) |
| Service used 3+ times without MCP | 11.4 (Document Absence) |
| Before integrating external API | 11.6 (Memory-First) |
| Choosing SDK vs HTTP | 11.7 (SDK over HTTP) |
| Don't know how API works | 11.8 (Docs-First) |
| User provided specific docs | 11.9 (Follow User Docs) ⭐⭐⭐ |
| Any external API integration | 11.10 (Checklist) |
| Integration successful | 11.11 (Save to Memory) |

---

## Integration with Other ALD Skills

- **ald-memory**: Stores integration patterns (policy 11.11)
- **ald-policies**: These policies (category 11)
- **ald-tester**: Validates integrations work correctly
- **ald-curator**: Learns from integration patterns (MCP opportunities)

---

## Examples

### Example 1: Supabase Auth (Memory-First Pattern)

```markdown
Task: Add user registration with Supabase

🔌 Integration Check:

□ Memory-First:
  Read: memory/projects/marketplace.json
  Found: integrations.supabase ✅

  Reusing:
  - Version: @supabase/supabase-js v2.39.0
  - Gotchas: "RLS policies required", "Session check in Server Components"

□ Implementation:
  [Use existing SDK version + follow gotchas]

□ Validation:
  ✅ Tests passed
  ✅ Console clean

□ Memory Update:
  Updated features_used: ["auth", "database", "storage", "user-registration"] ⭐ NEW
```

### Example 2: New API (Full Workflow)

```markdown
Task: Integrate Stripe checkout

🔌 Integration Check:

□ Memory-First:
  integrations.stripe NOT found ❌
  → Full workflow required

□ SDK Check:
  npm search stripe
  Found: stripe v10.0.0 (official) ✅

□ Docs Research:
  WebSearch: "Stripe checkout session documentation"
  WebFetch: https://stripe.com/docs/checkout/quickstart
  Read: How to create checkout session

□ User Docs:
  None provided → Using official docs

□ Implementation:
  ```typescript
  import Stripe from 'stripe';
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const session = await stripe.checkout.sessions.create({
    line_items: [...],
    mode: 'payment',
    success_url: '...',
    cancel_url: '...'
  });
  ```

□ Validation:
  ✅ Checkout session created
  ✅ Payment succeeded (test mode)
  ✅ Webhook verified

□ Save to Memory:
  Added integrations.stripe with:
  - Version: stripe v10.0.0
  - Features: ["checkout", "webhooks"]
  - Gotchas: ["Verify webhook signatures", "Idempotency keys"]
```

### Example 3: User Provided Docs (Maximum Priority)

```markdown
Task: Integrate company's internal ERP API

User: "Follow this guide: ./docs/erp-integration.md"

🔌 Integration Check:

□ User Docs Provided: YES ⭐⭐⭐
  MAXIMUM PRIORITY: Follow literally

□ Read User Docs:
  Read: ./docs/erp-integration.md

  Instructions found:
  - Endpoint: POST /api/v3/erp/orders
  - Auth: Bearer token in header
  - Payload: { order_items, total_value, customer_id }

□ Implementation (LITERAL):
  ```typescript
  // EXACTLY as user specified
  await fetch('/api/v3/erp/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      order_items: items,
      total_value: total,
      customer_id: customerId
    })
  });
  ```

  ❌ Did NOT change endpoint
  ❌ Did NOT rename fields
  ❌ Did NOT add extra fields
  ✅ Followed user docs LITERALLY

□ Validation:
  ✅ API call succeeded
  ✅ Response matches expected format

□ Save to Memory:
  Added integrations.erp_internal with user docs reference
```

---

## Anti-Patterns

❌ **Implementing API without checking memory first**
❌ **Using fetch() when official SDK exists**
❌ **Improvising API calls without reading docs**
❌ **Ignoring user-provided documentation**
❌ **Not saving successful integration to memory**
❌ **Using HTTP instead of available MCP (for Claude's tools)**
❌ **Assuming API behavior without verification**

---

## Summary

**11 Policies for External Integrations:**

**MCP Usage (Claude's Tools):**
- 11.1: MCP-First (use MCP over HTTP)
- 11.2: List MCPs (identify opportunities)
- 11.3: Priority Order (MCP > SDK > HTTP)
- 11.4: Document Absence (track MCP needs)
- 11.5: Best Practices (params, errors, descriptions)

**API Implementation (Program Code):**
- 11.6: Memory-First (reuse patterns) ⭐
- 11.7: SDK over HTTP (never manual fetch if SDK exists)
- 11.8: Docs-First (read before implement) ⭐
- 11.9: Follow User Docs (LITERAL compliance) ⭐⭐⭐
- 11.10: Integration Checklist (complete workflow)
- 11.11: Save to Memory (document for reuse)

**Key Principle**: Check Memory → Use SDK → Read Docs → Follow Literally → Save Learnings

---

**Last Updated**: 2025-10-23
**Category**: 11 - External Integrations
**Total Policies**: 11 (5 MCP + 6 API Implementation)
