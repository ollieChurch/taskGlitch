# Export Schedule

**Phase:** 4 | **Version:** 1.2 | **Status:** Not Started

## Problem

The export button exists in the schedule view UI but is disabled. Users may want to share their schedule or import it into other tools.

## Requirements

### Core Export Formats

- [ ] **iCal (.ics)** — Universal calendar format. Each task becomes a calendar event. Can be imported into any calendar app.
- [ ] **PDF** — Printable schedule view. Formatted as a timeline or table with task names, times, and priorities.
- [ ] **Share link** (stretch) — Generate a read-only link to view the schedule (would require storing schedule publicly, may defer)

### iCal Export

- [ ] Generate valid .ics file with VEVENT entries for each task
- [ ] Include: task name (SUMMARY), start/end time, priority, category (as CATEGORIES)
- [ ] System breaks included as separate events
- [ ] File downloads to user's device

### PDF Export

- [ ] Generate a clean, printable PDF of the schedule
- [ ] Include: date, time blocks, task names, priorities
- [ ] Branding: TaskGlitch logo/name in header
- [ ] Consider using a lightweight library (jsPDF or similar)

### UX

- [ ] Export button in schedule view opens a format selector
- [ ] Progress indicator for PDF generation
- [ ] Success confirmation with option to open/view exported file

## Files Likely Affected

- `src/views/ScheduleView.vue` — enable export button, format selection
- New utility: `src/utils/exportSchedule.js` — export logic for each format
- New dependency: iCal generation library (or manual .ics string building)
- New dependency: PDF generation library (jsPDF or similar)

## Acceptance Criteria

1. Users can export their schedule as an .ics file
2. Exported .ics imports correctly into Google Calendar, Apple Calendar, and Outlook
3. Users can export their schedule as a PDF
4. PDF is clean, readable, and includes all schedule information
5. Export button is enabled and functional
