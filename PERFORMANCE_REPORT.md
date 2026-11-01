# PERFORMANCE_REPORT.md — FocusDesk

**Week 8 & 9 Requirements: Performance Optimization, Lazy Loading, and Caching**  
**Student:** Aryan Tada | **Course:** AWDF ITUE301 | **University:** CHARUSAT  

---

## Overview

This document covers:
1. **Frontend**: Route-based lazy loading and bundle size analysis.
2. **Backend**: In-memory caching with response-time comparison.

All measurements below use reproducible procedures. If you are evaluating this project, follow the measurement steps to obtain your own numbers.

---

## Part 1: Frontend Lazy Loading & Bundle Analysis (Week 8)

### Implementation

All route components are lazy-loaded using `React.lazy()` in `frontend/src/App.jsx`:

```jsx
const DashboardPage  = lazy(() => import('./pages/DashboardPage'));
const TasksPage      = lazy(() => import('./pages/TasksPage'));
const AiAssistantPage = lazy(() => import('./pages/AiAssistantPage'));
// ... all routes
```

Vite `manualChunks` in `vite.config.js`:
```js
manualChunks: {
  vendor: ['react', 'react-dom'],
  router: ['react-router-dom'],
  charts: ['recharts'],
  icons:  ['lucide-react'],
}
```

### Measurement Procedure

```bash
cd frontend
npm run build
# After build completes, inspect dist/assets/:
ls -lh dist/assets/
```

Observed chunk structure from the local production build on 2026-10-30 (`npm run build`):

| Chunk | Purpose | Raw Size | Gzip Size |
|-------|---------|----------|-----------|
| `vendor-*.js` | React + React DOM | 207.11 KB | 64.95 KB |
| `router-*.js` | React Router DOM | 38.14 KB | 13.64 KB |
| `charts-*.js` | Recharts | 375.65 KB | 108.78 KB |
| `icons-*.js` | Lucide React | 17.02 KB | 6.30 KB |
| `index-*.js` | App shell | 85.30 KB | 29.16 KB |
| `index-*.css` | Styles | 15.07 KB | 4.19 KB |
| Per-route chunks | Individual page code | 3.38–10.11 KB each | 1.47–3.21 KB each |

The final generated `dist/assets` directory contained 23 assets totaling **846,688 bytes**. Vite reported per-file gzip sizes above. This is a build measurement, not a browser transfer or page-load timing measurement.

### Before vs. After Code Splitting

No comparable pre-code-splitting build artifact is present in this workspace, so a before value is not claimed. For a defensible comparison, build the pre-lazy-loading and current revisions with the same Node/npm versions, then compare emitted JS bytes and the JS transferred on the same initial route in browser DevTools.

**With lazy loading** (current implementation):
- The app shell and dependencies needed by the initial route load first; route pages are fetched as needed.
- Individual page bundles load on demand when the route is first visited.
- Dashboard loads without downloading AI Assistant or GitHub Explorer code.

### Initial Load Timing Procedure

1. Run `npm run build && npm run preview` in the `frontend/` directory.
2. Open `http://localhost:4173` in Chrome.
3. Open DevTools → Network tab → Disable cache checkbox.
4. Reload the page.
5. Observe:
   - **JS transferred on first load** (landing page only): check totals in the Network tab
   - Navigate to `/dashboard` — additional chunk downloaded
   - Navigate to `/ai-assistant` — AI page chunk downloaded separately

### Suspense Fallbacks

Each lazy route is wrapped in `<Suspense fallback={<PageLoader />}>`. The `PageLoader` component renders a centered `LoadingSpinner` while the chunk downloads. This prevents layout shifts during navigation.

---

## Part 2: Backend In-Memory Caching (Week 9)

### Implementation

**Library:** `node-cache` v5.1.2 (single-process, in-memory)  
**Cache key format:** `tasks_<userId>_<JSON.stringify(queryParams)>`  
**TTL:** 300 seconds (5 minutes)

**Service:** `backend/src/services/cacheService.js`  
**Integration:** `backend/src/controllers/taskController.js` — `getTasks()` handler

```
GET /api/tasks
  ├─ Check cache → HIT → return cached response (+ cached: true)
  └─ MISS → filter in-memory tasks → store in cache → return response (+ cached: false)

POST/PATCH/DELETE /api/tasks
  └─ Invalidate all cached keys for this user
```

### Response-Time Comparison Procedure

```bash
# Step 1: Authenticate and get a token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}' \
  | node -e "let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>console.log(JSON.parse(d).data.token))")

# Step 2: First request — cache MISS
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/tasks \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{let r=JSON.parse(d);console.log('cached:',r.cached,'time:',r.responseTimeMs+'ms')})"
# Record the returned cached flag and responseTimeMs; do not infer a benchmark value.

# Step 3: Repeat immediately — cache HIT
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/tasks \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{let r=JSON.parse(d);console.log('cached:',r.cached,'time:',r.responseTimeMs+'ms')})"
# Record the returned cached flag and responseTimeMs; results depend on the environment.

# Step 4: Create a task — invalidates cache
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Cache test task"}' \
  http://localhost:5000/api/tasks > /dev/null

# Step 5: Request again — cache MISS (cache was invalidated)
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/tasks \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{let r=JSON.parse(d);console.log('cached:',r.cached,'time:',r.responseTimeMs+'ms')})"
# Record that the next request is a miss after successful mutation.
```

### Observed API Results

No cache response-time comparison was captured in this workspace. Use the procedure above and record measured values on the target machine; do not present uncollected estimates as results.

### Cache Statistics Endpoint

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/performance
```

The endpoint returns live `hits`, `misses`, `invalidations`, `hitRate`, active key count, and process metrics. Counters start from zero when the backend process starts; no sample values are presented as measured results.

This is also visible in the **Performance** page in the application UI.

---

## Part 3: Caching Limitations and Production Considerations

### Current Implementation Limitations

1. **Process-local:** `node-cache` stores data in the Node.js process heap. If you run multiple backend instances (e.g., with `pm2 cluster` or Kubernetes replicas), each process has its own independent cache — a cache hit on one server is a miss on another.

2. **Not persistent:** Cache and application data are cleared on server restart.

3. **No granular invalidation:** We invalidate **all** cached queries for a user when any task is mutated. This is safe but potentially over-invalidates (e.g., invalidating a different-page cache when only one task changes).

### Production Recommendations

- Replace `node-cache` with **Redis** using `ioredis` for distributed, persistent caching.
- Use a **Least-Recently-Used (LRU)** eviction strategy for high-traffic scenarios.
- For larger task lists, consider a more efficient search strategy than scanning in-memory task records.

---

## Summary

| Metric | Result |
|--------|--------|
| Lazy loading implemented | ✅ All routes |
| Suspense fallbacks | ✅ `<PageLoader />` |
| Chunk splitting | ✅ vendor, router, charts, icons |
| Server-side caching | ✅ `node-cache` |
| Cache key scoping | ✅ Per user + query params |
| Cache invalidation on writes | ✅ POST, PATCH, DELETE |
| Response-time measurement | ✅ `responseTimeMs` in response |
| Performance endpoint | ✅ `GET /api/performance` |

---

*Document prepared by Aryan Tada — CHARUSAT AWDF ITUE301 — 2024–2025*
