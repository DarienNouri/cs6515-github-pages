#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const demos = require('../visuals/divide-conquer.js');
const demo = demos['merge-sort'];
const key = item => `${item.value}:${item.original}`;
const ordered = items => items.every((item, index) => index === 0 || items[index - 1].value <= item.value);

for (const preset of demo.presets) {
  test(`${preset.value}: every merge consumes each source once, preserves sorted prefixes, and keeps ties stable`, () => {
    const frames = demo.makeFrames(preset.value);
    assert.ok(frames.length > 15, 'The trace shows intermediate calls and merge decisions');
    const input = frames[0].input;
    let previousWrites = 0;
    let previousComparisons = 0;
    for (const frame of frames) {
      assert.ok(frame.explanation.length > 20);
      assert.ok(frame.metrics['merge writes'] >= previousWrites);
      assert.ok(frame.metrics.comparisons >= previousComparisons);
      assert.equal(frame.levels.reduce((total, level) => total + level.written, 0), frame.metrics['merge writes']);
      for (const level of frame.levels) {
        assert.equal(level.merges * level.size, input.length, 'Each merging depth covers n items');
        assert.ok(level.written <= level.target);
      }
      for (const node of frame.nodes) {
        assert.deepEqual(node.items.map(key).sort(), node.input.map(key).sort(), 'A call preserves its input multiset');
        if (node.status === 'sorted') assert.ok(ordered(node.items));
      }
      if (frame.merge) {
        const { left, right, i, j, output, selected, compared } = frame.merge;
        assert.ok(ordered(left) && ordered(right), 'Only sorted halves enter a merge');
        assert.ok(i >= 0 && i <= left.length && j >= 0 && j <= right.length);
        assert.equal(output.length, i + j, 'Each pointer advance produces one output item');
        assert.deepEqual(output.map(key).sort(), [...left.slice(0, i), ...right.slice(0, j)].map(key).sort(), 'Output is exactly the consumed source prefixes');
        assert.ok(ordered(output), 'The partial output stays sorted');
        assert.equal(new Set(output.map(key)).size, output.length, 'No input item is copied twice');
        for (let index = 1; index < output.length; index++) {
          if (output[index].value === output[index - 1].value) assert.ok(output[index - 1].original < output[index].original, 'Equal values keep their original positions');
        }
        if (frame.kind === 'take') {
          assert.ok(selected);
          assert.equal(key(output.at(-1)), key(frame.merge[selected.side][selected.index]), 'The displayed pick is the newly appended item');
          assert.equal(frame.metrics['merge writes'], previousWrites + 1);
          assert.equal(frame.metrics.comparisons, previousComparisons + (compared ? 1 : 0));
          if (compared) {
            assert.equal(selected.side, compared.left.value <= compared.right.value ? 'left' : 'right', 'Use the smaller head and favor the left side on ties');
          }
        }
      }
      previousWrites = frame.metrics['merge writes'];
      previousComparisons = frame.metrics.comparisons;
    }
    const final = frames.at(-1);
    assert.equal(final.kind, 'summary');
    assert.deepEqual(final.result, input.slice().sort((a, b) => a.value - b.value || a.original - b.original));
    assert.equal(final.metrics['merge writes'], input.length * Math.log2(input.length));
    assert.ok(final.levels.every(level => level.written === input.length));
    assert.ok(frames.some(frame => frame.merge?.compared && frame.merge.compared.left.value === frame.merge.compared.right.value), 'This example demonstrates an actual tie');
  });

  test(`${preset.value}: frames are deterministic, independent snapshots and every state renders without DOM or repeated IDs`, () => {
    const frames = demo.makeFrames(preset.value);
    assert.deepEqual(frames, demo.makeFrames(preset.value));
    for (const frame of frames) {
      const html = demo.render(frame);
      assert.ok(html.includes('aria-label='));
      assert.ok(html.includes('av-dc-tree'));
      assert.ok(!html.includes('id='), 'Multiple demos can appear on one page without ID collisions');
      assert.ok(!html.includes('undefined'));
      assert.ok(!html.includes('NaN'));
    }
    const firstOriginal = frames[0].input[0].value;
    frames.at(-1).input[0].value = -999;
    assert.equal(frames[0].input[0].value, firstOriginal, 'Later frames never alias earlier data');
    assert.equal(demo.makeFrames(preset.value)[0].input[0].value, firstOriginal, 'Caller mutations do not alter preset values');
  });
}

test('browser export adds this demo without replacing other visualizations', () => {
  const fs = require('node:fs');
  const vm = require('node:vm');
  const sandbox = { window: { CourseVisuals: { existing: { title: 'Existing' } } } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../visuals/divide-conquer.js'), 'utf8'), sandbox);
  assert.equal(sandbox.window.CourseVisuals.existing.title, 'Existing');
  assert.equal(sandbox.window.CourseVisuals['merge-sort'].title, demo.title);
  assert.deepEqual(demo.makeFrames('unknown'), demo.makeFrames(), 'Unknown presets use the documented default');
});
