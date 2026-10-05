const renderPengaduan = () => {
  const list = (appData.lapor || []).slice().sort((a, b) => (b.tgl || '').localeCompare(a.tgl || ''));
  $('pengaduanList').innerHTML = list.length ? list.map(l => {
    const w = appData.warga.find(x => x.id === l.wargaId);
    const bcl = l.status === 'Selesai' ? 'b-green' : l.status === 'Diproses' ? 'b-blue' : l.status === 'Ditolak' ? 'b-red' : 'b-yellow';
    return `<div class="data-item">
      <div class="data-avatar" style="background:linear-gradient(135deg,#FECACA,#FCA5A5)">🚨</div>
      <div class="data-info">
        <div class="name">${esc(l.judul)} <span class="badge ${bcl}">${esc(l.status)}</span></div>
        <div class="detail"><span class="badge b-gray">${esc(l.kat)}</span> · Prioritas ${esc(l.prio || 'Sedang')}</div>
        <div class="detail" style="color:var(--ink2);margin-top:4px">${esc(l.isi)}</div>
        <div class="detail">👤 ${esc(w ? w.nama : 'Warga')} · 📅 ${tglIndo(l.tgl)}</div>
      </div>
      <div class="data-actions">
        <button class="btn-edit" onclick="editLapor('${l.id}')">✏️</button>
        <button class="btn-del" onclick="deleteLapor('${l.id}')">🗑️</button>
      </div>
    </div>`;
  }).join('') : emptyState('🚨', 'Belum ada pengaduan');
};

const showLaporForm = (l = null) => {
  const e = l !== null;
  openModal(`<div class="modal-header"><h3>${e ? '✏️ Edit' : '🚨 Lapor'} Masalah</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="form-row">
      <div class="form-group"><label>Kategori</label><select id="lKat">${['Infrastruktur', 'Keamanan', 'Kebersihan', 'Sosial', 'Penerangan', 'Lainnya'].map(k => `<option ${e && l.kat === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
      <div class="form-group"><label>Prioritas</label><select id="lPrio">${['Rendah', 'Sedang', 'Tinggi', 'Darurat'].map(p => `<option ${e && l.prio === p ? 'selected' : ''} ${!e && p === 'Sedang' ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
    </div>
    <div class="form-group"><label>Judul *</label><input type="text" id="lJudul" value="${e ? esc(l.judul) : ''}"></div>
    <div class="form-group"><label>Deskripsi *</label><textarea id="lIsi" rows="4">${e ? esc(l.isi) : ''}</textarea></div>
    ${isStaff() ? `<div class="form-group"><label>Status</label><select id="lStatus">${['Baru', 'Diproses', 'Selesai', 'Ditolak'].map(s => `<option value="${s}" ${e && l.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>` : ''}
    <button class="btn btn-primary btn-block" onclick="saveLapor('${e ? l.id : ''}')">📤 ${e ? 'Simpan' : 'Kirim'}</button>`);
};

const saveLapor = editId => {
  const kat = $('lKat').value, prio = $('lPrio').value, judul = $('lJudul').value.trim(), isi = $('lIsi').value.trim();
  const statusEl = $('lStatus');
  const status = statusEl ? statusEl.value : (editId ? (appData.lapor.find(x => x.id === editId) || {}).status || 'Baru' : 'Baru');
  if (!judul || !isi) { showToast('Judul & deskripsi wajib', 'error'); return; }
  const list = appData.lapor || [];
  if (editId) {
    const i = list.findIndex(x => x.id === editId);
    if (i !== -1) list[i] = { ...list[i], kat, prio, judul, isi, status };
  } else list.unshift({ id: uid('L'), wargaId: currentUser.id, kat, prio, judul, isi, status, tgl: today() });
  appData.lapor = list;
  saveData();
  closeModal();
  showToast(editId ? 'Laporan diupdate' : 'Laporan terkirim');
  renderPengaduan();
  updateDashboard();
};

const editLapor = id => { const l = appData.lapor.find(x => x.id === id); if (l) showLaporForm(l); };
const deleteLapor = id => {
  if (!confirm('Hapus laporan?')) return;
  appData.lapor = appData.lapor.filter(x => x.id !== id);
  saveData();
  showToast('Laporan dihapus');
  renderPengaduan();
  updateDashboard();
};
