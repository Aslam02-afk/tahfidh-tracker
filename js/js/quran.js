// js/quran.js — Mushaf Madani Digital (Page-based)

// ── Surah metadata: [name, startPage, ayahCount, type] ───────────────────
const SURAH_META = [
  [1,  "الفاتحة",     1,   7,  "مكية"],
  [2,  "البقرة",      2,   286,"مدنية"],
  [3,  "آل عمران",   50,  200,"مدنية"],
  [4,  "النساء",      77,  176,"مدنية"],
  [5,  "المائدة",     106, 120,"مدنية"],
  [6,  "الأنعام",     128, 165,"مكية"],
  [7,  "الأعراف",     151, 206,"مكية"],
  [8,  "الأنفال",     177, 75, "مدنية"],
  [9,  "التوبة",      187, 129,"مدنية"],
  [10, "يونس",        208, 109,"مكية"],
  [11, "هود",         221, 123,"مكية"],
  [12, "يوسف",        235, 111,"مكية"],
  [13, "الرعد",       249, 43, "مدنية"],
  [14, "إبراهيم",     255, 52, "مكية"],
  [15, "الحجر",       262, 99, "مكية"],
  [16, "النحل",       267, 128,"مكية"],
  [17, "الإسراء",     282, 111,"مكية"],
  [18, "الكهف",       293, 110,"مكية"],
  [19, "مريم",        305, 98, "مكية"],
  [20, "طه",          312, 135,"مكية"],
  [21, "الأنبياء",    322, 112,"مكية"],
  [22, "الحج",        333, 78, "مدنية"],
  [23, "المؤمنون",    342, 118,"مكية"],
  [24, "النور",       350, 64, "مدنية"],
  [25, "الفرقان",     359, 77, "مكية"],
  [26, "الشعراء",     367, 227,"مكية"],
  [27, "النمل",       377, 93, "مكية"],
  [28, "القصص",       385, 88, "مكية"],
  [29, "العنكبوت",    396, 69, "مكية"],
  [30, "الروم",       404, 60, "مكية"],
  [31, "لقمان",       411, 34, "مكية"],
  [32, "السجدة",      415, 30, "مكية"],
  [33, "الأحزاب",     418, 73, "مدنية"],
  [34, "سبأ",         428, 54, "مكية"],
  [35, "فاطر",        434, 45, "مكية"],
  [36, "يس",          440, 83, "مكية"],
  [37, "الصافات",     446, 182,"مكية"],
  [38, "ص",           453, 88, "مكية"],
  [39, "الزمر",       458, 75, "مكية"],
  [40, "غافر",        467, 85, "مكية"],
  [41, "فصلت",        477, 54, "مكية"],
  [42, "الشورى",      483, 53, "مكية"],
  [43, "الزخرف",      489, 89, "مكية"],
  [44, "الدخان",      496, 59, "مكية"],
  [45, "الجاثية",     499, 37, "مكية"],
  [46, "الأحقاف",     502, 35, "مكية"],
  [47, "محمد",        507, 38, "مدنية"],
  [48, "الفتح",       511, 29, "مدنية"],
  [49, "الحجرات",     515, 18, "مدنية"],
  [50, "ق",           518, 45, "مكية"],
  [51, "الذاريات",    520, 60, "مكية"],
  [52, "الطور",       523, 49, "مكية"],
  [53, "النجم",       526, 62, "مكية"],
  [54, "القمر",       528, 55, "مكية"],
  [55, "الرحمن",      531, 78, "مدنية"],
  [56, "الواقعة",     534, 96, "مكية"],
  [57, "الحديد",      537, 29, "مدنية"],
  [58, "المجادلة",    542, 22, "مدنية"],
  [59, "الحشر",       545, 24, "مدنية"],
  [60, "الممتحنة",    549, 13, "مدنية"],
  [61, "الصف",        551, 14, "مدنية"],
  [62, "الجمعة",      553, 11, "مدنية"],
  [63, "المنافقون",   554, 11, "مدنية"],
  [64, "التغابن",     556, 18, "مدنية"],
  [65, "الطلاق",      558, 12, "مدنية"],
  [66, "التحريم",     560, 12, "مدنية"],
  [67, "الملك",       562, 30, "مكية"],
  [68, "القلم",       564, 52, "مكية"],
  [69, "الحاقة",      566, 52, "مكية"],
  [70, "المعارج",     568, 44, "مكية"],
  [71, "نوح",         570, 28, "مكية"],
  [72, "الجن",        572, 28, "مكية"],
  [73, "المزمل",      574, 20, "مكية"],
  [74, "المدثر",      575, 56, "مكية"],
  [75, "القيامة",     577, 40, "مكية"],
  [76, "الإنسان",     578, 31, "مدنية"],
  [77, "المرسلات",    580, 50, "مكية"],
  [78, "النبأ",       582, 40, "مكية"],
  [79, "النازعات",    583, 46, "مكية"],
  [80, "عبس",         585, 42, "مكية"],
  [81, "التكوير",     586, 29, "مكية"],
  [82, "الانفطار",    587, 19, "مكية"],
  [83, "المطففين",    587, 36, "مكية"],
  [84, "الانشقاق",    589, 25, "مكية"],
  [85, "البروج",      590, 22, "مكية"],
  [86, "الطارق",      591, 17, "مكية"],
  [87, "الأعلى",      591, 19, "مكية"],
  [88, "الغاشية",     592, 26, "مكية"],
  [89, "الفجر",       593, 30, "مكية"],
  [90, "البلد",       594, 20, "مكية"],
  [91, "الشمس",       595, 15, "مكية"],
  [92, "الليل",       595, 21, "مكية"],
  [93, "الضحى",       596, 11, "مكية"],
  [94, "الشرح",       596, 8,  "مكية"],
  [95, "التين",       597, 8,  "مكية"],
  [96, "العلق",       597, 19, "مكية"],
  [97, "القدر",       598, 5,  "مكية"],
  [98, "البينة",      598, 8,  "مدنية"],
  [99, "الزلزلة",     599, 8,  "مدنية"],
  [100,"العاديات",    599, 11, "مكية"],
  [101,"القارعة",     600, 11, "مكية"],
  [102,"التكاثر",     600, 8,  "مكية"],
  [103,"العصر",       601, 3,  "مكية"],
  [104,"الهمزة",      601, 9,  "مكية"],
  [105,"الفيل",       601, 5,  "مكية"],
  [106,"قريش",        602, 4,  "مكية"],
  [107,"الماعون",     602, 7,  "مكية"],
  [108,"الكوثر",      602, 3,  "مكية"],
  [109,"الكافرون",    603, 6,  "مكية"],
  [110,"النصر",       603, 3,  "مدنية"],
  [111,"المسد",       603, 5,  "مكية"],
  [112,"الإخلاص",     604, 4,  "مكية"],
  [113,"الفلق",       604, 5,  "مكية"],
  [114,"الناس",       604, 6,  "مكية"],
];

