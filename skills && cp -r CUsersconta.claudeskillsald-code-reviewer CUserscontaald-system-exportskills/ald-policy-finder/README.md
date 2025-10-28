# ald-policy-finder

**Intelligent policy search for the ALD system**

## Overview

With **155 policies** across **17 categories**, finding the right policies for your task can be overwhelming. `ald-policy-finder` solves this by providing intelligent search across:

- **Keywords** (e.g., "validation", "upload", "authentication")
- **Scenarios** (e.g., "create_api_endpoint", "database_migration")
- **Technologies** (e.g., "supabase", "nextjs", "react-query")
- **Categories** (e.g., "security", "database", "ui_ux")

## The Problem

**Before ald-policy-finder**:
```
🤔 "I need to create an API endpoint. Which of the 155 policies apply?"

Options:
1. Read all 17 policy files manually
2. Guess which categories might be relevant
3. Miss important policies and make mistakes
```

**After ald-policy-finder**:
```
✅ "policy-finder:scenario create_api_endpoint"

Found 7 relevant policies automatically:
- Policy 4.1: Server-side validation (MUST)
- Policy 5.1: RESTful naming (MUST)
- Policy 5.2: HTTP status codes (MUST)
... ready to implement!
```

## Installation

Already installed! Located at:
```
~/.claude/skills/ald-policy-finder/
```

## Quick Start

### 1. Search by Keyword

Find policies related to a specific concept:

```
policy-finder:search validation
```

**Returns**: All policies related to validation (input validation, form validation, etc.)

### 2. Search by Scenario

Get a complete checklist for a common task:

```
policy-finder:scenario create_form
```

**Returns**: Step-by-step policy checklist for creating forms

### 3. Search by Technology

Find policies specific to your tech stack:

```
policy-finder:tech supabase
```

**Returns**: All Supabase-specific policies (RLS, MCP usage, etc.)

### 4. Browse by Category

Explore all policies in a category:

```
policy-finder:category security
```

**Returns**: All 13 security policies

### 5. List All Categories

See overview of the entire policy system:

```
policy-finder:list
```

**Returns**: All 17 categories with policy counts

## How It Works

### The Index

All 155 policies are indexed in `policy-index.json`:

```json
{
  "keywords": {
    "validation": {
      "policies": ["4.1", "5.9", "17.1", "17.4"],
      "description": "Input validation, form validation"
    }
  },
  "scenarios": {
    "create_api_endpoint": {
      "policies": ["4.1", "5.1", "5.2", "5.9", "6.2"],
      "steps": ["4.1: Validate input...", "5.1: RESTful naming..."]
    }
  },
  "technologies": {
    "supabase": {
      "policies": ["4.7", "11.6", "12.1"],
      "details": ["4.7: Enable RLS...", "11.6: Memory first..."]
    }
  },
  "categories": {
    "4_security": {
      "policies": ["4.1", "4.2", ..., "4.13"],
      "count": 13
    }
  }
}
```

### Search Flow

```
User Query
    ↓
Identify Search Type (keyword/scenario/tech/category)
    ↓
Lookup in policy-index.json
    ↓
Extract Policy IDs
    ↓
Get Policy Details (title, level, category)
    ↓
Load Full Policy Content from .md files
    ↓
Format & Return Results
```

## Integration with ALD Workflow

### Automatic Invocation (Pre-Flight Check)

The skill is **automatically invoked** during Pre-Flight Check step 3:

```
🚀 PRE-FLIGHT CHECK - Create product upload feature

- [✅] 1. Development task? YES
- [✅] 2. Load ald-memory
- [⚙️] 3. Identify policies...

      🔍 Auto-invoking policy-finder...

      Analyzing task: "product upload"
      Search: keywords=["upload", "form", "validation"]

      ✅ Found 12 relevant policies:

      **File Uploads** (5 policies):
      - 16.1: File size limits (MUST)
      - 16.2: Image optimization (MUST)
      - 16.3: Progress tracking (SHOULD)
      - 16.4: Chunked uploads (SHOULD)
      - 16.5: File type validation (MUST)

      **Forms** (7 policies):
      - 17.1: Client + server validation (MUST)
      - 17.2: Use React Hook Form (SHOULD)
      ...

      **Loading files**:
      - file-uploads.md
      - forms-validation.md
      - security.md

- [✅] 4. Policies loaded & ready
```

### Manual Invocation

Claude can also invoke manually when uncertain:

```
Claude: "I'm not sure which policies apply to this caching strategy.
         Let me check policy-finder:search cache"

Found 3 policies:
- 7.5: Caching Strategies (SHOULD)
- 15.5: Cache Aggressively (SHOULD)
...
```

