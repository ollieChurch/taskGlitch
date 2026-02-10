# Improve Dashboard Colours

**Phase:** 1 | **Version:** 0.11 | **Status:** Not Started

## Problem

The category breakdown chart in the Dashboard uses `Math.floor(Math.random() * 16777215).toString(16)` to generate colours. This causes:
- Colours change every time the chart re-renders
- Possible duplicate colours for different categories
- Potential low-contrast or unreadable colours
- No visual consistency between sessions

Priority chart colours are fine — they use hardcoded colours from the store.

## Requirements

### Core

- [ ] Replace random colour generation with a deterministic colour palette
- [ ] Ensure no two categories in the same chart share the same colour
- [ ] Colours should be visually distinct and accessible (sufficient contrast)
- [ ] Palette should support at least 12 categories before needing to cycle

### Approach

- [ ] Create a curated palette of 12+ distinct colours that work well together and with the app's design
- [ ] Assign colours to categories deterministically — either by index order or by hashing the category name so the same category always gets the same colour
- [ ] If more categories than palette entries, cycle with lightness/saturation variation to maintain distinction

## Files Likely Affected

- `src/views/DashboardView.vue` — replace `getRandomColor()` with palette-based assignment

## Acceptance Criteria

1. Category chart colours are consistent between page loads
2. No two visible categories share the same colour
3. Colours are visually distinct and readable against the chart background
