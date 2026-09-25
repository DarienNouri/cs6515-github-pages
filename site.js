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
    ["module-week-schedule.html", "Course Schedule"],
    ["textbooks/index.html", "Textbooks"],
    ["notes/index.html", "Notes"]
  ];

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

    let actions = topbar.querySelector(".topbar__actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "topbar__actions";
      topbar.appendChild(actions);
    }

    let searchBtn = topbar.querySelector("[data-search-trigger]");
    if (!searchBtn) {
      searchBtn = document.createElement("button");
      searchBtn.className = "search-trigger";
      searchBtn.type = "button";
      searchBtn.setAttribute("data-search-trigger", "");
      searchBtn.setAttribute("aria-label", "Search site");
      searchBtn.innerHTML = '<span class="search-trigger__label">Search</span><kbd data-search-shortcut></kbd>';
      actions.appendChild(searchBtn);
    } else if (searchBtn.parentElement !== actions) {
      actions.appendChild(searchBtn);
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
        '<span>Outline</span>'
      ].join("");
      actions.insertBefore(outlineBtn, actions.firstChild);
    }

    function openDrawer() {
      sidebar.classList.add("is-open");
      backdrop.classList.add("is-open");
      if (outlineBtn) outlineBtn.setAttribute("aria-expanded", "true");
      document.documentElement.classList.add("sidebar-open");
    }

    function closeDrawer() {
      sidebar.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      if (outlineBtn) outlineBtn.setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("sidebar-open");
    }

    if (outlineBtn) {
      outlineBtn.addEventListener("click", function () {
        if (sidebar.classList.contains("is-open")) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    const closeBtn = sidebar.querySelector("[data-sidebar-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeDrawer);
    }

    backdrop.addEventListener("click", closeDrawer);

    sidebar.addEventListener("click", function (event) {
      const link = event.target.closest(".sidebar-toc__link");
      if (link && window.innerWidth <= 1120) {
        closeDrawer();
      }
    });

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
      const trigger = event.target.closest("[data-search-trigger]");
      if (trigger) {
        event.preventDefault();
        openSearch();
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

  function init() {
    ensureTopbar();
    buildSearchDialog();
    injectNavigation();
    buildSidebarAndScrollspy();
    bindPageToc();
    bindEvents();
    loadSearchIndex();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
