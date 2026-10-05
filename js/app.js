const init = () => {
  loadData();
  normalizeData();
  populateLoginWarga();
  $('iuranNominalLabel').textContent = rp(appData.rt.iuranNominal);
  if (checkSession()) {
    enterApp();
    showToast('Selamat datang kembali!', 'info');
  } else {
    $('loginPage').style.display = 'flex';
  }
};

$('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

init();
