// js/ui.js

function qs(id) { return document.getElementById(id); }
function getQueryParam(name) { return new URLSearchParams(window.location.search).get(name); }
function uid() { return Math.random().toString(36).substring(2, 10); }

// ===== Dark Mode =====
function initDarkMode() {
  if (localStorage.getItem('darkMode') === '1') {
    document.documentElement.classList.add('dark');
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark ? '1' : '0');
  updateDarkIcon();
}

function updateDarkIcon() {
  const btn = qs('darkToggle');
  if (!btn) return;
  const isDark = document.documentElement.classList.contains('dark');
  btn.innerHTML = `<img src="icons/${isDark ? 'night time icon' : 'day time icon'}.svg" style="width:20px; height:20px; filter:brightness(0) invert(1);" alt="">`;
}

// Call on every page load
initDarkMode();
updateDarkIcon();

// ===== Theme System =====
const THEME_FILES = {
  'arabic': 'themes/arabic-patterns.svg',
  'flower':  'themes/flower theme.svg',
  'bg':      'themes/BG.svg'
};

function applyTheme(theme) {
  if (!theme || theme === 'none') {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize  = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundAttachment = '';
  } else {
    const file = THEME_FILES[theme];
    if (!file) return;
    const isFull = theme === 'bg';
    document.body.style.backgroundImage     = `url('${file}')`;
    document.body.style.backgroundSize      = isFull ? 'cover' : '380px 380px';
    document.body.style.backgroundRepeat    = isFull ? 'no-repeat' : 'repeat';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundPosition  = isFull ? 'center center' : '0 0';
  }
}

function initTheme() {
  const saved = localStorage.getItem('appTheme') || 'none';
  applyTheme(saved);
  // Mark active button in settings if on that page
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.classList.toggle('theme-active', btn.dataset.theme === saved);
  });
}

function setTheme(theme) {
  localStorage.setItem('appTheme', theme);
  applyTheme(theme);
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.classList.toggle('theme-active', btn.dataset.theme === theme);
  });
}

initTheme();

// ===== Surah List =====
const SURAHS = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال",
  "التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء",
  "الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء",
  "النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر",
  "يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان",
  "الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم",
  "القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف",
  "الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة",
  "المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات",
  "النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج",
  "الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى",
  "الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة",
  "التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون",
  "النصر","المسد","الإخلاص","الفلق","الناس"
];

function surahOptions(selected) {
  return SURAHS.map((s, i) =>
    `<option value="${s}" ${s === selected ? 'selected' : ''}>${i+1}. ${s}</option>`
  ).join('');
}

function surahSelect(id, selected) {
  return `<select id="${id}" class="form-input form-select"><option value="">${t('chooseSurah')}</option>${surahOptions(selected)}</select>`;
}
