#!/usr/bin/env python3
"""Check static diagrams and dynamically imported graph notes in Chromium.

Requires Python Playwright and Chromium, matching scripts/check-math.py.
Run: python scripts/check-diagrams.py [relative/page.html ...]
"""

import argparse
import asyncio
from collections import Counter
from functools import partial
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import sys
import threading


ROOT = Path(__file__).resolve().parents[1]
HUB = "02_by_topic/GR_graphs/study-notes/index.html"


class DiagramCounter(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_pre = False
        self.is_diagram = False
        self.count = 0

    def handle_starttag(self, tag, attrs):
        classes = dict(attrs).get("class", "").split()
        if tag == "pre":
            self.in_pre = True
            self.is_diagram = "mermaid" in classes
        elif tag == "code" and self.in_pre:
            self.is_diagram |= bool({"mermaid", "language-mermaid"}.intersection(classes))

    def handle_endtag(self, tag):
        if tag == "pre" and self.in_pre:
            self.count += int(self.is_diagram)
            self.in_pre = False


def diagram_count(path):
    parser = DiagramCounter()
    parser.feed(path.read_text())
    return parser.count


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class QuietServer(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        if not isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError)):
            super().handle_error(request, client_address)


async def expect_diagrams(page, expected):
    await page.wait_for_function(
        """expected => {
            const blocks = [...document.querySelectorAll('pre.mermaid')];
            return blocks.length === expected && blocks.every(el => {
                const svg = el.querySelector('svg');
                return svg && parseFloat(svg.style.getPropertyValue('--diagram-width')) > 0;
            });
        }""", arg=expected, timeout=30000,
    )
    problems = await page.evaluate("""() => [...document.querySelectorAll('pre.mermaid')]
        .flatMap((el, index) => {
            const svg = el.querySelector('svg');
            if (!svg || svg.querySelector('.error-icon, .error-text')) return ['Diagram ' + index + ' failed'];
            return [];
        })""")
    if problems:
        raise AssertionError("; ".join(problems))


