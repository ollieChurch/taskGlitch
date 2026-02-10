# Improve Accessibility

**Phase:** 2 | **Version:** 0.15 | **Status:** Not Started

## Problem

The app has not been audited for accessibility. Users with disabilities may not be able to use TaskGlitch effectively.

## Requirements

### Audit

- [ ] Run Lighthouse accessibility audit and document all issues
- [ ] Test with keyboard-only navigation through all main flows
- [ ] Test with a screen reader (NVDA or VoiceOver) on key pages
- [ ] Check colour contrast ratios against WCAG 2.1 AA standards

### Core Fixes (based on likely issues)

- [ ] Add ARIA labels to all icon-only buttons (task actions, navigation icons)
- [ ] Ensure all form inputs have associated labels (TaskModal, ScheduleSetUpModal, SettingsModal)
- [ ] Add proper heading hierarchy (h1 > h2 > h3) across all views
- [ ] Ensure focus management in modals — focus should trap within open modals and return to trigger on close
- [ ] Add skip-to-content link for keyboard users
- [ ] Ensure drag-and-drop has a keyboard alternative (schedule task reordering)

### Colour & Contrast

- [ ] Verify priority colours meet contrast requirements against their backgrounds
- [ ] Ensure text over coloured backgrounds (badges, buttons) meets AA contrast ratio (4.5:1 for normal text)
- [ ] Check that completed task styling (50% opacity) remains readable

### Keyboard Navigation

- [ ] All interactive elements reachable via Tab
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes modals
- [ ] Arrow keys navigate within task lists (enhancement)

### Screen Reader

- [ ] Task cards announce: name, priority, size, category
- [ ] Schedule announces: task name, time, completion status
- [ ] Status changes (task completed, schedule updated) announced via ARIA live regions

## Files Likely Affected

- All component files — ARIA labels, semantic HTML
- `src/components/ui/BaseModal.vue` — focus trapping
- `src/components/TaskCard.vue` — ARIA labels for actions
- `src/components/HeaderNav.vue` — navigation semantics
- `src/assets/main.css` — focus styles, skip link

## Acceptance Criteria

1. Lighthouse accessibility score is 90+
2. All main user flows are completable via keyboard only
3. Screen reader can navigate and understand all key content
4. Colour contrast meets WCAG 2.1 AA standard
