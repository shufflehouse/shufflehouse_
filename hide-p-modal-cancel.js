<script>
(function () {
  function replaceCancelModalLine() {
    if (!document.documentElement.classList.contains('is-account')) return;

    document.querySelectorAll('.modal-dialog').forEach(dialog => {
      const title = dialog.querySelector('.modal-title');
      const body = dialog.querySelector('.modal-body');
      const footer = dialog.querySelector('.modal-footer');

      if (!title || !body) return;

      const isCancelModal = /are you sure you would like to cancel/i.test(title.textContent);

      if (!isCancelModal) return;

      body.querySelectorAll('p').forEach(p => {
        if (/cancel this subscription/i.test(p.textContent) || /before cancelling/i.test(p.textContent)) {
          p.innerHTML = `
            To cancel, please reach out at:<br><br>
            <a href="mailto:help@shufflehouse.co?subject=🫶%20Question%20about%20cancellation"
               style="color:#b3040f; text-decoration:underline;">
               Email help@shufflehouse.co
            </a>
          `;
        }
      });

      if (footer) {
        footer.style.display = 'none';
      }
    });
  }

  const observer = new MutationObserver(() => replaceCancelModalLine());
  observer.observe(document.body, { childList: true, subtree: true });

  replaceCancelModalLine();
})();
</script>
