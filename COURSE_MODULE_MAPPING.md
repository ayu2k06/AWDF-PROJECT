# COURSE_MODULE_MAPPING.md — FocusDesk

**Course:** Advanced Web Development Frameworks (ITUE301)  
**University:** CHARUSAT — Faculty of Technology and Engineering  
**Program:** B.Tech IT / CE / CSE / AIML  
**Student:** Aryan Tada  

> This document maps each Coursera module to the specific implementation in the FocusDesk codebase.
> It does not claim external course completion — it demonstrates how each module's concepts are applied.
> `MAIN WORK.pdf` was not present in the available workspace during this implementation review; this mapping follows the explicit 13-week and 16-module requirements in the supplied project prompt. Compare against the PDF when it is available.

---

## Module 1 — Modern Frontend Architecture and Accessible User Experience

**Feature/Implementation:**  
Full design system and accessible component architecture. Electric violet/cyan/graphite dark theme with semantic HTML, focus states, ARIA attributes, and responsive layouts.

**Source Files:**
- `frontend/src/index.css` — complete design token system, animations, component classes
- `frontend/src/components/ui/index.jsx` — `Badge`, `Modal`, `ConfirmDialog`, `Input`, `Select`, `EmptyState`, `ProgressBar`
- `frontend/src/components/layout/AppLayout.jsx`, `Sidebar.jsx`, `TopNav.jsx`

**How to Demonstrate:**
1. Open the application at `http://localhost:5173`
2. Tab through the landing page — all interactive elements have visible focus rings
3. Resize the window to mobile — use the menu button to open and close the sidebar
4. Inspect `index.css` for `--color-brand-*` tokens and ARIA labels in components

**Acceptance Criteria:** ✅ Consistent design tokens; accessible focus states; responsive layout; semantic HTML elements.

---

## Module 2 — Set Up a Modern React Workspace

**Feature/Implementation:**  
Vite + React 19 project with Tailwind CSS 4, Oxlint, `/api` development proxy, and optimized code-split build configuration.

**Source Files:**
- `frontend/package.json` — dependency configuration
- `frontend/vite.config.js` — plugins, dev proxy, manual chunks, test configuration
- `frontend/.gitignore` — excludes `dist/`, `node_modules/`

**How to Demonstrate:**
```bash
cd frontend && npm run dev      # Vite dev server starts on :5173
cd frontend && npm run build    # Production build with chunk splitting
```

**Acceptance Criteria:** ✅ `npm run dev` starts without errors; `npm run build` produces optimized bundles.

---

## Module 3 — Build Interfaces with React Components

**Feature/Implementation:**  
Student portfolio with four independently structured reusable components: `PortfolioHeader`, `PortfolioAbout`, `PortfolioSkills`, and `PortfolioFooter`. Shared UI component library used across the entire application.

**Source Files:**
- `frontend/src/components/portfolio/PortfolioHeader.jsx`
- `frontend/src/components/portfolio/PortfolioAbout.jsx`
- `frontend/src/components/portfolio/PortfolioSkills.jsx`
- `frontend/src/components/portfolio/PortfolioFooter.jsx`
- `frontend/src/components/ui/index.jsx`

**How to Demonstrate:**
1. Navigate to `http://localhost:5173/portfolio`
2. Each section (header, about, skills, footer) is a separate reusable component
3. The same `Badge`, `LoadingSpinner`, `Modal`, and `Button` components appear across all pages

**Acceptance Criteria:** ✅ Portfolio components render independently; shared UI components reused across the application.

---

## Module 4 — Manage Props, State, and Debugging

**Feature/Implementation:**  
React hooks (`useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`) managing form state, filter toggles, modal open/close, authentication state, and task data.

**Source Files:**
- `frontend/src/context/AuthContext.jsx` — global auth state with `useCallback`
- `frontend/src/context/ToastContext.jsx` — global notification state
- `frontend/src/pages/TasksPage.jsx` — filter/sort/search state, modal state
- `frontend/src/pages/DashboardPage.jsx` — stats state with loading/error

