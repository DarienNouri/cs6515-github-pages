/* Small, deterministic graph walkthroughs. No dependencies or network requests. */
(function () {
  'use strict';

  const graphs = {
    bfs: {
      title: 'Breadth-first search from A',
      nodes: [{ id: 'A', x: 66, y: 140 }, { id: 'B', x: 210, y: 64 }, { id: 'C', x: 210, y: 216 }, { id: 'D', x: 365, y: 64 }, { id: 'E', x: 365, y: 216 }, { id: 'F', x: 520, y: 140 }],
      edges: [{ id: 'AB', u: 'A', v: 'B' }, { id: 'AC', u: 'A', v: 'C' }, { id: 'BD', u: 'B', v: 'D' }, { id: 'BE', u: 'B', v: 'E' }, { id: 'CE', u: 'C', v: 'E' }, { id: 'DE', u: 'D', v: 'E' }, { id: 'DF', u: 'D', v: 'F' }, { id: 'EF', u: 'E', v: 'F' }]
    },
    kruskal: {
      title: 'Kruskal’s minimum spanning tree',
      nodes: [{ id: 'A', x: 64, y: 140 }, { id: 'B', x: 210, y: 64 }, { id: 'C', x: 210, y: 216 }, { id: 'D', x: 365, y: 64 }, { id: 'E', x: 520, y: 216 }],
      edges: [{ id: 'AB', u: 'A', v: 'B', weight: 1 }, { id: 'BC', u: 'B', v: 'C', weight: 2 }, { id: 'BD', u: 'B', v: 'D', weight: 3 }, { id: 'AC', u: 'A', v: 'C', weight: 4 }, { id: 'CD', u: 'C', v: 'D', weight: 5 }, { id: 'DE', u: 'D', v: 'E', weight: 6 }, { id: 'CE', u: 'C', v: 'E', weight: 7 }]
    },
    flow: {
      title: 'Maximum flow by augmenting paths', directed: true,
      nodes: [{ id: 's', x: 64, y: 140 }, { id: 'a', x: 285, y: 64 }, { id: 'b', x: 285, y: 216 }, { id: 't', x: 520, y: 140 }],
      edges: [{ id: 'sa', u: 's', v: 'a', capacity: 3 }, { id: 'sb', u: 's', v: 'b', capacity: 2 }, { id: 'ab', u: 'a', v: 'b', capacity: 1 }, { id: 'at', u: 'a', v: 't', capacity: 2 }, { id: 'bt', u: 'b', v: 't', capacity: 3 }]
    }
  };
  const clone = value => JSON.parse(JSON.stringify(value));

  function bfsFrames() {
    const graph = graphs.bfs;
    const queue = ['A'];
    const distance = Object.fromEntries(graph.nodes.map(node => [node.id, null]));
    const parent = Object.fromEntries(graph.nodes.map(node => [node.id, null]));
    const visited = [];
    const tree = [];
    distance.A = 0;
    const frames = [];
    function save(explanation, current, edge) {
      frames.push(clone({ explanation, queue, distance, parent, visited, tree, current, edge }));
    }
    save('Start at A. Set its distance to 0 and put A in the FIFO queue. Every other vertex is undiscovered.', null, null);
    while (queue.length) {
      const current = queue.shift();
      save('Remove ' + current + ' from the front of the queue. Examine its neighbors in alphabetical order.', current, null);
      const neighbors = graph.edges.filter(edge => edge.u === current || edge.v === current)
        .map(edge => ({ edge, vertex: edge.u === current ? edge.v : edge.u }))
        .sort((a, b) => a.vertex.localeCompare(b.vertex));
      for (const { edge, vertex } of neighbors) {
        if (distance[vertex] === null) {
          distance[vertex] = distance[current] + 1;
          parent[vertex] = current;
          queue.push(vertex);
          tree.push(edge.id);
          save('Discover ' + vertex + ' through ' + current + '–' + vertex + '. Its distance is ' + distance[vertex] + '; append it to the queue. Mark a vertex when enqueuing so it is queued only once.', current, edge.id);
        } else {
          save('Examine ' + current + '–' + vertex + '. ' + vertex + ' is already discovered, so its distance and queue position stay unchanged.', current, edge.id);
        }
      }
      visited.push(current);
      save('All neighbors of ' + current + ' have been examined. Mark ' + current + ' finished.', null, null);
    }
    save('The queue is empty. BFS is complete: distances from A are A=0, B=C=1, D=E=2, F=3. The tree edges give shortest paths measured in number of edges.', null, null);
    return frames;
  }

  function kruskalFrames() {
    const accepted = [];
    const rejected = [];
    const component = Object.fromEntries(graphs.kruskal.nodes.map(node => [node.id, node.id]));
    let total = 0;
    const frames = [];
    function save(explanation, current, phase) {
      const groups = Object.values(component).filter((value, i, all) => all.indexOf(value) === i)
        .map(id => Object.keys(component).filter(vertex => component[vertex] === id));
      frames.push(clone({ explanation, accepted, rejected, current, phase, groups, component, total }));
    }
    save('Begin with five separate components and no selected edges. Process edges by increasing weight: 1, 2, 3, 4, 5, 6, 7.', null, 'start');
    for (const edge of graphs.kruskal.edges.slice().sort((a, b) => a.weight - b.weight)) {
      save('Consider ' + edge.u + '–' + edge.v + ', weight ' + edge.weight + '. Check whether its endpoints are in different components.', edge.id, 'consider');
      if (component[edge.u] === component[edge.v]) {
        rejected.push(edge.id);
        save('Reject ' + edge.u + '–' + edge.v + ': its endpoints are already connected by selected edges. Adding it would form a cycle. With these distinct weights, it is also the heaviest edge on that cycle.', edge.id, 'reject');
      } else {
        const from = component[edge.v];
        const into = component[edge.u];
        Object.keys(component).forEach(vertex => { if (component[vertex] === from) component[vertex] = into; });
        accepted.push(edge.id);
        total += edge.weight;
        save('Accept ' + edge.u + '–' + edge.v + ' and merge its components. It is a lightest edge crossing the cut around either prior component, so the cut property makes this a safe choice. Total weight: ' + total + '.', edge.id, 'accept');
      }
    }
    save('Complete: the four selected edges connect all five vertices with no cycle. The minimum spanning tree is {A–B, B–C, B–D, D–E}, with total weight 12. Scanning the remaining edges is optional once the tree has |V| − 1 edges.', null, 'done');
    return frames;
  }

  function flowFrames() {
    const graph = graphs.flow;
    const flow = Object.fromEntries(graph.edges.map(edge => [edge.id, 0]));
    let total = 0;
    const frames = [];
    function save(explanation, path, amount, cut) {
      frames.push(clone({ explanation, flow, total, path: path || [], amount: amount || 0, cut: cut || [] }));
    }
    save('Start with zero flow. An edge label is flow / capacity. Find a shortest s-to-t path in the residual graph using BFS (Edmonds–Karp).', []);
    while (true) {
      const parent = { s: null };
      const queue = ['s'];
      while (queue.length && !Object.prototype.hasOwnProperty.call(parent, 't')) {
        const u = queue.shift();
        for (const edge of graph.edges) {
          const forward = edge.u === u && edge.capacity - flow[edge.id] > 0;
          const reverse = edge.v === u && flow[edge.id] > 0;
          if (!forward && !reverse) continue;
          const v = forward ? edge.v : edge.u;
          if (Object.prototype.hasOwnProperty.call(parent, v)) continue;
          parent[v] = { previous: u, edge: edge.id, direction: forward ? 1 : -1, residual: forward ? edge.capacity - flow[edge.id] : flow[edge.id] };
          queue.push(v);
        }
      }
      if (!Object.prototype.hasOwnProperty.call(parent, 't')) {
        const cut = Object.keys(parent);
        save('No residual path reaches t. The reachable set is {' + cut.join(', ') + '}; the original edges leaving it have total capacity 5, matching the flow value 5. By max-flow/min-cut, this flow is maximum.', [], 0, cut);
        break;
      }
      const path = [];
      for (let v = 't'; v !== 's'; v = parent[v].previous) path.unshift(parent[v]);
      const amount = Math.min(...path.map(arc => arc.residual));
      const vertices = ['s'].concat(path.map(arc => {
        const edge = graph.edges.find(item => item.id === arc.edge);
        return arc.direction === 1 ? edge.v : edge.u;
      }));
      save('Residual BFS finds ' + vertices.join(' → ') + '. Residual capacities along it are ' + path.map(arc => arc.residual).join(', ') + '; the bottleneck is ' + amount + '.', path, amount);
      for (const arc of path) flow[arc.edge] += arc.direction * amount;
      total += amount;
      save('Augment ' + amount + ' unit' + (amount === 1 ? '' : 's') + ' along ' + vertices.join(' → ') + '. Flow value is now ' + total + '. Each used forward arc gains reverse residual capacity, allowing later cancellation if needed.', path, amount);
    }
    return frames;
  }

  const builders = { bfs: bfsFrames, kruskal: kruskalFrames, flow: flowFrames };
  if (typeof module !== 'undefined' && module.exports) module.exports = { graphs, bfsFrames, kruskalFrames, flowFrames };
  if (typeof document === 'undefined') return;

  let sequence = 0;
  let active = null;
  const controllers = [];
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

  function mount(container) {
    const type = container.dataset.graphDemo;
    if (!builders[type] || container.dataset.graphReady) return;
    container.dataset.graphReady = 'true';
    const uid = 'graph-demo-' + (++sequence);
    const graph = graphs[type];
    const frames = builders[type]();
    let index = 0;
    let timer = null;
    let delay = 1100;
    container.classList.add('graph-demo');
    container.innerHTML = '<div class="graph-demo__canvas"><svg viewBox="0 0 585 285" role="img" aria-labelledby="' + uid + '-title ' + uid + '-desc"><title id="' + uid + '-title">' + escape(graph.title) + '</title><desc id="' + uid + '-desc"></desc><defs><marker id="' + uid + '-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"></path></marker></defs><g class="graph-demo__edges"></g><g class="graph-demo__nodes"></g></svg></div>' +
      '<div class="graph-demo__legend"><span class="graph-demo__key graph-demo__key--active">Current step</span><span class="graph-demo__key graph-demo__key--selected">' + (type === 'bfs' ? 'Tree edge / finished' : type === 'flow' ? 'Positive flow' : 'Selected edge') + '</span>' + (type === 'kruskal' ? '<span class="graph-demo__key graph-demo__key--rejected">Rejected (dashed)</span>' : '') + '</div>' +
      '<div class="graph-demo__controls" role="group" aria-label="' + escape(graph.title) + ' controls"><button type="button" data-action="previous" aria-label="Previous step">← Back</button><button type="button" data-action="play">Play</button><button type="button" data-action="next" aria-label="Next step">Next →</button><button type="button" data-action="reset">Reset</button><label class="graph-demo__speed" for="' + uid + '-speed">Speed <select id="' + uid + '-speed"><option value="1800">Slow</option><option value="1100" selected>Normal</option><option value="550">Fast</option></select></label><output class="graph-demo__position" aria-label="Current step"></output></div>' +
      '<p class="graph-demo__explanation" role="status" aria-live="polite" aria-atomic="true"></p><div class="graph-demo__metrics"></div><div class="graph-demo__table"></div>';
    const select = selector => container.querySelector(selector);
    const previousButton = select('[data-action="previous"]');
    const nextButton = select('[data-action="next"]');
    const playButton = select('[data-action="play"]');
    const svg = select('svg');

    function pause() {
      if (timer !== null) clearInterval(timer);
      timer = null;
      playButton.textContent = 'Play';
      playButton.setAttribute('aria-label', 'Play animation');
      if (active === controller) active = null;
    }
    function play() {
      if (active && active !== controller) active.pause();
      window.dispatchEvent(new CustomEvent('course-visual-start', { detail: controller }));
      if (index === frames.length - 1) index = 0;
      active = controller;
      playButton.textContent = 'Pause';
      playButton.setAttribute('aria-label', 'Pause animation');
      render();
      timer = setInterval(() => {
        index++;
        if (index >= frames.length - 1) { index = frames.length - 1; pause(); }
        render();
      }, delay);
    }
    function table(headers, rows, caption) {
      return '<table><caption>' + escape(caption) + '</caption><thead><tr>' + headers.map(header => '<th scope="col">' + escape(header) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map((cell, i) => '<' + (i === 0 ? 'th scope="row"' : 'td') + '>' + escape(cell) + '</' + (i === 0 ? 'th' : 'td') + '>').join('') + '</tr>').join('') + '</tbody></table>';
    }
    function render() {
      const frame = frames[index];
      const nodeById = Object.fromEntries(graph.nodes.map(node => [node.id, node]));
      select('.graph-demo__explanation').textContent = frame.explanation;
      select('.graph-demo__position').textContent = 'Step ' + (index + 1) + ' / ' + frames.length;
      select('#' + uid + '-desc').textContent = frame.explanation;
      previousButton.disabled = index === 0;
      nextButton.disabled = index === frames.length - 1;
      const edgeState = edge => {
        if (type === 'bfs') return frame.edge === edge.id ? 'active' : frame.tree.includes(edge.id) ? 'selected' : '';
        if (type === 'kruskal') return frame.current === edge.id && frame.phase === 'consider' ? 'active' : frame.rejected.includes(edge.id) ? 'rejected' : frame.accepted.includes(edge.id) ? 'selected' : '';
        return frame.path.some(arc => arc.edge === edge.id) ? 'active' : frame.flow[edge.id] > 0 ? 'selected' : '';
      };
      const edgeMarkup = graph.edges.map(edge => {
        const u = nodeById[edge.u];
        const v = nodeById[edge.v];
        const length = Math.hypot(v.x - u.x, v.y - u.y);
        const dx = (v.x - u.x) / length;
        const dy = (v.y - u.y) / length;
        const state = edgeState(edge);
        const label = type === 'kruskal' ? (state === 'rejected' ? '× ' : '') + edge.weight : type === 'flow' ? frame.flow[edge.id] + '/' + edge.capacity : '';
        return '<g class="graph-demo__edge ' + (state ? 'is-' + state : '') + '"><line x1="' + (u.x + dx * 24) + '" y1="' + (u.y + dy * 24) + '" x2="' + (v.x - dx * 28) + '" y2="' + (v.y - dy * 28) + '"' + (graph.directed ? ' marker-end="url(#' + uid + '-arrow)"' : '') + '></line>' + (label ? '<rect class="graph-demo__edge-label-bg" x="' + ((u.x + v.x) / 2 - 20) + '" y="' + ((u.y + v.y) / 2 - 12) + '" width="40" height="24" rx="5"></rect><text class="graph-demo__edge-label" x="' + ((u.x + v.x) / 2) + '" y="' + ((u.y + v.y) / 2 + 5) + '">' + label + '</text>' : '') + '</g>';
      }).join('');
      select('.graph-demo__edges').innerHTML = edgeMarkup;
      select('.graph-demo__nodes').innerHTML = graph.nodes.map(node => {
        let state = '';
        let annotation = '';
        if (type === 'bfs') {
          state = frame.current === node.id ? 'active' : frame.visited.includes(node.id) ? 'selected' : frame.queue.includes(node.id) ? 'frontier' : '';
          annotation = 'd=' + (frame.distance[node.id] === null ? '∞' : frame.distance[node.id]);
        } else if (type === 'kruskal') {
          const current = graph.edges.find(edge => edge.id === frame.current);
          state = current && (current.u === node.id || current.v === node.id) ? 'active' : frame.accepted.some(id => { const edge = graph.edges.find(item => item.id === id); return edge.u === node.id || edge.v === node.id; }) ? 'selected' : '';
          annotation = 'set ' + frame.component[node.id];
        } else {
          state = frame.path.some(arc => { const edge = graph.edges.find(item => item.id === arc.edge); return edge.u === node.id || edge.v === node.id; }) ? 'active' : frame.cut.includes(node.id) ? 'selected' : '';
          annotation = node.id === 's' ? 'source' : node.id === 't' ? 'sink' : '';
        }
        return '<g class="graph-demo__node ' + (state ? 'is-' + state : '') + '"><circle cx="' + node.x + '" cy="' + node.y + '" r="23"></circle><text class="graph-demo__node-label" x="' + node.x + '" y="' + (node.y + 6) + '">' + node.id + '</text><text class="graph-demo__node-detail" x="' + node.x + '" y="' + (node.y + 44) + '">' + escape(annotation) + '</text></g>';
      }).join('');
      let metrics;
      let markup;
      if (type === 'bfs') {
        metrics = 'Queue (front → back): ' + (frame.queue.length ? frame.queue.join(' → ') : 'empty') + ' · Finished: ' + (frame.visited.join(', ') || 'none');
        markup = table(['Vertex', 'Distance from A', 'Parent', 'State'], graph.nodes.map(node => [node.id, frame.distance[node.id] === null ? '∞' : frame.distance[node.id], frame.parent[node.id] || '—', frame.current === node.id ? 'Processing' : frame.visited.includes(node.id) ? 'Finished' : frame.queue.includes(node.id) ? 'Queued' : 'Undiscovered']), 'BFS distance and discovery state');
      } else if (type === 'kruskal') {
        metrics = 'Total weight: ' + frame.total + ' · Components: ' + frame.groups.map(group => '{' + group.join(', ') + '}').join(' ');
        markup = table(['Edge', 'Weight', 'Decision'], graph.edges.map(edge => [edge.u + '–' + edge.v, edge.weight, frame.accepted.includes(edge.id) ? 'Selected' : frame.rejected.includes(edge.id) ? 'Rejected: cycle' : frame.current === edge.id ? 'Considering' : 'Not yet examined']), 'Edges in increasing weight order');
      } else {
        metrics = 'Flow value: ' + frame.total + (frame.path.length ? ' · Path bottleneck: ' + frame.amount : '') + (frame.cut.length ? ' · Minimum cut capacity: 5' : '');
        markup = table(['Edge', 'Flow / capacity', 'Forward residual', 'Reverse residual'], graph.edges.map(edge => [edge.u + ' → ' + edge.v, frame.flow[edge.id] + ' / ' + edge.capacity, edge.capacity - frame.flow[edge.id], frame.flow[edge.id]]), 'Flow and residual capacity for each original edge');
      }
      select('.graph-demo__metrics').textContent = metrics;
      select('.graph-demo__table').innerHTML = markup;
      svg.dataset.step = String(index);
    }
    const controller = { pause };
    controllers.push(controller);
    for (let disclosure = container.parentElement; disclosure; disclosure = disclosure.parentElement) {
      if (disclosure.tagName === 'DETAILS') {
        const panel = disclosure;
        panel.addEventListener('toggle', () => { if (!panel.open) pause(); });
      }
    }
    previousButton.addEventListener('click', () => { pause(); index = Math.max(0, index - 1); render(); });
    nextButton.addEventListener('click', () => { pause(); index = Math.min(frames.length - 1, index + 1); render(); });
    playButton.addEventListener('click', () => { if (timer === null) play(); else pause(); });
    select('[data-action="reset"]').addEventListener('click', () => { pause(); index = 0; render(); });
    select('select').addEventListener('change', event => { delay = Number(event.target.value); if (timer !== null) { pause(); play(); } });
    playButton.setAttribute('aria-label', 'Play animation');
    render();
  }

  function initialize(root) {
    const scope = root && root.querySelectorAll ? root : document;
    if (scope.matches && scope.matches('[data-graph-demo]')) mount(scope);
    scope.querySelectorAll('[data-graph-demo]').forEach(mount);
  }
  window.initializeGraphDemos = initialize;
  document.addEventListener('visibilitychange', () => { if (document.hidden) controllers.forEach(controller => controller.pause()); });
  window.addEventListener('course-visual-start', event => controllers.forEach(controller => {
    if (controller !== event.detail) controller.pause();
  }));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
