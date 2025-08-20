(function () {
  function setFlag() {
    const isAccount =
      location.pathname.endsWith('/iframe/shufflehouse/account') ||
      location.pathname.includes('/iframe/shufflehouse/account');
    document.documentElement.classList.toggle('is-account', isAccount);
  }

  // Handle SPA-style route changes too
  const _push = history.pushState, _replace = history.replaceState;
  history.pushState = function(){ _push.apply(this, arguments); setFlag(); };
  history.replaceState = function(){ _replace.apply(this, arguments); setFlag(); };
  window.addEventListener('popstate', setFlag);
  document.addEventListener('DOMContentLoaded', setFlag);
  setFlag();
})();