// Juz start pages
const JUZ_PAGES = [
  1,22,42,62,82,102,121,142,162,182,
  201,222,242,262,282,302,322,342,362,382,
  402,422,442,462,482,502,522,542,562,582
];

// Only At-Tawbah (9) has no Basmalah
// Al-Fatiha (1) Basmalah IS verse 1 — don't add separately
const NO_BASMALAH = [1, 9];

// ── Smart field name detector ─────────────────────────────────────────────
function detectFields(verse) {
  console.log('[Quran] Sample verse keys:', Object.keys(verse));
  console.log('[Quran] Sample verse:', JSON.stringify(verse));

  // Page field
  const pageField =
    'page_number' in verse ? 'page_number' :
    'page'        in verse ? 'page'        :
    'page_no'     in verse ? 'page_no'     :
    'p'           in verse ? 'p'           : null;

  // Surah field
  const surahField =
    'surah_number' in verse ? 'surah_number' :
    'chapter'      in verse ? 'chapter'      :
    'sura_no'      in verse ? 'sura_no'      :
    'surah'        in verse ? 'surah'        :
    'sura'         in verse ? 'sura'         :
    's'            in verse ? 's'            : null;

  // Ayah field
  const ayahField =
    'verse_number' in verse ? 'verse_number' :
    'verse'        in verse ? 'verse'        :
    'aya_no'       in verse ? 'aya_no'       :
    'ayah'         in verse ? 'ayah'         :
    'aya'          in verse ? 'aya'          :
    'v'            in verse ? 'v'            : null;

  // Text field
  const textField =
    'text_uthmani' in verse ? 'text_uthmani' :
    'aya_text'     in verse ? 'aya_text'     :
    'text'         in verse ? 'text'         :
    'aya'          in verse ? 'aya'          :
    't'            in verse ? 't'            : null;

  console.log('[Quran] Detected fields → page:', pageField, '| surah:', surahField, '| ayah:', ayahField, '| text:', textField);
  return { pageField, surahField, ayahField, textField };
}

let FIELDS = null;
let quranData    = null;
let pagesByNum   = {};
let BASMALAH_TEXT = '﷽'; // Unicode fallback — replaced with actual data text on load

