const populateLoginWarga = () => {
  const sel = $('loginWarga');
  sel.innerHTML = '<option value="">— Pilih Warga —</option>' +
    (appData.warga || []).map(w => `<option value="${w.id}">${esc(w.nama)} (${esc(w.gol)})</option>`).join('');
};

const doLogin = () => {
  const id = $('loginWarga').value, pin = $('loginPin').value.trim();
  if (!id) { showToast('Pilih akun', 'error'); return; }
  if (!/^\d{4}$/.test(pin)) { showToast('PIN 4 digit', 'error'); return; }
  const w = appData.warga.find(x => x.id === id);
  if (!w) { showToast('Akun tidak ada', 'error'); return; }
  if (pin !== (w.pin || '1234')) { showToast('PIN salah', 'error'); return; }
  currentUser = w;
  if ($('rememberMe').checked) {
    localStorage.setItem('rtku_session', JSON.stringify({ wargaId: w.id, timestamp: Date.now(), lastPage: currentPage }));
  }
  enterApp();
  showToast('Selamat datang, ' + w.nama.split(' ')[0] + '!');
};

const enterApp = () => {
  $('loginPage').style.display = 'none';
  $('app').style.display = 'grid';
  $('loading').style.display = 'none';
  $('headerRole').textContent = currentUser.gol;
  $('headerName').textContent = currentUser.nama;
  buildSidebar();
  buildHomeMenu();
  showPage(currentPage || 'home');
};

const doLogout = () => {
  if (!confirm('Yakin keluar?')) return;
  currentUser = null;
  localStorage.removeItem('rtku_session');
  $('loginPage').style.display = 'flex';
  $('app').style.display = 'none';
  $('loginPin').value = '';
};

const resetData = () => {
  if (!confirm('⚠️ Reset semua data?')) return;
  if (!confirm('Yakin 100%?')) return;
  appData = JSON.parse(JSON.stringify(defaultData));
  saveData();
  populateLoginWarga();
  showToast('Data direset! PIN: 1234');
};

const showHelp = () => {
  alert('LOGIN:\n1. Pilih nama\n2. PIN: 1234\n3. Klik Masuk\n\nAkun:\n• Dirham Rozi (Ketua RT)\n• Siti Rahayu (Sekretaris)\n• Agus Prasetyo (Bendahara)\n• Dedi Mulyawan (Keamanan)\n• Rina Wulandari (Warga)');
};

const checkSession = () => {
  const s = localStorage.getItem('rtku_session');
  if (s) {
    try {
      const d = JSON.parse(s);
      const w = (appData.warga || []).find(x => x.id === d.wargaId);
      if (w && (Date.now() - d.timestamp) < 7 * 24 * 60 * 60 * 1000) {
        currentUser = w;
        if (d.lastPage) currentPage = d.lastPage;
        return true;
      }
    } catch (e) {}
  }
  return false;
};

const editProfil = () => {
  const w = currentUser;
  openModal(`<div class="modal-header"><h3>✏️ Edit Profil</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="form-group"><label>Nama</label><input type="text" id="pfNama" value="${esc(w.nama)}"></div>
    <div class="form-row">
      <div class="form-group"><label>Blok</label><input type="text" id="pfBlok" value="${esc(w.blok)}"></div>
      <div class="form-group"><label>HP</label><input type="tel" id="pfHp" value="${esc(w.hp || '')}"></div>
    </div>
    <div class="form-group"><label>Pekerjaan</label><input type="text" id="pfPekerjaan" value="${esc(w.pekerjaan || '')}"></div>
    <div class="form-group"><label>🔐 Ganti PIN (kosongkan jika tidak)</label><input type="text" id="pfPin" maxlength="4" oninput="this.value=this.value.replace(/[^0-9]/g,'')"></div>
    <button class="btn btn-primary btn-block" onclick="saveProfil()"> Simpan</button>`);
};

const saveProfil = () => {
  const nama = $('pfNama').value.trim(), blok = $('pfBlok').value.trim(), hp = $('pfHp').value.trim(),
    pekerjaan = $('pfPekerjaan').value.trim(), pin = $('pfPin').value.trim();
  if (!nama || !blok) { showToast('Nama & Blok wajib', 'error'); return; }
  if (pin && !/^\d{4}$/.test(pin)) { showToast('PIN 4 digit', 'error'); return; }
  const list = appData.warga || [];
  const i = list.findIndex(x => x.id === currentUser.id);
  if (i !== -1) { list[i] = { ...list[i], nama, blok, hp, pekerjaan, ...(pin ? { pin } : {}) }; }
  appData.warga = list;
  saveData();
  currentUser = list[i];
  $('headerName').textContent = currentUser.nama;
  closeModal();
  showToast('Profil diupdate');
  renderAkun();
  populateLoginWarga();
};

const renderAkun = () => {
  if (!currentUser) return;
  const w = currentUser;
  $('akunInfo').innerHTML = `
    <div style="text-align:center;padding:20px 0">
      <div style="width:88px;height:88px;border-radius:24px;background:linear-gradient(135deg,#F59E0B,#D97706);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:34px;margin:0 auto 14px">${initials(w.nama)}</div>
      <h3 style="font-size:21px;font-weight:800">${esc(w.nama)}</h3>
      <p style="color:#6B7280;margin-top:4px"><span class="badge b-yellow">${esc(w.gol)}</span></p>
      <p style="color:#9CA3AF;margin-top:8px">📱 ${esc(w.hp || '-')}</p>
      <p style="color:#9CA3AF">💼 ${esc(w.pekerjaan || '-')}</p>
      <p style="color:#10B981;margin-top:8px">🔒 PIN: ••••</p>
    </div>`;
};
