const renderRonda = () => {
  const list = (appData.ronda || []).slice().sort((a, b) => (a.tgl || '').localeCompare(b.tgl || ''));
  $('rondaList').innerHTML = list.length ? list.map(r => `
    <div class="data-item">
      <div class="data-avatar" style="background:linear-gradient(135deg,#BFDBFE,#93C5FD)">️</div>
      <div class="data-info">
        <div class="name">${esc(r.shift)} · ${esc(r.waktu || '-')}</div>
        <div class="detail">📅 ${tglIndo(r.tgl)}</div>
        <div class="detail">👤 Petugas: <b>${esc(r.petugas)}</b>${r.blok ? ' (Blok ' + esc(r.blok) + ')' : ''}</div>
        ${r.catatan ? `<div class="detail" style="color:var(--ink2)">📝 ${esc(r.catatan)}</div>` : ''}
      </div>
      <div class="data-actions">
        <button class="btn-edit" onclick="editRonda('${r.id}')">✏️</button>
        <button class="btn-del" onclick="deleteRonda('${r.id}')">🗑️</button>
      </div>
    </div>`).join('') : emptyState('️', 'Belum ada jadwal ronda');
};

const showRondaForm = (r = null) => {
  const e = r !== null;
  openModal(`<div class="modal-header"><h3>${e ? '✏️ Edit' : '＋ Tambah'} Ronda</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="form-row">
      <div class="form-group"><label>Tanggal *</label><input type="date" id="rTgl" value="${e ? r.tgl : today()}"></div>
      <div class="form-group"><label>Shift</label><select id="rShift">${['Malam', 'Dini Hari', 'Pagi', 'Sore'].map(s => `<option ${e && r.shift === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
    </div>
    <div class="form-group"><label>Waktu</label><input type="text" id="rWaktu" value="${e ? esc(r.waktu || '') : ''}" placeholder="22.00 - 02.00"></div>
    <div class="form-group"><label>Petugas</label><select id="rPetugas">${(appData.warga || []).map(w => `<option value="${esc(w.nama)}" data-blok="${esc(w.blok)}" ${e && r.petugas === w.nama ? 'selected' : ''}>${esc(w.nama)} (Blok ${esc(w.blok)})</option>`).join('')}</select></div>
    <div class="form-group"><label>Catatan</label><textarea id="rCatatan" rows="2">${e ? esc(r.catatan || '') : ''}</textarea></div>
    <button class="btn btn-primary btn-block" onclick="saveRonda('${e ? r.id : ''}')">💾 Simpan</button>`);
};

const saveRonda = editId => {
  const tgl = $('rTgl').value, shift = $('rShift').value, waktu = $('rWaktu').value.trim();
  const sel = $('rPetugas'), petugas = sel.value, blok = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].dataset.blok : '';
  const catatan = $('rCatatan').value.trim();
  if (!tgl) { showToast('Tanggal wajib', 'error'); return; }
  const list = appData.ronda || [];
  if (editId) {
    const i = list.findIndex(x => x.id === editId);
    if (i !== -1) list[i] = { ...list[i], tgl, shift, waktu, petugas, blok, catatan };
  } else list.unshift({ id: uid('R'), tgl, shift, waktu, petugas, blok, catatan });
  appData.ronda = list;
  saveData();
  closeModal();
  showToast(editId ? 'Ronda diupdate' : 'Ronda ditambah');
  renderRonda();
};

const editRonda = id => { const r = appData.ronda.find(x => x.id === id); if (r) showRondaForm(r); };
const deleteRonda = id => {
  if (!confirm('Hapus jadwal ronda?')) return;
  appData.ronda = appData.ronda.filter(x => x.id !== id);
  saveData();
  showToast('Ronda dihapus');
  renderRonda();
};
