# Footer Polish

**Phase:** 2 | **Version:** 0.15 | **Status:** Not Started

## Problem

The footer currently only shows the version number. It should serve as a useful navigation and information element.

## Requirements

### Core

- [ ] Add useful links to the footer:
  - Help / How it works (links to onboarding or help page)
  - Feedback (link to feedback form or email)
  - Patch notes / changelog (opens patch notes modal)
- [ ] Keep the version number display
- [ ] Ensure footer is visually consistent with the app's design
- [ ] Footer should not take excessive vertical space

### Design

- [ ] Compact, single-row layout on desktop
- [ ] Stacked layout on mobile if needed
- [ ] Subtle styling — footer should not compete with main content
- [ ] Consider whether footer is always visible or only on certain pages

## Files Likely Affected

- `src/components/PageFooter.vue` — expand content and styling

## Acceptance Criteria

1. Footer contains useful links beyond just version number
2. Links are functional and navigate to correct destinations
3. Footer is responsive and looks good on mobile and desktop
4. Footer does not interfere with main content scrolling
