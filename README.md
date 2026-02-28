# TaskGlitch

A progressive web app for intelligent task scheduling. Add tasks to a backlog with priority, size estimates, and optional deadlines. TaskGlitch automatically scores and prioritises them, then lets you "Glitch It" to generate an optimised work schedule that fits your highest-priority tasks into a time window — with automatic breaks.

**Current version:** 0.17.1

---

## Features

- **Smart backlog** — tasks scored by priority, age, and deadline proximity
- **Schedule generation** — allocates tasks to a time window, inserts breaks, respects task order
- **Task dependencies** — mark prerequisites; dependent tasks auto-block and auto-unblock when deps complete
- **Blocked tasks** — manually flag tasks with an optional reason; excluded from scheduling
- **Filter & search** — filter backlog and completed tasks by priority, category, size, deadline, and blocked status
- **Completion flow** — undo toast, animated transition to completed list
- **Dashboard** — charts for task creation rate, completion rate, and estimation accuracy
- **Dark sci-fi theme** — cyberpunk-inspired UI with a light/dark toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3, Vue Router 4, Pinia |
| Build | Vite 5, Tailwind CSS 3 |
| Backend | Firebase Realtime Database + Authentication |
| Charts | Chart.js + vue-chartjs |
| Testing | Vitest + @vue/test-utils |

---

## Getting Started

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build
npm run test:unit # Run unit tests
npm run lint      # Lint and auto-fix
```

Firebase config is read from environment variables. Create a `.env` file at the project root:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Project Structure

```
src/
├── App.vue                        # Root component, Firebase init
├── main.js                        # Entry point
├── router/index.js                # Route definitions
├── stores/app.js                  # Pinia store (all app state)
├── composables/useTaskActions.js  # Business logic (scoring, scheduling, CRUD)
├── views/
│   ├── TaskView.vue               # Backlog & completed tabs
│   ├── ScheduleView.vue           # Schedule display
│   ├── DashboardView.vue          # Stats & charts
│   ├── ProfileView.vue            # User settings
│   └── LoginView.vue              # Authentication
└── components/
    ├── TaskCard.vue               # Task list item
    ├── TaskModal.vue              # Create / edit task form
    ├── TaskDetailModal.vue        # Task detail & block/unblock actions
    ├── FilterWidget.vue           # Filter controls
    ├── TaskSchedule.vue           # Schedule timeline
    └── ui/                        # Base components (Modal, Tabs, Toast…)
```

---

## Version History

| Version | Summary |
|---|---|
| 0.17.1 | Task dependencies: prerequisite tasks, dep-blocked visual state, circular dep detection, scheduler ordering |
| 0.17.0 | Blocked tasks: flag, visual treatment, excluded from scheduling, filter support |
| 0.16.0 | Filter & search backlog/completed, completion fade animation, undo toast |
| 0.15.0 | Onboarding modal, landing page redesign, footer polish, accessibility, SEO/OG meta tags |
| 0.14.1 | New emblem/favicon, viewport-locked desktop layout, internal scroll panels, 2-column dashboard |
| 0.14.0 | Full dark sci-fi redesign, cyberpunk mode, Lucide icons, new transitions |
| 0.13.0 | Dependency audit, friendly size labels, schedule-task sync, category change handling |
| 0.12.0 | Schedule time tracking, active task highlighting, session summary, estimation accuracy |
| 0.11.0 | Loading states, empty states, dashboard chart reactivity and colour fixes |
| 0.10.0 | Migration to Vue 3, Tailwind CSS, Pinia, and Vite |
| 0.9.0 | Patch notes modal |
| 0.8.x | Dashboard redesign and priority scoring bug fixes |
| 0.7.x | Password reset, rescoring over time |
| 0.6.0 | Email validation journey |
| 0.5.0 | Account settings |
| ≤ 0.4.x | Scheduling improvements, breaks option, PWA manifest |
| 0.1.0 | Initial working prototype |
