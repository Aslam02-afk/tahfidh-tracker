// js/add-student.js
(function () {
  const studentId = getQueryParam("studentId");
  const classId   = getQueryParam("classId");
  const isEdit    = !!studentId;

  // Inject surah select
  qs("lastSurahWrap").innerHTML = surahSelect("lastSurah", "");

  if (isEdit) {
    const s = getStudentById(studentId);
    if (s) {
      qs("pageTitle").textContent   = "تعديل بيانات الطالب";
      qs("studentName").value       = s.name;
      qs("gender").value            = s.gender    || "ذكر";
      qs("phone").value             = s.phone     || "";
      qs("lastSurah").value         = s.lastSurah || "";
      qs("notes").value             = s.notes     || "";
      qs("btnDelete").style.display = "block";
    }
  }

  qs("btnSave").onclick = () => {
    const name = qs("studentName").value.trim();
    if (!name) { alert("يرجى إدخال اسم الطالب"); return; }

    const student = isEdit
      ? Object.assign(getStudentById(studentId) || {}, {
          name,
          gender:    qs("gender").value,
          phone:     qs("phone").value.trim(),
          lastSurah: qs("lastSurah").value,
          notes:     qs("notes").value.trim()
        })
      : {
          id:        uid(),
          classId,
          name,
          gender:    qs("gender").value,
          phone:     qs("phone").value.trim(),
          lastSurah: qs("lastSurah").value,
          notes:     qs("notes").value.trim(),
          absences:  0,
          late:      0,
          starred:   false,
          attendance: {}
        };

    saveStudent(student);
    location.href = `class.html?classId=${student.classId}`;
  };

  qs("btnDelete").onclick = () => {
    const s = getStudentById(studentId);
    if (confirm('حذف الطالب "' + (s ? s.name : '') + '"؟\nسيتم حذف جميع سجلاته.')) {
      deleteStudent(studentId);
      location.href = `class.html?classId=${classId}`;
    }
  };
})();
