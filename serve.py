"""Local dev server for The Badminton Project.

Same as `py -m http.server` but sends no-cache headers so edits to the site
always show up on refresh. Run:  py serve.py   then open http://localhost:4173
"""
import http.server
import os

PORT = 4173
ROOT = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    with http.server.ThreadingHTTPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"Serving The Badminton Project at http://localhost:{PORT}")
        httpd.serve_forever()