**How to Demonstrate:**
1. Log in and create a task — observe the UI refresh after the API returns the new task
2. Toggle filters on the Tasks page — state updates without re-mounting
3. Open and close the task creation modal — controlled state

**Acceptance Criteria:** ✅ Forms, filters, and modals respond to state changes; API errors are surfaced inline or through toasts. A global React render-error boundary is not currently implemented.

---

## Module 5 — Create Navigation and Forms in React

**Feature/Implementation:**  
React Router DOM 7 with nested routes, protected routes, breadcrumbs, a portfolio navigation menu, and validated controlled forms for registration, login, task creation, and contact.

**Source Files:**
- `frontend/src/App.jsx` — full route tree
- `frontend/src/routes/ProtectedRoute.jsx` — auth guard
- `frontend/src/pages/portfolio/PortfolioContactPage.jsx` — validated contact form
- `frontend/src/pages/LoginPage.jsx`, `RegisterPage.jsx` — auth forms

**How to Demonstrate:**
1. Visit `/login` while unauthenticated — works
2. Visit `/dashboard` while unauthenticated — redirected to `/login`
3. Navigate `/portfolio` → `/portfolio/projects` → `/portfolio/contact` — no full page reloads
4. Submit the contact form with empty fields — inline validation errors appear
5. Submit valid details — client-side confirmation appears; no email is delivered or message persisted

**Acceptance Criteria:** ✅ Navigation works without page reloads; protected routes redirect; form validation is reactive.

---

## Module 6 — Data Management, Security, and Scalable Web Infrastructure

**Feature/Implementation:**  
Centralized Axios client with JWT interceptors, environment-based API URL configuration, and structured API response format with error normalization.

**Source Files:**
- `frontend/src/services/api.js` — Axios instance, request/response interceptors, typed API modules
- `frontend/vite.config.js` — dev proxy (`/api` → `localhost:5000`)
- `backend/src/app.js` — centralized error handling, CORS, logging

**How to Demonstrate:**
1. Open browser DevTools → Network tab
2. Log in and make a task request — observe `Authorization: Bearer <token>` header
3. Observe request and response structure in the Network tab

**Acceptance Criteria:** ✅ All API calls use the centralized client; 401 responses clear React auth state; API errors are surfaced to calling pages.

---

## Module 7 — Fetch and Present API Data

**Feature/Implementation:**  
GitHub REST API integration with all request states: loading skeleton, success, empty, error, and retry. Reusable `LoadingSpinner`, `SkeletonLoader`, and `ErrorMessage` components.

**Source Files:**
- `frontend/src/pages/GitHubExplorerPage.jsx` — fetch, loading, error, empty, retry
- `frontend/src/components/ui/index.jsx` — `SkeletonLoader`, `SkeletonCard`, `ErrorMessage`, `EmptyState`

**How to Demonstrate:**
1. Navigate to the GitHub Explorer page
2. Observe skeleton loaders during fetch
3. Enter a GitHub username and view repositories
4. Disconnect from internet — error state with retry button appears
5. Search for a username with no public repos — empty state appears

**Acceptance Criteria:** ✅ Repositories are fetched live from GitHub API; all request states are visible; API failures do not crash the app.

---

## Module 8 — Build REST APIs with Express 5

**Feature/Implementation:**  
Express 5 REST API with modular route structure, middleware pipeline (CORS, Morgan, custom logger, JSON parsing), liveness/readiness endpoints, and centralized 404/error handlers.

**Source Files:**
- `backend/src/app.js` — Express setup and middleware
- `backend/src/routes/taskRoutes.js`, `authRoutes.js`, `projectRoutes.js`, `utilRoutes.js`
- `backend/src/middleware/errorHandler.js`

**How to Demonstrate:**
```bash
curl http://localhost:5000/api/health
# → {"success":true,"data":{"status":"ok","timestamp":"...",...}}

curl http://localhost:5000/api/ready
# → 200 when the API is ready

curl http://localhost:5000/api/tasks
# → {"success":false,"error":"Not authorized. No token provided."}

curl http://localhost:5000/api/nonexistent
# → {"success":false,"error":"Route not found: GET /api/nonexistent"}
```

