# TaskGlitch Roadmap

> Current version: **0.11.0**
> Target: **1.0** release, then continued development toward an AI-ready platform

## Overview

TaskGlitch is an intelligent task scheduling app. The path to 1.0 focuses on polish, stability, onboarding, and core feature gaps. Post-1.0 introduces multi-list support, integrations, and positions the app as an AI-ready platform that works with any AI assistant.

## Status Key

- [ ] Not started
- [x] Complete
- [~] In progress

---

## Phase 1: Polish & Stability (v0.11 - v0.13)

*Make it solid. Fix bugs, add loading states, and ensure the app feels reliable.*

| Version | Item | Status | Requirements |
|---------|------|--------|--------------|
| 0.11 | Add loading states | [x] | [phase-1/loading-states.md](requirements/phase-1/loading-states.md) |
| 0.11 | Fix stats data bug (0 created/resolved) | [x] | [phase-1/stats-bug-fix.md](requirements/phase-1/stats-bug-fix.md) |
| 0.11 | Improve dashboard colours (no duplicates) | [x] | [phase-1/dashboard-colours.md](requirements/phase-1/dashboard-colours.md) |
| 0.12 | Schedule-driven time tracking | [ ] | [phase-1/time-tracking.md](requirements/phase-1/time-tracking.md) |
| 0.12 | Add schedule finish state | [ ] | [phase-1/schedule-finish-state.md](requirements/phase-1/schedule-finish-state.md) |
| 0.13 | Improve labels taken from code | [ ] | [phase-1/improve-labels.md](requirements/phase-1/improve-labels.md) |
| 0.13 | Schedule updates on task changes | [ ] | [phase-1/schedule-task-sync.md](requirements/phase-1/schedule-task-sync.md) |

## Phase 2: UX & Onboarding (v0.14 - v0.15)

*Make it welcoming. First impressions matter for retention.*

| Version | Item | Status | Requirements |
|---------|------|--------|--------------|
| 0.14 | Onboarding / feature tutorial | [ ] | [phase-2/onboarding.md](requirements/phase-2/onboarding.md) |
| 0.14 | Write website copy | [ ] | [phase-2/website-copy.md](requirements/phase-2/website-copy.md) |
| 0.15 | Improve accessibility | [ ] | [phase-2/accessibility.md](requirements/phase-2/accessibility.md) |
| 0.15 | Improve Lighthouse score | [ ] | [phase-2/lighthouse.md](requirements/phase-2/lighthouse.md) |
| 0.15 | Footer polish | [ ] | [phase-2/footer.md](requirements/phase-2/footer.md) |

## Phase 3: Core Feature Gaps (v0.16 - v0.18)

*Make it powerful. Features that users expect from a real task manager.*

| Version | Item | Status | Requirements |
|---------|------|--------|--------------|
| 0.16 | Filter & search backlog | [ ] | [phase-3/filter-search.md](requirements/phase-3/filter-search.md) |
| 0.16 | Improve backlog-to-completed transition | [ ] | [phase-3/completion-transition.md](requirements/phase-3/completion-transition.md) |
| 0.17 | Flag blocked tasks | [ ] | [phase-3/blocked-tasks.md](requirements/phase-3/blocked-tasks.md) |
| 0.17 | Task dependencies | [ ] | [phase-3/task-dependencies.md](requirements/phase-3/task-dependencies.md) |
| 0.18 | Repeating tasks | [ ] | [phase-3/repeating-tasks.md](requirements/phase-3/repeating-tasks.md) |

---

## === v1.0 Release ===

---

## Phase 4: Multi-List & Customisation (v1.1 - v1.2)

*Make it personal. Power-user features for managing multiple areas of life.*

| Version | Item | Status | Requirements |
|---------|------|--------|--------------|
| 1.1 | Multiple lists (personal, work, etc.) | [ ] | [phase-4/multiple-lists.md](requirements/phase-4/multiple-lists.md) |
| 1.1 | Custom settings per list | [ ] | [phase-4/list-settings.md](requirements/phase-4/list-settings.md) |
| 1.2 | Google Calendar integration | [ ] | [phase-4/google-calendar.md](requirements/phase-4/google-calendar.md) |
| 1.2 | Export schedule | [ ] | [phase-4/export-schedule.md](requirements/phase-4/export-schedule.md) |

## Phase 5: AI-Ready Platform (v1.3 - v1.4)

*Make it a platform. Let users bring their own AI rather than building AI in.*

| Version | Item | Status | Requirements |
|---------|------|--------|--------------|
| 1.3 | Public REST API | [ ] | [phase-5/rest-api.md](requirements/phase-5/rest-api.md) |
| 1.3 | Webhook support | [ ] | [phase-5/webhooks.md](requirements/phase-5/webhooks.md) |
| 1.4 | MCP Server | [ ] | [phase-5/mcp-server.md](requirements/phase-5/mcp-server.md) |
| 1.4 | Data export (JSON/CSV) | [ ] | [phase-5/data-export.md](requirements/phase-5/data-export.md) |

---

## Cross-cutting concern: Rich Data Model

Every feature should capture clean, timestamped, well-structured data. This is not a phase — it is a principle applied throughout development. Specific data model improvements are noted in each requirement file.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI strategy | AI-ready platform, not built-in AI | Let users bring their own AI via MCP/API. Avoids API costs, model lock-in, and maintenance burden |
| Time tracking | Schedule-driven with optional manual start | Low friction — schedule auto-tracks. Manual start available for ad-hoc tasks |
| Offline support | Removed from 1.0 scope | Firebase offline persistence may suffice. Full offline is complex; revisit post-1.0 if user feedback demands it |
