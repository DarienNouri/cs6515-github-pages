#!/usr/bin/env node
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { topics, readings, cleanTitle, resolveTopic, resourceLinks } = require('../topic-resources.js');

test('Specific subjects and section context select relevant references', () => {
  const cases = [
    ['Two-sequence DP', 'Week 1 Dynamic programming', 'lcs'],
    ['2-SAT via SCC decomposition', 'Graph algorithms', '2sat'],
    ['⚠️ LP4: Max-SAT Approximation', 'Linear programming', 'max-sat'],
    ['NP4: Knapsack FPTAS', 'NP-completeness', 'fptas'],
    ['NP4: Knapsack', 'NP-completeness', 'knapsack'],
    ['Cut Property', 'Minimum spanning trees', 'mst'],
    ['(a) Irreducible (= Strongly Connected)', 'Markov chains', 'markov'],
    ['Standard form', 'Linear programming', 'lp'],
    ['Ex - Electoral College', 'Graduate algorithms', 'knapsack'],
    ['MF3: Image Segmentation', 'Graduate algorithms', 'image-segmentation'],
    ['Fermat’s little theorem', 'RSA', 'fermat-little'],
    ['Fermat Witness', 'RSA', 'fermat'],
    ['Euler’s theorem', 'RSA', 'euler'],
    ['GR2: Satisfiability', '', '2sat'],
    ['DC0: Divide & Conquer', '', 'dc'],
    ['MaxFlow - MinCut Theorem', '', 'min-cut'],
    ['Min ST-cut Problem Formulation', '', 'min-cut'],
    ['RA0: Randomized Algorithms', '', 'randomized'],
    ['Graphs', '', 'graphs'],
    ['Coin game (substring DP)', 'Week 1', 'coin-game'],
    ['1.x - Coins', 'Dynamic programming', 'coin-game'],
    ['Coin change', 'Dynamic programming', 'coins']
  ];
  for (const [title, context, expected] of cases) {
    assert.equal(resolveTopic(cleanTitle(title), context, '').id, expected, title);
  }
  assert.equal(cleanTitle('2-SAT'), '2-SAT');
  assert.equal(cleanTitle('3SAT'), '3SAT');
  assert.equal(cleanTitle('1. Breadth-first search ¶'), 'Breadth-first search');
  assert.equal(resolveTopic('DPV ch07 exercises', '', '/textbooks/examples-md/07-linear-programming-dpv-examples.html').id, 'lp');
  assert.equal(resolveTopic('Standard form', 'Linear programming', '/01_by_week/W01_DP1-DP2/notes/full-course-notes.html').id, 'lp');
});

test('Search links encode subjects and references use public HTTPS or real local PDFs', () => {
  assert.equal(new Set(topics.map(topic => topic.id)).size, topics.length, 'Topic IDs must be unique');
  for (const [title, file] of Object.values(readings)) {
    assert.ok(title && file.endsWith('.pdf'));
    assert.ok(fs.statSync(path.resolve(__dirname, '..', file)).isFile(), file);
  }
  for (const topic of topics) {
    const resources = resourceLinks(topic.name, '', '');
    const youtube = new URL(resources.links[0].url);
    assert.equal(youtube.hostname, 'www.youtube.com');
    assert.equal(youtube.pathname, '/results');
    assert.ok(youtube.searchParams.get('search_query').includes(resources.query));
    assert.match(resources.links[0].label, /^YouTube search:/);
    assert.ok(resources.links.some(link => link.url?.startsWith('https://en.wikipedia.org/')));
    for (const link of resources.links) {
      if (link.url) assert.equal(new URL(link.url).protocol, 'https:');
      else assert.ok(fs.existsSync(path.resolve(__dirname, '..', link.path)));
    }
  }
  const unusual = resourceLinks('S & T: paths + cuts?', 'Graph algorithms', '');
  assert.equal(new URL(unusual.links[0].url).searchParams.get('search_query'), unusual.query + ' explanation');
});
