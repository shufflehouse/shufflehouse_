(function () {
  function hideRenewPs(root = document) {
    root.querySelectorAll('.form-group p.mb-0').forEach(p => {
      if (/Renews/i.test(p.textContent)) p.style.display = 'none';
    });
  }

  // Run on load
  document.addEventListener('DOMContentLoaded', () => {
    hideRenewPs();

    // Watch for late-loaded content inside .form-group
    const fg = document.querySelector('.form-group');
    if (!fg) return;

    new MutationObserver(muts => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType === 1) hideRenewPs(n);
        }
      }
    }).observe(fg, { childList: true, subtree: true });
  });

  // Also run on any click just in case UI injects content on interaction
  document.addEventListener('click', hideRenewPs);
})();
