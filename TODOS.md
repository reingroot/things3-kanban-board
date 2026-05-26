# TODOS

## Drag-and-Drop Write Path

**What:** Verify that dragging a card to a new column actually updates Things 3.

**Why:** The `things:///update?id=<uuid>&when=<col>` URL is correctly constructed (uuid fix confirmed), but it requires `window.location.href` navigation which can't be tested in a headless browser. Needs manual test in a real browser with Things 3 running.

**How to verify:** Open http://localhost:8080, drag a Today task to Someday. Within 2 seconds, open Things 3 and confirm the task moved to Someday. Drag it back.

**Blocked by:** Needs real browser + Things 3 running.

---

## Empty-Title Todos Show as Blank Cards

**What:** Todos with empty `title` in Things 3 render as blank card rectangles.

**Why:** 2 todos in the "Personal AI" project have `title: ""` in the API response. The board renders them faithfully — blank cards. Found during /qa on 2026-05-26.

**How to fix:** In `makeCard()`, add a fallback: `title.textContent = task.title || '(untitled)'`.

**Severity:** Low / cosmetic.

---

## things-api CORS Configuration

**What:** Determine whether things-api ships with CORS enabled by default, and document the exact flag or workaround.

**Why:** The design prescribes `python -m http.server 8080` as the CORS workaround (serving from `http://localhost:8080` avoids cross-origin issues). But if things-api does support CORS natively (e.g., `--cors` flag), the startup process simplifies to just running things-api and opening index.html directly.

**Current state:** CORS support is not mentioned in the things-api documentation found during /plan-eng-review. The workaround (`python -m http.server`) is documented and works. The native flag, if it exists, is undocumented.

**How to verify:** Run `things-api --help` and look for a `--cors` flag. If it exists, test with `curl -I -H "Origin: http://localhost:8080" http://localhost:5225/today` and check for `Access-Control-Allow-Origin` in the response.

**Blocked by:** Having things-api installed.