async def check_dynamic(page, base_url):
    requests = Counter()
    source_files = sorted((ROOT / HUB).parent.glob("*.html"))
    source_files = [path for path in source_files if path.name != "index.html"]
    sources = {path.name: diagram_count(path) for path in source_files}

    def record(request):
        filename = request.url.rsplit("/", 1)[-1]
        if filename in sources:
            requests[filename] += 1

    page.on("request", record)
    await page.goto(base_url + HUB, wait_until="load")
    for card in ["plan", "gr0", "gr1"]:
        await page.locator(f"#{card} > summary").click()
        await page.wait_for_selector(f"#{card} .study-note-body[data-loaded=true]")
        opened = await page.locator(".study-note-body[data-loaded=true]").count()
        assert opened == ["plan", "gr0", "gr1"].index(card) + 1
    # Opening a new note used to turn all earlier SVGs into plain source text.
    await expect_diagrams(page, sum(sources[name] for name in (
        "00-STUDY-PLAN.html", "01-GR0-Graph-Fundamentals.html", "02-GR1-Strongly-Connected-Components.html",
    )))
    await page.locator("#btn-expand-all").click()
    await page.wait_for_function("""() => [...document.querySelectorAll('.study-note-card')]
        .every(card => card.querySelector('.study-note-body').dataset.loaded === 'true')""", timeout=60000)
    await expect_diagrams(page, sum(sources.values()))

    result = await page.evaluate("""() => {
        const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
        const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
        const brokenLinks = [...document.querySelectorAll('.study-note-embedded a[href^="#study-"]')]
            .filter(el => !document.getElementById(decodeURIComponent(el.hash.slice(1))))
            .map(el => el.getAttribute('href'));
        const brokenSvgRefs = [...document.querySelectorAll('.study-note-embedded pre.mermaid svg')]
            .flatMap(svg => [...svg.querySelectorAll('*')].flatMap(el => [...el.attributes].flatMap(attr => {
                const refs = [...attr.value.matchAll(/url\\(\\s*['"]?#([^)'"\\s]+)['"]?\\s*\\)/g)].map(match => match[1]);
                if (['href', 'xlink:href'].includes(attr.name) && attr.value.startsWith('#')) refs.push(attr.value.slice(1));
                if (['aria-labelledby', 'aria-describedby'].includes(attr.name)) refs.push(...attr.value.split(/\\s+/));
                return refs.filter(id => document.getElementById(id)?.closest('svg') !== svg);
            })));
        return { duplicates, brokenLinks, brokenSvgRefs,
            mathErrors: [...document.querySelectorAll('.study-note-embedded .katex-error')].map(el => el.textContent),
            rawDiagrams: document.querySelectorAll('.study-note-embedded code.language-mermaid').length,
            plainCode: [...document.querySelectorAll('.study-note-embedded pre:not(.mermaid) > code')]
                .filter(el => !el.classList.contains('hljs')).length,
            demos: document.querySelectorAll('.study-note-embedded [data-graph-demo] svg').length,
            expectedDemos: document.querySelectorAll('.study-note-embedded [data-graph-demo]').length };
    }""")
    assert not result["duplicates"], f'Duplicate inline IDs: {result["duplicates"]}'
    assert not result["brokenLinks"], f'Broken inline anchor links: {result["brokenLinks"]}'
    assert not result["brokenSvgRefs"], f'Broken diagram references: {result["brokenSvgRefs"]}'
    assert not result["mathErrors"], f'Inline formula errors: {result["mathErrors"][:3]}'
    assert result["rawDiagrams"] == 0, "Imported Mermaid source was not normalized"
    assert result["plainCode"] == 0, "Imported code was not highlighted"
    assert result["demos"] == result["expectedDemos"] > 0, "Imported graph demonstrations were not initialized"
    assert set(requests) == set(sources), "Some notes were never fetched"
    assert all(count == 1 for count in requests.values()), f'Duplicate imports: {dict(requests)}'
    await page.locator("#btn-collapse-all").click()
    await page.locator("#btn-expand-all").click()
    await expect_diagrams(page, sum(sources.values()))
    assert all(count == 1 for count in requests.values()), "Reopening notes fetched them again"
    # Expand All also needs to work when all seven imports start together.
    requests.clear()
    await page.reload(wait_until="load")
    await page.locator("#btn-expand-all").click()
    await page.wait_for_function("""() => [...document.querySelectorAll('.study-note-card')]
        .every(card => card.querySelector('.study-note-body').dataset.loaded === 'true')""", timeout=60000)
    await expect_diagrams(page, sum(sources.values()))
    assert all(count == 1 for count in requests.values()), f'Duplicate simultaneous imports: {dict(requests)}'
    print(f"Graph Study Suite: {len(sources)} imports, {sum(sources.values())} diagrams, anchors, math, code and animations passed.", flush=True)


async def run(files, base_url, dynamic):
    from playwright.async_api import async_playwright

    failures = []
    total = 0
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            executable_path=shutil.which("chromium") or shutil.which("chromium-browser"),
            args=["--no-sandbox"],
        )
        context = await browser.new_context()
        await context.route("**/*", lambda route: route.continue_()
                            if route.request.url.startswith(base_url) else route.abort())
        page = await context.new_page()
        for file in files:
            count = diagram_count(ROOT / file)
            try:
                await page.goto(base_url + file, wait_until="load", timeout=60000)
                await expect_diagrams(page, count)
                total += count
            except Exception as error:
                failures.append(file)
                print(f"{file}: {error}", flush=True)
        if dynamic:
            try:
                await check_dynamic(page, base_url)
            except Exception as error:
                failures.append(HUB)
                print(f"{HUB}: {error}", flush=True)
        await browser.close()
    print(f"Checked {len(files)} pages, {total} static diagrams; {len(failures)} failures.")
    return bool(failures)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pages", nargs="*")
    parser.add_argument("--skip-dynamic", action="store_true")
    args = parser.parse_args()
    files = args.pages or sorted(str(path.relative_to(ROOT)) for path in ROOT.rglob("*.html")
                                if "vendor" not in path.relative_to(ROOT).parts and diagram_count(path))
    server = QuietServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        return asyncio.run(run(files, f"http://127.0.0.1:{server.server_port}/", not args.skip_dynamic))
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    raise SystemExit(main())
