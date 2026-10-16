# Site maintenance

This is a static site. Serve the repository with `python3 -m http.server 8000`
and use a browser to check the affected pages. Browser dependencies are vendored.

After editing lessons or adding pages, regenerate discovery exports first, then
the search index:

```sh
python3 scripts/build-discovery.py
python3 scripts/build-search-index.py
python3 -m unittest discover -s tests
node --check site.js
node --check graph-demos.js
node tests/test-graph-demos.cjs
node tests/test-topic-resources.cjs
node --test tests/test-dp-visuals.cjs tests/test-dc-visuals.cjs tests/test-scc-visuals.cjs tests/test-lp-visuals.cjs
```

For a complete math regression check, run `python3 scripts/check-math.py`. This
optional development check needs Python Playwright (`python3 -m pip install
playwright`) and either system Chromium or `python3 -m playwright install
chromium`. It opens every rendered site page, checks for malformed or unrendered
formulas and raw TeX left on the page before invoking any test rendering, and
verifies that rendering twice does not corrupt the output. It also checks set
braces, nested scripts, operator typography, mixed pseudocode/math, and currency.
The two
plain-text importer pages deliberately preserve raw math and are excluded.
With the same browser dependencies installed, `python3 scripts/check-site.py`
checks navigation, search, week labels, an embedded graph, and the static import
sources with JavaScript disabled.

`python3 scripts/check-diagrams.py` checks every Mermaid page and exercises the
Graph Study Suite by opening its notes sequentially and simultaneously. It checks
that earlier diagrams remain intact and that imported math, code highlighting,
anchors, and animations initialize correctly.

`python3 scripts/check-layout.py` checks all reading pages at mobile (390px) and
desktop (1440px) widths. Long equations, tables, code, and diagrams may scroll
inside their own containers; prose and entire cards must remain visible. Pass
`--widths 320 390 768 1440` for additional viewport sizes.

Page math delegates to `site.js` so the same conversion rules apply to standalone
and imported content. Use explicit TeX for complicated expressions. For formulas
inside pseudocode, use `<pre class="pseudocode">` with explicit
`<span class="math inline">` elements. Ordinary code blocks remain literal. Wrap
currency amounts in `<span class="currency">` so dollar signs do not become math
delimiters. Avoid overriding KaTeX's internal script sizes or glyph spacing.

`topic-resources.js` adds compact, initially collapsed “Videos & references”
menus to named study headings, including dynamically imported graph notes.
It uses subject-specific YouTube searches, Wikipedia articles, and local DPV
readings. These links open in a new tab; no third-party content loads until a
reader follows a link. Generic navigation labels and numbered exercises are
excluded; textbook exercise pages get one chapter-level menu. Add new subject
aliases and reading mappings in that file. The module reuses existing menus
when content enhancement runs again.
Run `python3 scripts/check-resources.py` with the same browser dependencies to
check the menus across all reading pages, narrow-screen keyboard interaction,
topic matching, and imported-note behavior.

The interactive walkthroughs in `algorithm-demonstrations.html` are also
embedded in collapsed panels beside the relevant weekly and topic explanations:

| Walkthrough | Main course location | What changes at each step |
| --- | --- | --- |
| LCS | Week 1, two-sequence DP | Cell dependencies, values, traceback, matched characters |
| 0/1 knapsack | Week 1, capacity DP | Include/exclude choices and recovered items |
| Merge sort | Week 2, divide-and-conquer schema | Splits, merge pointers, stable output, work per depth |
| SCC | Week 4 and the graph study notes | Reverse-graph finish order, component discovery, condensation DAG |
| LP geometry | Week 9, feasible regions | Constraint intersections, objective lines, unique versus tied optima |

`site.js` loads `algorithm-visuals.js`, its stylesheet, and the four modules under
`visuals/` only when a `data-algorithm-visual` mount exists. Modules register in
`window.CourseVisuals`; each provides immutable frames and a pure renderer.
Shared controls support playback, previous/next, reset, speed, and direct step
selection. Playback starts paused, stops when its enclosing panel closes, and
pauses other course demos when it starts. Reduced-motion preferences disable
decorative animation. Keep static explanatory fallback text inside every mount
so exports and readers without JavaScript retain the algorithm explanation.

Run `python3 scripts/check-visuals.py` with the browser-check dependencies to
verify controls, presets, inline and imported mounts, mobile layout, and the
static fallbacks. Algorithm tests independently check optimality, feasibility,
stable merging, reachability, and graph condensation.

Other useful future visual candidates: median-of-medians pivot selection,
Bellman–Ford relaxation rounds, independent-set/vertex-cover complements,
Bloom-filter false positives, and PageRank iterations.

`build-discovery.py` defaults to
`https://dariennouri.github.io/cs6515-github-pages/`. For a custom domain or fork,
pass `--base-url https://your-domain.example/course/`. This controls absolute
URLs in the sitemap, manifest, source exports, and content directory. Regenerate
these files before deploying at a different URL. No credentials are needed.

The homepage links to `content-index.html`, which lists every course HTML page,
lecture transcript, and PDF. `sitemap.xml` provides crawler discovery;
`llms.txt` and `content-manifest.json` provide additional machine-readable links.
These aids do not force a third-party tool to follow links or index the site.

For NotebookLM and similar URL importers, use `course-source.html` as the source
URL, or download and upload `course-source.txt`. These contain server-visible
text from all course HTML lessons and existing transcripts, with identical copies
included once, source URLs, and raw text/LaTeX equations. They do not depend on
JavaScript. Import individual lesson URLs if a tool's source limit is smaller
than the combined export. PDF and video contents are not extracted: import PDFs
separately and use the included lecture transcripts for videos.

On a GitHub Pages project site, a project-level `robots.txt` is not the origin's
root robots file. Submit the sitemap URL directly to tools that support it;
configure root robots rules at the origin if you control that site. Deployment
must be public for external import tools to fetch the sources. Local serving
does not publish the changes or validate a NotebookLM import.

Week folder names containing `_EXAM` and old exam-related anchor IDs are retained
as stable URLs. Visible navigation and study plans use weeks and topics; the
legacy URL names do not prescribe a semester's assessment schedule.
