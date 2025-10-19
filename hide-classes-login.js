(function () {
  const KEYWORDS = ['virtual membership', 'per month'];

  function onReady(fn){
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once:true });
  }

  function isVirtualWidget(root){
    const text = (root.textContent || '').toLowerCase();
    return KEYWORDS.some(k => text.includes(k));
  }

  function applyHide(){
    // route + state gates
    if (!document.documentElement.classList.contains('is-schedule')) return;
    if (window.__arketaLoginState !== 'logged-out') return;

    const widget = document.querySelector('#fullWidthWidget');
    if (!widget || !isVirtualWidget(widget)) return;

    // within the purchase block, hide every direct sibling that is NOT .form-group
    const mAuto = widget.querySelector('.m-auto');
    if (!mAuto) return;

    Array.from(mAuto.children).forEach(el => {
      if (!el.classList.contains('form-group')) {
        el.style.visibility = 'hidden';
      }
    });

    console.log('[VirtualHide] applied (schedule + logged-out + virtual)');
  }

  // initial run
  onReady(applyHide);

  // keep it robust for SPA content changes
  const mo = new MutationObserver(() => applyHide());
  mo.observe(document.documentElement, { childList:true, subtree:true });
})();
