(function (root, factory) {
  'use strict';
  const demos = factory();
  if (typeof module === 'object' && module.exports) module.exports = demos;
  if (root) Object.assign(root.CourseVisuals = root.CourseVisuals || {}, demos);
})(typeof window === 'undefined' ? null : window, function () {
  'use strict';

  function escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function snapshot(frame) {
    return JSON.parse(JSON.stringify(frame));
  }

  function sameCell(cell, i, j) {
    return cell && cell[0] === i && cell[1] === j;
  }

  function tableCell(frame, i, j) {
    const current = sameCell(frame.current, i, j);
    const dependency = frame.dependencies.find(cell => cell.i === i && cell.j === j);
    const path = frame.path.some(cell => sameCell(cell, i, j));
    const match = frame.matches && frame.matches.some(cell => cell.i === i && cell.j === j);
    const classes = ['av-dp-cell'];
    const states = [];
    let marker = '';
    if (path) { classes.push('av-dp-path'); states.push('traceback path'); marker = 'path'; }
    if (match) { classes.push('av-dp-match'); states.push('selected matching pair'); marker = 'match'; }
    if (dependency) { classes.push('av-dp-dependency'); states.push(dependency.label); marker = 'read'; }
    if (current) { classes.push('av-dp-current'); states.push('current cell'); marker = 'now'; }
    const value = frame.table[i][j];
    const label = `${frame.kind === 'lcs' ? 'L' : 'K'}[${i},${j}]: ${value === null ? 'not computed' : value}${states.length ? '; ' + states.join('; ') : ''}`;
    return `<td class="${classes.join(' ')}" aria-label="${escape(label)}"><span class="av-dp-number">${value === null ? '<span aria-hidden="true">·</span>' : value}</span><span class="av-dp-cell-state" aria-hidden="true">${marker || '&nbsp;'}</span></td>`;
  }

  function legend(frame) {
    return `<p class="av-dp-legend"><span><b class="av-dp-key av-dp-current">now</b> current cell</span><span><b class="av-dp-key av-dp-dependency">read</b> dependency</span>${frame.stage === 'traceback' || frame.stage === 'done' ? '<span><b class="av-dp-key av-dp-path">path</b> traceback</span>' : ''}${frame.kind === 'lcs' && frame.matches.length ? '<span><b class="av-dp-key av-dp-match">match</b> selected pair</span>' : ''}</p>`;
  }

  const lcsPresets = {
    small: { a: 'ABAC', b: 'BAC' },
    classic: { a: 'ABCBDAB', b: 'BDCABA' }
  };

  function lcsFrames(presetValue) {
    const input = lcsPresets[presetValue] || lcsPresets.small;
    const { a, b } = input;
    const table = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => i === 0 || j === 0 ? 0 : null));
    const frames = [];
    const state = {
      kind: 'lcs', a, b, table, current: null, dependencies: [], path: [], matches: [], sequence: '',
      stage: 'initialize', stageLabel: 'Set the base cases',
      explanation: 'L[i,j] stores the LCS length for the first i characters of X and the first j characters of Y. An empty prefix has LCS length 0; fill the other cells left to right, row by row.',
      metrics: `X: ${a} · Y: ${b} · table: ${a.length + 1} × ${b.length + 1}`
    };
    frames.push(snapshot(state));
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const matches = a[i - 1] === b[j - 1];
        state.current = [i, j];
        state.stage = 'fill';
        state.stageLabel = `Fill L[${i},${j}]`;
        if (matches) {
          table[i][j] = table[i - 1][j - 1] + 1;
          state.dependencies = [{ i: i - 1, j: j - 1, label: 'diagonal dependency' }];
          state.explanation = `X[${i}] and Y[${j}] both equal ${a[i - 1]}. Extend the shorter prefixes: L[${i},${j}] = 1 + L[${i - 1},${j - 1}] = ${table[i][j]}.`;
        } else {
          table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
          state.dependencies = [{ i: i - 1, j, label: 'upper dependency' }, { i, j: j - 1, label: 'left dependency' }];
          state.explanation = `X[${i}] = ${a[i - 1]} and Y[${j}] = ${b[j - 1]} differ. Drop the last character from one prefix: L[${i},${j}] = max(${table[i - 1][j]}, ${table[i][j - 1]}) = ${table[i][j]}.`;
        }
        state.metrics = `Prefixes: ${a.slice(0, i)} × ${b.slice(0, j)} · current LCS length: ${table[i][j]}`;
        frames.push(snapshot(state));
      }
    }
    let i = a.length;
    let j = b.length;
    state.path.push([i, j]);
    while (i > 0 && j > 0) {
      const oldI = i;
      const oldJ = j;
      state.current = [i, j];
      state.stage = 'traceback';
      state.stageLabel = `Trace back from L[${i},${j}]`;
      if (a[i - 1] === b[j - 1]) {
        state.matches.unshift({ i, j, char: a[i - 1] });
        state.sequence = a[i - 1] + state.sequence;
        state.explanation = `X[${i}] and Y[${j}] match (${a[i - 1]}). Keep this character and move diagonally to L[${i - 1},${j - 1}]. The selected suffix is ${state.sequence}.`;
        i--;
        j--;
      } else if (table[i - 1][j] >= table[i][j - 1]) {
        const tied = table[i - 1][j] === table[i][j - 1];
        state.explanation = `The characters differ. ${tied ? 'Both neighboring values tie; this demo consistently chooses up.' : 'The upper value is larger, so move up.'} Move to L[${i - 1},${j}] and skip X[${i}] = ${a[i - 1]}.`;
        i--;
      } else {
        state.explanation = `The characters differ and the left value is larger. Move to L[${i},${j - 1}] and skip Y[${j}] = ${b[j - 1]}.`;
        j--;
      }
      state.dependencies = [{ i, j, label: `next traceback cell from L[${oldI},${oldJ}]` }];
      state.path.push([i, j]);
      state.metrics = `Optimal length: ${table[a.length][b.length]} · selected characters: ${state.sequence.length}`;
      frames.push(snapshot(state));
    }
    state.stage = 'done';
    state.stageLabel = 'One longest common subsequence';
    state.current = null;
    state.dependencies = [];
    state.explanation = `The traceback reaches an empty prefix. ${state.sequence} is a subsequence of both strings, with optimal length ${table[a.length][b.length]}. Different tie choices can produce another equally long answer.`;
    state.metrics = `LCS: ${state.sequence} · length: ${state.sequence.length} · fill time: O(|X| × |Y|)`;
    frames.push(snapshot(state));
    return frames;
  }

  function renderLcs(frame) {
    const header = ['<th scope="col">X ↓ / Y →</th>', '<th scope="col">0: ∅</th>', ...Array.from(frame.b, (char, j) => `<th scope="col">${j + 1}: ${escape(char)}</th>`)].join('');
    const rows = frame.table.map((row, i) => `<tr><th scope="row">${i === 0 ? '0: ∅' : `${i}: ${escape(frame.a[i - 1])}`}</th>${row.map((_, j) => tableCell(frame, i, j)).join('')}</tr>`).join('');
    const strings = ['a', 'b'].map((name, index) => `<p><b>${index ? 'Y' : 'X'}:</b> <span class="av-dp-letters">${Array.from(frame[name], (char, pos) => {
      const selected = frame.matches.some(match => match[index ? 'j' : 'i'] === pos + 1);
      return `<span class="av-dp-letter${selected ? ' av-dp-letter-selected' : ''}" aria-label="${escape(char)}, position ${pos + 1}${selected ? ', selected' : ''}">${escape(char)}${selected ? '<sup aria-hidden="true">✓</sup>' : ''}</span>`;
    }).join('')}</span></p>`).join('');
    const selection = frame.sequence ? `<p class="av-dp-result"><strong>${frame.stage === 'done' ? 'Longest common subsequence' : 'Selected suffix'}:</strong> <span class="av-dp-answer">${escape(frame.sequence)}</span> <span>(length ${frame.sequence.length})</span></p><p class="av-dp-pairs">Matching positions: ${frame.matches.map(match => `X[${match.i}] ↔ Y[${match.j}] (${escape(match.char)})`).join(' · ')}</p>` : '<p class="av-dp-result">After filling the table, trace back to recover the characters.</p>';
    return `<div class="av-dp av-dp-lcs"><div class="av-dp-inputs">${strings}</div>${legend(frame)}<div class="av-dp-scroll" role="region" aria-label="Longest common subsequence table; scroll horizontally on small screens" tabindex="0"><table class="av-dp-table"><caption>L[i,j]: LCS length for prefixes X[1…i] and Y[1…j]. ∅ means an empty prefix.</caption><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>${selection}</div>`;
  }

  const knapsackPresets = {
    small: { capacity: 5, items: [{ id: 'A', weight: 2, value: 3 }, { id: 'B', weight: 3, value: 4 }, { id: 'C', weight: 4, value: 5 }] },
    'greedy-trap': { capacity: 8, items: [{ id: 'A', weight: 3, value: 5 }, { id: 'B', weight: 4, value: 6 }, { id: 'C', weight: 5, value: 7 }] }
  };

  function knapsackFrames(presetValue) {
    const input = knapsackPresets[presetValue] || knapsackPresets.small;
    const items = input.items.map(item => Object.assign({}, item));
    const capacity = input.capacity;
    const table = Array.from({ length: items.length + 1 }, (_, i) => Array.from({ length: capacity + 1 }, (_, c) => i === 0 || c === 0 ? 0 : null));
    const frames = [];
    const state = {
      kind: 'knapsack', items, capacity, table, current: null, dependencies: [], path: [], selected: [], candidate: null,
      stage: 'initialize', stageLabel: 'Set the base cases',
      explanation: 'K[i,c] stores the best value using only the first i items within capacity c. No items or zero capacity gives value 0. Every item may be used at most once.',
      metrics: `${items.length} items · capacity ${capacity} · table ${items.length + 1} × ${capacity + 1}`
    };
    frames.push(snapshot(state));
    for (let i = 1; i <= items.length; i++) {
      const item = items[i - 1];
      for (let c = 1; c <= capacity; c++) {
        const exclude = table[i - 1][c];
        const fits = item.weight <= c;
        const previous = fits ? table[i - 1][c - item.weight] : null;
        const include = fits ? item.value + previous : null;
        const decision = fits && include > exclude ? 'include' : 'exclude';
        table[i][c] = decision === 'include' ? include : exclude;
        state.current = [i, c];
        state.dependencies = [{ i: i - 1, j: c, label: 'exclude: previous row at the same capacity' }];
        if (fits) state.dependencies.push({ i: i - 1, j: c - item.weight, label: 'include once: previous row at the remaining capacity' });
        state.candidate = { itemIndex: i - 1, capacity: c, fits, exclude, include, previous, decision };
        state.stage = 'fill';
        state.stageLabel = `Fill K[${i},${c}]`;
        state.explanation = !fits
          ? `Item ${item.id} weighs ${item.weight}, exceeding capacity ${c}. Exclude it: K[${i},${c}] = K[${i - 1},${c}] = ${exclude}.`
          : `For item ${item.id} at capacity ${c}, compare excluding it (${exclude}) with including it once (${item.value} + K[${i - 1},${c - item.weight}] = ${include}). ${include === exclude ? 'The values tie, so this demo excludes the item.' : `Choose ${decision}.`} Both dependencies use row ${i - 1}; using row ${i} would allow this item to repeat.`;
        state.metrics = `Item ${item.id}: weight ${item.weight}, value ${item.value} · capacity ${c} · best value ${table[i][c]}`;
        frames.push(snapshot(state));
      }
    }
    let i = items.length;
    let c = capacity;
    state.path.push([i, c]);
    state.candidate = null;
    while (i > 0) {
      const item = items[i - 1];
      state.current = [i, c];
      state.stage = 'traceback';
      state.stageLabel = `Decide whether item ${item.id} was used`;
      if (table[i][c] === table[i - 1][c]) {
        state.explanation = `K[${i},${c}] equals the value above it (${table[i - 1][c]}). An optimal solution can exclude ${item.id}; move to row ${i - 1} with capacity ${c}. Ties consistently exclude the item.`;
      } else {
        state.selected.unshift(item.id);
        state.explanation = `K[${i},${c}] improves on the value above it. Select item ${item.id} once (weight ${item.weight}, value ${item.value}); move to row ${i - 1} with remaining capacity ${c - item.weight}.`;
        c -= item.weight;
      }
      i--;
      state.dependencies = [{ i, j: c, label: 'next traceback cell in the previous row' }];
      state.path.push([i, c]);
      state.metrics = `Optimal value: ${table[items.length][capacity]} · selected so far: ${state.selected.join(' + ') || 'none'}`;
      frames.push(snapshot(state));
    }
    const chosenItems = items.filter(item => state.selected.includes(item.id));
    state.totalWeight = chosenItems.reduce((sum, item) => sum + item.weight, 0);
    state.totalValue = chosenItems.reduce((sum, item) => sum + item.value, 0);
    state.stage = 'done';
    state.stageLabel = 'Optimal 0/1 selection';
    state.current = null;
    state.dependencies = [];
    state.explanation = `Choose ${state.selected.join(' + ')}: total weight ${state.totalWeight} ≤ ${capacity} and total value ${state.totalValue}. Each selected item appears once. The final table entry certifies this value is optimal.`;
    state.metrics = `Weight ${state.totalWeight}/${capacity} · value ${state.totalValue} · fill time O(items × capacity)`;
    frames.push(snapshot(state));
    return frames;
  }

  function renderKnapsack(frame) {
    const header = ['<th scope="col">Items ↓ / capacity →</th>', ...Array.from({ length: frame.capacity + 1 }, (_, c) => `<th scope="col">${c}</th>`)].join('');
    const rows = frame.table.map((row, i) => `<tr><th scope="row">${i ? `${escape(frame.items[i - 1].id)} <span class="av-dp-item-detail">(w ${frame.items[i - 1].weight}, v ${frame.items[i - 1].value})</span>` : 'No items'}</th>${row.map((_, c) => tableCell(frame, i, c)).join('')}</tr>`).join('');
    const items = `<ul class="av-dp-item-list" aria-label="Available items">${frame.items.map(item => `<li class="${frame.selected.includes(item.id) ? 'av-dp-item-selected' : ''}"><b>${escape(item.id)}</b> <span>weight ${item.weight} · value ${item.value}</span>${frame.selected.includes(item.id) ? '<strong>✓ selected</strong>' : ''}</li>`).join('')}</ul>`;
    let comparison = '';
    if (frame.candidate) {
      const candidate = frame.candidate;
      const item = frame.items[candidate.itemIndex];
      comparison = `<div class="av-dp-compare" aria-label="Include and exclude comparison"><p class="${candidate.decision === 'exclude' ? 'av-dp-option-chosen' : ''}"><strong>Exclude ${escape(item.id)}</strong><span>Previous row, same capacity: ${candidate.exclude}</span>${candidate.decision === 'exclude' ? '<b>✓ chosen</b>' : ''}</p><p class="${candidate.decision === 'include' ? 'av-dp-option-chosen' : ''}"><strong>Include ${escape(item.id)} once</strong><span>${candidate.fits ? `Previous row, capacity ${candidate.capacity - item.weight}: ${item.value} + ${candidate.previous} = ${candidate.include}` : `Does not fit: weight ${item.weight} > capacity ${candidate.capacity}`}</span>${candidate.decision === 'include' ? '<b>✓ chosen</b>' : ''}</p></div>`;
    }
    const selection = frame.selected.length
      ? `<strong>${frame.stage === 'done' ? 'Optimal selection' : 'Selected so far'}:</strong> ${frame.selected.map(escape).join(' + ')}${frame.stage === 'done' ? ` · weight ${frame.totalWeight}/${frame.capacity} · value ${frame.totalValue}` : ''}`
      : 'Every include choice reads the previous row, so an item cannot be used twice.';
    return `<div class="av-dp av-dp-knapsack">${items}${legend(frame)}<div class="av-dp-scroll" role="region" aria-label="0/1 knapsack table; scroll horizontally on small screens" tabindex="0"><table class="av-dp-table"><caption>K[i,c]: best value using the first i items within capacity c. w = weight; v = value.</caption><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>${comparison}<p class="av-dp-result">${selection}</p></div>`;
  }

  return {
    lcs: {
      title: 'Longest common subsequence',
      description: 'Build a two-sequence DP table, then trace backward to recover one optimal subsequence.',
      presets: [{ value: 'small', label: 'Small: ABAC and BAC' }, { value: 'classic', label: 'Classic: ABCBDAB and BDCABA' }],
      makeFrames: lcsFrames,
      render: renderLcs
    },
    knapsack: {
      title: '0/1 knapsack: include or exclude',
      description: 'Compare both choices for each item and capacity, using only the previous row, then recover the selected items.',
      presets: [{ value: 'small', label: 'Small: capacity 5' }, { value: 'greedy-trap', label: 'Greedy trap: capacity 8' }],
      makeFrames: knapsackFrames,
      render: renderKnapsack
    }
  };
});
