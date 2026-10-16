(function () {
  'use strict';

  // No browser state is needed to generate or check this walkthrough.
  var presets = {
    eight: [6, 3, 7, 2, 8, 3, 1, 5],
    four: [4, 2, 4, 1]
  };

  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function itemName(item) { return item.value + ' (#' + (item.original + 1) + ')'; }
  function escape(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function makeFrames(presetValue) {
    var values = presets[presetValue] || presets.eight;
    var input = values.map(function (value, index) { return { value: value, original: index }; });
    var height = Math.log2(input.length);
    var nodes = [];
    var levels = [];
    var frames = [];
    var comparisons = 0;
    var writes = 0;

    function build(items, depth, start, id) {
      var node = { id: id, depth: depth, start: start, input: items, items: items, status: 'waiting', shown: depth === 0 };
      nodes.push(node);
      if (items.length > 1) {
        var half = items.length / 2;
        node.left = build(items.slice(0, half), depth + 1, start, id + 'L');
        node.right = build(items.slice(half), depth + 1, start + half, id + 'R');
      }
      return node;
    }
    var root = build(input, 0, 0, 'root');
    for (var depth = 0; depth < height; depth++) {
      levels.push({ depth: depth, merges: Math.pow(2, depth), size: input.length / Math.pow(2, depth), written: 0, target: input.length });
    }

    function record(kind, stageLabel, explanation, node, merge) {
      frames.push(copy({
        kind: kind,
        stageLabel: stageLabel,
        explanation: explanation,
        input: input,
        n: input.length,
        height: height,
        activeId: node ? node.id : null,
        nodes: nodes.filter(function (entry) { return entry.shown; }).map(function (entry) {
          return { id: entry.id, depth: entry.depth, start: entry.start, input: entry.input, items: entry.items, status: entry.status };
        }),
        merge: merge || null,
        levels: levels,
        result: root.status === 'sorted' ? root.items : null,
        metrics: { comparisons: comparisons, 'merge writes': writes, depth: node ? node.depth : 0 }
      }));
    }

    function sort(node) {
      if (node.input.length === 1) {
        node.status = 'sorted';
        record('base', 'One item is already sorted', itemName(node.items[0]) + ' is a one-item subproblem. Return it without comparing or merging.', node);
        return node.items;
      }
      node.status = 'split';
      node.left.shown = true;
      node.right.shown = true;
      record('split', 'Split into two halves', 'Split this ' + node.input.length + '-item call into two ' + node.left.input.length + '-item calls. Sort the left half, then the right half, before merging.', node);
      var left = sort(node.left);
      var right = sort(node.right);
      node.status = 'merging';
      var merge = { left: left, right: right, i: 0, j: 0, output: [], selected: null, compared: null };
      record('merge-start', 'Merge two sorted halves', 'Both child calls are sorted. The two pointers mark the next unused items. Repeatedly take the smaller item; when values tie, take from the left.', node, merge);
      while (merge.i < left.length || merge.j < right.length) {
        var takeLeft;
        var explanation;
        merge.compared = null;
        if (merge.i === left.length) {
          takeLeft = false;
          explanation = 'The left half is exhausted. Copy the next right item, ' + itemName(right[merge.j]) + ', into the result.';
        } else if (merge.j === right.length) {
          takeLeft = true;
          explanation = 'The right half is exhausted. Copy the next left item, ' + itemName(left[merge.i]) + ', into the result.';
        } else {
          comparisons++;
          var a = left[merge.i];
          var b = right[merge.j];
          merge.compared = { left: a, right: b };
          takeLeft = a.value <= b.value;
          explanation = a.value === b.value
            ? 'Compare ' + itemName(a) + ' with ' + itemName(b) + '. Equal values: take the left item first, preserving their original order (stability).'
            : 'Compare ' + itemName(a) + ' with ' + itemName(b) + '. Take the smaller item from the ' + (takeLeft ? 'left' : 'right') + ' half.';
        }
        var side = takeLeft ? 'left' : 'right';
        var index = takeLeft ? merge.i++ : merge.j++;
        merge.selected = { side: side, index: index };
        merge.output.push((takeLeft ? left : right)[index]);
        writes++;
        levels[node.depth].written++;
        record('take', 'Take from the ' + side, explanation + ' Advance that pointer.', node, merge);
      }
      node.items = merge.output.slice();
      node.status = 'sorted';
      merge.selected = null;
      merge.compared = null;
      record('merged', 'Return the sorted result', 'This ' + node.items.length + '-item merge is complete. Return its sorted result to the parent call.', node, merge);
      return node.items;
    }

    record('start', 'Start with an unsorted array', 'Sort ' + input.length + ' items by recursively splitting, then merging sorted halves. Small labels #1–#' + input.length + ' record original positions, so you can follow equal values.', root);
    sort(root);
    record('summary', 'Sorted — and why the work is n log n', 'The result is sorted, and equal values keep their original order. At each of the ' + height + ' merge levels, all merges together write ' + input.length + ' items. That is ' + input.length + ' × ' + height + ' = ' + writes + ' merge writes: Θ(n log n) work. The singleton leaf level needs no merging.', null);
    return frames;
  }

  function renderItems(items, options) {
    options = options || {};
    return '<ol class="av-dc-items" aria-label="' + escape(options.label || 'Array') + '">' + items.map(function (item, index) {
      var consumed = options.pointer !== undefined && index < options.pointer;
      var next = index === options.pointer;
      var picked = index === options.picked;
      var state = picked ? 'just picked' : next ? 'next' : consumed ? 'used' : '';
      return '<li class="av-dc-item' + (consumed ? ' av-dc-used' : '') + (next ? ' av-dc-next' : '') + (picked ? ' av-dc-picked' : '') + '" aria-label="' + escape(itemName(item) + (state ? ', ' + state : '')) + '"><span class="av-dc-value">' + item.value + '</span><small class="av-dc-origin">#' + (item.original + 1) + '</small><span class="av-dc-item-state" aria-hidden="true">' + (picked ? 'picked' : next ? '↑ next' : consumed ? '✓ used' : '') + '</span></li>';
    }).join('') + '</ol>';
  }

  function renderTree(frame) {
    var rows = [];
    for (var depth = 0; depth <= frame.height; depth++) {
      var depthNodes = frame.nodes.filter(function (node) { return node.depth === depth; });
      if (!depthNodes.length) continue;
      var boxes = [];
      var count = Math.pow(2, depth);
      for (var column = 0; column < count; column++) {
        var node = depthNodes.find(function (entry) { return entry.start === column * frame.n / count; });
        if (!node) {
          boxes.push('<span class="av-dc-tree-empty" aria-hidden="true"></span>');
          continue;
        }
        var current = frame.activeId === node.id;
        var status = current ? 'current call' : node.status === 'sorted' ? 'sorted' : 'waiting for children';
        var marker = current ? '▶' : node.status === 'sorted' ? '✓' : '…';
        boxes.push('<span class="av-dc-tree-node' + (current ? ' av-dc-active' : '') + (node.status === 'sorted' ? ' av-dc-sorted' : '') + '" aria-label="' + escape('Depth ' + depth + ', ' + status + ': ' + node.items.map(itemName).join(', ')) + '"><span class="av-dc-tree-values" aria-hidden="true">' + node.items.map(function (item) { return item.value; }).join(' · ') + '</span><span class="av-dc-tree-marker" aria-hidden="true">' + marker + '</span></span>');
      }
      rows.push('<div class="av-dc-tree-row"><span class="av-dc-depth">' + depth + '</span><div class="av-dc-tree-level" style="--av-dc-columns:' + count + '">' + boxes.join('') + '</div></div>');
    }
    return '<section class="av-dc-tree" aria-label="Recursion tree, grouped by depth"><div class="av-dc-tree-heading"><strong>Recursive calls</strong><span>▶ current · ✓ sorted</span></div><div class="av-dc-depth-heading">Depth</div>' + rows.join('') + '</section>';
  }

  function renderMerge(merge) {
    function source(side, pointer, label) {
      var items = merge[side];
      var picked = merge.selected && merge.selected.side === side ? merge.selected.index : -1;
      return '<div class="av-dc-tray"><strong>' + label + '</strong>' + renderItems(items, { label: label + ', sorted', pointer: pointer, picked: picked }) + '<span class="av-dc-pointer-note">' + (pointer === items.length ? 'Pointer: exhausted' : 'Pointer: next item #' + (items[pointer].original + 1)) + '</span></div>';
    }
    return '<section class="av-dc-merge" aria-label="Merge state"><div class="av-dc-sources">' + source('left', merge.i, 'Left half') + source('right', merge.j, 'Right half') + '</div><div class="av-dc-output"><strong>Merged result · ' + merge.output.length + '/' + (merge.left.length + merge.right.length) + ' items</strong>' + (merge.output.length ? renderItems(merge.output, { label: 'Sorted output so far', picked: merge.selected ? merge.output.length - 1 : -1 }) : '<p class="av-dc-empty-output">Empty — take the smaller next item.</p>') + '</div></section>';
  }

  function renderWork(frame) {
    return '<details class="av-dc-work"' + (frame.kind === 'summary' ? ' open' : '') + '><summary>Why Θ(n log n)? Follow the work at each depth</summary><p>Every non-leaf level merges <strong>n = ' + frame.n + '</strong> items in total. There are <strong>log₂ ' + frame.n + ' = ' + frame.height + '</strong> merge levels.</p><div class="av-dc-work-table-wrap"><table class="av-dc-work-table"><caption>Merge output writes across all calls at each depth</caption><thead><tr><th scope="col">Depth</th><th scope="col">Merges × size</th><th scope="col">Writes so far / total</th></tr></thead><tbody>' + frame.levels.map(function (level) {
      return '<tr><th scope="row">' + level.depth + '</th><td>' + level.merges + ' × ' + level.size + '</td><td>' + level.written + ' / ' + level.target + '</td></tr>';
    }).join('') + '<tr><th scope="row">' + frame.height + '</th><td>' + frame.n + ' singletons</td><td>0 · no merge</td></tr></tbody></table></div><p>In this trace: <strong>' + frame.metrics['merge writes'] + '</strong> merge writes so far. The full sort writes n log₂ n = ' + (frame.n * frame.height) + ' items. Each write needs at most one value comparison; copying a remaining tail needs none.</p></details>';
  }

  function render(frame) {
    var current = frame.nodes.find(function (node) { return node.id === frame.activeId; });
    var activeArray = frame.result && frame.kind === 'summary' ? frame.result : current ? current.items : frame.input;
    return '<div class="av-dc" role="group" aria-label="' + escape('Merge sort: ' + frame.stageLabel) + '"><div class="av-dc-array"><strong>' + (frame.kind === 'summary' ? 'Final sorted array' : 'Current call') + '</strong>' + renderItems(activeArray, { label: frame.kind === 'summary' ? 'Final sorted array' : 'Items in the current recursive call' }) + '<p class="av-dc-legend"># labels mark original positions. Equal values retain that order.</p></div>' + renderTree(frame) + (frame.merge ? renderMerge(frame.merge) : '<p class="av-dc-call-note">' + (frame.kind === 'summary' ? '✓ All calls complete. Notice the two equal values still appear in their original order.' : 'Split until a call has one item; merge only after both child calls return.') + '</p>') + renderWork(frame) + '</div>';
  }

  var demos = {
    'merge-sort': {
      title: 'Merge sort: split, sort, merge',
      description: 'Follow recursive calls, two merge pointers, stable handling of equal values, and the work at each recursion depth.',
      presets: [{ value: 'eight', label: '8 items · 3 merge levels' }, { value: 'four', label: '4 items · 2 merge levels' }],
      makeFrames: makeFrames,
      render: render
    }
  };
  if (typeof module === 'object' && module.exports) module.exports = demos;
  if (typeof window !== 'undefined') Object.assign(window.CourseVisuals = window.CourseVisuals || {}, demos);
}());