// ── Load data ─────────────────────────────────────────────────────────────
async function loadQuranData() {
  try {
    const res  = await fetch('kfgqpc_hafs_smart_data/hafs_smart_v8.json');
    const json = await res.json();

    // Support both array and object formats
    const verses = Array.isArray(json) ? json : (json.verses || json.data || Object.values(json));

    // Detect field names from first verse
    FIELDS = detectFields(verses[0]);

    // TEMP DEBUG — remove after fix
    alert('Keys: ' + Object.keys(verses[0]).join(', ') + '\n\nFirst verse: ' + JSON.stringify(verses[0]).substring(0, 300));

    // Group by page number using detected field
    pagesByNum = {};
    for (const v of verses) {
      const pg = FIELDS.pageField ? v[FIELDS.pageField] : null;
      if (!pg) continue;
      if (!pagesByNum[pg]) pagesByNum[pg] = [];
      pagesByNum[pg].push(v);
    }

    // Extract real Basmalah from surah 1 verse 1
    const fatihaV1 = verses.find(v =>
      v[FIELDS.surahField] === 1 && v[FIELDS.ayahField] === 1
    );
    if (fatihaV1 && FIELDS.textField) {
      BASMALAH_TEXT = fatihaV1[FIELDS.textField] || BASMALAH_TEXT;
    }

    quranData = pagesByNum;
    renderPage(currentPage);
  } catch (err) {
    document.getElementById('loadingState').innerHTML =
      '<div style="color:#DC2626;text-align:center;padding:20px;">' +
      '⚠️ تعذّر تحميل بيانات القرآن<br><small>' + err.message + '</small></div>';
  }
}

// ── Get juz number for a page ──────────────────────────────────────────────
function getJuz(page) {
  let juz = 1;
  for (let i = 0; i < JUZ_PAGES.length; i++) {
    if (page >= JUZ_PAGES[i]) juz = i + 1;
  }
  return juz;
}

// ── Get hizb for a page (rough) ───────────────────────────────────────────
function getHizb(page) {
  return Math.ceil(page / (604 / 60));
}

// ── Get surah name by number ───────────────────────────────────────────────
function getSurahName(num) {
  const s = SURAH_META.find(x => x[0] === num);
  return s ? s[1] : '';
}

// ── Get surah start page ───────────────────────────────────────────────────
function getSurahStartPage(num) {
  const s = SURAH_META.find(x => x[0] === num);
  return s ? s[2] : null;
}

// ── Get surah type ────────────────────────────────────────────────────────
function getSurahType(num) {
  const s = SURAH_META.find(x => x[0] === num);
  return s ? s[4] : '';
}

