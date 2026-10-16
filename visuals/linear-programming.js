(function (root, factory) {
  'use strict';
  const demos = factory();
  if (typeof module === 'object' && module.exports) module.exports = demos;
  else Object.assign(root.CourseVisuals = root.CourseVisuals || {}, demos);
}(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const EPSILON = 1e-9;
  const WINDOW = { x: 5.5, y: 4.5 };
  const CONSTRAINTS = [
    { id: 'nonnegative-x', a: -1, b: 0, c: 0, label: 'x ≥ 0' },
    { id: 'nonnegative-y', a: 0, b: -1, c: 0, label: 'y ≥ 0' },
    { id: 'x-bound', a: 1, b: 0, c: 4, label: 'x ≤ 4' },
    { id: 'y-bound', a: 0, b: 1, c: 3, label: 'y ≤ 3' },
    { id: 'diagonal', a: 1, b: 1, c: 5, label: 'x + y ≤ 5' }
  ];
  const OBJECTIVES = {
    corner: { a: 2, b: 1, label: '2x + y', name: 'Unique optimum' },
    edge: { a: 1, b: 1, label: 'x + y', name: 'Tied optimal edge' }
  };

  function samePoint(left, right) {
    return Math.abs(left.x - right.x) < EPSILON && Math.abs(left.y - right.y) < EPSILON;
  }

  // Sutherland–Hodgman clipping against an actual linear inequality.
  function clip(polygon, constraint) {
    const result = [];
    for (let i = 0; i < polygon.length; i++) {
      const from = polygon[i];
      const to = polygon[(i + 1) % polygon.length];
      const fromValue = constraint.a * from.x + constraint.b * from.y - constraint.c;
      const toValue = constraint.a * to.x + constraint.b * to.y - constraint.c;
      const fromInside = fromValue <= EPSILON;
      const toInside = toValue <= EPSILON;
      if (fromInside) result.push({ x: from.x, y: from.y });
      if (fromInside !== toInside) {
        const t = fromValue / (fromValue - toValue);
        result.push({ x: from.x + t * (to.x - from.x), y: from.y + t * (to.y - from.y) });
      }
    }
    return result.filter((point, index) => !samePoint(point, result[(index + result.length - 1) % result.length]));
  }

  function makeFrames(presetValue) {
    const objective = Object.prototype.hasOwnProperty.call(OBJECTIVES, presetValue) ? OBJECTIVES[presetValue] : OBJECTIVES.corner;
    const frames = [];
    let polygon = [{ x: 0, y: 0 }, { x: WINDOW.x, y: 0 }, { x: WINDOW.x, y: WINDOW.y }, { x: 0, y: WINDOW.y }];
    let active = CONSTRAINTS.slice(0, 2).map(constraint => constraint.id);
    const push = (stageLabel, explanation, extra) => {
      frames.push({
        stageLabel, explanation,
        polygon: polygon.map(point => ({ ...point })),
        constraints: CONSTRAINTS.map(constraint => ({ ...constraint, active: active.includes(constraint.id) })),
        objective: { ...objective },
        viewportClipped: !active.includes('x-bound') || !active.includes('y-bound'),
        showVertices: false, objectiveLevel: null, candidateScores: [], optimalVertices: [], optimalValue: null,
        ...extra
      });
    };

    push('Start with nonnegative variables', 'Require x ≥ 0 and y ≥ 0. This quadrant is unbounded: the shaded portion is only the plotting window, not yet a bounded feasible set. Add the remaining inequalities one at a time.');
    for (const constraint of CONSTRAINTS.slice(2)) {
      const previousPolygon = polygon.map(point => ({ ...point }));
      polygon = clip(polygon, constraint);
      active = active.concat(constraint.id);
      const explanation = {
        'x-bound': 'Apply x ≤ 4. Keep the part to the left of x = 4; discard the striped area to its right. The region still extends upward beyond the plotting window.',
        'y-bound': 'Apply y ≤ 3. Keep the part below y = 3. Together with nonnegativity and x ≤ 4, this forms a bounded rectangle.',
        diagonal: 'Apply x + y ≤ 5. Intersect the rectangle with the half-plane below x + y = 5. The removed corner violates this inequality; the remaining pentagon satisfies all five constraints.'
      }[constraint.id];
      push('Intersect with ' + constraint.label, explanation, { previousPolygon, activeBoundary: constraint.id });
    }

    const candidateScores = polygon.map(point => ({ ...point, value: objective.a * point.x + objective.b * point.y }));
    const optimalValue = Math.max(...candidateScores.map(point => point.value));
    const optimalVertices = candidateScores.filter(point => Math.abs(point.value - optimalValue) < EPSILON).map(({ x, y }) => ({ x, y }));
    push('Locate the feasible vertices', 'The corners are intersections of boundary lines. Each listed point satisfies every constraint. For this nonempty bounded polygon, comparing the objective at these vertices finds an optimum.', { showVertices: true });
    push('Evaluate ' + objective.label, 'Maximize ' + objective.label + '. The table gives the exact objective value at every feasible vertex. Next, slide parallel objective lines toward increasing values.', { showVertices: true, candidateScores, optimalValue });

    for (const fraction of [0.25, 0.6, 0.85, 1]) {
      const objectiveLevel = fraction * optimalValue;
      const last = fraction === 1;
      const tie = optimalVertices.length > 1;
      const explanation = last
        ? (tie
          ? 'The last supporting line is x + y = 5. Both (4, 1) and (2, 3) score 5, and every point on the segment between them is feasible with that same score. This example has an entire optimal edge, not a unique optimal point.'
          : 'The last supporting line is 2x + y = 9. It touches the feasible region only at (4, 1), so this example has a unique optimum with value 9. Any higher parallel line misses the feasible region.')
        : 'The line ' + objective.label + ' = ' + number(objectiveLevel) + ' groups points with equal objective value. Moving it toward the arrow increases the value while keeping its slope fixed; it still intersects the feasible region.';
      push(last ? (tie ? 'An entire optimal edge' : 'The optimal corner') : 'Slide the objective line', explanation, {
        showVertices: true, candidateScores, optimalValue, objectiveLevel,
        optimalVertices: last ? optimalVertices : [], finished: last,
        metrics: 'Maximize ' + objective.label + ' · line value ' + number(objectiveLevel) + (last ? ' · optimum reached' : '')
      });
    }
    return frames;
  }

  function number(value) {
    return Number(value.toFixed(3)).toString();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }

  function px(point) { return { x: 48 + point.x * 76, y: 318 - point.y * 64 }; }
  function svgPoint(point) { const p = px(point); return number(p.x) + ',' + number(p.y); }
  function polygonMarkup(polygon, className) {
    return '<polygon class="' + className + '" points="' + polygon.map(svgPoint).join(' ') + '"></polygon>';
  }

  // Intersect a boundary line with the visible rectangle, independent of the feasible polygon.
  function lineEnds(a, b, c) {
    const points = [];
    const add = point => {
      if (point.x >= -EPSILON && point.x <= WINDOW.x + EPSILON && point.y >= -EPSILON && point.y <= WINDOW.y + EPSILON && !points.some(other => samePoint(point, other))) points.push(point);
    };
    if (Math.abs(b) > EPSILON) { add({ x: 0, y: c / b }); add({ x: WINDOW.x, y: (c - a * WINDOW.x) / b }); }
    if (Math.abs(a) > EPSILON) { add({ x: c / a, y: 0 }); add({ x: (c - b * WINDOW.y) / a, y: WINDOW.y }); }
    return points.slice(0, 2);
  }

  function lineMarkup(a, b, c, className) {
    const ends = lineEnds(a, b, c);
    if (ends.length !== 2) return '';
    const start = px(ends[0]); const end = px(ends[1]);
    return '<line class="' + className + '" x1="' + number(start.x) + '" y1="' + number(start.y) + '" x2="' + number(end.x) + '" y2="' + number(end.y) + '"></line>';
  }

  function render(frame) {
    let diagram = '<svg class="av-lp-svg" viewBox="0 0 500 370" role="img" aria-label="Linear programming diagram: ' + escapeHtml(frame.stageLabel) + '"><title>' + escapeHtml(frame.stageLabel) + '</title><desc>' + escapeHtml(frame.explanation) + '</desc>';
    for (let x = 0; x <= 5; x++) {
      const p = px({ x, y: 0 });
      diagram += '<line class="av-lp-grid" x1="' + p.x + '" y1="30" x2="' + p.x + '" y2="318"></line><text class="av-lp-tick" x="' + p.x + '" y="341" text-anchor="middle">' + x + '</text>';
    }
    for (let y = 1; y <= 4; y++) {
      const p = px({ x: 0, y });
      diagram += '<line class="av-lp-grid" x1="48" y1="' + p.y + '" x2="466" y2="' + p.y + '"></line><text class="av-lp-tick" x="34" y="' + (p.y + 5) + '" text-anchor="end">' + y + '</text>';
    }
    if (frame.previousPolygon) diagram += polygonMarkup(frame.previousPolygon, 'av-lp-removed');
    diagram += polygonMarkup(frame.polygon, 'av-lp-feasible');
    // Hatching outside the new intersection makes the discarded region identifiable without color.
    if (frame.activeBoundary) {
      const constraint = frame.constraints.find(item => item.id === frame.activeBoundary);
      const removed = clip(frame.previousPolygon, { a: -constraint.a, b: -constraint.b, c: -constraint.c });
      if (removed.length >= 3) {
        const top = Math.min(...removed.map(point => point.x + point.y));
        const bottom = Math.max(...removed.map(point => point.x + point.y));
        for (let c = Math.ceil(top * 5) / 5; c <= bottom + EPSILON; c += 0.2) {
          const ends = [];
          for (let i = 0; i < removed.length; i++) {
            const left = removed[i]; const right = removed[(i + 1) % removed.length];
            const denominator = right.x + right.y - left.x - left.y;
            if (Math.abs(denominator) < EPSILON) continue;
            const t = (c - left.x - left.y) / denominator;
            if (t >= -EPSILON && t <= 1 + EPSILON) {
              const point = { x: left.x + t * (right.x - left.x), y: left.y + t * (right.y - left.y) };
              if (!ends.some(other => samePoint(point, other))) ends.push(point);
            }
          }
          if (ends.length === 2) {
            const a = px(ends[0]); const b = px(ends[1]);
            diagram += '<line class="av-lp-hatch" x1="' + number(a.x) + '" y1="' + number(a.y) + '" x2="' + number(b.x) + '" y2="' + number(b.y) + '"></line>';
          }
        }
      }
    }
    diagram += '<path class="av-lp-axis" d="M48 22 V318 H476 M43 29 L48 22 L53 29 M469 313 L476 318 L469 323"></path><text class="av-lp-axis-label" x="483" y="324">x</text><text class="av-lp-axis-label" x="43" y="17">y</text>';
    for (const constraint of frame.constraints.slice(2)) {
      diagram += lineMarkup(constraint.a, constraint.b, constraint.c, 'av-lp-boundary' + (constraint.active ? ' av-lp-applied' : ' av-lp-pending') + (constraint.id === frame.activeBoundary ? ' av-lp-current' : ''));
    }
    diagram += '<text class="av-lp-line-label" x="359" y="61">x = 4</text><text class="av-lp-line-label" x="55" y="118">y = 3</text><text class="av-lp-line-label" x="146" y="43">x + y = 5</text>';
    if (frame.objectiveLevel !== null) {
      diagram += lineMarkup(frame.objective.a, frame.objective.b, frame.objectiveLevel, 'av-lp-objective');
      // Arrow follows the objective gradient in data coordinates, with scale conversion.
      const start = px({ x: 0.8, y: 0.6 });
      const length = Math.hypot(frame.objective.a, frame.objective.b);
      const end = px({ x: 0.8 + frame.objective.a / length, y: 0.6 + frame.objective.b / length });
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const left = { x: end.x - 10 * Math.cos(angle - Math.PI / 6), y: end.y - 10 * Math.sin(angle - Math.PI / 6) };
      const right = { x: end.x - 10 * Math.cos(angle + Math.PI / 6), y: end.y - 10 * Math.sin(angle + Math.PI / 6) };
      diagram += '<path class="av-lp-improve" d="M' + start.x + ' ' + start.y + ' L' + number(end.x) + ' ' + number(end.y) + ' M' + number(left.x) + ' ' + number(left.y) + ' L' + number(end.x) + ' ' + number(end.y) + ' L' + number(right.x) + ' ' + number(right.y) + '"></path><text class="av-lp-direction" x="58" y="362">Arrow: increase ' + escapeHtml(frame.objective.label) + '</text>';
    }
    if (frame.optimalVertices.length > 1) {
      const first = px(frame.optimalVertices[0]); const second = px(frame.optimalVertices[1]);
      diagram += '<line class="av-lp-optimal-edge" x1="' + first.x + '" y1="' + first.y + '" x2="' + second.x + '" y2="' + second.y + '"></line>';
    }
    if (frame.showVertices) {
      for (const point of frame.polygon) {
        const p = px(point); const optimal = frame.optimalVertices.some(other => samePoint(point, other));
        const dx = point.x === 4 ? 10 : point.x === 0 ? 9 : -9;
        const dy = point.y === 0 ? -10 : point.y === 3 ? 23 : 20;
        diagram += '<circle class="av-lp-vertex' + (optimal ? ' av-lp-optimal-vertex' : '') + '" cx="' + p.x + '" cy="' + p.y + '" r="' + (optimal ? 7 : 4) + '"></circle><text class="av-lp-point-label" x="' + (p.x + dx) + '" y="' + (p.y + dy) + '" text-anchor="' + (dx < 0 ? 'end' : 'start') + '">(' + number(point.x) + ', ' + number(point.y) + ')</text>';
      }
    }
    diagram += '</svg>';

    let panel = '<div class="av-lp-status"><table class="av-lp-table"><caption>Constraints</caption><thead><tr><th scope="col">Inequality</th><th scope="col">Status</th></tr></thead><tbody>';
    for (const constraint of frame.constraints) {
      panel += '<tr' + (constraint.id === frame.activeBoundary ? ' class="av-lp-current-row"' : '') + '><th scope="row">' + escapeHtml(constraint.label) + '</th><td>' + (constraint.id === frame.activeBoundary ? 'Applied this step' : constraint.active ? 'Applied' : 'Pending') + '</td></tr>';
    }
    panel += '</tbody></table>';
    if (frame.showVertices) {
      panel += '<table class="av-lp-table"><caption>' + (frame.candidateScores.length ? 'Feasible vertices: maximize ' + escapeHtml(frame.objective.label) : 'Feasible vertices') + '</caption><thead><tr><th scope="col">Point (x, y)</th><th scope="col">' + (frame.candidateScores.length ? 'Objective value' : 'Feasibility') + '</th></tr></thead><tbody>';
      for (const point of frame.polygon) {
        const score = frame.candidateScores.find(candidate => samePoint(point, candidate));
        const optimal = frame.finished && score && Math.abs(score.value - frame.optimalValue) < EPSILON;
        panel += '<tr' + (optimal ? ' class="av-lp-optimal-row"' : '') + '><th scope="row">(' + number(point.x) + ', ' + number(point.y) + ')</th><td>' + (score ? number(score.value) + (optimal ? ' — maximum' : '') : 'All constraints satisfied') + '</td></tr>';
      }
      panel += '</tbody></table>';
    }
    if (frame.objectiveLevel !== null) panel += '<p class="av-lp-objective-readout">Objective line: <strong>' + escapeHtml(frame.objective.label) + ' = ' + number(frame.objectiveLevel) + '</strong></p>';
    if (frame.finished) panel += '<p class="av-lp-result"><strong>' + (frame.optimalVertices.length > 1 ? 'Optimal edge' : 'Unique optimal point') + '.</strong> Maximum value: ' + number(frame.optimalValue) + '. ' + (frame.optimalVertices.length > 1 ? 'Every point from (4, 1) to (2, 3) attains it.' : 'Attained at (4, 1).') + '</p>';
    panel += '</div>';
    return '<div class="av-lp-layout"><figure class="av-lp-figure"><div class="av-lp-canvas">' + diagram + '</div><figcaption class="av-lp-legend">Shaded = retained region' + (frame.viewportClipped ? ' within the plotting window' : '') + '. Solid boundaries = applied; dashed = pending.' + (frame.previousPolygon ? ' Striped = discarded this step.' : '') + (frame.objectiveLevel !== null ? ' Thick line = objective level; arrow = increasing value.' : '') + '</figcaption></figure>' + panel + '</div>';
  }

  return {
    'linear-programming': {
      title: 'Linear programming: clip the region, move the objective',
      description: 'A bounded two-variable example: intersect half-planes, compare feasible vertices, and slide an objective line to a unique corner or a tied optimal edge.',
      presets: [{ value: 'corner', label: 'Maximize 2x + y: one optimal corner' }, { value: 'edge', label: 'Maximize x + y: an optimal edge' }],
      makeFrames, render
    }
  };
}));
