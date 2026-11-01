# FocusDesk — A Focused Productivity Workspace

<div align="center">

![FocusDesk](https://img.shields.io/badge/FocusDesk-Productivity-27675d?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

**CHARUSAT — Faculty of Technology and Engineering**  
**Course:** Advanced Web Development Frameworks (ITUE301)  
**Program:** B.Tech IT / CE / CSE / AIML  
**Student:** Aryan Tada  

</div>

---

## Abstract

FocusDesk is a full-stack productivity workspace built as a practical Advanced Web Development Frameworks project. It brings task planning, project tracking, account preferences, and optional AI assistance together in one straightforward application.

The platform combines:
- A **React + Vite frontend** with route-based lazy loading and a restrained, accessible design system.
- An **Express backend** with JWT authentication, CRUD APIs, simple in-memory data, server-side caching, and EventEmitter-based async processing.
- **AI-powered task assistance** via Google Gemini with graceful fallback.
- **Docker** containerization and a **GitHub Actions** CI/CD pipeline.

---

## Objectives

1. Build a reusable React component library and portfolio.
2. Implement multi-route navigation and reactive state management.
3. Consume REST APIs and handle all asynchronous states.
4. Design and expose a complete Express RESTful CRUD API.
5. Manage application data with simple in-memory collections.
6. Connect the React frontend to the Express API.
7. Secure endpoints with JWT authentication and bcryptjs hashing.
8. Optimize performance with lazy loading and code splitting.
9. Add server-side in-memory caching with user-scoped invalidation.
10. Process async background events using Node.js EventEmitter.
11. Containerize all services with Docker and Docker Compose.
12. Automate testing and builds with GitHub Actions.
13. Integrate Google Gemini AI with safe fallback behavior.

---

## Key Features

- 🔐 **JWT Authentication** — secure registration, login, protected routes, password hashing with bcryptjs
- ✅ **Full Task CRUD** — create, read, update, delete with search, filter, sort, and pagination
- 📊 **Analytics Dashboard** — completion rates, weekly productivity charts via Recharts
- 🤖 **AI Task Assistant** — optional Gemini-powered description, priority, and deadline suggestions
- 🐙 **GitHub Explorer** — live public repository data from GitHub REST API
- 🔔 **Event Notifications** — async EventEmitter-driven activity log
- ⚡ **Caching** — node-cache with user-scoped keys and automatic invalidation
- 📦 **Docker** — simple Compose orchestration for frontend and backend
- 🚀 **CI/CD** — GitHub Actions with build and test automation
- 🎨 **Design System** — warm neutral surfaces, deep green accents, and clear typography
- 📱 **Responsive** — mobile-first layout with collapsible sidebar

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, React Router DOM 7 |
| Styling | Tailwind CSS 4, custom CSS design tokens |
| Icons | Lucide React |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend | Node.js 20, Express 5 |
| Data | Node.js in-memory collections (reset on backend restart) |
| Auth | JSON Web Tokens (jsonwebtoken), bcryptjs |
| Validation | express-validator |
| Caching | node-cache |
| Events | Node.js native EventEmitter |
| AI | Google Gemini API (@google/generative-ai) |
| Testing | Jest, Supertest (backend) |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Logging | Morgan |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React SPA)                   │
│  Landing → Auth → Dashboard → Tasks → AI → Portfolio    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / HTTP
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Express API Server (Port 5000)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Auth Routes│  │ Task Routes │  │ Project Routes  │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
│         │                │                   │           │
│  ┌──────▼────────────────▼───────────────────▼────────┐  │
│  │          Middleware Pipeline                        │  │
│  │  Morgan → CORS → JWT Protect → Validation → Error  │  │
│  └─────────────────────────┬───────────────────────────┘  │
│                            │                              │
│  ┌─────────────────────────▼───────────────────────────┐  │
│  │  node-cache (in-memory, process-local)              │  │
│  └─────────────────────────┬───────────────────────────┘  │
│                            │                              │
│  ┌─────────────────────────▼───────────────────────────┐  │
│  │  EventEmitter (async notifications, non-blocking)   │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  In-memory app data (users, tasks, projects, alerts)    │
│  Lives in the backend process; reset when it stops      │
└─────────────────────────────────────────────────────────┘
```

---

## Data Lifecycle

The backend keeps users, tasks, projects, and notifications in simple in-memory collections. This keeps local setup straightforward: no external data service or connection settings are needed. All app data is cleared whenever the backend stops or restarts.

---

## API Endpoint Documentation

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health and uptime |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Protected Endpoints (require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user profile |
| PATCH | `/api/auth/me` | Update profile/preferences |
| GET | `/api/tasks` | List tasks (with filter, sort, paginate, search, cache) |
| GET | `/api/tasks/stats` | Dashboard analytics |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create task (emits task-created event) |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Get project with tasks |
| POST | `/api/projects` | Create project |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/notifications` | Get notification history |
| PATCH | `/api/notifications/read` | Mark notifications as read |
| POST | `/api/ai/suggest` | Generate AI task suggestions |
| GET | `/api/performance` | Cache and server performance stats |

