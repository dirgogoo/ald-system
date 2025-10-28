# Performance Policies

Opinionated rules for optimizing web application performance.

---

## Policy 7.1 — Page Load Targets

**MUST**: Meet target page load times for user experience.

**Targets**:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

**Rationale**: Google Core Web Vitals, SEO ranking factor, user retention.

**Measurement**:
```typescript
// ✅ Good - Measure with Web Vitals
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

// Monitor in production
// Use Lighthouse CI in CI/CD pipeline
```

**Tools**:
- Lighthouse (Chrome DevTools)
- WebPageTest
- Vercel Analytics
- Google PageSpeed Insights

---

## Policy 7.2 — Core Web Vitals Monitoring

**MUST**: Track Core Web Vitals in production continuously.

**Rationale**: Detect performance regressions before users complain.

**Implementation**:
```typescript
// ✅ Good - Custom Web Vitals tracking
// app/web-vitals.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    if (metric.label === 'web-vital') {
      console.log(metric.name, metric.value);

      // Send to monitoring service
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          id: metric.id
        })
      });
    }
  });

  return null;
}

// ❌ Bad - No monitoring
// Performance degrades silently 😱
```

**Metrics to Track**:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)
- FCP (First Contentful Paint)

---

## Policy 7.3 — Image Optimization

**MUST**: Use Next.js Image component and optimize all images.

**Rationale**: Images are typically 50%+ of page weight.

**Implementation**:
```typescript
// ✅ Good - Next.js Image with optimization
import Image from 'next/image';

export function ProductCard({ product }) {
  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={300}
      height={300}
      quality={80}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL={product.blurDataUrl}
      loading="lazy" // Lazy load below fold
    />
  );
}

// ❌ Bad - Regular <img> tag
<img src={product.imageUrl} alt={product.name} />
// No optimization, no lazy loading, wrong format 😱
```

**Best Practices**:
- Use WebP/AVIF formats
- Serve responsive sizes (srcset)
- Lazy load images below fold
- Blur placeholder for better UX
- Quality 75-85 (sweet spot)
- CDN for image hosting

---

## Policy 7.4 — Code Splitting and Lazy Loading

**MUST**: Code-split routes and lazy-load heavy components.

**When to Apply**:
- Heavy third-party libraries (charts, editors)
- Components below the fold
- Modal/dialog content
- Route-based splitting (automatic in Next.js)

**Implementation**:
```typescript
// ✅ Good - Lazy loading heavy component
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const HeavyChart = lazy(() => import('@/components/heavy-chart'));
const RichTextEditor = lazy(() => import('@/components/editor'));

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Lazy load chart (only loads when rendered) */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <HeavyChart />
      </Suspense>

      {/* Lazy load editor */}
      <Suspense fallback={<div>Carregando editor...</div>}>
        <RichTextEditor />
      </Suspense>
    </div>
  );
}

// ❌ Bad - Import everything upfront
import { HeavyChart } from '@/components/heavy-chart';  // 200kb bundle
import { RichTextEditor } from '@/components/editor';  // 300kb bundle
// User downloads 500kb even if never scrolls to these 😱
```

**Route Splitting** (automatic):
```typescript
// Next.js automatically code-splits routes
app/
  products/page.tsx       // Separate bundle
  checkout/page.tsx       // Separate bundle
  dashboard/page.tsx      // Separate bundle
```

---

## Policy 7.5 — Caching Strategies

**SHOULD**: Implement multi-layer caching for optimal performance.

**Layers**:
1. **CDN Cache**: Static assets (Vercel Edge Network)
2. **Browser Cache**: Assets with long expiry
3. **Server Cache**: API responses (Redis, Upstash)
4. **Database Cache**: Query results (Drizzle + cache)

**Implementation**:
```typescript
// ✅ Good - Multi-layer caching
// Static page (CDN cached)
export const revalidate = 3600; // 1 hour

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  return <ProductDetails product={product} />;
}

// API route with Redis cache
import { redis } from '@/lib/redis';

export async function GET(req: Request) {
  const cacheKey = 'products:list';

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { 'X-Cache': 'HIT' }
    });
  }

  // Fetch from DB
  const products = await db.select().from(productsTable);

  // Store in cache (5 min TTL)
  await redis.set(cacheKey, JSON.stringify(products), { ex: 300 });

  return NextResponse.json(products, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  });
}

// ❌ Bad - No caching
// Every request hits database 😱
```

