#!/usr/bin/env node
'use strict';

// Run with: node tests/test-graph-demos.cjs
// These checks exercise algorithm invariants independently of the browser renderer.
const assert = require('node:assert/strict');
const test = require('node:test');
const { graphs, bfsFrames, kruskalFrames, flowFrames } = require('../graph-demos.js');

function forestComponents(graph, edgeIds) {
  const components = graph.nodes.map(node => new Set([node.id]));
  for (const id of edgeIds) {
    const edge = graph.edges.find(candidate => candidate.id === id);
    assert.ok(edge, 'Every selected edge belongs to the graph');
    const left = components.find(group => group.has(edge.u));
    const right = components.find(group => group.has(edge.v));
    assert.notEqual(left, right, 'Selected edges must not form a cycle');
    for (const vertex of right) left.add(vertex);
    components.splice(components.indexOf(right), 1);
  }
  return components;
}

function normalizeGroups(groups) {
  return groups.map(group => [...group].sort().join(',')).sort();
}

function subsets(items, size) {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  return subsets(rest, size - 1).map(group => [first, ...group]).concat(subsets(rest, size));
}

test('BFS maintains FIFO distance layers and valid shortest-path parents', () => {
  const graph = graphs.bfs;
  const frames = bfsFrames();
  assert.ok(frames.length > graph.nodes.length, 'The walkthrough includes intermediate algorithm states');
  for (const [index, frame] of frames.entries()) {
    assert.equal(new Set(frame.queue).size, frame.queue.length, 'A vertex is queued at most once');
    assert.equal(new Set(frame.visited).size, frame.visited.length, 'A vertex finishes at most once');
    assert.equal(frame.distance.A, 0, 'The source stays at distance zero');
    assert.equal(frame.parent.A, null, 'The source has no parent');
    for (let i = 1; i < frame.queue.length; i++) {
      assert.ok(frame.distance[frame.queue[i - 1]] <= frame.distance[frame.queue[i]], 'Queue distances are nondecreasing');
    }
    for (const vertex of frame.queue) {
      assert.notEqual(frame.distance[vertex], null, 'Queued vertices are discovered');
      assert.ok(!frame.visited.includes(vertex), 'Finished vertices never return to the queue');
      assert.notEqual(frame.current, vertex, 'The current vertex has already left the queue');
    }
    for (const node of graph.nodes) {
      const vertex = node.id;
      const parent = frame.parent[vertex];
      if (index > 0 && frames[index - 1].distance[vertex] !== null) {
        assert.equal(frame.distance[vertex], frames[index - 1].distance[vertex], 'First discovery fixes a vertex’s distance');
      }
      if (parent !== null) {
        assert.ok(graph.edges.some(edge => (edge.u === parent && edge.v === vertex) || (edge.v === parent && edge.u === vertex)), 'A parent is joined to its child by a graph edge');
        assert.equal(frame.distance[vertex], frame.distance[parent] + 1, 'Parent distance is exactly one less');
      } else if (vertex !== 'A') {
        assert.equal(frame.distance[vertex], null, 'Every discovered non-source vertex has a parent');
      }
    }
    forestComponents(graph, frame.tree);
  }
  const final = frames.at(-1);
  assert.deepEqual(final.distance, { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 });
  assert.equal(final.queue.length, 0);
  assert.deepEqual([...final.visited].sort(), graph.nodes.map(node => node.id).sort());
  assert.equal(final.tree.length, graph.nodes.length - 1);
  for (const edge of graph.edges) {
    assert.ok(Math.abs(final.distance[edge.u] - final.distance[edge.v]) <= 1, 'No graph edge can bypass a BFS distance layer');
  }
});

