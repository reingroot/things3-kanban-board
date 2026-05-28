# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A web-based Kanban board GUI that syncs with Things 3 on macOS. Things 3 is a native Mac/iOS task manager that exposes a URL scheme (`things:///`) for reading and writing tasks. The web GUI sits alongside Things 3 and provides a Kanban view of its data.

## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse, /connect-chrome, /qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /setup-gbrain, /retro, /investigate, /document-release, /document-generate, /codex, /cso, /autoplan, /plan-devex-review, /devex-review, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore

## Services & Testing

**Assume services are already running.** The user starts them manually with `make start`. Do not start them yourself.

| Service | URL | Notes |
|---------|-----|-------|
| Kanban board | `http://localhost:8080` | Python HTTP server (`server.py`) |
| things-api | `http://localhost:5225` | `uvx things-api`, proxies Things 3 |

**Browser (for visual testing):** Use the `/browse` skill — it launches headless Chromium from `$HOME/.claude/skills/gstack/browse/dist/browse`. Pass `http://localhost:8080` as the URL. Never use `mcp__claude-in-chrome__*`.

**API testing:** Use `curl http://localhost:5225/<endpoint>` directly from Bash. things-api docs list all endpoints.

**Verify services are up before testing:**
```bash
curl -s http://localhost:5225/today | head -c 100   # things-api
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080  # board
```

# Docs
IMPORTANT: If you need any information about the things-api library, always read the documentation. Don't inspect the code, unless you can not find the answer in the docs.
- things-api API documentation: 
    - https://github.com/jaydenk/things-api/blob/main/docs/api-reference.md
    - https://github.com/jaydenk/things-api/blob/main/docs/configuration.mdd