const PAGES = ['home', 'warga', 'iuran', 'keuangan', 'setoran', 'pengumuman', 'pengaduan', 'ronda', 'surat', 'tamu', 'voting', 'akun'];

const NAV_ITEMS = [
  { id: 'home', icon: '🏠', label: 'Beranda' },
  { id: 'warga', icon: '👥', label: 'Warga' },
  { id: 'iuran', icon: '✅', label: 'Iuran' },
  { id: 'keuangan', icon: '💰', label: 'Keuangan' },
  { id: 'setoran', icon: '📤', label: 'Setoran' },
  { id: 'pengumuman', icon: '📢', label: 'Pengumuman' },
  { id: 'pengaduan', icon: '🚨', label: 'Pengaduan' },
  { id: 'ronda', icon: '🛡️', label: 'Ronda' },
  { id: 'surat', icon: '✉️', label: 'Surat' },
  { id: 'tamu', icon: '👤', label: 'Tamu' },
  { id: 'voting', icon: '🗳️', label: 'Voting' },
  { id: 'akun', icon: '⚙️', label: 'Akun' }
];

const buildSidebar = () => {
  $('sidebarMenu').innerHTML = NAV_ITEMS.map(n =>
    `<div class="sidebar-item" data-page="${n.id}" onclick="showPage('${n.id}')"><span class="icon">${n.icon}</span>${n.label}</div>`
  ).join('');
};

const buildHomeMenu = () => {
  $('homeMenu').innerHTML = NAV_ITEMS.filter(n => n.id !== 'home' && n.id !== 'akun').map(n => {
    const cls = { warga: 'mi-blue', iuran: 'mi-green', keuangan: 'mi-orange', setoran: 'mi-indigo', pengumuman: 'mi-yellow', pengaduan: 'mi-red', ronda: 'mi-purple', surat: 'mi-teal', tamu: 'mi-pink', voting: 'mi-lime' }[n.id] || 'mi-blue';
    return `<div class="menu-item" onclick="showPage('${n.id}')"><div class="menu-icon ${cls}">${n.icon}</div><span>${n.label}</span></div>`;
  }).join('');
};

const showPage = page => {
  if (!PAGES.includes(page)) page = 'home';
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = $('page' + page.charAt(0).toUpperCase() + page.slice(1));
  if (el) el.classList.add('active');
  document.querySelectorAll('.sidebar-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  refreshCurrentPage();
  window.scrollTo({ top: 0 });
};

const refreshCurrentPage = () => {
  updateDashboard();
  buildSidebar();
  switch (currentPage) {
    case 'warga': renderWargaList(); break;
    case 'iuran': renderIuranList(); break;
    case 'keuangan': buildKasBulan(); applyFilter(); break;
    case 'setoran': buildSetorBulan(); renderSetoran(); break;
    case 'pengumuman': renderPengumuman(); break;
    case 'pengaduan': renderPengaduan(); break;
    case 'ronda': renderRonda(); break;
    case 'surat': renderSurat(); break;
    case 'tamu': renderTamu(); break;
    case 'voting': renderVoting(); break;
    case 'akun': renderAkun(); break;
  }
};

const updateDashboard = () => {
  const kas = appData.kas || [];
  const saldo = kas.reduce((s, k) => s + (k.tipe === 'Masuk' ? k.nominal : -k.nominal), 0);
  const masuk = kas.filter(k => k.tipe === 'Masuk').reduce((s, k) => s + k.nominal, 0);
  const keluar = kas.filter(k => k.tipe === 'Keluar').reduce((s, k) => s + k.nominal, 0);
  $('hSaldo').textContent = rp(saldo);
  $('hMasuk').textContent = rp(masuk);
  $('hKeluar').textContent = rp(keluar);
  $('hWarga').textContent = (appData.warga || []).length;
  const bln = bulanIni();
  const lunas = (appData.iuran || []).filter(i => i.bulan === bln && i.status === 'Lunas').length;
  const tot = (appData.warga || []).length;
  $('hIuran').textContent = lunas + '/' + tot;
  const pct = tot > 0 ? Math.round(lunas / tot * 100) : 0;
  $('hIuranPct').textContent = pct + '%';
  $('hIuranBar').style.width = pct + '%';
  $('hLapor').textContent = (appData.lapor || []).filter(l => l.status !== 'Selesai').length;
  const p = (appData.pengumuman || []).find(x => x.pin) || (appData.pengumuman || [])[0];
  if (p) {
    $('annCategory').textContent = p.kat;
    $('annTitle').textContent = p.judul;
    $('annDesc').textContent = p.isi;
    $('annDate').textContent = '📅 ' + tglIndo(p.tgl);
  }
  const badge = $('notifBadge');
  const c = (appData.lapor || []).filter(l => l.status === 'Baru').length;
  badge.textContent = c;
  badge.classList.toggle('show', c > 0);
};

const showNotif = () => {
  openModal(`<div class="modal-header"><h3>🔔 Notifikasi</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="padding:12px;background:#FEF3C7;border-radius:12px;border-left:4px solid #F59E0B"><b>💰 Iuran Oktober</b><div style="font-size:12px;color:#6B7280">Segera bayar</div></div>
      <div style="padding:12px;background:#DBEAFE;border-radius:12px;border-left:4px solid #3B82F6"><b>📢 Kerja Bakti</b><div style="font-size:12px;color:#6B7280">Sabtu 07.00</div></div>
    </div>`);
};

const showAnnouncementDetail = () => {
  const p = (appData.pengumuman || []).find(x => x.pin) || (appData.pengumuman || [])[0];
  if (!p) return;
  openModal(`<div class="modal-header"><h3>📢 ${esc(p.judul)}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <span class="badge b-yellow">${esc(p.kat)}</span>
    <p style="margin:12px 0;line-height:1.7">${esc(p.isi)}</p>
    <div style="font-size:12px;color:#9CA3AF">📅 ${tglIndo(p.tgl)} · ${esc(p.oleh || '')}</div>`);
};
