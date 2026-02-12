# MCP Server

**Phase:** 5 | **Version:** 1.4 | **Status:** Not Started

## Problem

AI assistants like Claude and ChatGPT are increasingly capable of helping users manage their tasks, but they cannot interact with TaskGlitch. MCP (Model Context Protocol) is the emerging standard for connecting AI assistants to external tools and data sources.

## Requirements

### Core

- [ ] Implement a TaskGlitch MCP server that exposes task management capabilities
- [ ] The MCP server should wrap the REST API (Phase 5, v1.3) — not duplicate business logic
- [ ] Authenticate via the same API keys used for the REST API

### MCP Tools (actions the AI can take)

- [ ] `list_tasks` — Get active tasks with optional filters (priority, category, list, blocked status)
- [ ] `get_task` — Get details of a specific task
- [ ] `create_task` — Create a new task with name, priority, size, category, deadline
- [ ] `update_task` — Edit a task's properties
- [ ] `complete_task` — Mark a task as done
- [ ] `block_task` — Mark a task as blocked with reason
- [ ] `create_schedule` — Generate a schedule for a time window
- [ ] `get_schedule` — View the current schedule
- [ ] `get_stats` — Get productivity statistics and completion history

### MCP Resources (data the AI can read)

- [ ] `taskglitch://backlog` — Current task backlog with priorities
- [ ] `taskglitch://schedule` — Current active schedule
- [ ] `taskglitch://stats` — Dashboard statistics
- [ ] `taskglitch://settings` — User preferences and configuration
- [ ] `taskglitch://history` — Recent completion history with duration data

### MCP Prompts (suggested interactions)

- [ ] `plan_my_day` — AI reads backlog + calendar (if connected) and suggests a schedule
- [ ] `weekly_review` — AI summarises the week: tasks completed, time spent, what's overdue
- [ ] `estimate_task` — AI looks at historical data to suggest a time estimate for a new task
- [ ] `prioritise_backlog` — AI reviews the backlog and suggests priority adjustments

### Distribution

- [ ] Publish as an npm package (`@taskglitch/mcp-server` or similar)
- [ ] Include setup instructions for Claude Desktop, Claude Code, and other MCP clients
- [ ] Configuration requires only the API key and optional base URL

### Technical

- [ ] Built on the MCP SDK (TypeScript)
- [ ] Communicates with TaskGlitch via the REST API
- [ ] Handles errors gracefully — AI should get useful error messages, not stack traces
- [ ] Respect rate limits from the underlying API

## Files Likely Affected

- New: `packages/mcp-server/` — separate package within the repo (or separate repo)
- New: `packages/mcp-server/src/tools/` — MCP tool implementations
- New: `packages/mcp-server/src/resources/` — MCP resource implementations
- New: `packages/mcp-server/src/prompts/` — MCP prompt templates
- Dependencies on the REST API (Phase 5, v1.3)

## Acceptance Criteria

1. MCP server connects successfully with Claude Desktop / Claude Code
2. AI can read backlog, schedule, and stats via MCP resources
3. AI can create, edit, complete, and schedule tasks via MCP tools
4. MCP prompts provide useful guided interactions
5. Authentication works via API key
6. Published to npm and installable with standard MCP configuration
