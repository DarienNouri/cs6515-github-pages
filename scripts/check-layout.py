#!/usr/bin/env python3
"""Check responsive course-content layout in Chromium.

Run: python scripts/check-layout.py [relative/page.html ...]
Requires Playwright and Chromium. Long equations, code, tables, and diagrams may
scroll within their own containers; prose and entire cards must remain visible.
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
CHECK = r"""() => {
  const problems = [];
  const roots = document.querySelectorAll('main.content, .all-weeks-content');
  for (const root of roots) {
    const nodes = root.querySelectorAll(
      'p,a,h1,h2,h3,h4,h5,h6,blockquote,figure,img,pre,table,' +
      '.math.display,.katex-display,.algo-card__body,.cram-card,.graph-demo'
    );
    for (const node of nodes) {
      if (node.closest('.katex')) continue;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      let scrollable = false;
      let clipped = false;
      for (let parent = node.parentElement; parent && parent !== root; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if (['auto', 'scroll'].includes(style.overflowX) && parent.scrollWidth > parent.clientWidth + 2) {
          scrollable = true;
          break;
        }
        if (['hidden', 'clip'].includes(style.overflowX)) {
          const bounds = parent.getBoundingClientRect();
          if (rect.left < bounds.left - 2 || rect.right > bounds.right + 2) clipped = true;
        }
      }
      if (!scrollable && (clipped || rect.left < -2 || rect.right > innerWidth + 2)) {
        problems.push({
          kind: clipped ? 'clipped content' : 'outside viewport',
          element: node.className || node.tagName.toLowerCase(),
          text: node.textContent.trim().replace(/\s+/g, ' ').slice(0, 100),
          left: Math.round(rect.left), right: Math.round(rect.right)
        });
      }
    }
  }
  // KaTeX calculates script positioning from its font metrics. Resizing the
  // msubsup wrapper or adding tracking silently changes valid formula layout.
  const math = document.querySelector('.katex');
  if (math && parseFloat(getComputedStyle(math).letterSpacing)) {
    problems.push({kind: 'KaTeX glyph spacing overrides font metrics'});
  }
  const script = document.querySelector('.katex .msupsub');
  if (script && getComputedStyle(script).fontSize !== getComputedStyle(script.parentElement).fontSize) {
    problems.push({kind: 'KaTeX script wrapper resized'});
  }
  return problems.slice(0, 12);
}"""


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class QuietServer(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        if not isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError)):
            super().handle_error(request, client_address)


async def check_pages(files, widths, base_url):
    from playwright.async_api import async_playwright

    failures = []
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            executable_path=shutil.which('chromium') or shutil.which('chromium-browser'),
            args=['--no-sandbox'],
        )
        for width in widths:
            context = await browser.new_context(viewport={'width': width, 'height': 900})
            await context.route('**/*', lambda route: route.continue_()
                                if route.request.url.startswith(base_url) else route.abort())
            queue = asyncio.Queue()
            for file in files:
                queue.put_nowait(file)

            async def worker():
                page = await context.new_page()
                while not queue.empty():
                    file = queue.get_nowait()
                    try:
                        response = await page.goto(base_url + file, wait_until='load', timeout=60000)
                        if response is None or not response.ok:
                            raise RuntimeError(f'Page returned HTTP {response.status if response else "no response"}')
                        await page.evaluate('document.fonts.ready')
                        problems = await page.evaluate(CHECK)
                    except Exception as error:
                        problems = [{'kind': str(error)}]
                    if problems:
                        failures.append((width, file, problems))
                        print(f'{width}px {file}', flush=True)
                        for problem in problems[:4]:
                            print('  ' + str(problem), flush=True)
                    queue.task_done()
                await page.close()

            await asyncio.gather(*(worker() for _ in range(min(4, len(files)))))
            await context.close()
            print(f'Checked {len(files)} pages at {width}px.', flush=True)
        await browser.close()
    print(f'{len(files) * len(widths)} page/viewport checks; {len(failures)} failed.')
    return bool(failures)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pages', nargs='*', help='Relative HTML paths (default: all site pages)')
    parser.add_argument('--widths', nargs='+', type=int, default=[390, 1440])
    args = parser.parse_args()
    files = args.pages or sorted(
        str(file.relative_to(ROOT)) for file in ROOT.rglob('*.html')
        if 'vendor' not in file.relative_to(ROOT).parts
        and file.name not in {'content-index.html', 'course-source.html'}
    )
    server = QuietServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        return asyncio.run(check_pages(files, args.widths, f'http://127.0.0.1:{server.server_port}/'))
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    raise SystemExit(main())
