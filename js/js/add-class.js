// js/add-class.js
(function () {
  const classId = getQueryParam("classId");
  const isEdit  = !!classId;

  if (isEdit) {
    const h = getHalaqahById(classId);
    if (h) {
      qs("pageTitle").textContent   = t('editClassTitle');
      qs("className").value         = h.name;
      qs("teacherName").value       = h.teacher || "";
      qs("notes").value             = h.notes   || "";
      qs("btnDelete").style.display = "block";
    }
  }

  qs("btnSave").onclick = () => {
    const name = qs("className").value.trim();
    if (!name) { alert(t('enterClassName')); return; }

    const halaqah = {
      id:      isEdit ? classId : uid(),
      name,
      teacher: qs("teacherName").value.trim(),
      notes:   qs("notes").value.trim()
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
