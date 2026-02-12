# Improve Dashboard Colours

**Phase:** 1 | **Version:** 0.11 | **Status:** Complete

## Problem

The category breakdown chart in the Dashboard uses `Math.floor(Math.random() * 16777215).toString(16)` to generate colours. This causes:
- Colours change every time the chart re-renders
- Possible duplicate colours for different categories
- Potential low-contrast or unreadable colours
- No visual consistency between sessions

Priority chart colours are fine — they use hardcoded colours from the store.

## What Changed

- [x] Created a curated 16-colour palette stored in the Pinia store (`categoryPalette`)
- [x] Colours assigned deterministically by category index — same order always gets same colour
- [x] Palette includes 16 visually distinct colours (indigo, amber, emerald, red, violet, cyan, orange, pink, teal, lime, purple, rose, sky, and darker variants)
- [x] Palette cycles if more than 16 categories exist
- [x] Removed `getRandomColor()` method entirely

## Files Changed

- `src/stores/app.js` — added `categoryPalette` array to state
- `src/views/DashboardView.vue` — uses palette via index in computed `categoryBreakdownData`
