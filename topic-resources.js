/* Optional study links. No embeds, external requests, or dependencies. */
(function () {
  'use strict';

  const readings = {
    dp: ['DPV Chapter 6 — Dynamic programming', '02_by_topic/DP_dynamic-programming/DPV-ch6-dynamic-programming.pdf'],
    dc: ['DPV Chapter 2 — Divide and conquer', '02_by_topic/DC_divide-and-conquer/DPV-ch2-divide-and-conquer.pdf'],
    decomposition: ['DPV Chapter 3 — Graph decompositions', '02_by_topic/GR_graphs/DPV-ch3-graph-decompositions.pdf'],
    paths: ['DPV Chapter 4 — Paths in graphs', '02_by_topic/GR_graphs/DPV-ch4-paths-in-graphs.pdf'],
    greedy: ['DPV Chapter 5 — Greedy algorithms', '02_by_topic/GR_graphs/DPV-ch5-greedy-algorithms.pdf'],
    flow: ['DPV Chapter 7 — Flows and linear programming', '02_by_topic/MF_max-flow/DPV-ch7-flows-and-linear-programming.pdf'],
    lp: ['DPV Chapter 7 — Flows and linear programming', '02_by_topic/LP_linear-programming/DPV-ch7-flows-and-linear-programming.pdf'],
    np: ['DPV Chapter 8 — NP-completeness', '02_by_topic/NP_np-completeness/DPV-ch8-np-complete-problems.pdf'],
    approximation: ['DPV Chapter 9 — Coping with NP-completeness', '02_by_topic/NP_np-completeness/DPV-ch9-coping-with-np-completeness.pdf'],
    numbers: ['DPV Chapter 1 — Algorithms with numbers', '02_by_topic/ADV_advanced-topics/DPV-ch1-algorithms-with-numbers.pdf'],
    fft: ['DPV Chapter 2 — FFT reading', '02_by_topic/ADV_advanced-topics/DPV-ch2-divide-and-conquer-FFT.pdf']
  };
  const topic = (id, name, pattern, articles, reading) => ({ id, name, pattern, articles, reading });
  // Specific names precede their broader families. Context resolves headings
  // such as "Standard form" or "Recurrence" without inventing video URLs.
  const topics = [
    topic('lcs', 'Longest common subsequence', /\bLCS\b|longest common subsequence|two.sequence/i, ['Longest_common_subsequence'], 'dp'),
    topic('lis', 'Longest increasing subsequence', /\bLIS\b|longest increasing subsequence/i, ['Longest_increasing_subsequence'], 'dp'),
    topic('fibonacci', 'Fibonacci dynamic programming', /fibonacci|\bFIB\b/i, ['Fibonacci_sequence', 'Dynamic_programming'], 'dp'),
    topic('edit-distance', 'Edit distance', /edit.distance|sequence alignment|levenshtein/i, ['Edit_distance', 'Sequence_alignment'], 'dp'),
    topic('fptas', 'Fully polynomial approximation schemes', /FPTAS|PTAS/i, ['Polynomial-time_approximation_scheme'], 'approximation'),
    topic('knapsack', 'Knapsack dynamic programming', /knapsack|capacity DP|unbounded|with repetition/i, ['Knapsack_problem'], 'dp'),
    topic('matrix-chain', 'Matrix chain multiplication', /matrix.chain|chain.matrix|chain multipl|interval DP/i, ['Matrix_chain_multiplication'], 'dp'),
    topic('max-subarray', 'Maximum subarray', /max(?:imum)?[ -]sub.?array|contiguous subsequence/i, ['Maximum_subarray_problem'], 'dc'),
    topic('coins', 'Change-making dynamic programming', /coin.change|change.making/i, ['Change-making_problem'], 'dp'),
    topic('coin-game', 'Alternating coin game dynamic programming', /coin game|\bcoins\b/i, ['Minimax', 'Dynamic_programming'], 'dp'),
    topic('master', 'Master theorem for recurrences', /master theorem|recursion.tree|solving recurr[ae]nces/i, ['Master_theorem_(analysis_of_algorithms)'], 'dc'),
    topic('karatsuba', 'Karatsuba integer multiplication', /karatsuba|fast integer multipl/i, ['Karatsuba_algorithm'], 'dc'),
    topic('median', 'Median of medians selection', /median.of.medians|linear.time (?:median|selection)|fast.?select/i, ['Median_of_medians', 'Selection_algorithm'], 'dc'),
    topic('quickselect', 'Quickselect', /quick.?select/i, ['Quickselect'], 'dc'),
    topic('binary-search', 'Binary search', /binary search/i, ['Binary_search_algorithm'], 'dc'),
    topic('merge-sort', 'Merge sort', /merge.?sort/i, ['Merge_sort'], 'dc'),
    topic('fft', 'Fast Fourier transform', /\bFFT\b|fourier|roots of unity/i, ['Fast_Fourier_transform'], 'fft'),
    topic('convolution', 'Polynomial multiplication and convolution', /convolution|polynomial multipl/i, ['Convolution', 'Polynomial#Multiplication'], 'fft'),
    topic('complex', 'Complex numbers for the FFT', /complex number/i, ['Complex_number'], 'fft'),
    topic('2sat', '2-SAT and implication graphs', /2.?SAT|2.satisf|implication graph|\bGR2\b/i, ['2-satisfiability', 'Implication_graph'], 'decomposition'),
    topic('bfs', 'Breadth-first search', /\bBFS\b|breadth.first|shortest.path layers/i, ['Breadth-first_search'], 'paths'),
    topic('dfs', 'Depth-first search', /\bDFS\b|depth.first|pre.?post numbers/i, ['Depth-first_search'], 'decomposition'),
    topic('kosaraju', 'Kosaraju strongly connected components', /kosaraju/i, ["Kosaraju's_algorithm", 'Strongly_connected_component'], 'decomposition'),
    topic('scc', 'Strongly connected components', /\bSCCs?\b|strongly connected|\bGR1\b/i, ['Strongly_connected_component'], 'decomposition'),
    topic('bellman-ford', 'Bellman–Ford shortest paths', /bellman/i, ['Bellman–Ford_algorithm'], 'paths'),
    topic('floyd-warshall', 'Floyd–Warshall all-pairs shortest paths', /floyd|warshall|all.pairs/i, ['Floyd–Warshall_algorithm'], 'paths'),
    topic('dijkstra', 'Dijkstra shortest paths', /dijkstra/i, ["Dijkstra's_algorithm"], 'paths'),
    topic('topological', 'Topological sorting and DAGs', /topological|\bDAGs?\b|directed acyclic/i, ['Topological_sorting', 'Directed_acyclic_graph'], 'paths'),
    topic('kruskal', 'Kruskal minimum spanning trees', /kruskal/i, ["Kruskal's_algorithm", 'Minimum_spanning_tree'], 'greedy'),
    topic('prim', 'Prim minimum spanning trees', /\bprim(?:’s|'s)?\b/i, ["Prim's_algorithm", 'Minimum_spanning_tree'], 'greedy'),
    topic('union-find', 'Union-find disjoint sets', /union.find|disjoint.set/i, ['Disjoint-set_data_structure'], 'greedy'),
    topic('mst', 'Minimum spanning trees and cut properties', /\bMST\b|spanning tree|cut property|cycle propert|cut and cycle/i, ['Minimum_spanning_tree'], 'greedy'),
    topic('edmonds-karp', 'Edmonds–Karp maximum flow', /edmonds|karp/i, ['Edmonds–Karp_algorithm'], 'flow'),
    topic('ford-fulkerson', 'Ford–Fulkerson maximum flow', /ford|fulkerson|augmenting path/i, ['Ford–Fulkerson_algorithm'], 'flow'),
    topic('min-cut', 'Max-flow min-cut theorem', /max.?flow.*min.?cut|min.?cut.*max.?flow|minimum cut|min ST.cut/i, ['Max-flow_min-cut_theorem'], 'flow'),
    topic('matching', 'Bipartite matching', /bipartite|matching/i, ['Matching_(graph_theory)', 'Maximum_flow_problem'], 'flow'),
    topic('residual', 'Residual flow networks', /residual|flow conservation/i, ['Flow_network#Residual_network'], 'flow'),
    topic('image-segmentation', 'Image segmentation using graph cuts', /image segmentation/i, ['Graph_cuts_in_computer_vision'], 'approximation'),
    topic('flow', 'Maximum flow', /max(?:imum)?.?flow|flow network|network flow/i, ['Maximum_flow_problem', 'Flow_network'], 'flow'),
    topic('pagerank', 'PageRank and Markov chains', /page.?rank/i, ['PageRank', 'Markov_chain']),
    topic('stationary', 'Stationary distributions of Markov chains', /stationary|ergodic|mixing time/i, ['Stationary_distribution', 'Markov_chain']),
    topic('markov', 'Markov chains', /markov|random walk/i, ['Markov_chain']),
    topic('adjacency', 'Graph representations', /adjacency|graph representations/i, ['Adjacency_list', 'Adjacency_matrix'], 'decomposition'),
    topic('shortest-path', 'Shortest path algorithms', /shortest.path|negative.*cycle/i, ['Shortest_path_problem'], 'paths'),
    topic('circuit-sat', 'Circuit satisfiability', /circuit.?SAT|circuit satisf/i, ['Circuit_satisfiability_problem'], 'np'),
    topic('max-sat', 'Maximum satisfiability approximation', /max.?SAT|maximum satisf|7\/8|Ek.?SAT/i, ['Maximum_satisfiability_problem'], 'approximation'),
    topic('sat', 'Boolean satisfiability and 3-SAT', /\b[3k].?SAT\b|satisfiability|\bSAT\b/i, ['Boolean_satisfiability_problem'], 'np'),
    topic('independent-set', 'Independent set reductions', /independent.set/i, ['Independent_set_(graph_theory)'], 'np'),
    topic('vertex-cover', 'Vertex cover', /vertex.cover/i, ['Vertex_cover'], 'np'),
    topic('clique', 'Clique problem', /clique/i, ['Clique_problem'], 'np'),
    topic('coloring', 'Graph coloring', /coloring|colouring/i, ['Graph_coloring'], 'np'),
    topic('tsp', 'Travelling salesman problem', /travell?ing salesman|\bTSP\b/i, ['Travelling_salesman_problem'], 'np'),
    topic('subset-sum', 'Subset sum', /subset.sum/i, ['Subset_sum_problem'], 'np'),
    topic('halting', 'Halting problem and undecidability', /halt|undecidab|diagonaliz/i, ['Halting_problem'], 'approximation'),
    topic('approximation', 'Approximation algorithms', /approximation|coping with NP/i, ['Approximation_algorithm'], 'approximation'),
    topic('reduction', 'Polynomial-time reductions', /reduction|gadget/i, ['Polynomial-time_reduction', 'NP-completeness'], 'np'),
    topic('integer-programming', 'Integer programming', /integer (?:linear )?program|\bILP\b|rounding/i, ['Integer_programming'], 'approximation'),
    topic('slackness', 'Complementary slackness', /complementary.slackness/i, ['Complementary_slackness'], 'lp'),
    topic('simplex', 'Simplex algorithm', /simplex/i, ['Simplex_algorithm'], 'lp'),
    topic('duality', 'Linear programming duality', /duality|primal|build.the.dual|\bdual\b/i, ['Dual_linear_program'], 'lp'),
    topic('polytope', 'Linear programming feasible regions', /polytope|feasible.region|LP geometry/i, ['Linear_programming', 'Convex_polytope'], 'lp'),
    topic('lp', 'Linear programming', /linear.programming|\bLP[1-4]?\b/i, ['Linear_programming'], 'lp'),
    topic('np', 'NP-completeness', /NP.complete|NP.hard|P vs|P versus|verification|complexity class/i, ['NP-completeness', 'P_versus_NP_problem'], 'np'),
    topic('rsa', 'RSA cryptography', /\bRSA\b|cryptograph|cryptosystem/i, ['RSA_(cryptosystem)'], 'numbers'),
    topic('euclid', 'Euclidean algorithm', /euclid|greatest common divisor|\bGCD\b/i, ['Euclidean_algorithm', 'Extended_Euclidean_algorithm'], 'numbers'),
    topic('fermat-little', 'Fermat little theorem', /fermat.*little/i, ["Fermat's_little_theorem"], 'numbers'),
    topic('fermat', 'Fermat primality testing', /fermat|primality/i, ['Fermat_primality_test'], 'numbers'),
    topic('euler', 'Euler theorem in modular arithmetic', /euler/i, ["Euler's_theorem"], 'numbers'),
    topic('modular', 'Modular arithmetic', /modular|modulo/i, ['Modular_arithmetic'], 'numbers'),
    topic('bloom', 'Bloom filters', /bloom/i, ['Bloom_filter']),
    topic('hash-table', 'Hash tables and sets', /hash.table|hash.set/i, ['Hash_table']),
    topic('hashing', 'Hash functions and universal hashing', /hash/i, ['Hash_function', 'Universal_hashing']),
    topic('randomized', 'Randomized algorithms', /randomized algorithm|randomised algorithm/i, ['Randomized_algorithm']),
    topic('heap', 'Binary heaps and priority queues', /heap|priority.queue/i, ['Binary_heap', 'Priority_queue'], 'paths'),
    topic('runtime', 'Asymptotic algorithm analysis', /big.?O|asymptotic|runtime|running.time/i, ['Big_O_notation', 'Analysis_of_algorithms']),
    topic('dp', 'Dynamic programming', /dynamic.programming|\bDP[1-3]?\b|memoiz|one.sequence/i, ['Dynamic_programming'], 'dp'),
    topic('dc', 'Divide and conquer', /divide\s*(?:&|and|-)\s*conquer|\bDC[0-5]?\b/i, ['Divide-and-conquer_algorithm'], 'dc'),
    topic('graphs', 'Graph algorithms', /graph theory|graph algorithm|graph fundamental|what is a graph|graphs? \(GR\)|^graphs?$/i, ['Graph_(discrete_mathematics)'], 'decomposition'),
    topic('greedy', 'Greedy algorithms', /greedy/i, ['Greedy_algorithm'], 'greedy'),
    topic('advanced', 'FFT, RSA and Bloom filters', /advanced topics/i, ['Fast_Fourier_transform', 'RSA_(cryptosystem)', 'Bloom_filter']),
    topic('algorithms', 'Algorithm design', /algorithm design|graduate algorithms/i, ['Algorithm', 'Analysis_of_algorithms'])
  ];

  function cleanTitle(text) {
    return text.replace(/\s+/g, ' ')
      .replace(/^[\s\p{Extended_Pictographic}\uFE0F\u200d]+/u, '')
      .replace(/^\d+(?:\.\d+)*[.)]\s+/, '')
      .replace(/^\([a-z]\)\s*/i, '')
      .replace(/¶\s*$/, '').trim();
  }

  function matchTopic(text) { return topics.find(item => item.pattern.test(text)); }

  function pathTopic(path) {
    const chapter = path.match(/examples-md\/(\d\d)-/);
    if (chapter) {
      const categories = ['algorithms', 'modular', 'dc', 'graphs', 'shortest-path', 'greedy', 'dp', 'lp', 'np', 'approximation'];
      return topics.find(item => item.id === categories[Number(chapter[1])]);
    }
    const rules = [
      [/W01|DP_dynamic/, 'dp'], [/W02|DC_divide/, 'dc'], [/W03/, 'median'],
      [/W04/, 'graphs'], [/W05/, 'mst'], [/W06|W07|MF_max/, 'flow'],
      [/W08|NP_np/, 'np'], [/W09|LP_linear/, 'lp'], [/W10/, 'approximation'],
      [/GR_graphs/, 'graphs']
    ];
    const rule = rules.find(([pattern]) => pattern.test(path));
    return rule ? topics.find(item => item.id === rule[1]) : undefined;
  }

  function resolveTopic(title, context, path) {
    // Connectivity inside a Markov-chain section is a chain property rather
    // than a new SCC algorithm chapter. MST cuts likewise differ from flow cuts.
    if (/markov|page.?rank/i.test(context || '') && /irreducib|strongly connected/i.test(title)) return topics.find(item => item.id === 'markov');
    if (/spanning|\bMST\b|kruskal|prim/i.test(context || '') && /cut|cycle/i.test(title)) return topics.find(item => item.id === 'mst');
    if (/electoral college/i.test(title)) return topics.find(item => item.id === 'knapsack');
    return matchTopic(title) || matchTopic(context || '') || pathTopic(path || '') || topics[topics.length - 1];
  }

  function wikipediaUrl(article) {
    const [title, fragment] = article.split('#');
    return 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title) + (fragment ? '#' + encodeURIComponent(fragment) : '');
  }

  function resourceLinks(title, context, path) {
    const subject = resolveTopic(title, context, path);
    const label = cleanTitle(title);
    const specific = matchTopic(label);
    const query = specific ? subject.name : label + ' ' + subject.name;
    const links = [{ label: 'YouTube search: ' + query, url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' explanation') }];
    subject.articles.forEach(article => links.push({
      label: 'Wikipedia: ' + article.split('#')[0].replace(/_/g, ' '), url: wikipediaUrl(article)
    }));
    if (!specific && label.toLowerCase() !== subject.name.toLowerCase()) {
      links.push({ label: 'Wikipedia search: ' + label, url: 'https://en.wikipedia.org/w/index.php?search=' + encodeURIComponent(query) });
    }
    if (subject.reading) {
      const reading = readings[subject.reading];
      links.push({ label: reading[0] + ' (PDF)', path: reading[1] });
    }
    return { topic: subject.id, query, links };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { topics, readings, cleanTitle, resolveTopic, resourceLinks };
  if (typeof document === 'undefined') return;

  const script = document.currentScript || document.querySelector('script[data-topic-resources-script]');
  const base = new URL('.', script ? script.src : window.location.href);
  const excluded = /^(?:table of contents|contents|learning objectives|core concepts|algorithms(?:\s*[—–-].*)?|key theorems.*|common pitfalls.*|how to answer.*|comprehensive notes|worked example|example|exercises?|dpv chapter exercises|agent hint|material in this folder|canonical source locations|textbooks?|other resources|basic details|weekly study sequence|refresher|summary|overview|definition|proof|readings|references?|resources?|videos.*|week \d+ study focus|all lessons and transcripts|linked PDF sources|PDF readings|copy lesson URLs)$/i;

  function titleText(heading) {
    const clone = heading.cloneNode(true);
    clone.querySelectorAll('.katex').forEach(math => {
      math.replaceWith(document.createTextNode(math.querySelector('annotation')?.textContent || math.textContent));
    });
    return cleanTitle(clone.textContent);
  }

  function enhanceTopicResources(root) {
    const content = root && root.querySelectorAll ? root : document.querySelector('main.content, .all-weeks-content');
    if (!content) return;
    const stack = [];
    const pageTitle = titleText(content.querySelector('h1') || document.querySelector('main h1') || document.querySelector('title'));
    content.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(heading => {
      const title = titleText(heading);
      const level = Number(heading.tagName[1]);
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
      const context = stack.map(entry => entry.title).reverse().join(' · ') || pageTitle;
      stack.push({ title, level });
      const chapterMenu = /^exercises$/i.test(title) && /textbooks\/examples-md\//.test(window.location.pathname);
      if (!title || (excluded.test(title) && !chapterMenu) || /^\d+(?:\.\d+)*\.?$/.test(heading.textContent.trim())) return;
      if (heading.closest('summary,nav,aside,.topic-resources,.graph-demo,[data-no-topic-resources]')) return;
      if (heading.nextElementSibling?.matches('[data-topic-resources]')) return;
      const resourceTitle = chapterMenu ? resolveTopic('', '', window.location.pathname).name : title;
      const resources = resourceLinks(resourceTitle, context, window.location.pathname);
      const details = document.createElement('details');
      details.className = 'topic-resources';
      details.dataset.topicResources = resources.topic;
      details.setAttribute('aria-label', 'Videos and references for ' + title);
      const summary = document.createElement('summary');
      summary.textContent = 'Videos & references';
      const list = document.createElement('ul');
      list.className = 'topic-resources__links';
      resources.links.forEach(resource => {
        const item = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.textContent = resource.label;
        anchor.href = resource.url || new URL(resource.path, base).href;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        item.append(anchor);
        list.append(item);
      });
      details.append(summary, list);
      heading.insertAdjacentElement('afterend', details);
    });
  }

  window.enhanceTopicResources = enhanceTopicResources;
  enhanceTopicResources();
})();
