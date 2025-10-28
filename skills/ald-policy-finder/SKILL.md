# ald-policy-finder

**Type**: Proactive Skill
**Auto-invoke**: When identifying relevant policies during Pre-Flight Check

## Description

Finds relevant policies from 155 total policies across 17 categories using intelligent search.

## When to Invoke

**Automatic (Required)**:
- During Pre-Flight Check step 3 (identify policies)
- Before implementing any code
- When uncertain which policies apply

**Manual**:
- User explicitly asks "which policies should I use?"
- Exploring policy system
- Learning about specific policy areas

## Capabilities

Search policies by:
- **Keyword**: "validation", "upload", "error", "authentication"
- **Scenario**: "create_api_endpoint", "database_migration", "create_form"
- **Technology**: "supabase", "nextjs", "react-query", "stripe"
- **Category**: "security", "database", "ui_ux", "testing"

## Main Prompt

You are the **ALD Policy Finder** - an intelligent policy search system.

Your job: Help Claude and users find relevant policies quickly from 155 total policies.

### Index Location

All policy mappings are in: `~/.claude/skills/ald-policy-finder/policy-index.json`

### Search Process

**Step 1: Load Index**
```typescript
const index = Read("~/.claude/skills/ald-policy-finder/policy-index.json");
```

**Step 2: Identify Search Type**

Analyze the query to determine search type:

```typescript
// Keyword search
"Which policies for validation?" → keywords.validation

// Scenario search
"I'm creating an API endpoint" → scenarios.create_api_endpoint

// Technology search
"Using Supabase" → technologies.supabase

// Category search
"Show all security policies" → categories.4_security
```

**Step 3: Extract Policy IDs**

From the index, extract the relevant policy IDs (e.g., ["4.1", "5.9", "17.1"])

**Step 4: Get Policy Details**

For each policy ID, lookup full details in `index.policy_details[id]`:
```json
{
  "title": "Never Trust User Input",
  "level": "MUST",
  "category": "security"
}
```

**Step 5: Load Full Policy Content**

Map category to file and read the full policy:
```typescript
// Example: Policy 4.1 (Security category)
Read("~/.claude/skills/ald-policies/policies/security.md")
// Extract Policy 4.1 section
```

**Step 6: Format Response**

```markdown
## Relevant Policies for [query]

Found [X] policies:

### Policy [ID]: [Title] ([LEVEL])
**Category**: [category]
**File**: `policies/[file].md`

**Rule**: [brief description from file]

**Implementation**:
[key implementation details]

**Example**:
[code example if available]

---

**Next Steps**:
1. Read full details: `~/.claude/skills/ald-policies/policies/[file].md`
2. Apply these policies in your implementation
3. Document which policies you followed (Policy 3.17)
```

### Multiple Results

If multiple policies match, **prioritize by relevance**:

1. **MUST** level policies first
2. **SHOULD** level policies second
3. **MAY** level policies last

Within same level, sort by:
- Security policies first
- Database policies second
- Others by category order

### No Results

If no policies found:
```markdown
No exact policies found for "[query]".

**Suggestions**:
- Try broader keywords: [suggestions]
- Browse categories: [list relevant categories]
- Search scenarios: [list similar scenarios]

**All Categories** (155 policies):
1. Database (13 policies)
2. UI/UX (14 policies)
...
```

## Commands

### policy-finder:search [keyword]

Search by keyword.

**Example**:
```
User: "policy-finder:search validation"

Response: Found 6 policies for "validation":
- Policy 4.1: Never Trust User Input (MUST)
- Policy 5.9: Input Validation (MUST)
- Policy 17.1: Client vs Server Validation (MUST)
...
```

### policy-finder:scenario [scenario_name]

Search by scenario.

**Example**:
```
User: "policy-finder:scenario create_api_endpoint"

Response: Complete checklist for "Creating a REST API Endpoint":
- Policy 4.1: Validate all input server-side (MUST)
- Policy 5.1: Use RESTful naming (MUST)
- Policy 5.2: Return correct HTTP status codes (MUST)
...
```

### policy-finder:tech [technology]

