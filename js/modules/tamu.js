const renderTamu = () => {
  const list = (appData.tamu || []).slice().sort((a, b) => (b.tglMasuk || '').localeCompare(a.tglMasuk || ''));
  $('tamuList').innerHTML = list.length ? list.map(t => {
    const bcl = t.status === 'Menginap' ? 'b-yellow' : 'b-green';
    return `<div class="data-item">
      <div class="data-avatar" style="background:linear-gradient(135deg,#FBCFE8,#F9A8D4)">👤</div>
      <div class="data-info">
        <div class="name">${esc(t.nama)} <span class="badge ${bcl}">${esc(t.status)}</span></div>
        <div class="detail">🏠 Dari <b>${esc(t.asal)}</b>${t.alamat ? ' · ' + esc(t.alamat) : ''}</div>
        <div class="detail">🎯 ${esc(t.keperluan || '-')} · Penjamin: ${esc(t.penjamin || '-')}</div>
        <div class="detail">📅 ${tglPendek(t.tglMasuk)}${t.tglKeluar ? ' → ' + tglPendek(t.tglKeluar) : ' (masih menginap)'}</div>
      </div>
      <div class="data-actions">
        <button class="btn-edit" onclick="editTamu('${t.id}')">️</button>
        <button class="btn-del" onclick="deleteTamu('${t.id}')">🗑️</button>
      </div>
    </div>`;
  }).join('') : emptyState('👤', 'Belum ada tamu');
};

const showTamuForm = (t = null) => {
  const e = t !== null;
  openModal(`<div class="modal-header"><h3>${e ? '✏️ Edit' : '＋ Catat'} Tamu</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="form-row">
      <div class="form-group"><label>Nama Tamu *</label><input type="text" id="tNama" value="${e ? esc(t.nama) : ''}"></div>
      <div class="form-group"><label>Asal *</label><input type="text" id="tAsal" value="${e ? esc(t.asal) : ''}"></div>
    </div>
    <div class="form-group"><label>Alamat</label><input type="text" id="tAlamat" value="${e ? esc(t.alamat || '') : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Keperluan</label><select id="tKeperluan">${['Menginap', 'Kunjungan', 'Kost', 'Bekerja', 'Lainnya'].map(k => `<option ${e && t.keperluan === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
      <div class="form-group"><label>Penjamin</label><select id="tPenjamin">${(appData.warga || []).map(w => `<option value="${esc(w.nama)}" ${e && t.penjamin === w.nama ? 'selected' : ''}>${esc(w.nama)} (${esc(w.blok)})</option>`).join('')}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Tgl Masuk *</label><input type="date" id="tMasuk" value="${e ? t.tglMasuk : today()}"></div>
      <div class="form-group"><label>Tgl Keluar</label><input type="date" id="tKeluar" value="${e ? (t.tglKeluar || '') : ''}"></div>
    </div>
    <div class="form-group"><label>Status</label><select id="tStatus"><option value="Menginap" ${e && t.status === 'Menginap' ? 'selected' : ''}>Menginap</option><option value="Selesai" ${e && t.status === 'Selesai' ? 'selected' : ''}>Selesai</option></select></div>
    <button class="btn btn-primary btn-block" onclick="saveTamu('${e ? t.id : ''}')"> Simpan</button>`);
};

const saveTamu = editId => {
  const nama = $('tNama').value.trim(), asal = $('tAsal').value.trim(), alamat = $('tAlamat').value.trim(),
    keperluan = $('tKeperluan').value, penjamin = $('tPenjamin').value,
    tglMasuk = $('tMasuk').value, tglKeluar = $('tKeluar').value, status = $('tStatus').value;
  if (!nama || !asal || !tglMasuk) { showToast('Nama, Asal & Tgl Masuk wajib', 'error'); return; }
  const list = appData.tamu || [];
  if (editId) {
    const i = list.findIndex(x => x.id === editId);
    if (i !== -1) list[i] = { ...list[i], nama, asal, alamat, keperluan, penjamin, tglMasuk, tglKeluar, status };
  } else list.unshift({ id: uid('T'), nama, asal, alamat, keperluan, penjamin, tglMasuk, tglKeluar, status });
  appData.tamu = list;
  saveData();
  closeModal();
  showToast(editId ? 'Tamu diupdate' : 'Tamu dicatat');
  renderTamu();
};

const editTamu = id => { const t = appData.tamu.find(x => x.id === id); if (t) showTamuForm(t); };
const deleteTamu = id => {
  const t = appData.tamu.find(x => x.id === id);
  if (!t) return;
  if (!confirm(`Hapus "${t.nama}"?`)) return;
  appData.tamu = appData.tamu.filter(x => x.id !== id);
  saveData();
  showToast('Tamu dihapus');
  renderTamu();
};
