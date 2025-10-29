function hideRenewParagraphs() {
  document.querySelectorAll('.form-group p').forEach(p => {
    if (p.textContent.includes('Renews')) {
      p.style.display = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', hideRenewParagraphs);
document.addEventListener('click', hideRenewParagraphs);
setInterval(hideRenewParagraphs, 1000);