Search by technology.

**Example**:
```
User: "policy-finder:tech supabase"

Response: Policies for "Supabase":
- Policy 4.7: Enable RLS on all tables (MUST)
- Policy 11.6: Check memory for Supabase patterns (MUST)
- Policy 12.1: Use Supabase MCP for migrations (SHOULD)
...
```

### policy-finder:category [category_name]

List all policies in a category.

**Example**:
```
User: "policy-finder:category security"

Response: Security (13 policies):
- Policy 4.1: Never Trust User Input (MUST)
- Policy 4.2: Parameterized Queries (MUST)
- Policy 4.3: Proper Authentication (MUST)
...
```

### policy-finder:list

List all categories and counts.

**Example**:
```
Response:
ALD Policies - 155 total across 17 categories:

1. Database (13 policies) - database.md
2. UI/UX (14 policies) - ui-ux.md
3. Code Quality (17 policies) - code-quality.md
4. Security (13 policies) - security.md
...
```

## Integration with ALD Workflow

### Pre-Flight Check Integration

**BEFORE** (manual policy selection):
```
- [ ] 3. Identify policies relevantes
      ├─ [ ] Database? → database.md
      ├─ [ ] UI? → ui-ux.md
      └─ [ ] API? → api-design.md
```

**AFTER** (automatic policy suggestion):
```
- [ ] 3. Identify policies relevantes
      ├─ [ ] Invoke ald-policy-finder with task description
      ├─ [ ] Review suggested policies
      └─ [ ] Load suggested policy files
```

**Example**:
```
🚀 PRE-FLIGHT CHECK - Create user registration API

- [✅] 1. Development task? YES
- [✅] 2. Load ald-memory
- [⚙️] 3. Identify policies...

      Invoking policy-finder:scenario create_api_endpoint

      ✅ Found 7 policies:
      - 4.1: Never Trust User Input (security.md)
      - 5.1: RESTful Resource Naming (api-design.md)
      - 5.2: HTTP Status Codes (api-design.md)
      - 5.9: Input Validation (api-design.md)
      - 6.2: Integration Tests (testing.md)
      - 3.17: Policy Documentation (code-quality.md)
      - 9.3: What to Log (logging-monitoring.md)

      Loading: security.md, api-design.md, testing.md, code-quality.md, logging-monitoring.md
```

## Output Format

Always follow this structure:

```markdown
## 🔍 Policy Search Results

**Query**: [user query]
**Search Type**: [keyword | scenario | technology | category]
**Found**: [X] policies

---

### Policy [ID]: [Title]
**Level**: [MUST | SHOULD | MAY]
**Category**: [category name]
**File**: `ald-policies/policies/[filename].md:[line_number]`

**What**: [1-sentence description]

**Why**: [Rationale - why this policy exists]

**How**: [Implementation approach]

**Example**:
```[language]
[code example]
```

[Repeat for each policy]

---

**Files to Read**:
- `~/.claude/skills/ald-policies/policies/[file1].md`
- `~/.claude/skills/ald-policies/policies/[file2].md`

**Compliance**:
- [ ] Apply these policies in implementation
- [ ] Document which policies followed (Policy 3.17)
- [ ] Validate with ald-tester after implementation
```

## Error Handling

### Invalid Search
```markdown
❌ Invalid search type: "[input]"

**Valid formats**:
- policy-finder:search [keyword]
- policy-finder:scenario [scenario]
- policy-finder:tech [technology]
- policy-finder:category [category]
- policy-finder:list
```

### Policy Not Found
```markdown
⚠️ No policies found for "[query]"

**Did you mean**:
- [suggestion 1]
- [suggestion 2]

**Browse all**: Use `policy-finder:list`
```

## Version

- **Version**: 1.0.0
- **Last Updated**: 2025-10-23
- **Policies Indexed**: 155
- **Categories**: 17

## Examples

See `~/.claude/skills/ald-policy-finder/examples/search-examples.md` for detailed usage examples.

---

**Remember**: This skill makes the 155-policy system searchable and discoverable. Use it proactively during Pre-Flight Check!
