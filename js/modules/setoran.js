const buildSetorBulan = () => {
  const sel = $('setorBulan');
  const set = new Set([bulanIni()]);
  const d = new Date();
  for (let i = -3; i < 6; i++) {
    const x = new Date(d.getFullYear(), d.getMonth() + i, 1);
    set.add(x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0'));
  }
  (appData.setoran || []).forEach(s => set.add(s.bulan));
  const arr = [...set].sort().reverse();
  sel.innerHTML = arr.map(b => `<option value="${b}" ${b === bulanIni() ? 'selected' : ''}>${labelBulan(b)}</option>`).join('');
  $('setorNominal').value = appData.rt.iuranNominal || 50000;
  uploadedPhotos = [];
  renderPhotoPreview();
};

const submitSetoran = () => {
  const bulan = $('setorBulan').value, nominal = parseInt($('setorNominal').value),
    metode = $('setorMetode').value, catatan = $('setorCatatan').value.trim();
  if (!nominal || nominal < 1000) { showToast('Nominal min 1000', 'error'); return; }
  const buktiArray = uploadedPhotos.map(p => p.src);
  const list = appData.setoran || [];
  list.unshift({
    id: uid('S'), wargaId: currentUser.id, namaWarga: currentUser.nama, blok: currentUser.blok,
    bulan, nominal, metode, catatan, bukti: buktiArray, status: 'Pending',
    tglSetor: today(), tglKonfirmasi: null, dikonfirmasiOleh: null, alasan: ''
  });
  appData.setoran = list;
  saveData();
  showToast('Setoran terkirim! (' + buktiArray.length + ' foto)');
  $('setorCatatan').value = '';
  $('setorBukti').value = '';
  uploadedPhotos = [];
  renderPhotoPreview();
  renderSetoran();
  updateDashboard();
};

const renderSetoran = () => {
  const cc = $('konfirmasiCard');
  if (isStaff()) {
    cc.style.display = 'block';
    const pending = (appData.setoran || []).filter(s => s.status === 'Pending');
    $('pendingCount').textContent = pending.length;
    $('konfirmasiList').innerHTML = pending.length ? pending.map(s => setoranRow(true, s)).join('') : emptyState('⏳', 'Tidak ada setoran menunggu');
  } else cc.style.display = 'none';
  renderRiwayatSaya();
};

const renderRiwayatSaya = () => {
  const mine = (appData.setoran || []).filter(s => s.wargaId === currentUser.id);
  const lunas = mine.filter(s => s.status === 'Dikonfirmasi').length;
  const pending = mine.filter(s => s.status === 'Pending').length;
  const ditolak = mine.filter(s => s.status === 'Ditolak').length;
  $('rsLunas').textContent = lunas;
  $('rsPending').textContent = pending;
  $('rsDitolak').textContent = ditolak;
  const el = $('riwayatList');
  if (!mine.length) { el.innerHTML = emptyState('📤', 'Belum ada setoran'); return; }
  el.innerHTML = mine.map(s => {
    const bcl = s.status === 'Pending' ? 'b-yellow' : s.status === 'Dikonfirmasi' ? 'b-green' : 'b-red';
    const bicon = s.status === 'Pending' ? '⏳' : s.status === 'Dikonfirmasi' ? '✅' : '';
    const fotoCount = Array.isArray(s.bukti) ? s.bukti.length : (s.bukti ? 1 : 0);
    return `<div class="data-item">
      <div class="data-avatar" style="background:linear-gradient(135deg,#6366F1,#4F46E5)">📤</div>
      <div class="data-info">
        <div class="name">${labelBulan(s.bulan)} <span class="badge ${bcl}">${bicon} ${s.status}</span></div>
        <div class="detail">💰 <b>${rp(s.nominal)}</b> · ${esc(s.metode)}</div>
        <div class="detail"> Disetor ${tglIndo(s.tglSetor)}${s.tglKonfirmasi ? ' · ' + s.status + ' ' + tglIndo(s.tglKonfirmasi) : ''}</div>
        ${fotoCount > 0 ? `<div class="detail"><span style="color:#3B82F6;cursor:pointer;font-weight:700" onclick="viewBuktiGallery('${s.id}')">🖼️ Lihat ${fotoCount} foto bukti</span></div>` : ''}
        ${s.alasan ? `<div class="detail" style="color:#DC2626"> ${esc(s.alasan)}</div>` : ''}
        ${s.catatan ? `<div class="detail" style="color:#6B7280">💬 ${esc(s.catatan)}</div>` : ''}
      </div>
    </div>`;
  }).join('');
};

const viewBuktiGallery = setoranId => {
  const s = appData.setoran.find(x => x.id === setoranId);
  if (!s || !s.bukti) return;
  const fotos = Array.isArray(s.bukti) ? s.bukti : [s.bukti];
  if (fotos.length === 1) { viewBukti(fotos[0]); return; }
  let currentIdx = 0;
  const showFoto = idx => {
    $('lightboxImg').src = fotos[idx];
    $('lightbox').classList.add('active');
  };
  showFoto(0);
  setTimeout(() => {
    if (fotos.length > 1) {
      const nav = document.createElement('div');
      nav.id = 'lightboxNav';
      nav.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);display:flex;gap:10px;z-index:6001';
      nav.innerHTML = `
        <button onclick="event.stopPropagation();lightboxNav(-1)" style="background:#fff;border:none;padding:10px 16px;border-radius:10px;font-weight:700;cursor:pointer">← Sebelumnya</button>
        <span style="background:#fff;padding:10px 16px;border-radius:10px;font-weight:700">${currentIdx + 1}/${fotos.length}</span>
        <button onclick="event.stopPropagation();lightboxNav(1)" style="background:#fff;border:none;padding:10px 16px;border-radius:10px;font-weight:700;cursor:pointer">Selanjutnya →</button>`;
      document.body.appendChild(nav);
      window.lightboxNav = dir => {
        currentIdx = Math.max(0, Math.min(fotos.length - 1, currentIdx + dir));
        showFoto(currentIdx);
        const span = nav.querySelector('span');
        if (span) span.textContent = `${currentIdx + 1}/${fotos.length}`;
      };
    }
  }, 100);
};

