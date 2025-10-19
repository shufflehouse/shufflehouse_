(function () {
  const CONFIG = {
    videoSelectors: ['.video-js', 'video.video-js', '.vjs-tech'],
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

  function visible(el) {
    if (!el) return false;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function any(selectorList) {
    for (const sel of selectorList) {
      const nodes = document.querySelectorAll(sel);
      for (const n of nodes) if (visible(n)) return true;
    }
    return false;
  }

  function detect() {
    const onVideoPage = document.documentElement.classList.contains(CONFIG.htmlGateClass);
    const hasVideo = onVideoPage && any(CONFIG.videoSelectors);
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
    if (kind === 'change') console.info(`${base} → ${details}`);
    else console.log(`${base} → ${details}`);
  }

  function emitToParent(data) {
    if (!CONFIG.postMessage) return;
    try {
      if (window.top && window.top !== window) {
        window.top.postMessage({ source: 'arketa-video-monitor', ...data }, '*');
      }
    } catch(_) {}
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

    monitorObserver = new MutationObserver(() => tick('dom'));
    monitorObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class','style']
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
    console.log(`${CONFIG.logPrefix} monitor stopped.`);
    // Reset classes when leaving video context
    document.documentElement.classList.remove(CONFIG.memberClass, CONFIG.notMemberClass);
    prevState = 'unknown';
  }

  // Gate: only start when is-video AND a visible video exists.
  function evaluateGate() {
    const onVideo = document.documentElement.classList.contains(CONFIG.htmlGateClass);
    const hasVid = onVideo && any(CONFIG.videoSelectors);

    if (!running && onVideo && hasVid) start();
    if (running && !onVideo) stop();
    // If running and video comes/goes, tick will react via observer/poll.
  }

  // Lightweight always-on watchers to trigger start/stop.
  const gateObserver = new MutationObserver(evaluateGate);
  gateObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('DOMContentLoaded', evaluateGate);
  window.addEventListener('load', evaluateGate);
  window.addEventListener('popstate', evaluateGate);
  window.addEventListener('hashchange', evaluateGate);
  setInterval(evaluateGate, 1500); // cheap scout while idle

  // Manual hooks
  window.__videoMonitor = { start, stop, evaluateGate, tick };
})();
