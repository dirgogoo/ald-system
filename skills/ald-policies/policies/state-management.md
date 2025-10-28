# State Management

**Category 14 - State Management**

**7 policies** for managing application state effectively.

## Policy 14.1: Server State vs Client State

**Level**: MUST

**Rule**: Distinguish server state (from API) from client state (UI only).

**Server State**: Use React Query/SWR
**Client State**: Use useState/Context

## Policy 14.2: Context API Usage

**Level**: SHOULD

**Use Context for**: Theme, user session, language
**DON'T use for**: Frequently changing data, server data

## Policy 14.3: Global State

**Level**: SHOULD

**Use Zustand when**: Cross-component state, complex logic, performance critical
**Avoid for**: Simple component state

## Policy 14.4: URL State

**Level**: SHOULD

**Prefer URL for**: Search params, filters, pagination
**Benefits**: Shareable, bookmarkable, SSR-friendly

## Policy 14.5: Local Storage Persistence

**Level**: SHOULD

**Persist**: Cart items, user preferences, drafts
**DON'T persist**: Sensitive data, large datasets (>5MB)

## Policy 14.6: Cache Invalidation

**Level**: MUST

**Invalidate when**: Mutation succeeds, user logs out, data stale

## Policy 14.7: Optimistic Updates

**Level**: SHOULD

**Pattern**: Update UI immediately, rollback on error

---

**Last Updated**: 2025-10-23
**Category**: 14 - State Management
**Total Policies**: 7
