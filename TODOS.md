# TODOS

## things-api CORS Configuration

**What:** Determine whether things-api ships with CORS enabled by default, and document the exact flag or workaround.

**Why:** The design prescribes `python -m http.server 8080` as the CORS workaround (serving from `http://localhost:8080` avoids cross-origin issues). But if things-api does support CORS natively (e.g., `--cors` flag), the startup process simplifies to just running things-api and opening index.html directly.

**Current state:** CORS support is not mentioned in the things-api documentation found during /plan-eng-review. The workaround (`python -m http.server`) is documented and works. The native flag, if it exists, is undocumented.

**How to verify:** Run `things-api --help` and look for a `--cors` flag. If it exists, test with `curl -I -H "Origin: http://localhost:8080" http://localhost:5225/today` and check for `Access-Control-Allow-Origin` in the response.

**Blocked by:** Having things-api installed.