### Response Format

All responses follow a consistent structure:

```json
{
  "success": true,
  "data": { ... }
}
```

Errors:
```json
{
  "success": false,
  "error": "Human-readable message",
  "details": [ { "field": "email", "message": "Invalid email" } ]
}
```

---

## Authentication & Security

- Passwords are hashed with **bcryptjs** (12 salt rounds) before storage.
- Password hashes are **never** included in API responses.
- JWTs are signed with `JWT_SECRET` (from environment, never hardcoded).
- Tokens include `exp` (expiry, default 7 days).
- All protected routes validate the JWT via `protect` middleware before handler execution.
- Task and project queries always scope to `createdBy: req.user._id` — users cannot access others' data.
- Secrets are read from environment variables (`.env`). The `.env` file is gitignored.
- The browser currently stores the bearer token in `localStorage`; this is scoped for the educational SPA but is exposed to successful XSS. A production deployment should prefer Secure, HttpOnly, SameSite cookies plus CSRF defenses.

---

## Caching Strategy

- **Library:** `node-cache` (in-memory, process-local)
- **Cached:** `GET /api/tasks` responses, scoped per user + query parameters
- **Cache key:** `tasks_<userId>_<JSON.stringify(queryParams)>`
- **TTL:** 300 seconds (5 minutes)
- **Invalidation:** Any `POST`, `PATCH`, or `DELETE` on tasks invalidates all cached keys for that user
- **Limitation:** This is a single-process cache. In a horizontally scaled deployment, use Redis instead.

Response includes `cached: true` and `responseTimeMs` for measurement.

---

## Event-Driven Processing

- **Module:** Node.js native `EventEmitter` (class `TaskEventEmitter`)
- **Events:** `task-created`, `task-updated`, `task-completed`, `task-deleted`
- **Behavior:**
  1. Task is added to the backend's in-memory collection.
  2. HTTP response is sent immediately (201 Created).
  3. `setImmediate()` schedules event emission after response.
  4. Async listener adds a notification to the in-memory collection.
  5. API response and listener timestamps are logged, demonstrating non-blocking execution.
- **Error isolation:** Listener errors are caught internally and never affect the original HTTP response.
- **Limitation:** EventEmitter is not durable — events are lost if the process crashes before the listener completes. For production, use a message queue (Redis Pub/Sub, RabbitMQ, etc.).

---

## Performance Optimization

### Frontend (Week 8)
- All routes are lazy-loaded with `React.lazy()` and `<Suspense>` boundaries.
- Vite `manualChunks` splits vendor, router, charts, and icons into separate chunks.
- Skeleton loaders display during data fetch.

### Measurement Procedure
```bash
cd frontend
npm run build
# Inspect dist/ directory for chunk sizes:
ls -lh dist/assets/
# Or use Vite bundle analyzer:
npx vite-bundle-analyzer dist/
```

### Backend (Week 9)
- `GET /api/tasks` response includes `responseTimeMs` and `cached: true/false`.
- `GET /api/performance` exposes cache hit/miss statistics.