// ── Render a page ─────────────────────────────────────────────────────────
function renderPage(pageNum) {
  pageNum = Math.max(1, Math.min(604, pageNum));
  currentPage = pageNum;
  localStorage.setItem('quranPage', pageNum);

  document.getElementById('pageNum').textContent = pageNum;
  document.getElementById('btnPrev').disabled = pageNum <= 1;
  document.getElementById('btnNext').disabled = pageNum >= 604;

  const verses = quranData[pageNum];
  const container = document.getElementById('mushafPage');
  const loading   = document.getElementById('loadingState');

  loading.style.display = 'none';
  container.style.display = 'block';

  if (!verses || !verses.length) {
    container.innerHTML = '<div style="text-align:center;color:var(--mushaf-muted);padding:40px;">لا توجد بيانات لهذه الصفحة</div>';
    return;
  }

  const juz  = getJuz(pageNum);
  const hizb = getHizb(pageNum);

  // Get unique surahs on this page
  const surahsOnPage = [...new Set(verses.map(v => FIELDS.surahField ? v[FIELDS.surahField] : null).filter(Boolean))];

  // Header surah name (first surah on page)
  const firstSurah = surahsOnPage[0];
  const lastSurah  = surahsOnPage[surahsOnPage.length - 1];
  const headerName = firstSurah === lastSurah
    ? `سورة ${getSurahName(firstSurah)}`
    : `${getSurahName(firstSurah)} – ${getSurahName(lastSurah)}`;

  // Build page HTML
  let html = `
    <div class="mushaf-page">
      <div class="corner-bl"></div>
      <div class="corner-br"></div>
      <div class="mushaf-page-inner">

        <!-- Header -->
        <div class="mushaf-header">
          <span>الجزء ${juz}</span>
          <span class="hizb">۝</span>
          <span>${headerName}</span>
        </div>

        <div class="mushaf-lines">
  `;

  // Group verses by surah to detect surah starts
  let lastSurahNum = null;
  let lineBuffer   = '';
  let lineCount    = 0;

  for (const v of verses) {
    const surahNum  = FIELDS.surahField ? v[FIELDS.surahField] : null;
    const ayahNum   = FIELDS.ayahField  ? v[FIELDS.ayahField]  : null;
    const text      = FIELDS.textField  ? v[FIELDS.textField]  : '';

    // New surah starts on this page
    if (surahNum !== lastSurahNum) {
      // Flush buffer
      if (lineBuffer) {
        html += `<span class="mushaf-line">${lineBuffer}</span>`;
        lineBuffer = '';
        lineCount++;
      }

      const surahName = getSurahName(surahNum);
      const surahType = getSurahType(surahNum);
      const surahMeta = SURAH_META.find(x => x[0] === surahNum);
      const ayahCount = surahMeta ? surahMeta[3] : '';

      // Surah frame
      html += `
        <div class="surah-frame">
          <div class="surah-frame-inner">
            <div class="surah-name">سورة ${surahName}</div>
            <div class="surah-info-small">${surahType} · ${ayahCount} آية</div>
          </div>
        </div>
      `;

      // Basmalah (except Al-Fatiha page 1 and At-Tawbah)
      if (!NO_BASMALAH.includes(surahNum) && ayahNum === 1) {
        html += `<div class="basmalah">${BASMALAH_TEXT}</div>`;
      }

      lastSurahNum = surahNum;
    }

    // Build line text with ayah marker
    const marker = `<span class="ayah-marker">﴿${toArabicNum(ayahNum)}﴾</span>`;
    lineBuffer += text + ' ' + marker + ' ';
  }

  // Flush remaining buffer
  if (lineBuffer) {
    html += `<span class="mushaf-line">${lineBuffer}</span>`;
  }

  html += `
        </div><!-- .mushaf-lines -->

        <!-- Footer -->
        <div class="mushaf-footer">${pageNum}</div>
      </div><!-- .mushaf-page-inner -->
    </div><!-- .mushaf-page -->
  `;

  container.innerHTML = html;

  // Scroll to top
  document.getElementById('mushafScroll').scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Arabic numerals ───────────────────────────────────────────────────────
function toArabicNum(n) {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

// ── Navigation ────────────────────────────────────────────────────────────
function goPage(n) {
  if (n < 1 || n > 604) return;
  renderPage(n);
  // Close goto bar
  document.getElementById('gotoBar').classList.remove('show');
}

function toggleGoto() {
  const bar = document.getElementById('gotoBar');
  bar.classList.toggle('show');
  if (bar.classList.contains('show')) {
    document.getElementById('gotoInput').value = currentPage;
    document.getElementById('gotoInput').focus();
    document.getElementById('gotoInput').select();
  }
}

function doGoto() {
  const val = parseInt(document.getElementById('gotoInput').value);
  if (val >= 1 && val <= 604) {
    goPage(val);
  }
}

// ── Surah modal ───────────────────────────────────────────────────────────
function openSurahModal() {
  buildSurahList(SURAH_META);
  document.getElementById('surahModal').classList.add('show');
  document.getElementById('surahSearch').value = '';
  document.getElementById('surahSearch').focus();
}

function closeSurahModal() {
  document.getElementById('surahModal').classList.remove('show');
}

function buildSurahList(list) {
  const container = document.getElementById('surahList');
  container.innerHTML = list.map(s => `
    <div class="surah-modal-item" onclick="goSurah(${s[2]})">
      <div class="snum">${s[0]}</div>
      <div class="sname">سورة ${s[1]}</div>
      <div class="spage">ص ${s[2]}</div>
    </div>
  `).join('');
}

function filterSurahs(q) {
  const filtered = SURAH_META.filter(s =>
    s[1].includes(q) || String(s[0]).includes(q)
  );
  buildSurahList(filtered);
}

function goSurah(page) {
  closeSurahModal();
  goPage(page);
}

// ── Swipe gestures ────────────────────────────────────────────────────────
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
  // Only horizontal swipe (not scroll)
  if (Math.abs(dx) > 60 && dy < 80) {
    if (dx < 0) goPage(currentPage + 1); // swipe left = next
    else         goPage(currentPage - 1); // swipe right = prev
  }
}, { passive: true });

// ── Keyboard navigation ───────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  goPage(currentPage + 1);
  if (e.key === 'ArrowRight') goPage(currentPage - 1);
});

// ── Init ──────────────────────────────────────────────────────────────────
loadQuranData();