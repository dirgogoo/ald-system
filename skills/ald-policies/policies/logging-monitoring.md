# Logging & Monitoring Policies

Opinionated rules for observability, debugging, and system health monitoring.

---

## Policy 9.1 — Log Levels (Standard Hierarchy)

**MUST**: Use appropriate log levels for all log statements.

**Levels** (from most to least verbose):
- **DEBUG**: Detailed diagnostic info (development only)
- **INFO**: General informational messages (events, requests)
- **WARN**: Warning messages (degraded performance, recoverable errors)
- **ERROR**: Error messages (exceptions, failures)
- **FATAL**: Critical errors causing system failure

**Rationale**: Consistent log levels enable filtering and alerting.

**Implementation**:
```typescript
// ✅ Good - Appropriate log levels
import { logger } from '@/lib/logger';

// INFO - User actions, business events
logger.info('User logged in', { userId: user.id, email: user.email });
logger.info('Order created', { orderId: order.id, total: order.total });

// WARN - Degraded but functional
logger.warn('Cache miss, falling back to database', { key: cacheKey });
logger.warn('Slow query detected', { query, duration: 1500 });

// ERROR - Exceptions, failures
try {
  await processPayment(order);
} catch (error) {
  logger.error('Payment processing failed', {
    orderId: order.id,
    error: error.message,
    stack: error.stack
  });
  throw error;
}

// DEBUG - Detailed diagnostic (dev only)
logger.debug('Query executed', { sql, params, duration });

// ❌ Bad - Wrong log levels
logger.error('User logged in'); // Not an error!
logger.info('Database connection failed'); // Should be ERROR!
console.log('Payment failed'); // Use structured logging!
```

---

## Policy 9.2 — Structured Logging

**MUST**: Use structured logging (JSON) instead of plain text.

**Rationale**: Machine-readable logs enable filtering, aggregation, alerting.

**Format**:
```json
{
  "timestamp": "2025-10-23T15:30:45.123Z",
  "level": "INFO",
  "message": "User logged in",
  "context": {
    "userId": "abc123",
    "email": "user@example.com",
    "ip": "192.168.1.1"
  }
}
```

**Implementation**:
```typescript
// ✅ Good - Structured logger (pino, winston)
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  }
});

// Usage
logger.info(
  { userId: user.id, email: user.email },
  'User logged in'
);

// Searchable in logs: { "userId": "abc123", "message": "User logged in" }

// ❌ Bad - Plain text logging
console.log(`User ${user.id} logged in at ${new Date()}`);
// Hard to parse, search, alert on 😱
```

**Benefits**:
- Easy to query: `SELECT * FROM logs WHERE userId = 'abc123'`
- Aggregate metrics: `COUNT(*) WHERE message = 'User logged in'`
- Alert on patterns: `ERROR rate > 5/min`

---

## Policy 9.3 — What to Log

**MUST**: Log these events for observability:

**Always Log**:
- ✅ **Authentication events**: Login, logout, failed attempts
- ✅ **Authorization failures**: Access denied events
- ✅ **Financial transactions**: Payments, refunds, transfers
- ✅ **Data modifications**: Create, update, delete (audit trail)
- ✅ **External API calls**: Requests, responses, failures
- ✅ **Errors and exceptions**: All uncaught errors
- ✅ **Performance issues**: Slow queries, timeouts

**Never Log**:
- ❌ Passwords, tokens, secrets (see Security Policy 4.4)
- ❌ Credit card numbers, SSNs
- ❌ PII without masking

**Implementation**:
```typescript
// ✅ Good - Comprehensive logging
// Authentication
logger.info('User login successful', { userId, email: maskEmail(email) });
logger.warn('Login attempt failed', { email: maskEmail(email), reason: 'invalid_password' });

// Financial transactions
logger.info('Payment processed', {
  orderId,
  amount,
  currency: 'BRL',
  paymentMethod: 'credit_card',
  last4: '4242'
});

// Data modifications (audit trail)
logger.info('Product updated', {
  productId,
  userId: updatedBy,
  changes: { price: { from: 100, to: 150 } }
});

// External API calls
logger.info('Stripe API request', { endpoint: '/charges', duration: 250 });
logger.error('Stripe API failed', { endpoint: '/charges', error: 'card_declined' });

// Performance
logger.warn('Slow database query', { query: 'SELECT ...', duration: 1500 });

// ❌ Bad - Logging sensitive data
logger.info('User login', { password: user.password }); // 😱😱😱
logger.info('Payment', { cardNumber: '4111111111111111' }); // 😱
```

