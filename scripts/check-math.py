#!/usr/bin/env python3
"""Check every HTML page for math rendering errors in a real browser.

Requires Playwright (python -m pip install playwright) and Chromium, or the
Playwright Chromium browser (python -m playwright install chromium).
Run from any directory: python scripts/check-math.py [relative/page.html ...]
"""

import argparse
import asyncio
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import sys
import threading


ROOT = Path(__file__).resolve().parents[1]

DIAGNOSTICS = r"""() => {
    const raw = [];
    const content = document.querySelector('main') || document.body;
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest('.katex, .currency, script, style, svg, math, textarea')) continue;
        if (/\\[A-Za-z]{2,}\b|\\[()[\]]|\$\$|(?<!\\)\$[^$\n]{1,200}\$/.test(node.textContent)) {
            raw.push(node.textContent.trim());
        }
    }
    return {
        count: document.querySelectorAll('.katex').length,
        nested: document.querySelectorAll('.katex .katex').length,
        errors: [...document.querySelectorAll('.katex-error')].map(el => el.title || el.textContent),
        commands: [...document.querySelectorAll('.katex [style]')]
            .filter(el => ['#cc0000', 'rgb(204, 0, 0)'].includes(el.style.color))
            .map(el => el.textContent),
        unrendered: [...document.querySelectorAll('.math')]
            .filter(el => (!el.closest('pre, code') || el.closest('pre.pseudocode')) && !el.querySelector('.katex'))
            .map(el => el.textContent),
        raw
    };
}"""


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class QuietServer(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        if not isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError)):
            super().handle_error(request, client_address)


async def check_normalization(context, base_url):
    page = await context.new_page()
    try:
        await page.goto(base_url + "index.html", wait_until="load")
        await page.wait_for_function("typeof window.renderSiteMath === 'function'")
        result = await page.evaluate(r"""async () => {
            const fixture = document.createElement('div');
            const cases = [
                ['visible set', '{<em>u</em>,<em>v</em>}', '\\{u,v\\}'],
                ['plain set', '{0,1}', '\\{0,1\\}'],
                ['operator', 'max<sub><em>i</em></sub><em>L</em>(<em>i</em>)', '\\max_{i}L(i)'],
                ['nested power', '2<sup>2<sup>2006</sup></sup>', '2^{2^{2006}}'],
                ['nested index', '<em>h</em><sub><em>a</em><sub>1</sub>,<em>a</em><sub>2</sub></sub>', 'h_{a_{1},a_{2}}'],
                ['split logarithm', '<em>n</em><em>l</em><em>o</em><em>g</em><em>n</em>', 'n \\log n'],
                ['authored TeX', '$\\frac{1}{2}\\text{for min and max}\\%$', '\\frac{1}{2}\\text{for min and max}\\%'],
                ['prose', '(second option only if <em>w</em> ≤ <em>b</em>)', '(\\text{ second option only if } w \\le b)']
            ];
            fixture.innerHTML = cases.map((c, i) => '<p><span class="math inline" data-fixture="' + i + '">' + c[1] + '</span></p>').join('') +
                '<pre class="pseudocode">return <span class="math inline">$x_{i+1}$</span></pre>' +
                '<pre class="literal"><code>$x_{i+1}$</code></pre>' +
                '<span class="currency">$1 and $6</span>';
            document.body.append(fixture);
            window.renderSiteMath(fixture);
            // The homepage needs no math, so its vendored assets may load lazily.
            if (typeof window.katex === 'undefined') {
                await new Promise((resolve, reject) => {
                    let tries = 0;
                    const poll = setInterval(() => {
                        if (fixture.querySelector('.katex')) { clearInterval(poll); resolve(); }
                        else if (++tries > 100) { clearInterval(poll); reject(new Error('Math assets did not load')); }
                    }, 50);
                });
            }
            const compact = text => text.replace(/\s+/g, '');
            const problems = cases.flatMap((c, i) => {
                const actual = fixture.querySelector('[data-fixture="' + i + '"] annotation')?.textContent || '';
                return compact(actual) === compact(c[2]) ? [] : [c[0] + ': ' + actual + ' (expected ' + c[2] + ')'];
            });
            if (!fixture.querySelector('pre.pseudocode .katex')) problems.push('Explicit pseudocode math was not rendered');
            if (fixture.querySelector('pre.literal .katex')) problems.push('Literal code was rewritten as math');
            if (fixture.querySelector('.currency .katex')) problems.push('Currency was interpreted as math');
            if (fixture.querySelector('.katex-error')) problems.push('Fixture produced a KaTeX error');
            return problems;
        }""")
        if result:
            print("Shared normalization regressions:", *result, sep="\n  ", flush=True)
            return True
        print("Shared normalization: 8 notation cases plus pseudocode, literal code, and currency passed.")
        return False
    finally:
        await page.close()


