# API_DOCUMENTATION.md — FocusDesk API

**Base URL (Local Development):** `http://localhost:5000/api`  
**Version:** 1.0  
**Authentication:** Bearer token (JWT) in `Authorization` header

---

## Response Format

All endpoints return consistent JSON:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Human-readable description",
  "details": [ { "field": "email", "message": "Invalid email format" } ]
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 422 | Unprocessable Entity (validation errors) |
| 500 | Internal Server Error |
| 503 | Service Unavailable (e.g., AI rate limit) |

---

## Public Endpoints

### GET /api/health

Returns server health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "uptime": 3600.5,
    "memory": { "heapUsed": "45MB", "heapTotal": "72MB" },
    "node": "v20.11.0",
    "environment": "development"
  }
}
```

### GET /api/ready

Deployment readiness probe. Returns HTTP 200 when the API is ready to handle requests.

> User accounts, tasks, projects, and notifications are held in memory and are cleared when the backend restarts.

---

### POST /api/auth/register

Register a new user account.

**Body:**
```json
{
  "name": "Aryan Tada",
  "email": "aryan@example.com",
  "password": "securepassword123"
}
```

**Validation Rules:**
- `name`: required, 2–100 characters
- `email`: required, valid email format
- `password`: required, minimum 6 characters

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Aryan Tada", "email": "aryan@example.com" },
    "token": "<jwt>"
  }
}
```

---

### POST /api/auth/login

Authenticate and receive a JWT.

**Body:**
```json
{
  "email": "aryan@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Aryan Tada", "email": "aryan@example.com" },
    "token": "<jwt>"
  }
}
```

---

## Protected Endpoints

> All requests require: `Authorization: Bearer <token>`

---

### GET /api/auth/me

Get the currently authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "...", "email": "...", "preferences": {} }
  }
}
```

---

### PATCH /api/auth/me

Update profile or preferences.

**Body (all optional):**
```json
{
  "name": "New Name",
  "preferences": { "theme": "light" }
}
```

---

## Tasks

### GET /api/tasks

List tasks with optional filtering, sorting, pagination, and search. Results are cached per user per query combination.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `status` | string | Filter: `todo`, `in-progress`, `completed` | — |
| `priority` | string | Filter: `low`, `medium`, `high`, `urgent` | — |
| `category` | string | Filter by category string | — |
| `dueDate` | string | `overdue`, `due-soon` (next 3 days), `upcoming`, or `no-date` | — |
| `project` | string | Filter by project ID | — |
| `search` | string | Case-insensitive literal substring search across title, description, and tags (max 100 characters) | — |
| `sortBy` | string | `createdAt`, `updatedAt`, `dueDate`, `title`, `priority`, or `status` | `createdAt` |
| `sortOrder` | string | `asc` or `desc` | `desc` |
| `page` | number | Page number | `1` |
| `limit` | number | Items per page (max 100) | `20` |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [ { ...task } ],
    "pagination": { "total": 45, "page": 1, "limit": 20, "totalPages": 3 }
  },
  "cached": false,
  "responseTimeMs": 87
}
```

---

### GET /api/tasks/stats

Get dashboard statistics for the authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 45, "todo": 20, "inProgress": 12, "completed": 13,
    "overdue": 3, "completionRate": 28,
    "dueSoon": [ { "title": "...", "dueDate": "...", "priority": "high" } ],
    "recentActivity": [ { "title": "...", "status": "...", "updatedAt": "..." } ],
    "weeklyData": [ { "_id": "2025-01-15", "created": 3, "completed": 1 } ],
    "priorityDistribution": { "low": 10, "medium": 20, "high": 12, "urgent": 3 }
  }
}
```

---

### GET /api/tasks/:id

Get a single task by ID. Returns 404 if the task doesn't exist or belongs to another user.

---

### POST /api/tasks

Create a new task.

**Body:**
```json
{
  "title": "Fix authentication bug",
  "description": "JWT validation fails for tokens with special characters",
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-01-20T00:00:00.000Z",
  "category": "Engineering",
  "project": "<project-id-optional>",
  "tags": ["bug", "auth", "critical"],
  "aiSuggestions": { ... }
}
```

**Validation:**
- `title`: required, 1–200 characters
- `status`: enum `todo | in-progress | completed`
- `priority`: enum `low | medium | high | urgent`
- `dueDate`: ISO 8601 format

**Response (201):** Returns the created task.  
**Side effect:** Emits `task-created` EventEmitter event asynchronously — creates a Notification record.

---

### PATCH /api/tasks/:id

Update one or more task fields. `title` is optional for PATCH; provided fields are validated. A linked project must belong to the authenticated user. Emits `task-updated` or `task-completed` event.

**Allowed fields:** `title`, `description`, `status`, `priority`, `dueDate`, `category`, `project`, `tags`, `assignedTo`

---

### DELETE /api/tasks/:id

Permanently delete a task. Emits `task-deleted` event.

**Response (200):**
```json
{ "success": true, "message": "Task deleted successfully" }
```

---

## Projects

### GET /api/projects — List all projects for authenticated user
### POST /api/projects — Create a project
### GET /api/projects/:id — Get project with task count
### PATCH /api/projects/:id — Update project
### DELETE /api/projects/:id — Delete project (must be owner)

**Project body:**
```json
{
  "name": "FocusDesk",
  "description": "AWDF Mega Project",
  "color": "#8b5cf6",
  "status": "active"
}
```

---

## Notifications

### GET /api/notifications

Get notification history for the authenticated user.

**Query Parameters:** `page` (default 1), `limit` (default 20, max 100), `unreadOnly` (`true` to filter). Response includes total and pagination metadata.

### PATCH /api/notifications/read

Mark notifications as read.

**Body:**
```json
{ "ids": ["<notification-id-1>", "<notification-id-2>"] }
```

---

## AI Suggestions

### POST /api/ai/suggest

Generate AI-powered task suggestions from a title.

**Body:**
```json
{
  "title": "Fix authentication bug in login flow",
  "context": "Users report 401 errors after 1 hour of inactivity"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "suggestions": {
      "description": "Investigate JWT token expiry handling in the authentication middleware...",
      "priority": "high",
      "suggestedDeadlineDays": 2,
      "explanation": "Authentication bugs directly affect all users. High priority recommended...",
      "tags": ["bug", "authentication", "jwt"],
      "source": "gemini",
      "disclaimer": "AI suggestions are recommendations only. Review before saving."
    }
  }
}
```

**Fallback behavior:**
- `source` will be `"fallback"` instead of `"gemini"`
- Missing credentials and most provider/malformed-response failures produce deterministic keyword-based suggestions with HTTP 200.
- Provider rate-limit or invalid-configuration errors return HTTP 503 so the user can continue manually.
- Core task CRUD remains available regardless of AI service status.

---

## Performance & System

### GET /api/performance (protected)

Returns cache statistics and server metrics.

```json
{
  "success": true,
  "data": {
    "cache": { "hits": 12, "misses": 4, "keys": 3 },
    "server": { "uptime": 1234.5, "nodeVersion": "v20.11.0" }
  }
}
```

---

## Error Examples

**401 Unauthorized:**
```json
{ "success": false, "error": "Not authorized. No token provided." }
```

**422 Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "title", "message": "Title is required and must be under 200 characters" },
    { "field": "status", "message": "Invalid status" }
  ]
}
```

**404 Not Found:**
```json
{ "success": false, "error": "Task not found" }
```

---

*API Documentation — FocusDesk v1.0 — CHARUSAT AWDF ITUE301*
