# Public REST API

**Phase:** 5 | **Version:** 1.3 | **Status:** Not Started

## Problem

TaskGlitch is a closed system. Users cannot integrate it with other tools, build automations, or allow external services (including AI assistants) to interact with their task data.

## Requirements

### Core Endpoints

- [ ] **Tasks**
  - `GET /api/tasks` — List active tasks (supports filtering by priority, category, size, list)
  - `GET /api/tasks/:id` — Get a specific task
  - `POST /api/tasks` — Create a task
  - `PUT /api/tasks/:id` — Update a task
  - `DELETE /api/tasks/:id` — Delete a task
  - `POST /api/tasks/:id/complete` — Mark task as completed
  - `POST /api/tasks/:id/uncomplete` — Revert task to active
  - `POST /api/tasks/:id/block` — Mark task as blocked
  - `POST /api/tasks/:id/unblock` — Unblock task

- [ ] **Completed Tasks**
  - `GET /api/completed` — List completed tasks (supports date range filtering)

- [ ] **Schedule**
  - `GET /api/schedule` — Get current schedule
  - `POST /api/schedule` — Generate a new schedule (accepts time range, categories, lists)
  - `DELETE /api/schedule` — Clear schedule
  - `POST /api/schedule/reschedule` — Reschedule remaining tasks

- [ ] **Stats**
  - `GET /api/stats` — Get dashboard statistics (category breakdown, priority breakdown, task counts)
  - `GET /api/stats/history` — Get historical completion data (for time tracking/estimation)

- [ ] **Lists** (if implemented in Phase 4)
  - `GET /api/lists` — List all lists
  - `POST /api/lists` — Create a list
  - `PUT /api/lists/:id` — Update a list
  - `DELETE /api/lists/:id` — Delete a list

- [ ] **Settings**
  - `GET /api/settings` — Get user settings
  - `PUT /api/settings` — Update settings

### Authentication

- [ ] API key-based authentication (simpler than OAuth for personal use)
- [ ] API keys generated in the profile/settings page
- [ ] Keys passed via `Authorization: Bearer <api-key>` header
- [ ] Rate limiting: 100 requests/minute per user
- [ ] Keys can be revoked from the settings page

### Technical

- [ ] Implement as Firebase Cloud Functions (HTTP triggers)
- [ ] Request/response format: JSON
- [ ] Consistent error format: `{ error: { code, message } }`
- [ ] Pagination for list endpoints: `?limit=50&offset=0`
- [ ] API versioning: `/api/v1/...`

### Documentation

- [ ] Auto-generated API documentation (OpenAPI/Swagger spec)
- [ ] Interactive API explorer (Swagger UI or similar)
- [ ] Example requests for common use cases
- [ ] Rate limit information in response headers

## Files Likely Affected

- New: `functions/` directory — Firebase Cloud Functions
- New: `functions/api/` — API route handlers
- New: `functions/middleware/` — auth, rate limiting
- `src/views/ProfileView.vue` — API key management UI
- Firebase database — API key storage

## Acceptance Criteria

1. All core endpoints are functional and return correct data
2. API key authentication works correctly
3. Rate limiting prevents abuse
4. API documentation is available and accurate
5. Error responses are consistent and helpful
6. API keys can be generated and revoked from the app
