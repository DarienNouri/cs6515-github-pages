#!/usr/bin/env python3
"""Run focused site regressions in a real browser against a temporary local server.

Requires Playwright (python -m pip install playwright) and Chromium, or the
Playwright Chromium browser (python -m playwright install chromium).
Run from any directory: python scripts/check-site.py
"""

import asyncio
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import shutil
import sys
import threading


ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class QuietServer(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        if not isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError)):
            super().handle_error(request, client_address)


def require(condition, message):
    if not condition:
        raise AssertionError(message)


async def check_site(base_url):
    from playwright.async_api import async_playwright, expect

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            executable_path=shutil.which("chromium") or shutil.which("chromium-browser"),
            args=["--no-sandbox"],
        )
        try:
            context = await browser.new_context()
            # Remote video embeds are unrelated to these local regressions.
            await context.route(
                "**/*", lambda route: route.continue_()
                if route.request.url.startswith(base_url) else route.abort()
            )
            page = await context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("console", lambda message: errors.append(message.text)
                    if message.type == "warning" and "error:" in message.text else None)

            # Search index loading calls navigation setup for a second time. The
            # homepage hero nests its h1, which previously broke insertBefore.
            async with page.expect_response(base_url + "search-index.json") as pending:
                await page.goto(base_url + "index.html", wait_until="load")
            response = await pending.value
            require(response.ok, "Homepage search index did not load successfully")
            search_index = await response.json()
            require(any(item.get("path") == "graph-demonstrations.html" for item in search_index),
                    "Search index does not include the graph demonstrations")
            await expect(page.locator("[data-top-nav]")).to_have_count(1)
            await expect(page.locator("[data-bottom-nav]")).to_have_count(1)
            await expect(page.locator('main a.card[href="graph-demonstrations.html"]')).to_have_count(1)
            await expect(page.locator('main a.card[href="content-index.html"]')).to_have_count(1)
            await page.locator("[data-search-trigger]").click()
            await page.locator("[data-search-input]").fill("graph algorithm demonstrations")
            await expect(page.locator(
                '[data-search-result][href$="/graph-demonstrations.html"]'
            )).to_be_visible()
            await expect(page.locator("[data-top-nav]")).to_have_count(1)
            await expect(page.locator("[data-bottom-nav]")).to_have_count(1)
            print("Homepage: navigation, study tools, and indexed search passed.")

            await page.goto(base_url + "module-week-schedule.html", wait_until="load")
            week_labels = await page.locator("main table tbody tr td:first-child strong").all_text_contents()
            require(week_labels == [f"Week {number}" for number in range(1, 12)],
                    f"Weekly study plan has unexpected weeks: {week_labels}")
            plan = await page.locator("main").inner_text()
            require(not re.search(r"\b(?:exam|quiz|hw|homework)\s*\d+\b", plan, re.I),
                    "Weekly study plan contains a numbered assessment")
            print("Weekly study plan: weeks 1–11 without numbered assessments passed.")

            await page.goto(base_url + "01_by_week/W05_GR3/index.html", wait_until="load")
            heading = page.get_by_role("heading", name="Minimum spanning tree: edges and cycles", exact=True)
            await expect(heading).to_have_count(1)
            await expect(page.locator('[data-graph-demo="kruskal"][data-graph-ready] svg')).to_have_count(1)
            await expect(heading).to_be_visible()
            heading_id = await heading.get_attribute("id")
            require(bool(heading_id), "Embedded graph heading has no outline target")
            await expect(page.locator(f'.sidebar-toc__link[href="#{heading_id}"]')).to_have_count(1)
            print("Week 5: embedded graph and its heading/outline target passed.")

            # Long notes need to scroll their outline without pulling the page
            # away from the formula the reader navigated to.
            await page.goto(base_url + "01_by_week/W01_DP1-DP2/notes/full-course-notes.html", wait_until="load")
            await page.evaluate("document.fonts.ready")
            scroll = await page.evaluate("""async () => {
                document.documentElement.style.scrollBehavior = 'auto';
                const target = document.getElementById('master-theorem-generalization');
                if (!target) throw new Error('Missing long-note heading');
                target.scrollIntoView({block: 'start', behavior: 'instant'});
                const before = window.scrollY;
                const beforeTop = target.getBoundingClientRect().top;
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                return {before, after: window.scrollY, beforeTop, afterTop: target.getBoundingClientRect().top};
            }""")
            # The sticky toolbar may shrink slightly on the first scroll. The
            # invariant is that the requested heading stays at its reading
            # position, rather than jumping to a different course section.
            require(abs(scroll['afterTop'] - scroll['beforeTop']) <= 16
                    and abs(scroll['after'] - scroll['before']) <= 32,
                    f"Outline scrolling moved the reading position: {scroll}")
            print("Long notes: outline scrolling preserves the reading position.")
            require(not errors, "Browser errors:\n" + "\n".join(errors))

            static_context = await browser.new_context(java_script_enabled=False)
            static_page = await static_context.new_page()
            await static_page.goto(base_url + "content-index.html", wait_until="load")
            require(await static_page.locator("main li a").count() > 10,
                    "Content directory does not expose a static source list")
            await expect(static_page.locator(
                'main li a[href$="/01_by_week/W01_DP1-DP2/index.html"]'
            )).to_have_count(1)
            await expect(static_page.locator('main a[href="course-source.html"]').first).to_be_visible()
            require(await static_page.locator("script").count() == 0,
                    "Content directory unexpectedly requires scripts")
            await static_page.goto(base_url + "course-source.html", wait_until="load")
            require(await static_page.locator("pre.source-text").count() > 10,
                    "Combined source does not contain static lesson text")
            source = await static_page.locator("main").inner_text()
            require(len(source) > 10000 and "Longest Common Subsequence" in source,
                    "Combined source is missing substantial course content")
            require("\\begin{cases}" in source, "Combined source lost LaTeX equations")
            require(await static_page.locator("script").count() == 0,
                    "Combined course source unexpectedly requires scripts")
            print("Import sources: directory, lesson text, and LaTeX work without JavaScript.")
        finally:
            await browser.close()
    print("Site regression smoke passed.")


def main():
    handler = partial(QuietHandler, directory=str(ROOT))
    server = QuietServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        asyncio.run(check_site(f"http://127.0.0.1:{server.server_port}/"))
        return 0
    except Exception as error:
        print(f"Site regression smoke failed: {error}", file=sys.stderr)
        return 1
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


if __name__ == "__main__":
    raise SystemExit(main())
