# Custom Settings Per List

**Phase:** 4 | **Version:** 1.1 | **Status:** Not Started

## Problem

Different contexts have different working patterns. A user might take 15-minute breaks at work but 30-minute breaks on personal projects. Currently settings are global.

## Requirements

### Core

- [ ] Each list can have its own settings that override the global defaults
- [ ] Per-list settings include:
  - Break frequency and duration
  - Task size presets (short/mid/long/very long minute values)
  - Default priority for new tasks
  - Reschedule behaviour (maintain finish time toggle)
- [ ] If a per-list setting is not configured, fall back to global settings
- [ ] Global settings remain as the default baseline

### UX

- [ ] Settings accessible from list context menu or list settings page
- [ ] Clear indication of which settings are inherited (global) vs overridden (list-specific)
- [ ] "Reset to global" option for any overridden setting

### Data Model

- [ ] Extend list schema: `settings` (object, nullable — null means use global)
- [ ] Settings object mirrors global settings structure for consistency

### Schedule Integration

- [ ] When generating a schedule for a specific list, use that list's settings
- [ ] When generating a schedule across multiple lists, use global settings (or prompt user)

## Files Likely Affected

- `src/stores/app.js` — settings resolution logic (list > global fallback)
- `src/components/SettingsModal.vue` — per-list settings UI
- `src/composables/useTaskActions.js` — use resolved settings for scheduling

## Acceptance Criteria

1. Each list can override global settings
2. Unset per-list settings fall back to global defaults
3. Schedule generation uses the correct settings for the context
4. Users can easily see which settings are overridden vs inherited
