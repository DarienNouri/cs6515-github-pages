#!/usr/bin/env python3
"""Check compact topic resources in Chromium, including all reading pages.

Requires Python Playwright (python -m pip install playwright) and Chromium,
or python -m playwright install chromium. Run from any directory:
    python scripts/check-resources.py             # representative cases + all pages
    python scripts/check-resources.py --targeted  # mappings, keyboard, mobile, imports
No external links are fetched; their destinations and local PDF files are checked.
"""

import argparse
import asyncio
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import shutil
import sys
import threading
from urllib.parse import parse_qs, unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
WEEKS = sorted(str(path.relative_to(ROOT)) for path in (ROOT / "01_by_week").glob("W*/index.html"))
CHAPTER = "textbooks/examples-md/06-dynamic-programming-dpv-examples.html"
SUITE = "02_by_topic/GR_graphs/study-notes/index.html"
CASES = [
    (WEEKS[0], "Two-sequence DP", "lcs", "longest common subsequence"),
    (WEEKS[1], "Master theorem", "master", "master theorem"),
    (WEEKS[2], "QuickSelect", "quickselect", "quickselect"),
    (WEEKS[3], "2-SAT (GR2)", "2sat", "2-SAT"),
    (WEEKS[4], "Union-Find (disjoint sets)", "union-find", "union-find"),
    (WEEKS[5], "Ford-Fulkerson", "ford-fulkerson", "fulkerson"),
    (WEEKS[6], "Edmonds-Karp", "edmonds-karp", "edmonds"),
    (WEEKS[7], "Polynomial-time reduction", "reduction", "reductions"),
    (WEEKS[8], "Standard form", "lp", "linear programming"),
    (WEEKS[9], "Approximation ratio", "approximation", "approximation"),
    (WEEKS[10], "Fermat's little theorem", None, "fermat"),
    (CHAPTER, "Exercises", "dp", "dynamic programming"),
]

DIAGNOSTICS = r"""() => {
    const menus = [...document.querySelectorAll('[data-topic-resources]')];
    const problems = [];
    for (const menu of menus) {
        const summary = menu.firstElementChild;
        if (menu.tagName !== 'DETAILS' || summary?.tagName !== 'SUMMARY' ||
            menu.querySelectorAll(':scope > summary').length !== 1) {
            problems.push('Resources must use native details/summary');
        }
        if (summary?.hasAttribute('role')) problems.push('Native summary role was overridden');
        if (menu.open) problems.push('Resource menu starts expanded');
        if (!menu.previousElementSibling?.matches('h1,h2,h3,h4,h5,h6')) problems.push('Menu has no topic heading');
        if (!menu.getAttribute('aria-label')) problems.push('Menu has no topic-specific accessible label');
        const links = [...menu.querySelectorAll('a')];
        if (links.length < 2) problems.push('Resource menu has too few links');
        if (!links[0]?.textContent.startsWith('YouTube search: ')) problems.push('Video link must identify itself as a YouTube search');
        if (!links.some(link => link.hostname === 'en.wikipedia.org')) problems.push('Resource menu has no Wikipedia reference');
        for (const link of links) {
            if (link.target !== '_blank' || !link.relList.contains('noopener') || !link.relList.contains('noreferrer')) {
                problems.push('Reference link has unsafe new-tab attributes');
            }
        }
    }
    // Known subject names should receive resources wherever they appear as real
    // headings, even in copied notes; organizational and demo headings are exempt.
    const subjects = /\b(?:fibonacci|knapsack|karatsuba|quickselect|kosaraju|dijkstra|bellman|floyd|kruskal|prim|edmonds|ford.fulker|2.sat|simplex|duality|pagerank|bloom|fourier|fermat)\b/i;
    for (const heading of document.querySelectorAll('main h1,main h2,main h3,main h4,main h5,main h6')) {
        if (heading.closest('summary,nav,aside,.graph-demo,[data-no-topic-resources]')) continue;
        const text = heading.textContent.replace(/\s+/g, ' ').trim();
        if (!subjects.test(text) || /^(?:worked example|example|algorithms|key theorems|common pitfalls|how to answer)/i.test(text)) continue;
        if (!heading.nextElementSibling?.matches('[data-topic-resources]')) problems.push('Missing resources for: ' + text);
    }
    return {
        problems,
        count: menus.length,
        links: [...new Set(menus.flatMap(menu => [...menu.querySelectorAll('a')].map(anchor => anchor.href)))]
    };
}"""


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class QuietServer(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        if not isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError)):
            super().handle_error(request, client_address)


