const renderIuranList = () => {
  const bln = bulanIni();
  const nom = appData.rt.iuranNominal || 50000;
  const map = {};
  (appData.iuran || []).filter(i => i.bulan === bln).forEach(i => map[i.wargaId] = i);
  const list = appData.warga || [];
  const lunas = list.filter(w => map[w.id] && map[w.id].status === 'Lunas').length;
  $('iuranNominalLabel').textContent = rp(nom);
  const el = $('iuranList');
  if (!list.length) { el.innerHTML = emptyState('✅', 'Belum ada warga'); return; }
  el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding:12px;background:#F9FAFB;border-radius:12px">
    <div><b>${labelBulan(bln)}</b> · ${rp(nom)}/warga</div>
    <div class="badge ${lunas === list.length ? 'b-green' : 'b-yellow'}">${lunas}/${list.length} lunas</div>
  </div>` + list.map(w => {
    const rec = map[w.id];
    const isL = rec && rec.status === 'Lunas';
    return `<div class="data-item" style="${isL ? 'border-color:#BBF7D0;background:#F0FDF4' : ''}">
      <div class="data-avatar" style="${isL ? 'background:linear-gradient(135deg,#10B981,#059669)' : ''}">${isL ? '✅' : ''}</div>
      <div class="data-info">
        <div class="name">${esc(w.nama)} (Blok ${esc(w.blok)})</div>
        <div class="detail">${isL ? 'Lunas ' + tglPendek(rec.tgl) : 'Belum bayar'}</div>
      </div>
      ${!isL ? `<button class="btn btn-primary" style="width:auto;padding:8px 14px;font-size:12px" onclick="quickSetor('${w.id}')">💰 Setor</button>` : `<span class="badge b-green">LUNAS</span>`}
    </div>`;
  }).join('');
};

const quickSetor = wargaId => {
  currentUser = appData.warga.find(w => w.id === wargaId) || currentUser;
  showPage('setoran');
  setTimeout(() => { $('setorBulan').value = bulanIni(); }, 100);
  showToast('Form siap, upload bukti & kirim');
};

const toggleIuran = (wargaId, bulan, nom) => {
  const list = appData.iuran || [];
  const i = list.findIndex(x => x.wargaId === wargaId && x.bulan === bulan);
  const w = appData.warga.find(x => x.id === wargaId);
  if (i !== -1) {
    const cur = list[i];
    if (cur.status === 'Lunas') {
      if (!confirm(`Batalkan LUNAS untuk ${w ? w.nama : 'warga'}?`)) return;
      list[i] = { ...cur, status: 'Belum', tgl: null };
    } else {
      list[i] = { ...cur, status: 'Lunas', tgl: today(), nominal: cur.nominal || nom };
    }
  } else {
    list.push({ id: uid('I'), wargaId, bulan, nominal: nom, status: 'Lunas', tgl: today() });
  }
  appData.iuran = list;
  saveData();
  showToast('Status iuran diperbarui');
  renderIuranList();
  updateDashboard();
};

const ubahNominalIuran = () => {
  const v = prompt('Nominal iuran baru (angka):', appData.rt.iuranNominal);
  if (v === null) return;
  const n = parseInt(String(v).replace(/[^0-9]/g, ''));
  if (!n || n < 1000) { showToast('Nominal tidak valid', 'error'); return; }
  const rt = { ...appData.rt, iuranNominal: n };
  appData.rt = rt;
  saveData();
  showToast('Nominal diubah ke ' + rp(n));
  renderIuranList();
};
