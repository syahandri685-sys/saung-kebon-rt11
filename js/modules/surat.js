const renderSurat = () => {
  const list = (appData.surat || []).slice().sort((a, b) => (b.tgl || '').localeCompare(a.tgl || ''));
  $('suratList').innerHTML = list.length ? list.map(s => {
    const w = appData.warga.find(x => x.id === s.wargaId);
    const bcl = s.status === 'Selesai' ? 'b-green' : s.status === 'Diproses' ? 'b-blue' : s.status === 'Ditolak' ? 'b-red' : 'b-yellow';
    return `<div class="data-item">
      <div class="data-avatar" style="background:linear-gradient(135deg,#FDE68A,#FCD34D)"></div>
      <div class="data-info">
        <div class="name">${esc(s.jenis)} <span class="badge ${bcl}">${esc(s.status)}</span></div>
        <div class="detail">👤 Pemohon: <b>${esc(w ? w.nama : '-')}</b> ${s.noSurat ? '· No. ' + esc(s.noSurat) : '· Belum bernomor'}</div>
        <div class="detail" style="color:var(--ink2)"> ${esc(s.keperluan || '-')}</div>
        <div class="detail">📅 Diajukan ${tglIndo(s.tgl)}</div>
      </div>
      <div class="data-actions">
        <button class="btn-edit" onclick="editSurat('${s.id}')">✏️</button>
        <button class="btn-del" onclick="deleteSurat('${s.id}')">️</button>
      </div>
    </div>`;
  }).join('') : emptyState('📄', 'Belum ada pengajuan surat');
};

const showSuratForm = (s = null) => {
  const e = s !== null;
  openModal(`<div class="modal-header"><h3>${e ? '✏️ Edit' : '＋ Ajukan'} Surat</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="form-group"><label>Pemohon</label><select id="sWarga">${(appData.warga || []).map(w => `<option value="${w.id}" ${e && s.wargaId === w.id ? 'selected' : ''} ${!e && currentUser && w.id === currentUser.id ? 'selected' : ''}>${esc(w.nama)} (Blok ${esc(w.blok)})</option>`).join('')}</select></div>
    <div class="form-group"><label>Jenis Surat</label><select id="sJenis">${['Surat Keterangan Domisili', 'Surat Tidak Mampu (SKTM)', 'Pengantar KTP', 'Pengantar KK', 'Pengantar SKCK', 'Pengantar Usaha', 'Izin Keramaian', 'Lainnya'].map(j => `<option ${e && s.jenis === j ? 'selected' : ''}>${j}</option>`).join('')}</select></div>
    <div class="form-group"><label>Keperluan *</label><textarea id="sKeperluan" rows="3">${e ? esc(s.keperluan || '') : ''}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label>Status</label><select id="sStatus">${['Diajukan', 'Diproses', 'Selesai', 'Ditolak'].map(x => `<option value="${x}" ${e && s.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="form-group"><label>Nomor Surat</label><input type="text" id="sNo" value="${e ? esc(s.noSurat || '') : ''}" placeholder="001/RT11/X/2026"></div>
    </div>
    <button class="btn btn-primary btn-block" onclick="saveSurat('${e ? s.id : ''}')">💾 Simpan</button>`);
};

const saveSurat = editId => {
  const wargaId = $('sWarga').value, jenis = $('sJenis').value, keperluan = $('sKeperluan').value.trim(),
    status = $('sStatus').value, noSurat = $('sNo').value.trim();
  if (!keperluan) { showToast('Keperluan wajib', 'error'); return; }
  const list = appData.surat || [];
  if (editId) {
    const i = list.findIndex(x => x.id === editId);
    if (i !== -1) list[i] = { ...list[i], wargaId, jenis, keperluan, status, noSurat };
  } else list.unshift({ id: uid('S'), wargaId, jenis, keperluan, status, noSurat, tgl: today() });
  appData.surat = list;
  saveData();
  closeModal();
  showToast(editId ? 'Surat diupdate' : 'Surat diajukan');
  renderSurat();
};

const editSurat = id => { const s = appData.surat.find(x => x.id === id); if (s) showSuratForm(s); };
const deleteSurat = id => {
  const s = appData.surat.find(x => x.id === id);
  if (!s) return;
  if (!confirm(`Hapus "${s.jenis}"?`)) return;
  appData.surat = appData.surat.filter(x => x.id !== id);
  saveData();
  showToast('Surat dihapus');
  renderSurat();
};
