(function () {
  const ROOT = document.documentElement;
  const PAY  = "is-paywall";
  const VIDEO_CLASS = "is-video";
  const H_THRESH = 2000;
  const IFRAME_SEL = '#sutraWidgetIframe, iframe[src*="/iframe/"][src*="/videos"]';
  const VIDEO_JS_RX = /(^|\/)video(\.min)?\.js(\?|#|$)/i;

  let hasVideoJs = false;
  let ro = null, watched = null, pollId = null;

  // Try to detect video.js via PerformanceObserver (best effort).
  try {
    if (window.PerformanceObserver) {
      const po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.name && VIDEO_JS_RX.test(e.name)) {
            hasVideoJs = true;
          }
        }
        apply();
      });
      po.observe({ type: "resource", buffered: true });
    }
  } catch (_) { /* noop */ }

  // Heuristic fallback: videos route implies video.js likely present.
  function videoJsHeuristic() {
    const f = iframeEl();
    return !!(f && typeof f.src === "string" && /\/iframe\/[^/]+\/videos/i.test(f.src));
  }

  function iframeEl() {
    return document.querySelector(IFRAME_SEL);
  }

  function currentHeight() {
    const f = iframeEl();
    if (!f) return 0;
    const r = f.getBoundingClientRect();
    return r.height || 0;
  }

  function apply() {
    if (!ROOT.classList.contains(VIDEO_CLASS)) {
      ROOT.classList.remove(PAY);
      return;
    }
    const okVideo = hasVideoJs || videoJsHeuristic();
    const h = currentHeight();
    ROOT.classList.toggle(PAY, okVideo && h < H_THRESH);
  }

  function watchIframe(el) {
    if (watched === el) return;
    if (ro) ro.disconnect();
    watched = null;
    if (!el) return;
    ro = new ResizeObserver(apply);
    ro.observe(el);
    watched = el;
  }

  function startPolling() {
    if (pollId) return;
    pollId = setInterval(apply, 400);
  }
  function stopPolling() {
    if (pollId) { clearInterval(pollId); pollId = null; }
  }

  // React when the route flag appears/disappears or DOM changes.
  const mo = new MutationObserver(() => {
    const el = iframeEl();
    watchIframe(el);
    if (ROOT.classList.contains(VIDEO_CLASS)) startPolling();
    else stopPolling();
    apply();
  });
  mo.observe(ROOT, { attributes: true, attributeFilter: ["class"] });
  mo.observe(document.body || ROOT, { childList: true, subtree: true });

  // Fallback listeners
  window.addEventListener("resize", apply);
  window.addEventListener("load", () => { watchIframe(iframeEl()); apply(); });
  document.addEventListener("DOMContentLoaded", () => { watchIframe(iframeEl()); apply(); });

  // Safety tick
  setInterval(() => { watchIframe(iframeEl()); apply(); }, 1500);
})();
