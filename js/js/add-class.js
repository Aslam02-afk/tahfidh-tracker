// js/add-class.js
(function () {
  const classId = getQueryParam("classId");
  const isEdit  = !!classId;

  var teacherPhotoBase64 = '';

  // ── Gender / Time / Theme toggles ────────────────────────────────────────
  window.selectGender = function(val) {
    qs('teacherGender').value = val;
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
  };

  window.selectCardTheme = function(theme) {
    qs('cardTheme').value = theme;
    ['none','pink','green','greenlight','purple'].forEach(function(k) {
      var btn = document.getElementById('cardTheme-' + k);
      if (btn) btn.className = 'btn ' + (k === theme ? 'btn-primary' : 'btn-secondary');
    });
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
    qs('teacherPhotoPreview').src = 'icons/Quran icon.svg';
    qs('teacherPhotoClearBtn').style.display = 'none';
    qs('teacherPhotoInput').value = '';
  };

  // ── Fee system ────────────────────────────────────────────────────────────
  window.toggleFeeSection = function(enabled) {
    qs('feeSectionWrap').style.display = enabled ? 'block' : 'none';
  };

  window.selectFeePeriod = function(period) {
    qs('feePeriod').value = period;
    ['monthly','weekly','term','custom'].forEach(function(p) {
      var btn = document.getElementById('feePeriod-' + p);
      if (btn) btn.className = 'btn ' + (p === period ? 'btn-primary' : 'btn-secondary');
    });
  };

  // ── Load existing class for edit ─────────────────────────────────────────
  if (isEdit) {
    const h = getHalaqahById(classId);
    if (h) {
      qs("pageTitle").textContent   = t('editClassTitle');
      qs("className").value         = h.name;
      qs("teacherName").value       = h.teacher || "";
      qs("notes").value             = h.notes   || "";
      qs("btnDelete").style.display = "block";
      if (h.cardTheme) selectCardTheme(h.cardTheme);
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

      // Load fee settings
      if (h.feesEnabled) {
        qs('feesEnabled').checked = true;
        toggleFeeSection(true);
        if (h.feePeriod)      selectFeePeriod(h.feePeriod);
        if (h.feeCurrency)    qs('feeCurrency').value    = h.feeCurrency;
        if (h.feeBankName)    qs('feeBankName').value    = h.feeBankName;
        if (h.feeBankAccount) qs('feeBankAccount').value = h.feeBankAccount;
        if (h.feeStcNumber)   qs('feeStcNumber').value   = h.feeStcNumber;
      }
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  qs("btnSave").onclick = () => {
    const name = qs("className").value.trim();
    if (!name) { alert(t('enterClassName')); return; }

    const feesEnabled = qs('feesEnabled').checked;

    const halaqah = {
      id:              isEdit ? classId : uid(),
      name,
      teacher:         qs("teacherName").value.trim(),
      teacherGender:   qs("teacherGender").value,
      classTime:       qs("classTime").value,
      classTimeCustom: qs("classTime").value === 'custom' ? (qs("classTimeCustom").value || '') : '',
      cardTheme:       qs("cardTheme").value || 'none',
      teacherPhoto:    teacherPhotoBase64 || '',
      notes:           qs("notes").value.trim(),
      // Fee system
      feesEnabled:     feesEnabled,
      feePeriod:       feesEnabled ? qs("feePeriod").value       : '',
      feeCurrency:     feesEnabled ? qs("feeCurrency").value.trim() : '',
      feeBankName:     feesEnabled ? qs("feeBankName").value.trim() : '',
      feeBankAccount:  feesEnabled ? qs("feeBankAccount").value.trim() : '',
      feeStcNumber:    feesEnabled ? qs("feeStcNumber").value.trim() : '',
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

  // Initialize
  if (!isEdit) {
    selectSalahTime('dhuhr');
    selectFeePeriod('monthly');
  }
})();