**Acceptance Criteria:** ✅ All CRUD routes exist; middleware pipeline executes in order; global error handler returns consistent JSON.

---

## Module 9 — Implement CRUD, Validation, and Errors

**Feature/Implementation:**  
Complete task CRUD with `express-validator` server-side validation, ownership checks, HTTP status codes, and centralized error responses. Input validation runs before changing in-memory app state.

**Source Files:**
- `backend/src/controllers/taskController.js` — all CRUD handlers
- `backend/src/routes/taskRoutes.js` — validation middleware arrays
- `backend/src/middleware/errorHandler.js` — centralized Express error handling

**How to Demonstrate:**
```bash
# Missing title → 422
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" -d '{}'

# Invalid status enum → 422
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Test","status":"invalid"}'

# Valid task → 201
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Valid Task"}'
```

**Acceptance Criteria:** ✅ Invalid input returns 422 with field-level details; valid input updates in-memory app state.

---

## Module 10 — Manage In-Memory Application Data

**Feature/Implementation:**  
Users, tasks, projects, and notifications are managed with simple JavaScript maps in one process-local store. The API applies validation, filtering, sorting, pagination, and ownership checks directly to those records. Data is cleared when the backend stops.

**Source Files:**
- `backend/src/services/memoryStore.js` — in-memory collections and record helpers
- `backend/src/controllers/taskController.js` — task filtering and statistics
- `backend/src/controllers/authController.js` — password hashing and account handling

**How to Demonstrate:**
1. Create a task without a title — validation returns 422
2. Register the same email twice — the second request returns 409
3. Query tasks via `GET /api/tasks?status=todo&priority=high&search=bug` — in-memory filters apply

**Acceptance Criteria:** ✅ API validation, filtering, timestamps, and ownership checks work; records are cleared when the backend restarts.

---

## Module 11 — Connect the Frontend and Backend

**Feature/Implementation:**  
React frontend communicates with Express backend via Axios. Task CRUD operations update the backend's in-memory collections. Environment-based API URL. Consistent error messages from backend are displayed in the frontend UI.

**Source Files:**
- `frontend/src/services/api.js` — all API modules
- `frontend/src/pages/TasksPage.jsx` — create/read/update/delete tasks with real API
- `frontend/src/pages/DashboardPage.jsx` — reads task statistics from the API

**How to Demonstrate:**
1. Create a task in the UI
2. Refresh the task list — the task remains while the backend is running
3. Restart the backend — in-memory app data is cleared
4. Stop the backend — UI shows a connection error state

**Acceptance Criteria:** ✅ Tasks created in UI appear in API responses; backend errors display in UI; process-local data resets on restart.

---

## Module 12 — Secure Authentication and Access Control

**Feature/Implementation:**  
User registration/login with bcryptjs password hashing, JWT generation, `protect` middleware on all task/project endpoints, and per-user data isolation.

**Source Files:**
- `backend/src/controllers/authController.js` — register, login, getMe
- `backend/src/middleware/auth.js` — JWT verification and user attachment
- `backend/src/services/memoryStore.js` — process-local user records

**How to Demonstrate:**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'

# Login → get token
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"alice@example.com","password":"password123"}'

