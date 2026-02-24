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

  window.selectStudentGender = function(val) {
    qs('gender').value = val === 'female' ? 'أنثى' : 'ذكر';
    qs('genderMale').className = 'btn ' + (val === 'male' ? 'btn-primary' : 'btn-secondary');
    qs('genderMale').style.background = '';
    qs('genderMale').style.color = '';
    qs('genderMale').style.borderColor = '';
    if (val === 'female') {
      qs('genderFemale').className = 'btn';
      qs('genderFemale').style.background = '#EC4899';
      qs('genderFemale').style.color = '#fff';
      qs('genderFemale').style.borderColor = '#EC4899';
    } else {
      qs('genderFemale').className = 'btn btn-secondary';
      qs('genderFemale').style.background = '';
      qs('genderFemale').style.color = '';
      qs('genderFemale').style.borderColor = '';
    }
    window.onGenderChange(qs('gender').value);
  };

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

  // ── Show fee section if class has fees enabled ────────────────────────────
  const halaqah = getHalaqahById(classId);
  if (halaqah && halaqah.feesEnabled) {
    qs('studentFeeSection').style.display = 'block';
    // Show currency label
    if (halaqah.feeCurrency) {
      qs('feeCurrencyLabel').textContent = halaqah.feeCurrency;
    }
    // Show fee period in label
    const periodMap = { monthly: 'شهري', weekly: 'أسبوعي', term: 'فصل دراسي', custom: 'مخصص' };
    if (halaqah.feePeriod) {
      qs('feeAmountLabel').textContent = `مبلغ الرسوم (${periodMap[halaqah.feePeriod] || halaqah.feePeriod})`;
    }
    // Default start month to current month
    if (!isEdit) {
      const now = new Date();
      qs('feeStartMonth').value = now.toISOString().slice(0, 7);
    }
  }

  qs("lastSurahWrap").innerHTML = surahSelect("lastSurah", "");

  if (isEdit) {
    const s = getStudentById(studentId);
    if (s) {
      qs("pageTitle").textContent   = t('editStudentTitle');
      qs("studentName").value       = s.name;
      selectStudentGender((s.gender === 'أنثى' || s.gender === 'Female') ? 'female' : 'male');
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
      // Load fee fields
      if (halaqah && halaqah.feesEnabled) {
        if (s.feeStartMonth) qs('feeStartMonth').value = s.feeStartMonth;
        if (s.feeAmount != null) qs('feeAmount').value = s.feeAmount;
      }
    }
  }

  qs("btnSave").onclick = () => {
    const name = qs("studentName").value.trim();
    if (!name) { alert(t('enterStudentName')); return; }

    const examJuzVal     = qs("examJuz").value.trim();
    const examPercentVal = qs("examPercent").value.trim();

    // Fee fields
    const hasFees      = halaqah && halaqah.feesEnabled;
    const feeStartMonth = hasFees ? (qs('feeStartMonth').value || '') : '';
    const feeAmountVal  = hasFees ? qs('feeAmount').value.trim() : '';

    const student = isEdit
      ? Object.assign(getStudentById(studentId) || {}, {
          name,
          gender:        qs("gender").value,
          course:        qs("course").value,
          phone:         qs("phone").value.trim(),
          lastSurah:     qs("lastSurah").value,
          examJuz:       examJuzVal !== "" ? Number(examJuzVal) : null,
          examPercent:   examPercentVal !== "" ? Number(examPercentVal) : null,
          examNotes:     qs("examNotes").value.trim(),
          notes:         qs("notes").value.trim(),
          studentPhoto:  studentPhotoBase64 || '',
          feeStartMonth: feeStartMonth,
          feeAmount:     feeAmountVal !== "" ? Number(feeAmountVal) : null,
        })
      : {
          id:            uid(),
          classId,
          name,
          gender:        qs("gender").value,
          course:        qs("course").value,
          phone:         qs("phone").value.trim(),
          lastSurah:     qs("lastSurah").value,
          examJuz:       examJuzVal !== "" ? Number(examJuzVal) : null,
          examPercent:   examPercentVal !== "" ? Number(examPercentVal) : null,
          examNotes:     qs("examNotes").value.trim(),
          notes:         qs("notes").value.trim(),
          studentPhoto:  studentPhotoBase64 || '',
          absences:      0,
          late:          0,
          starred:       false,
          attendance:    {},
          feeStartMonth: feeStartMonth,
          feeAmount:     feeAmountVal !== "" ? Number(feeAmountVal) : null,
          feePayments:   [],
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