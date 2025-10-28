# Data Fetching

**Category 15 - Data Fetching**

**6 policies** for fetching data efficiently.

## Policy 15.1: Server Components First

**Level**: MUST

**Rule**: Fetch in Server Components by default (Next.js)

## Policy 15.2: Client-Side Fetching

**Level**: SHOULD

**Use React Query/SWR for**: User-specific data, real-time updates, interactive filtering

## Policy 15.3: Parallel Data Fetching

**Level**: MUST

**Rule**: Use `Promise.all()` for independent requests

## Policy 15.4: Waterfall Prevention

**Level**: MUST

**Rule**: Avoid sequential requests that could run in parallel

## Policy 15.5: Polling vs WebSockets

**Level**: SHOULD

**Polling**: Low-frequency updates (order status every 5s)
**WebSockets**: Real-time (chat, notifications)

## Policy 15.6: Prefetching Strategies

**Level**: SHOULD

**Pattern**: Prefetch on hover (Next.js Link), prefetch programmatically (React Query)

---

**Last Updated**: 2025-10-23
**Category**: 15 - Data Fetching
**Total Policies**: 6
