# Data Export (JSON/CSV)

**Phase:** 5 | **Version:** 1.4 | **Status:** Not Started

## Problem

Users should own their data. They need a way to export everything from TaskGlitch for backup, migration, or analysis in external tools. This also supports the AI-ready vision — users can feed their history into any AI tool.

## Requirements

### Core Export Formats

- [ ] **Full JSON export** — Complete data dump: all tasks (active + completed), schedules, settings, lists, time tracking data
- [ ] **CSV export** — Tabular format for spreadsheet analysis. Separate files for:
  - Active tasks
  - Completed tasks (with completion dates and duration data)
  - Schedule history

### Export Scope Options

- [ ] Export everything (full account backup)
- [ ] Export by list (if multiple lists exist)
- [ ] Export by date range (e.g., "completed tasks from last 6 months")
- [ ] Export active backlog only

### JSON Format

- [ ] Well-structured, documented JSON schema
- [ ] Includes metadata: export date, TaskGlitch version, account info
- [ ] Importable back into TaskGlitch (backup/restore functionality)
- [ ] Human-readable (pretty-printed with indentation)

### CSV Format

- [ ] Standard CSV with header row
- [ ] UTF-8 encoding
- [ ] Dates in ISO 8601 format
- [ ] Fields: name, priority, size, category, list, created date, deadline, completed date, actual duration, blocked status, recurrence info

### UX

- [ ] Export option in profile/settings
- [ ] Format selection (JSON or CSV)
- [ ] Scope selection (all, by list, by date range)
- [ ] Progress indicator for large exports
- [ ] Download as a single file (JSON) or zip (CSV with multiple files)

### API Support

- [ ] `GET /api/export?format=json&scope=all` via the REST API
- [ ] `GET /api/export?format=csv&scope=completed&from=2025-01-01&to=2025-12-31`
- [ ] Same authentication as other API endpoints

## Files Likely Affected

- `src/views/ProfileView.vue` — export UI
- New utility: `src/utils/exportData.js` — export generation logic
- `functions/api/export.js` — API endpoint for export
- Firebase database — read all user data for export

## Acceptance Criteria

1. Users can export all their data in JSON format
2. Users can export task data in CSV format
3. JSON export can be re-imported into TaskGlitch (backup/restore)
4. CSV opens correctly in Excel, Google Sheets, and Numbers
5. Export is available both from the app UI and via the API
6. Large exports (1000+ tasks) complete without timeout
