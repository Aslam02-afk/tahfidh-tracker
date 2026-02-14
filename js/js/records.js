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

  if (qs("tSurahFromWrap")) qs("tSurahFromWrap").innerHTML = surahSelect("tSurahFrom", "");
  if (qs("tSurahToWrap"))   qs("tSurahToWrap").innerHTML   = surahSelect("tSurahTo",   "");
  if (qs("mSurahFromWrap")) qs("mSurahFromWrap").innerHTML = surahSelect("mSurahFrom", "");
  if (qs("mSurahToWrap"))   qs("mSurahToWrap").innerHTML   = surahSelect("mSurahTo",   "");

  function getErr(id) { return parseInt(qs(id).textContent) || 0; }
  function setErr(id, val) { qs(id).textContent = Math.max(0, val); }

  qs("tErrMinus").onclick = () => setErr("tErrors", getErr("tErrors") - 1);
  qs("tErrPlus").onclick  = () => setErr("tErrors", getErr("tErrors") + 1);
  qs("mErrMinus").onclick = () => setErr("mErrors", getErr("mErrors") - 1);
  qs("mErrPlus").onclick  = () => setErr("mErrors", getErr("mErrors") + 1);

  const existing = getDailyRecord(studentId, today);
  if (existing) {
    qs("tSurahFrom").value = existing.tahfidh.surahFrom;
    qs("tSurahTo").value   = existing.tahfidh.surahTo;
    qs("tAyahFrom").value  = existing.tahfidh.ayahFrom;
    qs("tAyahTo").value    = existing.tahfidh.ayahTo;
    setErr("tErrors", existing.tahfidh.errors);
    qs("tRating").value    = existing.tahfidh.rating;

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
      tahfidh: {
        surahFrom: qs("tSurahFrom").value,
        surahTo:   qs("tSurahTo").value,
        ayahFrom:  qs("tAyahFrom").value,
        ayahTo:    qs("tAyahTo").value,
        errors:    getErr("tErrors"),
        rating:    qs("tRating").value
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
