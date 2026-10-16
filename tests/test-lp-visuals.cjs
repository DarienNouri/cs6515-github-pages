#!/usr/bin/env node
'use strict';

// Run with: node --test tests/test-lp-visuals.cjs
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const demos = require('../visuals/linear-programming.js');
const demo = demos['linear-programming'];
const epsilon = 1e-8;
const equalPoint = (left, right) => Math.abs(left.x - right.x) < epsilon && Math.abs(left.y - right.y) < epsilon;
const satisfies = (point, constraint) => constraint.a * point.x + constraint.b * point.y <= constraint.c + epsilon;
const score = (point, objective) => objective.a * point.x + objective.b * point.y;

// Independently enumerate pairwise intersections rather than using the demo's polygon clipping.
function feasibleIntersections(constraints) {
  const points = [];
  for (let i = 0; i < constraints.length; i++) {
    for (let j = i + 1; j < constraints.length; j++) {
      const left = constraints[i]; const right = constraints[j];
      const determinant = left.a * right.b - right.a * left.b;
      if (Math.abs(determinant) < epsilon) continue;
      const point = { x: (left.c * right.b - right.c * left.b) / determinant, y: (left.a * right.c - right.a * left.c) / determinant };
      if (constraints.every(constraint => satisfies(point, constraint)) && !points.some(other => equalPoint(point, other))) points.push(point);
    }
  }
  return points;
}

test('Both LP presets clip real half-planes and preserve every feasible intersection', () => {
  for (const preset of demo.presets) {
    const frames = demo.makeFrames(preset.value);
    assert.ok(frames.length >= 8, 'The demo provides genuine intermediate steps');
    assert.equal(frames[0].viewportClipped, true, 'The initial quadrant is explicitly a viewport, not a bounded LP');
    assert.match(frames[0].explanation, /unbounded/);
    for (const [index, frame] of frames.entries()) {
      assert.ok(frame.explanation.length > 20);
      assert.ok(frame.stageLabel.length > 0);
      const active = frame.constraints.filter(constraint => constraint.active);
      for (const point of frame.polygon) assert.ok(active.every(constraint => satisfies(point, constraint)), 'Every displayed polygon corner satisfies the applied inequalities');
      if (!frame.viewportClipped) {
        const independentlyFound = feasibleIntersections(active);
        assert.equal(frame.polygon.length, independentlyFound.length, 'The bounded polygon has exactly the true feasible vertices');
        for (const point of independentlyFound) assert.ok(frame.polygon.some(other => equalPoint(point, other)), 'No feasible vertex is clipped out');
      }
      if (frame.previousPolygon) {
        assert.deepEqual(frame.previousPolygon, frames[index - 1].polygon);
        const oldConstraints = frames[index - 1].constraints.filter(constraint => constraint.active);
        for (const point of frame.polygon) assert.ok(oldConstraints.every(constraint => satisfies(point, constraint)), 'Clipping cannot introduce violations of old inequalities');
      }
    }
    assert.equal(frames.at(-1).polygon.length, 5);
  }
});

test('Unique-corner objective agrees with an independent vertex enumeration and dense feasible samples', () => {
  const frames = demo.makeFrames('corner');
  const final = frames.at(-1);
  const vertices = feasibleIntersections(final.constraints);
  const independentBest = Math.max(...vertices.map(point => score(point, final.objective)));
  assert.equal(independentBest, 9);
  assert.equal(final.optimalValue, independentBest);
  assert.deepEqual(final.optimalVertices, [{ x: 4, y: 1 }]);
  assert.equal(final.objectiveLevel, 9);
  for (const point of final.candidateScores) assert.equal(point.value, 2 * point.x + point.y);
  for (let xStep = 0; xStep <= 80; xStep++) {
    for (let yStep = 0; yStep <= 60; yStep++) {
      const point = { x: xStep / 20, y: yStep / 20 };
      if (final.constraints.every(constraint => satisfies(point, constraint))) assert.ok(score(point, final.objective) <= final.optimalValue + epsilon);
    }
  }
  const levels = frames.filter(frame => frame.objectiveLevel !== null).map(frame => frame.objectiveLevel);
  assert.ok(levels.every((level, index) => index === 0 || level > levels[index - 1]), 'Objective lines move toward larger values');
});

test('Parallel objective yields exactly the optimal edge and all of its convex combinations', () => {
  const final = demo.makeFrames('edge').at(-1);
  const independent = feasibleIntersections(final.constraints);
  const best = Math.max(...independent.map(point => point.x + point.y));
  assert.equal(final.optimalValue, best);
  assert.equal(best, 5);
  assert.equal(final.optimalVertices.length, 2);
  const expected = [{ x: 4, y: 1 }, { x: 2, y: 3 }];
  for (const point of expected) assert.ok(final.optimalVertices.some(other => equalPoint(point, other)));
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const point = { x: 4 * t + 2 * (1 - t), y: t + 3 * (1 - t) };
    assert.ok(final.constraints.every(constraint => satisfies(point, constraint)), 'Every point on the tied edge is feasible');
    assert.ok(Math.abs(score(point, final.objective) - best) < epsilon, 'Every point on the tied edge is optimal');
  }
  assert.match(final.explanation, /every point on the segment/);
});

test('Frame generation is repeatable, browser registration preserves sibling demos, and renders are accessible', () => {
  const before = demo.makeFrames('corner');
  const original = JSON.stringify(before);
  before[0].polygon[0].x = 123;
  assert.equal(JSON.stringify(demo.makeFrames('corner')), original, 'Each walkthrough owns independent mutable state');
  assert.deepEqual(demo.makeFrames('unknown'), demo.makeFrames('corner'), 'Unknown preset uses a documented valid default');
  assert.deepEqual(demo.makeFrames('__proto__'), demo.makeFrames('corner'), 'Inherited object properties are not presets');
  const context = { window: { CourseVisuals: { existing: true } } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../visuals/linear-programming.js'), 'utf8'), context);
  assert.equal(context.window.CourseVisuals.existing, true);
  assert.equal(typeof context.window.CourseVisuals['linear-programming'].makeFrames, 'function');
  for (const preset of demo.presets) {
    for (const frame of demo.makeFrames(preset.value)) {
      const html = demo.render(frame);
      assert.match(html, /role="img" aria-label=/);
      assert.match(html, /<caption>Constraints<\/caption>/);
      assert.doesNotMatch(html, /NaN|undefined|<script|\sid=/);
      assert.match(html, /Solid boundaries = applied; dashed = pending/);
    }
  }
  assert.match(demo.render(demo.makeFrames('edge').at(-1)), /Optimal edge/);
});
