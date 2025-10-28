# Security Policies

Opinionated rules for secure coding practices.

---

## Policy 4.1 — Never Trust User Input

**MUST**: Validate and sanitize all user input on the server.

**Rationale**: Client-side validation can be bypassed. Server is the security boundary.

**Implementation**:
```typescript
// ✅ Good - Server-side validation
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
  role: z.enum(['user', 'admin']) // Whitelist values
});

export async function POST(req: Request) {
  const body = await req.json();

  // Validate
  const validated = userSchema.parse(body); // Throws on invalid

  // Sanitize (if needed)
  const sanitized = {
    ...validated,
    email: validated.email.toLowerCase().trim()
  };

  // Use sanitized data
  await createUser(sanitized);
}

// ❌ Bad - Trusting client data
export async function POST(req: Request) {
  const body = await req.json();
  await createUser(body); // No validation 😱
}
```

---

## Policy 4.2 — Use Parameterized Queries (Prevent SQL Injection)

**MUST**: Never concatenate user input into SQL queries.

**Rationale**: SQL injection is still a top security risk.

**Implementation**:
```typescript
// ✅ Good - Parameterized
const users = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, userEmail)); // Safe

// Using raw SQL? Use parameters
const users = await db.execute(
  sql`SELECT * FROM users WHERE email = ${userEmail}` // Safe with tagged template
);

// ❌ Bad - String concatenation
const query = `SELECT * FROM users WHERE email = '${userEmail}'`; // SQL Injection 😱
const users = await db.execute(query);
```

---

## Policy 4.3 — Implement Proper Authentication

**MUST**: Use established auth libraries/services, not custom solutions.

**Recommended**:
- Supabase Auth
- NextAuth.js
- Auth0
- Clerk

**Never**:
- Roll your own crypto
- Store passwords in plain text
- Use weak hashing (MD5, SHA1)

**Implementation**:
```typescript
// ✅ Good - Using Supabase Auth
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data.session;
}

// ❌ Bad - Custom auth
async function login(email: string, password: string) {
  const user = await db.users.findOne({ email });
  if (user.password === password) { // Plain text comparison 😱
    return { userId: user.id };
  }
}
```

---

## Policy 4.4 — Protect Sensitive Data in Logs

**MUST**: Never log sensitive information (passwords, tokens, PII).

**Sensitive Data Includes**:
- Passwords
- API keys/secrets
- Auth tokens
- Personal health information
- Credit card numbers
- Social security numbers

**Implementation**:
```typescript
// ✅ Good - Sanitized logging
logger.info('User login attempt', {
  userId: user.id,
  email: maskEmail(user.email), // me***@example.com
  timestamp: new Date()
});

// ❌ Bad - Logging sensitive data
logger.info('User login', {
  email: user.email,
  password: password, // 😱😱😱
  token: authToken // 😱
});
```

---

## Policy 4.5 — Use Environment Variables for Secrets

**MUST**: Never hardcode secrets in source code.

**Rationale**: Source code is often committed to version control.

**Implementation**:
```typescript
// ✅ Good - Environment variables
const apiKey = process.env.API_KEY;
const dbUrl = process.env.DATABASE_URL;

// .env.local (not committed to git)
API_KEY=secret123
DATABASE_URL=postgresql://...

// ❌ Bad - Hardcoded secrets
const apiKey = 'sk_live_abc123'; // Committed to git 😱
const dbPassword = 'password123'; // 😱
```

---

## Policy 4.6 — Implement Rate Limiting

**MUST**: Rate limit all public API endpoints.

**Rationale**: Prevents brute force attacks, DDoS, abuse.

**When to Apply**:
- Login endpoints (prevent brute force)
- Public APIs (prevent abuse)
- Resource-intensive operations

**Implementation**:
```typescript
// ✅ Good - Rate limiting with upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }

  // Process request...
}

// ❌ Bad - No rate limiting
export async function POST(req: Request) {
  // Anyone can spam this 😱
}
```

---

## Policy 4.7 — Enable Row-Level Security (RLS)

**MUST**: Use Row-Level Security (RLS) for multi-tenant databases.

**Rationale**: Prevents users from accessing other users' data.

**When to Apply**: Supabase, PostgreSQL with multi-user data.

**Implementation**:
```sql
-- ✅ Good - RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own data"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can only update their own data"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- ❌ Bad - No RLS
-- Anyone with API access can query all rows 😱
```

---

## Policy 4.8 — Sanitize HTML to Prevent XSS

**MUST**: Sanitize user-generated HTML before rendering.

**Rationale**: Prevents Cross-Site Scripting (XSS) attacks.

**Implementation**:
```typescript
// ✅ Good - React auto-escapes by default
function Comment({ text }: Props) {
  return <p>{text}</p>; // Auto-escaped
}

// If rendering HTML, sanitize first
import DOMPurify from 'dompurify';

function RichComment({ html }: Props) {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// ❌ Bad - Rendering unsanitized HTML
function Comment({ html }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />; // XSS 😱
}
```

---

## Policy 4.9 — Use HTTPS Everywhere

**MUST**: Enforce HTTPS for all production traffic.

**Implementation**:
```typescript
// ✅ Good - Redirect HTTP to HTTPS (Next.js middleware)
export function middleware(req: NextRequest) {
  if (req.url.startsWith('http://') && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(req.url.replace('http://', 'https://'));
  }
}

// Vercel handles this automatically in production
```

