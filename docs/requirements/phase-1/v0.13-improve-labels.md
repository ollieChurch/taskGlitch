# Improve Labels Taken From Code

**Phase:** 1 | **Version:** 0.13 | **Status:** Not Started

## Problem

Some UI elements display raw values from code or the database rather than human-friendly labels. This makes the app feel unfinished.

## Requirements

### Investigation

- [ ] Audit all user-facing text for raw code values. Known issues:
  - Task sizing displays as raw number with "mins" suffix (e.g., "30 mins") — consider mapping to friendly labels ("Short", "Medium", etc.)
  - Debug `task.score` display may leak to production if debug flag is not environment-gated
  - Task type `'userTask'` / `'systemBreak'` used as internal identifiers — ensure never displayed raw
- [ ] Check all console.log statements are removed or gated behind development environment
- [ ] Review any tooltips, alt text, or ARIA labels for developer-facing language

### Core

- [ ] Create a centralised label mapping for task sizes (e.g., 15 -> "Short", 30 -> "Medium", 60 -> "Long", 120 -> "Very Long")
- [ ] Display friendly labels in task cards, modals, and schedule views
- [ ] Show the minute value as secondary info (e.g., "Medium (30 mins)") for clarity
- [ ] Ensure the debug score display is gated behind a development-only flag
- [ ] Remove or gate all console.log statements behind environment checks

### Consistency

- [ ] All priority labels should come from the store definitions (already mostly done)
- [ ] Category names should be title-cased consistently if user-entered
- [ ] Date formats should be consistent across the app (currently using en-uk locale)

## Files Likely Affected

- `src/stores/app.js` — add size label mappings
- `src/components/TaskCard.vue` — replace raw sizing display, gate debug output
- `src/components/TaskModal.vue` — ensure form uses friendly labels
- `src/components/TaskSchedule.vue` — check schedule task display

## Acceptance Criteria

1. No raw database values or code identifiers are visible to users
2. Task sizes show friendly labels with optional minute detail
3. Debug information is not visible in production builds
4. Console is clean of development logging in production
