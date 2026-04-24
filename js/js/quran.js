// js/quran.js — Mushaf Madani Digital (Page-based)

// ── Surah metadata: [num, name, startPage, ayahCount, type] ──────────────
const SURAH_META = [
  [1,  "الفاتحة",     1,   7,   "مكية"],  [2,  "البقرة",      2,   286, "مدنية"],
  [3,  "آل عمران",   50,  200, "مدنية"],  [4,  "النساء",      77,  176, "مدنية"],
  [5,  "المائدة",     106, 120, "مدنية"],  [6,  "الأنعام",     128, 165, "مكية"],
  [7,  "الأعراف",     151, 206, "مكية"],   [8,  "الأنفال",     177, 75,  "مدنية"],
  [9,  "التوبة",      187, 129, "مدنية"],  [10, "يونس",        208, 109, "مكية"],
  [11, "هود",         221, 123, "مكية"],   [12, "يوسف",        235, 111, "مكية"],
  [13, "الرعد",       249, 43,  "مدنية"],  [14, "إبراهيم",     255, 52,  "مكية"],
  [15, "الحجر",       262, 99,  "مكية"],   [16, "النحل",       267, 128, "مكية"],
  [17, "الإسراء",     282, 111, "مكية"],   [18, "الكهف",       293, 110, "مكية"],
  [19, "مريم",        305, 98,  "مكية"],   [20, "طه",          312, 135, "مكية"],
  [21, "الأنبياء",    322, 112, "مكية"],   [22, "الحج",        333, 78,  "مدنية"],
  [23, "المؤمنون",    342, 118, "مكية"],   [24, "النور",       350, 64,  "مدنية"],
  [25, "الفرقان",     359, 77,  "مكية"],   [26, "الشعراء",     367, 227, "مكية"],
  [27, "النمل",       377, 93,  "مكية"],   [28, "القصص",       385, 88,  "مكية"],
  [29, "العنكبوت",    396, 69,  "مكية"],   [30, "الروم",       404, 60,  "مكية"],
  [31, "لقمان",       411, 34,  "مكية"],   [32, "السجدة",      415, 30,  "مكية"],
  [33, "الأحزاب",     418, 73,  "مدنية"],  [34, "سبأ",         428, 54,  "مكية"],
  [35, "فاطر",        434, 45,  "مكية"],   [36, "يس",          440, 83,  "مكية"],
  [37, "الصافات",     446, 182, "مكية"],   [38, "ص",           453, 88,  "مكية"],
  [39, "الزمر",       458, 75,  "مكية"],   [40, "غافر",        467, 85,  "مكية"],
  [41, "فصلت",        477, 54,  "مكية"],   [42, "الشورى",      483, 53,  "مكية"],
  [43, "الزخرف",      489, 89,  "مكية"],   [44, "الدخان",      496, 59,  "مكية"],
  [45, "الجاثية",     499, 37,  "مكية"],   [46, "الأحقاف",     502, 35,  "مكية"],
  [47, "محمد",        507, 38,  "مدنية"],  [48, "الفتح",       511, 29,  "مدنية"],
  [49, "الحجرات",     515, 18,  "مدنية"],  [50, "ق",           518, 45,  "مكية"],
  [51, "الذاريات",    520, 60,  "مكية"],   [52, "الطور",       523, 49,  "مكية"],
  [53, "النجم",       526, 62,  "مكية"],   [54, "القمر",       528, 55,  "مكية"],
  [55, "الرحمن",      531, 78,  "مدنية"],  [56, "الواقعة",     534, 96,  "مكية"],
  [57, "الحديد",      537, 29,  "مدنية"],  [58, "المجادلة",    542, 22,  "مدنية"],
  [59, "الحشر",       545, 24,  "مدنية"],  [60, "الممتحنة",    549, 13,  "مدنية"],
  [61, "الصف",        551, 14,  "مدنية"],  [62, "الجمعة",      553, 11,  "مدنية"],
  [63, "المنافقون",   554, 11,  "مدنية"],  [64, "التغابن",     556, 18,  "مدنية"],
  [65, "الطلاق",      558, 12,  "مدنية"],  [66, "التحريم",     560, 12,  "مدنية"],
  [67, "الملك",       562, 30,  "مكية"],   [68, "القلم",       564, 52,  "مكية"],
  [69, "الحاقة",      566, 52,  "مكية"],   [70, "المعارج",     568, 44,  "مكية"],
  [71, "نوح",         570, 28,  "مكية"],   [72, "الجن",        572, 28,  "مكية"],
  [73, "المزمل",      574, 20,  "مكية"],   [74, "المدثر",      575, 56,  "مكية"],
  [75, "القيامة",     577, 40,  "مكية"],   [76, "الإنسان",     578, 31,  "مدنية"],
  [77, "المرسلات",    580, 50,  "مكية"],   [78, "النبأ",       582, 40,  "مكية"],
  [79, "النازعات",    583, 46,  "مكية"],   [80, "عبس",         585, 42,  "مكية"],
  [81, "التكوير",     586, 29,  "مكية"],   [82, "الانفطار",    587, 19,  "مكية"],
  [83, "المطففين",    587, 36,  "مكية"],   [84, "الانشقاق",    589, 25,  "مكية"],
  [85, "البروج",      590, 22,  "مكية"],   [86, "الطارق",      591, 17,  "مكية"],
  [87, "الأعلى",      591, 19,  "مكية"],   [88, "الغاشية",     592, 26,  "مكية"],
  [89, "الفجر",       593, 30,  "مكية"],   [90, "البلد",       594, 20,  "مكية"],
  [91, "الشمس",       595, 15,  "مكية"],   [92, "الليل",       595, 21,  "مكية"],
  [93, "الضحى",       596, 11,  "مكية"],   [94, "الشرح",       596, 8,   "مكية"],
  [95, "التين",       597, 8,   "مكية"],   [96, "العلق",       597, 19,  "مكية"],
  [97, "القدر",       598, 5,   "مكية"],   [98, "البينة",      598, 8,   "مدنية"],
  [99, "الزلزلة",     599, 8,   "مدنية"],  [100,"العاديات",    599, 11,  "مكية"],
  [101,"القارعة",     600, 11,  "مكية"],   [102,"التكاثر",     600, 8,   "مكية"],
  [103,"العصر",       601, 3,   "مكية"],   [104,"الهمزة",      601, 9,   "مكية"],
  [105,"الفيل",       601, 5,   "مكية"],   [106,"قريش",        602, 4,   "مكية"],
  [107,"الماعون",     602, 7,   "مكية"],   [108,"الكوثر",      602, 3,   "مكية"],
  [109,"الكافرون",    603, 6,   "مكية"],   [110,"النصر",       603, 3,   "مدنية"],
  [111,"المسد",       603, 5,   "مكية"],   [112,"الإخلاص",     604, 4,   "مكية"],
  [113,"الفلق",       604, 5,   "مكية"],   [114,"الناس",       604, 6,   "مكية"],
];

