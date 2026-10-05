const renderVoting = () => {
  const list = (appData.voting || []).slice().sort((a, b) => (b.tgl || '').localeCompare(a.tgl || ''));
  $('votingList').innerHTML = list.length ? list.map(v => {
    const total = v.pilihan.reduce((s, p) => s + (p.votes || 0), 0);
    const bcl = v.status === 'Aktif' ? 'b-green' : 'b-gray';
    return `<div class="card" style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:6px">
        <h4 style="flex:1;font-size:15px;font-weight:800">${esc(v.pertanyaan)}</h4>
        <span class="badge ${bcl}">${esc(v.status)}</span>
      </div>
      <div style="font-size:12px;color:#9CA3AF;margin-bottom:14px">📅 ${tglIndo(v.tgl)} · 👥 ${total} suara</div>
      ${v.pilihan.map((p, i) => {
        const pct = total > 0 ? Math.round((p.votes || 0) / total * 100) : 0;
        return `<div class="voting-option" onclick="voteVoting('${v.id}',${i})">
          <span style="font-weight:600">${i + 1}. ${esc(p.text)}</span>
          <span style="font-size:12px;color:#6B7280;font-weight:700">${p.votes || 0} suara · ${pct}%</span>
        </div>
        <div class="vbar"><div style="width:${pct}%"></div></div>`;
      }).join('')}
      <div style="display:flex;gap:6px;margin-top:12px">
        <button class="btn btn-sm btn-warning" onclick="editVoting('${v.id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteVoting('${v.id}')">🗑️ Hapus</button>
      </div>
    </div>`;
  }).join('') : emptyState('🗳️', 'Belum ada voting');
};

const showVotingForm = (v = null) => {
  const e = v !== null;
  openModal(`<div class="modal-header"><h3>${e ? '✏️ Edit' : '＋ Buat'} Voting</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="form-group"><label>Pertanyaan *</label><input type="text" id="vQ" value="${e ? esc(v.pertanyaan) : ''}"></div>
    <div class="form-group"><label>Pilihan 1 *</label><input type="text" id="vP1" value="${e ? esc(v.pilihan[0] ? v.pilihan[0].text : '') : ''}"></div>
    <div class="form-group"><label>Pilihan 2 *</label><input type="text" id="vP2" value="${e ? esc(v.pilihan[1] ? v.pilihan[1].text : '') : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Pilihan 3</label><input type="text" id="vP3" value="${e ? esc(v.pilihan[2] ? v.pilihan[2].text : '') : ''}"></div>
      <div class="form-group"><label>Pilihan 4</label><input type="text" id="vP4" value="${e ? esc(v.pilihan[3] ? v.pilihan[3].text : '') : ''}"></div>
    </div>
    <div class="form-group"><label>Status</label><select id="vStatus"><option value="Aktif" ${e && v.status === 'Aktif' ? 'selected' : ''}>Aktif</option><option value="Selesai" ${e && v.status === 'Selesai' ? 'selected' : ''}>Selesai</option></select></div>
    <button class="btn btn-primary btn-block" onclick="saveVoting('${e ? v.id : ''}')">💾 Simpan</button>`);
};

const saveVoting = editId => {
  const pertanyaan = $('vQ').value.trim(), p1 = $('vP1').value.trim(), p2 = $('vP2').value.trim(),
    p3 = $('vP3').value.trim(), p4 = $('vP4').value.trim(), status = $('vStatus').value;
  if (!pertanyaan || !p1 || !p2) { showToast('Pertanyaan & min 2 pilihan wajib', 'error'); return; }
  const pilihan = [{ text: p1, votes: 0 }, { text: p2, votes: 0 }];
  if (p3) pilihan.push({ text: p3, votes: 0 });
  if (p4) pilihan.push({ text: p4, votes: 0 });
  const list = appData.voting || [];
  if (editId) {
    const i = list.findIndex(x => x.id === editId);
    if (i !== -1) {
      pilihan.forEach((p, j) => { if (list[i].pilihan[j]) p.votes = list[i].pilihan[j].votes || 0; });
      list[i] = { ...list[i], pertanyaan, pilihan, status };
    }
  } else list.unshift({ id: uid('V'), pertanyaan, pilihan, status, tgl: today(), createdBy: currentUser.id });
  appData.voting = list;
  saveData();
  closeModal();
  showToast(editId ? 'Voting diupdate' : 'Voting dibuat');
  renderVoting();
};

const editVoting = id => { const v = appData.voting.find(x => x.id === id); if (v) showVotingForm(v); };
const deleteVoting = id => {
  const v = appData.voting.find(x => x.id === id);
  if (!v) return;
  if (!confirm(`Hapus "${v.pertanyaan}"?`)) return;
  appData.voting = appData.voting.filter(x => x.id !== id);
  saveData();
  showToast('Voting dihapus');
  renderVoting();
};

const voteVoting = (vid, idx) => {
  const v = appData.voting.find(x => x.id === vid);
  if (!v) return;
  if (v.status !== 'Aktif') { showToast('Voting ditutup', 'error'); return; }
  v.pilihan[idx].votes = (v.pilihan[idx].votes || 0) + 1;
  saveData();
  showToast('Suara tercatat!');
  renderVoting();
};