async def check_pages(files, base_url):
    from playwright.async_api import async_playwright

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            executable_path=shutil.which("chromium") or shutil.which("chromium-browser"),
            args=["--no-sandbox"],
        )
        context = await browser.new_context()
        # Videos and other external resources are irrelevant to math checks.
        await context.route(
            "**/*", lambda route: route.continue_()
            if route.request.url.startswith(base_url) else route.abort()
        )
        queue = asyncio.Queue()
        for file in files:
            queue.put_nowait(file)
        failures = []
        total_formulas = 0

        async def worker():
            nonlocal total_formulas
            page = await context.new_page()
            while not queue.empty():
                file = queue.get_nowait()
                try:
                    response = await page.goto(base_url + file, wait_until="load", timeout=60000)
                    if not response or not response.ok:
                        raise RuntimeError(f"Page request failed: {response.status if response else 'no response'}")
                    await page.evaluate("document.fonts.ready")
                    # Inspect the normal page load before calling a renderer:
                    # a test must not repair a broken startup path to pass.
                    initial = await page.evaluate(DIAGNOSTICS)
                    # Rendering again must be safe: the original regression parsed
                    # KaTeX's own generated mathnormal/mathml elements as input.
                    before = initial["count"]
                    await page.evaluate("typeof window.renderSiteMath === 'function' && window.renderSiteMath()")
                    result = await page.evaluate(DIAGNOSTICS)
                    total_formulas += result["count"]
                    problems = initial["errors"] + initial["commands"] + initial["unrendered"] + initial["raw"]
                    problems += result["errors"] + result["commands"] + result["unrendered"] + result["raw"]
                    if result["nested"]:
                        problems.append(f'{result["nested"]} nested KaTeX outputs')
                    if before != result["count"]:
                        problems.append(f'Rendering twice changed formula count: {before} -> {result["count"]}')
                    if problems:
                        failures.append((file, problems))
                        print(file, flush=True)
                        for problem in dict.fromkeys(problems):
                            print("  " + " ".join(problem.split())[:240], flush=True)
                except Exception as error:
                    failures.append((file, [str(error)]))
                    print(f"{file}: {error}", flush=True)
                finally:
                    queue.task_done()
            await page.close()

        await asyncio.gather(*(worker() for _ in range(min(4, len(files)))))
        fixture_failed = await check_normalization(context, base_url)
        await browser.close()
        print(f"Checked {len(files)} pages, {total_formulas} formulas; {len(failures)} pages failed.")
        return bool(failures) or fixture_failed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pages", nargs="*", help="Relative HTML paths (default: all site pages)")
    args = parser.parse_args()
    files = args.pages or sorted(
        str(file.relative_to(ROOT)) for file in ROOT.rglob("*.html")
        if "vendor" not in file.relative_to(ROOT).parts
        and file.name not in {"content-index.html", "course-source.html"}
    )
    handler = partial(QuietHandler, directory=str(ROOT))
    server = QuietServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        return asyncio.run(check_pages(files, f"http://127.0.0.1:{server.server_port}/"))
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    raise SystemExit(main())
