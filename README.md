# Things 3 Kanban Board

A writable Kanban board for Things 3. Drag cards between Someday / Next / Today — Things 3 updates immediately.

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
- `python3 -m http.server 8080` — serves `index.html` (avoids browser CORS restrictions)

## Manual start (without Make)

```bash
uvx things-api &
python3 -m http.server 8080
```

## How it works

- **Reading**: things-api reads the Things 3 SQLite database directly
- **Writing**: dragging a card navigates to a `things:///update` URL — Things 3 processes it natively
- **Polling**: the board re-fetches every 30 seconds and reconciles changes (no full re-render)

## Columns

| Board column | Things 3 | things-api endpoint |
|---|---|---|
| Someday | Someday | `GET /someday` |
| Next | Next ("Anytime" internally) | `GET /anytime` |
| Today | Today | `GET /today` |
