#!/usr/bin/env python3
"""
The King of Dragons - Local HTTP Game Server
Run this script to immediately launch the game locally in your web browser.
Usage:
    python3 serve.py [port]
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
        url = f"http://localhost:{PORT}/"
        print("=" * 60)
        print("  THE KING OF DRAGONS (SNES 16-BIT CLASSIC ARCADE)")
        print(f"  Game Server active at: {url}")
        print("  Opening game in your browser...")
        print("  Press Ctrl+C to terminate.")
        print("=" * 60)

        try:
            webbrowser.open(url)
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == '__main__':
    main()
