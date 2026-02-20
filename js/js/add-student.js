// js/add-student.js
(function () {
  const studentId = getQueryParam("studentId");
  const classId   = getQueryParam("classId");
  const isEdit    = !!studentId;

  var studentPhotoBase64 = '';

  function genderIconSrc(genderVal) {
    return (genderVal === 'أنثى' || genderVal === 'Female')
      ? 'icons/female teacher icon.svg'
      : 'icons/male teacher icon.svg';
  }

  window.onGenderChange = function(val) {
    if (!studentPhotoBase64) {
      qs('studentPhotoPreview').src = genderIconSrc(val);
    }
  };

  window.handleStudentPhoto = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      studentPhotoBase64 = e.target.result;
      qs('studentPhotoPreview').src = studentPhotoBase64;
      qs('studentPhotoClearBtn').style.display = 'block';
    };
    reader.readAsDataURL(file);
  };

  window.clearStudentPhoto = function() {
    studentPhotoBase64 = '';
    qs('studentPhotoPreview').src = genderIconSrc(qs('gender').value);
    qs('studentPhotoClearBtn').style.display = 'none';
    qs('studentPhotoInput').value = '';
  };

  qs("lastSurahWrap").innerHTML = surahSelect("lastSurah", "");

  if (isEdit) {
    const s = getStudentById(studentId);
    if (s) {
      qs("pageTitle").textContent   = t('editStudentTitle');
      qs("studentName").value       = s.name;
      qs("gender").value            = s.gender      || "ذكر";
      qs("course").value            = s.course      || "hifdh";
      qs("phone").value             = s.phone       || "";
      qs("lastSurah").value         = s.lastSurah   || "";
      qs("examJuz").value           = s.examJuz != null ? s.examJuz : "";
      qs("examPercent").value       = s.examPercent != null ? s.examPercent : "";
      qs("examNotes").value         = s.examNotes   || "";
      qs("notes").value             = s.notes       || "";
      qs("btnDelete").style.display = "block";
      if (s.studentPhoto) {
        studentPhotoBase64 = s.studentPhoto;
        qs('studentPhotoPreview').src = s.studentPhoto;
        qs('studentPhotoClearBtn').style.display = 'block';
      } else {
        qs('studentPhotoPreview').src = genderIconSrc(s.gender || "ذكر");
      }
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
          gender:       qs("gender").value,
          course:       qs("course").value,
          phone:        qs("phone").value.trim(),
          lastSurah:    qs("lastSurah").value,
          examJuz:      examJuzVal !== "" ? Number(examJuzVal) : null,
          examPercent:  examPercentVal !== "" ? Number(examPercentVal) : null,
          examNotes:    qs("examNotes").value.trim(),
          notes:        qs("notes").value.trim(),
          studentPhoto: studentPhotoBase64 || ''
        })
      : {
          id:           uid(),
          classId,
          name,
          gender:       qs("gender").value,
          course:       qs("course").value,
          phone:        qs("phone").value.trim(),
          lastSurah:    qs("lastSurah").value,
          examJuz:      examJuzVal !== "" ? Number(examJuzVal) : null,
          examPercent:  examPercentVal !== "" ? Number(examPercentVal) : null,
          examNotes:    qs("examNotes").value.trim(),
          notes:        qs("notes").value.trim(),
          studentPhoto: studentPhotoBase64 || '',
          absences:     0,
          late:         0,
          starred:      false,
          attendance:   {}
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
