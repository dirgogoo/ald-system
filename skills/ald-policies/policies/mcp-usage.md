# MCP Usage Details

**Category 12 - MCP Usage Details**

**4 policies** for using Model Context Protocol (MCP) tools effectively inside Claude.

---

## Philosophy

MCPs are **Claude's power tools**. They provide structured, reliable interfaces to external services (Supabase, Chrome DevTools, etc). These policies ensure MCPs are used correctly, efficiently, and with proper error handling.

**Key principle**: MCPs are for CLAUDE to use (not for implementing in user's code).

---

## Policy 12.1: Supabase MCP

**Level**: MUST

**Rule**: ALWAYS use Supabase MCP for database operations. NEVER mock data without explicit permission.

### Available Calls

```typescript
// Project Management
mcp__supabase__list_projects()
mcp__supabase__get_project({ id: "project-id" })

// Schema Inspection
mcp__supabase__list_tables({ project_id, schemas: ["public"] })
mcp__supabase__list_extensions({ project_id })
mcp__supabase__list_migrations({ project_id })

// Data Operations
mcp__supabase__execute_sql({
  project_id,
  query: "SELECT id, name FROM users LIMIT 10"
})

// Schema Changes
mcp__supabase__apply_migration({
  project_id,
  name: "add_users_table",
  query: "CREATE TABLE users (...)"
})

// Type Generation
mcp__supabase__generate_typescript_types({ project_id })
// Returns: TypeScript types for all tables

// Validation & Optimization
mcp__supabase__get_advisors({
  project_id,
  type: "security" // or "performance"
})
// Returns: Security vulnerabilities, missing RLS, slow queries

// Edge Functions
mcp__supabase__list_edge_functions({ project_id })
mcp__supabase__get_edge_function({ project_id, function_slug })
mcp__supabase__deploy_edge_function({
  project_id,
  name: "hello-world",
  files: [{ name: "index.ts", content: "..." }]
})

// Logs & Debugging
mcp__supabase__get_logs({
  project_id,
  service: "api" | "postgres" | "edge-function" | "auth" | "storage" | "realtime"
})

// Documentation
mcp__supabase__search_docs({
  graphql_query: `{ searchDocs(query: "RLS") { nodes { title href content } } }`
})
```

### Workflow: Database Changes

**Step 1**: Verify project
```typescript
const projects = await mcp__supabase__list_projects();
const projectId = projects.find(p => p.name === "marketplace").id;
```

**Step 2**: Inspect current schema
```typescript
const tables = await mcp__supabase__list_tables({
  project_id: projectId,
  schemas: ["public"]
});
```

**Step 3**: Apply migration (DDL)
```typescript
await mcp__supabase__apply_migration({
  project_id: projectId,
  name: "add_products_table",
  query: `
    CREATE TABLE products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      seller_id UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_products_seller_id ON products(seller_id);
  `
});
```

**Step 4**: Run advisors (MANDATORY)
```typescript
// Security check
const securityIssues = await mcp__supabase__get_advisors({
  project_id: projectId,
  type: "security"
});

if (securityIssues.length > 0) {
  console.error('🚨 Security issues found:', securityIssues);
  // Fix issues before proceeding
}

// Performance check
const perfIssues = await mcp__supabase__get_advisors({
  project_id: projectId,
  type: "performance"
});

if (perfIssues.length > 0) {
  console.warn('⚠️ Performance issues:', perfIssues);
  // Address sequential scans, missing indexes, etc
}
```

**Step 5**: Generate types
```typescript
const types = await mcp__supabase__generate_typescript_types({
  project_id: projectId
});

// Save to project: types/database.ts
```

### Anti-Patterns

❌ **Mocking data without permission**
```typescript
// ❌ BAD
const mockUsers = [{ id: 1, name: "Test User" }];
```

❌ **Skipping advisors after schema changes**
```typescript
// ❌ BAD
await apply_migration(...);
// Not checking get_advisors - may miss RLS policies!
```

❌ **Manual SQL without MCP**
```typescript
// ❌ BAD (when MCP is available)
const result = await fetch('https://project.supabase.co/rest/v1/users');
```

✅ **Correct usage**
```typescript
// ✅ GOOD
const result = await mcp__supabase__execute_sql({
  project_id,
  query: "SELECT * FROM users WHERE role = 'seller' LIMIT 10"
});
```

### Edge Function Deployment

```typescript
// Deploy Edge Function
await mcp__supabase__deploy_edge_function({
  project_id: projectId,
  name: "process-payment",
  entrypoint_path: "index.ts",
  files: [
    {
      name: "index.ts",
      content: `
        import "jsr:@supabase/functions-js/edge-runtime.d.ts";

        Deno.serve(async (req: Request) => {
          const { amount, customer_id } = await req.json();

          // Process payment logic

          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        });
      `
    }
  ]
});
```

---

## Policy 12.2: Chrome DevTools MCP

**Level**: MUST

**Rule**: ALWAYS validate UI as end-user after ANY UI changes. Use Chrome DevTools MCP for comprehensive validation.

### Validation Checklist (MANDATORY)

Every UI change MUST pass this checklist:

```markdown
□ 1. Page Structure
    mcp__chrome-devtools__take_snapshot({ verbose: false })
    → Verify: Elements present, hierarchy correct

□ 2. Console Errors
    mcp__chrome-devtools__list_console_messages({
      types: ["error"],
      includePreservedMessages: false
    })
    → Requirement: ZERO critical errors

□ 3. Network Requests
    mcp__chrome-devtools__list_network_requests({
      resourceTypes: ["fetch", "xhr"],
      includePreservedRequests: false
    })
    → Verify: All requests 200/201, payloads correct

□ 4. User Interaction Flow
    mcp__chrome-devtools__click({ uid: "button-123" })
    mcp__chrome-devtools__fill({ uid: "input-email", value: "test@example.com" })
    mcp__chrome-devtools__wait_for({ text: "Success", timeout: 5000 })
    → Test: Real user flow works end-to-end

□ 5. Visual Evidence
    mcp__chrome-devtools__take_screenshot({ filePath: "evidence/test.png" })
    → Capture: Visual proof of success

□ 6. Performance
    mcp__chrome-devtools__performance_start_trace({ reload: true, autoStop: true })
    → Verify: LCP < 2.5s, FID < 100ms, CLS < 0.1
```

### Available Calls

```typescript
// Page Management
mcp__chrome-devtools__list_pages()
mcp__chrome-devtools__select_page({ pageIdx: 0 })
mcp__chrome-devtools__new_page({ url: "http://localhost:3000" })
mcp__chrome-devtools__close_page({ pageIdx: 1 })
mcp__chrome-devtools__navigate_page({ url: "http://localhost:3000/products" })

// Page Inspection
mcp__chrome-devtools__take_snapshot({ verbose: false })
// Returns: Accessible tree of page elements with UIDs

// Interaction
mcp__chrome-devtools__click({ uid: "123", dblClick: false })
mcp__chrome-devtools__fill({ uid: "456", value: "test@example.com" })
mcp__chrome-devtools__hover({ uid: "789" })
mcp__chrome-devtools__wait_for({ text: "Loading complete", timeout: 5000 })

// Forms
mcp__chrome-devtools__fill_form({
  elements: [
    { uid: "email", value: "user@example.com" },
    { uid: "password", value: "securePass123" }
  ]
})

// File Upload
mcp__chrome-devtools__upload_file({
  uid: "file-input",
  filePath: "/path/to/image.jpg"
})

// Console
mcp__chrome-devtools__list_console_messages({
  types: ["error", "warn"],
  pageIdx: 0,
  pageSize: 50
})
mcp__chrome-devtools__get_console_message({ msgid: 123 })

// Network
mcp__chrome-devtools__list_network_requests({
  resourceTypes: ["fetch", "xhr", "document"],
  pageIdx: 0,
  pageSize: 50
})
mcp__chrome-devtools__get_network_request({ reqid: 456 })

// Screenshots
mcp__chrome-devtools__take_screenshot({
  format: "png",
  quality: 90,
  fullPage: true,
  filePath: "evidence/feature-x.png"
})

// Performance
mcp__chrome-devtools__performance_start_trace({
  reload: true,
  autoStop: true
})
mcp__chrome-devtools__performance_stop_trace()
mcp__chrome-devtools__performance_analyze_insight({ insightName: "LCPBreakdown" })

// Dialogs
mcp__chrome-devtools__handle_dialog({
  action: "accept",
  promptText: "Optional text for prompt()"
})
```

### Workflow: E2E UI Validation

**Scenario**: Validate "Add Product" feature

```typescript
// Step 1: Navigate
await mcp__chrome-devtools__navigate_page({
  url: "http://localhost:3000/dashboard/seller/products/new"
});

// Step 2: Take snapshot (verify structure)
const snapshot = await mcp__chrome-devtools__take_snapshot({ verbose: false });
// Check: form fields present?

// Step 3: Fill form
await mcp__chrome-devtools__fill_form({
  elements: [
    { uid: "input-name", value: "Industrial Gear" },
    { uid: "input-price", value: "299.99" },
    { uid: "textarea-description", value: "High-quality gear for industrial use" }
  ]
});

// Step 4: Upload image
await mcp__chrome-devtools__upload_file({
  uid: "input-image",
  filePath: "/path/to/product-image.jpg"
});

// Step 5: Submit
await mcp__chrome-devtools__click({ uid: "button-submit" });

// Step 6: Wait for success
await mcp__chrome-devtools__wait_for({
  text: "Product created successfully",
  timeout: 5000
});

// Step 7: Check console (MUST be clean)
const consoleErrors = await mcp__chrome-devtools__list_console_messages({
  types: ["error"]
});

if (consoleErrors.totalCount > 0) {
  console.error('❌ CRITICAL: Console errors detected');
  // STOP, REPORT, INSTRUCTOR fixes
  throw new Error('Console validation failed');
}

// Step 8: Check network
const networkRequests = await mcp__chrome-devtools__list_network_requests({
  resourceTypes: ["fetch"]
});

const failedRequests = networkRequests.nodes.filter(r => r.status >= 400);
if (failedRequests.length > 0) {
  console.error('❌ CRITICAL: Network requests failed', failedRequests);
  throw new Error('Network validation failed');
}

// Step 9: Take screenshot (evidence)
await mcp__chrome-devtools__take_screenshot({
  filePath: "evidence/add-product-success.png"
});

// Step 10: Performance trace
const trace = await mcp__chrome-devtools__performance_start_trace({
  reload: false,
  autoStop: true
});
// Verify: LCP < 2.5s
```

### Error Handling Protocol

**When error detected**:

```
1. STOP execution immediately
2. REPORT error with full context:
   - Console messages
   - Network failures
   - Screenshots
   - Page snapshot
3. Send to INSTRUCTOR for diagnosis
4. EXECUTOR applies fix
5. TESTER re-validates (from step 1)
6. LOOP until ALL checks pass
```

**NEVER**:
- Skip validation because "it probably works"
- Accept warnings as "good enough"
- Continue with errors present

---

## Policy 12.3: Git MCP

**Level**: SHOULD (when available)

**Rule**: Prefer Git MCP over manual git commands. Always prefer EDITING existing files over CREATING new ones.

### Available Calls (if MCP exists)

```typescript
// Review Changes
mcp__git__diff()
// Returns: Diff of all changed files

// Apply Fixes
mcp__git__apply_patch({ patch: "..." })
// Applies patch to working directory

// Commit
mcp__git__commit({
  message: "feat: Add product filtering\n\nImplemented category and price filters...",
  files: ["app/products/page.tsx", "lib/filters.ts"]
})

// Pull Request
mcp__git__open_pr({
  title: "Add product filtering",
  body: "## Summary\n- Category filter\n- Price range filter\n\n## Test plan\n...",
  base: "main",
  head: "feature/product-filters"
})
```

### Workflow: Creating PR

```typescript
// 1. Review changes
const diff = await mcp__git__diff();
console.log('Files changed:', diff.files);

// 2. Commit
await mcp__git__commit({
  message: `feat: Add seller dashboard

Implemented seller product management:
- List products
- Add/edit/delete products
- Upload product images

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>`,
  files: [
    "app/dashboard/seller/page.tsx",
    "app/dashboard/seller/products/new/page.tsx",
    "components/ProductForm.tsx"
  ]
});

// 3. Open PR
await mcp__git__open_pr({
  title: "Add seller dashboard",
  body: `## Summary
- Seller can manage products (CRUD)
- Image upload via Supabase Storage
- RLS policies for seller isolation

## Test plan
✅ Seller can create product
✅ Seller can edit own products
✅ Seller cannot edit other sellers' products
✅ Images upload successfully

🤖 Generated with Claude Code`,
  base: "main",
  head: "feature/seller-dashboard"
});
```

### Golden Rule

**Prefer EDIT over CREATE**:

```typescript
// ✅ GOOD: Edit existing file
Edit: app/products/page.tsx
// Add new feature to existing component

// ❌ BAD: Create duplicate
Write: app/products/page-new.tsx
// Creates confusion, duplicates code
```

---

## Policy 12.4: Vercel MCP

**Level**: SHOULD (when available)

**Rule**: Use Vercel MCP for deployment management and automation when manual Vercel actions are needed.

### Available Calls (if MCP exists)

```typescript
// Project Management
mcp__vercel__list_projects()
mcp__vercel__get_project({ id: "prj_..." })

// Deployment
mcp__vercel__deploy({
  project_id: "prj_...",
  branch: "main"
})
mcp__vercel__get_deploy_status({ deployment_id: "dpl_..." })

// Logs
mcp__vercel__list_logs({
  project_id: "prj_...",
  deployment_id: "dpl_..."
})

// Cron Jobs
mcp__vercel__create_cron({
  project_id: "prj_...",
  path: "/api/cron/daily-cleanup",
  schedule: "0 0 * * *" // Daily at midnight
})
```

### Use Cases

**1. Deploy Specific Branch**
```typescript
// Deploy feature branch for preview
const deployment = await mcp__vercel__deploy({
  project_id: "prj_marketplace",
  branch: "feature/seller-dashboard"
});

console.log('Preview URL:', deployment.url);
```

**2. Monitor Deployment**
```typescript
// Check if deployment succeeded
const status = await mcp__vercel__get_deploy_status({
  deployment_id: "dpl_..."
});

if (status.state === "ERROR") {
  const logs = await mcp__vercel__list_logs({
    deployment_id: "dpl_..."
  });
  console.error('Deployment failed:', logs);
}
```

**3. Schedule Background Jobs**
```typescript
// Create cron for daily tasks
await mcp__vercel__create_cron({
  project_id: "prj_marketplace",
  path: "/api/cron/send-reminders",
  schedule: "0 9 * * *" // Daily at 9 AM
});
```

---

## Quick Reference

| Task | MCP to Use | Policy |
|------|-----------|--------|
| Database query | `mcp__supabase__execute_sql` | 12.1 |
| Schema migration | `mcp__supabase__apply_migration` | 12.1 |
| Security check | `mcp__supabase__get_advisors` | 12.1 (MANDATORY after schema changes) |
| UI validation | `mcp__chrome-devtools__take_snapshot` | 12.2 (MANDATORY after UI changes) |
| Console check | `mcp__chrome-devtools__list_console_messages` | 12.2 (ZERO errors required) |
| Network check | `mcp__chrome-devtools__list_network_requests` | 12.2 |
| User flow test | `mcp__chrome-devtools__click/fill/wait_for` | 12.2 |
| Git commit | `mcp__git__commit` (if available) | 12.3 |
| Create PR | `mcp__git__open_pr` (if available) | 12.3 |
| Deploy | `mcp__vercel__deploy` (if available) | 12.4 |

---

## Integration with ALD System

- **ald-tester**: Uses Chrome DevTools MCP (Policy 12.2) for E2E validation
- **ald-orchestrator**: May trigger Supabase advisors (Policy 12.1) after migrations
- **ald-curator**: Tracks MCP usage patterns for optimization

---

## Summary

**4 MCP Policies:**
- 12.1: Supabase MCP (database operations, advisors, edge functions)
- 12.2: Chrome DevTools MCP (UI validation, console, network, performance)
- 12.3: Git MCP (commits, PRs - prefer edit over create)
- 12.4: Vercel MCP (deploys, logs, cron jobs)

**Key Principles**:
- MCPs are for CLAUDE to use (not user's code)
- ALWAYS validate after changes (12.2)
- NEVER skip advisors after schema changes (12.1)
- PREFER editing existing files (12.3)

---

**Last Updated**: 2025-10-23
**Category**: 12 - MCP Usage Details
**Total Policies**: 4