---

## Docker Setup

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine + Compose Plugin (Linux)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/ayu2k06/AWDF-PROJECT.git
cd AWDF-PROJECT

# Create a root-level .env file for Compose and configure JWT_SECRET
# optionally set GEMINI_API_KEY
# Generate a local secret with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# Build and start all services
docker compose up --build

# Services:
#   Frontend:  http://localhost:3000
#   Backend:   http://localhost:5000
#   Health:    http://localhost:5000/api/health
```

On Windows PowerShell, copy the example with `Copy-Item .env.example .env`, edit the file, and then run `docker compose up --build` from the repository root.

### Environment Variables for Docker
```bash
# Set these in the repository-root .env file (never commit it):
NODE_ENV=production
PORT=5000
JWT_SECRET=<at least 32 random characters; do not use the example placeholder>
GEMINI_API_KEY=<your key or leave blank for fallback>
CORS_ORIGINS=http://localhost:3000
```

### Individual Container Management
```bash
docker compose up backend          # start only the backend API
docker compose logs -f backend     # tail backend logs
docker compose down                # stop all containers
```

---

## CI/CD Workflow

The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push to `main` and pull requests:

| Job | What It Does |
|-----|-------------|
| `backend-tests` | Installs deps, runs Jest/Supertest tests |
| `frontend-build` | Installs deps, runs Vitest component tests and `vite build`, uploads dist artifact |
| `lint` | Runs `oxlint` on frontend source |

### Demonstrating a Failing CI Run (Week 12 requirement)
```bash
git checkout -b demo/failing-test
# Edit backend/src/tests/api.test.js:
#   Change: expect(res.statusCode).toBe(200);
#   To:     expect(res.statusCode).toBe(999);   # deliberately wrong
git add backend/src/tests/api.test.js
git commit -m "demo: failing CI test"
git push origin demo/failing-test
# Open PR — GitHub will show RED failing run
# Fix it back and push again for GREEN run
```

---

## AI Integration

- **Provider:** Google Gemini 1.5 Flash via `@google/generative-ai`
- **Endpoint:** `POST /api/ai/suggest` (protected)
- **Input:** `{ title: String, context?: String }`
- **Output:** `{ description, priority, suggestedDeadlineDays, explanation, tags, source, disclaimer }`
- **Fallback:** Deterministic keyword-based suggestions when API key is absent or service is unavailable
- **API key:** Stored in `GEMINI_API_KEY` environment variable — never in frontend code
- **Input sanitization:** Title truncated at 200 chars, context at 500 chars
- **Output validation:** Priority constrained to `low|medium|high|urgent`, deadline 1–365 days
- **Disclaimer:** All suggestions include a disclaimer that they are recommendations, not facts

### Get a Free Gemini API Key
1. Visit [https://aistudio.google.com/](https://aistudio.google.com/)
2. Sign in with a Google account
3. Create an API key
4. Add it to `backend/.env` as `GEMINI_API_KEY=<your key>`

---

## Local Installation

### Prerequisites
- Node.js 20+

### Backend Setup
```bash
cd backend
# Configure JWT_SECRET in backend/.env (or provide it in the environment)
npm install                   # or run npm run install:all from the repository root
npm run dev                   # starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev                   # starts on http://localhost:5173
# Vite dev proxy forwards /api → http://localhost:5000
```

### Both Together (from root)
```bash
npm run install:all
# In terminal 1:
npm run dev:backend
# In terminal 2:
npm run dev:frontend
```

---

## Testing

### Frontend Component Tests
```bash
cd frontend
npm run test:run
```

The Vitest/React Testing Library suite verifies a reusable status badge and modal interaction. CI builds the frontend and runs this suite.

### Backend Tests
```bash
cd backend
npm test                    # runs Jest + Supertest
npm run test:coverage       # generates coverage report
```

Tests cover:
- `GET /api/health` — returns 200 with status ok
- `POST /api/auth/register` — validation errors (missing fields, invalid email, short password)
- `POST /api/auth/login` — rejects malformed credentials
- `GET /api/ready` — reports that the API is ready
- deterministic AI fallback — returns bounded, reviewable suggestions
- `GET /api/tasks` — rejects unauthenticated requests (401)
- `POST /api/tasks` — rejects unauthenticated requests
- `GET /api/nonexistent` — returns 404

> **Note:** App data is kept in memory and is cleared when the backend restarts. AI suggestions use a deterministic fallback unless a Gemini key is configured.

---

## Performance Benchmarking

### Frontend Bundle Analysis
```bash
cd frontend && npm run build
# Check output sizes in dist/assets/
# Compare the emitted files and Vite's reported gzip sizes; do not assume target sizes.
```

### Backend Cache Measurement
```bash
# First request (cache MISS):
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/tasks
# Record the actual cached flag and responseTimeMs from this environment.

