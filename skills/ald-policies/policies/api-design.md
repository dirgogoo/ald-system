# API Design Policies

Opinionated rules for designing RESTful APIs and backend endpoints.

---

## Policy 5.1 — RESTful Resource Naming

**MUST**: Use plural nouns for resources, kebab-case for multi-word.

**Rationale**: Consistency improves developer experience and predictability.

**Rules**:
- Resources: plural nouns (`/users`, `/products`, `/order-items`)
- Nested resources: show relationship (`/users/:id/orders`)
- Actions: use HTTP verbs, not actions in URL
- Multi-word: kebab-case (`/seller-profiles`, `/shipping-addresses`)

**Implementation**:
```typescript
// ✅ Good - RESTful naming
GET    /products           // List products
GET    /products/:id       // Get one product
POST   /products           // Create product
PUT    /products/:id       // Update product
DELETE /products/:id       // Delete product

GET    /users/:id/orders   // User's orders (nested resource)

// ❌ Bad - Anti-patterns
GET /getProducts              // Don't use verbs ❌
POST /product/create          // Don't use actions ❌
GET /Products                 // Don't use PascalCase ❌
GET /user_profiles            // Don't use snake_case ❌
```

---

## Policy 5.2 — HTTP Status Codes (Standard)

**MUST**: Use correct HTTP status codes for all responses.

**Common Codes**:
- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Missing/invalid auth
- **403 Forbidden**: Authenticated but no permission
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate/state conflict
- **422 Unprocessable Entity**: Semantic validation error
- **500 Internal Server Error**: Unexpected error

**Implementation**:
```typescript
// ✅ Good - Correct status codes
export async function POST(req: Request) {
  const body = await req.json();

  // Validation error
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: result.error },
      { status: 400 }
    );
  }

  // Duplicate check
  const exists = await db.query.users.findFirst({
    where: eq(users.email, body.email)
  });
  if (exists) {
    return NextResponse.json(
      { error: 'Email already exists' },
      { status: 409 }
    );
  }

  // Success
  const user = await db.insert(users).values(body).returning();
  return NextResponse.json({ data: user }, { status: 201 });
}

// ❌ Bad - Wrong status codes
// Validation error with 500
// Not found with 200
// Created with 200 instead of 201
```

---

## Policy 5.3 — Pagination Standard

**MUST**: Implement pagination for list endpoints returning > 20 items.

**Format**: Cursor-based (prefer) or offset-based.

**Rationale**: Prevents large payloads, improves performance.

**Implementation**:
```typescript
// ✅ Good - Cursor-based pagination
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);

  const products = await db
    .select()
    .from(productsTable)
    .where(cursor ? gt(productsTable.id, cursor) : undefined)
    .limit(limit + 1); // Fetch one extra to check if has more

  const hasMore = products.length > limit;
  const items = hasMore ? products.slice(0, limit) : products;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({
    data: items,
    pagination: {
      cursor: nextCursor,
      limit,
      hasMore
    }
  });
}

// Usage: GET /products?limit=20&cursor=abc123

// ❌ Bad - No pagination
export async function GET() {
  const products = await db.select().from(productsTable); // Could return 100k rows 😱
  return NextResponse.json({ data: products });
}
```

---

## Policy 5.4 — Filtering and Sorting

**SHOULD**: Support filtering and sorting via query params.

**Rationale**: Avoids client-side filtering, reduces payload size.

**Implementation**:
```typescript
// ✅ Good - Filtering and sorting
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Filtering
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const status = searchParams.get('status');

  // Sorting
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const order = searchParams.get('order') ?? 'desc';

  let query = db.select().from(productsTable);

  // Apply filters
  if (category) {
    query = query.where(eq(productsTable.category, category));
  }
  if (minPrice) {
    query = query.where(gte(productsTable.price, parseFloat(minPrice)));
  }

  // Apply sorting
  if (order === 'asc') {
    query = query.orderBy(asc(productsTable[sortBy]));
  } else {
    query = query.orderBy(desc(productsTable[sortBy]));
  }

  const products = await query;
  return NextResponse.json({ data: products });
}

// Usage: GET /products?category=electronics&minPrice=100&sortBy=price&order=asc

// ❌ Bad - No filtering support
// Forces client to fetch all and filter locally
```

---

## Policy 5.5 — API Versioning

**SHOULD**: Version APIs to allow breaking changes without affecting clients.

**Methods**:
- **URL path** (prefer): `/api/v1/products`, `/api/v2/products`
- **Header**: `API-Version: 2`
- **Query param**: `/api/products?version=2` (avoid)

**Implementation**:
```typescript
// ✅ Good - URL versioning
// app/api/v1/products/route.ts
export async function GET() {
  // Old format
  return NextResponse.json({ products: [...] });
}

// app/api/v2/products/route.ts
export async function GET() {
  // New format (breaking change)
  return NextResponse.json({
    data: [...],
    meta: { ... }
  });
}

// ❌ Bad - Breaking changes without versioning
// Old clients break when you change response format
```

