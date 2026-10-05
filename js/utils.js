const $ = id => document.getElementById(id);
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rp = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const tglIndo = s => {
  if (!s) return '-';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
};

const tglPendek = s => {
  if (!s) return '-';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.getDate() + ' ' + BULAN[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear();
};

const uid = p => p + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
const today = () => new Date().toISOString().split('T')[0];
const bulanIni = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
};
const labelBulan = k => {
  if (!k) return '-';
  const [y, m] = k.split('-');
  return BULAN[Number(m) - 1] + ' ' + y;
};
const initials = n => String(n || '?').trim().split(/\s+/).map(x => x[0]).join('').substr(0, 2).toUpperCase();

const showToast = (msg, type = 'success') => {
  const t = $('toast');
  t.textContent = (type === 'error' ? ' ' : type === 'info' ? 'ℹ️ ' : '✅ ') + msg;
  t.className = 'toast show ' + type;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.className = 'toast', 3200);
};

const showUpdateIndicator = () => {
  const i = $('updateIndicator');
  i.classList.add('show');
  clearTimeout(showUpdateIndicator._t);
  showUpdateIndicator._t = setTimeout(() => i.classList.remove('show'), 2200);
};

const roleLevel = r => ({ 'Ketua RT': 4, 'Bendahara': 3, 'Sekretaris': 3, 'Anggota Keamanan': 2, 'Warga': 1 }[r] || 1);
const isStaff = () => currentUser && roleLevel(currentUser.gol) >= 3;

const emptyState = (icon, text) => `<div class="empty"><div class="empty-icon">${icon}</div><p>${esc(text)}</p></div>`;

const loadData = () => {
  try {
    const d = localStorage.getItem('saungkebon_data');
    if (d) { appData = JSON.parse(d); }
    else { appData = JSON.parse(JSON.stringify(defaultData)); saveData(); }
  } catch (e) { appData = JSON.parse(JSON.stringify(defaultData)); }
};

const saveData = () => {
  try { localStorage.setItem('saungkebon_data', JSON.stringify(appData)); } catch (e) {}
};

const normalizeData = () => {
  if (!appData.rt) appData.rt = defaultData.rt;
  if (!appData.rt.bank) appData.rt.bank = defaultData.rt.bank;
  if (appData.rt.iuranNominal == null) appData.rt.iuranNominal = 50000;
  if (!Array.isArray(appData.warga)) appData.warga = [];
  appData.warga.forEach(w => { if (!w.pin) w.pin = '1234'; });
  ['iuran', 'kas', 'setoran', 'pengumuman', 'lapor', 'tamu', 'surat', 'voting', 'ronda'].forEach(k => {
    if (!Array.isArray(appData[k])) appData[k] = [];
  });
};

const salinRekening = () => {
  const rek = (appData.rt.bank || {}).rek || '';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(rek).then(() => showToast('Rekening disalin'));
  } else showToast('Gagal salin', 'error');
};

const openModal = html => { $('modalContent').innerHTML = html; $('modal').classList.add('active'); };
const closeModal = () => $('modal').classList.remove('active');

const viewBukti = src => { $('lightboxImg').src = src; $('lightbox').classList.add('active'); };

const handleMultiplePhotos = input => {
  const files = Array.from(input.files || []);
  let processed = 0;
  files.forEach(file => {
    if (file.size > 1024 * 1024) { showToast(`${file.name} terlalu besar (maks 1 MB)`, 'error'); processed++; return; }
    if (!file.type.startsWith('image/')) { showToast(`${file.name} bukan gambar`, 'error'); processed++; return; }
    const reader = new FileReader();
    reader.onload = e => {
      uploadedPhotos.push({ name: file.name, src: e.target.result });
      processed++;
      if (processed === files.length) renderPhotoPreview();
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
};

const renderPhotoPreview = () => {
  const grid = $('buktiPreviewGrid');
  const count = $('photoCount');
  if (!uploadedPhotos.length) { grid.innerHTML = ''; count.textContent = '0 foto'; return; }
  grid.innerHTML = uploadedPhotos.map((p, i) => `
    <div class="photo-preview-item">
      <img src="${p.src}" onclick="viewBukti('${p.src.replace(/'/g, "\\'")}')">
      <button class="remove-photo" onclick="removePhoto(${i})">✕</button>
    </div>`).join('');
  count.textContent = `${uploadedPhotos.length} foto dipilih`;
};

const removePhoto = index => { uploadedPhotos.splice(index, 1); renderPhotoPreview(); };

let appData, currentUser = null, currentPage = 'home';
let uploadedPhotos = [];
let notifState = { lastNotifCount: 0, lastReadAt: 0 };
