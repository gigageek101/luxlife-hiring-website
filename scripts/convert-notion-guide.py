#!/usr/bin/env python3
"""Convert a Notion HTML export into a clean fragment served by app/guides/[slug].

Usage:  python3 scripts/convert-notion-guide.py "<export folder or .html>" <slug>
Writes: content/guides/<slug>.html and public/guides/<slug>/img-N.jpg (downsized with sips).
"""
import html
import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote

KEEP = {"h1", "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "b", "i", "u", "s", "code", "pre",
        "blockquote", "table", "thead", "tbody", "tr", "th", "td", "hr", "br", "details", "summary",
        "mark", "sup", "sub", "span", "div"}
VOID = {"hr", "br", "img"}
BLOCK = r"h1|h2|h3|h4|p|ul|ol|li|table|thead|tbody|tr|blockquote|details|summary|hr|div"
LINKS_FILE = Path("content/guides/notion-links.json")  # Notion page id -> our slug, for links between guides


class Cleaner(HTMLParser):
    def __init__(self, image_src, links):
        super().__init__(convert_charrefs=False)
        self.out, self.skip, self.a_stack, self.image_src, self.links = [], 0, [], image_src, links

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("style", "script", "header"):
            self.skip += 1
            return
        if self.skip:
            return
        if tag == "figure":
            self.out.append('<div class="callout">' if "callout" in (a.get("class") or "") else '<div class="figure">')
        elif tag == "img":
            self.out.append(f'<img src="{self.image_src(a.get("src") or "")}" alt="" loading="lazy">')
        elif tag == "a":
            href = a.get("href") or ""
            page_id = re.search(r"([0-9a-f]{32})\.html", unquote(href))
            if href.startswith("http"):
                self.a_stack.append("a")
                self.out.append(f'<a href="{html.escape(href)}" target="_blank" rel="noopener noreferrer">')
            elif page_id and page_id.group(1) in self.links:
                self.a_stack.append("a")
                self.out.append(f'<a href="/guides/{self.links[page_id.group(1)]}" class="guide-link">')
            else:
                self.a_stack.append("span")
                self.out.append("<span>")
        elif tag == "ol":
            start = a.get("start")
            self.out.append(f'<ol start="{int(start)}">' if start and start.isdigit() else "<ol>")
        elif tag == "details":
            self.out.append("<details open>" if "open" in a else "<details>")
        elif tag == "span" and (a.get("class") or "") == "icon":
            self.out.append('<span class="icon">' + html.escape(a.get("data-emoji") or ""))
        elif tag in KEEP:
            self.out.append(f"<{tag}>")

    def handle_endtag(self, tag):
        if tag in ("style", "script", "header"):
            self.skip = max(0, self.skip - 1)
            return
        if self.skip:
            return
        if tag == "figure":
            self.out.append("</div>")
        elif tag == "a":
            self.out.append(f"</{self.a_stack.pop() if self.a_stack else 'span'}>")
        elif tag in KEEP and tag not in VOID:
            self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.skip:
            self.out.append(data)

    def handle_entityref(self, name):
        self.out.append(f"&{name};")

    def handle_charref(self, name):
        self.out.append(f"&#{name};")


def find_export(target):
    target = Path(target)
    if target.is_file():
        return target
    candidates = sorted(target.glob("*.html"))
    if len(candidates) != 1:
        sys.exit(f"expected exactly one .html in {target}, found {len(candidates)}")
    return candidates[0]


def image_copier(export_html, slug):
    out_dir = Path("public/guides") / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    counter = {"n": 0}

    def copy(src):
        source = export_html.parent / unquote(src)
        if not source.is_file():
            return src
        counter["n"] += 1
        dest = out_dir / f"img-{counter['n']}.jpg"
        subprocess.run(["sips", "-Z", "1400", "-s", "format", "jpeg", "-s", "formatOptions", "82",
                        str(source), "--out", str(dest)], check=True, capture_output=True)
        return f"/guides/{slug}/img-{counter['n']}.jpg"

    return copy


def convert(export_html, slug):
    src = export_html.read_text(encoding="utf-8")
    body = re.search(r'<div class="page-body">(.*)</div>\s*</article>', src, re.S)
    if not body:
        sys.exit("page-body not found; is this a Notion HTML export?")
    links = json.loads(LINKS_FILE.read_text()) if LINKS_FILE.is_file() else {}
    cleaner = Cleaner(image_copier(export_html, slug), links)
    cleaner.feed(body.group(1))
    out = "".join(cleaner.out)
    out = re.sub(r"\n\s*\n+", "\n", out)
    out = re.sub(r"[ \t]+", " ", out)
    out = re.sub(rf"\s*(</?(?:{BLOCK})\b[^>]*>)\s*", r"\n\1", out).strip()
    dest = Path("content/guides") / f"{slug}.html"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(out + "\n", encoding="utf-8")
    title = html.unescape(re.search(r"<title>(.*?)</title>", src, re.S).group(1)).strip()
    print(f"{slug}: {len(out)} chars, {out.count(chr(10)) + 1} lines, "
          f"{len(re.findall(r'<h[1-4]>', out))} headings, {out.count('<img')} images, title={title!r}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    convert(find_export(sys.argv[1]), sys.argv[2])
