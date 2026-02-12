# Loading States

**Phase:** 1 | **Version:** 0.11 | **Status:** Complete

## Problem

When the app loads or when Firebase data is being fetched, the UI shows empty states with no indication that data is loading. This can feel broken — users may think they have no tasks when data simply hasn't arrived yet.

## What Changed

### Pinia Store
- [x] Added `loading` state object with per-collection flags: `tasks`, `completed`, `schedule`, `account`
- [x] Added `isLoading`, `isLoadingTasks`, `isLoadingSchedule` getters
- [x] Added `setLoaded(key)` and `resetLoading()` actions
- [x] Loading flags start as `true` and flip to `false` on first Firebase snapshot

### App.vue (Firebase Listeners)
- [x] Each `onValue()` callback now calls `store.setLoaded(key)` after setting data
- [x] `resetLoading()` called on auth state change (login and logout)
- [x] Removed verbose console.log statements from Firebase listeners

### Views
- [x] **TaskView**: Shows skeleton loader while tasks loading, empty state message when loaded but empty (both Backlog and Completed tabs)
- [x] **DashboardView**: Shows skeleton loader while loading, empty state when no tasks, data-loaded state with charts
- [x] **ScheduleView**: Shows skeleton loader while schedule loading before showing GlitchExplained or schedule content

### New Component
- [x] Created `src/components/ui/SkeletonLoader.vue` — reusable animated skeleton with configurable line count and height, shimmer animation, varied widths for natural appearance

## Files Changed

- `src/stores/app.js` — loading state, getters, actions
- `src/App.vue` — setLoaded calls in Firebase listeners, resetLoading on auth changes
- `src/views/TaskView.vue` — loading/empty/data states
- `src/views/DashboardView.vue` — loading/empty/data states
- `src/views/ScheduleView.vue` — loading state
- `src/components/ui/SkeletonLoader.vue` — new component

## Remaining (deferred)
- [ ] If loading takes longer than expected (>3s), show reassurance text — deferred as low priority
