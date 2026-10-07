(function () {
  "use strict";

  const scriptEl = document.currentScript || document.querySelector('script[src*="site.js"]');
  const rootUrl = new URL(".", scriptEl ? scriptEl.src : window.location.href);
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || "");
  const shortcutLabel = isMac ? "Cmd K" : "Ctrl K";

  const weekPages = [
    ["01_by_week/W01_DP1-DP2/index.html", "Week 1 - Intro & DP"],
    ["01_by_week/W02_DC3-DC1/index.html", "Week 2 - Divide & Conquer"],
    ["01_by_week/W03_DC2/index.html", "Week 3 - Linear-Time Median"],
    ["01_by_week/W04_DP3-GR1-GR2_EXAM1/index.html", "Week 4 - DP3, SCC, 2-SAT"],
    ["01_by_week/W05_GR3/index.html", "Week 5 - MST"],
    ["01_by_week/W06_MF1-MF2/index.html", "Week 6 - Max-Flow Basics"],
    ["01_by_week/W07_MF4_EXAM2/index.html", "Week 7 - Edmonds-Karp"],
    ["01_by_week/W08_NP1-NP2-NP3/index.html", "Week 8 - NP-Completeness"],
    ["01_by_week/W09_LP1-LP2-LP3/index.html", "Week 9 - Linear Programming"],
    ["01_by_week/W10_LP4-NP4-NP5_EXAM3/index.html", "Week 10 - Approx & Undecidability"],
    ["01_by_week/W11_Advanced-FFT-Crypto-Bloom/index.html", "Week 11 - Advanced Topics"]
  ];

  const courseWeeks = [
    { num: 1, id: "W01", path: "01_by_week/W01_DP1-DP2/index.html", title: "Intro & DP Foundations", modules: "DP1, DP2", topics: "Fibonacci, LIS, LCS, Knapsack, Chain Multiply", unit: "Unit 1: Dynamic Programming & Divide-and-Conquer", exam: null },
    { num: 2, id: "W02", path: "01_by_week/W02_DC3-DC1/index.html", title: "Divide & Conquer Foundations", modules: "DC3, DC1", topics: "Master Theorem, Recurrences, Karatsuba Multiply", unit: "Unit 1: Dynamic Programming & Divide-and-Conquer", exam: null },
    { num: 3, id: "W03", path: "01_by_week/W03_DC2/index.html", title: "Linear-Time Selection", modules: "DC2", topics: "QuickSelect, Median of Medians", unit: "Unit 1: Dynamic Programming & Divide-and-Conquer", exam: null },
    { num: 4, id: "W04", path: "01_by_week/W04_DP3-GR1-GR2_EXAM1/index.html", title: "DP on DAGs, SCCs, 2-SAT", modules: "DP3, GR1, GR2", topics: "DAG Shortest Paths, Kosaraju SCC, 2-SAT", unit: "Unit 1: Dynamic Programming & Divide-and-Conquer", exam: "Exam 1" },
    { num: 5, id: "W05", path: "01_by_week/W05_GR3/index.html", title: "Minimum Spanning Trees", modules: "GR3", topics: "Kruskal's, Prim's, Cut Property", unit: "Unit 2: Graph Algorithms & Network Flow", exam: null },
    { num: 6, id: "W06", path: "01_by_week/W06_MF1-MF2/index.html", title: "Max-Flow Foundations", modules: "MF1, MF2", topics: "Ford-Fulkerson, Residual Graphs, Max-Flow/Min-Cut", unit: "Unit 2: Graph Algorithms & Network Flow", exam: null },
    { num: 7, id: "W07", path: "01_by_week/W07_MF4_EXAM2/index.html", title: "Edmonds-Karp & Matching", modules: "MF4", topics: "Edmonds-Karp, Bipartite Matching", unit: "Unit 2: Graph Algorithms & Network Flow", exam: "Exam 2" },
    { num: 8, id: "W08", path: "01_by_week/W08_NP1-NP2-NP3/index.html", title: "NP-Completeness & Reductions", modules: "NP1, NP2, NP3", topics: "P vs NP, 3-SAT, Independent Set, Vertex Cover", unit: "Unit 3: Intractability & Linear Programming", exam: null },
    { num: 9, id: "W09", path: "01_by_week/W09_LP1-LP2-LP3/index.html", title: "Linear Programming & Duality", modules: "LP1, LP2, LP3", topics: "Formulations, Simplex Geometry, Duality", unit: "Unit 3: Intractability & Linear Programming", exam: null },
    { num: 10, id: "W10", path: "01_by_week/W10_LP4-NP4-NP5_EXAM3/index.html", title: "Approximation & Undecidability", modules: "LP4, NP4, NP5", topics: "Max-SAT 7/8, ILP, Halting Problem", unit: "Unit 3: Intractability & Linear Programming", exam: "Exam 3" },
    { num: 11, id: "W11", path: "01_by_week/W11_Advanced-FFT-Crypto-Bloom/index.html", title: "Advanced Topics & Review", modules: "FFT, RA1-3", topics: "Fast Fourier Transform, RSA Crypto, Bloom Filters", unit: "Unit 4: Advanced Topics & Review", exam: null }
  ];

  const topicPages = [
    ["02_by_topic/DP_dynamic-programming/index.html", "Dynamic Programming"],
    ["02_by_topic/DC_divide-and-conquer/index.html", "Divide & Conquer"],
    ["02_by_topic/GR_graphs/index.html", "Graphs"],
    ["02_by_topic/MF_max-flow/index.html", "Max-Flow"],
    ["02_by_topic/NP_np-completeness/index.html", "NP-Completeness"],
    ["02_by_topic/LP_linear-programming/index.html", "Linear Programming"],
    ["02_by_topic/ADV_advanced-topics/index.html", "Advanced Topics"]
  ];

  const startPages = [
    ["00_START_HERE/COURSE_ROADMAP.html", "Course Roadmap"],
    ["00_START_HERE/INDEX.html", "Master Index"],
    ["00_START_HERE/COURSE_MAP.html", "Course Map"],
    ["00_START_HERE/reading-index.html", "Reading Index"]
  ];

  const landingPages = [
    ["index.html", "Home"],
    ["00_START_HERE/COURSE_ROADMAP.html", "Course Roadmap"],
    ["01_by_week/index.html", "All Weeks"],
    ["01_by_week/all-in-one.html", "All Weeks - Stacked"],
    ["02_by_topic/index.html", "All Topics"],
    ["cs6515-algorithm-rules-and-guidelines/index.html", "Rules & Guidance"],
    ["module-week-schedule.html", "Course Schedule"],
    ["textbooks/index.html", "Textbooks"],
    ["notes/index.html", "Notes"],
    ["02_by_topic/GR_graphs/study-notes/index.html", "Graph Study Suite"]
  ];

  const courseHierarchy = [
    {
      id: "hub",
      title: "Foundations & Study Hub",
      badge: "Hub",
      items: [
        { path: "00_START_HERE/COURSE_ROADMAP.html", title: "Course Roadmap & Study Guide", subtitle: "Curriculum roadmap & exam checkpoints" },
        { path: "00_START_HERE/EXAM_CRAM_SHEET.html", title: "🎯 High-Yield Exam Cram Sheets & Black-Box Matrix", subtitle: "Exam 1, 2, 3 synthesized with interactive Active Recall practice", badge: "High Yield" },
        { path: "00_START_HERE/INDEX.html", title: "Master Index", subtitle: "Week ↔ Module ↔ Reading ↔ Guidance ↔ Exam" },
        { path: "00_START_HERE/COURSE_MAP.html", title: "Course Dependency Map", subtitle: "Mental model & prerequisite graph" },
        { path: "module-week-schedule.html", title: "Weekly Module Schedule", subtitle: "Lecture assignments & quiz cadence" },
        { path: "01_by_week/all-in-one.html", title: "All Weeks Stacked", subtitle: "Single continuous review page" },
        { path: "01_by_week/index.html", title: "By Week Chronological View", subtitle: "All weekly directory cards" }
      ]
    },
    {
      id: "unit-1",
      title: "Unit 1: Dynamic Programming & Divide-and-Conquer",
      badge: "Exam 1",
      items: [
        { path: "01_by_week/W01_DP1-DP2/index.html", title: "Week 1 — Intro & Dynamic Programming", modules: "DP1, DP2", subtitle: "Fibonacci, LIS, LCS, Knapsack, Chain Multiply" },
        { path: "01_by_week/W02_DC3-DC1/index.html", title: "Week 2 — Divide & Conquer Foundations", modules: "DC3, DC1", subtitle: "Master Theorem, Recurrences, Karatsuba Multiply" },
        { path: "01_by_week/W03_DC2/index.html", title: "Week 3 — Linear-Time Median & Selection", modules: "DC2", subtitle: "QuickSelect, Median of Medians" },
        { path: "01_by_week/W04_DP3-GR1-GR2_EXAM1/index.html", title: "Week 4 — DP3, SCC, 2-SAT + Exam 1", modules: "DP3, GR1, GR2", subtitle: "Shortest Paths, SCCs, 2-SAT · Exam 1 Window", exam: "Exam 1" }
      ]
    },
    {
      id: "unit-2",
      title: "Unit 2: Graph Algorithms & Network Flow",
      badge: "Exam 2",
      items: [
        { path: "02_by_topic/GR_graphs/study-notes/index.html", title: "⚡ Graph Theory Study Suite (GR0–GR4)", modules: "GR0–GR4", subtitle: "All-in-one interactive guides: DFS/BFS, SCCs, 2-SAT, MST, Markov & Cheat Sheet", badge: "Suite" },
        { path: "01_by_week/W05_GR3/index.html", title: "Week 5 — Minimum Spanning Trees", modules: "GR3", subtitle: "Kruskal's & Prim's, Cut Property" },
        { path: "01_by_week/W06_MF1-MF2/index.html", title: "Week 6 — Max-Flow Basics & Duality", modules: "MF1, MF2", subtitle: "Ford-Fulkerson, Max-Flow = Min-Cut" },
        { path: "01_by_week/W07_MF4_EXAM2/index.html", title: "Week 7 — Edmonds-Karp & Applications + Exam 2", modules: "MF4", subtitle: "Edmonds-Karp, Bipartite Matching · Exam 2 Window", exam: "Exam 2" }
      ]
    },
    {
      id: "unit-3",
      title: "Unit 3: Intractability, LP & Advanced Topics",
      badge: "Exam 3",
      items: [
        { path: "01_by_week/W08_NP1-NP2-NP3/index.html", title: "Week 8 — NP-Completeness Foundations", modules: "NP1, NP2, NP3", subtitle: "Reductions, 3-SAT, Independent Set, Vertex Cover" },
        { path: "01_by_week/W09_LP1-LP2-LP3/index.html", title: "Week 9 — Linear Programming Foundations", modules: "LP1, LP2, LP3", subtitle: "Formulations, Simplex Geometry, Duality" },
        { path: "01_by_week/W10_LP4-NP4-NP5_EXAM3/index.html", title: "Week 10 — Approx, ILP & Undecidability + Exam 3", modules: "LP4, NP4, NP5", subtitle: "Max-SAT Approx, ILP, Halting Problem · Exam 3 Window", exam: "Exam 3" },
        { path: "01_by_week/W11_Advanced-FFT-Crypto-Bloom/index.html", title: "Week 11 — Advanced Topics & Review", modules: "FFT, RA1-3", subtitle: "Fast Fourier Transform, RSA, Bloom Filters" }
      ]
    },
    {
      id: "topics",
      title: "By Topic Branches",
      badge: "Topics",
      items: [
        { path: "02_by_topic/DP_dynamic-programming/index.html", title: "Dynamic Programming (DP)", subtitle: "Bottom-up tables over subproblems (Weeks 1, 4)" },
        { path: "02_by_topic/DC_divide-and-conquer/index.html", title: "Divide & Conquer (DC)", subtitle: "Divide, conquer, combine (Weeks 2, 3, 11)" },
        { path: "02_by_topic/GR_graphs/index.html", title: "Graphs (GR)", subtitle: "SCC, 2-SAT, MST, PageRank (Weeks 4, 5, 11)" },
        { path: "02_by_topic/MF_max-flow/index.html", title: "Max-Flow (MF)", subtitle: "Ford-Fulkerson, Min-Cut, Edmonds-Karp (Weeks 6, 7, 11)" },
        { path: "02_by_topic/NP_np-completeness/index.html", title: "NP-Completeness (NP)", subtitle: "Reductions, NP-Hard problems (Weeks 8, 10)" },
        { path: "02_by_topic/LP_linear-programming/index.html", title: "Linear Programming (LP)", subtitle: "Optimization, Duality, ILP (Weeks 9, 10)" },
        { path: "02_by_topic/ADV_advanced-topics/index.html", title: "Advanced Topics (ADV)", subtitle: "FFT, RSA Crypto, Bloom Filters (Week 11)" }
      ]
    },
    {
      id: "guidelines",
      title: "Rules & Algorithm Guidelines",
      badge: "Staff Rules",
      items: [
        { path: "cs6515-algorithm-rules-and-guidelines/index.html", title: "⭐ Global Algorithm Rules & Guidance Hub", subtitle: "Unified course rules, rubrics, black-boxes & runtimes", badge: "Master Hub" },
        { path: "cs6515-algorithm-rules-and-guidelines/index.html#dynamic-programming", title: "Dynamic Programming Guidance", subtitle: "3-part template, recurrences & rubric" },
        { path: "cs6515-algorithm-rules-and-guidelines/index.html#graph-algorithms", title: "Graph Theory & DP on Graphs", subtitle: "Reduction flow, black boxes, DAG DP & flow" },
        { path: "cs6515-algorithm-rules-and-guidelines/index.html#divide-and-conquer", title: "Divide & Conquer Guidance", subtitle: "Narrative format, Master Theorem & black boxes" },
        { path: "cs6515-algorithm-rules-and-guidelines/index.html#np-completeness", title: "NP-Completeness & Reductions", subtitle: "Reduction direction, proof rubric & catalog" },
        { path: "cs6515-algorithm-rules-and-guidelines/index.html#linear-programming", title: "Linear Programming & Duality", subtitle: "Formulation rules, duality recipe & ILP" },
        { path: "cs6515-algorithm-rules-and-guidelines/index.html#course-standards", title: "Common Course Runtimes & Readiness", subtitle: "Official Big-O catalog & math foundations" },
        { path: "cs6515-algorithm-rules-and-guidelines/8077940_Dynamic_Programming_Guidance.html", title: "DP Detailed Guidance Doc", subtitle: "Full staff grading rubric & examples" },
        { path: "cs6515-algorithm-rules-and-guidelines/8129088_Usable_Black_Boxes_for_Graphs.html", title: "Graph Black Boxes Reference", subtitle: "Exhaustive inputs, arrays & runtimes" }
      ]
    }
  ];

  function isCurrentPage(itemPath, currentPath) {
    if (!itemPath || !currentPath) return false;
    if (itemPath === currentPath) return true;
    const normItem = itemPath.replace(/\/index\.html$/, "").replace(/^\/+/, "");
    const normCurr = currentPath.replace(/\/index\.html$/, "").replace(/^\/+/, "");
    if (normItem === normCurr) return true;
    const itemWeek = itemPath.match(/01_by_week\/(W\d+[^/]+)/);
    const currWeek = currentPath.match(/01_by_week\/(W\d+[^/]+)/);
    if (itemWeek && currWeek && itemWeek[1] === currWeek[1]) {
      return true;
    }
    const itemTopic = itemPath.match(/02_by_topic\/([^/]+)/);
    const currTopic = currentPath.match(/02_by_topic\/([^/]+)/);
    if (itemTopic && currTopic && itemTopic[1] === currTopic[1]) {
      return true;
    }
    return false;
  }

  let searchItems = [];
  let selectedIndex = 0;

  function normalizePath(pathname) {
    const rootPath = rootUrl.pathname;
    let path = decodeURIComponent(pathname);
    if (path.startsWith(rootPath)) {
      path = path.slice(rootPath.length);
    }
    path = path.replace(/^\/+/, "");
    if (!path || path.endsWith("/")) {
      path += "index.html";
    }
    return path;
  }

  function hrefFor(path) {
    return new URL(path, rootUrl).href;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function humanTitle(path) {
    return path
      .replace(/\/index\.html$/, "")
      .replace(/\.html$/, "")
      .split("/")
      .pop()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "Page";
  }

  function setShortcutLabels() {
    document.querySelectorAll("[data-search-shortcut]").forEach(function (node) {
      node.textContent = shortcutLabel;
    });
  }

  function ensureTopbar() {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    let left = topbar.querySelector(".topbar__left");
    if (!left) {
      left = document.createElement("div");
      left.className = "topbar__left";
      const home = topbar.querySelector(".home, .topbar__brand");
      const crumbloc = topbar.querySelector(".crumbloc, .topbar__title");
      if (home) left.appendChild(home);
      if (crumbloc) left.appendChild(crumbloc);
      topbar.insertBefore(left, topbar.firstChild);
    }

    let weeksBtn = left.querySelector("[data-weeks-trigger]");
    if (!weeksBtn) {
      weeksBtn = document.createElement("button");
      weeksBtn.className = "weeks-trigger";
      weeksBtn.type = "button";
      weeksBtn.setAttribute("data-weeks-trigger", "");
      weeksBtn.setAttribute("aria-expanded", "false");
      weeksBtn.setAttribute("aria-label", "Browse course weeks");
      weeksBtn.innerHTML = [
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
        '  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>',
        '  <line x1="16" y1="2" x2="16" y2="6"></line>',
        '  <line x1="8" y1="2" x2="8" y2="6"></line>',
        '  <line x1="3" y1="10" x2="21" y2="10"></line>',
        '</svg>',
        '<span class="weeks-trigger__label">Weeks</span>',
        '<span class="weeks-trigger__caret">▾</span>'
      ].join("");

      const homeEl = left.querySelector(".home, .topbar__brand");
      if (homeEl && homeEl.nextSibling) {
        left.insertBefore(weeksBtn, homeEl.nextSibling);
      } else {
        left.appendChild(weeksBtn);
      }

      const sep = document.createElement("span");
      sep.className = "topbar__sep";
      sep.textContent = "/";
      left.insertBefore(sep, weeksBtn.nextSibling);
    }

    let actions = topbar.querySelector(".topbar__actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "topbar__actions";
      topbar.appendChild(actions);
    }

    let treeBtn = topbar.querySelector("[data-tree-trigger]");
    if (!treeBtn) {
      treeBtn = document.createElement("button");
      treeBtn.className = "tree-trigger";
      treeBtn.type = "button";
      treeBtn.setAttribute("data-tree-trigger", "");
      treeBtn.setAttribute("aria-expanded", "false");
      treeBtn.setAttribute("aria-label", "Course hierarchy navigation");
      treeBtn.innerHTML = [
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
        '  <circle cx="18" cy="5" r="3"></circle>',
        '  <circle cx="6" cy="12" r="3"></circle>',
        '  <circle cx="18" cy="19" r="3"></circle>',
        '  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>',
        '  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>',
        '</svg>',
        '<span class="tree-trigger__label">Course Map</span>',
        '<span class="tree-trigger__caret">▾</span>'
      ].join("");
      actions.insertBefore(treeBtn, actions.firstChild);
    } else if (actions.firstChild !== treeBtn) {
      actions.insertBefore(treeBtn, actions.firstChild);
    }

    let practiceBtn = topbar.querySelector("[data-practice-trigger]");
    if (!practiceBtn) {
      practiceBtn = document.createElement("button");
      practiceBtn.className = "practice-trigger";
      practiceBtn.type = "button";
      practiceBtn.setAttribute("data-practice-trigger", "");
      practiceBtn.setAttribute("aria-pressed", "false");
      practiceBtn.setAttribute("aria-label", "Toggle Active Recall Practice Mode");
      practiceBtn.setAttribute("title", "Toggle Active Recall Practice Mode (Hotkey: Q)");
      practiceBtn.innerHTML = [
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
        '  <circle cx="12" cy="12" r="10"></circle>',
        '  <circle cx="12" cy="12" r="6"></circle>',
        '  <circle cx="12" cy="12" r="2"></circle>',
        '</svg>',
        '<span class="practice-trigger__label">Practice</span>',
        '<kbd class="practice-trigger__kbd">Q</kbd>'
      ].join("");
      actions.appendChild(practiceBtn);
    }

    let searchBtn = topbar.querySelector("[data-search-trigger]");
    if (!searchBtn) {
      searchBtn = document.createElement("button");
      searchBtn.className = "search-trigger";
      searchBtn.type = "button";
      searchBtn.setAttribute("data-search-trigger", "");
      searchBtn.setAttribute("aria-label", "Search site");
      searchBtn.setAttribute("title", "Search course notes (Hotkey: ⌘K / Ctrl+K)");
      searchBtn.innerHTML = [
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
        '  <circle cx="11" cy="11" r="8"></circle>',
        '  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
        '</svg>',
        '<span class="search-trigger__label">Search</span>',
        '<kbd data-search-shortcut></kbd>'
      ].join("");
      actions.appendChild(searchBtn);
    } else {
      if (!searchBtn.querySelector("svg")) {
        const svgStr = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
        searchBtn.insertAdjacentHTML("afterbegin", svgStr);
      }
      searchBtn.setAttribute("title", "Search course notes (Hotkey: ⌘K / Ctrl+K)");
      if (searchBtn.parentElement !== actions) {
        actions.appendChild(searchBtn);
      }
    }

    if (practiceBtn && searchBtn && practiceBtn.nextElementSibling !== searchBtn) {
      actions.insertBefore(practiceBtn, searchBtn);
    }

    setShortcutLabels();
  }

  function buildSearchDialog() {
    if (document.querySelector("[data-search-dialog]")) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "search-overlay";
    overlay.hidden = true;
    overlay.setAttribute("data-search-dialog", "");
    overlay.innerHTML = [
      '<div class="search-panel" role="dialog" aria-modal="true" aria-label="Search">',
      '  <div class="search-box">',
      '    <input data-search-input type="search" autocomplete="off" spellcheck="false" placeholder="Search CS6515">',
      '    <kbd data-search-shortcut></kbd>',
      '  </div>',
      '  <div class="search-results" data-search-results role="listbox"></div>',
      '</div>'
    ].join("");
    document.body.appendChild(overlay);
    setShortcutLabels();

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeSearch();
      }
    });
  }

  function openSearch() {
    buildSearchDialog();
    const overlay = document.querySelector("[data-search-dialog]");
    const input = document.querySelector("[data-search-input]");
    if (!overlay || !input) {
      return;
    }
    overlay.hidden = false;
    document.documentElement.classList.add("search-open");
    input.focus();
    input.select();
    renderResults(input.value);
  }

  function closeSearch() {
    const overlay = document.querySelector("[data-search-dialog]");
    if (!overlay) {
      return;
    }
    overlay.hidden = true;
    document.documentElement.classList.remove("search-open");
  }

  function buildWeeksDropdown() {
    if (document.querySelector("[data-weeks-dropdown]")) {
      return document.querySelector("[data-weeks-dropdown]");
    }

    const currentPath = normalizePath(window.location.pathname);
    const dropdown = document.createElement("div");
    dropdown.className = "weeks-dropdown";
    dropdown.hidden = true;
    dropdown.setAttribute("data-weeks-dropdown", "");

    const units = [
      { name: "Unit 1: Dynamic Programming & Divide-and-Conquer", exam: "Exam 1", weeks: [1, 2, 3, 4] },
      { name: "Unit 2: Graph Algorithms & Network Flow", exam: "Exam 2", weeks: [5, 6, 7] },
      { name: "Unit 3: Intractability & Linear Programming", exam: "Exam 3", weeks: [8, 9, 10] },
      { name: "Unit 4: Advanced Topics & Review", exam: "Final Prep", weeks: [11] }
    ];

    const unitsHtml = units.map(function (u) {
      const weeksInUnit = courseWeeks.filter(function (w) { return u.weeks.indexOf(w.num) !== -1; });
      const itemsHtml = weeksInUnit.map(function (w) {
        const isCurrent = isCurrentPage(w.path, currentPath);
        const examBadge = w.exam ? '<span class="weeks-item__exam">' + escapeHtml(w.exam) + '</span>' : '';
        const currentPill = isCurrent ? '<span class="weeks-item__current-badge">HERE</span>' : '';

        return [
          '<a class="weeks-dropdown__item' + (isCurrent ? ' is-current' : '') + '" href="' + escapeHtml(hrefFor(w.path)) + '"' + (isCurrent ? ' aria-current="page"' : '') + '>',
          '  <span class="weeks-item__num">' + escapeHtml(w.id) + '</span>',
          '  <div class="weeks-item__content">',
          '    <div class="weeks-item__title">Week ' + w.num + ' · ' + escapeHtml(w.title) + '</div>',
          '    <div class="weeks-item__meta">' + escapeHtml(w.modules) + ' — ' + escapeHtml(w.topics) + '</div>',
          '  </div>',
          '  ' + examBadge,
          '  ' + currentPill,
          '</a>'
        ].join("");
      }).join("\n");

      return [
        '<div class="weeks-dropdown__unit">',
        '  <div class="weeks-dropdown__unit-title">',
        '    <span>' + escapeHtml(u.name.split(":")[0]) + '</span>',
        '    <span class="weeks-dropdown__unit-exam">' + escapeHtml(u.exam) + '</span>',
        '  </div>',
        itemsHtml,
        '</div>'
      ].join("");
    }).join("\n");

    dropdown.innerHTML = [
      '<div class="weeks-dropdown__header">',
      '  <span class="weeks-dropdown__title">Course Curriculum (11 Weeks)</span>',
      '  <a class="weeks-dropdown__link" href="' + escapeHtml(hrefFor('01_by_week/all-in-one.html')) + '">All Weeks Stacked ↗</a>',
      '</div>',
      unitsHtml,
      '<div class="weeks-dropdown__footer">',
      '  <a href="' + escapeHtml(hrefFor('01_by_week/index.html')) + '">',
      '    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
      '    <span>Chronological View</span>',
      '  </a>',
      '  <a href="' + escapeHtml(hrefFor('module-week-schedule.html')) + '">',
      '    <span>Term Schedule ↗</span>',
      '  </a>',
      '</div>'
    ].join("");

    document.body.appendChild(dropdown);
    return dropdown;
  }

  function openWeeksDropdown() {
    const dropdown = buildWeeksDropdown();
    const trigger = document.querySelector("[data-weeks-trigger]");
    if (!dropdown || !trigger) return;

    closeTreeDropdown();
    closeSearch();

    const rect = trigger.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + 6) + "px";
    dropdown.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - 450)) + "px";

    dropdown.hidden = false;
    trigger.setAttribute("aria-expanded", "true");

    const currentItem = dropdown.querySelector(".weeks-dropdown__item.is-current");
    if (currentItem) {
      setTimeout(function () {
        currentItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }, 50);
    }
  }

  function closeWeeksDropdown() {
    const dropdown = document.querySelector("[data-weeks-dropdown]");
    const trigger = document.querySelector("[data-weeks-trigger]");
    if (!dropdown) return;
    dropdown.hidden = true;
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function toggleWeeksDropdown() {
    const dropdown = document.querySelector("[data-weeks-dropdown]");
    if (dropdown && !dropdown.hidden) {
      closeWeeksDropdown();
    } else {
      openWeeksDropdown();
    }
  }

  function buildTreeDropdown() {
    if (document.querySelector("[data-tree-overlay]")) {
      return;
    }

    const currentPath = normalizePath(window.location.pathname);
    let currentPageTitle = "";

    courseHierarchy.forEach(function (group) {
      group.items.forEach(function (item) {
        if (isCurrentPage(item.path, currentPath)) {
          currentPageTitle = item.title;
        }
      });
    });

    const overlay = document.createElement("div");
    overlay.className = "tree-overlay";
    overlay.hidden = true;
    overlay.setAttribute("data-tree-overlay", "");

    const groupsHtml = courseHierarchy.map(function (group) {
      const itemsHtml = group.items.map(function (item) {
        const isCurrent = isCurrentPage(item.path, currentPath);
        const moduleBadge = item.modules ? '<span class="tree-node__module">' + escapeHtml(item.modules) + '</span>' : '';
        const examBadge = item.exam ? '<span class="tree-node__exam">' + escapeHtml(item.exam) + '</span>' : '';
        const currentPill = isCurrent ? '<span class="tree-node__current-badge">YOU ARE HERE</span>' : '';
        const descHtml = item.subtitle ? '<span class="tree-node__desc">' + escapeHtml(item.subtitle) + '</span>' : '';

        return [
          '<a class="tree-node' + (isCurrent ? ' is-current' : '') + '" href="' + escapeHtml(hrefFor(item.path)) + '"' + (isCurrent ? ' aria-current="page"' : '') + ' data-tree-node data-title="' + escapeHtml((item.title + ' ' + (item.modules || '') + ' ' + (item.subtitle || '')).toLowerCase()) + '">',
          '  <span class="tree-node__dot"></span>',
          '  <div class="tree-node__content">',
          '    <div class="tree-node__row">',
          '      <span class="tree-node__title">' + escapeHtml(item.title) + '</span>',
          '      ' + moduleBadge,
          '      ' + examBadge,
          '    </div>',
          '    ' + descHtml,
          '  </div>',
          '  ' + currentPill,
          '</a>'
        ].join("");
      }).join("\n");

      return [
        '<div class="tree-group" data-tree-group>',
        '  <div class="tree-group__header">',
        '    <span class="tree-group__title">' + escapeHtml(group.title) + '</span>',
        '    <span class="tree-group__badge">' + escapeHtml(group.badge) + '</span>',
        '  </div>',
        '  <div class="tree-branch">',
        itemsHtml,
        '  </div>',
        '</div>'
      ].join("");
    }).join("\n");

    const currentBannerHtml = currentPageTitle ? [
      '<div class="tree-location-bar">',
      '  <span class="tree-location-dot"></span>',
      '  <span class="tree-location-label">Current Page:</span>',
      '  <span class="tree-location-title">' + escapeHtml(currentPageTitle) + '</span>',
      '</div>'
    ].join("") : '';

    overlay.innerHTML = [
      '<div class="tree-panel" role="dialog" aria-modal="true" aria-label="Course Hierarchy and Map">',
      '  <div class="tree-header">',
      '    <div class="tree-header__title">',
      '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
      '        <circle cx="18" cy="5" r="3"></circle>',
      '        <circle cx="6" cy="12" r="3"></circle>',
      '        <circle cx="18" cy="19" r="3"></circle>',
      '        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>',
      '        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>',
      '      </svg>',
      '      <span>Course Hierarchy &amp; Navigation</span>',
      '    </div>',
      '    <div class="tree-header__actions">',
      '      <input class="tree-filter-input" type="search" placeholder="Filter pages, topics, modules..." data-tree-filter autocomplete="off" spellcheck="false">',
      '      <button class="tree-close-btn" type="button" data-tree-close aria-label="Close navigation tree">✕</button>',
      '    </div>',
      '  </div>',
      '  ' + currentBannerHtml,
      '  <div class="tree-body" data-tree-body>',
      groupsHtml,
      '  </div>',
      '</div>'
    ].join("");

    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeTreeDropdown();
      }
    });

    const closeBtn = overlay.querySelector("[data-tree-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeTreeDropdown);
    }

    const filterInput = overlay.querySelector("[data-tree-filter]");
    if (filterInput) {
      filterInput.addEventListener("input", function (e) {
        filterTreeNodes(e.target.value);
      });
    }
  }

  function filterTreeNodes(query) {
    const q = query.toLowerCase().trim();
    const groups = document.querySelectorAll("[data-tree-group]");
    groups.forEach(function (group) {
      const nodes = Array.from(group.querySelectorAll("[data-tree-node]"));
      let anyVisible = false;
      nodes.forEach(function (node) {
        const text = node.getAttribute("data-title") || "";
        const matches = !q || text.includes(q);
        node.style.display = matches ? "flex" : "none";
        if (matches) anyVisible = true;
      });
      group.style.display = anyVisible ? "flex" : "none";
    });
  }

  function openTreeDropdown() {
    buildTreeDropdown();
    const overlay = document.querySelector("[data-tree-overlay]");
    const trigger = document.querySelector("[data-tree-trigger]");
    if (!overlay) return;
    overlay.hidden = false;
    document.documentElement.classList.add("tree-open");
    if (trigger) trigger.setAttribute("aria-expanded", "true");

    const filterInput = overlay.querySelector("[data-tree-filter]");
    if (filterInput) {
      filterInput.value = "";
      filterTreeNodes("");
      filterInput.focus();
    }

    const currentNode = overlay.querySelector(".tree-node.is-current");
    if (currentNode) {
      setTimeout(function () {
        currentNode.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 60);
    }
  }

  function closeTreeDropdown() {
    const overlay = document.querySelector("[data-tree-overlay]");
    const trigger = document.querySelector("[data-tree-trigger]");
    if (!overlay) return;
    overlay.hidden = true;
    document.documentElement.classList.remove("tree-open");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function toggleTreeDropdown() {
    const overlay = document.querySelector("[data-tree-overlay]");
    if (overlay && !overlay.hidden) {
      closeTreeDropdown();
    } else {
      openTreeDropdown();
    }
  }

  function termsFor(query) {
    return query
      .toLowerCase()
      .split(/\s+/)
      .map(function (term) { return term.trim(); })
      .filter(Boolean);
  }

  function scoreItem(item, terms, phrase) {
    const title = item.titleLower || "";
    const path = item.pathLower || "";
    const text = item.textLower || "";
    let score = 0;

    if (phrase && title.includes(phrase)) {
      score += 220;
    }
    if (phrase && text.includes(phrase)) {
      score += 60;
    }

    for (const term of terms) {
      if (title.includes(term)) {
        score += title.startsWith(term) ? 140 : 90;
      }
      if (path.includes(term)) {
        score += 45;
      }
      if (text.includes(term)) {
        score += 14;
      }
    }

    return score;
  }

  function excerptFor(item, terms) {
    const text = item.text || "";
    if (!text) {
      return item.path;
    }

    const lower = item.textLower || "";
    let index = -1;
    for (const term of terms) {
      index = lower.indexOf(term);
      if (index !== -1) {
        break;
      }
    }

    if (index === -1) {
      return text.slice(0, 180);
    }

    const start = Math.max(0, index - 80);
    const end = Math.min(text.length, index + 180);
    return (start > 0 ? "... " : "") + text.slice(start, end) + (end < text.length ? " ..." : "");
  }

  function renderResults(query) {
    const output = document.querySelector("[data-search-results]");
    if (!output) {
      return;
    }

    const terms = termsFor(query);
    selectedIndex = 0;

    if (!terms.length) {
      const quickLinks = landingPages.concat(weekPages.slice(4, 7), topicPages);
      output.innerHTML = quickLinks.map(function ([path, title], index) {
        return resultMarkup({ path: path, title: title, text: "Quick link" }, index, "Quick link");
      }).join("");
      return;
    }

    const phrase = terms.join(" ");
    const results = searchItems
      .map(function (item) {
        return { item: item, score: scoreItem(item, terms, phrase) };
      })
      .filter(function (entry) { return entry.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 12);

    if (!results.length) {
      output.innerHTML = '<div class="search-empty">No matches</div>';
      return;
    }

    output.innerHTML = results.map(function (entry, index) {
      return resultMarkup(entry.item, index, excerptFor(entry.item, terms));
    }).join("");
  }

  function resultMarkup(item, index, excerpt) {
    return [
      '<a class="search-result" role="option" aria-selected="',
      index === selectedIndex ? "true" : "false",
      '" href="',
      escapeHtml(hrefFor(item.path)),
      '" data-search-result>',
      '<span class="search-result__title">',
      escapeHtml(item.title || humanTitle(item.path)),
      '</span>',
      '<span class="search-result__path">',
      escapeHtml(item.path),
      '</span>',
      '<span class="search-result__excerpt">',
      escapeHtml(excerpt),
      '</span>',
      '</a>'
    ].join("");
  }

  function updateSelection(delta) {
    const results = Array.from(document.querySelectorAll("[data-search-result]"));
    if (!results.length) {
      return;
    }
    selectedIndex = (selectedIndex + delta + results.length) % results.length;
    results.forEach(function (result, index) {
      result.setAttribute("aria-selected", index === selectedIndex ? "true" : "false");
    });
    results[selectedIndex].scrollIntoView({ block: "nearest" });
  }

  function activateSelectedResult() {
    const results = Array.from(document.querySelectorAll("[data-search-result]"));
    if (results[selectedIndex]) {
      results[selectedIndex].click();
    }
  }

  function navItemsFromSearchIndex() {
    return searchItems
      .filter(function (item) { return item.path.endsWith(".html"); })
      .map(function (item) { return [item.path, item.title || humanTitle(item.path)]; });
  }

  function navGroupFor(path) {
    if (path === "index.html") {
      return { items: landingPages, home: null, context: "Home" };
    }
    if (weekPages.some(function (item) { return item[0] === path; })) {
      return { items: weekPages, home: ["01_by_week/index.html", "All Weeks"], context: "Week" };
    }
    if (topicPages.some(function (item) { return item[0] === path; })) {
      return { items: topicPages, home: ["02_by_topic/index.html", "All Topics"], context: "Topic" };
    }
    if (startPages.some(function (item) { return item[0] === path; })) {
      return { items: startPages, home: ["00_START_HERE/INDEX.html", "Start Here"], context: "Start" };
    }
    return { items: navItemsFromSearchIndex(), home: ["index.html", "Home"], context: "Course" };
  }

  function injectNavigation() {
    const content = document.querySelector("main.content");
    if (!content) return;

    const path = normalizePath(window.location.pathname);
    const group = navGroupFor(path);
    const currentIndex = group.items.findIndex(function (item) { return item[0] === path; });

    const previous = currentIndex > 0 ? group.items[currentIndex - 1] : null;
    const next = currentIndex >= 0 && currentIndex < group.items.length - 1 ? group.items[currentIndex + 1] : null;
    const parent = group.home || ["index.html", "Home"];

    // 0) In-content Week Quick-Switcher Strip (for week pages, module pages, and study notes)
    if (!content.querySelector("[data-week-strip]")) {
      const isWeekContext = group.context === "Week" ||
                            path.startsWith("01_by_week/") ||
                            path.includes("study-notes") ||
                            courseWeeks.some(function(w) { return isCurrentPage(w.path, path); });
      if (isWeekContext && path !== "01_by_week/all-in-one.html") {
        const strip = document.createElement("nav");
        strip.className = "week-strip";
        strip.setAttribute("data-week-strip", "");
        strip.setAttribute("aria-label", "Course week switcher");

        const pillsHtml = courseWeeks.map(function (w) {
          const isCurrent = isCurrentPage(w.path, path);
          const examTag = w.exam ? '<span class="week-strip__exam-tag">' + (w.num === 4 ? 'E1' : w.num === 7 ? 'E2' : 'E3') + '</span>' : '';
          return [
            '<a class="week-strip__pill' + (isCurrent ? ' is-current' : '') + (w.exam ? ' has-exam' : '') + '" href="' + escapeHtml(hrefFor(w.path)) + '" title="Week ' + w.num + ' — ' + escapeHtml(w.title) + ' (' + escapeHtml(w.modules) + ')' + (w.exam ? ' · ' + w.exam : '') + '">',
            '  <span>' + w.id + '</span>',
            '  ' + examTag,
            '</a>'
          ].join("");
        }).join("\n");

        strip.innerHTML = [
          '<span class="week-strip__label">Weeks</span>',
          '<div class="week-strip__track">',
          pillsHtml,
          '</div>'
        ].join("");

        const firstEl = content.firstElementChild;
        if (firstEl) {
          content.insertBefore(strip, firstEl);
        } else {
          content.appendChild(strip);
        }
      }
    }

    // 1) In-content Top Navigation Bar
    if (!content.querySelector("[data-top-nav]")) {
      // Clean up crappy legacy blockquote link lines (◀ ... All weeks ... ▶)
      const bqs = Array.from(content.querySelectorAll("blockquote"));
      for (const bq of bqs) {
        const text = bq.textContent;
        if (text.includes("All weeks") || text.includes("◀") || text.includes("▶") || text.includes("All Topics")) {
          const firstP = bq.querySelector("p");
          if (firstP && !firstP.querySelector("a") && (firstP.textContent.includes("Module") || firstP.textContent.includes("Topic"))) {
            const sub = document.createElement("p");
            sub.className = "module-subtitle";
            sub.innerHTML = firstP.innerHTML;
            bq.parentNode.insertBefore(sub, bq);
          }
          bq.remove();
          break;
        }
      }

      const topNav = document.createElement("nav");
      topNav.className = "top-nav-bar";
      topNav.setAttribute("data-top-nav", "");
      topNav.setAttribute("aria-label", "Top page navigation");

      let prevBtn = "";
      if (previous) {
        const label = previous[1].split(" - ")[0].trim();
        prevBtn = [
          '<a class="btn btn--prev" href="', escapeHtml(hrefFor(previous[0])), '">',
          '  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
          '  <span>', escapeHtml(label), '</span>',
          '</a>'
        ].join("");
      } else {
        prevBtn = '<span class="btn btn--disabled" aria-disabled="true">← Start</span>';
      }

      let nextBtn = "";
      if (next) {
        const label = next[1].split(" - ")[0].trim();
        nextBtn = [
          '<a class="btn btn--next" href="', escapeHtml(hrefFor(next[0])), '">',
          '  <span>', escapeHtml(label), '</span>',
          '  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
          '</a>'
        ].join("");
      } else {
        nextBtn = '<span class="btn btn--disabled" aria-disabled="true">End →</span>';
      }

      const centerLinks = [];
      if (group.context === "Week") {
        centerLinks.push(["01_by_week/index.html", "All Weeks"]);
        centerLinks.push(["00_START_HERE/COURSE_ROADMAP.html", "Roadmap"]);
        centerLinks.push(["00_START_HERE/INDEX.html", "Master Index"]);
        centerLinks.push(["module-week-schedule.html", "Schedule"]);
      } else if (group.context === "Topic") {
        centerLinks.push(["02_by_topic/index.html", "All Topics"]);
        centerLinks.push(["01_by_week/index.html", "All Weeks"]);
        centerLinks.push(["00_START_HERE/COURSE_ROADMAP.html", "Roadmap"]);
        centerLinks.push(["00_START_HERE/INDEX.html", "Master Index"]);
      } else if (group.context === "Start") {
        centerLinks.push(["00_START_HERE/COURSE_ROADMAP.html", "Roadmap"]);
        centerLinks.push(["00_START_HERE/INDEX.html", "Master Index"]);
        centerLinks.push(["01_by_week/index.html", "All Weeks"]);
        centerLinks.push(["module-week-schedule.html", "Schedule"]);
      } else {
        centerLinks.push(["00_START_HERE/COURSE_ROADMAP.html", "Roadmap"]);
        centerLinks.push(["01_by_week/index.html", "All Weeks"]);
        centerLinks.push(["02_by_topic/index.html", "All Topics"]);
        centerLinks.push(["00_START_HERE/INDEX.html", "Master Index"]);
      }

      const centerHtml = centerLinks.map(function (link) {
        return '<a class="btn" href="' + escapeHtml(hrefFor(link[0])) + '">' + escapeHtml(link[1]) + '</a>';
      }).join("\n        ");

      topNav.innerHTML = [
        '<div class="top-nav-bar__left">', prevBtn, '</div>',
        '<div class="top-nav-bar__center">',
        '  ' + centerHtml,
        '</div>',
        '<div class="top-nav-bar__right">', nextBtn, '</div>'
      ].join("");

      const h1 = content.querySelector("h1");
      const sub = content.querySelector(".module-subtitle");
      if (sub && sub.nextSibling) {
        content.insertBefore(topNav, sub.nextSibling);
      } else if (h1 && h1.nextSibling) {
        content.insertBefore(topNav, h1.nextSibling);
      } else {
        content.insertBefore(topNav, content.firstChild);
      }
    }

    // 2) Bottom Navigation Cards & Quick Actions
    if (!content.querySelector("[data-bottom-nav]")) {
      const bottomNav = document.createElement("nav");
      bottomNav.className = "bottom-nav";
      bottomNav.setAttribute("aria-label", "Page navigation");
      bottomNav.setAttribute("data-bottom-nav", "");

      let prevCard = "";
      if (previous) {
        prevCard = [
          '<a class="bottom-nav__card bottom-nav__card--prev" href="', escapeHtml(hrefFor(previous[0])), '">',
          '  <span class="bottom-nav__meta">',
          '    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
          '    Previous',
          '  </span>',
          '  <span class="bottom-nav__title">', escapeHtml(previous[1]), '</span>',
          '</a>'
        ].join("");
      } else {
        prevCard = [
          '<span class="bottom-nav__card bottom-nav__card--prev bottom-nav__card--disabled">',
          '  <span class="bottom-nav__meta">Start of section</span>',
          '  <span class="bottom-nav__title">First page</span>',
          '</span>'
        ].join("");
      }

      let nextCard = "";
      if (next) {
        nextCard = [
          '<a class="bottom-nav__card bottom-nav__card--next" href="', escapeHtml(hrefFor(next[0])), '">',
          '  <span class="bottom-nav__meta">',
          '    Next',
          '    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
          '  </span>',
          '  <span class="bottom-nav__title">', escapeHtml(next[1]), '</span>',
          '</a>'
        ].join("");
      } else {
        nextCard = [
          '<span class="bottom-nav__card bottom-nav__card--next bottom-nav__card--disabled">',
          '  <span class="bottom-nav__meta">End of section</span>',
          '  <span class="bottom-nav__title">Last page</span>',
          '</span>'
        ].join("");
      }

      bottomNav.innerHTML = prevCard + nextCard;
      content.appendChild(bottomNav);

      const bottomActions = document.createElement("div");
      bottomActions.className = "bottom-actions";
      bottomActions.setAttribute("data-bottom-actions", "");
      bottomActions.innerHTML = [
        '<button class="btn btn--sm btn--pill" type="button" data-scroll-top aria-label="Back to top of page">',
        '  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',
        '  <span>Back to top</span>',
        '</button>',
        '<a class="btn btn--sm btn--pill" href="', escapeHtml(hrefFor("00_START_HERE/COURSE_ROADMAP.html")), '">Course Roadmap</a>',
        '<a class="btn btn--sm btn--pill" href="', escapeHtml(hrefFor("01_by_week/index.html")), '">All Weeks</a>',
        '<a class="btn btn--sm btn--pill" href="', escapeHtml(hrefFor("00_START_HERE/INDEX.html")), '">Master Index</a>',
        '<a class="btn btn--sm btn--pill" href="', escapeHtml(hrefFor("module-week-schedule.html")), '">Schedule</a>'
      ].join("");
      content.appendChild(bottomActions);

      const scrollTopBtn = bottomActions.querySelector("[data-scroll-top]");
      if (scrollTopBtn) {
        scrollTopBtn.addEventListener("click", function () {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
    }
  }

  function setupStickyMeasurements() {
    function updateMeasurements() {
      const topbar = document.querySelector(".topbar");
      if (topbar) {
        const h = topbar.getBoundingClientRect().height;
        if (h > 0) {
          document.documentElement.style.setProperty("--topbar-h", Math.round(h) + "px");
        }
      }
      const toolbar = document.querySelector(".top-nav-bar, .guidance-toolbar");
      if (toolbar) {
        const th = toolbar.getBoundingClientRect().height;
        if (th > 0) {
          document.documentElement.style.setProperty("--toolbar-h", Math.round(th) + "px");
        }
      } else {
        document.documentElement.style.setProperty("--toolbar-h", "0px");
      }
    }

    updateMeasurements();
    window.addEventListener("resize", updateMeasurements, { passive: true });
    window.addEventListener("orientationchange", updateMeasurements, { passive: true });

    const topbar = document.querySelector(".topbar");
    if (topbar && "ResizeObserver" in window) {
      const ro = new ResizeObserver(function () {
        updateMeasurements();
      });
      ro.observe(topbar);
    }

    const toolbar = document.querySelector(".top-nav-bar, .guidance-toolbar");
    if (toolbar && "ResizeObserver" in window) {
      const roToolbar = new ResizeObserver(function () {
        updateMeasurements();
      });
      roToolbar.observe(toolbar);
    }
  }

  function setupStickyToolbar() {
    const topNav = document.querySelector(".top-nav-bar");
    if (!topNav) return;

    let sentinel = document.querySelector("[data-top-nav-sentinel]");
    if (!sentinel) {
      sentinel = document.createElement("div");
      sentinel.setAttribute("data-top-nav-sentinel", "");
      sentinel.style.position = "relative";
      sentinel.style.height = "1px";
      sentinel.style.marginTop = "-1px";
      sentinel.style.pointerEvents = "none";
      sentinel.style.visibility = "hidden";
      topNav.parentNode.insertBefore(sentinel, topNav);
    }

    function checkStuck() {
      const topbar = document.querySelector(".topbar");
      const topbarH = topbar ? topbar.getBoundingClientRect().height : 52;
      const sentinelRect = sentinel.getBoundingClientRect();
      if (sentinelRect.top < topbarH) {
        topNav.classList.add("is-stuck");
      } else {
        topNav.classList.remove("is-stuck");
      }
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          const entry = entries[0];
          const topbar = document.querySelector(".topbar");
          const topbarH = topbar ? topbar.getBoundingClientRect().height : 52;
          if (!entry.isIntersecting && entry.boundingClientRect.top < topbarH) {
            topNav.classList.add("is-stuck");
          } else if (entry.isIntersecting || entry.boundingClientRect.top >= topbarH) {
            topNav.classList.remove("is-stuck");
          }
        },
        { threshold: [0, 1] }
      );
      observer.observe(sentinel);
    }

    let scrollTicking = false;
    window.addEventListener("scroll", function () {
      if (!scrollTicking) {
        window.requestAnimationFrame(function () {
          checkStuck();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    checkStuck();
  }

  function buildSidebarAndScrollspy() {
    const content = document.querySelector("main.content");
    if (!content || document.querySelector("[data-sidebar-toc]")) {
      return;
    }

    const allHeadings = Array.from(content.querySelectorAll("h2, h3"));
    const headings = allHeadings.filter(function (h) {
      if (h.closest(".bottom-nav, .top-nav-bar, .page-toc, .search-panel, [hidden]")) {
        return false;
      }
      if (h.offsetParent === null && window.getComputedStyle(h).display === "none") {
        return false;
      }
      return h.textContent.trim().length > 0;
    });

    if (headings.length < 2) {
      return;
    }

    const seenIds = new Set();
    headings.forEach(function (heading, index) {
      if (!heading.id) {
        let slug = heading.textContent
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        if (!slug || seenIds.has(slug)) {
          slug = (slug || "section") + "-" + (index + 1);
        }
        heading.id = slug;
      }
      seenIds.add(heading.id);
    });

    let shell = document.querySelector(".page-shell");
    if (!shell) {
      shell = document.createElement("div");
      shell.className = "page-shell";
      content.parentNode.insertBefore(shell, content);
      shell.appendChild(content);
    }

    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar-toc";
    sidebar.setAttribute("data-sidebar-toc", "");
    sidebar.setAttribute("aria-label", "Page Table of Contents");

    const header = document.createElement("div");
    header.className = "sidebar-toc__header";
    header.innerHTML = [
      '<span class="sidebar-toc__title">',
      '  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '    <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line>',
      '    <line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>',
      '  </svg>',
      '  On this page',
      '</span>',
      '<button class="sidebar-toc__close" type="button" data-sidebar-close aria-label="Close outline">✕</button>'
    ].join("");
    sidebar.appendChild(header);

    const list = document.createElement("ul");
    list.className = "sidebar-toc__list";

    const tocLinks = [];
    headings.forEach(function (heading) {
      const isH3 = heading.tagName.toLowerCase() === "h3";
      const li = document.createElement("li");
      li.className = "sidebar-toc__item" + (isH3 ? " sidebar-toc__item--h3" : " sidebar-toc__item--h2");

      const a = document.createElement("a");
      a.className = "sidebar-toc__link";
      a.href = "#" + heading.id;
      a.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      li.appendChild(a);
      list.appendChild(li);
      tocLinks.push(a);
    });
    sidebar.appendChild(list);
    shell.appendChild(sidebar);

    let backdrop = document.querySelector("[data-sidebar-backdrop]");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "sidebar-backdrop";
      backdrop.setAttribute("data-sidebar-backdrop", "");
      document.body.appendChild(backdrop);
    }

    const actions = document.querySelector(".topbar__actions");
    let outlineBtn = document.querySelector("[data-toc-drawer-toggle]");
    if (actions && !outlineBtn) {
      outlineBtn = document.createElement("button");
      outlineBtn.className = "btn btn--sm toc-trigger";
      outlineBtn.type = "button";
      outlineBtn.setAttribute("data-toc-drawer-toggle", "");
      outlineBtn.setAttribute("aria-label", "Toggle section outline");
      outlineBtn.setAttribute("aria-expanded", "false");
      outlineBtn.innerHTML = [
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
        '  <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>',
        '</svg>',
        '<span class="toc-trigger__label">Outline</span>'
      ].join("");
      actions.insertBefore(outlineBtn, actions.firstChild);
    }

    const topNavCenter = document.querySelector(".top-nav-bar__center");
    if (topNavCenter && !topNavCenter.querySelector("[data-toc-drawer-toggle]")) {
      const navOutlineBtn = document.createElement("button");
      navOutlineBtn.className = "btn btn--outline-jump";
      navOutlineBtn.type = "button";
      navOutlineBtn.setAttribute("data-toc-drawer-toggle", "");
      navOutlineBtn.setAttribute("aria-label", "Toggle page outline");
      navOutlineBtn.innerHTML = '<span>Outline</span>';
      topNavCenter.insertBefore(navOutlineBtn, topNavCenter.firstChild);
    }

    function openDrawer() {
      sidebar.classList.add("is-open");
      backdrop.classList.add("is-open");
      document.querySelectorAll("[data-toc-drawer-toggle]").forEach(function (btn) {
        btn.setAttribute("aria-expanded", "true");
      });
      document.documentElement.classList.add("sidebar-open");
    }

    function closeDrawer() {
      sidebar.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      document.querySelectorAll("[data-toc-drawer-toggle]").forEach(function (btn) {
        btn.setAttribute("aria-expanded", "false");
      });
      document.documentElement.classList.remove("sidebar-open");
    }

    document.querySelectorAll("[data-toc-drawer-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (sidebar.classList.contains("is-open")) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    });

    const closeBtn = sidebar.querySelector("[data-sidebar-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeDrawer);
    }

    backdrop.addEventListener("click", closeDrawer);

    sidebar.addEventListener("click", function (event) {
      const link = event.target.closest(".sidebar-toc__link");
      if (link && window.innerWidth <= 960) {
        closeDrawer();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960 && sidebar.classList.contains("is-open")) {
        closeDrawer();
      }
    }, { passive: true });

    function updateScrollspy() {
      const scrollPos = window.scrollY + 115;
      let currentId = null;

      for (let i = 0; i < headings.length; i++) {
        const h = headings[i];
        const top = h.getBoundingClientRect().top + window.scrollY;
        if (top <= scrollPos) {
          currentId = h.id;
        } else {
          break;
        }
      }

      if (!currentId && headings.length > 0) {
        currentId = headings[0].id;
      }

      let activeLink = null;
      tocLinks.forEach(function (link) {
        const id = link.getAttribute("href").slice(1);
        if (id === currentId) {
          link.classList.add("is-active");
          activeLink = link;
        } else {
          link.classList.remove("is-active");
        }
      });

      if (activeLink && sidebar.scrollHeight > sidebar.clientHeight) {
        const linkRect = activeLink.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();
        if (linkRect.bottom > sidebarRect.bottom - 40 || linkRect.top < sidebarRect.top + 40) {
          activeLink.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }

    let ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateScrollspy();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    updateScrollspy();
  }

  function bindPageToc() {
    const toc = document.querySelector("[data-page-toc]");
    const trigger = document.querySelector("[data-toc-trigger]");
    if (!toc || !trigger) {
      return;
    }

    const setExpanded = function (expanded) {
      toc.hidden = !expanded;
      trigger.setAttribute("aria-expanded", expanded ? "true" : "false");
    };

    setExpanded(false);
    trigger.addEventListener("click", function () {
      setExpanded(toc.hidden);
    });

    toc.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setExpanded(false);
      }
    });
  }

  function loadSearchIndex() {
    return fetch(new URL("search-index.json", rootUrl), { cache: "force-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Search index unavailable");
        }
        return response.json();
      })
      .then(function (items) {
        searchItems = items.map(function (item) {
          const title = item.title || humanTitle(item.path);
          const text = item.text || "";
          return {
            path: item.path,
            title: title,
            text: text,
            titleLower: title.toLowerCase(),
            pathLower: item.path.toLowerCase(),
            textLower: text.toLowerCase()
          };
        });
        injectNavigation();
        rerenderOpenSearch();
      })
      .catch(function () {
        searchItems = landingPages.map(function ([path, title]) {
          return {
            path: path,
            title: title,
            text: "",
            titleLower: title.toLowerCase(),
            pathLower: path.toLowerCase(),
            textLower: ""
          };
        });
        injectNavigation();
        rerenderOpenSearch();
      });
  }

  function rerenderOpenSearch() {
    const overlay = document.querySelector("[data-search-dialog]");
    const input = document.querySelector("[data-search-input]");
    if (overlay && input && !overlay.hidden) {
      renderResults(input.value);
    }
  }

  function bindEvents() {
    document.addEventListener("click", function (event) {
      const weeksTrigger = event.target.closest("[data-weeks-trigger]");
      if (weeksTrigger) {
        event.preventDefault();
        toggleWeeksDropdown();
        return;
      }

      const weeksDropdown = document.querySelector("[data-weeks-dropdown]");
      if (weeksDropdown && !weeksDropdown.hidden && !event.target.closest("[data-weeks-dropdown]")) {
        closeWeeksDropdown();
      }

      const treeTrigger = event.target.closest("[data-tree-trigger]");
      if (treeTrigger) {
        event.preventDefault();
        toggleTreeDropdown();
        return;
      }

      const trigger = event.target.closest("[data-search-trigger]");
      if (trigger) {
        event.preventDefault();
        openSearch();
        return;
      }
    });

    document.addEventListener("input", function (event) {
      if (event.target.matches("[data-search-input]")) {
        renderResults(event.target.value);
      }
    });

    document.addEventListener("keydown", function (event) {
      const isSearchShortcut = (isMac ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isSearchShortcut) {
        event.preventDefault();
        openSearch();
        return;
      }

      if (event.key === "Escape") {
        closeWeeksDropdown();
        closeTreeDropdown();
        closeSearch();
        const sidebar = document.querySelector("[data-sidebar-toc]");
        const backdrop = document.querySelector("[data-sidebar-backdrop]");
        const outlineBtn = document.querySelector("[data-toc-drawer-toggle]");
        if (sidebar && sidebar.classList.contains("is-open")) {
          sidebar.classList.remove("is-open");
          if (backdrop) backdrop.classList.remove("is-open");
          if (outlineBtn) outlineBtn.setAttribute("aria-expanded", "false");
          document.documentElement.classList.remove("sidebar-open");
        }
        const toc = document.querySelector("[data-page-toc]");
        const trigger = document.querySelector("[data-toc-trigger]");
        if (toc && trigger) {
          toc.hidden = true;
          trigger.setAttribute("aria-expanded", "false");
        }
        return;
      }

      if (document.querySelector("[data-search-dialog]:not([hidden])")) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          updateSelection(1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          updateSelection(-1);
        } else if (event.key === "Enter" && event.target.matches("[data-search-input]")) {
          event.preventDefault();
          activateSelectedResult();
        }
      }
    });
  }

  function initPracticeMode() {
    const STORAGE_KEY = "cs6515_practice_mode";
    let isPractice = false;
    try {
      isPractice = localStorage.getItem(STORAGE_KEY) === "true";
    } catch (e) {}

    function updatePracticeUi(enabled) {
      document.body.classList.toggle("quiz-mode-active", enabled);
      document.documentElement.classList.toggle("quiz-mode-active", enabled);

      const triggers = document.querySelectorAll("[data-practice-trigger]");
      triggers.forEach(function (btn) {
        btn.setAttribute("aria-pressed", enabled ? "true" : "false");
        btn.classList.toggle("is-active", enabled);
      });

      let banner = document.querySelector("[data-practice-banner]");
      if (enabled) {
        if (!banner) {
          banner = document.createElement("div");
          banner.className = "practice-banner";
          banner.setAttribute("data-practice-banner", "");
          banner.innerHTML = [
            '<div class="practice-banner__content">',
            '  <span class="practice-banner__icon">🎯</span>',
            '  <span class="practice-banner__text"><strong>Active Recall Mode:</strong> Key recurrences, solutions, and answers are masked. Click any blurred block to reveal.</span>',
            '</div>',
            '<div class="practice-banner__actions">',
            '  <button type="button" class="practice-banner__btn" data-reveal-all>Reveal All</button>',
            '  <button type="button" class="practice-banner__btn" data-hide-all>Hide All</button>',
            '  <button type="button" class="practice-banner__close" data-close-practice title="Exit Practice Mode (Q)">✕</button>',
            '</div>'
          ].join("");

          const content = document.querySelector(".content, .all-weeks-content, main, article") || document.body;
          content.insertBefore(banner, content.firstChild);

          banner.querySelector("[data-reveal-all]").addEventListener("click", function () {
            document.querySelectorAll(".is-mask-candidate, .math.display, .katex-display, .cram-card__answer").forEach(function (el) {
              el.classList.add("is-revealed");
            });
          });

          banner.querySelector("[data-hide-all]").addEventListener("click", function () {
            document.querySelectorAll(".is-revealed").forEach(function (el) {
              el.classList.remove("is-revealed");
            });
          });

          banner.querySelector("[data-close-practice]").addEventListener("click", function () {
            togglePractice(false);
          });
        }
        setupMaskTargets();
      } else if (banner) {
        banner.remove();
        document.querySelectorAll(".is-revealed").forEach(function (el) {
          el.classList.remove("is-revealed");
        });
      }
    }

    function setupMaskTargets() {
      const selector = ".math.display, .katex-display, .cram-card__answer, .quiz-target";
      const targets = document.querySelectorAll(selector);
      targets.forEach(function (el) {
        el.classList.add("is-mask-candidate");
        if (!el.hasAttribute("data-mask-bound")) {
          el.setAttribute("data-mask-bound", "true");
          el.setAttribute("title", "Click to reveal / hide in Practice Mode");
          el.addEventListener("click", function (evt) {
            if (!document.body.classList.contains("quiz-mode-active")) return;
            const sel = window.getSelection().toString();
            if (sel.length > 0) return;
            el.classList.toggle("is-revealed");
          });
        }
      });
    }

    function togglePractice(forcedState) {
      const nextState = typeof forcedState === "boolean" ? forcedState : !document.body.classList.contains("quiz-mode-active");
      try {
        localStorage.setItem(STORAGE_KEY, nextState ? "true" : "false");
      } catch (e) {}
      updatePracticeUi(nextState);
    }

    document.addEventListener("click", function (e) {
      const trigger = e.target.closest("[data-practice-trigger]");
      if (trigger) {
        e.preventDefault();
        togglePractice();
      }
    });

    window.addEventListener("keydown", function (e) {
      if (e.defaultPrevented) return;
      if (e.key === "q" || e.key === "Q") {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
        if (tag === "input" || tag === "textarea" || (document.activeElement && document.activeElement.isContentEditable)) {
          return;
        }
        e.preventDefault();
        togglePractice();
      }
    });

    if (isPractice) {
      updatePracticeUi(true);
      setTimeout(setupMaskTargets, 400);
      setTimeout(setupMaskTargets, 1500);
    }
  }

  function enhanceStudyContent() {
    const content = document.querySelector(".content, .all-weeks-content");
    if (!content) return;

    // 1. Semantic Callouts: Tip, Intuition, Lemma, Claim, Reference, Warning
    content.querySelectorAll("blockquote").forEach(function (bq) {
      if (bq.classList.contains("callout--styled")) return;
      const text = bq.textContent.trim();
      if (text.includes("🎯") || text.includes("Exam Tip") || text.includes("Tip:")) {
        bq.classList.add("callout--tip", "callout--styled");
      } else if (text.includes("💡") || text.includes("Intuition")) {
        bq.classList.add("callout--intuition", "callout--styled");
      } else if (text.includes("📚") || text.includes("Reference:")) {
        bq.classList.add("callout--ref", "callout--styled");
      } else if (/^Lemma[:\s]/i.test(text) || text.includes("Lemma:")) {
        bq.classList.add("callout--lemma", "callout--styled");
      } else if (/^Claim[:\s]/i.test(text) || text.includes("Claim:")) {
        bq.classList.add("callout--claim", "callout--styled");
      } else if (/^Warning[:\s]/i.test(text) || text.includes("⚠️")) {
        bq.classList.add("callout--warning", "callout--styled");
      }
    });

    // 2. Multi-level List Hierarchy Tagging
    content.querySelectorAll("ul, ol").forEach(function (list) {
      if (list.closest(".algo-card__meta, .search-dialog, .sidebar-toc, .tree-dropdown, .top-nav-bar")) return;
      let depth = 1;
      let parent = list.parentElement;
      while (parent && parent !== content) {
        if (parent.tagName === "UL" || parent.tagName === "OL") {
          depth++;
        }
        parent = parent.parentElement;
      }
      list.setAttribute("data-depth", String(depth));
      list.classList.add("list-depth-" + Math.min(depth, 3));
      if (depth > 1) {
        list.classList.add("list-nested");
      }
    });

    // 3. Elevate Standalone List Label Items (e.g. <li><p>Output:</p></li> or <li>Input:</li>)
    content.querySelectorAll("li").forEach(function (li) {
      if (li.closest(".algo-card, .search-dialog, .sidebar-toc, .tree-dropdown")) return;
      const firstChild = li.firstElementChild;
      const targetEl = (firstChild && firstChild.tagName === "P") ? firstChild : li;
      if (!targetEl || !targetEl.childNodes || targetEl.childNodes.length === 0) return;
      const firstNode = targetEl.childNodes[0];
      if (firstNode.nodeType !== Node.TEXT_NODE) return;
      const txt = firstNode.textContent.trim();
      
      const labelMap = {
        "Input:": { cls: "spec-tag--input", text: "INPUT" },
        "Output:": { cls: "spec-tag--output", text: "OUTPUT" },
        "Runtime:": { cls: "spec-tag--runtime", text: "RUNTIME" },
        "Internal:": { cls: "spec-tag--internal", text: "INTERNAL" },
        "Implementation details:": { cls: "spec-tag--ref", text: "IMPLEMENTATION" },
        "Common uses:": { cls: "spec-tag--uses", text: "COMMON USES" },
        "Common modifications:": { cls: "spec-tag--mods", text: "MODIFICATIONS" },
        "Reference implementation:": { cls: "spec-tag--ref", text: "REFERENCE" }
      };

      for (let key in labelMap) {
        if (txt === key || txt.startsWith(key)) {
          li.classList.add("spec-item");
          const tagSpan = document.createElement("span");
          tagSpan.className = "spec-tag " + labelMap[key].cls;
          tagSpan.textContent = labelMap[key].text;
          
          firstNode.textContent = txt.slice(key.length).trim();
          targetEl.insertBefore(tagSpan, firstNode);
          break;
        }
      }
    });

    // 4. Algorithm Black Box Auto-Card Conversion
    const paras = Array.from(content.querySelectorAll("p"));
    paras.forEach(function (p) {
      if (p.closest(".algo-card")) return;
      const strong = p.querySelector("strong");
      if (!strong) return;
      
      const pText = p.textContent;
      const strongText = strong.textContent.trim();
      const isAlgo = (pText.includes("Input:") || pText.includes("see also") || pText.includes("see also:")) &&
                     strongText.length > 1 &&
                     strongText !== "Comment" &&
                     strongText !== "Note:" &&
                     strongText !== "Output:" &&
                     strongText !== "Runtime:";

      if (!isAlgo) return;

      const algoName = strongText;
      const wikiLink = p.querySelector("a");
      const wikiHref = wikiLink ? wikiLink.getAttribute("href") : "";

      // Collect sibling elements belonging to this algorithm
      const groupElements = [];
      let sibling = p.nextElementSibling;
      while (sibling) {
        if (sibling.tagName === "H1" || sibling.tagName === "H2" || sibling.tagName === "HR") break;
        if (sibling.tagName === "P" && sibling.querySelector("strong")) {
          const sText = sibling.textContent;
          const sStrong = sibling.querySelector("strong").textContent.trim();
          if ((sText.includes("Input:") || sText.includes("see also")) && sStrong !== "Comment" && sStrong !== "Note:") {
            break;
          }
        }
        groupElements.push(sibling);
        sibling = sibling.nextElementSibling;
      }

      if (groupElements.length === 0) return;

      // Extract runtime
      let runtimeStr = "";
      const fullText = groupElements.map(function(el) { return el.textContent; }).join(" ");
      const runtimeMatch = fullText.match(/Runtime:[\s\S]*?(?:<code>)?(O\([^)]+\))(?:<\/code>)?/i);
      if (runtimeMatch) {
        runtimeStr = runtimeMatch[1].trim();
      }

      // Build .algo-card
      const card = document.createElement("article");
      card.className = "algo-card";
      const slugId = "algo-" + algoName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      card.setAttribute("id", slugId);

      // Card Header
      const header = document.createElement("div");
      header.className = "algo-card__header";

      const titleGroup = document.createElement("div");
      titleGroup.className = "algo-card__title-group";
      
      const tag = document.createElement("span");
      tag.className = "algo-card__tag";
      tag.textContent = "Black Box Algorithm";
      titleGroup.appendChild(tag);

      const title = document.createElement("h3");
      title.className = "algo-card__title";
      title.textContent = algoName;
      titleGroup.appendChild(title);

      header.appendChild(titleGroup);

      const meta = document.createElement("div");
      meta.className = "algo-card__meta";

      if (runtimeStr) {
        const runtimeBadge = document.createElement("span");
        runtimeBadge.className = "badge badge--runtime";
        runtimeBadge.innerHTML = '<span class="badge__label">Runtime</span> <code>' + runtimeStr + '</code>';
        meta.appendChild(runtimeBadge);
      }

      if (wikiHref) {
        const linkBadge = document.createElement("a");
        linkBadge.className = "badge badge--link";
        linkBadge.href = wikiHref;
        linkBadge.target = "_blank";
        linkBadge.rel = "noopener noreferrer";
        linkBadge.innerHTML = '<span>Wikipedia</span> <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg>';
        meta.appendChild(linkBadge);
      }

      header.appendChild(meta);
      card.appendChild(header);

      // Card Body
      const body = document.createElement("div");
      body.className = "algo-card__body";

      // If the original paragraph had an Input section, add an Input header tag
      const inputBadgeWrap = document.createElement("div");
      inputBadgeWrap.className = "algo-section__header";
      inputBadgeWrap.innerHTML = '<span class="spec-badge spec-badge--input">Input</span>';
      body.appendChild(inputBadgeWrap);

      // Move group elements into card body
      groupElements.forEach(function (el) {
        if (el.tagName === "P") {
          const pContent = el.textContent.trim();
          if (pContent.startsWith("Implementation details:")) {
            el.innerHTML = '<span class="spec-badge spec-badge--ref">Implementation</span>';
            el.className = "algo-section__header";
          } else if (pContent.startsWith("Common uses:")) {
            el.innerHTML = '<span class="spec-badge spec-badge--uses">Common Uses</span>';
            el.className = "algo-section__header";
          } else if (pContent.startsWith("Common modifications:")) {
            el.innerHTML = '<span class="spec-badge spec-badge--mods">Modifications</span>';
            el.className = "algo-section__header";
          } else if (pContent.startsWith("Reference implementation:")) {
            el.innerHTML = '<span class="spec-badge spec-badge--ref">Reference Implementation</span>';
            el.className = "algo-section__header";
          }
        }
        body.appendChild(el);
      });

      card.appendChild(body);

      // Insert card before original paragraph, then remove original paragraph
      p.parentNode.insertBefore(card, p);
      p.parentNode.removeChild(p);
    });

    // 5. Example Blocks
    content.querySelectorAll("h2, h3, h4").forEach(function (heading) {
      if (heading.closest(".example-block")) return;
      const hText = heading.textContent.toLowerCase();
      if (hText.includes("example") || hText.includes("worked example")) {
        heading.classList.add("example-heading");
        const badge = document.createElement("span");
        badge.className = "example-badge";
        badge.textContent = "Worked Example";
        heading.insertAdjacentElement("beforebegin", badge);
      }
    });
  }

  /* ==========================================================================
     Universal Mathematical Engine & KaTeX Normalization
     ========================================================================== */
  const katexMacros = {
    "\\R": "\\mathbb{R}",
    "\\set": "\\{#1\\}",
    "\\n": "\\overrightarrow ",
    "\\O": "\\mathcal{O}"
  };

  function pandocToLatex(html) {
    if (!html) return "";
    let s = html.trim();
    if (s.startsWith("$$") && s.endsWith("$$") && s.length > 4) {
      s = s.slice(2, -2).trim();
    } else if (s.startsWith("$") && s.endsWith("$") && s.length > 2) {
      s = s.slice(1, -1).trim();
    } else if (s.startsWith("\\[") && s.endsWith("\\]") && s.length > 4) {
      s = s.slice(2, -2).trim();
    } else if (s.startsWith("\\(") && s.endsWith("\\)") && s.length > 4) {
      s = s.slice(2, -2).trim();
    }
    s = s.replace(/(^|[^\\])\$(\d)/g, "$1\\$$2");

    // Handle words after non-breaking space in subscripts (e.g., f&nbsp;feasible, (S,T)&nbsp;cut)
    s = s.replace(/(?:&nbsp;|&#160;|\u00a0)([a-zA-Z]{2,})/g, " \\text{ $1}");
    s = s.replace(/&(?:nbsp|#160);/gi, " ");
    s = s.replace(/&(?:thinsp|#8201);/gi, "\\,");
    s = s.replace(/&(?:ensp|#8194);/gi, "\\;");
    s = s.replace(/&(?:emsp|#8195);/gi, "\\quad ");
    s = s.replace(/&minus;/gi, "-");
    s = s.replace(/&times;/gi, " \\times ");
    s = s.replace(/&middot;/gi, " \\cdot ");
    s = s.replace(/&le;/gi, " \\le ");
    s = s.replace(/&ge;/gi, " \\ge ");
    s = s.replace(/&ne;/gi, " \\neq ");
    s = s.replace(/[\u2000-\u200b\u00a0]/g, " ");

    // Combining characters and special unicode
    s = s.replace(/([a-zA-Z0-9])\u20d7/g, "\\vec{$1}");
    s = s.replace(/([a-zA-Z0-9])[\u0304\u0305]/g, "\\bar{$1}");
    s = s.replace(/[⌀∅]/g, "\\emptyset ");

    s = s.replace(/≤/g, " \\le ").replace(/≥/g, " \\ge ");
    s = s.replace(/≠/g, " \\neq ").replace(/≈/g, " \\approx ");
    s = s.replace(/→/g, " \\to ").replace(/⇒/g, " \\Rightarrow ");
    s = s.replace(/∈/g, " \\in ").replace(/∣/g, " \\mid ");
    s = s.replace(/∧/g, " \\land ").replace(/∨/g, " \\lor ");
    s = s.replace(/∀/g, " \\forall ").replace(/∃/g, " \\exists ");
    s = s.replace(/𝒪/g, " \\mathcal{O} ");
    s = s.replace(/[′’]/g, "'");
    s = s.replace(/⊤/g, "^{\\top}");
    s = s.replace(/⋆/g, "^*");
    s = s.replace(/∥/g, " \\parallel ");
    s = s.replace(/≢/g, " \\not\\equiv ");
    s = s.replace(/[◼▫]/g, " \\blacksquare ");

    // HTML tag normalization BEFORE stripping tags:
    s = s.replace(/<sub>\s*<em>(.*?)<\/em>\s*<\/sub>/gi, "_{$1}");
    s = s.replace(/<sup>\s*<em>(.*?)<\/em>\s*<\/sup>/gi, "^{$1}");
    s = s.replace(/<\/?em>/gi, "");
    s = s.replace(/<strong>(.*?)<\/strong>/gi, "\\mathbf{$1}");
    s = s.replace(/<b>(.*?)<\/b>/gi, "\\mathbf{$1}");
    s = s.replace(/<sub>(.*?)<\/sub>/gi, "_{$1}");
    s = s.replace(/<sup>(.*?)<\/sup>/gi, "^{$1}");

    // Strip remaining HTML tags safely without deleting math < and >
    s = s.replace(/<[^>]+>/g, "");

    // Now decode HTML entities safely
    s = s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    s = s.replace(/>\s*=/g, " \\ge ").replace(/<\s*=/g, " \\le ");
    s = s.replace(/\\begin\{split\}/g, "\\begin{aligned}").replace(/\\end\{split\}/g, "\\end{aligned}");
    s = s.replace(/u-\\&gt;v/g, "u \\to v").replace(/u->v/g, "u \\to v");
    s = s.replace(/\\\[/g, "[").replace(/\\\]/g, "]");
    s = s.replace(/\\</g, "<").replace(/\\>/g, ">");
    s = s.replace(/\\overrightarrow([A-Za-z])/g, "\\overrightarrow{$1}");
    s = s.replace(/\\overset\{\\rightarrow\}\s*([A-Za-z])/g, "\\overrightarrow{$1}");
    s = s.replace(/\\overset\{\\rightarrow\}/g, "\\overrightarrow ");
    s = s.replace(/\\overset\{\\to\}/g, "\\overrightarrow ");
    s = s.replace(/(?<!\\)\blog\b/g, "\\log");
    s = s.replace(/(?<!\\)\bln\b/g, "\\ln");
    s = s.replace(/−/g, "-");
    s = s.replace(/×/g, " \\times ").replace(/÷/g, " \\div ");
    s = s.replace(/±/g, " \\pm ");
    s = s.replace(/·|⋅/g, " \\cdot ");
    s = s.replace(/⋯|…/g, " \\dots ");
    s = s.replace(/ℤ/g, " \\mathbb{Z} ").replace(/ℝ/g, " \\mathbb{R} ").replace(/ℕ/g, " \\mathbb{N} ");
    s = s.replace(/Ω/g, " \\Omega ").replace(/Θ/g, " \\Theta ");
    s = s.replace(/\bs\.t\.\b/g, "\\text{ s.t. }");
    s = s.replace(/\bfor\b/g, "\\text{ for }");
    s = s.replace(/\\\*/g, "\\cdot ");
    s = s.replace(/%/g, "\\%");
    s = s.replace(/\s+/g, " ").trim();
    return s;
  }

  function loadKaTeXAssets(callback) {
    if (typeof katex !== "undefined" && typeof renderMathInElement === "function") {
      if (callback) callback();
      return;
    }
    const cssPath = hrefFor("vendor/katex/katex.min.css");
    const jsPath = hrefFor("vendor/katex/katex.min.js");
    const autoPath = hrefFor("vendor/katex/contrib/auto-render.min.js");

    if (!document.querySelector('link[href*="katex.min.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssPath;
      document.head.appendChild(link);
    }

    function loadScript(src, next) {
      const existing = document.querySelector('script[src="' + src + '"], script[src$="' + src.split("/").pop() + '"]');
      if (existing) {
        if (typeof katex !== "undefined" && (src.includes("katex.min.js") || typeof renderMathInElement === "function")) {
          if (next) next();
          return;
        }
        existing.addEventListener("load", function () {
          if (next) next();
        });
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.onload = next;
      document.head.appendChild(s);
    }

    loadScript(jsPath, function () {
      loadScript(autoPath, function () {
        if (callback) callback();
      });
    });
  }

  function renderSiteMath(rootEl) {
    const root = rootEl || document.querySelector(".content, .all-weeks-content") || document.body;
    if (!root) return;

    if (typeof katex === "undefined" || typeof renderMathInElement !== "function") {
      const needsMath = root.querySelector(".math, [class*='math']") ||
        /\$|\\\(|\\\[|\\le|\\ge|\\mathcal|\\sum|\\to/.test(root.textContent || "");
      if (needsMath) {
        loadKaTeXAssets(function () {
          renderSiteMath(root);
        });
      }
      return;
    }

    // 1. Process all .math.inline and .math.display elements
    root.querySelectorAll(".math.inline, .math.display, span[class*='math']").forEach(function (el) {
      const hasError = el.querySelector(".katex-error");
      if (el.querySelector(".katex") && !hasError) return;

      const isDisplay = el.classList.contains("display") ||
        (el.parentElement && el.parentElement.tagName === "P" && el.parentElement.children.length === 1 && !el.parentElement.textContent.replace(el.textContent, "").trim());
      const rawHtml = el.getAttribute("data-raw-math") || (hasError ? el.getAttribute("data-raw-math") : null) || el.innerHTML;
      if (!el.getAttribute("data-raw-math")) {
        el.setAttribute("data-raw-math", rawHtml);
      }
      const tex = pandocToLatex(rawHtml);
      if (!tex) return;
      try {
        katex.render(tex, el, {
          displayMode: isDisplay,
          throwOnError: false,
          macros: katexMacros
        });
        if (isDisplay) {
          el.setAttribute("role", "region");
          el.setAttribute("aria-label", "Mathematical formula");
          el.setAttribute("tabindex", "0");
        }
      } catch (err) {
        console.warn("KaTeX render span error:", err);
      }
    });

    // 2. Auto-render delimiters across general text
    try {
      renderMathInElement(root, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false,
        preProcess: function (math) {
          return math
            .replace(/(?:&nbsp;|&#160;|\u00a0)([a-zA-Z]{2,})/g, " \\text{ $1}")
            .replace(/&(?:nbsp|#160);/gi, " ")
            .replace(/&(?:thinsp|#8201);/gi, "\\,")
            .replace(/&(?:ensp|#8194);/gi, "\\;")
            .replace(/&(?:emsp|#8195);/gi, "\\quad ")
            .replace(/&minus;/gi, "-")
            .replace(/&times;/gi, " \\times ")
            .replace(/&middot;/gi, " \\cdot ")
            .replace(/&le;/gi, " \\le ")
            .replace(/&ge;/gi, " \\ge ")
            .replace(/&ne;/gi, " \\neq ")
            .replace(/[\u2000-\u200b\u00a0]/g, " ")
            .replace(/([a-zA-Z0-9])\u20d7/g, "\\vec{$1}")
            .replace(/([a-zA-Z0-9])[\u0304\u0305]/g, "\\bar{$1}")
            .replace(/[⌀∅]/g, "\\emptyset ")
            .replace(/\\left\\\[/g, "\\left[")
            .replace(/\\right\\\]/g, "\\right]")
            .replace(/\\\*/g, "\\cdot ")
            .replace(/\\overrightarrow([A-Za-z])/g, "\\overrightarrow{$1}")
            .replace(/\\overset\{\\rightarrow\}\s*([A-Za-z])/g, "\\overrightarrow{$1}")
            .replace(/\\overset\{\\rightarrow\}/g, "\\overrightarrow ")
            .replace(/\\overset\{\\to\}/g, "\\overrightarrow ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");
        },
        macros: katexMacros
      });
    } catch (e) {
      console.warn("KaTeX auto-render error:", e);
    }
  }

  window.renderSiteMath = renderSiteMath;
  window.renderMath = renderSiteMath;

  function ensureViewportFit() {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta && !meta.content.includes("viewport-fit")) {
      meta.content = meta.content + ", viewport-fit=cover";
    }
  }

  function init() {
    try { ensureViewportFit(); } catch (e) { console.warn("ensureViewportFit error:", e); }
    try { renderSiteMath(); } catch (e) { console.warn("renderSiteMath error:", e); }
    try { ensureTopbar(); } catch (e) { console.warn("ensureTopbar error:", e); }
    try { buildWeeksDropdown(); } catch (e) { console.warn("buildWeeksDropdown error:", e); }
    try { buildTreeDropdown(); } catch (e) { console.warn("buildTreeDropdown error:", e); }
    try { buildSearchDialog(); } catch (e) { console.warn("buildSearchDialog error:", e); }
    try { injectNavigation(); } catch (e) { console.warn("injectNavigation error:", e); }
    try { setupStickyMeasurements(); } catch (e) { console.warn("setupStickyMeasurements error:", e); }
    try { setupStickyToolbar(); } catch (e) { console.warn("setupStickyToolbar error:", e); }
    try { buildSidebarAndScrollspy(); } catch (e) { console.warn("buildSidebarAndScrollspy error:", e); }
    try { bindPageToc(); } catch (e) { console.warn("bindPageToc error:", e); }
    try { bindEvents(); } catch (e) { console.warn("bindEvents error:", e); }
    try { loadSearchIndex(); } catch (e) { console.warn("loadSearchIndex error:", e); }
    try { initPracticeMode(); } catch (e) { console.warn("initPracticeMode error:", e); }
    try { enhanceStudyContent(); } catch (e) { console.warn("enhanceStudyContent error:", e); }
    try { renderSiteMath(); } catch (e) { console.warn("renderSiteMath error:", e); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
