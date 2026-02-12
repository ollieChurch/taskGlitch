# Fix Stats Data Bug (0 Created/Resolved)

**Phase:** 1 | **Version:** 0.11 | **Status:** Complete

## Problem

The dashboard stats show "0 created/resolved in a month" in certain conditions. This was flagged as an existing bug from the original backlog.

## Root Cause

The dashboard charts were built in `created()` using imperative methods (`setUpCategoryBreakdown`, `setUpPriorityBreakdown`) that ran once on mount. Since Firebase data arrives asynchronously via `onValue()` listeners, the charts would build with empty data if the dashboard rendered before data arrived. Additionally, `[getPrioritisedTasks[0]]` would pass `[undefined]` to FilterWidget when no tasks existed, causing rendering errors.

## What Changed

- [x] Converted chart data from imperative methods to reactive `computed` properties — charts now rebuild automatically when Firebase data arrives or changes
- [x] Removed `setUpCategoryBreakdown()` and `setUpPriorityBreakdown()` methods
- [x] Added safe array wrapping for `highestPriorityTask` and `oldestTask` — returns empty array instead of `[undefined]`
- [x] Added empty state handling — shows helpful message when no tasks exist instead of empty/broken charts
- [x] Stats update in real-time as tasks are created or completed (reactivity via computed properties)

## Files Changed

- `src/views/DashboardView.vue` — complete rewrite of chart data logic from methods to computed properties
