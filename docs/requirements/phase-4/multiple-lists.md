# Multiple Lists

**Phase:** 4 | **Version:** 1.1 | **Status:** Not Started

## Problem

Users have tasks across different areas of life (work, personal, side projects) but everything lives in a single backlog. This makes it hard to focus on one context and leads to cluttered schedules mixing unrelated tasks.

## Requirements

### Core

- [ ] Users can create multiple task lists (e.g., "Work", "Personal", "Side Project")
- [ ] Each list has its own backlog and completed tasks
- [ ] Tasks belong to exactly one list
- [ ] Users can switch between lists easily
- [ ] The schedule can draw tasks from one or more selected lists
- [ ] Dashboard shows stats per list or aggregated across all lists

### UX

- [ ] List switcher in the navigation or as a top-level tab
- [ ] Default list for new tasks (configurable)
- [ ] Ability to move a task between lists
- [ ] Each list can have its own colour or icon for quick identification
- [ ] "All Lists" view that shows tasks from every list (with list indicator)

### Data Model

- [ ] New collection: `lists/{userId}/{listId}` with properties:
  - `name`: string
  - `colour`: string (hex)
  - `icon`: string (optional)
  - `createdAt`: ISO timestamp
  - `order`: number (for display ordering)
- [ ] Modify task schema: add `listId` (string, required)
- [ ] Migration: existing tasks assigned to a default "General" list

### Schedule Integration

- [ ] Schedule setup modal allows selecting which lists to include
- [ ] Schedule display shows which list each task belongs to
- [ ] Priority scoring works within and across lists (global priority still meaningful)

### Edge Cases

- [ ] Deleting a list — prompt to move tasks to another list or delete them
- [ ] Maximum number of lists? (suggest no hard limit, but UI should handle 10+ gracefully)
- [ ] Categories remain per-task, not per-list (categories can span lists)

## Files Likely Affected

- `src/stores/app.js` — list management, task-list association
- `src/views/TaskView.vue` — list switching
- `src/components/HeaderNav.vue` — list switcher
- `src/components/TaskModal.vue` — list selection
- `src/components/ScheduleSetUpModal.vue` — list selection for scheduling
- Firebase database structure — new lists collection, task schema change

## Acceptance Criteria

1. Users can create, rename, and delete lists
2. Tasks belong to a specific list and display accordingly
3. Switching between lists is fast and intuitive
4. Schedules can include tasks from selected lists
5. Existing data migrates to a default list without data loss
