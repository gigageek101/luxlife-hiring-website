#!/usr/bin/env python3
"""Design pass for content/guides/<slug>.html (run after convert-notion-guide.py).

Turns every example message into a chat bubble, groups WRONG / RIGHT examples into cards,
styles callouts and steps, adds a jump-to menu and bubble cells in tables. Nothing is removed.
Idempotent: a designed file starts with <!-- designed --> and is skipped.

Usage: python3 scripts/design-guides.py [slug ...]   (no args = every guide)
"""
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

VOID = {"br", "hr", "img"}
YOU_WORDS = {"you", "creator", "chatter", "me", "model", "her", "she"}
HIM_WORDS = {"him", "he", "sub", "fan", "subscriber", "guy"}
SENDER = r"(you|him|her|he|she|sub|fan|creator|subscriber|chatter|me|model)"
SENDER_RE = re.compile(rf"^(?:<strong>)?\s*{SENDER}\s*([^\w<:]{{0,12}})?:\s*(?:</strong>)?\s*(.*)$", re.I | re.S)
NOTE_RE = re.compile(r"^(?:continue|shift|keep|move|go back|redirect|then|never|wait|pause)\b", re.I)
HEADING_KIND = [("⚠️", "warn"), ("🚨", "warn"), ("✅", "good"), ("🟢", "good"), ("🔴", "bad"), ("❌", "bad"),
                ("💡", "insight"), ("🗂️", "phase"), ("🔵", "stage"), ("🏆", "phase")]
KEEP_CODE_SLUGS = {"hotkey-system"}