const setoranRow = (isKonfirm, s) => {
  const w = appData.warga.find(x => x.id === s.wargaId);
  const bcl = s.status === 'Pending' ? 'b-yellow' : s.status === 'Dikonfirmasi' ? 'b-green' : 'b-red';
  const bicon = s.status === 'Pending' ? '' : s.status === 'Dikonfirmasi' ? '✅' : '❌';
  const who = isKonfirm ? `<b>${esc(w ? w.nama : s.namaWarga)}</b> (Blok ${esc(w ? w.blok : s.blok)})` : '';
  const fotoCount = Array.isArray(s.bukti) ? s.bukti.length : (s.bukti ? 1 : 0);
  let actions = '';
  if (isKonfirm && s.status === 'Pending') {
    actions = `<div class="data-actions"><button class="btn-edit" style="background:#D1FAE5;color:#065F46" onclick="konfirmasiSetoran('${s.id}',true)">✅ Terima</button><button class="btn-del" onclick="konfirmasiSetoran('${s.id}',false)">❌ Tolak</button></div>`;
  }
  return `<div class="data-item">
    <div class="data-avatar" style="background:linear-gradient(135deg,#6366F1,#4F46E5)">📤</div>
    <div class="data-info">
      <div class="name">${who || labelBulan(s.bulan)} <span class="badge ${bcl}">${bicon} ${s.status}</span></div>
      <div class="detail">💰 <b>${rp(s.nominal)}</b> · ${esc(s.metode)}</div>
      <div class="detail"> Disetor ${tglIndo(s.tglSetor)}${s.tglKonfirmasi ? ' · ' + s.status + ' ' + tglIndo(s.tglKonfirmasi) : ''}</div>
      ${fotoCount > 0 ? `<div class="detail"><span style="color:#3B82F6;cursor:pointer;font-weight:700" onclick="viewBuktiGallery('${s.id}')">️ Lihat ${fotoCount} foto</span></div>` : ''}
      ${s.alasan ? `<div class="detail" style="color:#DC2626">📝 ${esc(s.alasan)}</div>` : ''}
    </div>
    ${actions}
  </div>`;
};

const konfirmasiSetoran = (id, accept) => {
  const s = appData.setoran.find(x => x.id === id);
  if (!s) return;
  if (accept) {
    if (!confirm(`Terima setoran ${rp(s.nominal)} dari ${s.namaWarga}?`)) return;
    s.status = 'Dikonfirmasi';
    s.tglKonfirmasi = today();
    s.dikonfirmasiOleh = currentUser.nama;
    const kas = appData.kas || [];
    kas.unshift({ id: uid('K'), tgl: today(), tipe: 'Masuk', kat: 'Iuran', urai: `Setoran ${labelBulan(s.bulan)} - ${s.namaWarga}`, nominal: s.nominal });
    const iuran = appData.iuran || [];
    const ii = iuran.findIndex(x => x.wargaId === s.wargaId && x.bulan === s.bulan);
    if (ii !== -1) { iuran[ii] = { ...iuran[ii], status: 'Lunas', tgl: today() }; }
    else iuran.push({ id: uid('I'), wargaId: s.wargaId, bulan: s.bulan, nominal: s.nominal, status: 'Lunas', tgl: today() });
    appData.kas = kas;
    appData.iuran = iuran;
    saveData();
    showToast('Setoran diterima & kas diupdate');
    renderSetoran();
    updateDashboard();
  } else {
    const alasan = prompt('Alasan penolakan (wajib):');
    if (!alasan) { showToast('Alasan wajib', 'error'); return; }
    s.status = 'Ditolak';
    s.tglKonfirmasi = today();
    s.dikonfirmasiOleh = currentUser.nama;
    s.alasan = alasan;
    saveData();
    showToast('Setoran ditolak');
    renderSetoran();
    updateDashboard();
  }
};
