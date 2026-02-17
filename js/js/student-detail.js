// js/student-detail.js
(function () {
  const classId   = getQueryParam('classId');
  const studentId = getQueryParam('studentId');

  function renderDetail() {
    const data    = dbLoad();
    const student = data.students.find(s => s.id === studentId);
    const halaqah = data.halaqah.find(h => h.id === classId);
    const container = qs('studentDetailContainer');
    if (!container || !student) return;

    // Get recent records (last 7 days)
    const records = data.records
      .filter(r => r.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);

    const locale = getLang() === 'en' ? 'en-US' : 'ar-SA';
    const isMurajaahOnly = student.course === 'murajaah';
    const courseKey = student.course === 'talqin' ? 'courseTalqin' : student.course === 'murajaah' ? 'courseMurajaah' : 'courseHifdh';

    let html = '';

    // ---- Student Name Header Card ----
    html += `
      <section class="card" style="background:linear-gradient(135deg,#0D2C54,#0F766E); color:#fff; border:none; text-align:center;">
        <div style="font-size:1.4rem; font-weight:900;">${student.name}</div>
        <div style="opacity:0.85; font-size:0.85rem; margin-top:4px;">
          ${halaqah ? halaqah.name : ''} ${halaqah && halaqah.teacher ? '— ' + halaqah.teacher : ''}
        </div>
        <div style="margin-top:6px;"><span style="background:rgba(255,255,255,0.2); padding:3px 12px; border-radius:8px; font-size:0.8rem;">${t(courseKey)}</span></div>
      </section>`;

    // ---- Student Info Card ----
    html += `
      <section class="card">
        <h3 style="margin-bottom:10px; font-size:1rem;" data-i18n="studentInfo">${t('studentInfo')}</h3>
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

    // ---- Attendance Summary ----
    html += `
      <section class="card">
        <h3 style="margin-bottom:10px; font-size:1rem;" data-i18n="attendanceSummary">${t('attendanceSummary')}</h3>
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

    // ---- Exam Info (if available) ----
    if (student.examJuz || student.examPercent || student.examNotes) {
      html += `
        <section class="card">
          <h3 style="margin-bottom:10px; font-size:1rem;" data-i18n="examInfo">${t('examInfo')}</h3>
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

    // ---- Recent Records ----
    html += `
      <section class="card">
        <h3 style="margin-bottom:10px; font-size:1rem;" data-i18n="recentRecords">${t('recentRecords')}</h3>`;

    if (records.length === 0) {
      html += `<div style="text-align:center; color:var(--text-muted); padding:1rem; font-size:0.88rem;">${t('noRecordsYet')}</div>`;
    } else {
      records.forEach(r => {
        const dayName = new Date(r.date + 'T00:00:00').toLocaleDateString(locale, { weekday: 'long' });
        const dateStr = new Date(r.date + 'T00:00:00').toLocaleDateString(locale);

        const showTahfidh = !isMurajaahOnly && !r.noHifdh;
        html += `
          <div style="background:#F3F6FA; padding:10px; border-radius:10px; margin-bottom:8px; font-size:0.85rem;">
            <div style="font-weight:700; margin-bottom:6px;">${dayName} — ${dateStr}</div>
            <div style="display:grid; grid-template-columns:${showTahfidh ? '1fr 1fr' : '1fr'}; gap:6px;">
              ${showTahfidh ? `<div>
                <span style="color:var(--text-muted);">${t('newMemorization')}:</span><br>
                ${r.tahfidh.surahFrom || '—'} (${r.tahfidh.ayahFrom || ''}–${r.tahfidh.ayahTo || ''})
                <br><span style="color:var(--text-muted);">${t('rating')}:</span> ${r.tahfidh.rating || '—'}
                <br><span style="color:var(--text-muted);">${t('errors')}:</span> ${r.tahfidh.errors || 0}
              </div>` : ''}
              <div>
                <span style="color:var(--text-muted);">${t('revision')}:</span><br>
                ${r.murajaah.surahFrom || '—'} → ${r.murajaah.surahTo || '—'}
                <br><span style="color:var(--text-muted);">${t('errors')}:</span> ${r.murajaah.errors || 0}
              </div>
            </div>
          </div>`;
      });
    }
    html += `</section>`;

    // ---- Action Buttons ----
    html += `
      <section class="card">
        <button class="btn btn-primary btn-full" style="margin-bottom:8px; padding:0.85rem; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:8px;"
          onclick="generateWeeklyReport('${studentId}', '${classId}')">
          <img src="icons/share icon.svg" style="width:20px; height:20px; filter:brightness(0) invert(1);" alt="">
          ${t('sendWeeklyReport')}
        </button>
        <button class="btn btn-secondary btn-full" style="margin-bottom:8px; padding:0.85rem; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:8px;"
          onclick="generateMonthlyReport('${studentId}', '${classId}')">
          <img src="icons/share icon.svg" style="width:20px; height:20px; filter:brightness(0) invert(1);" alt="">
          ${t('sendMonthlyReport')}
        </button>
        <button class="btn btn-success btn-full" style="padding:0.85rem; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:8px;"
          onclick="location.href='record.html?classId=${classId}&studentId=${studentId}'">
          <img src="icons/file icon.svg" style="width:20px; height:20px; filter:brightness(0) invert(1);" alt="">
          ${t('openRecord')}
        </button>
        <button class="btn btn-secondary btn-full" style="margin-top:8px; padding:0.85rem; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:8px;"
          onclick="location.href='add-student.html?classId=${classId}&studentId=${studentId}'">
          <img src="icons/edit icon.svg" style="width:20px; height:20px; filter:brightness(0) invert(1);" alt="">
          ${t('editStudent')}
        </button>
      </section>`;

    container.innerHTML = html;
  }

  renderDetail();
})();