# Second identical request (cache HIT):
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/tasks
# Record the actual cached flag and responseTimeMs from this environment.
```

Full benchmark results: see [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md)

---

## Week-by-Week Feature Mapping

| Week | Topic | Key Files |
|------|-------|-----------|
| 1 | React Components | `components/portfolio/`, `components/ui/index.jsx` |
| 2 | State & Routing | `App.jsx`, `context/`, `pages/portfolio/` |
| 3 | API Integration | `pages/GitHubExplorerPage.jsx`, `services/api.js` |
| 4 | REST API | `backend/src/routes/`, `controllers/`, `app.js` |
| 5 | In-memory data | `backend/src/services/memoryStore.js` |
| 6 | Full-Stack | `services/api.js`, `pages/TasksPage.jsx` |
| 7 | JWT Auth | `controllers/authController.js`, `middleware/auth.js` |
| 8 | Lazy Loading | `App.jsx` (React.lazy), `vite.config.js` (manualChunks) |
| 9 | Caching | `services/cacheService.js`, `controllers/taskController.js` |
| 10 | EventEmitter | `events/taskEvents.js`, `controllers/taskController.js` |
| 11 | Docker | `Dockerfile` (x2), `docker-compose.yml` |
| 12 | CI/CD | `.github/workflows/ci.yml`, `tests/api.test.js` |
| 13 | AI Integration | `services/aiService.js`, `pages/AiAssistantPage.jsx` |

---

## Coursera Module Mapping

See [COURSE_MODULE_MAPPING.md](./COURSE_MODULE_MAPPING.md) for full coverage.

---

## Known Limitations & Future Enhancements

### Current Limitations
- In-memory cache (`node-cache`) is process-local — not suitable for multi-instance deployments.
- EventEmitter notifications are not durable — lost if process restarts mid-handler.
- No WebSocket real-time updates (polling required).
- No email verification or password reset flow.
- No file/attachment support for tasks.
- The contact form validates and displays local submission feedback; it does not deliver email or persist contact messages.
- App data (including accounts) is process-local and cleared when the backend restarts.
- GitHub Actions is configured but its hosted run status is not asserted here. Check the repository Actions tab for the actual result.
- Performance values must be collected on the evaluating machine; this repository does not treat illustrative examples as measured results.

### Future Enhancements
- Replace node-cache with Redis for distributed caching.
- Replace EventEmitter with a message queue (BullMQ, RabbitMQ) for durable processing.
- Add WebSocket/SSE for real-time dashboard updates.
- Implement Vitest frontend unit tests.
- Add Kubernetes deployment manifests.
- Implement drag-and-drop Kanban board view.
- Add task recurrence and reminders.

---

## Academic Context

- **University:** Charotar University of Science and Technology (CHARUSAT)
- **Faculty:** Faculty of Technology and Engineering
- **Course:** Advanced Web Development Frameworks (ITUE301)
- **Semester:** 5 · Academic Year 2024–2025
- **Student:** Aryan Tada
- **GitHub:** [ayu2k06](https://github.com/ayu2k06)

---

*This is an educational project built to demonstrate full-stack web development competency across 13 practical weeks of the AWDF curriculum.*