const JUZ_PAGES = [1,22,42,62,82,102,121,142,162,182,201,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582];

const JUZ_META = [
  [1,'الجزء الأول',1],[2,'الجزء الثاني',22],[3,'الجزء الثالث',42],[4,'الجزء الرابع',62],
  [5,'الجزء الخامس',82],[6,'الجزء السادس',102],[7,'الجزء السابع',121],[8,'الجزء الثامن',142],
  [9,'الجزء التاسع',162],[10,'الجزء العاشر',182],[11,'الجزء الحادي عشر',201],[12,'الجزء الثاني عشر',222],
  [13,'الجزء الثالث عشر',242],[14,'الجزء الرابع عشر',262],[15,'الجزء الخامس عشر',282],[16,'الجزء السادس عشر',302],
  [17,'الجزء السابع عشر',322],[18,'الجزء الثامن عشر',342],[19,'الجزء التاسع عشر',362],[20,'الجزء العشرون',382],
  [21,'الجزء الحادي والعشرون',402],[22,'الجزء الثاني والعشرون',422],[23,'الجزء الثالث والعشرون',442],
  [24,'الجزء الرابع والعشرون',462],[25,'الجزء الخامس والعشرون',482],[26,'الجزء السادس والعشرون',502],
  [27,'الجزء السابع والعشرون',522],[28,'الجزء الثامن والعشرون',542],[29,'الجزء التاسع والعشرون',562],
  [30,'الجزء الثلاثون',582],
];

const NO_BASMALAH = [1, 9];

// ── State ─────────────────────────────────────────────────────────────────
let currentPage = parseInt(localStorage.getItem('quranPage') || '1');
let quranData   = null;
let _animating  = false;

// ── Helpers ───────────────────────────────────────────────────────────────
function getJuz(page) {
  let juz = 1;
  for (let i = 0; i < JUZ_PAGES.length; i++) {
    if (page >= JUZ_PAGES[i]) juz = i + 1;
  }
  return juz;
}

function getSurahName(num) {
  const s = SURAH_META.find(x => x[0] === num);
  return s ? s[1] : '';
}

function getSurahType(num) {
  const s = SURAH_META.find(x => x[0] === num);
  return s ? s[4] : '';
}

