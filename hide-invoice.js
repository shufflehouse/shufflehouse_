(function () {
  function checkAndHide() {
    if (!document.documentElement.classList.contains('is-account')) return;
    const el = Array.from(document.querySelectorAll('p.m-0.p-0.card-text'))
      .find(p => p.textContent.includes('Next invoice'));
    if (el) {
      el.style.display = 'none';
      clearInterval(timer);
    }
  }

  // Periodic recheck
  const timer = setInterval(checkAndHide, 500);

  // Restart interval on route changes
  const _push = history.pushState, _replace = history.replaceState;
  history.pushState = function(){ _push.apply(this, arguments); setTimeout(checkAndHide, 500); };
  history.replaceState = function(){ _replace.apply(this, arguments); setTimeout(checkAndHide, 500); };
  window.addEventListener('popstate', () => setTimeout(checkAndHide, 500));

  document.addEventListener('DOMContentLoaded', checkAndHide);
})();