test('Kruskal maintains a forest, consistent components and the minimum total weight', () => {
  const graph = graphs.kruskal;
  const frames = kruskalFrames();
  for (const [index, frame] of frames.entries()) {
    assert.equal(new Set(frame.accepted).size, frame.accepted.length, 'Edges are accepted once');
    assert.equal(new Set(frame.rejected).size, frame.rejected.length, 'Edges are rejected once');
    assert.ok(frame.accepted.every(id => !frame.rejected.includes(id)), 'An edge cannot be both selected and rejected');
    const components = forestComponents(graph, frame.accepted);
    assert.equal(components.length, graph.nodes.length - frame.accepted.length, 'Each accepted edge merges exactly two components');
    assert.deepEqual(normalizeGroups(frame.groups), normalizeGroups(components), 'Displayed components match connectivity of selected edges');
    assert.equal(frame.total, frame.accepted.reduce((sum, id) => sum + graph.edges.find(edge => edge.id === id).weight, 0), 'Displayed total equals selected-edge weight');
    for (const id of frame.rejected) {
      const edge = graph.edges.find(candidate => candidate.id === id);
      assert.ok(components.some(group => group.has(edge.u) && group.has(edge.v)), 'Rejected edges would create a cycle');
    }
    if (index > 0) {
      assert.ok(frames[index - 1].accepted.every(id => frame.accepted.includes(id)), 'Selected edges stay selected');
      assert.ok(frames[index - 1].rejected.every(id => frame.rejected.includes(id)), 'Rejected edges stay rejected');
    }
  }
  const final = frames.at(-1);
  assert.equal(final.groups.length, 1, 'The final forest spans the connected graph');
  assert.equal(final.accepted.length, graph.nodes.length - 1);
  // Exhaustively compare this small example with every possible spanning tree.
  const treeWeights = subsets(graph.edges, graph.nodes.length - 1).flatMap(edges => {
    try {
      return forestComponents(graph, edges.map(edge => edge.id)).length === 1
        ? [edges.reduce((sum, edge) => sum + edge.weight, 0)] : [];
    } catch (error) {
      if (error.code !== 'ERR_ASSERTION') throw error;
      return []; // This candidate contains a cycle.
    }
  });
  assert.equal(final.total, Math.min(...treeWeights), 'The final weight is globally minimum');
  assert.equal(final.total, 12);
});

test('Every flow state is feasible and final value equals a minimum cut', () => {
  const graph = graphs.flow;
  const frames = flowFrames();
  const balance = (vertex, flow) => graph.edges.reduce((net, edge) => net + (edge.u === vertex ? flow[edge.id] : 0) - (edge.v === vertex ? flow[edge.id] : 0), 0);
  for (const [index, frame] of frames.entries()) {
    for (const edge of graph.edges) {
      assert.ok(Number.isFinite(frame.flow[edge.id]), 'Every edge has a numeric flow');
      assert.ok(frame.flow[edge.id] >= 0 && frame.flow[edge.id] <= edge.capacity, 'Flow respects edge capacity');
    }
    for (const node of graph.nodes.filter(node => node.id !== 's' && node.id !== 't')) {
      assert.equal(balance(node.id, frame.flow), 0, 'Flow is conserved at every internal vertex');
    }
    assert.equal(balance('s', frame.flow), frame.total, 'Source net outflow equals the displayed value');
    assert.equal(balance('t', frame.flow) + frame.total, 0, 'Sink net inflow equals the displayed value');
    if (index > 0) assert.ok(frame.total >= frames[index - 1].total, 'Augmentation never decreases total flow');
  }
  const final = frames.at(-1);
  const reachable = new Set(['s']);
  const queue = ['s'];
  while (queue.length) {
    const current = queue.shift();
    for (const edge of graph.edges) {
      let neighbor = null;
      if (edge.u === current && edge.capacity - final.flow[edge.id] > 0) neighbor = edge.v;
      if (edge.v === current && final.flow[edge.id] > 0) neighbor = edge.u;
      if (neighbor !== null && !reachable.has(neighbor)) {
        reachable.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  assert.ok(!reachable.has('t'), 'No augmenting path remains in the residual graph');
  assert.deepEqual([...final.cut].sort(), [...reachable].sort(), 'The displayed cut is the residual reachable set');
  const cutCapacity = sourceSide => graph.edges.reduce((sum, edge) => sum + (sourceSide.has(edge.u) && !sourceSide.has(edge.v) ? edge.capacity : 0), 0);
  assert.equal(final.total, cutCapacity(reachable), 'Flow value equals the reported cut capacity');
  const internal = graph.nodes.map(node => node.id).filter(vertex => vertex !== 's' && vertex !== 't');
  const allCutCapacities = Array.from({ length: 2 ** internal.length }, (_, mask) => cutCapacity(new Set(['s', ...internal.filter((vertex, bit) => mask & (1 << bit))])));
  assert.equal(final.total, Math.min(...allCutCapacities), 'Exhaustive cut enumeration independently certifies optimality');
  assert.equal(final.total, 5);
});
