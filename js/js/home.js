// js/home.js

// Display Hijri and Gregorian dates
(function initDates() {
  const now = new Date();
  const lang = getLang();
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';

  const gregorian = new Intl.DateTimeFormat(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory'
  }).format(now);

  const hijri = new Intl.DateTimeFormat(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic-umalqura'
  }).format(now);

  const hijriEl = document.getElementById('hijriDate');
  const gregEl  = document.getElementById('gregorianDate');
  if (hijriEl) hijriEl.textContent = hijri;
  if (gregEl)  gregEl.textContent  = gregorian;
})();

function goToAddClass() {
  location.href = 'add-class.html';
}

function renderClasses() {
  const container = qs('classesContainer');
  if (!container) return;
  const data = dbLoad();
  const today = new Date().toISOString().slice(0, 10);

  if (data.halaqah.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:2rem; color:var(--text-muted);">
        <div style="font-size:2.5rem; margin-bottom:10px;">📚</div>
        <div style="font-weight:700;">${t('noClassesYet')}</div>
        <div style="font-size:0.85rem; margin-top:6px;">${t('noClassesHint')}</div>
      </div>`;
    return;
  }

  container.innerHTML = data.halaqah.map(h => {
    const students = data.students.filter(s => s.classId === h.id);
    const doneToday = data.records.filter(r => r.classId === h.id && r.date === today).length;
    const pct = students.length ? Math.round(doneToday / students.length * 100) : 0;
    const genderIcon = h.teacherGender === 'female' ? 'female teacher icon' : 'male teacher icon';
    const timeIcon = h.classTime === 'evening' ? 'night time icon' : 'day time icon';

    return `
      <article class="card" style="cursor:pointer;" onclick="location.href='class.html?classId=${h.id}'">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
          <div style="flex:1;">
            <div style="font-size:1.1rem; font-weight:900;">${h.name}</div>
            <div style="margin-top:4px; color:var(--text-muted); font-size:0.9rem;">${t('teacher')}: ${h.teacher || '—'}</div>
            <div style="display:flex; gap:8px; margin-top:6px; align-items:center;">
              <img src="icons/${genderIcon}.svg" style="width:20px; height:20px; opacity:0.7;" alt="">
              <img src="icons/${timeIcon}.svg" style="width:20px; height:20px; opacity:0.7;" alt="">
            </div>
          </div>
          <div style="text-align:center; background:var(--bg); padding:8px 14px; border-radius:12px; min-width:54px;">
            <div style="font-size:1.3rem; font-weight:900; color:var(--primary);">${students.length}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${t('student')}</div>
          </div>
        </div>
        <div style="margin-top:10px;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span>${t('progressToday')}</span>
            <span style="font-weight:700;">${doneToday} / ${students.length}</span>
          </div>
          <div style="background:var(--border); border-radius:6px; height:6px;">
            <div style="background:var(--secondary); width:${pct}%; height:6px; border-radius:6px;"></div>
          </div>
        </div>
        <div style="display:flex; gap:8px; margin-top:12px;">
          <button class="btn btn-secondary" style="padding:0.35rem 0.8rem; font-size:0.82rem; flex:1;"
            onclick="event.stopPropagation(); location.href='add-class.html?classId=${h.id}'">${t('edit')}</button>
          <button class="btn" style="padding:0.35rem 0.8rem; font-size:0.82rem; background:#FEE2E2; color:#DC2626;"
            onclick="event.stopPropagation(); confirmDeleteClass('${h.id}', \`${h.name}\`)">🗑️</button>
        </div>
      </article>`;
  }).join('');
}

function confirmDeleteClass(id, name) {
  if (confirm(t('confirmDeleteClass').replace('$1', name))) {
    deleteClass(id);
    renderClasses();
  }
}

renderClasses();
