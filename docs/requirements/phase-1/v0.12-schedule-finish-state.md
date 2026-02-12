# Schedule Finish State

**Phase:** 1 | **Version:** 0.12 | **Status:** Not Started

## Problem

When all tasks in a schedule are completed, the schedule still shows in its normal state with all items checked off. There is no celebration, summary, or clear signal that the session is done. The user has to manually delete the schedule.

## Requirements

### Core

- [ ] Detect when all user tasks (non-break) in the active schedule are completed
- [ ] Display a "Schedule Complete" state that replaces or overlays the normal schedule view
- [ ] Show a summary of the completed session:
  - Total tasks completed
  - Total time of session (scheduled start to last completion)
  - Actual vs estimated duration (if time tracking data available from phase-1/time-tracking)
- [ ] Provide a clear "Clear Schedule" / "Done" action to dismiss the completed schedule

### UX

- [ ] The finish state should feel rewarding — this is a moment of accomplishment
- [ ] Consider a simple animation or visual flourish (confetti is cliche but effective)
- [ ] Include an option to go straight to creating a new schedule
- [ ] If some tasks were removed/rescheduled (not completed), mention that in the summary

### Edge Cases

- [ ] If the schedule has only system breaks and no user tasks, do not trigger finish state
- [ ] If a completed task is un-completed (undo), return to normal schedule view

## Files Likely Affected

- `src/views/ScheduleView.vue` — finish state detection and display
- `src/components/TaskSchedule.vue` — completion tracking
- New component: `src/components/ScheduleComplete.vue` (summary/celebration)

## Acceptance Criteria

1. When the last user task in a schedule is completed, the finish state appears
2. Summary shows accurate task count and session duration
3. User can dismiss the completed schedule and optionally create a new one
4. Un-completing a task returns to the normal schedule view
