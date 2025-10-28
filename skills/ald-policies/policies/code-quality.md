# Code Quality Policies

Opinionated rules for writing clean, maintainable, and robust code.

---

## Policy 3.1 — Strict TypeScript Mode

**MUST**: Use TypeScript strict mode with explicit types.

**Rationale**: Catches errors at compile time, not runtime.

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

**Implementation**:
```typescript
// ✅ Good - Explicit types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

interface User {
  id: number;
  email: string;
  name: string | null; // Explicit nullable
}

// ❌ Bad - Implicit any
function calculateTotal(items) { // any 😱
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

---

## Policy 3.2 — DRY (Don't Repeat Yourself)

**MUST**: Extract repeated logic into reusable functions/components.

**When to Apply**: Code duplicated 2+ times.

**Implementation**:
```typescript
// ✅ Good - Extracted into utility
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

const total = formatCurrency(100);
const tax = formatCurrency(10);

// ❌ Bad - Repeated logic
const total = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(100);
const tax = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(10);
```

---

## Policy 3.3 — Single Responsibility Principle (SRP)

**MUST**: Each function/class should do one thing well.

**Rationale**: Easier to test, understand, and maintain.

**Implementation**:
```typescript
// ✅ Good - Separated concerns
function validateUser(user: User): ValidationResult {
  // Only validates
}

function saveUser(user: User): Promise<void> {
  // Only saves
}

async function createUser(data: UserInput) {
  const validation = validateUser(data);
  if (!validation.valid) throw new Error(validation.error);

  await saveUser(data);
}

// ❌ Bad - Does everything
async function createUser(data: any) {
  // Validates, sanitizes, saves, sends email, logs, etc. 😱
}
```

---

## Policy 3.4 — Early Returns for Readability

**SHOULD**: Use early returns to reduce nesting and improve readability.

**Implementation**:
```typescript
// ✅ Good - Early returns
function processOrder(order: Order) {
  if (!order) return null;
  if (order.status === 'cancelled') return null;
  if (order.items.length === 0) return null;

  return calculateTotal(order);
}

// ❌ Bad - Deep nesting
function processOrder(order: Order) {
  if (order) {
    if (order.status !== 'cancelled') {
      if (order.items.length > 0) {
        return calculateTotal(order);
      }
    }
  }
  return null;
}
```

---

## Policy 3.5 — Meaningful Names

**MUST**: Use descriptive, intention-revealing names.

**Guidelines**:
- Functions: verb + noun (`getUserById`, `calculateTotal`)
- Booleans: `is/has/should` prefix (`isActive`, `hasPermission`)
- Constants: UPPER_SNAKE_CASE
- Avoid abbreviations unless universally known

**Implementation**:
```typescript
// ✅ Good
const MAX_RETRY_ATTEMPTS = 3;
const isAuthenticated = true;
function getUserByEmail(email: string): User | null {
  // ...
}

// ❌ Bad
const mra = 3; // What is this?
const auth = true; // Is this a function or boolean?
function get(e: string) { // Get what? e is what?
  // ...
}
```

---

## Policy 3.6 — Error Handling is Mandatory

**MUST**: Handle errors explicitly. Never silently catch errors.

**Implementation**:
```typescript
// ✅ Good - Explicit error handling
async function fetchUser(id: number) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error fetching user', { id, error });
    throw error; // Re-throw or handle appropriately
  }
}

// ❌ Bad - Silent catch
async function fetchUser(id: number) {
  try {
    const response = await fetch(`/api/users/${id}`);
    return await response.json();
  } catch (error) {
    // Silent catch 😱
  }
}
```

---

## Policy 3.7 — No Magic Numbers

**SHOULD**: Extract magic numbers into named constants.

**Implementation**:
```typescript
// ✅ Good
const TAX_RATE = 0.15;
const MAX_ITEMS_PER_PAGE = 20;
const CACHE_TTL_SECONDS = 3600;

const total = subtotal * (1 + TAX_RATE);

// ❌ Bad
const total = subtotal * 1.15; // What is 1.15?
const items = getItems(20); // Why 20?
cache.set(key, value, 3600); // What is 3600?
```

---

## Policy 3.8 — Immutability Over Mutation

**SHOULD**: Prefer immutable data structures and operations.

**Rationale**: Prevents side effects, easier to reason about.

**Implementation**:
```typescript
// ✅ Good - Immutable
const updatedUser = {
  ...user,
  name: 'New Name'
};

