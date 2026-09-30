#!/usr/bin/env python3
"""Rebuild every hosted guide from the Notion "Chatting Skills" export.

Usage: python3 scripts/build-guides.py "<folder with the exported .html files>"

Steps: convert-notion-guide.py per page -> hand patches (relationship opener callout + animated
flow board, sexting screen recording) -> design-guides.py (bubbles, cards, callouts).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

LINKS = json.loads(Path("content/guides/notion-links.json").read_text())
OPENER_CALLOUT = (
    '<div class="callout update"><span class="icon">📍</span><div><p><strong>UPDATE 30 Sep 2026 — the opener changed. '
    'He stays SILENT, YOU open the chat.</strong></p><p>The scenarios below still teach you how to read him, but the first '
    'messages are now fixed:</p><ol><li>You: <em>"heyy wait are u living close to me??"</em></li><li>He tells you where he is '
    'from (<em>"im from houston, u?"</em>)</li><li>You: <em>"damn I\'m from dallas!"</em> + something warm about HIS place: '
    '<em>"omg i love to visit there!! my auntie lives there"</em></li><li>You: <em>"btw how old are u and what do u do for '
    'work?"</em></li><li>Then Phase 2 onwards exactly as written here.</li></ol></div></div>'
)
FLOWBOARD = Path("content/guides/flowboard.html")
VIDEO = ('<video controls preload="metadata" src="/guides/sexting/screen-recording.mp4"></video>\n'
         '<p><em>Screen recording, 6 Feb 2026 (74 s)</em></p>')


def convert_all(folder):
    for f in sorted(folder.glob("*.html")):
        m = re.search(r"([0-9a-f]{32})\.html$", f.name)
        slug = LINKS.get(m.group(1)) if m else None
        if not slug:
            print("skip (unknown page):", f.name[:70])
            continue
        r = subprocess.run(["python3", "scripts/convert-notion-guide.py", str(f), slug], capture_output=True, text=True)
        print(r.stdout.strip() or r.stderr.strip())


def patch_relationship():
    p = Path("content/guides/relationship-building.html")
    h = p.read_text()
    h, n = re.subn(r'<div class="figure">\s*<span><img[^>]*></span>\s*</div>\s*<p>\(see the generated image above\)\s*</p>',
                   FLOWBOARD.read_text().strip(), h, count=1)
    assert n == 1, "relationship hero image not found"
    m = re.search(r"<h2>[^<]*PHASE 1[^<]*</h2>", h)
    assert m, "Phase 1 heading not found"
    h = h[:m.end()] + "\n" + OPENER_CALLOUT + h[m.end():]
    p.write_text(h)
    for img in Path("public/guides/relationship-building").glob("*"):
        img.unlink()
    print("relationship-building: flow board + opener callout applied")


def patch_sexting():
    p = Path("content/guides/sexting.html")
    h, n = re.subn(r"<span>attachment:[^<]*\.mov</span>", VIDEO, p.read_text())
    assert n == 1, "sexting screen recording placeholder not found"
    p.write_text(h)
    print("sexting: screen recording embedded")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    convert_all(Path(sys.argv[1]))
    patch_relationship()
    patch_sexting()
    subprocess.run(["python3", "scripts/design-guides.py"], check=True)
    for d in Path("public/guides").iterdir():
        if d.is_dir() and not any(d.iterdir()):
            d.rmdir()
