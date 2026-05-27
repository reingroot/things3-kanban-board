# TODOS

## Completed

### Drag-and-Drop Write Path

**Completed:** 2026-05-26

Writes now go via `PUT /todos/{id}` through `server.py`. The proxy authenticates requests using the token from `~/.config/things-api/config` and forwards to things-api. Verified working end-to-end.

---

### Empty-Title Todos Show as Blank Cards

**Completed:** 2026-05-26

`makeCard()` returns a `.card-separator` div for empty-title todos — a horizontal line used to visually group inbox items.

---

### things-api CORS Configuration

**Completed:** 2026-05-26

`server.py` is the solution: it serves the board on port 8080 and proxies all API calls (including auth headers) to things-api on port 5225. No browser CORS issues. `python3 -m http.server` is no longer used.
