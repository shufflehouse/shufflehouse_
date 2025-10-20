(function () {
  const POLL_MS = 400;
  const SEL = '#sutraWidgetIframe, iframe[src*="/iframe/"][src*="/videos"]';
  let lastIsVideo = false;
  let lastEl = null;
  let lastH = null;

  function iframeEl() { return document.querySelector(SEL); }
  function heightOf(el) {
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.round(r.height || el.offsetHeight || 0);
  }

  function tick() {
    const isVideo = document.documentElement.classList.contains('is-video');

    if (!isVideo) {
      if (lastIsVideo) console.log('[vid] left is-video');
      lastIsVideo = false; lastEl = null; lastH = null;
      return;
    }
    if (!lastIsVideo) console.log('[vid] entered is-video');
    lastIsVideo = true;

    const f = iframeEl();
    if (!f) { 
      if (lastEl !== null) console.log('[vid] iframe not found');
      lastEl = null; lastH = null;
      return;
    }
    if (f !== lastEl) {
      lastEl = f; lastH = null;
      console.log('[vid] iframe found');
    }

    const h = heightOf(f);
    if (lastH === null || h !== lastH) {
      console.log(`[vid] iframe height = ${h}px`);
      lastH = h;
    }
  }

  setInterval(tick, POLL_MS);
  document.addEventListener('DOMContentLoaded', tick);
  window.addEventListener('load', tick);
})();
