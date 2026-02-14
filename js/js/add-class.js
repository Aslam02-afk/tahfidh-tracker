// js/add-class.js
(function () {
  const classId = getQueryParam("classId");
  const isEdit  = !!classId;

  // Gender / Time toggle helpers
  window.selectGender = function(val) {
    qs('teacherGender').value = val;
    qs('genderMale').className  = 'btn ' + (val === 'male'   ? 'btn-primary' : 'btn-secondary');
    qs('genderFemale').className = 'btn ' + (val === 'female' ? 'btn-primary' : 'btn-secondary');
  };

  window.selectTime = function(val) {
    qs('classTime').value = val;
    qs('timeMorning').className = 'btn ' + (val === 'morning' ? 'btn-primary' : 'btn-secondary');
    qs('timeEvening').className = 'btn ' + (val === 'evening' ? 'btn-primary' : 'btn-secondary');
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
      if (h.classTime) selectTime(h.classTime);
    }
  }

  qs("btnSave").onclick = () => {
    const name = qs("className").value.trim();
    if (!name) { alert(t('enterClassName')); return; }

    const halaqah = {
      id:            isEdit ? classId : uid(),
      name,
      teacher:       qs("teacherName").value.trim(),
      teacherGender: qs("teacherGender").value,
      classTime:     qs("classTime").value,
      notes:         qs("notes").value.trim()
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
})();
