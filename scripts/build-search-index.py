#!/usr/bin/env python3
"""Rebuild search-index.json from the site's HTML pages and lecture transcripts.

The index powers the Cmd-K search in site.js. Run after editing page content,
renaming files, or adding/removing weeks:

    python3 scripts/build-search-index.py

Entries are {path, title, text}. HTML pages contribute their <title> and the
visible text of <main class="content">; transcripts contribute their raw text.
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "search-index.json")

SKIP_DIRS = {".git", "vendor", ".assets", "node_modules"}

# Elements whose contents are not visible page text.
DROP_BLOCKS = re.compile(
    r"<(script|style|template|noscript)\b[^>]*>.*?</\1>",
    re.IGNORECASE | re.DOTALL,
)
MAIN = re.compile(r'<main\b[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)</main>',
                  re.IGNORECASE | re.DOTALL)
TITLE = re.compile(r"<title>(.*?)</title>", re.IGNORECASE | re.DOTALL)
# Pages end their <title> with a " — CS6515" site suffix; search results read
# better without it repeated on every row.
TITLE_SUFFIX = re.compile(r"\s*[—-]\s*CS6515\s*$")
TAG = re.compile(r"<[^>]+>")
WS = re.compile(r"\s+")


def visible_text(fragment: str) -> str:
    fragment = DROP_BLOCKS.sub(" ", fragment)
    fragment = TAG.sub(" ", fragment)
    fragment = html.unescape(fragment)
    return WS.sub(" ", fragment).strip()


def index_html(path: str, rel: str):
    raw = open(path, encoding="utf-8", errors="replace").read()
    m = TITLE.search(raw)
    title = visible_text(m.group(1)) if m else rel
    title = TITLE_SUFFIX.sub("", title) or rel
    body = MAIN.search(raw)
    if not body:
        return None
    return {"path": rel, "title": title, "text": visible_text(body.group(1))}


def index_txt(path: str, rel: str):
    raw = open(path, encoding="utf-8", errors="replace").read()
    # "01_Week_01_Intro_DP.txt" -> "01 Week 01 Intro DP"
    title = os.path.splitext(os.path.basename(rel))[0].replace("_", " ")
    return {"path": rel, "title": title, "text": WS.sub(" ", raw).strip()}


def main() -> int:
    entries = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for name in sorted(filenames):
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, ROOT)
            if name.endswith(".html"):
                entry = index_html(full, rel)
            elif name.endswith(".txt") and "/transcripts/" in rel.replace(os.sep, "/"):
                entry = index_txt(full, rel)
            else:
                continue
            if entry:
                entries.append(entry)

    entries.sort(key=lambda e: e["path"])
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(entries, fh, ensure_ascii=False)
    print(f"wrote {len(entries)} entries to {os.path.relpath(OUT, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
