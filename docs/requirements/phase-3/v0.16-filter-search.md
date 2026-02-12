# Filter & Search Backlog

**Phase:** 3 | **Version:** 0.16 | **Status:** Not Started

## Problem

As the backlog grows, finding specific tasks becomes difficult. There is no way to search by name or filter by properties. The FilterWidget component exists but its current functionality is limited.

## Requirements

### Search

- [ ] Add a text search input to the task backlog view
- [ ] Search should match against task name (primary) and description (secondary)
- [ ] Search should be instant (client-side filtering, no server round-trip)
- [ ] Clear search button to reset
- [ ] Show result count when search is active ("Showing 3 of 24 tasks")

### Filters

- [ ] Filter by priority: Critical, High, Medium, Low (multi-select)
- [ ] Filter by category (multi-select, populated from existing categories)
- [ ] Filter by size: Short, Medium, Long, Very Long (multi-select)
- [ ] Filter by deadline: Has deadline / No deadline / Overdue / Due this week
- [ ] Filters should be combinable (AND logic between filter types)
- [ ] Show active filter count in the filter UI
- [ ] Clear all filters button

### UX

- [ ] Filters should be collapsible/expandable to save screen space
- [ ] On mobile, filters could be in a slide-out panel or modal
- [ ] Search + filters should work together
- [ ] URL should not change based on filters (client-side only)
- [ ] Filter state should persist within the session but reset on page reload

### Completed Tasks

- [ ] Same search/filter capabilities should apply to the completed tasks tab
- [ ] Additionally, filter by completion date range

## Files Likely Affected

- `src/views/TaskView.vue` — search bar and filter integration
- `src/components/FilterWidget.vue` — expand with filter controls
- `src/stores/app.js` — filtered task getters
- New component: `src/components/SearchBar.vue` (or inline in TaskView)

## Acceptance Criteria

1. Users can search tasks by name and find results instantly
2. Users can filter by priority, category, size, and deadline status
3. Filters combine correctly (AND logic)
4. Search and filters work together
5. Active filters are clearly indicated with a count
6. Clearing filters restores the full task list
