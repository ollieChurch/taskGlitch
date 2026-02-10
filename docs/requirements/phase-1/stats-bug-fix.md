# Fix Stats Data Bug (0 Created/Resolved)

**Phase:** 1 | **Version:** 0.11 | **Status:** Not Started

## Problem

The dashboard stats show "0 created/resolved in a month" in certain conditions. This was flagged as an existing bug from the original backlog.

## Requirements

### Investigation

- [ ] Reproduce the bug — identify which conditions cause 0 created/resolved to display
- [ ] Check whether the issue is a data calculation error or a display/formatting issue
- [ ] Check edge cases: new accounts with no completed tasks, months with no activity, boundary dates (start/end of month)

### Fix

- [ ] Ensure stats correctly count tasks created within the current month
- [ ] Ensure stats correctly count tasks resolved (completed) within the current month
- [ ] Handle edge case: if genuinely 0 tasks created/resolved, display appropriately (not as a bug)
- [ ] Add basic data validation before rendering stats

## Files Likely Affected

- `src/views/DashboardView.vue` — stats calculation and display logic

## Acceptance Criteria

1. Dashboard accurately shows tasks created this month
2. Dashboard accurately shows tasks resolved this month
3. A new account with no tasks shows a valid empty/zero state (not a broken display)
4. Stats update in real-time as tasks are created or completed
