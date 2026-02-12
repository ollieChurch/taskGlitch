# Webhook Support

**Phase:** 5 | **Version:** 1.3 | **Status:** Not Started

## Problem

External services cannot react to events in TaskGlitch in real-time. For example, a user might want to log completed tasks to a spreadsheet, notify a Slack channel, or trigger an automation when a schedule is created.

## Requirements

### Core

- [ ] Users can register webhook URLs to receive event notifications
- [ ] Supported events:
  - `task.created` — A new task was added
  - `task.completed` — A task was marked complete
  - `task.updated` — A task was edited
  - `task.deleted` — A task was removed
  - `schedule.created` — A new schedule was generated
  - `schedule.completed` — All tasks in schedule completed
  - `schedule.deleted` — Schedule was cleared
- [ ] Webhook payload includes:
  - Event type
  - Timestamp
  - Relevant data (task object, schedule summary)
  - User ID (for multi-webhook setups)

### Configuration

- [ ] Webhook management in profile/settings
- [ ] Add webhook: URL + selected events (checkbox list)
- [ ] Test webhook: send a test payload to verify the URL works
- [ ] Enable/disable individual webhooks without deleting them
- [ ] Maximum of 5 webhooks per user (to limit abuse)

### Technical

- [ ] Webhooks delivered via HTTP POST with JSON payload
- [ ] Include a signature header for payload verification (HMAC-SHA256 with a user-specific secret)
- [ ] Retry logic: retry failed deliveries 3 times with exponential backoff
- [ ] Timeout: 10 seconds per delivery attempt
- [ ] Log delivery status (success/failure) visible to user

### Data Model

- [ ] New collection: `webhooks/{userId}/{webhookId}`:
  ```
  {
    url: string,
    events: string[],
    secret: string (auto-generated),
    enabled: boolean,
    createdAt: ISO timestamp,
    lastDelivery: { status, timestamp, eventType }
  }
  ```

## Files Likely Affected

- New: `functions/webhooks/` — delivery logic, retry handling
- Firebase database — webhook configuration storage, delivery logs
- `src/views/ProfileView.vue` — webhook management UI
- `src/composables/useTaskActions.js` — trigger webhook events on task/schedule actions

## Acceptance Criteria

1. Users can register webhooks for specific events
2. Events are delivered reliably with retry on failure
3. Payload signatures allow receivers to verify authenticity
4. Users can test webhooks before relying on them
5. Delivery history is visible in settings
