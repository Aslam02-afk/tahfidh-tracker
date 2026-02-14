// js/add-student.js
(function () {
  const studentId = getQueryParam("studentId");
  const classId   = getQueryParam("classId");
  const isEdit    = !!studentId;

  qs("lastSurahWrap").innerHTML = surahSelect("lastSurah", "");

  if (isEdit) {
    const s = getStudentById(studentId);
    if (s) {
      qs("pageTitle").textContent   = t('editStudentTitle');
      qs("studentName").value       = s.name;
      qs("gender").value            = s.gender      || "ذكر";
      qs("phone").value             = s.phone       || "";
      qs("lastSurah").value         = s.lastSurah   || "";
      qs("examJuz").value           = s.examJuz != null ? s.examJuz : "";
      qs("examPercent").value       = s.examPercent != null ? s.examPercent : "";
      qs("examNotes").value         = s.examNotes   || "";
      qs("notes").value             = s.notes       || "";
      qs("btnDelete").style.display = "block";
    }
  }

  qs("btnSave").onclick = () => {
    const name = qs("studentName").value.trim();
    if (!name) { alert(t('enterStudentName')); return; }

    const examJuzVal     = qs("examJuz").value.trim();
    const examPercentVal = qs("examPercent").value.trim();

    const student = isEdit
      ? Object.assign(getStudentById(studentId) || {}, {
          name,
          gender:      qs("gender").value,
          phone:       qs("phone").value.trim(),
          lastSurah:   qs("lastSurah").value,
          examJuz:     examJuzVal !== "" ? Number(examJuzVal) : null,
          examPercent: examPercentVal !== "" ? Number(examPercentVal) : null,
          examNotes:   qs("examNotes").value.trim(),
          notes:       qs("notes").value.trim()
        })
      : {
          id:          uid(),
          classId,
          name,
          gender:      qs("gender").value,
          phone:       qs("phone").value.trim(),
          lastSurah:   qs("lastSurah").value,
          examJuz:     examJuzVal !== "" ? Number(examJuzVal) : null,
          examPercent: examPercentVal !== "" ? Number(examPercentVal) : null,
          examNotes:   qs("examNotes").value.trim(),
          notes:       qs("notes").value.trim(),
          absences:    0,
          late:        0,
          starred:     false,
          attendance:  {}
        };

    saveStudent(student);
    location.href = `class.html?classId=${student.classId}`;
  };

  qs("btnDelete").onclick = () => {
    const s = getStudentById(studentId);
    if (confirm(t('confirmDeleteStudentFull').replace('$1', s ? s.name : ''))) {
      deleteStudent(studentId);
      location.href = `class.html?classId=${classId}`;
    }
  };
})();
