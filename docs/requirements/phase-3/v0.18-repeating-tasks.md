# Repeating Tasks

**Phase:** 3 | **Version:** 0.18 | **Status:** Not Started

## Problem

Some tasks recur regularly (weekly reports, daily standups, monthly reviews). Users must manually recreate these each time, which is tedious and error-prone.

## Requirements

### Core

- [ ] Allow tasks to be configured with a recurrence pattern
- [ ] Supported patterns:
  - Daily (every N days)
  - Weekly (every N weeks, on specific days)
  - Monthly (every N months, on a specific date or "first Monday" etc.)
- [ ] When a repeating task is completed, automatically create the next instance in the backlog
- [ ] The new instance should have the same properties (priority, size, category) but a fresh creation date
- [ ] The new instance's deadline should be calculated based on the recurrence pattern

### UX

- [ ] Add recurrence configuration to the task creation/edit modal
- [ ] Show a recurrence indicator on task cards (e.g., a repeat icon)
- [ ] Show next occurrence date on the task card
- [ ] Allow editing the recurrence pattern without affecting the current instance
- [ ] Allow "stopping" recurrence (convert to a one-off task)
- [ ] When completing a repeating task, show brief confirmation: "Next occurrence created for [date]"

### Data Model

- [ ] Add to task schema: `recurrence` (object, nullable):
  ```
  {
    type: 'daily' | 'weekly' | 'monthly',
    interval: number (every N periods),
    daysOfWeek: number[] (for weekly, 0=Sun to 6=Sat),
    dayOfMonth: number (for monthly),
    endDate: ISO timestamp (optional, stop recurrence after this date),
    endAfterCount: number (optional, stop after N occurrences)
  }
  ```
- [ ] Add to task schema: `recurrenceParentId` (string, nullable) — links instances to the original recurring task for history
- [ ] Completed instances retain their recurrence info for audit trail

### Edge Cases

- [ ] Recurring task is deleted (not completed) — prompt: "Delete this instance only, or stop all future recurrences?"
- [ ] Recurring task is in a schedule when completed — next instance should not be added to the current schedule
- [ ] Multiple instances should not pile up — if the user doesn't complete Monday's daily task by Tuesday, completing it should create Wednesday's, not a second Tuesday

## Files Likely Affected

- `src/stores/app.js` — task schema, recurrence definitions
- `src/components/TaskModal.vue` — recurrence configuration UI
- `src/components/TaskCard.vue` — recurrence indicator
- `src/composables/useTaskActions.js` — auto-create next instance on completion

## Acceptance Criteria

1. Users can create tasks with daily, weekly, or monthly recurrence
2. Completing a recurring task automatically creates the next instance
3. Recurrence indicator is visible on task cards
4. Deleting a recurring task offers choice between single instance and all future
5. Multiple instances do not pile up if tasks go uncompleted
6. Recurrence can be stopped at any time
