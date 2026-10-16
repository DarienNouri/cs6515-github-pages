#!/usr/bin/env node
'use strict';

// node --test tests/test-dp-visuals.cjs
const assert = require('node:assert/strict');
const test = require('node:test');
const demos = require('../visuals/dp.js');

function subsequences(string) {
  let result = [''];
  for (const char of string) result = result.concat(result.map(prefix => prefix + char));
  return new Set(result);
}

function isSubsequence(candidate, string) {
  let index = 0;
  for (const char of string) if (candidate[index] === char) index++;
  return index === candidate.length;
}

function bruteLcs(a, b) {
  return Math.max(...[...subsequences(a)].filter(sequence => isSubsequence(sequence, b)).map(sequence => sequence.length));
}

function bruteKnapsack(items, capacity) {
  let best = 0;
  for (let mask = 0; mask < 2 ** items.length; mask++) {
    const chosen = items.filter((_, bit) => mask & (1 << bit));
    const weight = chosen.reduce((sum, item) => sum + item.weight, 0);
    if (weight <= capacity) best = Math.max(best, chosen.reduce((sum, item) => sum + item.value, 0));
  }
  return best;
}

for (const preset of demos.lcs.presets) {
  test(`LCS ${preset.value}: each computed prefix agrees with exhaustive subsequence search`, () => {
    const frames = demos.lcs.makeFrames(preset.value);
    const final = frames.at(-1);
    const oracle = Array.from({ length: final.a.length + 1 }, (_, i) => Array.from({ length: final.b.length + 1 }, (_, j) => bruteLcs(final.a.slice(0, i), final.b.slice(0, j))));
    assert.ok(frames.some(frame => frame.stage === 'fill'));
    assert.ok(frames.some(frame => frame.stage === 'traceback'));
    for (const [index, frame] of frames.entries()) {
      for (let i = 0; i < frame.table.length; i++) {
        for (let j = 0; j < frame.table[i].length; j++) {
          if (frame.table[i][j] !== null) {
            assert.equal(frame.table[i][j], oracle[i][j], `Prefix pair [${i},${j}] is optimal`);
            if (index && frames[index - 1].table[i][j] !== null) assert.equal(frame.table[i][j], frames[index - 1].table[i][j], 'Computed entries never change');
          }
        }
      }
      for (const dependency of frame.dependencies) assert.notEqual(frame.table[dependency.i][dependency.j], null, 'Every dependency is already computed');
      assert.equal(frame.sequence.length, frame.matches.length);
      assert.equal(frame.sequence, frame.matches.map(match => match.char).join(''));
      for (const [pairIndex, pair] of frame.matches.entries()) {
        assert.equal(frame.a[pair.i - 1], pair.char);
        assert.equal(frame.b[pair.j - 1], pair.char);
        if (pairIndex) {
          assert.ok(frame.matches[pairIndex - 1].i < pair.i, 'Selected X positions are strictly increasing');
          assert.ok(frame.matches[pairIndex - 1].j < pair.j, 'Selected Y positions are strictly increasing');
        }
      }
      for (let step = 1; step < frame.path.length; step++) {
        const [i, j] = frame.path[step - 1];
        const [nextI, nextJ] = frame.path[step];
        assert.ok((nextI === i - 1 && nextJ === j) || (nextI === i && nextJ === j - 1) || (nextI === i - 1 && nextJ === j - 1), 'Traceback moves only up, left, or diagonally up-left');
      }
    }
    assert.equal(final.stage, 'done');
    assert.ok(isSubsequence(final.sequence, final.a));
    assert.ok(isSubsequence(final.sequence, final.b));
    assert.equal(final.sequence.length, bruteLcs(final.a, final.b), 'Recovered sequence has globally maximum length');
    assert.deepEqual(demos.lcs.makeFrames(preset.value), frames, 'Tie choices and frame order are deterministic');
    assert.equal(frames[0].table[1][1], null, 'Later writes do not mutate earlier frames');
  });
}

