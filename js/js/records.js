// js/records.js
(function () {
  const studentId = getQueryParam("studentId");
  const classId   = getQueryParam("classId");
  const today     = new Date().toISOString().slice(0, 10);
  const lang      = getLang();

  const student = getStudentById(studentId);
  if (student && qs("studentNameDisplay")) {
    qs("studentNameDisplay").textContent = student.name;
  }

  if (qs("recordDateDisplay")) {
    const d = new Date(today + 'T00:00:00');
    const locale = lang === 'en' ? 'en-US' : 'ar-SA';
    qs("recordDateDisplay").textContent = d.toLocaleDateString(locale, {
      weekday:'long', year:'numeric', month:'long', day:'numeric'
    });
  }

  // Hide entire tahfidh section for murajaah-only students
  const isMurajaahOnly = student && student.course === 'murajaah';
  if (isMurajaahOnly && qs("tahfidhSection")) {
    qs("tahfidhSection").style.display = 'none';
  }

  if (qs("tSurahFromWrap")) qs("tSurahFromWrap").innerHTML = surahSearchInput("tSurahFrom", "");
  if (qs("tSurahToWrap"))   qs("tSurahToWrap").innerHTML   = surahSearchInput("tSurahTo",   "");
  if (qs("mSurahFromWrap")) qs("mSurahFromWrap").innerHTML = surahSearchInput("mSurahFrom", "");
  if (qs("mSurahToWrap"))   qs("mSurahToWrap").innerHTML   = surahSearchInput("mSurahTo",   "");

  function getErr(id) { return parseInt(qs(id).textContent) || 0; }
  function setErr(id, val) { qs(id).textContent = Math.max(0, val); }

  qs("tErrMinus").onclick = () => setErr("tErrors", getErr("tErrors") - 1);
  qs("tErrPlus").onclick  = () => setErr("tErrors", getErr("tErrors") + 1);
  qs("mErrMinus").onclick = () => setErr("mErrors", getErr("mErrors") - 1);
  qs("mErrPlus").onclick  = () => setErr("mErrors", getErr("mErrors") + 1);

  // No-hifdh-today toggle state
  let noHifdh = false;

  window.toggleNoHifdh = function() {
    noHifdh = !noHifdh;
    const fields = qs("tahfidhFields");
    const msg    = qs("hifdhOffMsg");
    const btn    = qs("noHifdhBtn");
    if (fields) fields.style.display = noHifdh ? 'none' : '';
    if (msg)    msg.style.display    = noHifdh ? 'block' : 'none';
    if (btn) {
      btn.style.background = noHifdh ? '#FEE2E2' : '';
      btn.style.color      = noHifdh ? '#DC2626' : '';
    }
  };

  const existing = getDailyRecord(studentId, today);
  if (existing) {
    if (!isMurajaahOnly && existing.tahfidh) {
      qs("tSurahFrom").value = existing.tahfidh.surahFrom;
      qs("tSurahTo").value   = existing.tahfidh.surahTo;
      qs("tAyahFrom").value  = existing.tahfidh.ayahFrom;
      qs("tAyahTo").value    = existing.tahfidh.ayahTo;
      setErr("tErrors", existing.tahfidh.errors);
      qs("tRating").value    = existing.tahfidh.rating;

      // Restore no-hifdh state
      if (existing.noHifdh) {
        window.toggleNoHifdh();
      }
    }

    qs("mSurahFrom").value = existing.murajaah.surahFrom;
    qs("mSurahTo").value   = existing.murajaah.surahTo;
    qs("mAyahFrom").value  = existing.murajaah.ayahFrom;
    qs("mAyahTo").value    = existing.murajaah.ayahTo;
    setErr("mErrors", existing.murajaah.errors);
    qs("mRating").value    = existing.murajaah.rating;
  }

  qs("btnSave").onclick = () => {
    const record = {
      studentId, classId, date: today,
      noHifdh: noHifdh || isMurajaahOnly,
      tahfidh: {
        surahFrom: isMurajaahOnly || noHifdh ? '' : qs("tSurahFrom").value,
        surahTo:   isMurajaahOnly || noHifdh ? '' : qs("tSurahTo").value,
        ayahFrom:  isMurajaahOnly || noHifdh ? '' : qs("tAyahFrom").value,
        ayahTo:    isMurajaahOnly || noHifdh ? '' : qs("tAyahTo").value,
        errors:    isMurajaahOnly || noHifdh ? 0  : getErr("tErrors"),
        rating:    isMurajaahOnly || noHifdh ? '' : qs("tRating").value
      },
      murajaah: {
        surahFrom: qs("mSurahFrom").value,
        surahTo:   qs("mSurahTo").value,
        ayahFrom:  qs("mAyahFrom").value,
        ayahTo:    qs("mAyahTo").value,
        errors:    getErr("mErrors"),
        rating:    qs("mRating").value
      }
    };
    upsertDailyRecord(record);
    alert(t('savedAlert'));
    location.href = `class.html?classId=${classId}`;
  };
})();