const completedTodos = todos.map(todo =>
  todo.id === id ? { ...todo, completed: true } : todo
);

// ❌ Bad - Mutation
user.name = 'New Name'; // Mutates original

todos.forEach(todo => {
  if (todo.id === id) {
    todo.completed = true; // Mutates original
  }
});
```

---

## Policy 3.9 — Test Critical Business Logic

**MUST**: Write unit tests for business logic and edge cases.

**What to Test**:
- Business logic functions
- Edge cases (null, empty, invalid input)
- Error conditions

**Implementation**:
```typescript
// ✅ Good - Testable pure function
export function calculateDiscount(total: number, coupon?: Coupon): number {
  if (!coupon) return total;
  if (coupon.expiresAt < new Date()) return total;

  const discount = coupon.type === 'percentage'
    ? total * (coupon.value / 100)
    : coupon.value;

  return Math.max(total - discount, 0);
}

// Test file
describe('calculateDiscount', () => {
  it('should apply percentage discount', () => {
    const result = calculateDiscount(100, { type: 'percentage', value: 10 });
    expect(result).toBe(90);
  });

  it('should not apply expired coupon', () => {
    const expiredCoupon = { expiresAt: new Date('2020-01-01') };
    const result = calculateDiscount(100, expiredCoupon);
    expect(result).toBe(100);
  });
});
```

---

## Policy 3.10 — No Dead Code

**MUST**: Remove commented code and unused imports/variables.

**Rationale**: Clutters codebase, confuses developers.

**Use**:
- Git for version history (not comments)
- ESLint to detect unused code

**Implementation**:
```typescript
// ✅ Good - Clean
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ❌ Bad - Dead code
import { useState, useEffect } from 'react'; // useEffect unused
// import { useOldHook } from './old'; // Commented import

