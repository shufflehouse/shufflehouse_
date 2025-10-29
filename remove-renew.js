function removeRenewCards() {
  document.querySelectorAll('.form-group .card').forEach(card => {
    if (card.textContent.includes('Renews')) card.remove();
  });
}

// Run once on load
document.addEventListener('DOMContentLoaded', removeRenewCards);

// Run on clicks
document.addEventListener('click', removeRenewCards);

// Poll every second for late-loaded content
setInterval(removeRenewCards, 1000);
