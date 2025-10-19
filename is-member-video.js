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

  // Always-on listeners
  const domObserver = new MutationObserver(() => tick('dom'));
  domObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });

  // Extra nudges for SPA and layout shifts
  window.addEventListener('popstate', () => tick('nav'));
  window.addEventListener('hashchange', () => tick('nav'));
  document.addEventListener('visibilitychange', () => tick('vis'));
  window.addEventListener('load', () => tick('load'));

  // Periodic polling + heartbeat
  setInterval(() => tick('poll'), CONFIG.pollMs);
  setInterval(() => tick('heartbeat'), CONFIG.heartbeatMs);

  // Kick off immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tick('init'), { once: true });
  } else {
    tick('init');
  }

  // Expose manual poke
  window.__videoMonitor = { tick };
})();