---

## Policy 9.4 — Error Tracking

**MUST**: Use error tracking service for production errors.

**Rationale**: Aggregate errors, notify on critical issues, provide context.

**Recommended Tools**:
- Sentry (most popular)
- Rollbar
- Bugsnag
- LogRocket (includes session replay)

**Implementation**:
```typescript
// ✅ Good - Sentry integration
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.['authorization'];
    }
    return event;
  }
});

// Usage - Errors auto-captured
export async function processOrder(orderId: string) {
  try {
    await chargePayment(orderId);
  } catch (error) {
    // Add context
    Sentry.setContext('order', { orderId });
    Sentry.captureException(error);
    throw error;
  }
}

// Global error boundary
// app/error.tsx
'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <div>Algo deu errado!</div>;
}

// ❌ Bad - No error tracking
// Errors happen in production, you never know 😱
```

---

## Policy 9.5 — Performance Monitoring

**SHOULD**: Monitor application performance in production.

**Metrics to Track**:
- **Request latency**: p50, p95, p99
- **Error rate**: % of failed requests
- **Database query time**: Slow query alerts
- **External API latency**: Third-party dependencies
- **Memory/CPU usage**: Resource utilization

**Implementation**:
```typescript
// ✅ Good - Performance monitoring (Vercel Analytics)
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

// Custom performance tracking
export async function GET(req: Request) {
  const startTime = Date.now();

  try {
    const data = await fetchData();
    const duration = Date.now() - startTime;

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request', {
        path: req.url,
        duration,
        method: req.method
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Request failed', {
      path: req.url,
      duration,
      error: error.message
    });
    throw error;
  }
}

// ❌ Bad - No performance monitoring
// Slow endpoints, no visibility 😱
```

**Alerting**:
- p95 latency > 2s → Alert Slack
- Error rate > 5% → Page on-call
- Database connection pool exhausted → Critical alert

---

## Policy 9.6 — Audit Logs for Compliance

**MUST**: Maintain audit logs for sensitive operations.

**Rationale**: Compliance (LGPD, SOC2), security investigations, debugging.

**What to Audit**:
- ✅ User authentication (login, logout, password reset)
- ✅ Permission changes (role assignments)
- ✅ Data access (who viewed what)
- ✅ Financial transactions (payments, refunds)
- ✅ Admin actions (user deletion, data exports)
- ✅ Configuration changes (API keys, settings)

**Implementation**:
```typescript
// ✅ Good - Audit log table
// Database schema
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  INDEX idx_audit_user_id (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_timestamp (timestamp)
);

// Audit logging function
export async function auditLog(params: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  req: Request;
}) {
  await db.insert(auditLogs).values({
    userId: params.userId,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    ipAddress: req.headers.get('x-forwarded-for'),
    userAgent: req.headers.get('user-agent'),
    metadata: params.metadata
  });
}

// Usage
export async function DELETE(req: Request, { params }) {
  const user = await getCurrentUser();
  const product = await db.query.products.findFirst({
    where: eq(products.id, params.id)
  });

  // Delete product
  await db.delete(products).where(eq(products.id, params.id));

  // Audit log
  await auditLog({
    userId: user.id,
    action: 'product.delete',
    resourceType: 'product',
    resourceId: params.id,
    metadata: { productName: product.name },
    req
  });

  return NextResponse.json({ success: true });
}

// ❌ Bad - No audit trail
// "Who deleted this product?" → No way to know 😱
```

**Audit Log Retention**:
- **Active logs**: 1 year (hot storage, fast queries)
- **Archive**: 7 years (cold storage, compliance)
- **Deletion**: Only after legal retention period

---

## Anti-Patterns to Avoid

❌ **Using console.log in production**
❌ **Plain text logging** (not JSON)
❌ **Logging sensitive data** (passwords, tokens)
❌ **No error tracking service**
❌ **No performance monitoring**
❌ **No audit logs for compliance**
❌ **Too verbose logging** (performance impact)
❌ **No log rotation** (disk fills up)

---

**Last Updated**: 2025-10-23
**Policy Count**: 6
