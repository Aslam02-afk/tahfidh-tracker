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

initDarkMode();
updateDarkIcon();

// ===== Theme System =====
const THEME_FILES = {
  'green':  'themes/green_theme.svg',
  'pink':   'themes/Pink_theme.svg',
  'purple': 'themes/puple_theme.svg',
  'bg':     'themes/BG.svg'
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

// ===== Bottom Nav — inject on every page =====
(function injectBottomNav() {
  // Don't inject if already exists in HTML
  if (document.querySelector('.bottom-nav')) return;

  const page = window.location.pathname.split('/').pop() || 'index.html';
  const isHome     = page === 'index.html' || page === '';
  const isQuran    = page === 'quran.html';
  const isSettings = page === 'settings.html';

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <button class="nav-btn ${isHome ? 'active' : ''}" onclick="location.href='index.html'">
      <div class="nav-icon"><img src="icons/home icon.svg" alt=""></div>
      <div class="nav-text" data-i18n="home">الرئيسية</div>
    </button>
    <button class="nav-btn ${isQuran ? 'active' : ''}" onclick="location.href='quran.html'">
      <div class="nav-icon"><img src="icons/Quran icon.svg" alt=""></div>
      <div class="nav-text" data-i18n="quran">القرآن</div>
    </button>
    <button class="nav-btn ${isSettings ? 'active' : ''}" onclick="location.href='settings.html'">
      <div class="nav-icon"><img src="icons/setting icon.svg" alt=""></div>
      <div class="nav-text" data-i18n="settings">الإعدادات</div>
    </button>
  `;

  document.body.appendChild(nav);

  // Re-apply i18n to new nav elements if available
  if (typeof applyI18n === 'function') applyI18n();
})();

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

function surahSearchInput(id, selected) {
  const listId = id + '_list';
  return `<div style="position:relative;">
    <input id="${id}" class="form-input" list="${listId}"
      placeholder="${t('chooseSurah')}"
      value="${selected || ''}" autocomplete="off"
      style="padding-inline-end:2.4rem;" />
    <span style="position:absolute;inset-inline-end:10px;top:50%;transform:translateY(-50%);opacity:0.35;pointer-events:none;">🔍</span>
  </div>
  <datalist id="${listId}">
    ${SURAHS.map((s, i) => `<option value="${s}">${i + 1}. ${s}</option>`).join('')}
  </datalist>`;
}