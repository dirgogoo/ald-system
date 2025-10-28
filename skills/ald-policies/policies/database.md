# Database Policies

Opinionated rules for database design, queries, and performance.

---

## Policy 1.1 — Explicit Primary Keys

**MUST**: Every table must have an explicit primary key defined.

**Rationale**: Implicit/auto-generated PKs can cause issues with ORMs and replication.

**Implementation**:
```sql
-- ✅ Good
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL
);

-- ❌ Bad
CREATE TABLE users (
  email TEXT NOT NULL
);
```

---

## Policy 1.2 — Index All Foreign Keys

**MUST**: Create indexes on all foreign key columns.

**Rationale**: FK columns are frequently used in JOINs. Missing indexes cause sequential scans.

**Implementation**:
```sql
-- ✅ Good
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id)
);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- ❌ Bad
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id)
  -- Missing index!
);
```

---

## Policy 1.3 — Composite Indexes for Frequent Joins

**SHOULD**: For FKs used in frequent joins, create composite index `(fk_col, parent_id)`.

**Rationale**: Composite indexes optimize both JOIN and filtering on parent.

**When to Apply**: When `EXPLAIN ANALYZE` shows sequential scan on FK join.

**Implementation**:
```sql
-- ✅ Good for queries like: SELECT * FROM orders WHERE user_id = ? AND status = ?
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

---

## Policy 1.4 — No SELECT * Queries

**MUST**: Always specify column names in SELECT queries.

**Rationale**:
- Reduces data transfer
- Makes queries self-documenting
- Prevents breaking changes when schema evolves

**Implementation**:
```typescript
// ✅ Good
const users = await db.select({
  id: users.id,
  email: users.email,
  name: users.name
}).from(users);

// ❌ Bad
const users = await db.select().from(users); // SELECT *
```

---

## Policy 1.5 — Migrations Must Include down()

**MUST**: Every migration must have a `down()` function for rollback.

**Rationale**: Enables safe rollbacks in production.

**Implementation**:
```typescript
// ✅ Good
export async function up(db) {
  await db.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').notNullable();
  });
}

export async function down(db) {
  await db.schema.dropTable('users');
}

// ❌ Bad
export async function up(db) {
  await db.schema.createTable('users', (table) => {
    table.increments('id').primary();
  });
}
// Missing down()!
```

---

## Policy 1.6 — Use EXPLAIN ANALYZE for Query Validation

**SHOULD**: Run `EXPLAIN ANALYZE` on all complex queries before production.

**Rationale**: Catches performance issues early (sequential scans, missing indexes).

**When to Apply**:
- Queries with JOINs
- Queries on tables with > 1000 rows
- Queries in critical paths (auth, payments, etc)

**Implementation**:
```sql
-- Check query plan
EXPLAIN ANALYZE
SELECT o.id, o.total, u.email
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending';
```

**Red Flags**:
- Seq Scan on large tables
- High cost estimates
- Nested loops without indexes

---

## Policy 1.7 — Avoid N+1 Queries

**MUST**: Batch-load related data instead of querying in loops.

**Rationale**: N+1 queries cause massive performance degradation.

**Implementation**:
```typescript
// ✅ Good - Single query with JOIN
const ordersWithUsers = await db
  .select()
  .from(orders)
  .leftJoin(users, eq(orders.userId, users.id))
  .where(eq(orders.status, 'pending'));

// ❌ Bad - N+1 problem
const orders = await db.select().from(orders);
for (const order of orders) {
  const user = await db.select().from(users).where(eq(users.id, order.userId)); // 😱
}
```

---

## Policy 1.8 — Use Database Constraints

**SHOULD**: Enforce data integrity at database level, not just application level.

**Rationale**: Multiple apps/scripts may access DB. Constraints protect data integrity.

**Implementation**:
```sql
-- ✅ Good
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  age INTEGER CHECK (age >= 0 AND age <= 150),
  status TEXT CHECK (status IN ('active', 'inactive', 'banned'))
);

