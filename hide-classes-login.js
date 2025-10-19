(function () {
  // --- config ---
  const KEYWORDS = ['virtual membership', 'per month']; // detect virtual widget
  const HTML = document.documentElement;
  const HIDE_ATTR = 'data-virtualhide-applied';

  // --- helpers ---
  const isLoggedOut  = () => (HTML.getAttribute('data-login') === 'logged-out');
  const isSchedule   = () => HTML.classList.contains('is-schedule');
  const isVirtual    = (root) => KEYWORDS.some(k => (root.textContent || '').toLowerCase().includes(k));

  function hideSiblingsExceptFormGroup(container) {
    // container is the ".m-auto" block
    const kids = Array.from(container.children);
    let changed = false;
    for (const el of kids) {
      if (!el.classList.contains('form-group')) {
        if (el.style.visibility !== 'hidden') {
          el.dataset._vhPrevVisibility = el.style.visibility || '';
          el.style.visibility = 'hidden';
          changed = true;
        }
      }
    }
    if (changed) container.setAttribute(HIDE_ATTR, '1');
  }

  function restoreIfNeeded(container) {
    if (!container.hasAttribute(HIDE_ATTR)) return;
    for (const el of Array.from(container.children)) {
      if (!el.classList.contains('form-group')) {
        el.style.visibility = el.dataset._vhPrevVisibility || '';
        delete el.dataset._vhPrevVisibility;
      }
    }
    container.removeAttribute(HIDE_ATTR);
  }

  // Scan all relevant widgets every time we’re triggered
  function apply() {
    const qualify = isLoggedOut() && isSchedule();
    const widgets = document.querySelectorAll('#fullWidthWidget');
    widgets.forEach(w => {
      const mAutos = w.querySelectorAll('.m-auto');
      mAutos.forEach(m => {
        if (qualify && isVirtual(w)) hideSiblingsExceptFormGroup(m);
        else restoreIfNeeded(m);
      });
    });
  }

  // --- boot once DOM is ready ---
  function onReady(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn, {once:true}); }
  onReady(() => {
    apply();

    // Observe DOM for dynamic loads/swaps
    const mo = new MutationObserver(() => apply());
    mo.observe(document.body, { subtree:true, childList:true });

    // Observe route/state flips: class changes and data-login changes on <html>
    const routeObserver = new MutationObserver(() => apply());
    routeObserver.observe(HTML, { attributes:true, attributeFilter:['class','data-login'] });

    // Optional: periodic safety net
    setInterval(apply, 4000);
    console.log('[VirtualHide] live listener active');
  });
})();
