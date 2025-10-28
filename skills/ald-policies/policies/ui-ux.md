# UI/UX Policies

Opinionated rules for building user interfaces and experiences.

---

## Policy 2.1 — Server Components First (Next.js)

**MUST**: Use Server Components by default. Only use `'use client'` when necessary.

**When to use Client Components**:
- Interactivity (onClick, onChange, etc)
- Browser APIs (localStorage, window, etc)
- React hooks (useState, useEffect, etc)
- Third-party libraries that require client-side

**Rationale**: Server Components reduce bundle size and improve performance.

**Implementation**:
```typescript
// ✅ Good - Parent is Server Component
export default async function UserProfile({ userId }: Props) {
  const user = await getUser(userId); // Server-side data fetch

  return (
    <div>
      <h1>{user.name}</h1>
      <InteractiveButton /> {/* Only this is client component */}
    </div>
  );
}

// ❌ Bad - Unnecessarily marking entire component as client
'use client';
export default function UserProfile({ userId }: Props) {
  // No interactivity needed here!
  return <div>...</div>;
}
```

---

## Policy 2.2 — Small, Focused Components (SRP)

**MUST**: Each component should have a single responsibility.

**Rationale**: Easier to test, reuse, and maintain.

**Guidelines**:
- Max ~150 lines per component (excluding types)
- If component has multiple concerns, split it
- Extract logic into custom hooks

**Implementation**:
```typescript
// ✅ Good - Separated concerns
function UserList() {
  return <div>{users.map(user => <UserCard key={user.id} user={user} />)}</div>;
}

function UserCard({ user }) {
  return (
    <div>
      <UserAvatar src={user.avatar} />
      <UserInfo name={user.name} email={user.email} />
      <UserActions userId={user.id} />
    </div>
  );
}

// ❌ Bad - God component doing everything
function UserManagement() {
  // 500 lines of mixed concerns 😱
}
```

---

## Policy 2.3 — Accessibility is Mandatory

**MUST**: All interactive elements must be keyboard-accessible and have proper ARIA labels.

**Requirements**:
- Semantic HTML (`<button>` not `<div onClick>`)
- Alt text for images
- Labels for form inputs
- Focus states visible
- Color contrast meets WCAG AA

**Implementation**:
```typescript
// ✅ Good
<button
  onClick={handleClick}
  aria-label="Delete user"
  className="focus:ring-2 focus:ring-blue-500"
>
  <TrashIcon />
</button>

<img src={avatar} alt={`${user.name}'s profile picture`} />

<label htmlFor="email">Email</label>
<input id="email" type="email" name="email" />

// ❌ Bad
<div onClick={handleClick}>Delete</div> {/* Not keyboard accessible */}
<img src={avatar} /> {/* No alt text */}
<input type="email" /> {/* No label */}
```

---

## Policy 2.4 — Mobile-First Responsive Design

**SHOULD**: Design for mobile first, then enhance for larger screens.

**Rationale**: Easier to scale up than scale down. Forces focus on essential features.

**Implementation**:
```typescript
// ✅ Good - Mobile first, then tablet/desktop
<div className="
  flex flex-col gap-2        /* Mobile: stack vertically */
  md:flex-row md:gap-4       /* Tablet: horizontal */
  lg:gap-8                   /* Desktop: more spacing */
">

// ❌ Bad - Desktop first (harder to adapt down)
<div className="
  flex flex-row gap-8
  md:gap-4
  sm:flex-col sm:gap-2
">
```

---

## Policy 2.5 — Loading and Error States Required

**MUST**: Every async operation must handle loading and error states.

**Rationale**: Prevents UI freezes and user confusion.

**Implementation**:
```typescript
// ✅ Good
function UserProfile() {
  const { data, isLoading, error } = useUser();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;

  return <UserData user={data} />;
}

// ❌ Bad
function UserProfile() {
  const { data } = useUser();
  return <UserData user={data} />; // Breaks when loading or error!
}
```

---

## Policy 2.6 — Optimistic UI for Better UX

**SHOULD**: Update UI immediately for user actions, rollback on error.

**When to Apply**: Likes, saves, toggles, quick updates.

**Implementation**:
```typescript
// ✅ Good - Optimistic update
async function handleLike() {
  setLiked(true); // Update UI immediately
  setCount(count + 1);

  try {
    await likePost(postId);
  } catch (error) {
    setLiked(false); // Rollback on error
    setCount(count - 1);
    toast.error('Failed to like post');
  }
}

// ❌ Bad - Wait for server
async function handleLike() {
  const result = await likePost(postId); // User waits...
  if (result.success) setLiked(true);
}
```

---

## Policy 2.7 — Form Validation (Client + Server)

**MUST**: Validate forms on both client and server.

**Rationale**:
- Client: Immediate feedback
- Server: Security (client can be bypassed)

**Implementation**:
```typescript
// ✅ Good - Both sides
// Client
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150)
});

function Form() {
  const form = useForm({ schema });
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}

// Server
export async function POST(req: Request) {
  const body = await req.json();
  const validated = schema.parse(body); // Validates again!
  // ...
}

