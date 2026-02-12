# Improve Backlog-to-Completed Transition

**Phase:** 3 | **Version:** 0.16 | **Status:** Not Started

## Problem

When a task is marked as completed, it disappears from the backlog with no visual feedback. The transition feels abrupt — the task just vanishes. There is also no undo option for accidental completions (other than going to the completed tab and uncompleting it).

## Requirements

### Transition Animation

- [ ] When a task is completed, animate it out of the backlog (fade + slide, or shrink)
- [ ] The animation should feel satisfying but not slow (200-300ms)
- [ ] When a task is uncompleted, animate it back into the backlog at its correct priority position

### Undo / Toast

- [ ] Show a brief toast notification when a task is completed: "Task completed" with an "Undo" button
- [ ] Toast should auto-dismiss after 5 seconds
- [ ] Undo reverts the task to the backlog immediately
- [ ] Only the most recent completion needs undo support (not a full history)

### Visual Feedback

- [ ] Consider a brief checkmark animation or colour flash on the task card before it animates out
- [ ] The backlog should smoothly reflow after the task is removed (no jarring jump)

### Schedule Context

- [ ] When completing a task from within the schedule view, the same animation/toast applies
- [ ] In schedule context, the task should show as completed (strikethrough) rather than disappearing

## Files Likely Affected

- `src/components/TaskCard.vue` — completion animation trigger
- `src/views/TaskView.vue` — list transition animations, toast integration
- `src/composables/useTaskActions.js` — undo logic
- New component: `src/components/ui/Toast.vue` (reusable toast notification)

## Acceptance Criteria

1. Completing a task plays a smooth exit animation
2. A toast appears with undo capability
3. Undo successfully returns the task to its correct backlog position
4. The backlog reflows smoothly with no layout jumping
5. Toast auto-dismisses after 5 seconds if not interacted with
