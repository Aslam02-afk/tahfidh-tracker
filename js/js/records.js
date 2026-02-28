// js/records.js
(function () {
  var studentId = getQueryParam("studentId");
  var classId   = getQueryParam("classId");
  var today     = new Date().toISOString().slice(0, 10);
  var student   = getStudentById(studentId);
  var course    = student ? (student.course || 'hifdh') : 'hifdh';

  if (student && qs("studentNameDisplay")) {
    qs("studentNameDisplay").textContent = student.name;
  }

  // State
  var currentDate  = today;
  var currentAtt   = 'present';
  var tahfidhOn    = true;
  var murajaahOn   = true;

  // --- Grade calculation ---
  function calcGrade(errors) {
    var score = Math.max(0, 100 - errors * 5);
    var rating;
    if (score >= 95)      rating = t('excellent');
    else if (score >= 85) rating = t('veryGood');
    else if (score >= 75) rating = t('good');
    else if (score >= 60) rating = t('acceptable');
    else                  rating = t('needsImprovement');
    return { score: score, rating: rating };
  }

  // --- Attendance buttons ---
  var ATT_COLORS = {
    present: '#16A34A',
    absent:  '#DC2626',
    late:    '#D97706',
    excused: '#7C3AED'
  };
  window.setAtt = function(status) {
    currentAtt = status;
    ['present','absent','late','excused'].forEach(function(s) {
      var btn = document.getElementById('att' + s.charAt(0).toUpperCase() + s.slice(1));
      if (!btn) return;
      if (s === status) {
        btn.className = 'btn';
        btn.style.background = ATT_COLORS[s];
        btn.style.color = '#fff';
        btn.style.borderColor = ATT_COLORS[s];
      } else {
        btn.className = 'btn btn-secondary';
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      }
    });
  };

  // --- Toggle tahfidh / murajaah section ---
  window.toggleSection = function(sec) {
    if (sec === 'tahfidh') {
      tahfidhOn = !tahfidhOn;
      qs('tahfidhFields').style.display  = tahfidhOn ? '' : 'none';
      qs('tahfidhOffMsg').style.display  = tahfidhOn ? 'none' : 'block';
      var btn = qs('tahfidhToggleBtn');
      btn.className   = 'btn ' + (tahfidhOn ? 'btn-primary' : 'btn-secondary');
      btn.textContent = tahfidhOn ? t('tahfidhToggle') : 'OFF';
    } else {
      murajaahOn = !murajaahOn;
      qs('murajaahFields').style.display = murajaahOn ? '' : 'none';
      qs('murajaahOffMsg').style.display = murajaahOn ? 'none' : 'block';
      var btn2 = qs('murajaahToggleBtn');
      btn2.className   = 'btn ' + (murajaahOn ? 'btn-primary' : 'btn-secondary');
      btn2.textContent = murajaahOn ? t('murajaahToggle') : 'OFF';
    }
  };

  // --- Mistakes counter ---
  window.changeErr = function(sec, delta) {
    var id = sec === 'tahfidh' ? 'tErrors' : 'mErrors';
    var next = Math.max(0, (parseInt(qs(id).textContent) || 0) + delta);
    qs(id).textContent = next;
    updateGrade(sec, next);
  };

  function updateGrade(sec, errors) {
    var g = calcGrade(errors);
    var scoreEl = qs(sec === 'tahfidh' ? 'tScore' : 'mScore');
    var gradeEl = qs(sec === 'tahfidh' ? 'tGrade' : 'mGrade');
    if (scoreEl) scoreEl.textContent = g.score;
    if (gradeEl) gradeEl.textContent = g.rating;
  }

  // --- Render course-specific section ---
  function renderCourseSection() {
    var html = '';

    if (course === 'hifdh') {
      html += `
      <section class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="font-size:1.05rem; font-weight:900;" data-i18n="tahfidh">الحفظ</div>
          <button id="tahfidhToggleBtn" class="btn btn-primary" style="font-size:0.78rem; padding:0.35rem 0.8rem;" onclick="toggleSection('tahfidh')">${t('tahfidhToggle')}</button>
        </div>
        <div id="tahfidhFields">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" data-i18n="fromSurah">من سورة</label>
              <div id="tSurahFromWrap"></div>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="fromAyah">من آية</label>
              <input id="tAyahFrom" type="number" class="form-input" placeholder="1" min="1" />
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="toSurah">إلى سورة</label>
              <div id="tSurahToWrap"></div>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="toAyah">إلى آية</label>
              <input id="tAyahTo" type="number" class="form-input" placeholder="10" min="1" />
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px;">
            <div class="card" style="padding:0.75rem;">
              <div style="font-weight:700; margin-bottom:8px;" data-i18n="mistakes">الأخطاء</div>
              <div style="display:flex; align-items:center; gap:12px;">
                <button onclick="changeErr('tahfidh',-1)" class="btn btn-secondary" style="padding:0.4rem 0.9rem;">−</button>
                <div id="tErrors" style="font-size:1.3rem; font-weight:900; min-width:24px; text-align:center;">0</div>
                <button onclick="changeErr('tahfidh',1)" class="btn btn-secondary" style="padding:0.4rem 0.9rem;">+</button>
              </div>
            </div>
            <div class="card" style="padding:0.75rem;">
              <div style="font-weight:700; margin-bottom:4px;" data-i18n="score">الدرجة</div>
              <div id="tScore" style="font-size:1.4rem; font-weight:900; color:var(--primary);">100</div>
              <div id="tGrade" style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${t('excellent')}</div>
            </div>
          </div>
        </div>
        <div id="tahfidhOffMsg" style="display:none; text-align:center; padding:0.75rem; color:var(--text-muted); font-weight:700;">OFF</div>
        <div class="form-group" style="margin-top:12px;">
          <label class="form-label">ملاحظات الحفظ</label>
          <textarea id="tNotes" class="form-input" rows="2" placeholder="ملاحظات..."></textarea>
        </div>
      </section>`;
    }

    if (course === 'hifdh' || course === 'murajaah') {
      html += `
      <section class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="font-size:1.05rem; font-weight:900;" data-i18n="murajaah">المراجعة</div>
          <button id="murajaahToggleBtn" class="btn btn-primary" style="font-size:0.78rem; padding:0.35rem 0.8rem;" onclick="toggleSection('murajaah')">${t('murajaahToggle')}</button>
        </div>
        <div id="murajaahFields">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" data-i18n="fromSurah">من سورة</label>
              <div id="mSurahFromWrap"></div>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="toSurah">إلى سورة</label>
              <div id="mSurahToWrap"></div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px;">
            <div class="card" style="padding:0.75rem;">
              <div style="font-weight:700; margin-bottom:8px;" data-i18n="mistakes">الأخطاء</div>
              <div style="display:flex; align-items:center; gap:12px;">
                <button onclick="changeErr('murajaah',-1)" class="btn btn-secondary" style="padding:0.4rem 0.9rem;">−</button>
                <div id="mErrors" style="font-size:1.3rem; font-weight:900; min-width:24px; text-align:center;">0</div>
                <button onclick="changeErr('murajaah',1)" class="btn btn-secondary" style="padding:0.4rem 0.9rem;">+</button>
              </div>
            </div>
            <div class="card" style="padding:0.75rem;">
              <div style="font-weight:700; margin-bottom:4px;" data-i18n="score">الدرجة</div>
              <div id="mScore" style="font-size:1.4rem; font-weight:900; color:var(--primary);">100</div>
              <div id="mGrade" style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${t('excellent')}</div>
            </div>
          </div>
        </div>
        <div id="murajaahOffMsg" style="display:none; text-align:center; padding:0.75rem; color:var(--text-muted); font-weight:700;">OFF</div>
        <div class="form-group" style="margin-top:12px;">
          <label class="form-label">ملاحظات المراجعة</label>
          <textarea id="mNotes" class="form-input" rows="2" placeholder="ملاحظات..."></textarea>
        </div>
      </section>`;
    }

    if (course === 'talqin') {
      html += `
      <section class="card">
        <div style="font-size:1.05rem; font-weight:900; margin-bottom:12px;" data-i18n="courseTalqin">تلقين</div>
        <div class="form-group">
          <label class="form-label" data-i18n="startedFrom">بدأ من</label>
          <input id="talqinFrom" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="endedAt">انتهى إلى</label>
          <input id="talqinTo" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="notes">ملاحظات</label>
          <textarea id="talqinNotes" class="form-input" rows="3"></textarea>
        </div>
      </section>`;
    }

    if (course === 'qaida') {
      html += `
      <section class="card">
        <div style="font-size:1.05rem; font-weight:900; margin-bottom:12px;" data-i18n="courseQaida">القاعدة</div>
        <div class="form-group">
          <label class="form-label" data-i18n="bookName">اسم الكتاب</label>
          <input id="qaidaBook" class="form-input" />
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" data-i18n="fromPage">من صفحة</label>
            <input id="qaidaFrom" type="number" class="form-input" min="1" />
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="toPage">إلى صفحة</label>
            <input id="qaidaTo" type="number" class="form-input" min="1" />
          </div>
        </div>
      </section>`;
    }

    qs('courseSection').innerHTML = html;

    // Init surah search inputs after DOM is ready
    if (course === 'hifdh') {
      qs('tSurahFromWrap').innerHTML = surahSearchInput('tSurahFrom', '');
      qs('tSurahToWrap').innerHTML   = surahSearchInput('tSurahTo',   '');
    }
    if (course === 'hifdh' || course === 'murajaah') {
      qs('mSurahFromWrap').innerHTML = surahSearchInput('mSurahFrom', '');
      qs('mSurahToWrap').innerHTML   = surahSearchInput('mSurahTo',   '');
    }
  }

  // --- Load record values into fields ---
  function loadRecord(rec) {
    tahfidhOn  = true;
    murajaahOn = true;

    if (!rec) {
      setAtt('present');
      if (course === 'hifdh') {
        if (qs('tSurahFrom')) qs('tSurahFrom').value = '';
        if (qs('tSurahTo'))   qs('tSurahTo').value   = '';
        if (qs('tAyahFrom'))  qs('tAyahFrom').value  = '';
        if (qs('tAyahTo'))    qs('tAyahTo').value    = '';
        if (qs('tErrors'))    { qs('tErrors').textContent = '0'; updateGrade('tahfidh', 0); }
        var tb = qs('tahfidhToggleBtn');
        if (tb) { qs('tahfidhFields').style.display = ''; qs('tahfidhOffMsg').style.display = 'none'; tb.className = 'btn btn-primary'; tb.textContent = t('tahfidhToggle'); }
      }
      if (course === 'hifdh' || course === 'murajaah') {
        if (qs('mSurahFrom')) qs('mSurahFrom').value = '';
        if (qs('mSurahTo'))   qs('mSurahTo').value   = '';
        if (qs('mErrors'))    { qs('mErrors').textContent = '0'; updateGrade('murajaah', 0); }
        var mb = qs('murajaahToggleBtn');
        if (mb) { qs('murajaahFields').style.display = ''; qs('murajaahOffMsg').style.display = 'none'; mb.className = 'btn btn-primary'; mb.textContent = t('murajaahToggle'); }
      }
      if (course === 'talqin') {
        if (qs('talqinFrom'))  qs('talqinFrom').value  = '';
        if (qs('talqinTo'))    qs('talqinTo').value    = '';
        if (qs('talqinNotes')) qs('talqinNotes').value = '';
      }
      if (course === 'qaida') {
        if (qs('qaidaBook'))  qs('qaidaBook').value  = '';
        if (qs('qaidaFrom'))  qs('qaidaFrom').value  = '';
        if (qs('qaidaTo'))    qs('qaidaTo').value    = '';
      }
      return;
    }

    setAtt(rec.attendance || 'present');

    if (course === 'hifdh') {
      tahfidhOn = rec.tahfidhEnabled !== false && !rec.noHifdh;
      var tb2 = qs('tahfidhToggleBtn');
      if (tb2) {
        qs('tahfidhFields').style.display = tahfidhOn ? '' : 'none';
        qs('tahfidhOffMsg').style.display = tahfidhOn ? 'none' : 'block';
        tb2.className   = 'btn ' + (tahfidhOn ? 'btn-primary' : 'btn-secondary');
        tb2.textContent = tahfidhOn ? t('tahfidhToggle') : 'OFF';
      }
      if (rec.tahfidh) {
        if (qs('tSurahFrom')) qs('tSurahFrom').value  = rec.tahfidh.surahFrom || '';
        if (qs('tSurahTo'))   qs('tSurahTo').value    = rec.tahfidh.surahTo   || '';
        if (qs('tAyahFrom'))  qs('tAyahFrom').value   = rec.tahfidh.ayahFrom  || '';
        if (qs('tAyahTo'))    qs('tAyahTo').value     = rec.tahfidh.ayahTo    || '';
        var tErr = rec.tahfidh.errors || 0;
        if (qs('tErrors')) { qs('tErrors').textContent = tErr; updateGrade('tahfidh', tErr); }
        if (qs('tNotes'))  qs('tNotes').value = rec.tahfidh.notes || '';
      }
    }

    if (course === 'hifdh' || course === 'murajaah') {
      murajaahOn = rec.murajaahEnabled !== false;
      var mb2 = qs('murajaahToggleBtn');
      if (mb2) {
        qs('murajaahFields').style.display = murajaahOn ? '' : 'none';
        qs('murajaahOffMsg').style.display = murajaahOn ? 'none' : 'block';
        mb2.className   = 'btn ' + (murajaahOn ? 'btn-primary' : 'btn-secondary');
        mb2.textContent = murajaahOn ? t('murajaahToggle') : 'OFF';
      }
      if (rec.murajaah) {
        if (qs('mSurahFrom')) qs('mSurahFrom').value  = rec.murajaah.surahFrom || '';
        if (qs('mSurahTo'))   qs('mSurahTo').value    = rec.murajaah.surahTo   || '';
        var mErr = rec.murajaah.errors || 0;
        if (qs('mErrors')) { qs('mErrors').textContent = mErr; updateGrade('murajaah', mErr); }
        if (qs('mNotes'))  qs('mNotes').value = rec.murajaah.notes || '';
      }
    }

    if (course === 'talqin' && rec.talqin) {
      if (qs('talqinFrom'))  qs('talqinFrom').value  = rec.talqin.startedFrom || '';
      if (qs('talqinTo'))    qs('talqinTo').value    = rec.talqin.endedAt     || '';
      if (qs('talqinNotes')) qs('talqinNotes').value = rec.talqin.notes       || '';
    }

    if (course === 'qaida' && rec.qaida) {
      if (qs('qaidaBook'))  qs('qaidaBook').value  = rec.qaida.bookName  || '';
      if (qs('qaidaFrom'))  qs('qaidaFrom').value  = rec.qaida.fromPage  || '';
      if (qs('qaidaTo'))    qs('qaidaTo').value    = rec.qaida.toPage    || '';
    }
  }

  // --- Date picker ---
  qs('recordDate').value = today;
  qs('recordDate').onchange = function() {
    currentDate = this.value;
    loadRecord(getDailyRecord(studentId, currentDate));
  };

  // --- Init ---
  renderCourseSection();
  setAtt('present');
  loadRecord(getDailyRecord(studentId, today));

  // --- Save ---
  qs('btnSave').onclick = function() {
    var tErr = (course === 'hifdh' && tahfidhOn && qs('tErrors')) ? (parseInt(qs('tErrors').textContent) || 0) : 0;
    var mErr = ((course === 'hifdh' || course === 'murajaah') && murajaahOn && qs('mErrors')) ? (parseInt(qs('mErrors').textContent) || 0) : 0;

    // Only calculate grade when section is ON — save empty when OFF
    var g_t = tahfidhOn  ? calcGrade(tErr) : { score: 0, rating: '' };
    var g_m = murajaahOn ? calcGrade(mErr) : { score: 0, rating: '' };

    var record = {
      studentId:       studentId,
      classId:         classId,
      date:            currentDate,
      attendance:      currentAtt,
      noHifdh:         course === 'hifdh' ? !tahfidhOn : true,
      tahfidhEnabled:  course === 'hifdh' ? tahfidhOn  : false,
      murajaahEnabled: (course === 'hifdh' || course === 'murajaah') ? murajaahOn : false
    };

    if (course === 'hifdh') {
      record.tahfidh = {
        surahFrom: tahfidhOn && qs('tSurahFrom') ? qs('tSurahFrom').value : '',
        ayahFrom:  tahfidhOn && qs('tAyahFrom')  ? qs('tAyahFrom').value  : '',
        surahTo:   tahfidhOn && qs('tSurahTo')   ? qs('tSurahTo').value   : '',
        ayahTo:    tahfidhOn && qs('tAyahTo')    ? qs('tAyahTo').value    : '',
        errors:    tErr,
        score:     g_t.score,
        rating:    g_t.rating,   // '' when OFF — won't affect grade average
        notes:     qs('tNotes') ? qs('tNotes').value : ''
      };
    }

    if (course === 'hifdh' || course === 'murajaah') {
      record.murajaah = {
        surahFrom: murajaahOn && qs('mSurahFrom') ? qs('mSurahFrom').value : '',
        surahTo:   murajaahOn && qs('mSurahTo')   ? qs('mSurahTo').value   : '',
        errors:    mErr,
        score:     g_m.score,
        rating:    g_m.rating,   // '' when OFF — won't affect grade average
        notes:     qs('mNotes') ? qs('mNotes').value : ''
      };
    }

    if (course === 'talqin') {
      record.talqin = {
        startedFrom: qs('talqinFrom')  ? qs('talqinFrom').value  : '',
        endedAt:     qs('talqinTo')    ? qs('talqinTo').value    : '',
        notes:       qs('talqinNotes') ? qs('talqinNotes').value : ''
      };
    }

    if (course === 'qaida') {
      record.qaida = {
        bookName: qs('qaidaBook')  ? qs('qaidaBook').value          : '',
        fromPage: qs('qaidaFrom')  ? (Number(qs('qaidaFrom').value) || 0) : 0,
        toPage:   qs('qaidaTo')    ? (Number(qs('qaidaTo').value)   || 0) : 0
      };
    }

    upsertDailyRecord(record);
    alert(t('savedAlert'));
    history.back();
  };
})();ss