**Versioning Strategy**:
- Increment major version on breaking changes
- Maintain v1 for 6-12 months after v2 launch
- Document migration guide
- Log API version usage to plan deprecation

---

## Policy 5.6 — Error Response Format

**MUST**: Use consistent error format across all endpoints.

**Format**:
```typescript
{
  success: false,
  error: {
    code: string,        // Machine-readable (ERROR_CODE)
    message: string,     // Human-readable
    details?: any        // Optional (validation errors, etc)
  }
}
```

**Implementation**:
```typescript
// ✅ Good - Standardized error
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: result.error.errors
        }
      }, { status: 400 });
    }

    // Process...
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}

// ❌ Bad - Inconsistent error formats
// Sometimes: { error: "message" }
// Sometimes: { message: "error" }
// Sometimes: just "error string"
```

---

## Policy 5.7 — Rate Limiting Headers

**SHOULD**: Return rate limit info in response headers.

**Rationale**: Allows clients to adjust behavior before hitting limits.

**Headers**:
- `X-RateLimit-Limit`: Max requests per window
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

**Implementation**:
```typescript
// ✅ Good - Rate limit headers
import { Ratelimit } from '@upstash/ratelimit';

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  const headers = new Headers({
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString()
  });

  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers
    });
  }

  const data = await fetchData();
  return NextResponse.json({ data }, { headers });
}

// ❌ Bad - No rate limit info
// Client gets 429 with no context
```

---

## Policy 5.8 — CORS Configuration

**MUST**: Configure CORS explicitly for cross-origin API access.

**Rationale**: Security (block unauthorized origins) + functionality (allow authorized).

**Implementation**:
```typescript
// ✅ Good - Explicit CORS config
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  const origin = req.headers.get('origin');
  const allowedOrigins = [
    'https://myapp.com',
    'https://admin.myapp.com'
  ];

  const headers = new Headers();

  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Max-Age', '86400'); // 24h cache
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const response = NextResponse.next();
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}

// ❌ Bad - Wildcard CORS
// Access-Control-Allow-Origin: * (allows any site to call your API 😱)
```

**CORS Modes**:
- **Public API**: Allow `*` (with rate limiting)
- **First-party**: Whitelist specific origins
- **No CORS needed**: Same-origin only (most Next.js apps)

---

## Policy 5.9 — Input Validation (Zod Schema)

**MUST**: Validate all request bodies with Zod schemas.

**Rationale**: Type safety + runtime validation + auto-generated types.

**Implementation**:
```typescript
// ✅ Good - Zod validation
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(3).max(255),
  price: z.number().positive().max(1000000),
  category: z.enum(['electronics', 'furniture', 'clothing']),
  description: z.string().optional(),
  tags: z.array(z.string()).max(10).default([])
});

export async function POST(req: Request) {
  const body = await req.json();

  // Validate
  const result = createProductSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid product data',
        details: result.error.flatten()
      }
    }, { status: 400 });
  }

  // result.data is now type-safe
  const product = await db.insert(products).values(result.data);
  return NextResponse.json({ success: true, data: product }, { status: 201 });
}

// ❌ Bad - No validation
export async function POST(req: Request) {
  const body = await req.json();
  await db.insert(products).values(body); // Trusting client data 😱
}
```

---

## Policy 5.10 — API Documentation

**SHOULD**: Document all endpoints with OpenAPI/Swagger or similar.

**Rationale**: Self-documenting APIs reduce support burden.

**Minimum Documentation**:
- Endpoint path and method
- Request body schema
- Response schema (success + error)
- Required auth
- Example requests

**Implementation**:
```typescript
// ✅ Good - JSDoc for auto-docs
/**
 * Create a new product
 *
 * @route POST /api/products
 * @auth Required - Seller role
 * @body {name: string, price: number, category: string}
 * @returns {201} Product created
 * @returns {400} Validation error
 * @returns {401} Unauthorized
 *
 * @example
 * POST /api/products
 * {
 *   "name": "Industrial Bearing",
 *   "price": 150.00,
 *   "category": "bearings"
 * }
 */
export async function POST(req: Request) {
  // Implementation...
}

// Or use Swagger/OpenAPI generator
// Or maintain docs/api.md manually
```

**Tools**:
- Swagger UI (auto-generated docs)
- Postman Collections (shareable)
- README.md with examples
- TypeScript types as source of truth

---

## Anti-Patterns to Avoid

❌ **Verbs in resource URLs** (`/getProducts`, `/createUser`)
❌ **Wrong HTTP status codes** (200 for errors, 500 for validation)
❌ **No pagination on large lists**
❌ **No filtering/sorting support**
❌ **Breaking changes without versioning**
❌ **Inconsistent error formats**
❌ **No rate limit headers**
❌ **Wildcard CORS on sensitive APIs**
❌ **No input validation**
❌ **Undocumented APIs**

---

**Last Updated**: 2025-10-23
**Policy Count**: 10
