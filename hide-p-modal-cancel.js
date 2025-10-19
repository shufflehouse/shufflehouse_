(function () {
  function hideCancelModalLine() {
    if (!document.documentElement.classList.contains('is-account')) return;

    document.querySelectorAll('.modal-body p').forEach(p => {
      if (/cancel this subscription/i.test(p.textContent)) {
        p.style.display = 'none';
      }
    });
  }

  // Observe DOM for modal openings
  const observer = new MutationObserver(() => hideCancelModalLine());
  observer.observe(document.body, { childList: true, subtree: true });

  // Run once immediately
  hideCancelModalLine();
})();