function stripAyahMarker(text) { return text; } // keep font markers intact

// ── Load data ─────────────────────────────────────────────────────────────
async function loadQuranData() {
  try {
    const res    = await fetch('kfgqpc_hafs_smart_data/hafs_smart_v8.json');
    const json   = await res.json();
    const verses = Array.isArray(json) ? json : (json.verses || json.data || Object.values(json));
    const byPage = {};
    for (const v of verses) {
      const pg = v.page || v.page_number || v.p;
      if (!pg) continue;
      if (!byPage[pg]) byPage[pg] = [];
      byPage[pg].push(v);
    }
    quranData = byPage;
    renderPage(currentPage);
  } catch (err) {
    document.getElementById('loadingState').innerHTML =
      '<div style="color:#DC2626;text-align:center;padding:20px;">⚠️ تعذّر تحميل بيانات القرآن<br><small>' + err.message + '</small></div>';
  }
}

// ── Build page HTML ───────────────────────────────────────────────────────
function buildPageHTML(pageNum) {
  const verses = quranData[pageNum];
  if (!verses || !verses.length) {
    return '<div style="text-align:center;color:var(--mushaf-muted);padding:40px;">لا توجد بيانات لهذه الصفحة</div>';
  }
  const juz          = getJuz(pageNum);
  const surahsOnPage = [...new Set(verses.map(v => v.sura_no || v.surah_number || v.s))];
  const firstSurah   = surahsOnPage[0];
  const lastSurah    = surahsOnPage[surahsOnPage.length - 1];
  const headerName   = firstSurah === lastSurah
    ? 'سورة ' + getSurahName(firstSurah)
    : getSurahName(firstSurah) + ' – ' + getSurahName(lastSurah);

  let html = '<div class="mushaf-page"><div class="corner-bl"></div><div class="corner-br"></div><div class="mushaf-page-inner">'
    + '<div class="mushaf-header"><span>الجزء ' + juz + '</span><span class="hizb">۝</span><span>' + headerName + '</span></div>'
    + '<div class="mushaf-lines">';

  let lastSurahNum = null;
  let lineBuffer   = '';

  for (const v of verses) {
    const surahNum = v.sura_no || v.surah_number || v.s;
    const ayahNum  = v.aya_no  || v.verse_number  || v.v || v.ayah;
    const rawText  = v.aya_text || v.text_uthmani  || v.text || v.t || '';
    const text     = stripAyahMarker(rawText);

    if (surahNum !== lastSurahNum) {
      if (lineBuffer) { html += '<span class="mushaf-line">' + lineBuffer + '</span>'; lineBuffer = ''; }
      const surahMeta = SURAH_META.find(x => x[0] === surahNum);
      html += '<div class="surah-frame"><div class="surah-frame-inner">'
        + '<div class="surah-name">سورة ' + getSurahName(surahNum) + '</div>'
        + '<div class="surah-info-small">' + getSurahType(surahNum) + ' · ' + (surahMeta ? surahMeta[3] : '') + ' آية</div>'
        + '</div></div>';
      if (!NO_BASMALAH.includes(surahNum) && ayahNum === 1) {
        html += '<div class="basmalah">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>';
      }
      lastSurahNum = surahNum;
    }
    lineBuffer += text + ' ';
  }
  if (lineBuffer) { html += '<span class="mushaf-line">' + lineBuffer + '</span>'; }
  html += '</div><div class="mushaf-footer">' + pageNum + '</div></div></div>';
  return html;
}

// ── Render with slide animation ───────────────────────────────────────────
function renderPage(pageNum, direction) {
  pageNum = Math.max(1, Math.min(604, pageNum));
  currentPage = pageNum;
  localStorage.setItem('quranPage', pageNum);

  document.getElementById('pageNum').textContent       = pageNum;
  document.getElementById('btnPrev').disabled          = pageNum <= 1;
  document.getElementById('btnNext').disabled          = pageNum >= 604;
  document.getElementById('loadingState').style.display = 'none';
  _updateSelectorLabels(pageNum);

  const scroll    = document.getElementById('mushafScroll');
  const container = document.getElementById('mushafPage');
  container.style.display = 'block';
  const newHTML = buildPageHTML(pageNum);

  if (!direction || !container.innerHTML.trim()) {
    container.innerHTML = newHTML;
    scroll.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }
  if (_animating) return;
  _animating = true;

  const outX = direction === 1 ? '-100%' : '100%';
  const inX  = direction === 1 ?  '100%' : '-100%';

  const next = document.createElement('div');
  next.style.cssText = 'position:absolute;inset:0;padding:12px;padding-bottom:5rem;overflow-y:auto;'
    + 'transform:translateX(' + inX + ');transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);'
    + 'will-change:transform;background:var(--mushaf-bg);';
  next.innerHTML = newHTML;

  scroll.style.position = 'relative';
  scroll.style.overflow = 'hidden';
  scroll.appendChild(next);

  container.style.position      = 'absolute';
  container.style.inset         = '0';
  container.style.padding       = '12px';
  container.style.paddingBottom = '5rem';
  container.style.overflowY     = 'auto';
  container.style.transition    = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
  container.style.willChange    = 'transform';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.transform = 'translateX(' + outX + ')';
      next.style.transform      = 'translateX(0)';
      next.addEventListener('transitionend', () => {
        container.innerHTML = newHTML;
        container.removeAttribute('style');
        scroll.style.position = '';
        scroll.style.overflow = '';
        next.remove();
        scroll.scrollTo({ top: 0, behavior: 'instant' });
        _animating = false;
      }, { once: true });
    });
  });
}

