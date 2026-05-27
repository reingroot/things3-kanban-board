# Things 3 Kanban Board

A writable Kanban board for Things 3. Drag cards between columns, assign inbox items to projects, and get a daily GTD briefing — all synced live with Things 3.

## Prerequisites

- macOS with Things 3 running
- [`uv`](https://docs.astral.sh/uv/) (`brew install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`)

## Start

```bash
make start
```

Then open **http://localhost:8080** in your browser.

`make start` runs two processes:
- `things-api` on `localhost:5225` — reads Things 3's SQLite database (via `uvx`, no venv needed)
- `python3 server.py` on `localhost:8080` — serves the board and proxies API calls with authentication

## Manual start (without Make)

```bash
uvx things-api &
python3 server.py
```

Configuration is read from `~/.config/things-api/config`. Run `uvx things-api init` to set it up.

## How it works

- **Reading**: things-api reads the Things 3 SQLite database directly
- **Writing**: dragging a card calls `PUT /todos/{id}` via the local proxy server — Things 3 updates within seconds
- **Polling**: the board re-fetches every 30 seconds; drag-and-drop triggers an immediate reload

## Columns

| Board column | Things 3 | things-api endpoint |
|---|---|---|
| Inbox | Inbox | `GET /inbox` |
| Someday | Someday | `GET /someday` |
| Next | Next ("Anytime" internally) | `GET /anytime` |
| Today | Today | `GET /today` |

## Features

- **Drag between columns** — move a task to Someday / Next / Today; Things 3 updates immediately
- **Assign from Inbox** — drag an inbox card onto a project in the sidebar to assign it to that project, choose a heading, and set its when-state (Someday / Next / Today)
- **GTD Morning Briefing** — an overlay showing inbox depth, today's load, overdue deadlines, stalled projects, and completion velocity. Auto-shows on load, dismissed until the next day; reopen via the "GTD Briefing" button in the header
- **Project filter** — click any project in the sidebar to focus the board on that project; selection persists across reloads
- **Card chips** — start date and deadline shown as colour-coded chips on each card (amber = due soon, red = overdue)
- **Inbox separators** — empty-title todos render as visual separator lines for organising the inbox without headings
