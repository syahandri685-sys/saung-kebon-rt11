const renderPengumuman = () => {
  const list = (appData.pengumuman || []).slice().sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || (b.tgl || '').localeCompare(a.tgl || ''));
  $('pengumumanList').innerHTML = list.length ? list.map(p => `
    <div class="data-item">
      <div class="data-avatar" style="background:linear-gradient(135deg,#FDBA74,#FB923C)">📢</div>
      <div class="data-info">
        <div class="name">${esc(p.judul)} ${p.pin ? '' : ''} <span class="badge b-yellow">${esc(p.kat || 'Pengumuman')}</span></div>
        <div class="detail" style="color:var(--ink2);margin-top:4px">${esc(p.isi)}</div>
        <div class="detail">📅 ${tglIndo(p.tgl)} · 👤 ${esc(p.oleh || 'Pengurus')}</div>
      </div>
      <div class="data-actions">
        <button class="btn-edit" onclick="editPengumuman('${p.id}')">✏️</button>
        <button class="btn-del" onclick="deletePengumuman('${p.id}')">🗑️</button>
      </div>
    </div>`).join('') : emptyState('📢', 'Belum ada pengumuman');
};

const showPengumumanForm = (p = null) => {
  const e = p !== null;
  openModal(`<div class="modal-header"><h3>${e ? '✏️ Edit' : '＋ Tambah'} Pengumuman</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="form-group"><label>Judul *</label><input type="text" id="pJudul" value="${e ? esc(p.judul) : ''}"></div>
    <div class="form-group"><label>Kategori</label><select id="pKat">${['Pengumuman', 'Keuangan', 'Kerja Bakti', 'Keamanan', 'Kegiatan', 'Kesehatan', 'Lainnya'].map(k => `<option ${e && p.kat === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
    <div class="form-group"><label>Isi *</label><textarea id="pIsi" rows="4">${e ? esc(p.isi) : ''}</textarea></div>
    <div class="form-group"><label class="check-label"><input type="checkbox" id="pPin" ${e && p.pin ? 'checked' : ''}>  Pin di beranda</label></div>
    <button class="btn btn-primary btn-block" onclick="savePengumuman('${e ? p.id : ''}')">💾 Simpan</button>`);
};

const savePengumuman = editId => {
  const judul = $('pJudul').value.trim(), kat = $('pKat').value, isi = $('pIsi').value.trim(), pin = $('pPin').checked;
  if (!judul || !isi) { showToast('Judul & isi wajib', 'error'); return; }
  const list = appData.pengumuman || [];
  if (editId) {
    const i = list.findIndex(x => x.id === editId);
    if (i !== -1) list[i] = { ...list[i], judul, kat, isi, pin };
  } else list.unshift({ id: uid('P'), judul, kat, isi, pin, tgl: today(), oleh: currentUser.nama });
  appData.pengumuman = list;
  saveData();
  closeModal();
  showToast(editId ? 'Pengumuman diupdate' : 'Pengumuman ditambah');
  renderPengumuman();
  updateDashboard();
};

const editPengumuman = id => { const p = appData.pengumuman.find(x => x.id === id); if (p) showPengumumanForm(p); };
const deletePengumuman = id => {
  if (!confirm('Hapus pengumuman?')) return;
  appData.pengumuman = appData.pengumuman.filter(x => x.id !== id);
  saveData();
  showToast('Pengumuman dihapus');
  renderPengumuman();
  updateDashboard();
};
