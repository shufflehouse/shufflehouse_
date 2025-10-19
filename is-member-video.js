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
  let pollId = null;
  let heartbeatId = null;
  let observer = null;
  let classObserver = null;
  let running = false;
  let scoutId = null; // checks for videos before start

  function visible(el) {
    if (!el) return false;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function any(selectorList) {
    for (const sel of selectorList) {
      const nodes = Array.from(document.querySelectorAll(sel));
      if (nodes.some(visible)) return true;
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
    observer = new MutationObserver(() => tick('dom'));
    observer.observe(document.documentElement, {
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
    if (observer) observer.disconnect();
    if (pollId) clearInterval(pollId);
    if (heartbeatId) clearInterval(heartbeatId);
    document.documentElement.classList.remove(CONFIG.memberClass, CONFIG.notMemberClass);
    prevState = 'unknown';
    console.log(`${CONFIG.logPrefix} monitor stopped.`);
  }

  // Gate: require is-video AND a visible video to start
  function evaluateGate() {
    const onVideo = document.documentElement.classList.contains(CONFIG.htmlGateClass);
    const hasVid = onVideo && any(CONFIG.videoSelectors);

    if (!running && onVideo && hasVid) {
      clearInterval(scoutId);
      scoutId = null;
      start();
      return;
    }
    if (running && !onVideo) {
      stop();
      return;
    }
    // If onVideo but no video yet and not running, keep scouting
    if (!running && onVideo && !hasVid && !scoutId) {
      scoutId = setInterval(evaluateGate, CONFIG.pollMs);
    }
  }

  // Watch for html.is-video flips
  function watchHtmlClass() {
    classObserver = new MutationObserver(evaluateGate);
    classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    evaluateGate(); // initial check
  }

  window.__videoMonitor = { start, stop, evaluateGate };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchHtmlClass, { once: true });
  } else {
    watchHtmlClass();
  }
})();