## Use Cases

### Use Case 1: Starting a New Feature

**Scenario**: User asks to implement user authentication

**Without policy-finder**:
```
Claude: "Let me implement authentication..."
[Implements without checking policies]
[Misses: proper password hashing, rate limiting, audit logs]
```

**With policy-finder**:
```
Claude: "Let me check relevant policies first"
policy-finder:search authentication

Found 5 policies:
- 4.3: Use established auth libraries (MUST)
- 4.6: Rate limiting on auth endpoints (MUST)
- 9.3: Log all auth attempts (MUST)
- 9.6: Audit trail for sensitive ops (MUST)
- 4.13: Rotate secrets every 90 days (SHOULD)

[Implements with all security policies applied]
```

### Use Case 2: Learning the System

**Scenario**: Developer new to the project

```
User: "What policies exist for database work?"

Claude: policy-finder:category database

Database (13 policies):
- Policy 1.1: Explicit Primary Keys (MUST)
- Policy 1.2: Index All Foreign Keys (MUST)
- Policy 1.3: Composite Indexes (SHOULD)
...

User: "Tell me more about Policy 1.2"

Claude: [Reads database.md, extracts Policy 1.2 section]

Policy 1.2: Index All Foreign Keys
**Level**: MUST
**Rationale**: Foreign keys without indexes cause slow joins...
**Implementation**: CREATE INDEX idx_products_category_id ON products(category_id);
...
```

### Use Case 3: Technology-Specific Guidance

**Scenario**: Working with Supabase

```
Claude: "User is working with Supabase. Let me check relevant policies."
policy-finder:tech supabase

Policies for Supabase:
- 4.7: Row-Level Security (MUST) - Enable RLS on all multi-tenant tables
- 11.6: Memory-First Pattern (MUST) - Check memory/integrations.supabase
- 12.1: Supabase MCP Usage (SHOULD) - Use MCP for migrations/queries
- 1.8: Database Constraints (MUST) - NOT NULL, UNIQUE, CHECK
- 4.3: Proper Authentication (MUST) - Use Supabase Auth
- 6.2: Integration Tests (MUST) - Test with real Supabase DB

[Applies all Supabase-specific best practices]
```

### Use Case 4: Complete Task Checklists

**Scenario**: Creating a complex feature

```
User: "Create a file upload system for product images"

Claude: policy-finder:scenario file_upload

Complete checklist for "Implementing File Upload":

**Step 1**: Policy 16.1 - Enforce max file size (5MB for images)
**Step 2**: Policy 16.2 - Optimize images (Next.js Image, sharp, WebP)
**Step 3**: Policy 16.3 - Show progress bar for >1MB files
**Step 4**: Policy 16.4 - Use chunked uploads for >10MB
**Step 5**: Policy 16.5 - Validate MIME type + magic bytes server-side
**Step 6**: Policy 4.1 - Validate file metadata server-side
**Step 7**: Policy 3.17 - Document policies applied in code

[Implements following all 7 steps systematically]
```

## Benefits

### 1. **Speed**
- Find relevant policies in seconds, not minutes
- No need to read all 17 policy files manually

### 2. **Completeness**
- Never miss important policies
- Scenario checklists ensure nothing is forgotten

### 3. **Learning**
- Discover policies you didn't know existed
- Technology-specific guidance for your stack

### 4. **Consistency**
- Same policies found every time
- No variation based on Claude's "memory" of policies

### 5. **Discoverability**
- Browse by keyword, scenario, or technology
- Explore the entire policy system systematically

## Available Searches

### Keywords (40+)

Common keywords indexed:
- `validation`, `upload`, `error`, `authentication`
- `database`, `rls`, `migration`, `index`
- `api`, `security`, `testing`, `performance`
- `accessibility`, `form`, `state`, `fetching`
- `component`, `typescript`, `logging`, `git`
- `sprint`, `integration`, `mcp`, `recovery`
- And more...

### Scenarios (12)

Pre-built task checklists:
- `create_api_endpoint` - REST API creation
- `database_migration` - Schema changes
- `create_form` - Form implementation
- `add_rls_policy` - Row-Level Security
- `file_upload` - File upload feature
- `ui_component` - UI component creation
- `external_integration` - External API integration
- `data_fetching` - Data fetching setup
- `state_management` - State management setup
- `error_handling` - Error handling & recovery
- `start_sprint` - Sprint planning
- `use_mcp` - MCP tool usage

### Technologies (15+)

Tech-specific policies:
- `supabase`, `nextjs`, `react`, `typescript`
- `drizzle`, `prisma`, `react-query`, `zod`
- `react-hook-form`, `tailwind`, `stripe`
- `vercel`, `sentry`, `chrome-devtools-mcp`, `git-mcp`