---

## Policy 7.6 — Database Query Optimization

**MUST**: Optimize slow queries using EXPLAIN ANALYZE.

**Targets**:
- Queries should complete < 100ms (p95)
- No full table scans on tables > 10k rows
- Use indexes on frequently queried columns

**Implementation**:
```typescript
// ✅ Good - Optimized query with index
// Migration: Create index
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);

// Query uses index
const products = await db
  .select()
  .from(productsTable)
  .where(eq(productsTable.category, 'electronics'))
  .orderBy(desc(productsTable.price))
  .limit(20);

// Check query plan
// EXPLAIN ANALYZE SELECT * FROM products WHERE category = 'electronics' ORDER BY price DESC LIMIT 20;
// → Index Scan using idx_products_category ✅

// ❌ Bad - Slow query without index
const products = await db
  .select()
  .from(productsTable)
  .where(sql`LOWER(name) LIKE '%${searchTerm}%'`) // Seq Scan 😱
  .limit(100);
```

**Optimization Techniques**:
- Add indexes on foreign keys
- Use composite indexes for multi-column queries
- Avoid SELECT * (select only needed columns)
- Use database-level full-text search (PostgreSQL FTS)
- Implement pagination (cursor-based)

---

## Policy 7.7 — Bundle Size Limits

**SHOULD**: Keep JavaScript bundle sizes under target limits.

**Targets**:
- **Initial JS**: < 200kb (gzipped)
- **Total JS**: < 500kb (gzipped)
- **First Load JS**: < 300kb (gzipped)

**Rationale**: Large bundles delay TTI, hurt performance on slow networks.

**Implementation**:
```typescript
// ✅ Good - Bundle analysis
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // Config...
});

// Run analysis
// ANALYZE=true npm run build

// Identify heavy dependencies
// Replace moment.js (200kb) → date-fns (10kb)
// Replace lodash (70kb) → lodash-es (tree-shakable)

// ❌ Bad - Importing entire library
import _ from 'lodash';  // Imports entire lodash 😱
import moment from 'moment';  // 200kb for date formatting 😱

// ✅ Good - Tree-shakable imports
import { debounce } from 'lodash-es';
import { format } from 'date-fns';
```

**Bundle Optimization**:
- Remove unused dependencies
- Use dynamic imports for heavy libs
- Enable tree-shaking (ES modules)
- Use babel-plugin-transform-imports
- Analyze bundle with Next.js Bundle Analyzer

---

## Policy 7.8 — Lazy Loading Below the Fold

**SHOULD**: Defer loading of content below initial viewport.

**Rationale**: Prioritize above-the-fold content for faster FCP/LCP.

**Implementation**:
```typescript
// ✅ Good - Lazy load below-fold content
'use client';
import { useInView } from 'react-intersection-observer';

export function RelatedProducts() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section ref={ref}>
      {inView ? (
        <ProductGrid products={relatedProducts} />
      ) : (
        <Skeleton className="h-96 w-full" />
      )}
    </section>
  );
}

// ✅ Good - Native lazy loading for images
<Image
  src={product.image}
  alt={product.name}
  loading="lazy" // Browser native lazy loading
  width={300}
  height={300}
/>

// ❌ Bad - Load everything upfront
export function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts /> {/* Loaded immediately */}
      <CategoryGrid /> {/* Loaded immediately */}
      <Newsletter /> {/* Loaded immediately */}
      <Footer /> {/* Loaded immediately */}
    </>
  );
  // User waits for entire page before seeing hero 😱
}
```

---

## Anti-Patterns to Avoid

❌ **Ignoring Core Web Vitals**
❌ **Using <img> instead of Next.js Image**
❌ **No code splitting (monolithic bundle)**
❌ **No caching strategy**
❌ **Slow database queries without indexes**
❌ **Bloated dependencies (moment, lodash)**
❌ **Loading all content upfront**
❌ **No performance monitoring**

---

**Last Updated**: 2025-10-23
**Policy Count**: 8
