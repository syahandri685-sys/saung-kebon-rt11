const defaultData = {
  rt: {
    nama: 'Portal Kepengurusan Saung Kebun RT 11 RW 44',
    rt: '11', rw: '44', kel: 'Saung Kebun',
    iuranNominal: 50000,
    bank: { nama: 'Bank Mandiri', rek: '123-00-456789-0', an: 'Kas RT 11 Saung Kebun' }
  },
  warga: [
    { id: 'W001', nama: 'Dirham Rozi', blok: 'A01', hp: '081234567890', gol: 'Ketua RT', status: 'Tetap', pekerjaan: 'Wiraswasta', pin: '1234' },
    { id: 'W002', nama: 'Siti Rahayu', blok: 'A02', hp: '081234567891', gol: 'Sekretaris', status: 'Tetap', pekerjaan: 'IRT', pin: '1234' },
    { id: 'W003', nama: 'Agus Prasetyo', blok: 'A03', hp: '081234567892', gol: 'Bendahara', status: 'Tetap', pekerjaan: 'Karyawan', pin: '1234' },
    { id: 'W004', nama: 'Dedi Mulyawan', blok: 'A04', hp: '081234567893', gol: 'Anggota Keamanan', status: 'Tetap', pekerjaan: 'PNS', pin: '1234' },
    { id: 'W005', nama: 'Rina Wulandari', blok: 'A05', hp: '081234567894', gol: 'Warga', status: 'Tetap', pekerjaan: 'Guru', pin: '1234' }
  ],
  iuran: [
    { id: 'I001', wargaId: 'W001', bulan: '2026-10', nominal: 50000, status: 'Lunas', tgl: '2026-10-01' },
    { id: 'I002', wargaId: 'W002', bulan: '2026-10', nominal: 50000, status: 'Lunas', tgl: '2026-10-02' }
  ],
  kas: [
    { id: 'K001', tgl: '2026-10-01', tipe: 'Masuk', kat: 'Iuran', urai: 'Iuran Ketua RT', nominal: 50000 },
    { id: 'K002', tgl: '2026-10-02', tipe: 'Masuk', kat: 'Iuran', urai: 'Iuran Sekretaris', nominal: 50000 },
    { id: 'K003', tgl: '2026-10-05', tipe: 'Masuk', kat: 'Donasi', urai: 'Donasi warga', nominal: 200000 },
    { id: 'K004', tgl: '2026-10-10', tipe: 'Keluar', kat: 'Kebersihan', urai: 'Beli sapu', nominal: 150000 }
  ],
  setoran: [],
  pengumuman: [
    { id: 'P001', judul: 'Selamat Datang', kat: 'Pengumuman', isi: 'Portal Saung Kebun RT 11 RW 44 resmi diluncurkan!', tgl: '2026-10-01', pin: true, oleh: 'Ketua RT' }
  ],
  lapor: [
    { id: 'L001', wargaId: 'W005', kat: 'Infrastruktur', judul: 'Jalan berlubang', isi: 'Lubang di blok A', status: 'Baru', prio: 'Sedang', tgl: '2026-10-01' }
  ],
  tamu: [],
  surat: [],
  voting: [],
  ronda: []
};