function _updateSelectorLabels(pageNum) {
  const juzNum = getJuz(pageNum);
  let cur = SURAH_META[0];
  for (const s of SURAH_META) { if (s[2] <= pageNum) cur = s; else break; }
  const sl = document.getElementById('currentSurahLabel');
  const jl = document.getElementById('currentJuzLabel');
  if (sl) sl.textContent = cur[1];
  if (jl) jl.textContent = 'الجزء ' + juzNum;
}

// ── Navigation ────────────────────────────────────────────────────────────
function goPage(n, direction) {
  if (n < 1 || n > 604 || _animating) return;
  const dir = direction !== undefined ? direction : (n > currentPage ? 1 : -1);
  renderPage(n, dir);
  document.getElementById('gotoBar').classList.remove('show');
}

function toggleGoto() {
  const bar = document.getElementById('gotoBar');
  bar.classList.toggle('show');
  if (bar.classList.contains('show')) {
    const inp = document.getElementById('gotoInput');
    inp.value = currentPage; inp.focus(); inp.select();
  }
}

function doGoto() {
  const val = parseInt(document.getElementById('gotoInput').value);
  if (val >= 1 && val <= 604) goPage(val);
}

// ── Surah modal ───────────────────────────────────────────────────────────
function openSurahModal() {
  buildSurahList(SURAH_META);
  document.getElementById('surahModal').classList.add('show');
  document.getElementById('surahSearch').value = '';
  document.getElementById('surahSearch').focus();
}
function closeSurahModal() { document.getElementById('surahModal').classList.remove('show'); }
function buildSurahList(list) {
  document.getElementById('surahList').innerHTML = list.map(s =>
    '<div class="surah-modal-item" onclick="goSurah(' + s[2] + ')">'
    + '<div class="snum">' + s[0] + '</div>'
    + '<div class="sname">سورة ' + s[1] + '</div>'
    + '<div class="spage">ص ' + s[2] + '</div></div>'
  ).join('');
}
function filterSurahs(q) { buildSurahList(SURAH_META.filter(s => s[1].includes(q) || String(s[0]).includes(q))); }
function goSurah(page) { closeSurahModal(); goPage(page); }

// ── Juz modal ─────────────────────────────────────────────────────────────
function openJuzModal() {
  buildJuzList(JUZ_META);
  document.getElementById('juzModal').classList.add('show');
  document.getElementById('juzSearch').value = '';
  document.getElementById('juzSearch').focus();
}
function closeJuzModal() { document.getElementById('juzModal').classList.remove('show'); }
function buildJuzList(list) {
  document.getElementById('juzList').innerHTML = list.map(j =>
    '<div class="surah-modal-item" onclick="goJuz(' + j[2] + ')">'
    + '<div class="snum">' + j[0] + '</div>'
    + '<div class="sname">' + j[1] + '</div>'
    + '<div class="spage">ص ' + j[2] + '</div></div>'
  ).join('');
}
function filterJuz(q) { buildJuzList(JUZ_META.filter(j => j[1].includes(q) || String(j[0]).includes(q))); }
function goJuz(page) { closeJuzModal(); goPage(page); }

// ── Swipe ─────────────────────────────────────────────────────────────────
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
  if (Math.abs(dx) > 50 && dy < 80) {
    if (dx < 0) goPage(currentPage + 1,  1);
    else         goPage(currentPage - 1, -1);
  }
}, { passive: true });

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  goPage(currentPage + 1,  1);
  if (e.key === 'ArrowRight') goPage(currentPage - 1, -1);
});

// ── Init ──────────────────────────────────────────────────────────────────
loadQuranData();