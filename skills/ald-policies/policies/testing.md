# Testing Policies

Opinionated rules for writing effective tests and maintaining quality.

---

## Policy 6.1 — Unit Test Coverage Targets

**SHOULD**: Aim for 80%+ coverage on business logic, 100% on critical paths.

**Rationale**: High coverage catches regressions early, documents behavior.

**What to Test**:
- ✅ Business logic functions
- ✅ Utility functions
- ✅ Data transformations
- ✅ Validation logic
- ❌ UI components (use E2E instead)
- ❌ Third-party library wrappers (low value)

**Implementation**:
```typescript
// ✅ Good - Testable pure function
// lib/pricing.ts
export function calculateDiscount(
  price: number,
  couponType: 'percentage' | 'fixed',
  couponValue: number
): number {
  if (couponType === 'percentage') {
    return price * (couponValue / 100);
  }
  return Math.min(couponValue, price);
}

// lib/pricing.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDiscount } from './pricing';

describe('calculateDiscount', () => {
  it('should apply percentage discount', () => {
    expect(calculateDiscount(100, 'percentage', 10)).toBe(10);
  });

  it('should apply fixed discount', () => {
    expect(calculateDiscount(100, 'fixed', 15)).toBe(15);
  });

  it('should not exceed item price', () => {
    expect(calculateDiscount(50, 'fixed', 100)).toBe(50);
  });

  it('should handle zero discount', () => {
    expect(calculateDiscount(100, 'percentage', 0)).toBe(0);
  });
});

// ❌ Bad - Untestable function
async function processOrder(orderId: string) {
  const order = await db.query.orders.findFirst({ /* ... */ });
  const user = await db.query.users.findFirst({ /* ... */ });
  await sendEmail(user.email, 'Order confirmed');
  // Too many side effects, hard to test 😱
}
```

---

## Policy 6.2 — Integration Test Patterns

**SHOULD**: Test API endpoints with real database (test DB).

**Rationale**: Catches issues with queries, transactions, constraints.

**Implementation**:
```typescript
// ✅ Good - Integration test with test DB
// app/api/products/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';

describe('POST /api/products', () => {
  beforeEach(async () => {
    // Clean test DB
    await db.delete(products);
  });

  it('should create product with valid data', async () => {
    const req = new Request('http://localhost/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Product',
        price: 100,
        category: 'electronics'
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Test Product');
  });

  it('should reject duplicate products', async () => {
    // Insert first product
    await db.insert(products).values({
      name: 'Unique Product',
      price: 100
    });

    // Try to insert duplicate
    const req = new Request('http://localhost/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Unique Product',
        price: 100
      })
    });

    const response = await POST(req);
    expect(response.status).toBe(409); // Conflict
  });
});

// ❌ Bad - Mocking everything
// Mocks hide real integration issues
```

**Test Database Setup**:
- Use separate test database (e.g., `myapp_test`)
- Seed with minimal test data
- Reset between tests
- Use transactions that rollback

---

## Policy 6.3 — E2E Tests for Critical Paths

**MUST**: Write E2E tests for critical user journeys.

**Critical Paths**:
- Authentication (signup, login, logout)
- Purchase flow (add to cart → checkout → payment)
- Data creation (create product, submit form)
- Access control (admin-only pages)

**Implementation**:
```typescript
// ✅ Good - E2E test with Playwright
// e2e/purchase-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete purchase flow', async ({ page }) => {
  // 1. Login
  await page.goto('/auth/login');
  await page.fill('[name="email"]', 'buyer@test.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');

  // 2. Browse products
  await page.goto('/products');
  await expect(page.locator('h1')).toContainText('Produtos');

  // 3. Add to cart
  await page.click('[data-testid="product-card"]:first-child >> text=Adicionar');
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

  // 4. Go to checkout
  await page.click('[data-testid="cart-icon"]');
  await page.click('text=Finalizar Compra');
  await expect(page).toHaveURL('/checkout');

  // 5. Complete payment (mock)
  await page.fill('[name="card_number"]', '4111111111111111');
  await page.click('button:has-text("Confirmar Pagamento")');

  // 6. Verify success
  await expect(page.locator('text=Pedido confirmado')).toBeVisible();
  await expect(page).toHaveURL(/\/orders\/\w+/);
});

// ❌ Bad - No E2E tests
// Manual testing only, regressions slip through
```

---

## Policy 6.4 — Mock vs Real Data

**SHOULD**: Use real data in tests by default, mock only external services.

**When to Mock**:
- ✅ Third-party APIs (Stripe, email services)
- ✅ Slow operations (file uploads, image processing)
- ✅ Non-deterministic operations (Date.now(), Math.random())
- ❌ Database queries (use test DB instead)
- ❌ Internal functions (test real implementation)