def check_links(urls, base_url):
    problems = []
    base = urlsplit(base_url)
    for url in urls:
        parsed = urlsplit(url)
        if parsed.netloc == base.netloc:
            path = (ROOT / unquote(parsed.path).lstrip("/")).resolve()
            if not path.is_relative_to(ROOT) or not path.is_file():
                problems.append("Missing local resource: " + parsed.path)
            if path.suffix.lower() != ".pdf":
                problems.append("Local resource is not a PDF: " + parsed.path)
        elif parsed.scheme != "https":
            problems.append("External resource does not use HTTPS: " + url)
        elif parsed.hostname == "www.youtube.com":
            query = parse_qs(parsed.query).get("search_query", [""])[0]
            if parsed.path != "/results" or not query.strip() or "%20" not in parsed.query:
                problems.append("Invalid or unencoded YouTube search: " + url)
            if re.search(r"undefined|\bnull\b|<[^>]+>", query):
                problems.append("Malformed YouTube search: " + query)
        elif parsed.hostname == "en.wikipedia.org":
            if parsed.path.startswith("/wiki/"):
                if not unquote(parsed.path.removeprefix("/wiki/")).strip():
                    problems.append("Empty Wikipedia article: " + url)
            elif parsed.path != "/w/index.php" or not parse_qs(parsed.query).get("search"):
                problems.append("Invalid Wikipedia reference: " + url)
        else:
            problems.append("Unexpected external resource host: " + url)
    return problems


async def navigate(page, base_url, file):
    response = await page.goto(base_url + file, wait_until="load", timeout=60000)
    if not response or not response.ok:
        raise RuntimeError(f"Page request failed: {response.status if response else 'no response'}")
    await page.wait_for_function("typeof window.enhanceTopicResources === 'function'", timeout=10000)


async def heading_menu(page, text):
    headings = page.locator("main h1,main h2,main h3,main h4,main h5,main h6").filter(has_text=text)
    # Some pages repeat an algorithm in a comprehensive-note summary. The first
    # matching substantive heading is the visible section being tested.
    heading = headings.first
    if not await heading.count():
        raise AssertionError("Missing representative heading: " + text)
    return heading.locator("xpath=following-sibling::*[1]")


async def check_targeted(context, base_url):
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    menus_checked = 0
    try:
        for file, heading, topic, query_fragment in CASES:
            await navigate(page, base_url, file)
            menu = await heading_menu(page, heading)
            if not await menu.evaluate("menu => menu.matches('details.topic-resources')"):
                raise AssertionError(f"{file}: no compact menu after {heading}")
            if topic and await menu.get_attribute("data-topic-resources") != topic:
                raise AssertionError(f"{heading}: wrong subject {await menu.get_attribute('data-topic-resources')}")
            links = await menu.locator("a").evaluate_all("anchors => anchors.map(anchor => anchor.href)")
            problems = check_links(links, base_url)
            if problems:
                raise AssertionError("; ".join(problems))
            query = parse_qs(urlsplit(links[0]).query)["search_query"][0]
            if query_fragment.casefold() not in query.casefold():
                raise AssertionError(f"{heading}: unrelated YouTube query {query}")
            if heading == "Fermat's little theorem" and not any("Fermat%27s_little_theorem" in link or "Fermat's_little_theorem" in link for link in links):
                raise AssertionError("Fermat's little theorem links to a different Fermat topic")
            initial = await page.evaluate(DIAGNOSTICS)
            if initial["problems"]:
                raise AssertionError(f"{file}: {initial['problems']}")
            # Repeated enhancement must preserve menus and their collapsed state.
            await page.evaluate("window.enhanceTopicResources(); window.enhanceTopicResources()")
            if await page.locator("[data-topic-resources]").count() != initial["count"]:
                raise AssertionError("Repeated enhancement duplicated menus: " + file)
            menus_checked += 1
        await check_mobile(page, base_url)
        await check_imports(page, base_url)
        if errors:
            raise AssertionError("JavaScript errors: " + "; ".join(errors))
        print(f"Representative resources: {menus_checked} topics across 11 weeks and a textbook chapter passed.", flush=True)
        print("Native keyboard toggles, 320/390px layouts, and GR0/GR3 imported-note idempotence passed.", flush=True)
        return False
    except Exception as error:
        print(f"Representative resource checks failed: {error}", flush=True)
        return True
    finally:
        await page.close()


