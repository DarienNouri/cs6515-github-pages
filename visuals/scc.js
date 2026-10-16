/* Dependency-free SCC walkthrough: DFS on G^R, then DFS on G. */
(function (root, factory) {
  'use strict';
  const demos = factory();
  if (typeof module === 'object' && module.exports) module.exports = demos;
  else Object.assign(root.CourseVisuals = root.CourseVisuals || {}, demos);
}(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';

  const clone = value => JSON.parse(JSON.stringify(value));
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const graph = {
    nodes: [
      { id: 'A', x: 65, y: 80 }, { id: 'B', x: 145, y: 230 }, { id: 'C', x: 225, y: 80 },
      { id: 'D', x: 365, y: 80 }, { id: 'E', x: 365, y: 230 },
      { id: 'F', x: 535, y: 80 }, { id: 'G', x: 535, y: 230 }
    ],
    edges: [
      ['A', 'B'], ['B', 'C'], ['C', 'A'], ['C', 'D'], ['D', 'E'],
      ['E', 'D'], ['B', 'F'], ['E', 'F'], ['F', 'G'], ['G', 'F']
    ].map(([u, v]) => ({ id: u + v, u, v }))
  };

  function makeFrames() {
    const frames = [];
    const firstState = Object.fromEntries(graph.nodes.map(node => [node.id, 'unseen']));
    const finishNumber = Object.fromEntries(graph.nodes.map(node => [node.id, null]));
    const component = Object.fromEntries(graph.nodes.map(node => [node.id, null]));
    const finishOrder = [];
    const stack = [];
    const firstTreeEdges = [];
    const secondTreeEdges = [];
    const componentRoots = [];
    let phase = 'first';
    let decreasingPostorder = [];
    let componentCount = 0;
    const neighbors = (u, reversed) => graph.edges
      .filter(edge => (reversed ? edge.v : edge.u) === u)
      .map(edge => ({ edge, v: reversed ? edge.u : edge.v }))
      .sort((a, b) => a.v.localeCompare(b.v));
    function save(explanation, current, currentEdge) {
      const groups = Array.from({ length: componentCount }, (_, index) => ({
        id: index + 1,
        members: graph.nodes.filter(node => component[node.id] === index + 1).map(node => node.id)
      }));
      const condensationEdges = [];
      if (phase === 'condensation') {
        for (const edge of graph.edges) {
          const u = component[edge.u];
          const v = component[edge.v];
          if (u !== v && !condensationEdges.some(arc => arc.u === u && arc.v === v)) {
            condensationEdges.push({ id: 'C' + u + '-C' + v, u, v });
          }
        }
      }
      frames.push(clone({
        explanation, phase, stageLabel: phase === 'first' ? '1. DFS on the reversed graph G^R' : phase === 'second' ? '2. DFS on the original graph G' : '3. Contract each SCC into one vertex',
        graph, reversed: phase === 'first', firstState, finishNumber, finishOrder, decreasingPostorder,
        stack, firstTreeEdges, secondTreeEdges, component, componentRoots, componentCount, groups,
        current: current || null, currentEdge: currentEdge || null, condensationEdges
      }));
    }

    save('Reverse every edge of G to obtain G^R. First run DFS on G^R, choosing new roots and neighbors alphabetically. Record a vertex only when its recursive call finishes.');
    function reverseDFS(u) {
      firstState[u] = 'active';
      stack.push(u);
      save('Discover ' + u + ' in G^R. The DFS call stack now contains ' + stack.join(' → ') + '.', u);
      for (const { edge, v } of neighbors(u, true)) {
        if (firstState[v] === 'unseen') {
          save('Follow ' + u + ' → ' + v + ' in G^R (the reverse of ' + v + ' → ' + u + ' in G). ' + v + ' is undiscovered, so recurse.', u, edge.id);
          firstTreeEdges.push(edge.id);
          reverseDFS(v);
        } else {
          save('Inspect ' + u + ' → ' + v + ' in G^R. ' + v + ' is ' + (firstState[v] === 'active' ? 'already on the DFS stack' : 'already finished') + '; do not revisit it.', u, edge.id);
        }
      }
      stack.pop();
      firstState[u] = 'finished';
      finishOrder.push(u);
      finishNumber[u] = finishOrder.length;
      save('Finish ' + u + ' after all its reversed outgoing edges have been examined. Append it to the finish list at position ' + finishNumber[u] + '.', u);
    }
    for (const node of graph.nodes) if (firstState[node.id] === 'unseen') reverseDFS(node.id);
    decreasingPostorder = finishOrder.slice().reverse();
    save('The first pass is complete. Read the finish list backwards: ' + decreasingPostorder.join(' → ') + '. This is decreasing postorder of G^R, the root order for the second pass.');

    phase = 'second';
    save('Restore the original edge directions. Run DFS on G, taking roots in order ' + decreasingPostorder.join(' → ') + '. Skip vertices already assigned to a component. Each new DFS tree identifies one SCC.');
    function originalDFS(u) {
      component[u] = componentCount;
      stack.push(u);
      save('Assign ' + u + ' to C' + componentCount + '. Search only through vertices that have not yet been assigned to an SCC.', u);
      for (const { edge, v } of neighbors(u, false)) {
        if (component[v] === null) {
          save('Follow original edge ' + u + ' → ' + v + '. ' + v + ' is unassigned, so include it in this DFS tree.', u, edge.id);
          secondTreeEdges.push(edge.id);
          originalDFS(v);
        } else {
          save('Inspect original edge ' + u + ' → ' + v + '. ' + v + ' already belongs to C' + component[v] + ', so this DFS does not revisit it.', u, edge.id);
        }
      }
      stack.pop();
      save('Finish the second-pass call at ' + u + '. Its component remains C' + component[u] + '.', u);
    }
    for (const u of decreasingPostorder) {
      if (component[u] !== null) {
        save('Next in decreasing reverse-graph postorder is ' + u + '. It already belongs to C' + component[u] + '; skip it.');
        continue;
      }
      componentCount += 1;
      componentRoots.push(u);
      save('Start a new DFS tree at ' + u + ': component C' + componentCount + '. This ordering picks a sink SCC among the components that are still unassigned.', u);
      originalDFS(u);
      const members = graph.nodes.filter(node => component[node.id] === componentCount).map(node => node.id);
      save('Component C' + componentCount + ' is complete: {' + members.join(', ') + '}. Its vertices are mutually reachable. Edges to previously assigned components do not merge those components.');
    }
    save('All vertices are assigned: C1 = {F, G}, C2 = {D, E}, C3 = {A, B, C}. Each vertex and edge is examined a constant number of times across the two passes: O(|V| + |E|).');
    phase = 'condensation';
    save('Contract each SCC into a single vertex and remove internal edges. C3 → C2 comes from C → D; C2 → C1 comes from E → F; C3 → C1 comes from B → F. The resulting condensation graph is a DAG: any directed cycle between components would make them mutually reachable and therefore one SCC.');
    return frames;
  }

  function arrow(u, v, bend, classes, label, edgeId, padding) {
    const radius = padding || 29;
    const dx = v.x - u.x;
    const dy = v.y - u.y;
    const length = Math.hypot(dx, dy);
    const control = { x: (u.x + v.x) / 2 - dy / length * bend, y: (u.y + v.y) / 2 + dx / length * bend };
    const startLength = Math.hypot(control.x - u.x, control.y - u.y);
    const endLength = Math.hypot(v.x - control.x, v.y - control.y);
    const start = { x: u.x + (control.x - u.x) / startLength * radius, y: u.y + (control.y - u.y) / startLength * radius };
    const end = { x: v.x - (v.x - control.x) / endLength * radius, y: v.y - (v.y - control.y) / endLength * radius };
    const tx = (v.x - control.x) / endLength;
    const ty = (v.y - control.y) / endLength;
    const points = [
      [end.x - tx * 10 - ty * 5, end.y - ty * 10 + tx * 5],
      [end.x, end.y],
      [end.x - tx * 10 + ty * 5, end.y - ty * 10 - tx * 5]
    ].map(point => point.join(',')).join(' ');
    return '<g class="av-scc-edge ' + classes + '" data-edge="' + escape(edgeId) + '"><title>' + escape(label) + '</title><path d="M ' + start.x + ' ' + start.y + ' Q ' + control.x + ' ' + control.y + ' ' + end.x + ' ' + end.y + '"/><polyline points="' + points + '"/></g>';
  }

  function renderGraph(frame) {
    const nodes = Object.fromEntries(frame.graph.nodes.map(node => [node.id, node]));
    const directedEdges = frame.graph.edges.map(edge => ({ id: edge.id, u: frame.reversed ? edge.v : edge.u, v: frame.reversed ? edge.u : edge.v }));
    const title = frame.reversed ? 'Reversed graph G^R' : 'Original graph G';
    const accessibleLabel = title + '. Directed edges: ' + directedEdges.map(edge => edge.u + ' to ' + edge.v).join(', ') + '.' + (frame.current ? ' Current vertex: ' + frame.current + '.' : '');
    let svg = '<svg viewBox="0 0 610 315" role="img" aria-label="' + escape(accessibleLabel) + '"><title>' + escape(title) + '</title>';
    for (const edge of directedEdges) {
      const reciprocal = directedEdges.some(other => other.u === edge.v && other.v === edge.u);
      const trees = frame.reversed ? frame.firstTreeEdges : frame.secondTreeEdges;
      const classes = (trees.includes(edge.id) ? 'av-scc-edge-tree ' : '') + (frame.currentEdge === edge.id ? 'av-scc-edge-current' : '');
      svg += arrow(nodes[edge.u], nodes[edge.v], reciprocal ? 35 : 0, classes, edge.u + ' → ' + edge.v + (frame.currentEdge === edge.id ? ', current edge' : ''), edge.id);
    }
    for (const node of frame.graph.nodes) {
      const assigned = frame.component[node.id];
      const status = frame.phase === 'first' ? frame.firstState[node.id] : assigned ? 'C' + assigned : 'unassigned';
      const visualState = frame.phase === 'first' ? frame.firstState[node.id] : assigned ? 'c' + assigned : 'unseen';
      const classes = 'av-scc-node av-scc-node-' + visualState + (frame.current === node.id ? ' av-scc-node-current' : '');
      svg += '<g class="' + classes + '"><title>' + escape(node.id + ': ' + status) + '</title><circle cx="' + node.x + '" cy="' + node.y + '" r="24"/><text class="av-scc-label" x="' + node.x + '" y="' + (node.y + 7) + '">' + node.id + '</text><text class="av-scc-detail" x="' + node.x + '" y="' + (node.y + 45) + '">' + escape(status) + '</text></g>';
    }
    return svg + '</svg>';
  }

  function renderCondensation(frame) {
    const positions = Object.fromEntries(frame.groups.map((group, index) => [group.id, { x: 510 - index * 205, y: 130 }]));
    const label = 'Condensation DAG. ' + frame.groups.map(group => 'C' + group.id + ' contains ' + group.members.join(', ')).join('. ') + '. Edges: ' + frame.condensationEdges.map(edge => 'C' + edge.u + ' to C' + edge.v).join(', ') + '.';
    let svg = '<svg viewBox="0 0 610 260" role="img" aria-label="' + escape(label) + '"><title>Condensation DAG</title>';
    for (const edge of frame.condensationEdges) {
      svg += arrow(positions[edge.u], positions[edge.v], Math.abs(edge.u - edge.v) > 1 ? -140 : 0, 'av-scc-edge-condensed', 'C' + edge.u + ' → C' + edge.v, edge.id, 51);
    }
    for (const group of frame.groups) {
      const position = positions[group.id];
      svg += '<g class="av-scc-node av-scc-node-c' + group.id + '"><circle cx="' + position.x + '" cy="' + position.y + '" r="47"/><text class="av-scc-label" x="' + position.x + '" y="' + (position.y - 3) + '">C' + group.id + '</text><text class="av-scc-members" x="' + position.x + '" y="' + (position.y + 20) + '">' + group.members.join(', ') + '</text></g>';
    }
    return svg + '</svg>';
  }

  function render(frame) {
    const row = (label, value) => '<div><dt>' + label + '</dt><dd>' + escape(value) + '</dd></div>';
    const status = frame.phase === 'first' ? 'First-pass status' : 'Component';
    let html = '<div class="av-scc"><p class="av-scc-graph-caption">' + (frame.phase === 'condensation' ? 'Condensation graph: one vertex per SCC' : frame.reversed ? 'G^R · every arrow is reversed' : 'G · original arrow directions') + '</p><div class="av-scc-canvas">' + (frame.phase === 'condensation' ? renderCondensation(frame) : renderGraph(frame)) + '</div>';
    html += '<p class="av-scc-key">' + (frame.phase === 'condensation' ? 'Each labeled circle is a complete component. Arrows show edges between components.' : 'Gold outline: current vertex or edge. Dashed edge: DFS tree edge. Node labels also show each vertex’s status.') + '</p>';
    html += '<dl class="av-scc-state">' + row('Finish list (first finished → last)', frame.finishOrder.length ? frame.finishOrder.join(' → ') : 'Empty') + row('Second-pass root order (last finished → first)', frame.decreasingPostorder.length ? frame.decreasingPostorder.join(' → ') : 'Available after the first pass') + row('DFS call stack (root → current)', frame.stack.length ? frame.stack.join(' → ') : 'Empty') + '</dl>';
    html += '<div class="av-scc-table-wrap"><table class="av-scc-table"><caption>Vertex state at this step. A larger finish number means a later finish in G^R.</caption><thead><tr><th scope="col">Vertex</th><th scope="col">Finish number in G^R</th><th scope="col">' + status + '</th></tr></thead><tbody>';
    for (const node of frame.graph.nodes) {
      const value = frame.phase === 'first' ? frame.firstState[node.id] : frame.component[node.id] ? 'C' + frame.component[node.id] : 'Unassigned';
      html += '<tr' + (frame.current === node.id ? ' class="av-scc-row-current"' : '') + '><th scope="row">' + node.id + '</th><td>' + (frame.finishNumber[node.id] || '—') + '</td><td>' + escape(value) + '</td></tr>';
    }
    html += '</tbody></table></div>';
    if (frame.phase === 'condensation') html += '<p class="av-scc-result">C3 = {A, B, C} → C2 = {D, E} → C1 = {F, G}, with an additional C3 → C1 edge. No directed cycle remains.</p>';
    return html + '</div>';
  }

  return {
    scc: {
      title: 'Strongly connected components: two DFS passes',
      description: 'Reverse the arrows, record DFS finishing order, then discover the SCCs in the original graph and contract them into a DAG.',
      makeFrames,
      render
    }
  };
}));
