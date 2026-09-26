# CS6515 Exam Survival Engine

## Problem Statement
How might we transform the CS6515 static notes archive into an active, high-yield exam preparation tool that enforces the course's strict grading rubrics and eliminates blank-page exam panic?

## Recommended Direction
Build the **CS6515 Active Recall Engine & High-Yield Exam Synthesizer**:
1. **Global "Quiz / Active Recall Mode" Toggle:** 
   A dedicated Practice Mode switch (with hotkey `Q`) in the top navigation bar. When enabled, all DP recurrences, reduction steps, complexity proofs, and solutions across all weeks are masked behind a frosted glass blur. Tapping or clicking reveals the answer, turning every page into an interactive retrieval drill.
2. **Master High-Yield Exam Cram Sheets & Black-Box Catalog (`00_START_HERE/EXAM_CRAM_SHEET.html`):**
   - **Exam 1:** All 7 DP archetypes (LIS, LCS, 0/1 Knapsack, Unbounded Knapsack, Chain Matrix, Shortest Path DAG, All-Pairs) + D&C Master Theorem recipes and FastSelect.
   - **Exam 2:** Graph algorithm decision flow (SCC Kosaraju, 2-SAT, MST Cut Property, Dijkstra, Bellman-Ford) + Max-Flow / Min-Cut residual graph rules & bipartite matching.
   - **Exam 3:** Canonical NP-Complete reduction graph (3SAT → IS → VC → Clique, Subset-Sum → Knapsack) with exact reduction direction flashcards + LP Duality.
3. **Embedded Black-Box Repertoire Matrix:**
   A quick-reference table on each cram sheet detailing every permissible black-box algorithm, required preconditions, and exact asymptotic runtime permitted on Georgia Tech exams.
4. **5-Part Rubric Scaffolder:**
   Enforcing the strict grading criteria that TAs use on homework and exams (Subproblem, Recurrence, Base Cases, Fill Order / Algorithm, Complexity).

## Key Assumptions to Validate
- [x] Solutions, recurrences, and KaTeX display blocks can be cleanly targeted via `.quiz-mode-active` in `theme.css` without breaking page layout.
- [x] A high-density cram sheet covering Exam 1, 2, and 3 satisfies ~90% of exam preparation needs.
- [x] Client-side `localStorage` retains Practice Mode state seamlessly across page reloads without a backend.

## MVP Scope (v1)
- Topbar toggle button (`Practice [Q]`) with interactive glow and state indicator.
- Keyboard shortcut `Q` to instantly toggle Practice Mode on/off.
- Frosted glass blur effect with smooth reveal on click.
- Floating Practice Banner with "Reveal All / Hide All" controls.
- Comprehensive `00_START_HERE/EXAM_CRAM_SHEET.html` covering Exam 1, Exam 2, Exam 3, and the Black-Box matrix.
- 100% static, client-side, zero dependencies.

## Not Doing (and Why)
- **Service Worker / Offline PWA:** Premature optimization. Most studying happens on desktop/laptop with stable Wi-Fi; adds cache-invalidation friction.
- **Manual Video Timestamping:** High effort, low yield. Video is best for first-pass learning; cram sheets and active drills are best for exam retention.
- **User Accounts / Cloud Database:** Breaks our zero-maintenance, zero-cost GitHub Pages architecture.

## Open Questions & Future Enhancements
1. Should individual quiz cards track self-graded "Confidence" (Easy / Medium / Hard) in localStorage for spaced repetition?
2. Option to export customized printable PDF cheat sheets from the Exam Cram Sheet.
