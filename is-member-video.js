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
    // export simple flag
    window.__arketaVideoMember = res.state; // 'member' | 'not-member' | 'unknown'
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
    // Only run on html.is-video
    if (!document.documentElement.classList.contains(CONFIG.htmlGateClass)) {
      console.log(`${CONFIG.logPrefix} skipped (no ${CONFIG.htmlGateClass}).`);
      return;
    }

    tick('init');

    observer = new MutationObserver(() => tick('dom'));
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    pollId = setInterval(() => tick('poll'), CONFIG.pollMs);
    heartbeatId = setInterval(() => tick('heartbeat'), CONFIG.heartbeatMs);

    console.log(`${CONFIG.logPrefix} monitor started.`);
  }

  function stop() {
    if (observer) observer.disconnect();
    if (pollId) clearInterval(pollId);
    if (heartbeatId) clearInterval(heartbeatId);
    console.log(`${CONFIG.logPrefix} monitor stopped.`);
  }

  // public handle, distinct from other scripts
  window.__videoMonitor = { stop };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