# Try to access tasks of User A with User B's token → 404 (not found, not exposed)
```

**Acceptance Criteria:** ✅ Passwords hashed; plaintext never stored; JWT required for protected routes; cross-user data access returns 404.

---

## Module 13 — Improve Performance and Observability

**Feature/Implementation:**  
Route-based lazy loading with `React.lazy()` + `<Suspense>`, Vite `manualChunks`, server-side `node-cache` with user-scoped keys, cache hit/miss logging, and response-time measurement.

**Source Files:**
- `frontend/src/App.jsx` — all routes lazy-loaded
- `frontend/vite.config.js` — `manualChunks` configuration
- `backend/src/services/cacheService.js` — node-cache wrapper
- `backend/src/controllers/taskController.js` — cache logic with timing

**How to Demonstrate:**
1. Run `npm run build` — inspect chunk files in `dist/assets/`
2. `GET /api/tasks` twice — first returns `cached: false`, second `cached: true`
3. `GET /api/performance` — shows hit/miss count and cache statistics

**Acceptance Criteria:** ✅ Separate JS chunks per route; cache hit/miss and response-time fields are available; writes invalidate user-scoped entries. A live timing comparison can be collected against the in-memory task store.

---

## Module 14 — Cloud-Native Reliability and Performance Engineering

**Feature/Implementation:**  
Docker containerization for the frontend and backend with health checks and a non-root backend user.

**Source Files:**
- `backend/Dockerfile` — production Node.js container with health check
- `frontend/Dockerfile` — multi-stage build (Node builder → Nginx server)
- `docker-compose.yml` — backend and frontend services with health checks
- `backend/.dockerignore`, `frontend/.dockerignore`

**How to Demonstrate:**
```bash
docker compose up --build
# Frontend: http://localhost:3000
# Backend health: http://localhost:5000/api/health
docker compose down
docker compose up  # backend app data starts empty
```

**Acceptance Criteria:** ✅ Compose defines frontend and backend services with health checks. App data is process-local and is not preserved between backend restarts.

---

## Module 15 — Package, Test, and Automate Delivery

**Feature/Implementation:**  
Jest + Supertest backend tests cover auth validation, JWT protection, health/readiness, deterministic AI fallback, and not-found handling. Vitest + React Testing Library exercise reusable UI behavior. GitHub Actions runs backend tests, frontend tests/build, and lint.

**Source Files:**
- `backend/src/tests/api.test.js` — test suite
- `frontend/src/tests/ui.test.jsx` — shared UI tests
- `frontend/vite.config.js` — Vitest/jsdom configuration
- `.github/workflows/ci.yml` — full CI/CD pipeline
- `backend/package.json` — Jest configuration

**How to Demonstrate:**
```bash
cd backend && npm test
# Should see: Tests: X passed, 0 failed

cd ../frontend && npm run test:run
# Shared UI component tests

# To demonstrate failing CI (Week 12 requirement):
git checkout -b demo/failing-test
# Edit api.test.js: change .toBe(200) to .toBe(999)
git push origin demo/failing-test
# → GitHub Actions shows RED failing run
# Fix and push → GREEN passing run
```

**Acceptance Criteria:** ✅ Workflow is configured for pushes to `main` and pull requests; test/build/lint failures fail their jobs. Verify hosted status in the GitHub Actions tab; no hosted run is claimed here.

---

## Module 16 — Extend with AI and Evaluate Architecture

**Feature/Implementation:**  
Google Gemini 1.5 Flash integration for task suggestions. Backend-only API key storage. Input sanitization and output validation. Deterministic keyword-based fallback. UI displays loading, success, error, and fallback states. User reviews suggestions before saving.

**Source Files:**
- `backend/src/services/aiService.js` — Gemini integration + fallback
- `backend/src/controllers/utilController.js` — `suggestTask` endpoint
- `backend/src/routes/utilRoutes.js` — `/api/ai/suggest` route
- `frontend/src/pages/AiAssistantPage.jsx` — full AI suggestion UI

**How to Demonstrate:**
1. Navigate to AI Assistant page
2. Enter a task title like "Fix critical authentication bug"
3. Click "Get AI Suggestions"
4. AI returns description, priority (high/urgent), deadline, and explanation
5. Remove `GEMINI_API_KEY` from `.env` → fallback suggestions still appear
6. Simulate rate limit → graceful error message shown

**Acceptance Criteria:** ✅ AI suggestions generated from task title; fallback works without API key; credentials never in frontend; core CRUD unaffected by AI failures.

---

*Document prepared by Aryan Tada for CHARUSAT AWDF (ITUE301) — Academic Year 2024–2025.*
