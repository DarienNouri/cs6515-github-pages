(function () {
  "use strict";

  const currentScript = document.currentScript;
  const rootUrl = new URL(".", currentScript ? currentScript.src : window.location.href);
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || "");
  const shortcutLabel = isMac ? "Cmd K" : "Ctrl K";

  const weekPages = [
    ["01_by_week/W01_2026-05-18_DP1-DP2/index.html", "Week 1 - Intro & DP"],
    ["01_by_week/W02_2026-05-25_DC3-DC1/index.html", "Week 2 - Divide & Conquer"],
    ["01_by_week/W03_2026-06-01_DC2/index.html", "Week 3 - Linear-Time Median"],
    ["01_by_week/W04_2026-06-08_DP3-GR1-GR2_EXAM1/index.html", "Week 4 - DP3, SCC, 2-SAT"],
    ["01_by_week/W05_2026-06-15_GR3/index.html", "Week 5 - MST"],
    ["01_by_week/W06_2026-06-22_MF1-MF2/index.html", "Week 6 - Max-Flow Basics"],
    ["01_by_week/W07_2026-06-29_MF4_EXAM2/index.html", "Week 7 - Edmonds-Karp"],
    ["01_by_week/W08_2026-07-06_NP1-NP2-NP3/index.html", "Week 8 - NP-Completeness"],
    ["01_by_week/W09_2026-07-13_LP1-LP2-LP3/index.html", "Week 9 - Linear Programming"],
    ["01_by_week/W10_2026-07-20_LP4-NP4-NP5_EXAM3/index.html", "Week 10 - Approx & Undecidability"],
    ["01_by_week/W11_2026-07-27_Advanced-FFT-Crypto-Bloom/index.html", "Week 11 - Advanced Topics"]
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
    ["00_START_HERE/CURRENT_WEEK.html", "Current Week"],
    ["00_START_HERE/INDEX.html", "Master Index"],
    ["00_START_HERE/COURSE_MAP.html", "Course Map"],
    ["00_START_HERE/AGENT_ROUTING.html", "Agent Routing"],
    ["00_START_HERE/reading-index.html", "Reading Index"]
  ];

  const landingPages = [
    ["index.html", "Home"],
    ["00_START_HERE/CURRENT_WEEK.html", "Current Week"],
    ["01_by_week/index.html", "All Weeks"],
    ["01_by_week/all-in-one.html", "All Weeks - Stacked"],
    ["02_by_topic/index.html", "All Topics"],
    ["module-week-schedule.html", "Module Week Schedule"],
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

  function ensureSearchButton() {
    const topbar = document.querySelector(".topbar");
    if (!topbar || topbar.querySelector("[data-search-trigger]")) {
      setShortcutLabels();
      return;
    }

    const button = document.createElement("button");
    button.className = "search-trigger";
    button.type = "button";
    button.setAttribute("data-search-trigger", "");
    button.setAttribute("aria-label", "Search site");
    button.innerHTML = '<span class="search-trigger__label">Search</span><kbd data-search-shortcut></kbd>';
    topbar.appendChild(button);
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

  function injectBottomNav() {
    const content = document.querySelector("main.content");
    if (!content || content.querySelector("[data-bottom-nav]")) {
      return;
    }

    const path = normalizePath(window.location.pathname);
    const group = navGroupFor(path);
    const currentIndex = group.items.findIndex(function (item) { return item[0] === path; });

    if (currentIndex === -1 && path !== "index.html") {
      return;
    }

    const previous = currentIndex > 0 ? group.items[currentIndex - 1] : null;
    const next = currentIndex >= 0 && currentIndex < group.items.length - 1 ? group.items[currentIndex + 1] : null;
    const center = group.home || ["index.html", "Home"];

    const nav = document.createElement("nav");
    nav.className = "bottom-nav";
    nav.setAttribute("aria-label", "Page navigation");
    nav.setAttribute("data-bottom-nav", "");
    nav.innerHTML = [
      navLink(previous, "Previous", "bottom-nav__item--prev"),
      navLink(center, group.context === "Home" ? "Index" : group.context, "bottom-nav__item--center"),
      navLink(next, "Next", "bottom-nav__item--next")
    ].join("");
    content.appendChild(nav);
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

  function navLink(item, meta, className) {
    if (!item) {
      return [
        '<span class="bottom-nav__item bottom-nav__item--disabled ',
        className,
        '"><span class="bottom-nav__meta">',
        escapeHtml(meta),
        '</span><span class="bottom-nav__title">End</span></span>'
      ].join("");
    }

    return [
      '<a class="bottom-nav__item ',
      className,
      '" href="',
      escapeHtml(hrefFor(item[0])),
      '"><span class="bottom-nav__meta">',
      escapeHtml(meta),
      '</span><span class="bottom-nav__title">',
      escapeHtml(item[1]),
      '</span></a>'
    ].join("");
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
        injectBottomNav();
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
        injectBottomNav();
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

      if (document.querySelector("[data-search-dialog]:not([hidden])")) {
        if (event.key === "Escape") {
          closeSearch();
          const toc = document.querySelector("[data-page-toc]");
          const trigger = document.querySelector("[data-toc-trigger]");
          if (toc && trigger) {
            toc.hidden = true;
            trigger.setAttribute("aria-expanded", "false");
          }
        } else if (event.key === "ArrowDown") {
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

  ensureSearchButton();
  buildSearchDialog();
  bindPageToc();
  bindEvents();
  loadSearchIndex();
}());