---

## Policy 4.10 — Principle of Least Privilege

**MUST**: Grant minimum necessary permissions.

**Apply to**:
- Database users (read-only vs read-write)
- API keys (scoped permissions)
- User roles (admin, editor, viewer)

**Implementation**:
```typescript
// ✅ Good - Role-based access control
async function deleteUser(userId: string, requestingUser: User) {
  if (requestingUser.role !== 'admin') {
    throw new Error('Unauthorized: Admin role required');
  }

  await db.users.delete({ id: userId });
}

// Database permissions
// ✅ App user has limited permissions
GRANT SELECT, INSERT, UPDATE ON users TO app_user;
REVOKE DELETE ON users FROM app_user; // Deletion requires admin

// ❌ Bad - Everyone is admin
async function deleteUser(userId: string) {
  await db.users.delete({ id: userId }); // No permission check 😱
}
```

---

## Policy 4.11 — CSRF Protection (Server Actions)

**MUST**: Protect against Cross-Site Request Forgery in forms and mutations.

**Rationale**: Prevents unauthorized actions from malicious sites.

**Implementation**:
```typescript
// ✅ Good - Next.js Server Actions have built-in CSRF protection
'use server';

export async function updateProfile(formData: FormData) {
  // Next.js validates origin automatically
  const name = formData.get('name');
  await db.update(users).set({ name });
}

// ✅ Good - API routes with CSRF token
import { csrf } from '@/lib/csrf';

export async function POST(req: Request) {
  // Verify CSRF token
  await csrf.verify(req);

  const body = await req.json();
  // Process request...
}

// ❌ Bad - No CSRF protection on state-changing endpoint
export async function POST(req: Request) {
  const body = await req.json();
  await db.users.delete({ id: body.userId }); // Can be triggered from any site 😱
}
```

**Best Practices**:
- Use Next.js Server Actions (built-in protection)
- For API routes: implement CSRF tokens
- Check `Origin` and `Referer` headers
- Use SameSite cookies

---

## Policy 4.12 — Content Security Policy (CSP)

**SHOULD**: Implement Content Security Policy headers to prevent XSS.

**Rationale**: CSP is defense-in-depth against XSS attacks.

**Implementation**:
```typescript
// ✅ Good - CSP in Next.js headers
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, '')
          }
        ]
      }
    ];
  }
};

// ❌ Bad - No CSP headers
// Vulnerable to XSS if sanitization fails
```

**Recommended Directives**:
- `default-src 'self'` - Only load from same origin
- `script-src 'self'` - No inline scripts (or use nonce)
- `img-src 'self' data: https:` - Images from self or HTTPS
- `frame-ancestors 'none'` - Prevent clickjacking

---

## Policy 4.13 — Secrets Rotation

**SHOULD**: Rotate secrets and API keys regularly.

**Rationale**: Limits damage window if secrets are compromised.

**When to Rotate**:
- **Immediately**: If compromised
- **Regular schedule**: Every 90 days (API keys), 30 days (DB passwords)
- **After employee offboarding**
- **After security incident**

**Implementation**:
```typescript
// ✅ Good - Environment-based secrets with rotation tracking
// .env.local
API_KEY=sk_live_abc123_v2  # Rotated 2025-10-23
DATABASE_URL=postgresql://user:pass_2025_10@host/db

# secrets-rotation.json (not in git)
{
  "api_key": {
    "last_rotated": "2025-10-23",
    "next_rotation": "2026-01-23",
    "version": "v2"
  },
  "database_password": {
    "last_rotated": "2025-10-01",
    "next_rotation": "2025-11-01"
  }
}

// ✅ Good - Graceful rotation (support old + new key temporarily)
const API_KEY_CURRENT = process.env.API_KEY;
const API_KEY_PREVIOUS = process.env.API_KEY_PREVIOUS; // Valid for 7 days

async function verifyApiKey(key: string): Promise<boolean> {
  return key === API_KEY_CURRENT || key === API_KEY_PREVIOUS;
}

// ❌ Bad - Never rotated secrets
// API_KEY=sk_live_abc123  (created 2020, never changed 😱)
```

**Rotation Checklist**:
1. Generate new secret
2. Update in secret manager (Vercel, AWS Secrets Manager)
3. Deploy with both old + new active
4. Update all clients/services
5. Deactivate old secret after grace period
6. Document rotation date

**Tools**:
- Vercel: Environment Variables with preview/production separation
- AWS Secrets Manager: Automatic rotation
- Supabase: Service role key rotation via dashboard
- 1Password/Doppler: Secret management platforms

---

## Anti-Patterns to Avoid

❌ **Trusting client-side data without server validation**
❌ **String concatenation in SQL queries**
❌ **Rolling your own authentication**
❌ **Logging passwords or tokens**
❌ **Hardcoding secrets in source code**
❌ **No rate limiting on public endpoints**
❌ **Disabling RLS on multi-user tables**
❌ **Rendering unsanitized HTML**
❌ **Using HTTP in production**
❌ **Granting excessive permissions**
❌ **No CSRF protection on mutations** ⭐
❌ **Missing Content Security Policy headers** ⭐
❌ **Never rotating secrets/API keys** ⭐

---

**Last Updated**: 2025-10-23
**Policy Count**: 13
