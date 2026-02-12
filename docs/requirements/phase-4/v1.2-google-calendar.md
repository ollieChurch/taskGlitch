# Google Calendar Integration

**Phase:** 4 | **Version:** 1.2 | **Status:** Not Started

## Problem

Users already have commitments in their calendar (meetings, appointments, etc.). When TaskGlitch generates a schedule, it doesn't know about these commitments, leading to overlapping time blocks.

## Requirements

### Core: Read Calendar (MVP)

- [ ] Authenticate with Google Calendar via OAuth 2.0
- [ ] Fetch events for the scheduling time window
- [ ] When generating a schedule, treat calendar events as blocked time — schedule tasks around them
- [ ] Display calendar events in the schedule view alongside tasks (visually distinct)

### Core: Write to Calendar

- [ ] Export a generated schedule to Google Calendar as events
- [ ] Each task becomes a calendar event with the task name and time
- [ ] Include task details (priority, category, size) in the event description
- [ ] Option to create in a specific calendar (e.g., "TaskGlitch" calendar)

### UX

- [ ] Google Calendar connection in profile/settings
- [ ] Show connection status (connected/disconnected)
- [ ] Choose which calendars to read from (users may have multiple)
- [ ] Toggle calendar integration on/off per schedule

### Technical

- [ ] Use Google Calendar API v3
- [ ] Handle OAuth refresh tokens for persistent access
- [ ] Respect rate limits and handle API errors gracefully
- [ ] Consider a lightweight backend/Cloud Function for OAuth token management (Firebase client SDK cannot securely store OAuth tokens for third-party APIs)

### Privacy

- [ ] Only read event times and titles — not attendees, descriptions, or attachments
- [ ] Calendar data should not be stored permanently — fetch fresh for each schedule
- [ ] Clear explanation to user about what data is accessed

## Files Likely Affected

- `src/stores/app.js` — calendar connection state
- `src/components/ScheduleSetUpModal.vue` — calendar toggle, blocked time display
- `src/composables/useTaskActions.js` — schedule generation with blocked time awareness
- `src/views/ProfileView.vue` — Google Calendar connection settings
- Firebase Functions (new) — OAuth token management
- `src/components/TaskSchedule.vue` — display calendar events in schedule

## Acceptance Criteria

1. Users can connect their Google Calendar
2. Schedule generation avoids calendar event times
3. Users can export schedules to Google Calendar
4. Calendar events display in the schedule view
5. Users can disconnect at any time with data cleaned up