// ❌ Bad - Only client validation
function Form() {
  // Client validation only - insecure!
}
```

---

## Policy 2.8 — Consistent Design System

**MUST**: Use design tokens/components from design system (e.g., shadcn/ui).

**Rationale**: Consistency, maintainability, faster development.

**Implementation**:
```typescript
// ✅ Good - Using design system
import { Button } from '@/components/ui/button';
<Button variant="primary" size="lg">Click me</Button>

// ❌ Bad - Custom one-off styles
<button className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded text-white font-bold">
  Click me
</button>
```

---

## Policy 2.9 — Error Boundaries Required

**MUST**: Wrap routes/features with Error Boundary to catch crashes.

**Rationale**: Prevents entire app crash from component errors.

**Implementation**:
```typescript
// ✅ Good - Route-level error boundary
// app/products/error.tsx
'use client';

export default function Error({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Algo deu errado!</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-4">
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

// ❌ Bad - No error boundary
// Component crashes → entire app goes down
```

---

## Policy 2.10 — Suspense Boundaries for Lazy Loading

**SHOULD**: Use Suspense for code splitting and async components.

**When to Apply**:
- Heavy components (charts, editors)
- Route-based code splitting
- Dynamic imports

**Implementation**:
```typescript
// ✅ Good - Lazy loaded with Suspense
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const HeavyChart = lazy(() => import('./heavy-chart'));

export default function Dashboard() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <HeavyChart />
    </Suspense>
  );
}

// ❌ Bad - All code loaded upfront
import { HeavyChart } from './heavy-chart';  // Blocks initial load
```

---

## Policy 2.11 — Data Fetching Patterns

**MUST**: Fetch data in Server Components when possible, Client Components when needed.

**Server Components** (prefer):
- Initial page data
- SEO-critical content
- No interactivity needed

**Client Components**:
- User-specific data (cart, notifications)
- Real-time updates
- Interactive filters

**Implementation**:
```typescript
// ✅ Good - Server Component fetches
export default async function ProductsPage() {
  const products = await getProducts();  // Server-side
  return <ProductList products={products} />;
}

// ✅ Good - Client Component for user data
'use client';
export function UserCart() {
  const { data: cart } = useSWR('/api/cart');  // Client-side
  return <CartItems items={cart} />;
}

// ❌ Bad - Client fetching for static data
'use client';
export function ProductsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/products').then(...)  // Should be server!
  }, []);
}
```

---

## Policy 2.12 — Form Validation UX

**MUST**: Show validation errors at the right time.

**When to Show Errors**:
- On blur (after user leaves field)
- On submit (show all errors)
- NOT on every keystroke (annoying!)

**Implementation**:
```typescript
// ✅ Good - Validate on blur
'use client';
export function LoginForm() {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    // Only show error if field was touched
  };

  return (
    <form>
      <input
        name="email"
        onBlur={() => handleBlur('email')}
      />
      {touched.email && errors.email && (
        <span className="text-sm text-red-500">{errors.email}</span>
      )}
    </form>
  );
}

// ❌ Bad - Validate on every keystroke
<input onChange={() => validateEmail(value)} />  // Annoying!
```

---

## Policy 2.13 — Empty States Required

**MUST**: Show meaningful empty states when no data exists.

**Rationale**: Blank screen confuses users. Explain what's missing and how to fix it.

**Implementation**:
```typescript
// ✅ Good - Helpful empty state
export function ProductList({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <PackageIcon className="h-16 w-16 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum produto encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comece adicionando seu primeiro produto.
        </p>
        <Button asChild className="mt-4">
          <Link href="/products/new">Adicionar Produto</Link>
        </Button>
      </div>
    );
  }

  return <div>{/* Product grid */}</div>;
}

// ❌ Bad - Blank screen
export function ProductList({ products }: Props) {
  return <div>{products.map(...)}</div>;  // Shows nothing if empty
}
```

---

## Policy 2.14 — Skeleton vs Spinner (When to Use)

**MUST**: Use skeletons for layout-heavy loading, spinners for quick actions.

**Skeleton** (prefer):
- Page loads
- List/grid loading
- Shows layout structure

**Spinner**:
- Button loading state
- Inline actions
- Quick operations (< 2s)

**Implementation**:
```typescript
// ✅ Good - Skeleton for page load
import { Skeleton } from '@/components/ui/skeleton';

export function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-64 w-full" />  {/* Image */}
      <Skeleton className="h-8 w-3/4" />    {/* Title */}
      <Skeleton className="h-4 w-1/2" />    {/* Price */}
    </div>
  );
}

// ✅ Good - Spinner for button
<Button disabled={isLoading}>
  {isLoading && <Spinner className="mr-2" />}
  Salvar
</Button>

// ❌ Bad - Spinner for page load
{isLoading ? <Spinner /> : <ProductList />}  // Jarring layout shift!
```

---

## Anti-Patterns to Avoid

❌ **Everything as Client Component**
❌ **God components (500+ lines)**
❌ **Div soup with onClick handlers**
❌ **No loading/error states**
❌ **Hardcoded colors/spacing (not using design tokens)**
❌ **Missing accessibility attributes**
❌ **Desktop-only designs**
❌ **No error boundaries**
❌ **Fetching static data client-side**
❌ **Validating on every keystroke**
❌ **Blank screens when empty**
❌ **Spinners for layout-heavy loads**

---

**Last Updated**: 2025-10-23
**Policy Count**: 14
