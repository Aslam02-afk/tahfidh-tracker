// js/settings.js

function updateDarkBtn() {
  const isDark = document.documentElement.classList.contains('dark');
  const btn = qs('darkModeBtn');
  if (btn) btn.textContent = isDark ? t('disable') : t('enable');
  const toggle = qs('darkToggle');
  if (toggle) toggle.textContent = isDark ? '☀️' : '🌙';
}

function updateLangBtn() {
  const lang = getLang();
  const btn = qs('langBtn');
  if (btn) btn.textContent = lang === 'ar' ? 'English' : 'العربية';
}

updateDarkBtn();
updateLangBtn();

function switchLang() {
  toggleLang();
  updateDarkBtn();
  updateLangBtn();
  applyLang();
}

function doImport() {
  const file = qs('importFile').files[0];
  if (!file) { alert(t('selectFile')); return; }
  const reader = new FileReader();
  reader.onload = e => {
    if (importDB(e.target.result)) {
      alert(t('importSuccess'));
      location.reload();
    } else {
      alert(t('importFail'));
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (confirm(t('clearConfirm'))) {
    localStorage.removeItem('tahfidh_tracker_db');
    alert(t('clearDone'));
    location.href = 'index.html';
  }
}
