# Loading States

**Phase:** 1 | **Version:** 0.11 | **Status:** Not Started

## Problem

When the app loads or when Firebase data is being fetched, the UI shows empty states with no indication that data is loading. This can feel broken — users may think they have no tasks when data simply hasn't arrived yet.

## Requirements

### Core

- [ ] Show a loading indicator when the app is initialising and fetching data from Firebase
- [ ] Show loading state on the Task view while the backlog/completed lists are being fetched
- [ ] Show loading state on the Dashboard while stats data is being calculated
- [ ] Show loading state on the Schedule view while the schedule is being fetched
- [ ] Distinguish between "loading" and "empty" — if data finishes loading and there are no tasks, show a helpful empty state message (not a spinner)

### UX

- [ ] Use skeleton loaders rather than spinners where possible (feels faster)
- [ ] Loading state should appear within 100ms to avoid flash-of-empty-content
- [ ] If loading takes longer than expected (>3s), show reassurance text

### Technical

- [ ] Add a `loading` state to the Pinia store (or per-collection: `tasksLoading`, `scheduleLoading`, etc.)
- [ ] Set loading to true before Firebase `onValue()` listeners first fire
- [ ] Set loading to false once the initial data snapshot is received
- [ ] Ensure loading state resets correctly on logout/login transitions

## Files Likely Affected

- `src/stores/app.js` — add loading state properties
- `src/views/TaskView.vue` — conditional loading/empty display
- `src/views/DashboardView.vue` — conditional loading display
- `src/views/ScheduleView.vue` — conditional loading display
- New component: `src/components/ui/SkeletonLoader.vue` (reusable)

## Acceptance Criteria

1. On first load after login, user sees skeleton/loading UI before data appears
2. If the user has no tasks, they see a helpful empty state (not a spinner that never resolves)
3. Navigating between views while data is cached does not re-show loading states unnecessarily
