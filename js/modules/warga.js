const renderWargaList = () => {
  const q = ($('searchWarga') ? $('searchWarga').value : '').toLowerCase().trim();
  let list = (appData.warga || []).slice();
  if (q) list = list.filter(w => [w.nama, w.blok, w.gol, w.pekerjaan, w.hp].some(v => String(v || '').toLowerCase().includes(q)));
  $('wargaCount').textContent = list.length + ' warga';
  const el = $('wargaList');
  if (!list.length) { el.innerHTML = emptyState('👥', q ? 'Tidak ditemukan' : 'Belum ada warga'); return; }
  el.innerHTML = list.map(w => `
    <div class="data-item">
      <div class="data-avatar">${initials(w.nama)}</div>
      <div class="data-info">
        <div class="name">${esc(w.nama)} <span class="pin-tag">🔒PIN</span></div>
        <div class="detail"><b>${esc(w.gol)}</b> · Blok ${esc(w.blok)} · ${esc(w.status)}</div>
        <div class="detail">💼 ${esc(w.pekerjaan || '-')} · 📱 ${esc(w.hp || '-')}</div>
      </div>
      <div class="data-actions">
        <button class="btn-edit" onclick="editWarga('${w.id}')">✏️</button>
        <button class="btn-del" onclick="deleteWarga('${w.id}')">️</button>
      </div>
    </div>`).join('');
};

const showWargaForm = (w = null) => {
  const e = w !== null;
  openModal(`<div class="modal-header"><h3>${e ? '✏️ Edit' : '＋ Tambah'} Warga</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="form-group"><label>Nama *</label><input type="text" id="wNama" value="${e ? esc(w.nama) : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Blok *</label><input type="text" id="wBlok" value="${e ? esc(w.blok) : ''}"></div>
      <div class="form-group"><label>HP</label><input type="tel" id="wHp" value="${e ? esc(w.hp || '') : ''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Jabatan</label><select id="wGol">${['Warga', 'Ketua RT', 'Sekretaris', 'Bendahara', 'Anggota Keamanan'].map(g => `<option ${e && w.gol === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
      <div class="form-group"><label>Status</label><select id="wStatus">${['Tetap', 'Kontrak', 'Kost'].map(s => `<option ${e && w.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
    </div>
    <div class="form-group"><label>Pekerjaan</label><input type="text" id="wPekerjaan" value="${e ? esc(w.pekerjaan || '') : ''}"></div>
    <div class="form-group"><label>🔐 PIN (4 digit) *</label><input type="text" id="wPin" value="${e ? (w.pin || '1234') : '1234'}" maxlength="4" oninput="this.value=this.value.replace(/[^0-9]/g,'')"></div>
    <button class="btn btn-primary btn-block" onclick="saveWarga('${e ? w.id : ''}')">💾 Simpan</button>`);
};

const saveWarga = editId => {
  const nama = $('wNama').value.trim(), blok = $('wBlok').value.trim(), hp = $('wHp').value.trim(),
    gol = $('wGol').value, status = $('wStatus').value, pekerjaan = $('wPekerjaan').value.trim(), pin = $('wPin').value.trim();
  if (!nama || !blok) { showToast('Nama & Blok wajib', 'error'); return; }
  if (!/^\d{4}$/.test(pin)) { showToast('PIN 4 digit', 'error'); return; }
  const list = appData.warga || [];
  if (editId) {
    const i = list.findIndex(x => x.id === editId);
    if (i !== -1) list[i] = { ...list[i], nama, blok, hp, gol, status, pekerjaan, pin };
  } else list.push({ id: uid('W'), nama, blok, hp, gol, status, pekerjaan, pin });
  appData.warga = list;
  saveData();
  closeModal();
  showToast(editId ? 'Warga diupdate' : 'Warga ditambah');
  populateLoginWarga();
  renderWargaList();
  updateDashboard();
};

const editWarga = id => { const w = appData.warga.find(x => x.id === id); if (w) showWargaForm(w); };
const deleteWarga = id => {
  const w = appData.warga.find(x => x.id === id);
  if (!w) return;
  if (!confirm(`Hapus "${w.nama}"?`)) return;
  appData.warga = appData.warga.filter(x => x.id !== id);
  saveData();
  showToast('Warga dihapus');
  populateLoginWarga();
  renderWargaList();
  updateDashboard();
};
