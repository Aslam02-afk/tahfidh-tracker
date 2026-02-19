// js/class.js
(function () {
  const classId = getQueryParam("classId");
  const today   = new Date().toISOString().slice(0, 10);

  function renderPage() {
    const data    = dbLoad();
    const halaqah = data.halaqah.find(h => h.id === classId);
    const students = data.students.filter(s => s.classId === classId);
    const query    = (qs('searchInput') ? qs('searchInput').value : '').trim().toLowerCase();

    if (qs('className'))    qs('className').textContent    = halaqah ? halaqah.name : '';
    if (qs('teacherName'))  qs('teacherName').textContent  = halaqah ? (halaqah.teacher || '—') : '';
    if (qs('studentCount')) qs('studentCount').textContent  = students.length;

    const filtered = query ? students.filter(s => s.name.toLowerCase().includes(query)) : students;
    const container = qs('studentsContainer');
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align:center; padding:2rem; color:var(--text-muted);">
          <div><img src="icons/students icon.svg" style="width:32px; height:32px;" alt=""></div>
          <div style="margin-top:8px;">${query ? t('noResults') : t('noStudents')}</div>
        </div>`;
      return;
    }

    container.innerHTML = filtered.map(s => {
      const hasRecord = data.records.some(r => r.studentId === s.id && r.date === today);
      const att = (s.attendance && s.attendance[today]) || '';
      const attColor = att === 'absent' ? '#FEE2E2' : att === 'late' ? '#FEF3C7' : '#F0FDF4';
      const attLabel = att === 'absent' ? t('absent') : att === 'late' ? t('lateLabel') : t('present');
      const courseKey = s.course === 'talqin' ? 'courseTalqin' : s.course === 'murajaah' ? 'courseMurajaah' : 'courseHifdh';
      const courseBg  = s.course === 'murajaah' ? '#E0F2FE' : s.course === 'talqin' ? '#F3E8FF' : '#DCFCE7';
      const courseClr = s.course === 'murajaah' ? '#0369A1' : s.course === 'talqin' ? '#7C3AED' : '#166534';

      return `
        <article class="card">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="flex:1; cursor:pointer;" onclick="location.href='student-detail.html?classId=${classId}&studentId=${s.id}'">
              <div style="font-size:1.05rem; font-weight:900; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                ${s.name}
                <span style="font-size:0.7rem; background:${courseBg}; color:${courseClr}; padding:2px 8px; border-radius:6px; font-weight:700;">${t(courseKey)}</span>
              </div>
              <div style="margin-top:4px; font-size:0.82rem; color:${hasRecord ? '#16A34A' : 'var(--text-muted)'}; font-weight:700;">
                ${hasRecord ? t('recordedToday') : t('notRecorded')}
              </div>
            </div>
            <div style="font-size:1.5rem;">${s.starred ? '★' : '☆'}</div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; font-size:0.82rem;">
            <div style="background:#F3F6FA; padding:8px; border-radius:10px;">${t('absences')}: <b>${s.absences || 0}</b></div>
            <div style="background:#F3F6FA; padding:8px; border-radius:10px;">${t('late')}: <b>${s.late || 0}</b></div>
          </div>

          <div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
            <span style="font-size:0.78rem; background:${attColor}; padding:4px 10px; border-radius:8px; font-weight:700;">${attLabel}</span>
            <button class="btn btn-secondary" style="padding:0.3rem 0.7rem; font-size:0.78rem;"
              onclick="markAttendance('${s.id}', 'present')">P</button>
            <button class="btn btn-secondary" style="padding:0.3rem 0.7rem; font-size:0.78rem;"
              onclick="markAttendance('${s.id}', 'late')">L</button>
            <button class="btn btn-secondary" style="padding:0.3rem 0.7rem; font-size:0.78rem;"
              onclick="markAttendance('${s.id}', 'absent')">A</button>
          </div>

          <div style="display:flex; gap:8px; margin-top:10px;">
            <button class="btn btn-success" style="flex:2;"
              onclick="location.href='record.html?classId=${classId}&studentId=${s.id}'">${t('openRecord')}</button>
            <button class="btn btn-secondary" style="flex:1;"
              onclick="location.href='add-student.html?classId=${classId}&studentId=${s.id}'"><img src="icons/edit icon.svg" style="width:16px; height:16px;" alt=""></button>
            <button class="btn" style="flex:1; background:#FEE2E2; display:flex; align-items:center; justify-content:center;"
              onclick="confirmDeleteStudent('${s.id}', '${s.name.replace(/'/g, "\\'")}')"><img src="icons/delete icon.svg" style="width:18px; height:18px;" alt=""></button>
          </div>
        </article>`;
    }).join('');
  }

  window.markAttendance = function(studentId, status) {
    recordAttendance(studentId, today, status);
    renderPage();
  };

  window.confirmDeleteStudent = function(id, name) {
    if (confirm(t('confirmDeleteStudent').replace('$1', name))) {
      deleteStudent(id);
      renderPage();
    }
  };

  const weekBtn = qs('weeklyReportBtn');
  if (weekBtn) weekBtn.onclick = () => {
    const students = getStudentsByClass(classId);
    if (!students.length) return alert(t('noStudentsAlert'));
    students.forEach(s => generateWeeklyReport(s.id, classId));
  };

  const monthBtn = qs('monthlyReportBtn');
  if (monthBtn) monthBtn.onclick = () => {
    const students = getStudentsByClass(classId);
    if (!students.length) return alert(t('noStudentsAlert'));
    students.forEach(s => generateMonthlyReport(s.id, classId));
  };

  const exportBtn = qs('exportBtn');
  if (exportBtn) exportBtn.onclick = () => exportClassToExcel(classId);

  const searchInput = qs('searchInput');
  if (searchInput) searchInput.oninput = renderPage;

  renderPage();
})();
