# CLAUDE.md — TaskGlitch Project Context

## What is TaskGlitch?

TaskGlitch is a progressive web app for intelligent task scheduling. Users add tasks to a backlog with priority, size estimates, and deadlines. The app auto-prioritises them using a scoring algorithm. Users then "Glitch It" to generate an optimised work schedule that fits their highest-priority tasks into a time window, with automatic breaks.

## Tech Stack

- **Frontend:** Vue 3 (Composition API), Vue Router 4, Pinia (state management)
- **Build:** Vite 5, Tailwind CSS 3, PostCSS
- **Backend:** Firebase (Realtime Database, Authentication, Hosting)
- **Charts:** Chart.js + vue-chartjs
- **Drag & Drop:** vue-draggable-plus
- **Testing:** Vitest + @vue/test-utils
- **Fonts:** Rajdhani (primary), Wallpoet (decorative)

## Current Version

**0.10.0** — Vue 3 migration complete with modern UI.

## Project Structure

```
src/
├── App.vue                     # Root component, Firebase init
├── main.js                     # Entry point
├── router/index.js             # Route definitions
├── stores/app.js               # Pinia store (all app state)
├── composables/useTaskActions.js  # Business logic
├── views/                      # Page components
│   ├── DashboardView.vue       # Stats & charts
│   ├── TaskView.vue            # Backlog & completed tabs
│   ├── ScheduleView.vue        # Schedule display
│   ├── ProfileView.vue         # User settings
│   ├── LoginView.vue           # Auth
│   └── UserManagementView.vue  # Password reset, email verify
├── components/                 # Reusable components
│   ├── TaskCard.vue            # Individual task display
│   ├── TaskModal.vue           # Create/edit task form
│   ├── ScheduleSetUpModal.vue  # Schedule config
│   ├── TaskSchedule.vue        # Schedule timeline display
│   ├── SettingsModal.vue       # Settings form
│   ├── HeaderNav.vue           # Navigation
│   ├── FilterWidget.vue        # Task filtering
│   ├── GlitchExplained.vue     # Onboarding explainer
│   ├── PatchNotesModal.vue     # Version updates
│   ├── NotificationBanner.vue  # Alert banner
│   ├── ContentCard.vue         # Page layout wrapper
│   ├── PageFooter.vue          # Footer
│   ├── IconButton.vue          # Icon button
│   └── ui/                     # UI primitives
│       ├── BaseModal.vue
│       ├── BaseTab.vue
│       └── BaseTabs.vue
├── assets/
│   ├── patchNotes.js           # Changelog data
│   └── main.css                # Tailwind imports
```

## Key Architecture Details

### State Management (Pinia — `stores/app.js`)
- Single store manages: tasks, completed, schedule, user, account, auth
- Priority levels: Critical (0), High (1), Medium (2), Low (3) — each with colour and icon
- Task types: `userTask` and `systemBreak`
- Firebase config from environment variables

### Business Logic (`composables/useTaskActions.js`)
- `moveTask()` — moves between active/completed, sets completedDateTime
- `removeTask()` — deletes from database
- `rescoreActiveBacklog()` — recalculates priority scores for all active tasks
- `getScheduleTasks()` — allocates tasks to schedule with break insertion
- `getScheduleTimes()` — calculates session duration, handles multi-day
- Priority scoring: considers base priority, age, deadline proximity, hard/soft deadline

### Firebase Database Structure
```
tasks/{userId}/{taskId}         # Active backlog
completed/{userId}/{taskId}     # Completed tasks (with completedDateTime)
schedule/{userId}               # Current schedule
account/{userId}                # Settings & preferences
```

### Important Patterns
- **Deep cloning before Firebase writes** — prevents Vue 3 reactive proxy corruption
- **`markRaw()`** on Firebase instances — prevents Vue wrapping them in proxies
- **`onValue()` listeners** — real-time sync from Firebase

## Roadmap

See `docs/ROADMAP.md` for the full phased plan.
See `docs/requirements/phase-{N}/` for detailed requirements per feature.

### Summary
- **Phase 1 (v0.11-0.13):** Polish & stability — loading states, bug fixes, time tracking, schedule improvements
- **Phase 2 (v0.14-0.15):** UX & onboarding — tutorial, website copy, accessibility, Lighthouse
- **Phase 3 (v0.16-0.18):** Core features — filter/search, blocked tasks, dependencies, repeating tasks
- **v1.0 Release**
- **Phase 4 (v1.1-1.2):** Multi-list, Google Calendar, export
- **Phase 5 (v1.3-1.4):** AI-ready platform — REST API, webhooks, MCP server, data export

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run test         # Run tests (Vitest)
npm run lint         # Lint code (ESLint)
```

## Working on this Project

1. Before starting any feature, read the relevant requirement file in `docs/requirements/`
2. After completing a feature, update its checkboxes in the requirement file and mark it done in `docs/ROADMAP.md`
3. Update `src/assets/patchNotes.js` with user-facing changes
4. Update the version in `package.json`
5. Update `README.md` version history
