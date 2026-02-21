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
      const courseKey = s.course === 'talqin' ? 'courseTalqin' : s.course === 'murajaah' ? 'courseMurajaah' : s.course === 'qaida' ? 'courseQaida' : 'courseHifdh';
      const courseBg  = s.course === 'murajaah' ? '#E0F2FE' : s.course === 'talqin' ? '#F3E8FF' : s.course === 'qaida' ? '#FEF9C3' : '#DCFCE7';
      const courseClr = s.course === 'murajaah' ? '#0369A1' : s.course === 'talqin' ? '#7C3AED' : s.course === 'qaida' ? '#92400E' : '#166534';
      const studentIconSrc = (s.gender === 'أنثى' || s.gender === 'Female')
        ? 'icons/female teacher icon.svg' : 'icons/male teacher icon.svg';
      const studentImgSrc = s.studentPhoto || studentIconSrc;
      const studentImgStyle = s.studentPhoto
        ? 'width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid var(--border); flex-shrink:0; cursor:pointer;'
        : 'width:44px; height:44px; border-radius:50%; border:2px solid var(--border); padding:8px; background:var(--bg); flex-shrink:0; cursor:pointer;';

      return `
        <article class="card" style="cursor:pointer; position:relative;" onclick="location.href='student-detail.html?classId=${classId}&studentId=${s.id}'">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${studentImgSrc}" alt="" style="${studentImgStyle}">
            <div style="flex:1;">
              <div style="font-size:1.05rem; font-weight:900; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                ${s.name}
                <span style="font-size:0.7rem; background:${courseBg}; color:${courseClr}; padding:2px 8px; border-radius:6px; font-weight:700;">${t(courseKey)}</span>
              </div>
              <div style="margin-top:4px; font-size:0.82rem; color:${hasRecord ? '#16A34A' : 'var(--text-muted)'}; font-weight:700;">
                ${hasRecord ? t('recordedToday') : t('notRecorded')}
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
              <div style="font-size:1.5rem;">${s.starred ? '★' : '☆'}</div>
              <a href="add-student.html?classId=${classId}&studentId=${s.id}"
                style="display:flex; align-items:center; opacity:0.45;"
                onclick="event.stopPropagation()">
                <img src="icons/edit icon.svg" style="width:16px; height:16px;" alt="">
              </a>
            </div>
          </div>
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button class="btn btn-success" style="flex:1;"
              onclick="event.stopPropagation(); location.href='record.html?classId=${classId}&studentId=${s.id}'">${t('takeRecord')}</button>
            <button class="btn" style="background:#FEE2E2; display:flex; align-items:center; justify-content:center; padding:0.5rem 0.75rem;"
              onclick="event.stopPropagation(); confirmDeleteStudent('${s.id}', '${s.name.replace(/'/g, "\\'")}')"><img src="icons/delete icon.svg" style="width:18px; height:18px;" alt=""></button>
          </div>
        </article>`;
    }).join('');
  }

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
