/* Shared controls for deterministic, dependency-free course walkthroughs. */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  let sequence = 0;
  const controllers = [];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mount(container) {
    if (container.dataset.visualReady) return;
    const demo = window.CourseVisuals && window.CourseVisuals[container.dataset.algorithmVisual];
    if (!demo) return;
    const instanceId = 'algorithm-visual-' + (++sequence);
    let preset = demo.presets && demo.presets[0] ? demo.presets[0].value : undefined;
    let frames = demo.makeFrames(preset);
    if (!Array.isArray(frames) || frames.length === 0) throw new Error('Walkthrough has no steps: ' + demo.title);
    let index = 0;
    let timer = null;
    let delay = 1300;

    const region = element('section', 'algorithm-visual');
    region.setAttribute('aria-label', demo.title + ' interactive walkthrough');
    const intro = element('p', 'av-intro', demo.description);
    region.append(intro);

    if (demo.presets && demo.presets.length > 1) {
      const label = element('label', 'av-preset', 'Example ');
      const select = element('select');
      select.setAttribute('data-av-preset', '');
      demo.presets.forEach(choice => {
        const option = element('option', '', choice.label);
        option.value = choice.value;
        select.append(option);
      });
      label.append(select);
      region.append(label);
      select.addEventListener('change', () => {
        pause();
        preset = select.value;
        frames = demo.makeFrames(preset);
        index = 0;
        render();
      });
    }

    const view = element('div', 'av-view');
    view.tabIndex = 0;
    view.setAttribute('role', 'region');
    view.setAttribute('aria-label', demo.title + ' diagram and state; scroll horizontally if needed');
    const controls = element('div', 'av-controls');
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', demo.title + ' playback controls');
    function button(action, label) {
      const node = element('button', '', label);
      node.type = 'button';
      node.dataset.avAction = action;
      controls.append(node);
      return node;
    }
    const back = button('back', '← Back');
    const play = button('play', 'Play');
    const next = button('next', 'Next →');
    const reset = button('reset', 'Reset');
    const speedLabel = element('label', 'av-speed', 'Speed ');
    const speed = element('select');
    [[2000, 'Slow'], [1300, 'Normal'], [650, 'Fast']].forEach(([value, text]) => {
      const option = element('option', '', text);
      option.value = value;
      option.selected = value === delay;
      speed.append(option);
    });
    speedLabel.append(speed);
    controls.append(speedLabel);

    const position = element('output', 'av-position');
    position.setAttribute('aria-live', 'off');
    const scrubLabel = element('label', 'av-scrub');
    scrubLabel.append(element('span', '', 'Jump to step'));
    const scrub = element('input');
    scrub.type = 'range';
    scrub.min = '0';
    scrub.step = '1';
    scrubLabel.append(scrub);
    const explanation = element('p', 'av-explanation');
    explanation.setAttribute('role', 'status');
    explanation.setAttribute('aria-live', 'polite');
    explanation.setAttribute('aria-atomic', 'true');
    const metrics = element('p', 'av-metrics');
    region.append(view, controls, position, scrubLabel, explanation, metrics);

    function pause() {
      if (timer !== null) clearInterval(timer);
      timer = null;
      play.textContent = 'Play';
      play.setAttribute('aria-pressed', 'false');
    }
    function render() {
      const frame = frames[index];
      view.innerHTML = demo.render(frame, { instanceId });
      view.dataset.step = String(index);
      position.value = 'Step ' + (index + 1) + ' of ' + frames.length + (frame.stageLabel ? ' · ' + frame.stageLabel : '');
      scrub.max = String(frames.length - 1);
      scrub.value = String(index);
      scrub.setAttribute('aria-valuetext', position.value);
      explanation.textContent = frame.explanation;
      const text = frame.metrics && typeof frame.metrics === 'object'
        ? Object.entries(frame.metrics).map(([key, value]) => key + ': ' + value).join(' · ')
        : frame.metrics;
      metrics.textContent = text || '';
      metrics.hidden = !text;
      back.disabled = index === 0;
      next.disabled = index === frames.length - 1;
    }
    function start() {
      window.dispatchEvent(new CustomEvent('course-visual-start', { detail: controller }));
      if (index === frames.length - 1) index = 0;
      play.textContent = 'Pause';
      play.setAttribute('aria-pressed', 'true');
      render();
      timer = setInterval(() => {
        index = Math.min(frames.length - 1, index + 1);
        if (index === frames.length - 1) pause();
        render();
      }, delay);
    }
    const controller = { pause };
    controllers.push(controller);
    back.addEventListener('click', () => { pause(); index = Math.max(0, index - 1); render(); });
    next.addEventListener('click', () => { pause(); index = Math.min(frames.length - 1, index + 1); render(); });
    reset.addEventListener('click', () => { pause(); index = 0; render(); });
    play.addEventListener('click', () => timer === null ? start() : pause());
    scrub.addEventListener('input', () => { pause(); index = Math.max(0, Math.min(frames.length - 1, Number(scrub.value))); render(); });
    speed.addEventListener('change', () => {
      delay = Number(speed.value);
      if (timer !== null) { pause(); start(); }
    });
    for (let disclosure = container.parentElement; disclosure; disclosure = disclosure.parentElement) {
      if (disclosure.tagName === 'DETAILS') {
        const panel = disclosure;
        panel.addEventListener('toggle', () => { if (!panel.open) pause(); });
      }
    }
    container.replaceChildren(region);
    container.dataset.visualReady = 'true';
    pause();
    render();
  }

  function initialize(root) {
    const scope = root && root.querySelectorAll ? root : document;
    if (scope.matches && scope.matches('[data-algorithm-visual]')) mount(scope);
    scope.querySelectorAll('[data-algorithm-visual]').forEach(mount);
  }
  window.initializeCourseVisuals = initialize;
  window.addEventListener('course-visual-start', event => controllers.forEach(controller => {
    if (controller !== event.detail) controller.pause();
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) controllers.forEach(controller => controller.pause()); });
  initialize();
})();
