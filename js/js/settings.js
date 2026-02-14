// js/settings.js

function updateDarkBtn() {
  const isDark = document.documentElement.classList.contains('dark');
  const btn = qs('darkModeBtn');
  if (btn) btn.textContent = isDark ? 'إيقاف' : 'تفعيل';
  const toggle = qs('darkToggle');
  if (toggle) toggle.textContent = isDark ? '☀️' : '🌙';
}

updateDarkBtn();

function doImport() {
  const file = qs('importFile').files[0];
  if (!file) { alert('يرجى اختيار ملف JSON'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    if (importDB(e.target.result)) {
      alert('تم استيراد البيانات بنجاح ✅');
      location.reload();
    } else {
      alert('فشل الاستيراد. تأكد من أن الملف صحيح.');
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (confirm('هل أنت متأكد؟\nسيتم حذف جميع البيانات نهائياً ولا يمكن التراجع.')) {
    localStorage.removeItem('tahfidh_tracker_db');
    alert('تم مسح جميع البيانات.');
    location.href = 'index.html';
  }
}
