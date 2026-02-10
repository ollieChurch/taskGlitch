# Schedule Updates on Task Changes

**Phase:** 1 | **Version:** 0.13 | **Status:** Not Started

## Problem

If a user edits a task that is currently in the active schedule (e.g., changes its size from Short to Long), the schedule does not update. This causes the schedule to be inaccurate — time allocations will be wrong.

## Requirements

### Core

- [ ] When a task in the active schedule is edited, detect if any schedule-relevant properties changed (size, name, priority, category)
- [ ] If task size changed: update the schedule's time calculations and shift subsequent task times
- [ ] If task name changed: update the display name in the schedule
- [ ] If task is deleted: remove it from the schedule and recalculate times
- [ ] Show the user a notification or confirmation when a schedule has been auto-updated

### Decision: Auto-update vs Prompt

- [ ] Decide whether to auto-update the schedule silently, or prompt the user: "This task is in your active schedule. Updating it will change your schedule times. Continue?"
- [ ] Recommendation: auto-update with a brief notification banner ("Schedule updated — task size changed")

### Edge Cases

- [ ] Task size increased but no longer fits in the remaining schedule time — what happens? Options:
  - Let the schedule run over the end time (with a warning)
  - Remove the last task(s) that no longer fit and return them to the backlog
- [ ] Multiple tasks edited in quick succession — debounce schedule recalculation
- [ ] Task's category is removed from schedule filter — should the task be removed from the schedule?

## Files Likely Affected

- `src/composables/useTaskActions.js` — task edit flow to check schedule membership
- `src/stores/app.js` — schedule recalculation logic
- `src/components/TaskModal.vue` — trigger schedule sync after save
- `src/components/NotificationBanner.vue` — schedule update notifications

## Acceptance Criteria

1. Editing a task that's in the active schedule updates the schedule accordingly
2. Deleting a scheduled task removes it from the schedule and recalculates
3. User is informed when their schedule has been automatically updated
4. Schedule time calculations remain accurate after task changes
