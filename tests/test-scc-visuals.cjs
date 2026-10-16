#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');
const fs = require('node:fs');
const { scc } = require('../visuals/scc.js');

function reachability(graph) {
  const reachable = {};
  for (const { id } of graph.nodes) {
    const seen = new Set([id]);
    const queue = [id];
    for (let index = 0; index < queue.length; index++) {
      for (const edge of graph.edges.filter(edge => edge.u === queue[index])) {
        if (!seen.has(edge.v)) { seen.add(edge.v); queue.push(edge.v); }
      }
    }
    reachable[id] = seen;
  }
  return reachable;
}

test('SCC partition equals mutual reachability and condensation is a DAG', () => {
  const frames = scc.makeFrames();
  const final = frames.at(-1);
  const reachable = reachability(final.graph);
  assert.equal(final.phase, 'condensation');
  assert.equal(final.componentCount, 3);
  assert.deepEqual(final.groups.map(group => group.members), [['F', 'G'], ['D', 'E'], ['A', 'B', 'C']]);
  for (const u of final.graph.nodes) for (const v of final.graph.nodes) {
    assert.equal(final.component[u.id] === final.component[v.id], reachable[u.id].has(v.id) && reachable[v.id].has(u.id), 'Vertices share a component exactly when mutually reachable');
  }
  const expectedArcs = new Set(final.graph.edges
    .filter(edge => final.component[edge.u] !== final.component[edge.v])
    .map(edge => final.component[edge.u] + ':' + final.component[edge.v]));
  assert.deepEqual(new Set(final.condensationEdges.map(edge => edge.u + ':' + edge.v)), expectedArcs, 'Condensation retains exactly the inter-component adjacencies');
  const indegree = Object.fromEntries(final.groups.map(group => [group.id, 0]));
  final.condensationEdges.forEach(edge => indegree[edge.v]++);
  const queue = final.groups.filter(group => indegree[group.id] === 0).map(group => group.id);
  const sorted = [];
  while (queue.length) {
    const current = queue.shift();
    sorted.push(current);
    for (const edge of final.condensationEdges.filter(edge => edge.u === current)) if (--indegree[edge.v] === 0) queue.push(edge.v);
  }
  assert.equal(sorted.length, final.componentCount, 'A topological ordering covers every contracted vertex');
});

test('First pass uses reversed edges and second-pass roots follow decreasing reversed postorder', () => {
  const frames = scc.makeFrames();
  const graph = frames[0].graph;
  // Independent reference DFS constructs G^R explicitly instead of filtering incoming edges.
  const reverse = Object.fromEntries(graph.nodes.map(node => [node.id, []]));
  graph.edges.forEach(edge => reverse[edge.v].push(edge.u));
  Object.values(reverse).forEach(list => list.sort());
  const visited = new Set();
  const finish = [];
  function visit(u) {
    visited.add(u);
    for (const v of reverse[u]) if (!visited.has(v)) visit(v);
    finish.push(u);
  }
  graph.nodes.map(node => node.id).sort().forEach(u => { if (!visited.has(u)) visit(u); });
  const final = frames.at(-1);
  assert.deepEqual(final.finishOrder, finish);
  assert.deepEqual(final.decreasingPostorder, finish.toReversed ? finish.toReversed() : [...finish].reverse());
  assert.deepEqual(final.componentRoots, ['F', 'D', 'A']);
  const rootsInOrder = final.decreasingPostorder.filter(u => final.componentRoots.includes(u));
  assert.deepEqual(final.componentRoots, rootsInOrder);
  for (const frame of frames) {
    if (frame.phase === 'first') {
      assert.equal(frame.reversed, true);
      assert.ok(Object.values(frame.component).every(value => value === null));
      if (frame.currentEdge) {
        const edge = graph.edges.find(edge => edge.id === frame.currentEdge);
        assert.equal(frame.current, edge.v, 'The current edge leaves the current vertex in G^R');
      }
    } else {
      assert.equal(frame.reversed, false);
      assert.equal(frame.finishOrder.length, graph.nodes.length);
      if (frame.currentEdge) {
        const edge = graph.edges.find(edge => edge.id === frame.currentEdge);
        assert.equal(frame.current, edge.u, 'The current edge leaves the current vertex in G');
      }
    }
    assert.equal(new Set(frame.stack).size, frame.stack.length);
    assert.equal(new Set(frame.finishOrder).size, frame.finishOrder.length);
    for (const [index, u] of frame.finishOrder.entries()) assert.equal(frame.finishNumber[u], index + 1);
    for (const u of frame.stack) assert.equal(frame.phase === 'first' ? frame.firstState[u] : frame.component[u] !== null, frame.phase === 'first' ? 'active' : true);
  }
});

test('Snapshots are independent, deterministic and render accessible SVG without IDs', () => {
  const frames = scc.makeFrames();
  assert.deepEqual(frames, scc.makeFrames());
  assert.ok(frames.length > 30);
  const preserved = JSON.stringify(frames.at(-1));
  frames[0].graph.nodes[0].id = 'Changed';
  frames[0].firstState.A = 'changed';
  assert.equal(JSON.stringify(frames.at(-1)), preserved);
  const clean = scc.makeFrames();
  for (const frame of clean) {
    assert.ok(frame.explanation && frame.stageLabel);
    const before = JSON.stringify(frame);
    const html = scc.render(frame);
    assert.match(html, /<svg[^>]+role="img"[^>]+aria-label="[^"]+"/);
    assert.match(html, /<caption>/);
    assert.match(html, /<th scope="col">/);
    assert.doesNotMatch(html, /\sid=/);
    assert.doesNotMatch(html, /\b(?:NaN|Infinity|undefined)\b/);
    assert.equal(JSON.stringify(frame), before, 'Rendering never mutates a snapshot');
  }
  const reversedFrame = clean.find(frame => frame.currentEdge === 'AB');
  assert.match(scc.render(reversedFrame), /<title>B → A, current edge<\/title>/);
  const originalFrame = clean.find(frame => frame.phase === 'second' && frame.currentEdge === 'AB');
  assert.match(scc.render(originalFrame), /<title>A → B, current edge<\/title>/);
  assert.equal(clean.at(-1).current, null);
  assert.equal(clean.at(-1).currentEdge, null);
  assert.deepEqual(clean.at(-1).stack, []);
});

test('Browser registration preserves other CourseVisuals modules', () => {
  const existing = { retained: true };
  const context = { window: { CourseVisuals: existing } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../visuals/scc.js'), 'utf8'), context);
  assert.equal(context.window.CourseVisuals, existing);
  assert.equal(existing.retained, true);
  assert.equal(typeof existing.scc.makeFrames, 'function');
});
