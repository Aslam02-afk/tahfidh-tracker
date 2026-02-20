// js/js/quran.js – Quran Reader logic

(function () {
  'use strict';

  // ===== State =====
  let quranData = [];       // Full JSON array from hafs_smart_v8.json
  let surahList = [];       // Array of { sura_no, sura_name_ar, sura_name_en, ayahCount }
  let currentMode = 'surah'; // 'surah' or 'juz'
  let currentSurah = 1;
  let currentJuz = 0;       // 0 = unset

  // ===== DOM refs =====
  const surahSelect   = document.getElementById('surahSelect');
  const juzSelect     = document.getElementById('juzSelect');
  const surahHeader   = document.getElementById('surahHeader');
  const quranContent  = document.getElementById('quranContent');
  const scrollTopBtn  = document.getElementById('scrollTopBtn');

  // ===== Bismillah text =====
  const BISMILLAH = 'بسم الله الرحمن الرحيم';

  // ===== Load data =====
  async function loadQuranData() {
    try {
      const resp = await fetch('kfgqpc_hafs_smart_data/hafs_smart_v8.json');
      if (!resp.ok) throw new Error('Failed to fetch Quran data');
      quranData = await resp.json();
      buildSurahList();
      populateDropdowns();
      // Default to Al-Fatiha
      surahSelect.value = '1';
      displaySurah(1);
    } catch (err) {
      console.error('Error loading Quran data:', err);
      quranContent.innerHTML = `
        <div style="text-align:center; padding:30px; color:var(--danger);">
          <div style="font-size:1.5rem; margin-bottom:8px;">&#9888;</div>
          <div>${t('quranLoadError')}</div>
        </div>`;
    }
  }

  // ===== Build unique surah list =====
  function buildSurahList() {
    const map = new Map();
    for (const ayah of quranData) {
      if (!map.has(ayah.sura_no)) {
        map.set(ayah.sura_no, {
          sura_no: ayah.sura_no,
          sura_name_ar: ayah.sura_name_ar,
          sura_name_en: ayah.sura_name_en,
          ayahCount: 0
        });
      }
      map.get(ayah.sura_no).ayahCount++;
    }
    surahList = Array.from(map.values()).sort((a, b) => a.sura_no - b.sura_no);
  }

  // ===== Populate dropdowns =====
  function populateDropdowns() {
    // Surah dropdown
    const lang = getLang();
    let surahHTML = `<option value="">${t('chooseSurah')}</option>`;
    for (const s of surahList) {
      const label = lang === 'ar'
        ? `${s.sura_no}. ${s.sura_name_ar}`
        : `${s.sura_no}. ${s.sura_name_en} – ${s.sura_name_ar}`;
      surahHTML += `<option value="${s.sura_no}">${label}</option>`;
    }
    surahSelect.innerHTML = surahHTML;

    // Juz dropdown
    let juzHTML = `<option value="">${t('allJuz')}</option>`;
    for (let j = 1; j <= 30; j++) {
      const label = lang === 'ar' ? `الجزء ${j}` : `Juz ${j}`;
      juzHTML += `<option value="${j}">${label}</option>`;
    }
    juzSelect.innerHTML = juzHTML;
  }

  // ===== Event listeners =====
  surahSelect.addEventListener('change', function () {
    const val = parseInt(this.value);
    if (!val) return;
    currentMode = 'surah';
    currentSurah = val;
    currentJuz = 0;
    juzSelect.value = '';
    displaySurah(val);
  });

  juzSelect.addEventListener('change', function () {
    const val = parseInt(this.value);
    if (!val) return;
    currentMode = 'juz';
    currentJuz = val;
    surahSelect.value = '';
    displayJuz(val);
  });

  // ===== Display a single surah =====
  function displaySurah(suraNo) {
    const ayahs = quranData.filter(a => a.sura_no === suraNo);
    if (!ayahs.length) return;

    const info = surahList.find(s => s.sura_no === suraNo);
    renderSurahHeader(info);
    renderAyahs(ayahs, suraNo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== Display all ayahs in a juz =====
  function displayJuz(juzNo) {
    const ayahs = quranData.filter(a => a.jozz === juzNo);
    if (!ayahs.length) return;

    // Show juz header
    const lang = getLang();
    const juzTitle = lang === 'ar' ? `الجزء ${juzNo}` : `Juz ${juzNo}`;
    surahHeader.innerHTML = `
      <div class="surah-header-card">
        <div class="surah-name-ar" style="font-size:1.5rem;">${juzTitle}</div>
        <div class="surah-meta">${ayahs.length} ${t('ayahs')}</div>
      </div>`;

    // Group ayahs by surah for display
    const grouped = groupBySurah(ayahs);
    let html = '';

    for (const group of grouped) {
      const sInfo = surahList.find(s => s.sura_no === group.sura_no);
      // Surah divider within juz
      html += `
        <div class="surah-divider">
          <span class="ornament">&#10022;</span>
        </div>
        <div style="text-align:center; margin-bottom:10px;">
          <span class="juz-label">${sInfo.sura_name_ar} – ${sInfo.sura_name_en}</span>
        </div>`;

      // Show bismillah if surah starts in this juz (aya_no 1 present) and not surah 1 or 9
      const startsHere = group.ayahs.some(a => a.aya_no === 1);
      if (startsHere && group.sura_no !== 1 && group.sura_no !== 9) {
        html += `<div class="bismillah">${BISMILLAH}</div>`;
      }

      html += buildAyahsHTML(group.ayahs);
    }

    quranContent.innerHTML = `<div class="ayah-container">${html}</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== Group ayahs by surah (preserving order) =====
  function groupBySurah(ayahs) {
    const groups = [];
    let current = null;
    for (const a of ayahs) {
      if (!current || current.sura_no !== a.sura_no) {
        current = { sura_no: a.sura_no, ayahs: [] };
        groups.push(current);
      }
      current.ayahs.push(a);
    }
    return groups;
  }

  // ===== Render surah header =====
  function renderSurahHeader(info) {
    if (!info) { surahHeader.innerHTML = ''; return; }
    const lang = getLang();
    const ayahLabel = lang === 'ar' ? 'آيات' : 'Ayahs';
    surahHeader.innerHTML = `
      <div class="surah-header-card">
        <div class="surah-name-ar">${info.sura_name_ar}</div>
        <div class="surah-name-en">${info.sura_name_en}</div>
        <div class="surah-meta">${info.ayahCount} ${ayahLabel}</div>
      </div>`;
  }

  // ===== Render ayahs for a single surah =====
  function renderAyahs(ayahs, suraNo) {
    let html = '';

    // Bismillah: show before every surah except Al-Fatiha (1) and At-Tawbah (9)
    // For Al-Fatiha, bismillah is ayah 1 itself, so no separate bismillah
    if (suraNo !== 1 && suraNo !== 9) {
      html += `<div class="bismillah">${BISMILLAH}</div>`;
    }

    html += buildAyahsHTML(ayahs);
    quranContent.innerHTML = `<div class="ayah-container">${html}</div>`;
  }

  // ===== Build inline ayah text with number badges =====
  function buildAyahsHTML(ayahs) {
    let html = '<div class="ayah-inline">';
    for (const a of ayahs) {
      html += `<span class="ayah-text">${escapeHTML(a.aya_text)}</span> `;
    }
    html += '</div>';
    return html;
  }

  // ===== Convert number to Arabic-Indic numerals =====
  function toArabicNumeral(num) {
    const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return String(num).replace(/\d/g, d => arabicDigits[parseInt(d)]);
  }

  // ===== Escape HTML =====
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===== Scroll-to-top button visibility =====
  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  // ===== Re-render on language change =====
  window.renderQuranPage = function () {
    if (!quranData.length) return;
    populateDropdowns();
    if (currentMode === 'surah' && currentSurah) {
      surahSelect.value = String(currentSurah);
      displaySurah(currentSurah);
    } else if (currentMode === 'juz' && currentJuz) {
      juzSelect.value = String(currentJuz);
      displayJuz(currentJuz);
    }
  };

  // ===== Init =====
  loadQuranData();

})();
