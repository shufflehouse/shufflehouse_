(function () {
  function replaceCancelModalLine() {
    if (!document.documentElement.classList.contains('is-account')) return;

    document.querySelectorAll('.modal-body p').forEach(p => {
      if (/cancel this subscription/i.test(p.textContent)) {
        p.innerHTML = `
          Before cancelling, we’d love to hear from you first.<br><br>
          If it’s about cost, timing, or anything we can do to improve your experience, please reach out —
          we’d genuinely love to help as humans, not bots.<br><br>
          <a href="mailto:hello@shufflehouse.co?subject=🫶%20Question%20about%20cancellation"
             style="color:#b3040f; text-decoration:underline;">
             Email hello@shufflehouse.co
          </a>
        `;
      }
    });
  }

  const observer = new MutationObserver(() => replaceCancelModalLine());
  observer.observe(document.body, { childList: true, subtree: true });

  replaceCancelModalLine();
})();
