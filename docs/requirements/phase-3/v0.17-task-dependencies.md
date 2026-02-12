# Task Dependencies

**Phase:** 3 | **Version:** 0.17 | **Status:** Not Started

## Problem

Some tasks must be completed before others can begin. There is no way to express this relationship. For example, "Design mockups" must happen before "Implement UI", but the scheduler doesn't know this.

## Requirements

### Core

- [ ] Allow a task to be marked as "depends on" one or more other tasks
- [ ] A task with unresolved dependencies is automatically considered blocked (integrates with blocked-tasks feature)
- [ ] When all dependency tasks are completed, the dependent task automatically unblocks
- [ ] The scheduler should respect dependency ordering — never schedule a dependent task before its prerequisites

### UX

- [ ] In the task edit modal, add a "Depends on" field that allows selecting other tasks
- [ ] Use a searchable dropdown (the existing multiselect component may work)
- [ ] Show dependency relationships on task cards:
  - On the dependent task: "Blocked by: Task A, Task B"
  - On the prerequisite task: "Blocks: Task C" (nice to have)
- [ ] Prevent circular dependencies (A depends on B, B depends on A)

### Data Model

- [ ] Add to task schema: `dependsOn` (array of task IDs, default empty)
- [ ] Ensure backward compatibility — existing tasks default to no dependencies

### Scheduling

- [ ] When generating a schedule, sort tasks so prerequisites come before dependents
- [ ] If a prerequisite is not selected for the schedule, the dependent task should also be excluded (or included with a warning)

### Edge Cases

- [ ] Dependency task is deleted — remove it from all `dependsOn` arrays
- [ ] Dependency task is completed outside of a schedule — auto-unblock dependents
- [ ] Chain dependencies (A -> B -> C) should work correctly
- [ ] Circular dependency detection at save time with user-friendly error message

## Files Likely Affected

- `src/stores/app.js` — task schema, dependency resolution logic
- `src/components/TaskModal.vue` — dependency selector
- `src/components/TaskCard.vue` — dependency display
- `src/composables/useTaskActions.js` — schedule generation respects dependencies, completion auto-unblocks

## Acceptance Criteria

1. Users can set dependencies between tasks
2. Tasks with unmet dependencies are automatically blocked
3. Completing a prerequisite automatically unblocks its dependents
4. The scheduler respects dependency ordering
5. Circular dependencies are prevented with a clear error message
6. Deleting a prerequisite task cleans up dependency references
