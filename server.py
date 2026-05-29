#!/usr/bin/env python3
"""Serves index.html and proxies /today, /anytime, /someday to things-api."""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.request
import os

CONFIG = os.path.expanduser('~/.config/things-api/config')
TOKEN = ''
PORT_API = 5225

try:
    with open(CONFIG) as f:
        for line in f.read().splitlines():
            if line.startswith('THINGS_API_TOKEN='):
                TOKEN = line.split('=', 1)[1].strip()
            elif line.startswith('THINGS_API_PORT='):
                PORT_API = int(line.split('=', 1)[1].strip())
except FileNotFoundError:
    print(f'Error: things-api not configured. Run: uvx things-api init')
    raise SystemExit(1)

if not TOKEN:
    print(f'Error: THINGS_API_TOKEN missing in {CONFIG}. Run: uvx things-api init')
    raise SystemExit(1)

PROXY_PATHS = {'/today', '/anytime', '/someday', '/inbox', '/logbook'}
SERVED_FILES = {'/', '/index.html', '/lib.js'}

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0] in PROXY_PATHS:
            self._proxy(self.path)
        elif self.path.split('?')[0] in SERVED_FILES:
            super().do_GET()
        else:
            self.send_response(404)
            self.end_headers()

    def do_PUT(self):
        if self.path.startswith('/todos/'):
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length) if length else b'{}'
            self._proxy_put(self.path, body)
        else:
            self.send_response(404)
            self.end_headers()

    def _proxy(self, path):
        url = f'http://localhost:{PORT_API}{path}'
        req = urllib.request.Request(url, headers={'Authorization': f'Bearer {TOKEN}'})
        try:
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(502)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(str(e).encode())

    def _proxy_put(self, path, body):
        url = f'http://localhost:{PORT_API}{path}'
        req = urllib.request.Request(
            url, data=body, method='PUT',
            headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
        )
        try:
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
                status = resp.status
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(data)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(502)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(str(e).encode())

    def log_message(self, fmt, *args):
        pass

if __name__ == '__main__':
    print(f'Serving on http://localhost:8080 → proxying API to localhost:{PORT_API}')
    HTTPServer(('127.0.0.1', 8080), Handler).serve_forever()