**Implementation**:
```typescript
// ✅ Good - Mock external service only
import { vi } from 'vitest';
import * as stripe from '@/lib/stripe';

vi.mock('@/lib/stripe', () => ({
  createPaymentIntent: vi.fn().mockResolvedValue({
    id: 'pi_test123',
    status: 'succeeded'
  })
}));

test('should process payment', async () => {
  const result = await processOrder('order_123');

  expect(stripe.createPaymentIntent).toHaveBeenCalledWith({
    amount: 10000,
    currency: 'brl'
  });
  expect(result.status).toBe('paid');
});

// ❌ Bad - Mocking internal logic
vi.mock('@/lib/pricing', () => ({
  calculateTotal: vi.fn().mockReturnValue(100)
}));
// Now you're not testing the real calculation logic!
```

---

## Policy 6.5 — Test Naming Convention

**MUST**: Use descriptive test names following pattern: `should [expected behavior] when [condition]`.

**Rationale**: Self-documenting tests, easier to understand failures.

**Implementation**:
```typescript
// ✅ Good - Descriptive names
describe('calculateShipping', () => {
  it('should be free when order total exceeds R$200', () => {
    const shipping = calculateShipping(250);
    expect(shipping).toBe(0);
  });

  it('should charge R$15 for orders under R$200', () => {
    const shipping = calculateShipping(150);
    expect(shipping).toBe(15);
  });

  it('should throw error when total is negative', () => {
    expect(() => calculateShipping(-10)).toThrow('Invalid total');
  });
});

// ❌ Bad - Vague names
describe('calculateShipping', () => {
  it('test1', () => { /* ... */ });
  it('works', () => { /* ... */ });
  it('shipping', () => { /* ... */ });
});
```

---

## Policy 6.6 — AAA Pattern (Arrange-Act-Assert)

**SHOULD**: Structure tests using Arrange-Act-Assert pattern.

**Rationale**: Consistent structure improves readability.

**Implementation**:
```typescript
// ✅ Good - AAA pattern
test('should update user profile', async () => {
  // Arrange
  const user = await db.insert(users).values({
    email: 'test@example.com',
    name: 'Old Name'
  }).returning();

  // Act
  const updated = await updateUserProfile(user.id, {
    name: 'New Name'
  });

  // Assert
  expect(updated.name).toBe('New Name');
  expect(updated.email).toBe('test@example.com'); // Unchanged
});

// ❌ Bad - Mixed concerns
test('should update user profile', async () => {
  const user = await db.insert(users).values({ /* ... */ }).returning();
  expect(user.name).toBe('Old Name'); // Premature assertion
  const updated = await updateUserProfile(user.id, { name: 'New Name' });
  expect(updated.name).toBe('New Name');
  // Confusing flow
});
```

---

## Policy 6.7 — Test Isolation

**MUST**: Each test must be independent and run in any order.

**Rationale**: Prevents flaky tests, enables parallel execution.

**Implementation**:
```typescript
// ✅ Good - Isolated tests
describe('Product API', () => {
  beforeEach(async () => {
    // Clean slate for each test
    await db.delete(products);
  });

  test('should create product', async () => {
    const product = await createProduct({ name: 'Product 1' });
    expect(product.name).toBe('Product 1');
  });

  test('should list products', async () => {
    // This test doesn't depend on previous test
    await db.insert(products).values({ name: 'Product A' });
    await db.insert(products).values({ name: 'Product B' });

    const list = await listProducts();
    expect(list).toHaveLength(2);
  });
});

// ❌ Bad - Tests depend on each other
let productId: string;

test('should create product', async () => {
  const product = await createProduct({ name: 'Product 1' });
  productId = product.id; // Global state 😱
});

test('should get product', async () => {
  const product = await getProduct(productId); // Depends on previous test!
  expect(product.name).toBe('Product 1');
});
```

---

## Policy 6.8 — Snapshot Testing (Use Sparingly)

**SHOULD**: Use snapshot tests only for stable, deterministic output.

**When to Use**:
- ✅ API response structures
- ✅ Generated HTML (SSR)
- ✅ Configuration files
- ❌ UI components (too brittle)
- ❌ Database records (use explicit assertions)

**Implementation**:
```typescript
// ✅ Good - API response snapshot
test('should return product list structure', async () => {
  const products = await getProducts();

  expect(products).toMatchSnapshot({
    data: expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        price: expect.any(Number),
        createdAt: expect.any(String)
      })
    ]),
    meta: {
      total: expect.any(Number)
    }
  });
});

// ❌ Bad - Over-reliance on snapshots
test('should render product card', () => {
  const { container } = render(<ProductCard product={mockProduct} />);
  expect(container).toMatchSnapshot(); // Brittle, breaks on any CSS change 😱
});
```

**Snapshot Best Practices**:
- Review snapshots in PRs carefully
- Update snapshots only when intentional
- Use inline snapshots for small values
- Avoid snapshots with timestamps/IDs

---

## Anti-Patterns to Avoid

❌ **No tests for business logic**
❌ **Only testing happy paths**
❌ **Mocking internal functions**
❌ **Vague test names** ("test1", "works")
❌ **Tests that depend on execution order**
❌ **Brittle snapshot tests**
❌ **No integration tests (only unit)**
❌ **No E2E tests for critical flows**

---

**Last Updated**: 2025-10-23
**Policy Count**: 8
