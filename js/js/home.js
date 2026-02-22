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
        <div style="margin-bottom:10px;"><img src="icons/Quran icon.svg" style="width:40px; height:40px;" alt=""></div>
        <div style="font-weight:700;">${t('noClassesYet')}</div>
        <div style="font-size:0.85rem; margin-top:6px;">${t('noClassesHint')}</div>
      </div>`;
    return;
  }

  container.innerHTML = data.halaqah.map(h => {
    const students = data.students.filter(s => s.classId === h.id);
    const doneToday = data.records.filter(r => r.classId === h.id && r.date === today).length;
    const pct = students.length ? Math.round(doneToday / students.length * 100) : 0;
    const CARD_THEMES = { pink: 'Pink_theme.png', green: 'green_theme.png', greenlight: 'greenlight_theme.png', purple: 'puple_theme.png' };
    const cardBgStyle = (h.cardTheme && CARD_THEMES[h.cardTheme])
      ? `background-image:url('themes/${CARD_THEMES[h.cardTheme]}'); background-size:cover; background-repeat:no-repeat; background-position:center;`
      : '';
    const genderIcon = h.teacherGender === 'female' ? 'female teacher icon' : 'male teacher icon';
    const nightTimes = { evening: 1, fajr: 1, maghrib: 1, isha: 1 };
    const timeIcon = nightTimes[h.classTime] ? 'night time icon' : 'day time icon';
    const salahLabel = h.classTime === 'custom' && h.classTimeCustom
      ? h.classTimeCustom
      : (t(h.classTime) !== h.classTime ? t(h.classTime) : '');
    const teacherImgHtml = h.teacherPhoto
      ? `<img src="${h.teacherPhoto}" alt="" style="width:52px; height:52px; border-radius:50%; object-fit:cover; border:2px solid var(--border); flex-shrink:0;">`
      : `<img src="icons/${genderIcon}.svg" alt="" style="width:52px; height:52px; border-radius:50%; border:2px solid var(--border); padding:10px; background:var(--card-bg); flex-shrink:0;">`;

    return `
      <article class="card" style="cursor:pointer; position:relative; ${cardBgStyle}" onclick="location.href='class.html?classId=${h.id}'">
        <button style="position:absolute;top:10px;inset-inline-end:10px;background:none;border:none;padding:5px;cursor:pointer;opacity:0.45;z-index:1;"
          onclick="event.stopPropagation();location.href='add-class.html?classId=${h.id}'">
          <img src="icons/edit icon.svg" style="width:18px;height:18px;" alt="">
        </button>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
          ${teacherImgHtml}
          <div style="flex:1;">
            <div style="font-size:1.1rem; font-weight:900;">${h.name}</div>
            <div style="margin-top:4px; color:var(--text-muted); font-size:0.9rem;">${t('teacher')}: ${h.teacher || '—'}</div>
            <div style="display:flex; gap:8px; margin-top:6px; align-items:center;">
              <img src="icons/${timeIcon}.svg" style="width:18px; height:18px; opacity:0.7;" alt="">
              ${salahLabel ? `<span style="font-size:0.8rem; color:var(--text-muted);">${salahLabel}</span>` : ''}
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
          <button class="btn" style="flex:1; padding:0.35rem 0.8rem; background:#FEE2E2; display:flex; align-items:center; justify-content:center; gap:6px;"
            onclick="event.stopPropagation(); confirmDeleteClass('${h.id}', \`${h.name}\`)">
            <img src="icons/delete icon.svg" style="width:18px; height:18px;" alt="">
          </button>
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
