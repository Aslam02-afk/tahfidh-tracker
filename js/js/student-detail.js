// js/student-detail.js
(function () {
  const classId   = getQueryParam('classId');
  const studentId = getQueryParam('studentId');

  window.showTab = function(name) {
    ['overview', 'records', 'progress'].forEach(function(tab) {
      var content = document.getElementById('tab-' + tab);
      var btn     = document.getElementById('tabBtn-' + tab);
      if (content) content.style.display = tab === name ? '' : 'none';
      if (btn) {
        btn.style.color        = tab === name ? 'var(--primary)' : 'var(--text-muted)';
        btn.style.borderBottom = tab === name ? '2px solid var(--primary)' : '2px solid transparent';
      }
    });
  };

  function attBadge(att) {
    var bg   = att === 'absent'  ? '#FEE2E2' : att === 'late' ? '#FEF3C7' : att === 'excused' ? '#EFF6FF' : att === 'present' ? '#F0FDF4' : '#F3F6FA';
    var text = att === 'absent'  ? t('absent') : att === 'late' ? t('lateLabel') : att === 'excused' ? t('excused') : att === 'present' ? t('present') : '—';
    return `<span style="background:${bg}; padding:3px 10px; border-radius:6px; font-size:0.78rem; font-weight:700;">${text}</span>`;
  }

  function renderDetail() {
    const data      = dbLoad();
    const student   = data.students.find(s => s.id === studentId);
    const halaqah   = data.halaqah.find(h => h.id === classId);
    const container = qs('studentDetailContainer');
    if (!container || !student) return;

    const course  = student.course || 'hifdh';
    const locale  = getLang() === 'en' ? 'en-US' : 'ar-SA';
    const isAr    = getLang() === 'ar';
    const courseKey = course === 'talqin' ? 'courseTalqin' : course === 'murajaah' ? 'courseMurajaah' : course === 'qaida' ? 'courseQaida' : 'courseHifdh';

    const allRecords = data.records
      .filter(r => r.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));

    // --- Header card ---
    const studentIconSrc   = (student.gender === 'أنثى' || student.gender === 'Female') ? 'icons/female teacher icon.svg' : 'icons/male teacher icon.svg';
    const headerPhotoSrc   = student.studentPhoto || studentIconSrc;
    const headerPhotoStyle = student.studentPhoto
      ? 'width:72px; height:72px; border-radius:50%; object-fit:cover; border:3px solid rgba(255,255,255,0.5); margin-bottom:10px;'
      : 'width:72px; height:72px; border-radius:50%; border:3px solid rgba(255,255,255,0.5); padding:14px; background:rgba(255,255,255,0.15); margin-bottom:10px;';

    let html = `
      <section class="card" style="background:linear-gradient(135deg,#0D2C54,#0F766E); color:#fff; border:none; text-align:center;">
        <img src="${headerPhotoSrc}" alt="" style="${headerPhotoStyle}">
        <div style="font-size:1.4rem; font-weight:900;">${student.name}</div>
        <div style="opacity:0.85; font-size:0.85rem; margin-top:4px;">
          ${halaqah ? halaqah.name : ''} ${halaqah && halaqah.teacher ? '— ' + halaqah.teacher : ''}
        </div>
        <div style="margin-top:6px;">
          <span style="background:rgba(255,255,255,0.2); padding:3px 12px; border-radius:8px; font-size:0.8rem;">${t(courseKey)}</span>
        </div>
        <button class="btn btn-success" style="margin-top:14px; padding:0.7rem 2rem; font-size:0.95rem; display:inline-flex; align-items:center; gap:8px;"
          onclick="location.href='record.html?classId=${classId}&studentId=${studentId}'">
          <img src="icons/file icon.svg" style="width:18px; height:18px; filter:brightness(0) invert(1);" alt="">
          ${t('takeRecord')}
        </button>
      </section>`;

    // --- Tab bar ---
    html += `
      <div style="display:flex; background:var(--card-bg); border-bottom:2px solid var(--border); margin-bottom:4px;">
        <button id="tabBtn-overview" onclick="showTab('overview')"
          style="flex:1; padding:0.75rem; border:none; background:none; font-weight:700; font-size:0.85rem; cursor:pointer; color:var(--primary); border-bottom:2px solid var(--primary); margin-bottom:-2px;">
          ${t('tabOverview')}
        </button>
        <button id="tabBtn-records" onclick="showTab('records')"
          style="flex:1; padding:0.75rem; border:none; background:none; font-weight:700; font-size:0.85rem; cursor:pointer; color:var(--text-muted); border-bottom:2px solid transparent; margin-bottom:-2px;">
          ${t('tabRecords')}
        </button>
        <button id="tabBtn-progress" onclick="showTab('progress')"
          style="flex:1; padding:0.75rem; border:none; background:none; font-weight:700; font-size:0.85rem; cursor:pointer; color:var(--text-muted); border-bottom:2px solid transparent; margin-bottom:-2px;">
          ${t('tabProgress')}
        </button>
      </div>`;

    // ========================
    // OVERVIEW TAB
    // ========================
    let ov = '';

    ov += `
      <section class="card">
        <h3 style="margin-bottom:10px; font-size:1rem;">${t('studentInfo')}</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.88rem;">
          <div style="background:#F3F6FA; padding:10px; border-radius:10px;">
            <div style="color:var(--text-muted); font-size:0.78rem;">${t('gender')}</div>
            <div style="font-weight:700; margin-top:2px;">${student.gender || t('male')}</div>
          </div>
          <div style="background:#F3F6FA; padding:10px; border-radius:10px;">
            <div style="color:var(--text-muted); font-size:0.78rem;">${t('phoneLabel')}</div>
            <div style="font-weight:700; margin-top:2px;">${student.phone || t('noPhone')}</div>
          </div>
          <div style="background:#F3F6FA; padding:10px; border-radius:10px;">
            <div style="color:var(--text-muted); font-size:0.78rem;">${t('lastSurahLabel')}</div>
            <div style="font-weight:700; margin-top:2px;">${student.lastSurah || t('noLastSurah')}</div>
          </div>
          <div style="background:#F3F6FA; padding:10px; border-radius:10px;">
            <div style="color:var(--text-muted); font-size:0.78rem;">${t('notesLabel')}</div>
            <div style="font-weight:700; margin-top:2px;">${student.notes || t('noNotes')}</div>
          </div>
        </div>
      </section>`;

    ov += `
      <section class="card">
        <h3 style="margin-bottom:10px; font-size:1rem;">${t('attendanceSummary')}</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.88rem;">
          <div style="background:#FEE2E2; padding:12px; border-radius:10px; text-align:center;">
            <div style="font-size:1.4rem; font-weight:900; color:#DC2626;">${student.absences || 0}</div>
            <div style="color:#DC2626; font-size:0.78rem; margin-top:2px;">${t('totalAbsences')}</div>
          </div>
          <div style="background:#FEF3C7; padding:12px; border-radius:10px; text-align:center;">
            <div style="font-size:1.4rem; font-weight:900; color:#D97706;">${student.late || 0}</div>
            <div style="color:#D97706; font-size:0.78rem; margin-top:2px;">${t('totalLate')}</div>
          </div>
        </div>
      </section>`;

    if (student.examJuz || student.examPercent || student.examNotes) {
      ov += `
        <section class="card">
          <h3 style="margin-bottom:10px; font-size:1rem;">${t('examInfo')}</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.88rem;">
            <div style="background:#F3F6FA; padding:10px; border-radius:10px;">
              <div style="color:var(--text-muted); font-size:0.78rem;">${t('examJuz')}</div>
              <div style="font-weight:700; margin-top:2px;">${student.examJuz || '—'}</div>
            </div>
            <div style="background:#F3F6FA; padding:10px; border-radius:10px;">
              <div style="color:var(--text-muted); font-size:0.78rem;">${t('examPercent')}</div>
              <div style="font-weight:700; margin-top:2px;">${student.examPercent ? student.examPercent + '%' : '—'}</div>
            </div>
          </div>
          ${student.examNotes ? `<div style="background:#F3F6FA; padding:10px; border-radius:10px; margin-top:8px; font-size:0.85rem;">${student.examNotes}</div>` : ''}
        </section>`;
    }

    ov += `
      <section class="card">
        <button class="btn btn-primary btn-full" style="margin-bottom:8px; padding:0.85rem; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:8px;"
          onclick="showReportFormatModal('weekly', '${studentId}', '${classId}')">
          <img src="icons/share icon.svg" style="width:20px; height:20px; filter:brightness(0) invert(1);" alt="">
          ${t('sendWeeklyReport')}
        </button>
        <button class="btn btn-secondary btn-full" style="margin-bottom:8px; padding:0.85rem; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:8px;"
          onclick="showReportFormatModal('monthly', '${studentId}', '${classId}')">
          <img src="icons/share icon.svg" style="width:20px; height:20px; filter:brightness(0) invert(1);" alt="">
          ${t('sendMonthlyReport')}
        </button>
        <button class="btn btn-secondary btn-full" style="padding:0.85rem; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:8px;"
          onclick="location.href='add-student.html?classId=${classId}&studentId=${studentId}'">
          <img src="icons/edit icon.svg" style="width:20px; height:20px; filter:brightness(0) invert(1);" alt="">
          ${t('editStudent')}
        </button>
      </section>`;

    // ========================
    // RECORDS TAB
    // ========================
    let rec = '';

    if (allRecords.length === 0) {
      rec = `<section class="card"><div style="text-align:center; color:var(--text-muted); padding:2rem; font-size:0.88rem;">${t('noRecordsYet')}</div></section>`;
    } else {
      allRecords.forEach(r => {
        const dayName = new Date(r.date + 'T00:00:00').toLocaleDateString(locale, { weekday: 'long' });
        const dateStr = new Date(r.date + 'T00:00:00').toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
        let body = '';

        if ((course === 'hifdh' || course === 'murajaah') && r.murajaah) {
          if (course === 'hifdh' && r.tahfidh && !r.noHifdh && r.tahfidhEnabled !== false) {
            const tScore = r.tahfidh.score != null ? `<b style="color:var(--primary);"> ${r.tahfidh.score}/100</b>` : (r.tahfidh.rating ? ` <span style="color:var(--primary);">${r.tahfidh.rating}</span>` : '');
            body += `<div style="margin-bottom:5px;"><span style="color:var(--text-muted); font-size:0.78rem;">${t('tahfidh')}:</span> <b>${r.tahfidh.surahFrom || '—'}</b>${r.tahfidh.ayahFrom ? ` (${r.tahfidh.ayahFrom}–${r.tahfidh.ayahTo || ''})` : ''} → <b>${r.tahfidh.surahTo || '—'}</b>${tScore}</div>`;
          }
          if (r.murajaahEnabled !== false) {
            const mScore = r.murajaah.score != null ? `<b style="color:var(--primary);"> ${r.murajaah.score}/100</b>` : (r.murajaah.rating ? ` <span style="color:var(--primary);">${r.murajaah.rating}</span>` : '');
            body += `<div><span style="color:var(--text-muted); font-size:0.78rem;">${t('murajaah')}:</span> <b>${r.murajaah.surahFrom || '—'}</b> → <b>${r.murajaah.surahTo || '—'}</b>${mScore}</div>`;
          }
        } else if (course === 'talqin' && r.talqin) {
          body += `<div><span style="color:var(--text-muted); font-size:0.78rem;">${t('startedFrom')}:</span> <b>${r.talqin.startedFrom || '—'}</b> → <span style="color:var(--text-muted); font-size:0.78rem;">${t('endedAt')}:</span> <b>${r.talqin.endedAt || '—'}</b>${r.talqin.notes ? `<div style="margin-top:3px; font-size:0.78rem; color:var(--text-muted);">${r.talqin.notes}</div>` : ''}</div>`;
        } else if (course === 'qaida' && r.qaida) {
          body += `<div>${r.qaida.bookName ? `<b>${r.qaida.bookName}</b> — ` : ''}${t('fromPage')} <b>${r.qaida.fromPage || '—'}</b> ${t('toPage')} <b>${r.qaida.toPage || '—'}</b></div>`;
        }

        rec += `
          <section class="card" style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div style="font-weight:700; font-size:0.88rem;">${dayName}<br><span style="font-weight:400; color:var(--text-muted); font-size:0.78rem;">${dateStr}</span></div>
              ${attBadge(r.attendance)}
            </div>
            <div style="font-size:0.85rem; line-height:1.6;">${body || `<span style="color:var(--text-muted);">—</span>`}</div>
          </section>`;
      });
    }

    // ========================
    // PROGRESS TAB
    // ========================
    let prog = '';

    const totalDays    = allRecords.length;
    const presentCount = allRecords.filter(r => !r.attendance || r.attendance === 'present').length;
    const absentCount  = allRecords.filter(r => r.attendance === 'absent').length;
    const lateCount    = allRecords.filter(r => r.attendance === 'late').length;
    const excusedCount = allRecords.filter(r => r.attendance === 'excused').length;
    const presentRate  = totalDays ? Math.round(presentCount / totalDays * 100) : 0;

    prog += `
      <section class="card">
        <h3 style="margin-bottom:10px; font-size:1rem;">${t('attendanceSummary')}</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.88rem; margin-bottom:10px;">
          <div style="background:#F0FDF4; padding:10px; border-radius:10px; text-align:center;">
            <div style="font-size:1.3rem; font-weight:900; color:#16A34A;">${presentCount}</div>
            <div style="color:#16A34A; font-size:0.78rem;">${t('present')}</div>
          </div>
          <div style="background:#FEE2E2; padding:10px; border-radius:10px; text-align:center;">
            <div style="font-size:1.3rem; font-weight:900; color:#DC2626;">${absentCount}</div>
            <div style="color:#DC2626; font-size:0.78rem;">${t('absent')}</div>
          </div>
          <div style="background:#FEF3C7; padding:10px; border-radius:10px; text-align:center;">
            <div style="font-size:1.3rem; font-weight:900; color:#D97706;">${lateCount}</div>
            <div style="color:#D97706; font-size:0.78rem;">${t('lateLabel')}</div>
          </div>
          <div style="background:#EFF6FF; padding:10px; border-radius:10px; text-align:center;">
            <div style="font-size:1.3rem; font-weight:900; color:#2563EB;">${excusedCount}</div>
            <div style="color:#2563EB; font-size:0.78rem;">${t('excused')}</div>
          </div>
        </div>
        <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:4px;">${t('present')} ${presentRate}% / ${totalDays} ${isAr ? 'يوم' : 'days'}</div>
        <div style="background:var(--border); border-radius:6px; height:6px;">
          <div style="background:var(--secondary); width:${presentRate}%; height:6px; border-radius:6px;"></div>
        </div>
      </section>`;

    if (course === 'hifdh' || course === 'murajaah') {
      const history = [...allRecords].reverse();
      prog += `<section class="card">
        <h3 style="margin-bottom:10px; font-size:1rem;">${isAr ? 'تاريخ الحفظ والمراجعة' : 'Memorization & Revision History'}</h3>`;

      if (history.length === 0) {
        prog += `<div style="text-align:center; color:var(--text-muted); padding:1rem;">${t('noRecordsYet')}</div>`;
      } else {
        history.forEach(r => {
          const ds = new Date(r.date + 'T00:00:00').toLocaleDateString(locale, { month: 'short', day: 'numeric' });
          let row = `<div style="display:flex; align-items:flex-start; gap:8px; padding:7px 0; border-bottom:1px solid var(--border);">
            <div style="min-width:50px; font-size:0.75rem; color:var(--text-muted); padding-top:2px;">${ds}</div>
            <div style="flex:1; font-size:0.82rem; line-height:1.5;">`;

          if (course === 'hifdh' && r.tahfidh && !r.noHifdh && r.tahfidhEnabled !== false && r.tahfidh.surahFrom) {
            row += `<div><span style="color:var(--text-muted);">${t('tahfidh')}:</span> <b>${r.tahfidh.surahFrom}</b> → <b>${r.tahfidh.surahTo || '—'}</b>`;
            if (r.tahfidh.score != null) row += ` <b style="color:var(--primary);">${r.tahfidh.score}/100</b>`;
            row += `</div>`;
          }
          if (r.murajaah && r.murajaahEnabled !== false && r.murajaah.surahFrom) {
            row += `<div><span style="color:var(--text-muted);">${t('murajaah')}:</span> <b>${r.murajaah.surahFrom}</b> → <b>${r.murajaah.surahTo || '—'}</b>`;
            if (r.murajaah.score != null) row += ` <b style="color:var(--primary);">${r.murajaah.score}/100</b>`;
            row += `</div>`;
          }
          row += `</div></div>`;
          prog += row;
        });
      }
      prog += `</section>`;
    }

    // Assemble
    html += `
      <div id="tab-overview">${ov}</div>
      <div id="tab-records"  style="display:none;">${rec}</div>
      <div id="tab-progress" style="display:none;">${prog}</div>`;

    container.innerHTML = html;
  }

  renderDetail();
})();
