const buildKasBulan = () => {
  const sel = $('filterBulan');
  const set = new Set([bulanIni()]);
  (appData.kas || []).forEach(k => { if (k.tgl) set.add(k.tgl.slice(0, 7)); });
  sel.innerHTML = [...set].sort().reverse().map(b => `<option value="${b}" ${b === bulanIni() ? 'selected' : ''}>${labelBulan(b)}</option>`).join('');
};

const applyFilter = () => {
  const bln = $('filterBulan').value, per = $('filterPeriode').value;
  const filtered = (appData.kas || []).filter(k => {
    if (!k.tgl) return false;
    return per === 'semua' ? true : k.tgl.startsWith(bln);
  }).sort((a, b) => (b.tgl || '').localeCompare(a.tgl || ''));
  const saldo = filtered.reduce((s, k) => s + (k.tipe === 'Masuk' ? k.nominal : -k.nominal), 0);
  const masuk = filtered.filter(k => k.tipe === 'Masuk').reduce((s, k) => s + k.nominal, 0);
  const keluar = filtered.filter(k => k.tipe === 'Keluar').reduce((s, k) => s + k.nominal, 0);
  $('kSaldo').textContent = rp(saldo);
  $('kMasuk').textContent = rp(masuk);
  $('kKeluar').textContent = rp(keluar);
  $('mutasiList').innerHTML = filtered.length ? filtered.map(k => `
    <div class="row-item">
      <div>
        <div class="ri-title">${esc(k.urai)} <span class="badge ${k.tipe === 'Masuk' ? 'b-green' : 'b-red'}">${k.tipe}</span></div>
        <div class="ri-meta">${esc(k.kat)} · ${tglIndo(k.tgl)}</div>
      </div>
      <div class="ri-amt ${k.tipe === 'Masuk' ? 'amt-in' : 'amt-out'}">${k.tipe === 'Masuk' ? '+' : '-'}${rp(k.nominal)}</div>
    </div>`).join('') : emptyState('📊', 'Tidak ada transaksi');
};

const resetFilter = () => { $('filterBulan').value = bulanIni(); $('filterPeriode').value = 'bulan'; applyFilter(); };

const showTambahTransaksi = (edit = null) => {
  const e = edit !== null;
  openModal(`<div class="modal-header"><h3>${e ? '✏️ Edit' : '＋ Tambah'} Transaksi</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="form-row">
      <div class="form-group"><label>Tipe</label><select id="tTipe"><option value="Masuk" ${e && edit.tipe === 'Masuk' ? 'selected' : ''}>Masuk</option><option value="Keluar" ${e && edit.tipe === 'Keluar' ? 'selected' : ''}>Keluar</option></select></div>
      <div class="form-group"><label>Kategori</label><select id="tKat">${['Iuran', 'Donasi', 'Kebersihan', 'Keamanan', 'Kegiatan', 'Administrasi', 'Lainnya'].map(k => `<option ${e && edit.kat === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
    </div>
    <div class="form-group"><label>Uraian *</label><input type="text" id="tUrai" value="${e ? esc(edit.urai) : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Nominal *</label><input type="number" id="tNominal" value="${e ? edit.nominal : ''}"></div>
      <div class="form-group"><label>Tanggal</label><input type="date" id="tTgl" value="${e ? edit.tgl : today()}"></div>
    </div>
    <button class="btn btn-primary btn-block" onclick="saveTransaksi('${e ? edit.id : ''}')">💾 Simpan</button>`);
};

const saveTransaksi = editId => {
  const tipe = $('tTipe').value, kat = $('tKat').value, urai = $('tUrai').value.trim(),
    nominal = parseInt($('tNominal').value), tgl = $('tTgl').value;
  if (!urai || !nominal) { showToast('Lengkapi field', 'error'); return; }
  const list = appData.kas || [];
  if (editId) {
    const i = list.findIndex(x => x.id === editId);
    if (i !== -1) list[i] = { ...list[i], tipe, kat, urai, nominal, tgl };
  } else list.unshift({ id: uid('K'), tgl, tipe, kat, urai, nominal });
  appData.kas = list;
  saveData();
  closeModal();
  showToast('Transaksi disimpan');
  buildKasBulan();
  applyFilter();
  updateDashboard();
};

const editTransaksi = id => { const k = appData.kas.find(x => x.id === id); if (k) showTambahTransaksi(k); };
const deleteTransaksi = id => {
  const k = appData.kas.find(x => x.id === id);
  if (!k) return;
  if (!confirm(`Hapus "${k.urai}"?`)) return;
  appData.kas = appData.kas.filter(x => x.id !== id);
  saveData();
  showToast('Transaksi dihapus');
  applyFilter();
  updateDashboard();
};
