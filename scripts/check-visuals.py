#!/usr/bin/env python3
"""Check algorithm walkthrough controls, imports, and small-screen behavior.

Requires Python Playwright and Chromium, matching scripts/check-math.py.
Run from any directory: python scripts/check-visuals.py
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
LAB = "algorithm-demonstrations.html"
WEEK_ONE = "01_by_week/W01_DP1-DP2/index.html"
GRAPH_SUITE = "02_by_topic/GR_graphs/study-notes/index.html"
DEMOS = ("lcs", "knapsack", "merge-sort", "scc", "linear-programming")


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


async def visit(page, base_url, path):
    response = await page.goto(base_url + path, wait_until="load", timeout=60000)
    require(response is not None and response.ok, f"Page failed to load: {path}")


def demo(page, name, prefix=""):
    return page.locator(prefix + f'[data-algorithm-visual="{name}"][data-visual-ready="true"]')


def control(widget, action):
    return widget.locator(f'[data-av-action="{action}"]')


async def step(widget):
    return int(await widget.locator(".av-view").get_attribute("data-step"))


async def jump_to_end(page, widget):
    slider = widget.locator('.av-scrub input[type="range"]')
    last = int(await slider.get_attribute("max"))
    await slider.focus()
    await page.keyboard.press("End")
    from playwright.async_api import expect
    await expect(slider).to_have_value(str(last))
    await expect(widget.locator(".av-view")).to_have_attribute("data-step", str(last))
    return last


async def check_controls(page, widget, name):
    from playwright.async_api import expect

    await expect(widget.locator(".algorithm-visual")).to_have_count(1)
    view = widget.locator(".av-view")
    await expect(view).to_have_attribute("data-step", "0")
    initial = await view.inner_html()
    require(bool(initial.strip()) and await view.locator(":scope > *").count() > 0,
            f"{name}: walkthrough mounted without rendering a diagram or state")
    position = await widget.locator(".av-position").inner_text()
    match = re.match(r"^Step\s+1\s+of\s+(\d+)\b", position)
    require(match is not None and int(match.group(1)) > 2,
            f"{name}: missing meaningful step count: {position!r}")
    slider = widget.locator('.av-scrub input[type="range"]')
    require(await slider.get_attribute("min") == "0"
            and int(await slider.get_attribute("max")) + 1 == int(match.group(1)),
            f"{name}: scrubber does not span the walkthrough")
    await expect(control(widget, "back")).to_be_disabled()
    await expect(control(widget, "play")).to_have_text("Play")

    await control(widget, "next").click()
    await expect(view).to_have_attribute("data-step", "1")
    await control(widget, "back").click()
    await expect(view).to_have_attribute("data-step", "0")
    await control(widget, "next").focus()
    await page.keyboard.press("Enter")
    await expect(view).to_have_attribute("data-step", "1")
    await control(widget, "reset").click()
    await expect(view).to_have_attribute("data-step", "0")

    await jump_to_end(page, widget)
    await expect(control(widget, "next")).to_be_disabled()
    require(await view.inner_html() != initial, f"{name}: final diagram is unchanged")
    require(bool((await widget.locator(".av-explanation").inner_text()).strip()),
            f"{name}: final step lacks an explanation")
    await control(widget, "reset").click()
    await expect(view).to_have_attribute("data-step", "0")

    await widget.locator(".av-speed select").select_option(label="Fast")
    await control(widget, "play").click()
    await expect(control(widget, "play")).to_have_text("Pause")
    await expect(view).not_to_have_attribute("data-step", "0", timeout=6000)
    await control(widget, "play").click()
    await expect(control(widget, "play")).to_have_text("Play")
    paused = await step(widget)
    await page.wait_for_timeout(800)
    require(await step(widget) == paused, f"{name}: steps advanced after Pause")

    presets = widget.locator("[data-av-preset]")
    changed_preset = False
    if await presets.count():
        choices = await presets.locator("option").evaluate_all("options => options.map(option => option.value)")
        if len(choices) > 1:
            current = await presets.input_value()
            replacement = next(choice for choice in choices if choice != current)
            await control(widget, "play").click()
            await presets.select_option(replacement)
            await expect(view).to_have_attribute("data-step", "0")
            await expect(control(widget, "play")).to_have_text("Play")
            await expect(control(widget, "back")).to_be_disabled()
            await page.wait_for_timeout(800)
            require(await step(widget) == 0, f"{name}: changing examples did not stop playback")
            changed_preset = True
    await control(widget, "reset").click()
    print(f"{name}: steps, keyboard, scrubber, playback, reset, and example controls passed.", flush=True)
    return changed_preset


async def check_exclusive_playback(page, first, second):
    from playwright.async_api import expect

    await control(first, "reset").click()
    await control(second, "reset").click()
    await control(first, "play").click()
    await expect(control(first, "play")).to_have_text("Pause")
    await control(second, "play").click()
    await expect(control(first, "play")).to_have_text("Play")
    await expect(control(second, "play")).to_have_text("Pause")
    paused = await step(first)
    await page.wait_for_timeout(800)
    require(await step(first) == paused, "Starting another walkthrough left the previous one running")
    await control(second, "play").click()


async def open_ancestor_disclosures(widget):
    # Imported notes may contain a nested disclosure under the study-suite card.
    # Setting open invokes the same native toggle events as opening its summary.
    await widget.evaluate("""node => {
        for (let parent = node.parentElement; parent; parent = parent.parentElement) {
            if (parent.tagName === 'DETAILS') parent.open = true;
        }
    }""")


async def check_inline_and_imports(page, base_url):
    from playwright.async_api import expect

    await visit(page, base_url, WEEK_ONE)
    inline = demo(page, "lcs")
    await expect(inline).to_have_count(1)
    disclosure = inline.locator("xpath=ancestor::details[1]")
    await expect(disclosure).to_have_count(1)
    require(await disclosure.get_attribute("open") is None, "Inline LCS walkthrough starts expanded")
    await disclosure.locator(":scope > summary").click()
    await expect(control(inline, "play")).to_be_visible()
    await inline.locator(".av-speed select").select_option(label="Fast")
    await control(inline, "play").click()
    await expect(control(inline, "play")).to_have_text("Pause")
    await disclosure.locator(":scope > summary").click()
    await expect(control(inline, "play")).to_have_text("Play")
    paused = await step(inline)
    await page.wait_for_timeout(800)
    require(await step(inline) == paused, "Closing the inline disclosure did not pause playback")

    await visit(page, base_url, GRAPH_SUITE)
    await page.locator("#gr1 > summary").click()
    await expect(page.locator('#gr1 .study-note-body[data-loaded="true"]')).to_have_count(1, timeout=60000)
    imported = demo(page, "scc", "#gr1 ")
    await expect(imported).to_have_count(1, timeout=30000)
    await open_ancestor_disclosures(imported)
    await expect(imported.locator(".av-view > *").first).to_be_visible()
    await control(imported, "next").click()
    await expect(imported.locator(".av-view")).to_have_attribute("data-step", "1")
    await control(imported, "reset").click()

    await page.locator("#gr0 > summary").click()
    await expect(page.locator('#gr0 .study-note-body[data-loaded="true"]')).to_have_count(1, timeout=60000)
    old = page.locator('#gr0 [data-graph-demo="bfs"][data-graph-ready]')
    await expect(old).to_have_count(1)
    await open_ancestor_disclosures(old)
    await old.locator("select").select_option(label="Fast")
    await control(imported, "play").click()
    await expect(control(imported, "play")).to_have_text("Pause")
    await old.locator('[data-action="play"]').click()
    await expect(old.locator('[data-action="play"]')).to_have_text("Pause")
    await expect(control(imported, "play")).to_have_text("Play")
    await control(imported, "play").click()
    await expect(old.locator('[data-action="play"]')).to_have_text("Play")
    await expect(control(imported, "play")).to_have_text("Pause")
    await page.locator("#gr1 > summary").click()
    await expect(control(imported, "play")).to_have_text("Play")
    paused = await step(imported)
    await page.wait_for_timeout(800)
    require(await step(imported) == paused, "Closing an imported note left its walkthrough running")
    print("Inline/Suite: collapsed defaults, lazy SCC import, close-to-pause, and shared graph playback passed.", flush=True)


async def check_responsive_and_reduced_motion(page, base_url):
    from playwright.async_api import expect

    await page.emulate_media(reduced_motion="reduce")
    await visit(page, base_url, LAB)
    for name in DEMOS:
        await expect(demo(page, name)).to_have_count(1)
    await page.wait_for_timeout(1500)
    require(all([await step(demo(page, name)) == 0 for name in DEMOS]),
            "A reduced-motion walkthrough started playing automatically")
    animated = await page.locator(".algorithm-visual, .algorithm-visual *").evaluate_all("""nodes => nodes
        .filter(node => {
            const style = getComputedStyle(node);
            return style.transitionDuration.split(',').some(value => parseFloat(value) > 0)
                || (style.animationName !== 'none' && style.animationDuration.split(',').some(value => parseFloat(value) > 0));
        }).map(node => node.className).slice(0, 5)""")
    require(not animated, f"Reduced-motion visuals retain animation: {animated}")
    for name in DEMOS:
        preset = demo(page, name).locator("[data-av-preset]")
        if await preset.count():
            options = await preset.locator("option").evaluate_all("items => items.map(item => item.value)")
            if len(options) > 1:
                await preset.select_option(options[-1])
    for width in (320, 390):
        await page.set_viewport_size({"width": width, "height": 844})
        await page.evaluate("document.fonts.ready")
        for name in DEMOS:
            widget = demo(page, name)
            await jump_to_end(page, widget)
            overflow = await page.evaluate("""() => ({
                document: document.documentElement.scrollWidth,
                viewport: window.innerWidth
            })""")
            require(overflow["document"] <= overflow["viewport"] + 1,
                    f"{width}px: page overflows horizontally at {name}'s final step: {overflow}")
            box = await widget.locator(".algorithm-visual").bounding_box()
            require(box and box["x"] >= -1 and box["x"] + box["width"] <= width + 1,
                    f"{width}px: {name} controls do not fit the page: {box}")
            await control(widget, "reset").click()
    print("Presentation: reduced motion and 320/390px layouts passed.", flush=True)


async def check_static_fallback(browser, base_url):
    context = await browser.new_context(java_script_enabled=False)
    try:
        page = await context.new_page()
        await visit(page, base_url, LAB)
        for name in DEMOS:
            widget = page.locator(f'[data-algorithm-visual="{name}"]')
            require(await widget.count() == 1, f"No-JS lab is missing the {name} source section")
            require(len((await widget.text_content()).strip()) >= 25,
                    f"No-JS {name} has no useful fallback text")
        require(await page.locator(".algorithm-visual, [data-av-action]").count() == 0,
                "No-JS fallback unexpectedly depends on mounted controls")
        text = await page.locator("main").inner_text()
        for concept in (r"common subsequence", r"knapsack", r"merge.sort", r"strongly connected", r"linear programming"):
            require(re.search(concept, text, re.I), f"No-JS lab omits {concept}")
    finally:
        await context.close()
    print("No-JS lab: all five subjects retain static fallback text.", flush=True)


async def run(base_url):
    from playwright.async_api import async_playwright, expect

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            executable_path=shutil.which("chromium") or shutil.which("chromium-browser"),
            args=["--no-sandbox"],
        )
        try:
            context = await browser.new_context(viewport={"width": 1365, "height": 1000})
            await context.route("**/*", lambda route: route.continue_()
                                if route.request.url.startswith(base_url) else route.abort())
            page = await context.new_page()
            page.set_default_timeout(15000)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("response", lambda response: errors.append(f"HTTP {response.status}: {response.url}")
                    if response.url.startswith(base_url) and response.status >= 400
                    and response.request.resource_type in {"script", "stylesheet"} else None)
            # Navigating away may cancel the optional reference-link script
            # while it loads; cancellation is different from a missing asset.
            page.on("requestfailed", lambda request: errors.append(f"Failed local asset: {request.url} ({request.failure})")
                    if request.url.startswith(base_url)
                    and request.resource_type in {"script", "stylesheet"}
                    and "ERR_ABORTED" not in (request.failure or "") else None)
            page.on("console", lambda message: errors.append(message.text)
                    if message.type == "warning" and "error:" in message.text else None)

            await visit(page, base_url, LAB)
            await expect(page.locator('[data-algorithm-visual][data-visual-ready="true"]')).to_have_count(len(DEMOS), timeout=30000)
            for name in DEMOS:
                await expect(demo(page, name)).to_have_count(1)
            await page.wait_for_timeout(1500)
            require(all([await step(demo(page, name)) == 0 for name in DEMOS]),
                    "Walkthroughs started playing without user input")
            presets = 0
            for name in DEMOS:
                presets += await check_controls(page, demo(page, name), name)
            require(presets > 0, "No example preset control was exercised")
            await check_exclusive_playback(page, demo(page, "lcs"), demo(page, "knapsack"))
            await check_inline_and_imports(page, base_url)
            await check_responsive_and_reduced_motion(page, base_url)
            await check_static_fallback(browser, base_url)
            require(not errors, "Browser errors:\n" + "\n".join(errors))
            await context.close()
        finally:
            await browser.close()
    print("Algorithm visual checks passed.", flush=True)


def main():
    server = QuietServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        asyncio.run(run(f"http://127.0.0.1:{server.server_port}/"))
        return 0
    except Exception as error:
        print(f"Algorithm visual checks failed: {error}", file=sys.stderr)
        return 1
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


if __name__ == "__main__":
    raise SystemExit(main())