async def check_mobile(page, base_url):
    for width in (320, 390):
        await page.set_viewport_size({"width": width, "height": 844})
        for file, title in ((WEEKS[0], "Two-sequence DP"), (WEEKS[3], "2-SAT (GR2)")):
            await navigate(page, base_url, file)
            menu = await heading_menu(page, title)
            summary = menu.locator(":scope > summary")
            if await menu.get_attribute("open") is not None:
                raise AssertionError("Mobile resource starts expanded")
            await summary.focus()
            await summary.press("Enter")
            await page.wait_for_function("document.activeElement.parentElement.open")
            if not await menu.locator("ul").is_visible():
                raise AssertionError("Enter did not reveal reference links")
            sizes = await menu.evaluate("""menu => ({
                left: menu.getBoundingClientRect().left,
                right: menu.getBoundingClientRect().right,
                width: window.innerWidth,
                overflowing: menu.scrollWidth > menu.clientWidth + 1,
                summaryHeight: menu.querySelector('summary').getBoundingClientRect().height
            })""")
            if sizes["left"] < -1 or sizes["right"] > width + 1 or sizes["overflowing"]:
                raise AssertionError(f"{width}px resource menu overflows: {sizes}")
            if sizes["summaryHeight"] > 48:
                raise AssertionError(f"{width}px summary is not compact: {sizes}")
            await summary.press("Enter")
            if await menu.get_attribute("open") is not None:
                raise AssertionError("Enter did not collapse reference links")
            if await menu.locator("ul").is_visible():
                raise AssertionError("Collapsed reference links remain visible")


async def check_imports(page, base_url):
    await page.set_viewport_size({"width": 1280, "height": 900})
    await navigate(page, base_url, SUITE)
    for card_id in ("gr0", "gr3"):
        card = page.locator("#" + card_id)
        await card.locator(":scope > summary").click()
        await page.wait_for_function("id => document.querySelector('#' + id + ' .study-note-body')?.dataset.loaded === 'true'", arg=card_id, timeout=60000)
        body = card.locator(".study-note-body")
        before = await body.locator("[data-topic-resources]").count()
        if before < 3:
            raise AssertionError(f"Imported {card_id} is missing its topic resources")
        await body.evaluate("root => { window.enhanceTopicResources(root); window.enhanceTopicResources(root); }")
        if await body.locator("[data-topic-resources]").count() != before:
            raise AssertionError("Repeated enhancement duplicated imported " + card_id + " resources")
        links = await body.locator("[data-topic-resources] a").evaluate_all("anchors => anchors.map(anchor => anchor.href)")
        if problems := check_links(links, base_url):
            raise AssertionError(f"Imported {card_id}: {problems}")
        if await body.locator("[data-topic-resources][open]").count():
            raise AssertionError("Imported resources start expanded")


async def check_sweep(context, base_url, files):
    queue = asyncio.Queue()
    for file in files:
        queue.put_nowait(file)
    failures = []
    total_menus = 0
    destinations = set()

    async def worker():
        nonlocal total_menus
        page = await context.new_page()
        while not queue.empty():
            file = queue.get_nowait()
            errors = []
            listener = lambda error: errors.append(str(error))
            page.on("pageerror", listener)
            try:
                await navigate(page, base_url, file)
                result = await page.evaluate(DIAGNOSTICS)
                problems = result["problems"] + errors + check_links(result["links"], base_url)
                total_menus += result["count"]
                destinations.update(result["links"])
                before = result["count"]
                await page.evaluate("window.enhanceTopicResources()")
                if await page.locator("[data-topic-resources]").count() != before:
                    problems.append("Repeated enhancement duplicated menus")
                if problems:
                    failures.append((file, problems))
                    print(file, *dict.fromkeys(problems), sep="\n  ", flush=True)
            except Exception as error:
                failures.append((file, [str(error)]))
                print(f"{file}: {error}", flush=True)
            finally:
                page.remove_listener("pageerror", listener)
                queue.task_done()
        await page.close()

    await asyncio.gather(*(worker() for _ in range(min(4, len(files)))))
    print(f"Resource sweep: {len(files)} pages, {total_menus} menus, {len(destinations)} distinct destinations; {len(failures)} pages failed.", flush=True)
    return bool(failures)


async def run(base_url, targeted):
    from playwright.async_api import async_playwright

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            executable_path=shutil.which("chromium") or shutil.which("chromium-browser"),
            args=["--no-sandbox"],
        )
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        await context.route("**/*", lambda route: route.continue_() if route.request.url.startswith(base_url) else route.abort())
        failed = await check_targeted(context, base_url)
        if not targeted:
            files = sorted(str(path.relative_to(ROOT)) for path in ROOT.rglob("*.html")
                           if "vendor" not in path.relative_to(ROOT).parts
                           and path.name not in {"content-index.html", "course-source.html"})
            failed = await check_sweep(context, base_url, files) or failed
        await browser.close()
        return failed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--targeted", action="store_true", help="Run representative and interaction checks only")
    args = parser.parse_args()
    server = QuietServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        return asyncio.run(run(f"http://127.0.0.1:{server.server_port}/", args.targeted))
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    raise SystemExit(main())
