(function () {
  const CONFIG = {
    videoSelectors: ['.video-js', 'video.video-js', '.vjs-tech'],
    pollMs: 1500,
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

  function hasVisibleVideo() {
    for (const sel of CONFIG.videoSelectors) {
      const list = document.querySelectorAll(sel);
      for (const n of list) if (visible(n)) return true;
    }
    return false;
  }

  function detect() {
    const onVideoPage = document.documentElement.classList.contains(CONFIG.htmlGateClass);
    const hasVideo = onVideoPage && hasVisibleVideo();
    let state = 'unknown';
    if (onVideoPage) state = hasVideo ? 'member' : 'not-member';
    return { onVideoPage, hasVideo, state };
  }

  function applyState(res) {
    const html = document.documentElement;
    if (!res.onVideoPage) {
      html.classList.remove(CONFIG.memberClass, CONFIG.notMemberClass);
      window.__arketaVideoMember = 'unknown';
      return;
    }
    html.classList.toggle(CONFIG.memberClass, res.state === 'member');
    html.classList.toggle(CONFIG.notMemberClass, res.state === 'not-member');
    window.__arketaVideoMember = res.state;
  }

  function log(kind, res) {
    const ts = new Date().toISOString();
    const id = ++seq;
    console.log(`${CONFIG.logPrefix} [#${id}] ${kind} @ ${ts} → onVideo=${res.onVideoPage} | hasVideo=${res.hasVideo} | state=${res.state}`);
  }

  function tick(kind) {
    const res = detect();
    applyState(res);
    if (res.state !== prevState) {
      prevState = res.state;
      log('change', res);
      if (window.top && window.top !== window) {
        try { window.top.postMessage({ source: 'arketa-video-monitor', type: 'change', ...res }, '*'); } catch(e){}
      }
    } else if (kind === 'heartbeat') {
      log('heartbeat', res);
    }
  }

  // Always running: poll + react to DOM/class changes.
  function start() {
    tick('init');

    // React quickly to SPA/nav/class flips and DOM insertions
    const obs = new MutationObserver(() => tick('dom'));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
      childList: true,
      subtree: true
    });

    setInterval(() => tick('poll'), CONFIG.pollMs);
    setInterval(() => tick('heartbeat'), 5000);

    window.__videoMonitor = { tick };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
