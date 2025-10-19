(function () {
  const CONFIG = {
    // broadened selectors to catch common players
    videoSelectors: [
      '.video-js', 'video.video-js', '.vjs-tech', 'video', '.vjs-player',
      'iframe[src*="youtube.com"]', 'iframe[src*="vimeo.com"]'
    ],
    pollMs: 1500,
    heartbeatMs: 5000,
    postMessage: true,
    logPrefix: '[VideoRead]',
    htmlGateClass: 'is-video',
    memberClass: 'is-member',
    notMemberClass: 'isnot-member'
  };

  let prevState = 'unknown';
  let seq = 0;
  let running = false;
  let monitorObserver = null;
  let pollId = null;
  let heartbeatId = null;

  function anyExists(selectorList) {
    for (const sel of selectorList) {
      if (document.querySelector(sel)) return true;
    }
    return false;
  }

  function detect() {
    const onVideoPage = document.documentElement.classList.contains(CONFIG.htmlGateClass);
    const hasVideo = onVideoPage && anyExists(CONFIG.videoSelectors); // existence, not visibility
    let state = 'unknown';
    if (onVideoPage) state = hasVideo ? 'member' : 'not-member';
    return { onVideoPage, hasVideo, state };
  }

  function applyState(res) {
    const html = document.documentElement;
    html.classList.toggle(CONFIG.memberClass, res.state === 'member');
    html.classList.toggle(CONFIG.notMemberClass, res.state === 'not-member');
    window.__arketaVideoMember = res.state;
  }

  function log(kind, data) {
    const ts = new Date().toISOString();
    const id = ++seq;
    const base = `${CONFIG.logPrefix} [#${id}] ${kind} @ ${ts}`;
    const details = `onVideo=${data.onVideoPage} | hasVideo=${data.hasVideo} | state=${data.state}`;
    if (kind === 'change') console.info(`${base} → ${details}`); else console.log(`${base} → ${details}`);
  }

  function emitToParent(data) {
    if (!CONFIG.postMessage) return;
    try {
      if (window.top && window.top !== window) {
        window.top.postMessage({ source: 'arketa-video-monitor', ...data }, '*');
      }
    } catch (_) {}
  }

  function tick(kind) {
    const res = detect();
    applyState(res);

    if (res.state !== prevState) {
      prevState = res.state;
      log('change', res);
      emitToParent({ type: 'change', ...res });
    } else if (kind === 'heartbeat') {
      log('heartbeat', res);
      emitToParent({ type: 'heartbeat', ...res });
    }
  }

  function start() {
    if (running) return;
    running = true;
    prevState = 'unknown';

    // React to DOM changes while running
    monitorObserver = new MutationObserver(() => tick('dom'));
    monitorObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    pollId = setInterval(() => tick('poll'), CONFIG.pollMs);
    heartbeatId = setInterval(() => tick('heartbeat'), CONFIG.heartbeatMs);

    tick('init');
    console.log(`${CONFIG.logPrefix} monitor started.`);
  }

  function stop() {
    if (!running) return;
    running = false;
    if (monitorObserver) monitorObserver.disconnect();
    if (pollId) clearInterval(pollId);
    if (heartbeatId) clearInterval(heartbeatId);
    document.documentElement.classList.remove(CONFIG.memberClass, CONFIG.notMemberClass);
    prevState = 'unknown';
    console.log(`${CONFIG.logPrefix} monitor stopped.`);
  }

  // Gate: only start when is-video AND a video element exists.
  function evaluateGate() {
    const onVideo = document.documentElement.classList.contains(CONFIG.htmlGateClass);
    const hasVid = onVideo && anyExists(CONFIG.videoSelectors);

    if (!running && onVideo && hasVid) start();
    if (running && !onVideo) stop();
    // If running and videos appear/disappear, tick() handles class flips.
    if (running) tick('gate');
  }

  // Always-on lightweight watcher to trigger start/stop and restarts when videos appear later.
  const gateObserver = new MutationObserver(evaluateGate);
  gateObserver.observe(document.documentElement, {
    childList: true,       // detect new video nodes
    subtree: true,
    attributes: true,      // detect html class flips
    attributeFilter: ['class']
  });

  // SPA and lifecycle nudges
  document.addEventListener('DOMContentLoaded', evaluateGate);
  window.addEventListener('load', evaluateGate);
  window.addEventListener('popstate', evaluateGate);
  window.addEventListener('hashchange', evaluateGate);

  // Cheap scout while idle
  setInterval(evaluateGate, 1500);

  // Manual hooks
  window.__videoMonitor = { start, stop, evaluateGate, tick };
})();
