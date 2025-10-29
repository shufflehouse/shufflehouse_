function removeRenewParagraphs() {
  document.querySelectorAll('.form-group p').forEach(p => {
    if (p.textContent.includes('Renews')) p.remove();
  });
}

document.addEventListener('DOMContentLoaded', removeRenewParagraphs);
document.addEventListener('click', removeRenewParagraphs);
setInterval(removeRenewParagraphs, 1000);
