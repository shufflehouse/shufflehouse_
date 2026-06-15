(function () {
  function replaceCancelModalLine() {
    if (!document.documentElement.classList.contains('is-account')) return;

    document.querySelectorAll('.modal-body p').forEach(p => {
      if (/cancel this subscription/i.test(p.textContent)) {
        p.innerHTML = `
          To cancel, please reach out at:.<br><br>
          <a href="mailto:help@shufflehouse.co?subject=🫶%20Question%20about%20cancellation"
             style="color:#b3040f; text-decoration:underline;">
             Email help@shufflehouse.co
          </a>
        `;
      }
    });
  }

  const observer = new MutationObserver(() => replaceCancelModalLine());
  observer.observe(document.body, { childList: true, subtree: true });

  replaceCancelModalLine();
})();
