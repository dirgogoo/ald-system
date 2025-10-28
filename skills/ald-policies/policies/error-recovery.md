# Error Recovery & Resilience

**Category 13 - Error Recovery & Resilience**

**6 policies** for building fault-tolerant applications that recover gracefully from errors.

---

## Philosophy

Errors are inevitable. Networks fail, APIs timeout, users lose internet connection. Resilient applications **anticipate failures** and handle them gracefully without crashing or losing user data.

**Key principles**:
- **Fail gracefully** (never blank screens)
- **Retry intelligently** (exponential backoff)
- **Isolate failures** (error boundaries, circuit breakers)
- **Preserve state** (queue actions, sync later)

---

## Policy 13.1: Retry Strategies

**Level**: MUST

**Rule**: Implement exponential backoff for transient failures (network errors, timeouts, rate limits).

### Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastRetry = i === maxRetries - 1;
      if (isLastRetry) throw error;

      // Exponential backoff: 1s, 2s, 4s, 8s (capped at maxDelay)
      const delay = Math.min(baseDelay * Math.pow(2, i), maxDelay);

      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`, error);
      await sleep(delay);
    }
  }

  throw new Error('Unreachable');
}

// Usage
const data = await retryWithBackoff(
  () => fetch('/api/products').then(r => r.json()),
  { maxRetries: 3, baseDelay: 1000 }
);
```

### When to Retry

✅ **Retry these errors**:
- Network errors (fetch failed, timeout)
- 5xx server errors (500, 502, 503)
- Rate limits (429 Too Many Requests)
- Temporary database unavailability

❌ **DON'T retry these errors**:
- 4xx client errors (400, 401, 403, 404)
- Validation errors
- Authentication failures
- Business logic errors

### Example: API Call with Retry

```typescript
async function fetchProducts(): Promise<Product[]> {
  return retryWithBackoff(
    async () => {
      const response = await fetch('/api/products');

      if (!response.ok) {
        // 5xx = retry, 4xx = don't retry
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }
        throw new Error(`Client error: ${response.status}`); // Don't retry
      }

      return response.json();
    },
    { maxRetries: 3 }
  );
}
```

---

## Policy 13.2: Graceful Degradation

**Level**: MUST

**Rule**: When primary feature fails, provide fallback functionality. Never show blank screens or completely broken UI.

### Fallback Pattern

```typescript
async function fetchWithFallback<T>(options: {
  primary: () => Promise<T>;
  fallback?: () => Promise<T>;
  default: T;
}): Promise<T> {
  try {
    return await options.primary();
  } catch (primaryError) {
    console.error('Primary fetch failed:', primaryError);

    if (options.fallback) {
      try {
        console.log('Trying fallback...');
        return await options.fallback();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    console.log('Using default value');
    return options.default;
  }
}
```

### Example: Data Fetching with Cache Fallback

```typescript
async function getProducts(): Promise<Product[]> {
  return fetchWithFallback({
    primary: async () => {
      // Try live API
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();

      // Cache successful response
      await cacheProducts(data);

      return data;
    },
    fallback: async () => {
      // Try cached data
      console.log('API unavailable, using cached data');
      return await getCachedProducts();
    },
    default: [] // Empty array if everything fails
  });
}
```

### Example: Feature Detection

```typescript
// Check if feature is available, fallback if not
function ImageUpload() {
  const [hasImageSupport, setHasImageSupport] = useState(true);

  const handleUpload = async (file: File) => {
    try {
      // Try modern upload API
      await uploadToSupabaseStorage(file);
    } catch (error) {
      console.error('Modern upload failed, trying fallback');
      setHasImageSupport(false);

      // Fallback to base64 upload
      await uploadAsBase64(file);
    }
  };

  return (
    <div>
      {hasImageSupport ? (
        <ModernUploader onUpload={handleUpload} />
      ) : (
        <BasicUploader onUpload={handleUpload} />
      )}
    </div>
  );
}
```

---

## Policy 13.3: Circuit Breakers

**Level**: SHOULD

**Rule**: Prevent cascading failures by opening circuit after repeated failures. Stop calling failing service temporarily.

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: number;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      // Check if timeout passed
      if (Date.now() - this.lastFailureTime! > this.timeout) {
        console.log('Circuit HALF_OPEN, trying request');
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker OPEN, request blocked');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    console.log('Circuit CLOSED');
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      console.log(`Circuit OPEN after ${this.failureCount} failures`);
    }
  }
}

// Usage
const breaker = new CircuitBreaker(5, 60000);

async function callExternalAPI() {
  return breaker.execute(async () => {
    const response = await fetch('https://external-api.com/data');
    if (!response.ok) throw new Error('API failed');
    return response.json();
  });
}
```

### When to Use

✅ **Use circuit breakers for**:
- External API calls (payment gateways, shipping APIs)
- Microservices communication
- Database connections (external DBs)

❌ **Don't use for**:
- Internal function calls
- User input validation
- UI interactions

---

## Policy 13.4: Error Boundaries

**Level**: MUST

**Rule**: Wrap UI components in Error Boundaries to prevent crashes from propagating. Catch errors, show fallback UI.

### React Error Boundary

```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary caught error:', error, errorInfo);
    // Send to error tracking (Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-500 rounded">
          <h2 className="text-red-600 font-semibold">Something went wrong</h2>
          <p className="text-sm text-gray-600 mt-2">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Usage