### Categories (17)

All policy categories:
- `database`, `ui_ux`, `code_quality`, `security`
- `api_design`, `testing`, `performance`, `git_cicd`
- `logging_monitoring`, `sprint_management`
- `external_integrations`, `mcp_usage`, `error_recovery`
- `state_management`, `data_fetching`, `file_uploads`, `forms_validation`

## Search Tips

### Tip 1: Start Broad, Then Narrow

```
1. policy-finder:list             # See all categories
2. policy-finder:category security # Explore security
3. policy-finder:search validation # Find specific policies
```

### Tip 2: Use Scenarios for Common Tasks

Instead of piecing together individual policies, use scenarios:
```
policy-finder:scenario create_api_endpoint
```
Gets you a complete, ordered checklist.

### Tip 3: Combine with Technology

```
"I'm creating a Supabase API endpoint"

1. policy-finder:scenario create_api_endpoint
2. policy-finder:tech supabase

Combine results for complete coverage.
```

### Tip 4: Search Multiple Keywords

```
policy-finder:search error
→ Error handling, error boundaries, error recovery

policy-finder:search upload
→ File uploads, validation, optimization
```

## File Structure

```
ald-policy-finder/
├── SKILL.md                    # Skill definition & main prompt
├── README.md                   # This file
├── policy-index.json           # Complete index (155 policies)
└── examples/
    └── search-examples.md      # Detailed usage examples
```

## Index Maintenance

The `policy-index.json` is automatically maintained when:
- New policies are added (curator promotes patterns)
- Policies are updated (version changes)
- Categories are reorganized

**Current version**: v1.0.0 (2025-10-23)
**Policies indexed**: 155
**Categories**: 17

## Performance

- **Index size**: ~25KB (loads instantly)
- **Search time**: <100ms (in-memory lookup)
- **Full policy load**: 1-3 seconds (reads .md files)

The index is optimized for:
- Fast keyword lookups
- Scenario-based batch loading
- Technology-specific filtering

## Examples

See `examples/search-examples.md` for:
- 20+ real-world search examples
- Step-by-step walkthroughs
- Common patterns and workflows

## Integration Points

### With ald-memory
```
Memory stores: Project tech stack (Next.js, Supabase, etc)
Policy-finder uses: Tech stack to suggest relevant policies
```

### With ald-policies
```
Policy-finder: Finds which policies apply
ald-policies: Stores full policy content
```

### With ald-curator
```
Curator: Promotes patterns to policies
Policy-finder: Indexes new policies automatically
```

### With ald-tester
```
Policy-finder: Suggests policies to apply
ald-tester: Validates policy compliance
```

## Roadmap

**v1.1** (planned):
- [ ] Fuzzy search (typo tolerance)
- [ ] Policy similarity suggestions
- [ ] Usage analytics (most-used policies)
- [ ] Custom scenario creation

**v1.2** (planned):
- [ ] Multi-criteria search (keyword + tech + category)
- [ ] Policy dependency graph
- [ ] Conflict detection (overlapping policies)

## FAQ

### Q: Does this replace reading policy files?

**A**: No. Policy-finder helps you **find** which policies apply. You still need to **read** the full policy files for implementation details.

### Q: What if I can't find a policy?

**A**: Try:
1. Broader keywords: "auth" → "security"
2. Related scenarios: "login" → "authentication"
3. Browse categories: `policy-finder:list`

### Q: Can I add custom searches?

**A**: Yes! Edit `policy-index.json` to add:
- New keywords
- Custom scenarios
- Project-specific technologies

### Q: How up-to-date is the index?

**A**: The index version matches the policy system version. Current: **v1.3.1** (155 policies).

## Contributing

To improve policy-finder:

1. **Add Keywords**: Found a useful search term? Add to `keywords` in index
2. **Create Scenarios**: Common task pattern? Add to `scenarios`
3. **Add Technologies**: New tech stack item? Add to `technologies`
4. **Report Issues**: Policy not found? Wrong results? Report to curator

## Conclusion

`ald-policy-finder` transforms the 155-policy system from **overwhelming** to **discoverable**.

**Before**: "Which of 155 policies do I need?"
**After**: "Show me relevant policies for this task"

Making the right thing the easy thing. 🚀

---

**Version**: 1.0.0
**Last Updated**: 2025-10-23
**Policies Indexed**: 155 / 155
**System**: ALD v1.3.1

---

**Related Skills**:
- [ald-policies](../ald-policies/README.md) - Complete policy system
- [ald-memory](../ald-memory/README.md) - Contextual memory
- [ald-curator](../ald-curator/README.md) - Learning & evolution