class Node:
    __slots__ = ("tag", "attrs", "children")

    def __init__(self, tag, attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []


class Builder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root, self.stack = [], []

    def _add(self, item):
        (self.stack[-1].children if self.stack else self.root).append(item)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self._add(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self._add(Node(tag, attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        self._add(data)

    def handle_entityref(self, name):
        self._add(f"&{name};")

    def handle_charref(self, name):
        self._add(f"&#{name};")


def render(item):
    if isinstance(item, str):
        return item
    attrs = "".join(f' {k}="{html.escape(v, quote=True)}"' if v is not None else f" {k}" for k, v in item.attrs.items())
    if item.tag in VOID:
        return f"<{item.tag}{attrs}>"
    return f"<{item.tag}{attrs}>{inner(item)}</{item.tag}>"


def inner(node):
    return "".join(render(c) for c in node.children)


def text_of(item):
    if isinstance(item, str):
        return html.unescape(item)
    return "".join(text_of(c) for c in item.children)


def slugify(label):
    return re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")[:60] or "section"


OPEN_QUOTES = ("&quot;", '"', "\u201c", "&#x201C;", "&ldquo;")
CLOSE_QUOTES = ("&quot;", '"', "\u201d", "&#x201D;", "&rdquo;")


def strip_quotes(body):
    body = body.strip()
    for open_q in OPEN_QUOTES:
        for close_q in CLOSE_QUOTES:
            if body.startswith(open_q) and body.endswith(close_q) and len(body) > len(open_q) + len(close_q):
                return body[len(open_q):-len(close_q)].strip()
    return body


def strip_wrapper(markup, tag):
    m = re.match(rf"^<{tag}>(.*)</{tag}>$", markup.strip(), re.S)
    return m.group(1) if m else markup


def split_lines(markup):
    return [part.strip() for part in re.split(r"<br\s*/?>", markup) if part.strip()]


def message_bubbles(markup, who="you"):
    """One bubble per <br>-separated line; bracketed stage directions become notes."""
    items = []
    for line in split_lines(markup):
        plain = text_of_markup(line)
        if re.match(r"^\[.*\]$", plain) and len(plain) > 12 and "[NAME]" not in plain:
            items.append({"kind": "note", "html": line})
        else:
            items.append({"kind": "bubble", "who": who, "html": strip_quotes(line)})
    return items


def text_of_markup(markup):
    return html.unescape(re.sub(r"<[^>]+>", "", markup)).strip()


def sender_kind(word):
    return "you" if word.lower() in YOU_WORDS else "him"


def bubbles_from_p(node, keep_code):
    markup = inner(node).strip()
    plain = text_of(node).strip()
    m = re.match(r"^<code>(.*)</code>$", markup, re.S) or re.match(r"^<mark>(.*)</mark>$", markup, re.S)
    if m and not keep_code:
        body = re.sub(r"^text(?=[\[a-z])", "", m.group(1).strip(), count=1) if ("<br" in m.group(1) or m.group(1).startswith("text[")) else m.group(1)
        return message_bubbles(body)
    m = SENDER_RE.match(markup)
    if m:
        body, note = m.group(3), None
        arrow = re.search(r"\s*(?:←|<-|→)\s*(.*)$", body, re.S)
        if arrow:
            body, note = body[: arrow.start()], text_of_markup(arrow.group(1))
        body = strip_quotes(re.sub(r"</?strong>", "", body))
        if NOTE_RE.match(text_of_markup(body)) and "&quot;" not in body and '"' not in body and len(body) < 60:
            return [{"kind": "note", "html": body}]
        items = message_bubbles(body, sender_kind(m.group(1)))
        if note and items and items[-1]["kind"] == "bubble":
            items[-1]["note"] = note
        return items
    if re.match(r"^\(.*\)$", plain, re.S) and len(plain) < 160:
        return [{"kind": "note", "html": markup[1:-1] if markup.startswith("(") else markup}]
    return None


def bubbles_from_blockquote(node):
    markup = strip_wrapper(strip_wrapper(inner(node).strip(), "strong"), "em").strip()
    plain = text_of_markup(markup)
    if re.match(r"^<strong>[^<]{2,60}:</strong>", markup):
        return None
    if "[NAME]" in plain or (re.match(r"^[a-z\[(]", plain) and len(plain) < 600):
        return message_bubbles(markup)
    return None


def bubbles_from_pre(node):
    lines = [l for l in text_of(node).split("\n") if l.strip()]
    prefixed = any(SENDER_RE.match(l.strip()) for l in lines)
    items = []
    for line in lines:
        m = SENDER_RE.match(line.strip())
        if m:
            items.extend(message_bubbles(html.escape(strip_quotes(m.group(3))), sender_kind(m.group(1))))
        else:
            items.extend(message_bubbles(html.escape(line.strip()), "you" if not prefixed else "you"))
    return items


def marker_kind(node):
    if node.tag not in ("p", "h3", "h4"):
        return None
    m = re.match(r"^\s*(🔴|🟢|❌|✅)?\s*(WRONG|RIGHT|BAD|GOOD)\b(.*)$", text_of(node).strip(), re.S)
    if not m:
        return None
    return ("bad" if m.group(2) in ("WRONG", "BAD") else "good", text_of(node).strip())


def callout_kind(node):
    plain = text_of(node).strip()
    for emoji, kind in (("💡", "insight"), ("⚠️", "warn"), ("🚨", "warn"), ("📋", "info"), ("📌", "info"), ("🎯", "info")):
        if plain.startswith(emoji):
            return kind
    return None


def render_chat(items):
    out, run_who, run = [], None, []

    def flush_run():
        if run:
            label = "YOU 🙋🏼‍♀️" if run_who == "you" else "HIM 🧔🏻"
            out.append(f'<div class="msg-run {run_who}"><span class="sender">{label}</span>' + "".join(run) + "</div>")
            run.clear()

    for item in items:
        if item["kind"] == "note":
            flush_run()
            run_who = None
            out.append(f'<div class="chat-note">{item["html"]}</div>')
            continue
        if item["who"] != run_who:
            flush_run()
            run_who = item["who"]
        tag = f'<span class="bubble-tag">{html.escape(item["note"])}</span>' if item.get("note") else ""
        run.append(f'<div class="bubble">{item["html"]}{tag}</div>')
    flush_run()
    return '<div class="chat">' + "".join(out) + "</div>"


def style_heading(node, toc):
    plain = text_of(node).strip()
    kind = next((k for emoji, k in HEADING_KIND if plain.startswith(emoji)), "")
    ident = slugify(plain)
    if node.tag == "h2":
        toc.append((ident, plain))
    markup = strip_wrapper(inner(node).strip(), "strong")
    m = re.match(r"^(\s*(?:[\U0001F300-\U0001FAFF☀-➿⬀-⯿][️‍\U0001F3FB-\U0001F3FF]*)+)\s*(.*)$", markup, re.S)
    body = f'<span class="h-emoji">{m.group(1).strip()}</span>{m.group(2)}' if m else markup
    cls = f' class="h-{kind}"' if kind else ""
    return f'<{node.tag} id="{ident}"{cls}>{body}</{node.tag}>'


def style_list(node, keep_code):
    for li in [c for c in node.children if not isinstance(c, str) and c.tag == "li"]:
        kids = li.children
        if len(kids) >= 2 and isinstance(kids[0], str) and re.match(r"^[^:]{1,50}:\s*$", kids[0]) and not isinstance(kids[1], str) and kids[1].tag == "code" and not keep_code:
            content = inner(kids[1])
            kids[0] = f'<span class="li-label">{kids[0].strip()}</span> '
            chip = Node("span", {"class": "msg-inline you"})
            chip.children = [content]
            kids[1] = chip
    markup = render(node)
    return markup if keep_code else markup.replace("<code>", '<span class="msg-inline">').replace("</code>", "</span>")


def style_table(node):
    headers = [text_of(th).strip().lower() for th in find_all(node, "th")]
    kinds = []
    for h in headers:
        if re.search(r"\b(he says|he told|he shares|his message|him|subscriber)\b", h): kinds.append("him")
        elif re.search(r"\b(bad|wrong)\b", h): kinds.append("bad")
        elif re.search(r"\b(good|right|your response|she says|message|reply|response|energy)\b", h): kinds.append("you")
        elif re.search(r"\bcode\b", h): kinds.append("code")
        else: kinds.append("")
    for tr in find_all(node, "tr"):
        cells = [c for c in tr.children if not isinstance(c, str) and c.tag == "td"]
        for i, td in enumerate(cells):
            kind = kinds[i] if i < len(kinds) else ""
            plain = text_of(td).strip()
            markup = inner(td).strip()
            if "<code>" in markup:
                chip = "you" if kind in ("you", "good") else ("bad" if kind == "bad" else "him")
                td.children = [markup.replace("<code>", f'<span class="msg-inline {chip}">').replace("</code>", "</span>")]
            elif kind in ("him", "you", "bad", "good") and plain:
                content = strip_quotes(inner(td).strip())
                td.children = [f'<span class="cell-bubble {kind}">{content}</span>']
            elif kind == "code" and plain:
                td.children = [f'<span class="hotkey">{inner(td).strip()}</span>']
    return '<div class="table-wrap">' + render(node) + "</div>"


def find_all(node, tag):
    found = []
    for c in node.children:
        if isinstance(c, str):
            continue
        if c.tag == tag:
            found.append(c)
        found.extend(find_all(c, tag))
    return found


def render_blocks(blocks, keep_code, toc):
    """Render a list of top-level nodes: chat grouping, examples, callouts, steps."""
    out, chat, i = [], [], 0

    def flush():
        if chat:
            out.append(render_chat(chat))
            chat.clear()

    while i < len(blocks):
        node = blocks[i]
        if isinstance(node, str):
            i += 1
            continue
        bubbles = None
        if node.tag == "p":
            bubbles = bubbles_from_p(node, keep_code)
        elif node.tag == "blockquote":
            bubbles = bubbles_from_blockquote(node)
        elif node.tag == "pre" and not keep_code:
            bubbles = bubbles_from_pre(node)
        if bubbles:
            chat.extend(bubbles)
            i += 1
            continue
        flush()
        if node.tag == "hr" and out and out[-1].startswith('<div class="chat">'):
            i += 1
            continue
        marker = marker_kind(node)
        if marker:
            kind, label = marker
            j = i + 1
            while j < len(blocks) and not stops_example(blocks, j, keep_code):
                j += 1
            body = render_blocks(blocks[i + 1:j], keep_code, toc)
            out.append(f'<div class="example {kind}"><div class="example-title">{label}</div>{body}</div>')
            i = j
            continue
        ck = callout_kind(node) if node.tag in ("p", "blockquote") else None
        if ck:
            extra = ""
            if text_of(node).strip().rstrip(":").count(" ") <= 6:
                extra, i = absorb_explanation(blocks, i, keep_code)
            out.append(f'<div class="callout {ck}">{inner(node).strip()}{extra}</div>')
            i += 1
            continue
        out.append(render_block(node, keep_code, toc))
        i += 1
    flush()
    return "\n".join(out)


def next_block(blocks, j):
    while j < len(blocks) and isinstance(blocks[j], str):
        j += 1
    return blocks[j] if j < len(blocks) else None


def yields_bubbles(node, keep_code):
    if node is None or isinstance(node, str):
        return False
    if node.tag == "p":
        return bool(bubbles_from_p(node, keep_code))
    if node.tag == "blockquote":
        return bool(bubbles_from_blockquote(node))
    return node.tag == "pre" and not keep_code


def is_label(node):
    plain = text_of(node).strip()
    return node.tag == "p" and plain.endswith(":") and len(plain) < 140 and not SENDER_RE.match(inner(node).strip())


def absorb_explanation(blocks, i, keep_code):
    """Pull the paragraphs / one list that explain a callout title into the callout. Returns (html, last index)."""
    parts, j, taken = [], i + 1, 0
    while j < len(blocks) and taken < 6:
        node = blocks[j]
        if isinstance(node, str):
            j += 1
            continue
        if node.tag in ("ul", "ol"):
            parts.append(style_list(node, keep_code))
            i, j, taken = j, j + 1, taken + 1
            break
        if node.tag == "p" and not is_label(node) and not yields_bubbles(node, keep_code) and callout_kind(node) is None and text_of(node).strip():
            parts.append(f"<p>{inner(node).strip()}</p>")
            i, j, taken = j, j + 1, taken + 1
            continue
        break
    return "".join(parts), i


def stops_example(blocks, j, keep_code):
    node = blocks[j]
    if isinstance(node, str):
        return False
    if node.tag in ("h2", "details", "table") or marker_kind(node):
        return True
    if node.tag == "hr":
        return not yields_bubbles(next_block(blocks, j + 1), keep_code)
    return node.tag == "p" and (callout_kind(node) is not None or is_label(node))


def render_block(node, keep_code, toc):
    if node.tag in ("h2", "h3", "h4"):
        return style_heading(node, toc)
    if node.tag in ("ul", "ol"):
        return style_list(node, keep_code)
    if node.tag == "table":
        return style_table(node)
    if node.tag == "blockquote":
        return f'<div class="callout quote">{inner(node).strip()}</div>'
    if node.tag == "p":
        markup, plain = inner(node).strip(), text_of(node).strip()
        m = re.match(r"^(?:<strong>)?Step\s+(\d+)[.:)]\s*(.*?)(?:</strong>)?$", markup, re.S)
        if m:
            return f'<div class="step"><span class="step-num">{m.group(1)}</span><div>{m.group(2)}</div></div>'
        cls = ' class="lead-label"' if plain.endswith(":") and len(plain) < 140 else ""
        if not keep_code:
            markup = markup.replace("<code>", '<span class="msg-inline">').replace("</code>", "</span>")
        return f"<p{cls}>{markup}</p>"
    return render(node)


def design(slug):
    path = Path("content/guides") / f"{slug}.html"
    src = path.read_text(encoding="utf-8")
    if src.startswith("<!-- designed -->"):
        print(f"{slug}: already designed, skipped")
        return
    builder = Builder()
    builder.feed(src)
    toc = []
    body = render_blocks(builder.root, slug in KEEP_CODE_SLUGS, toc)
    nav = ""
    if len(toc) >= 3:
        pills = "".join(f'<a href="#{i}">{html.escape(t)}</a>' for i, t in toc)
        nav = f'<nav class="toc"><span class="toc-title">Jump to</span>{pills}</nav>\n'
    path.write_text("<!-- designed -->\n" + nav + body + "\n", encoding="utf-8")
    print(f"{slug}: {body.count('class=\"bubble\"')} bubbles, {body.count('class=\"chat\"')} chats, "
          f"{body.count('class=\"example ')} examples, {body.count('class=\"callout ')} callouts, {len(toc)} sections")


if __name__ == "__main__":
    registered = set(json.loads(Path("content/guides/notion-links.json").read_text()).values())
    slugs = sys.argv[1:] or sorted(p.stem for p in Path("content/guides").glob("*.html") if p.stem in registered)
    for s in slugs:
        design(s)