-- ❌ Bad - only application-level validation
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT,
  age INTEGER,
  status TEXT
);
```

---

## Policy 1.9 — Naming Conventions

**MUST**: Use `snake_case` for tables and columns. Tables plural, booleans prefixed.

**Rationale**: Consistency across database, prevents ambiguity.

**Rules**:
- Tables: plural `snake_case` (users, seller_profiles, order_items)
- Columns: `snake_case` (full_name, created_at, user_id)
- Booleans: `is_/has_` prefix (is_active, has_permission, is_approved)
- Join tables: sorted alphabetically (post_tags, not tags_posts)

**Implementation**:
```sql
-- ✅ Good
CREATE TABLE seller_profiles (  -- plural, snake_case
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,         -- snake_case FK
  company_name VARCHAR(255),     -- snake_case
  is_approved BOOLEAN DEFAULT false,  -- boolean prefix
  created_at TIMESTAMP DEFAULT NOW()
);

-- ❌ Bad
CREATE TABLE SellerProfile (  -- PascalCase ❌
  ID UUID,
  userId UUID,  -- camelCase ❌
  CompanyName VARCHAR,  -- PascalCase ❌
  approved BOOLEAN  -- missing is_ prefix ❌
);
```

---

## Policy 1.10 — Soft Deletes Pattern

**SHOULD**: Use soft deletes (`deleted_at`) for user-generated data.

**When to Apply**:
- User-generated content (posts, comments)
- Financial records (orders, invoices)
- Audit-critical data

**When NOT to Apply**:
- Session tokens (hard delete)
- Temporary data (caches)
- GDPR-protected data (must hard delete)

**Implementation**:
```sql
-- ✅ Good - Soft delete
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  content TEXT,
  deleted_at TIMESTAMP NULL
);

-- Query excludes soft-deleted
SELECT * FROM posts WHERE deleted_at IS NULL;

-- Restore soft-deleted
UPDATE posts SET deleted_at = NULL WHERE id = '...';

-- ❌ Bad - Hard delete loses data
DELETE FROM posts WHERE id = '...';  -- Can't undo!
```

---

## Policy 1.11 — Audit Trails Required

**SHOULD**: Track `created_by`, `updated_by`, `deleted_by` for critical data.

**When to Apply**:
- Financial transactions
- Admin actions
- Security-sensitive changes

**Implementation**:
```sql
-- ✅ Good - Full audit trail
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  total DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP,
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP NULL,
  deleted_by UUID REFERENCES users(id)
);

-- ❌ Bad - No audit trail
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  total DECIMAL(10,2)
);
```

---

## Policy 1.12 — Timestamps Mandatory

**MUST**: All tables MUST have `created_at` and `updated_at`.

**Rationale**: Debugging, analytics, audit logs require timestamps.

**Exceptions**: Pure join tables (e.g., `post_tags`)

**Implementation**:
```sql
-- ✅ Good
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ❌ Bad
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255)
  -- Missing timestamps!
);
```

---

## Policy 1.13 — Data Seeding Strategy

**SHOULD**: Use migration-based seeding for essential data only.

**What to Seed**:
- ✅ Default roles (admin, user)
- ✅ Essential categories
- ✅ System configuration
- ❌ Test data (use separate script)
- ❌ Large datasets (use CSV import)

**Implementation**:
```typescript
// seeds/001_default_roles.ts
export async function seed(db) {
  await db('roles').insert([
    { name: 'admin', permissions: ['*'] },
    { name: 'user', permissions: ['read'] }
  ]);
}

// ✅ Run seeds separately from migrations
npm run db:seed

// ❌ Don't put seeds in migrations
// migrations/001_create_users.ts
export async function up(db) {
  await db.schema.createTable('users', ...);
  await db('users').insert({ /* seed data */ }); // ❌ Wrong place!
}
```

---

## Anti-Patterns to Avoid

❌ **No indexes on FK columns**
❌ **SELECT * in production code**
❌ **Migrations without down() function**
❌ **N+1 query patterns**
❌ **Missing EXPLAIN ANALYZE on complex queries**
❌ **Relying solely on app-level validation**
❌ **Inconsistent naming (camelCase in DB)**
❌ **Hard deletes for user data**
❌ **No audit trails on financial data**
❌ **Missing timestamps**
❌ **Seed data in migrations**

---

**Last Updated**: 2025-10-23
**Policy Count**: 13
