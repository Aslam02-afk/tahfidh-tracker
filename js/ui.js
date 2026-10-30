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

// ===== Bottom Nav — YouTube-Style Auto-Hiding Navigation =====
function setupAutoHidingNav(nav) {
  if (!nav || nav._hasAutoHiding) return;
  nav._hasAutoHiding = true;

  const SCROLL_THRESHOLD = 8;  // px — ignore tiny scroll jitter
  const PAUSE_DELAY      = 400; // ms — YouTube-style reappear after pause

  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  let ticking     = false;
  let pauseTimer  = null;
  let isNavHidden = false;

  function showNav() {
    if (isNavHidden) {
      isNavHidden = false;
      nav.classList.remove('nav-hidden');
      nav.style.transform = '';
    }
  }

  function hideNav() {
    if (!isNavHidden) {
      isNavHidden = true;
      nav.classList.add('nav-hidden');
    }
  }

  function onScrollStop() {
    // YouTube behavior: if scrolling stops for ~400ms, bring nav back
    showNav();
    lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function handleScroll(currentY) {
    if (pauseTimer) {
      clearTimeout(pauseTimer);
    }
    pauseTimer = setTimeout(onScrollStop, PAUSE_DELAY);

    // At the top of the page — always show
    if (currentY <= 15) {
      showNav();
      lastScrollY = currentY;
      return;
    }

    const delta = currentY - lastScrollY;

    // Scrolling DOWN past threshold → smoothly hide
    if (delta > SCROLL_THRESHOLD) {
      if (!isNavHidden) {
        hideNav();
      }
      lastScrollY = currentY;
    }
    // Scrolling UP past threshold → immediately show
    else if (delta < -SCROLL_THRESHOLD) {
      if (isNavHidden) {
        showNav();
      }
      lastScrollY = currentY;
    }
  }

  // Window / Document scroll listener with requestAnimationFrame
  window.addEventListener('scroll', function() {
    const currentY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (!ticking) {
      requestAnimationFrame(function() {
        handleScroll(currentY);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Handle nested scrollable containers (e.g. .mushaf-scroll in Quran reader)
  document.addEventListener('scroll', function(e) {
    const target = e.target;
    if (!target || target === document || target === window) return;
    if (typeof target.scrollTop !== 'number') return;
    if (target.scrollHeight <= target.clientHeight) return;
    // Don't hide nav when scrolling inside modals/popups
    if (target.closest && (target.closest('.surah-modal') || target.closest('.bk-modal') || target.closest('.tt-modal'))) return;

    const currentY = target.scrollTop;
    const lastY = target._lastScrollTop !== undefined ? target._lastScrollTop : currentY;
    const delta = currentY - lastY;

    if (pauseTimer) {
      clearTimeout(pauseTimer);
    }
    pauseTimer = setTimeout(function() {
      onScrollStop();
      target._lastScrollTop = target.scrollTop;
    }, PAUSE_DELAY);

    if (currentY <= 15) {
      showNav();
      target._lastScrollTop = currentY;
      return;
    }

    if (delta > SCROLL_THRESHOLD) {
      if (!isNavHidden) hideNav();
      target._lastScrollTop = currentY;
    } else if (delta < -SCROLL_THRESHOLD) {
      if (isNavHidden) showNav();
      target._lastScrollTop = currentY;
    }
  }, { passive: true, capture: true });

  // Ensure nav is visible when switching tabs, pageshow, or tab visibility change
  window.addEventListener('pageshow', showNav);
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
      showNav();
    }
  });

  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      showNav();
    });
  });
}

function initBottomNav() {
  let nav = document.querySelector('.bottom-nav');
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const isHome     = page === 'index.html' || page === '';
  const isQuran    = page === 'quran.html';
  const isSettings = page === 'settings.html';

  if (!nav) {
    nav = document.createElement('nav');
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

    if (typeof applyI18n === 'function') {
      applyI18n();
    }
  }

  setupAutoHidingNav(nav);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBottomNav);
} else {
  initBottomNav();
}

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