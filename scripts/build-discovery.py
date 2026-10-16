#!/usr/bin/env python3
"""Generate static crawler discovery and URL-import sources, without dependencies.

Run after editing course content. For a custom domain or repository fork, pass
--base-url https://example.org/course/ so all exported URLs match deployment.
"""
import argparse
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import quote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_BASE = "https://dariennouri.github.io/cs6515-github-pages/"
GENERATED = {"content-index.html", "course-source.html"}
EXCLUDE = {".git", ".assets", "vendor", "node_modules", "tests"}
BLOCKS = {"p", "div", "section", "article", "blockquote", "tr", "ul", "ol",
          "pre", "h1", "h2", "h3", "h4", "h5", "h6"}


def clean_text(text):
    text = "\n".join(line.rstrip() for line in text.split("\n"))
    return re.sub(r"\n{3,}", "\n\n", text).strip()


class CourseText(HTMLParser):
    """Extract server-visible course text, preserving equations and code lines."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.title_parts = []
        self.in_title = False
        self.in_main = False
        self.pre = 0
        self.hidden = 0

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self.in_title = True
        if tag == "main":
            self.in_main = True
        if not self.in_main:
            return
        if tag in {"script", "style", "template", "noscript"}:
            self.hidden += 1
        if self.hidden:
            return
        if tag in BLOCKS or tag == "br":
            self.parts.append("\n")
        if tag == "li":
            self.parts.append("\n- ")
        if tag == "pre":
            self.pre += 1
            self.parts.append("```\n")
        if tag == "sub":
            self.parts.append("_{")
        if tag == "sup":
            self.parts.append("^{")

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if not self.in_main:
            return
        if tag in {"script", "style", "template", "noscript"}:
            self.hidden = max(0, self.hidden - 1)
            return
        if self.hidden:
            return
        if tag in {"sub", "sup"}:
            self.parts.append("}")
        if tag == "pre":
            self.parts.append("\n```\n")
            self.pre = max(0, self.pre - 1)
        if tag in {"td", "th"}:
            self.parts.append(" | ")
        if tag in BLOCKS:
            self.parts.append("\n")
        if tag == "main":
            self.in_main = False

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
        if self.in_main and not self.hidden:
            self.parts.append(data if self.pre else re.sub(r"\s+", " ", data))

    @property
    def text(self):
        return clean_text("".join(self.parts))

    @property
    def title(self):
        return "".join(self.title_parts).strip()


def source_url(base, path):
    return base + quote(path, safe="/-._~")


def collect(root, base):
    sources, documents = [], []
    for path in sorted(root.rglob("*")):
        rel = path.relative_to(root)
        if any(part in EXCLUDE or part.startswith(".") for part in rel.parts):
            continue
        if not path.is_file() or path.suffix.lower() not in {".html", ".txt", ".pdf"}:
            continue
        name = rel.as_posix()
        if path.suffix == ".html" and name not in GENERATED:
            page = CourseText()
            page.feed(path.read_text(encoding="utf-8"))
            if page.text:
                sources.append({"path": name, "url": source_url(base, name),
                                "title": page.title or name, "text": page.text})
        elif path.suffix == ".txt" and "transcripts" in rel.parts:
            sources.append({"path": name, "url": source_url(base, name),
                            "title": path.stem.replace("_", " "),
                            "text": clean_text(path.read_text(encoding="utf-8"))})
        elif path.suffix.lower() == ".pdf":
            documents.append({"path": name, "url": source_url(base, name),
                              "title": path.stem.replace("-", " ")})
    return sources, documents


def page(title, body):
    return ("<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">"
            '<meta name="viewport" content="width=device-width, initial-scale=1">'
            f"<title>{html.escape(title)} — CS6515</title>"
            '<meta name="robots" content="index,follow">'
            '<link rel="stylesheet" href="theme.css">'
            '<style>pre.source-text{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;'
            'line-height:1.65;background:transparent;padding:0;border:0} '
            '.import-links{display:flex;flex-wrap:wrap;gap:1rem} '
            'textarea{width:100%;min-height:12rem;padding:1rem;color:inherit;'
            'background:var(--panel,#152033);border:1px solid var(--border,#334155)}</style>'
            '</head><body><header class="topbar"><a class="home" href="index.html">'
            'CS6515</a></header><main class="content">'
            f"<h1>{html.escape(title)}</h1>\n{body}\n</main></body></html>\n")


def build(root, base):
    sources, documents = collect(root, base)
    if not sources:
        raise ValueError("No course sources found")
    unique = []
    by_text = {}
    for entry in sources:
        fingerprint = hashlib.sha256(re.sub(r"\s+", " ", entry["text"]).encode()).hexdigest()
        entry["sha256"] = fingerprint
        if fingerprint in by_text:
            entry["duplicate_of"] = by_text[fingerprint]["path"]
        else:
            by_text[fingerprint] = entry
            unique.append(entry)
    words = sum(len(e["text"].split()) for e in unique)
    intro = ("CS6515 — Graduate Algorithms\n"
             "Complete course source: HTML lessons and lecture transcripts.\n"
             "Repeated copies are included once; source URLs identify each lesson.\n"
             "Equations are preserved as text/LaTeX. Linked PDF contents are separate sources.\n\n")
    text = intro + "\n\n".join(f"# {e['title']}\nSource: {e['url']}\n\n{e['text']}" for e in unique)
    text += "\n\n# Linked PDF sources (import separately for their full contents)\n"
    text += "\n".join(e["url"] for e in documents) + "\n"
    (root / "course-source.txt").write_text(text, encoding="utf-8")
    body = ('<p>Complete server-visible lesson and transcript text, with repeated copies included once. '
            'No JavaScript is needed to read or import this page. '
            'Math is preserved as text/LaTeX; PDF contents require separate imports.</p>'
            '<p><a href="content-index.html">Source directory and importer instructions</a> · '
            '<a href="course-source.txt" download>Download plain text</a></p>\n')
    body += "\n".join(
        f'<section id="source-{i}"><h2>{html.escape(e["title"])}</h2>'
        f'<p>Source: <a href="{html.escape(e["url"], quote=True)}">{html.escape(e["path"])}</a></p>'
        f'<pre class="source-text">{html.escape(e["text"])}</pre></section>'
        for i, e in enumerate(unique, 1))
    body += '<h2>Linked PDF sources</h2><ul>' + "".join(
        f'<li><a href="{html.escape(e["url"], quote=True)}">{html.escape(e["path"])}</a></li>'
        for e in documents) + '</ul>'
    (root / "course-source.html").write_text(page("Complete course source", body), encoding="utf-8")

    urls = "\n".join(e["url"] for e in unique)
    body = ('<p>Import course lessons into NotebookLM or another reading tool. Some URL importers '
            'read only the supplied page and do not follow its links. For those tools, paste the '
            '<a href="course-source.html">complete course source URL</a> or download and upload '
            '<a href="course-source.txt" download>the plain-text source</a>. '
            'The homepage URL alone cannot make a third-party importer crawl this site.</p>'
            f'<p>The combined source includes {len(unique)} distinct lessons/transcripts '
            f'({words:,} words), with identical copies removed. If your tool has a source-size limit, '
            'import selected lesson URLs below instead. Video/audio and linked PDF contents '
            'are not transcribed by this export; transcripts already in the site are included.</p>'
            '<div class="import-links"><a href="course-source.html">Complete course source</a>'
            '<a href="course-source.txt" download>Plain text</a><a href="sitemap.xml">XML sitemap</a>'
            '<a href="llms.txt">llms.txt</a><a href="content-manifest.json">JSON manifest</a></div>'
            '<h2>Copy lesson URLs</h2><p>Select the list to copy it into tools that accept multiple URLs. '
            'Repeated copies are omitted from this list.</p>'
            f'<textarea aria-label="Distinct course source URLs" readonly>{html.escape(urls)}</textarea>'
            '<h2>All lessons and transcripts</h2><ul>')
    for entry in sources:
        suffix = " (copy of another listed source)" if "duplicate_of" in entry else ""
        body += (f'<li><a href="{html.escape(entry["url"], quote=True)}">'
                 f'{html.escape(entry["title"])}</a> — {html.escape(entry["path"])}{suffix}</li>\n')
    body += '</ul><h2>PDF readings</h2><p>Import these URLs separately to include the textbook text.</p><ul>'
    body += "".join(f'<li><a href="{html.escape(e["url"], quote=True)}">{html.escape(e["path"])}</a></li>' for e in documents)
    body += '</ul>'
    (root / "content-index.html").write_text(page("Course content & imports", body), encoding="utf-8")

    manifest = {"base_url": base, "combined_source": source_url(base, "course-source.html"),
                "text_source": source_url(base, "course-source.txt"), "distinct_sources": len(unique),
                "word_count": words, "sources": [{k: v for k, v in e.items() if k != "text"} for e in sources],
                "pdfs": documents}
    (root / "content-manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    namespace = "http://www.sitemaps.org/schemas/sitemap/0.9"
    ET.register_namespace("", namespace)
    sitemap = ET.Element(f"{{{namespace}}}urlset")
    for name in sorted({e["path"] for e in sources + documents} | GENERATED | {"course-source.txt"}):
        url = ET.SubElement(sitemap, f"{{{namespace}}}url")
        ET.SubElement(url, f"{{{namespace}}}loc").text = source_url(base, name)
    ET.indent(sitemap)
    ET.ElementTree(sitemap).write(root / "sitemap.xml", encoding="utf-8", xml_declaration=True)
    (root / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {base}sitemap.xml\n", encoding="utf-8")
    llms = ("# CS6515 — Graduate Algorithms\n\n"
            "> Week-based course notes, algorithm references, and lecture transcripts.\n\n"
            "## Complete course sources\n"
            f"- [Course source]({base}course-source.html): all distinct lessons/transcripts in static HTML.\n"
            f"- [Plain-text course source]({base}course-source.txt): downloadable UTF-8 text with source URLs.\n"
            f"- [Content directory]({base}content-index.html): all page and PDF links, plus import instructions.\n"
            f"- [Manifest]({base}content-manifest.json): source paths, URLs, content hashes, and duplicates.\n\n"
            "## Lessons and transcripts\n")
    llms += "\n".join(f"- [{e['title']}]({e['url']})" for e in unique) + "\n"
    (root / "llms.txt").write_text(llms, encoding="utf-8")
    print(f"Discovery built: {len(sources)} sources, {len(unique)} distinct, {words:,} words, {len(documents)} PDFs")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=DEFAULT_BASE)
    args = parser.parse_args()
    parsed = urlsplit(args.base_url)
    if parsed.scheme != "https" or not parsed.netloc or parsed.query or parsed.fragment or parsed.username or parsed.password:
        parser.error("--base-url must be a public HTTPS site root without credentials, query, or fragment")
    build(ROOT, args.base_url.rstrip("/") + "/")


if __name__ == "__main__":
    main()