for (const preset of demos.knapsack.presets) {
  test(`Knapsack ${preset.value}: all prefixes, capacity states, and selected items are independently optimal`, () => {
    const frames = demos.knapsack.makeFrames(preset.value);
    const final = frames.at(-1);
    for (const [index, frame] of frames.entries()) {
      for (let i = 0; i < frame.table.length; i++) {
        for (let c = 0; c <= frame.capacity; c++) {
          if (frame.table[i][c] !== null) {
            assert.equal(frame.table[i][c], bruteKnapsack(frame.items.slice(0, i), c), `First ${i} items, capacity ${c}`);
            if (index && frames[index - 1].table[i][c] !== null) assert.equal(frame.table[i][c], frames[index - 1].table[i][c], 'Computed entries never change');
          }
        }
      }
      if (frame.stage === 'fill') {
        for (const dependency of frame.dependencies) {
          assert.equal(dependency.i, frame.current[0] - 1, 'Include and exclude both read the previous row, guaranteeing 0/1 use');
          assert.notEqual(frame.table[dependency.i][dependency.j], null);
        }
        if (frame.candidate.fits) assert.equal(frame.candidate.include, frame.items[frame.candidate.itemIndex].value + frame.candidate.previous);
      }
      assert.equal(new Set(frame.selected).size, frame.selected.length, 'No item is selected more than once');
      const selected = frame.items.filter(item => frame.selected.includes(item.id));
      assert.ok(selected.reduce((sum, item) => sum + item.weight, 0) <= frame.capacity, 'Every partial traceback selection is feasible');
      for (let step = 1; step < frame.path.length; step++) {
        const [i, c] = frame.path[step - 1];
        const [nextI, nextC] = frame.path[step];
        assert.equal(nextI, i - 1, 'Traceback visits each item at most once');
        assert.ok(nextC === c || nextC === c - frame.items[i - 1].weight, 'Remaining capacity changes by exactly the selected item’s weight');
      }
    }
    const selected = final.items.filter(item => final.selected.includes(item.id));
    assert.equal(final.stage, 'done');
    assert.equal(final.totalWeight, selected.reduce((sum, item) => sum + item.weight, 0));
    assert.equal(final.totalValue, selected.reduce((sum, item) => sum + item.value, 0));
    assert.equal(final.totalValue, bruteKnapsack(final.items, final.capacity), 'Selection matches exhaustive subset optimum');
    assert.deepEqual(final.selected, preset.value === 'small' ? ['A', 'B'] : ['A', 'C']);
    assert.deepEqual(demos.knapsack.makeFrames(preset.value), frames);
    assert.equal(frames[0].table[1][1], null, 'Earlier snapshots remain unchanged');
  });
}

test('Both renderers produce accessible, deterministic, self-contained HTML for every frame', () => {
  for (const demo of Object.values(demos)) {
    for (const preset of demo.presets) {
      for (const frame of demo.makeFrames(preset.value)) {
        assert.ok(frame.explanation.length > 20);
        const html = demo.render(frame);
        assert.equal(html, demo.render(frame), 'Rendering has no hidden state');
        assert.match(html, /<table /);
        assert.match(html, /<caption>/);
        assert.match(html, /scope="row"/);
        assert.match(html, /scope="col"/);
        assert.match(html, /tabindex="0"/);
        assert.match(html, /aria-label="[LK]\[/);
        assert.doesNotMatch(html, /\bid=|\bundefined\b|\bNaN\b|<script/);
      }
    }
  }
});

test('Unknown or missing preset uses the small reproducible example', () => {
  for (const demo of Object.values(demos)) {
    assert.deepEqual(demo.makeFrames(), demo.makeFrames('small'));
    assert.deepEqual(demo.makeFrames('unknown'), demo.makeFrames('small'));
  }
});