export function Counter() {
  const [count, setCount] = useState(0);
  // const oldValue = useOldHook(); // Dead code
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

## Policy 3.11 — File Organization (Feature-Based)

**MUST**: Organize by feature, not by type.

**Rationale**: Related code stays together, easier to find and maintain.

**Implementation**:
```
✅ Good - Feature-based
/app/products/
  page.tsx                  (route)
  product-list.tsx          (component)
  product-card.tsx          (component)
  product-form.tsx          (component)
  actions.ts                (server actions)
  validations.ts            (schemas)

/app/orders/
  page.tsx
  order-list.tsx
  order-details.tsx
  actions.ts

❌ Bad - Type-based
/components/
  product-list.tsx
  product-card.tsx
  order-list.tsx
/actions/
  product-actions.ts
  order-actions.ts
/validations/
  product-schemas.ts
  order-schemas.ts
```

---

## Policy 3.12 — Comments Guidelines

**SHOULD**: Comment **why**, not **what**. Code should be self-explanatory.

**When to Comment**:
- Complex algorithms
- Non-obvious business rules
- Workarounds for bugs
- Performance optimizations

**When NOT to Comment**:
- Obvious code
- Restating what code does

**Implementation**:
```typescript
// ✅ Good - Explains WHY
// Use polling instead of websocket because Vercel has 10s timeout
setInterval(() => fetchUpdates(), 5000);

// Customer requested this specific date format (ticket #1234)
const formattedDate = date.toLocaleDateString('pt-BR');

// ❌ Bad - Restates WHAT
// Set count to zero
const count = 0;

// Loop through users
users.forEach(user => {
  // ...
});
```

---

## Policy 3.13 — API Response Format (Standardized)

**MUST**: Use consistent response format for all API routes.

**Format**:
```typescript
// Success response
{
  success: true,
  data: T,
  meta?: {
    pagination?: {...},
    timestamp?: string
  }
}

// Error response
{
  success: false,
  error: {
    message: string,
    code?: string,
    details?: any
  }
}
```

**Implementation**:
```typescript
// ✅ Good - Consistent format
export async function GET(req: Request) {
  try {
    const users = await getUsers();
    return NextResponse.json({
      success: true,
      data: users,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: 'GET_USERS_FAILED'
      }
    }, { status: 500 });
  }
}

// ❌ Bad - Inconsistent formats
// Sometimes: { users: [...] }
// Sometimes: { data: [...] }
// Sometimes: just [...]
```

---

## Policy 3.14 — Enum vs Union Types

**SHOULD**: Use union types over enums in TypeScript.

**Rationale**: Enums generate runtime code. Union types are compile-time only.

**Implementation**:
```typescript
// ✅ Good - Union type (no runtime cost)
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';

const status: OrderStatus = 'pending';

// ✅ Good - With const object for display
const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered'
} as const;

type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// ❌ Bad - Enum (generates runtime code)
enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Shipped = 'shipped',
  Delivered = 'delivered'
}
```

---

## Policy 3.15 — Barrel Exports (Avoid)

**SHOULD NOT**: Avoid barrel exports (`index.ts`) in most cases.

**Rationale**: Hurts tree-shaking, makes imports slower, hides actual file locations.

**Exceptions**: Public library APIs, UI component libraries.

**Implementation**:
```typescript
// ✅ Good - Direct imports
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// ❌ Bad - Barrel export
// components/ui/index.ts
export { Button } from './button';
export { Card } from './card';
// ... 50 more exports

// Usage
import { Button, Card } from '@/components/ui';  // Slow, imports everything!
```

---

## Policy 3.16 — Naming Consistency Across Layers ⭐

**MUST**: Maintain semantic consistency between database and code naming.

**Rationale**: Prevents confusion, improves searchability, eases maintenance.

**Naming Conventions by Layer**:
- **Database**: `snake_case` (user_id, created_at, full_name)
- **TypeScript**: `camelCase` (userId, createdAt, fullName)
- **GraphQL**: `camelCase` (userId, createdAt, fullName)
- **URLs/APIs**: `kebab-case` (/users/user-id, /seller-profiles)
- **Classes/Components**: `PascalCase` (UserProfile, ProductCard)

**Implementation**:
```typescript
// ✅ Good - Perfect consistency
// Database (PostgreSQL)
CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  company_name VARCHAR(255),
  business_phone VARCHAR(20),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

// Drizzle Schema (explicit mapping)
export const sellerProfiles = pgTable('seller_profiles', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),  // ✅ Maps explicitly
  companyName: varchar('company_name', { length: 255 }),  // ✅ Semantic match
  businessPhone: varchar('business_phone', { length: 20 }),  // ✅ Semantic match
  isApproved: boolean('is_approved').default(false),  // ✅ Boolean prefix kept
  createdAt: timestamp('created_at').defaultNow(),  // ✅ Timestamp pattern
});

// TypeScript Type (same semantic names)
type SellerProfile = {
  id: string;
  userId: string;           // ✅ Matches user_id concept
  companyName: string;      // ✅ Matches company_name concept
  businessPhone: string;    // ✅ Matches business_phone concept
  isApproved: boolean;      // ✅ Matches is_approved concept
  createdAt: Date;          // ✅ Matches created_at concept
};

// React Component (propagates names)
<SellerCard
  companyName={seller.companyName}      // ✅ Consistent throughout
  businessPhone={seller.businessPhone}  // ✅ No renames
  isApproved={seller.isApproved}        // ✅ Clear boolean
/>

// API Route (kebab-case)
// GET /api/seller-profiles/:id
// Returns: { companyName, businessPhone, isApproved }
```

**Anti-Patterns**:
```typescript
// ❌ Bad - Semantic inconsistency
// Database: full_name
// Code: name  // ❌ Different concept! "full_name" ≠ "name"

// ❌ Bad - Unnecessary abbreviations
// Database: description
// Code: desc  // ❌ Abbreviated without reason

// ❌ Bad - Mixed languages
// Database: nome_completo (PT)
// Code: fullName (EN)  // ❌ Pick one language!

// ❌ Bad - Inconsistent booleans
// Database: is_active
// Code: active  // ❌ Lost the is_ prefix clarity
```

**Allowed Exceptions**:
- Reserved words: `class` → `className`, `for` → `htmlFor`
- Context-specific: `userId` in auth context vs `id` in User type
- Universal abbreviations: `id`, `url`, `html`, `api`

---

## Policy 3.17 — Policy Documentation

**MUST**: Document which policies were applied in generated code.

**Rationale**: Provides traceability, education, and audit trail for policy compliance. Helps developers understand the "why" behind code decisions.

**Implementation**:

### File Header Block

Every generated file MUST have a header block listing policies applied:

```typescript
/**
 * Policies Applied:
 * - Policy 4.1: Server-side input validation (Security)
 * - Policy 1.2: Index all foreign keys (Database)
 * - Policy 2.3: Accessibility mandatory (UI/UX)
 *
 * See: ald-policies/policies/README.md for full policy list
 */

// File implementation follows...
```

### Critical Code Comments

Code that implements security, migrations, RLS, or error handling MUST have detailed policy comments:

```typescript
/**
 * Policy 4.1: Never Trust User Input
 * Validates email format server-side to prevent injection attacks
 * See: ald-policies/policies/security.md
 */
const emailSchema = z.string().email();
```

### Examples

**Example 1: Database Migration**
```typescript
/**
 * Policies Applied:
 * - Policy 1.1: Explicit primary keys
 * - Policy 1.2: Index all foreign keys
 * - Policy 1.5: Migrations with down()
 *
 * See: ald-policies/policies/database.md
 */

export async function up(db: Database) {
  /**
   * Policy 1.1: Explicit Primary Keys
   * Every table must have explicit PK definition
   */
  await db.schema
    .createTable('products')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('seller_id', 'uuid', (col) => col.notNull())
    .execute();

  /**
   * Policy 1.2: Index All Foreign Keys
   * FKs must have indexes for join performance
   */
  await db.schema
    .createIndex('idx_products_seller_id')
    .on('products')
    .column('seller_id')
    .execute();
}

/**
 * Policy 1.5: Migrations with down()
 * Enable rollbacks for all migrations
 */
export async function down(db: Database) {
  await db.schema.dropTable('products').execute();
}
```

**Example 2: API Endpoint**
```typescript
/**
 * Policies Applied:
 * - Policy 4.1: Server-side input validation (Security)
 * - Policy 5.2: HTTP status codes (API Design)
 * - Policy 5.9: Zod validation (API Design)
 *
 * See: ald-policies/policies/security.md, api-design.md
 */

import { z } from 'zod';

/**
 * Policy 5.9: Input Validation with Zod
 * Use Zod schemas for all API inputs
 */
const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().positive()
});

export async function POST(req: Request) {
  /**
   * Policy 4.1: Never Trust User Input
   * Validate input server-side to prevent injection
   */
  const body = await req.json();
  const validation = createProductSchema.safeParse(body);

  if (!validation.success) {
    /**
     * Policy 5.2: HTTP Status Codes
     * Return 400 for client validation errors
     */
    return Response.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const product = await createProduct(validation.data);

  /**
   * Policy 5.2: HTTP Status Codes
   * Return 201 for successful resource creation
   */
  return Response.json(product, { status: 201 });
}
```

**Example 3: Supabase RLS Policy**
```sql
/**
 * Policies Applied:
 * - Policy 4.7: Row-Level Security (Security)
 * - Policy 10.6: Scope Boundary Enforcement (Sprint)
 *
 * See: ald-policies/policies/security.md
 */

/**
 * Policy 4.7: Row-Level Security
 * RLS for multi-tenant data isolation
 * Sellers can only access their own products
 */
CREATE POLICY "sellers_own_products" ON products
  FOR ALL
  USING (
    seller_id = auth.uid()
  );
```

**Example 4: Error Boundary**
```typescript
/**
 * Policies Applied:
 * - Policy 13.4: Error Boundaries (Error Recovery)
 * - Policy 13.5: Fallback UI (Error Recovery)
 *
 * See: ald-policies/policies/error-recovery.md
 */

'use client';

/**
 * Policy 13.4: Error Boundaries
 * Wrap UI components to prevent crashes from propagating
 */
export class ErrorBoundary extends Component<Props, State> {
  render() {
    if (this.state.hasError) {
      /**
       * Policy 13.5: Fallback UI
       * Never show blank screens - provide meaningful message
       */
      return (
        <div>
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Benefits

✅ **Traceability**: Know which policy generated this code
✅ **Education**: Developers understand the "why"
✅ **Audit Trail**: Verify policy compliance
✅ **Curator Learning**: Analyze which policies are most used
✅ **Onboarding**: New devs learn patterns faster

---

## Anti-Patterns to Avoid

❌ **Implicit `any` types**
❌ **God functions (100+ lines)**
❌ **Deep nesting (> 3 levels)**
❌ **Silent error catching**
❌ **Magic numbers scattered in code**
❌ **Mutating objects/arrays directly**
❌ **No tests for business logic**
❌ **Commented-out code**
❌ **Type-based file organization**
❌ **Comments that restate code**
❌ **Inconsistent API response formats**
❌ **Using enums instead of union types**
❌ **Barrel exports everywhere**
❌ **Renaming concepts across layers** ⭐

---

**Last Updated**: 2025-10-23
**Policy Count**: 17