```typescript
// Wrap risky components
function ProductPage() {
  return (
    <ErrorBoundary fallback={<ProductErrorFallback />}>
      <ProductDetails />
      <ProductReviews />
      <RelatedProducts />
    </ErrorBoundary>
  );
}

// Isolate each section
function Dashboard() {
  return (
    <div>
      <ErrorBoundary>
        <Stats />
      </ErrorBoundary>

      <ErrorBoundary>
        <RecentOrders />
      </ErrorBoundary>

      <ErrorBoundary>
        <Analytics />
      </ErrorBoundary>
    </div>
  );
}
```

**Benefits**:
- One component crash doesn't break entire page
- User can still access other features
- Better error tracking

---

## Policy 13.5: Fallback UI

**Level**: MUST

**Rule**: Always provide meaningful fallback UI when features fail. NEVER show blank screens or cryptic errors.

### Good Fallback UI Patterns

```typescript
// ✅ GOOD: Meaningful fallback with action
function ProductList() {
  const { data, error, isLoading } = useQuery(['products'], fetchProducts);

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold">Unable to load products</h3>
        <p className="mt-2 text-gray-600">
          We're having trouble connecting to our servers.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Try again
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold">No products found</h3>
        <p className="mt-2 text-gray-600">
          Start by adding your first product.
        </p>
        <Link href="/products/new">
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Add Product
          </button>
        </Link>
      </div>
    );
  }

  return <ProductGrid products={data} />;
}

// ❌ BAD: Cryptic error, no action
if (error) {
  return <div>Error: {error.message}</div>;
}

// ❌ BAD: Blank screen
if (error) {
  return null;
}
```

### Fallback UI Checklist

✅ **Good fallback includes**:
- Clear icon (visual cue)
- Descriptive title ("Unable to load products")
- Explanation (why it failed)
- Action button ("Try again", "Go back", "Contact support")

---

## Policy 13.6: Network Failure Handling

**Level**: MUST

**Rule**: Detect offline state, queue user actions, sync when connection restored.

### Offline Detection

```typescript
// hooks/useOnlineStatus.ts
import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### Queue Actions for Later

```typescript
// lib/offlineQueue.ts
interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

class OfflineQueue {
  private queue: QueuedAction[] = [];

  add(action: Omit<QueuedAction, 'id' | 'timestamp'>) {
    const queuedAction: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    this.queue.push(queuedAction);
    this.saveToLocalStorage();

    console.log('Action queued for later:', queuedAction);
  }

  async syncAll() {
    console.log(`Syncing ${this.queue.length} queued actions`);

    for (const action of this.queue) {
      try {
        await this.processAction(action);
        this.remove(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  }

  private async processAction(action: QueuedAction) {
    // Process based on action type
    switch (action.type) {
      case 'CREATE_ORDER':
        await fetch('/api/orders', {
          method: 'POST',
          body: JSON.stringify(action.data)
        });
        break;
      case 'UPDATE_PRODUCT':
        await fetch(`/api/products/${action.data.id}`, {
          method: 'PATCH',
          body: JSON.stringify(action.data)
        });
        break;
    }
  }

  private remove(id: string) {
    this.queue = this.queue.filter(a => a.id !== id);
    this.saveToLocalStorage();
  }

  private saveToLocalStorage() {
    localStorage.setItem('offline_queue', JSON.stringify(this.queue));
  }
}

export const offlineQueue = new OfflineQueue();
```

### Usage in Component

```typescript
function CreateOrderButton() {
  const isOnline = useOnlineStatus();

  const handleCreateOrder = async (orderData: OrderData) => {
    if (!isOnline) {
      // Queue for later
      offlineQueue.add({
        type: 'CREATE_ORDER',
        data: orderData
      });

      toast.info('You are offline. Order will be created when connection is restored.');
      return;
    }

    // Online - create immediately
    await createOrder(orderData);
    toast.success('Order created');
  };

  return (
    <button onClick={() => handleCreateOrder(data)}>
      Create Order {!isOnline && '(Offline)'}
    </button>
  );
}

// Sync when coming back online
function App() {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline) {
      console.log('Connection restored, syncing queued actions');
      offlineQueue.syncAll();
    }
  }, [isOnline]);

  return <YourApp />;
}
```

---

## Quick Reference

| Error Type | Strategy | Policy |
|------------|----------|--------|
| Network timeout | Retry with backoff | 13.1 |
| API unavailable | Use cached data | 13.2 |
| Repeated failures | Circuit breaker | 13.3 |
| Component crash | Error boundary | 13.4 |
| Feature failure | Fallback UI | 13.5 |
| User offline | Queue actions | 13.6 |

---

## Integration with ALD System

- **ald-tester**: Validates error handling (console errors must be caught)
- **ald-policies**: Security policies (4.x) require input validation before retry
- **ald-orchestrator**: INSTRUCTOR loop is itself a retry mechanism

---

## Summary

**6 Resilience Policies:**
- 13.1: Retry Strategies (exponential backoff)
- 13.2: Graceful Degradation (fallback functionality)
- 13.3: Circuit Breakers (prevent cascading failures)
- 13.4: Error Boundaries (isolate crashes)
- 13.5: Fallback UI (meaningful error messages)
- 13.6: Network Failure Handling (offline queue + sync)

**Key Principle**: Fail gracefully, never catastrophically.

---

**Last Updated**: 2025-10-23
**Category**: 13 - Error Recovery & Resilience
**Total Policies**: 6
