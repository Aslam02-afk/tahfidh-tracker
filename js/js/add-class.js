// js/add-class.js
(function () {
  const classId = getQueryParam("classId");
  const isEdit  = !!classId;

  var teacherPhotoBase64 = '';

  // Gender / Time toggle helpers
  window.selectGender = function(val) {
    qs('teacherGender').value = val;
    qs('genderMale').className  = 'btn ' + (val === 'male'   ? 'btn-primary' : 'btn-secondary');
    qs('genderFemale').className = 'btn ' + (val === 'female' ? 'btn-primary' : 'btn-secondary');
    // Update preview placeholder if no custom photo
    if (!teacherPhotoBase64) {
      qs('teacherPhotoPreview').src = val === 'female'
        ? 'icons/female teacher icon.svg'
        : 'icons/male teacher icon.svg';
    }
  };

  window.selectTimeMode = function(mode) {
    qs('modeSalah').className  = 'btn ' + (mode === 'salah'  ? 'btn-primary' : 'btn-secondary');
    qs('modeCustom').className = 'btn ' + (mode === 'custom' ? 'btn-primary' : 'btn-secondary');
    qs('salahButtons').style.display   = mode === 'salah'  ? 'flex' : 'none';
    qs('customTimeWrap').style.display = mode === 'custom' ? 'block' : 'none';
    if (mode === 'custom') {
      qs('classTime').value = 'custom';
    } else {
      var cur = qs('classTime').value;
      if (!['fajr','dhuhr','asr','maghrib','isha'].includes(cur)) cur = 'dhuhr';
      selectSalahTime(cur);
    }
  };

  window.selectSalahTime = function(time) {
    qs('classTime').value = time;
    ['fajr','dhuhr','asr','maghrib','isha'].forEach(function(s) {
      var btn = document.getElementById('salah' + s.charAt(0).toUpperCase() + s.slice(1));
      if (btn) btn.className = 'btn ' + (s === time ? 'btn-primary' : 'btn-secondary');
    });
  };

  window.handleTeacherPhoto = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      teacherPhotoBase64 = e.target.result;
      qs('teacherPhotoPreview').src = teacherPhotoBase64;
      qs('teacherPhotoClearBtn').style.display = 'block';
    };
    reader.readAsDataURL(file);
  };

  window.clearTeacherPhoto = function() {
    teacherPhotoBase64 = '';
    const gender = qs('teacherGender').value;
    qs('teacherPhotoPreview').src = gender === 'female'
      ? 'icons/female teacher icon.svg'
      : 'icons/male teacher icon.svg';
    qs('teacherPhotoClearBtn').style.display = 'none';
    qs('teacherPhotoInput').value = '';
  };

  if (isEdit) {
    const h = getHalaqahById(classId);
    if (h) {
      qs("pageTitle").textContent   = t('editClassTitle');
      qs("className").value         = h.name;
      qs("teacherName").value       = h.teacher || "";
      qs("notes").value             = h.notes   || "";
      qs("btnDelete").style.display = "block";
      if (h.teacherGender) selectGender(h.teacherGender);
      var rawTime = h.classTime || 'dhuhr';
      if (rawTime === 'morning') rawTime = 'dhuhr';
      if (rawTime === 'evening') rawTime = 'maghrib';
      if (rawTime === 'custom') {
        selectTimeMode('custom');
        if (h.classTimeCustom) qs('classTimeCustom').value = h.classTimeCustom;
      } else {
        selectTimeMode('salah');
        selectSalahTime(rawTime);
      }
      if (h.teacherPhoto) {
        teacherPhotoBase64 = h.teacherPhoto;
        qs('teacherPhotoPreview').src = h.teacherPhoto;
        qs('teacherPhotoClearBtn').style.display = 'block';
      }
    }
  }

  qs("btnSave").onclick = () => {
    const name = qs("className").value.trim();
    if (!name) { alert(t('enterClassName')); return; }

    const halaqah = {
      id:              isEdit ? classId : uid(),
      name,
      teacher:         qs("teacherName").value.trim(),
      teacherGender:   qs("teacherGender").value,
      classTime:       qs("classTime").value,
      classTimeCustom: qs("classTime").value === 'custom' ? (qs("classTimeCustom").value || '') : '',
      teacherPhoto:    teacherPhotoBase64 || '',
      notes:           qs("notes").value.trim()
    };

    saveClass(halaqah);
    location.href = isEdit ? `class.html?classId=${halaqah.id}` : "index.html";
  };

  qs("btnDelete").onclick = () => {
    const h = getHalaqahById(classId);
    if (confirm(t('confirmDeleteClassFull').replace('$1', h ? h.name : ''))) {
      deleteClass(classId);
      location.href = "index.html";
    }
  };

  // Initialize time picker (new class defaults to salah/dhuhr)
  if (!isEdit) selectSalahTime('dhuhr');
})();
