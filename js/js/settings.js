// js/settings.js

function updateDarkBtn() {
  const isDark = document.documentElement.classList.contains('dark');
  const btn = qs('darkModeBtn');
  if (btn) btn.textContent = isDark ? t('disable') : t('enable');
  updateDarkIcon();
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

async function shareApp() {
  const url  = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  const data = {
    title: 'Tahfidh Tracker | تتبع التحفيظ',
    text:  'تطبيق إدارة حلقات التحفيظ – Tahfidh Tracker',
    url
  };
  if (navigator.share) {
    try { await navigator.share(data); } catch (_) { /* user cancelled */ }
  } else {
    navigator.clipboard.writeText(url).then(() => alert(t('shareCopied')));
  }
}

function sendContactMessage() {
  const name = qs('contactTeacherName').value || t('notMentioned');
  const subject = qs('contactSubject').value;
  const message = qs('contactMessage').value;

  if (!message.trim()) {
    alert(t('pleaseWriteMessage'));
    return;
  }

  const email = "markazalhudaa143@gmail.com";
  const mailSubject = encodeURIComponent("Tahfidh Tracker – " + subject);
  const body = encodeURIComponent(
    t('teacherNameEmail') + ": " + name + "\n\n" +
    t('messageEmail') + ":\n" + message + "\n\n" +
    "— " + t('sentFromApp')
  );

  window.location.href = "mailto:" + email + "?subject=" + mailSubject + "&body=" + body;
}

/* =========================
   Rate Us (Tahfidh Tracker)
   - Uses current app language via getLang() + t()
   - Offline queue
   - Sends directly to Telegram (token from server env)
   ========================= */

const FEEDBACK_QUEUE_KEY = "tt_feedback_queue_v1";

var selectedStars = 0;

// Cache config so we don't fetch every time
var _telegramConfig = null;

async function getTelegramConfig() {
  if (_telegramConfig) return _telegramConfig;
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('config_failed');
    _telegramConfig = await res.json();
    return _telegramConfig;
  } catch {
    return null;
  }
}

function setTextSafe(id, text) {
  const el = qs(id);
  if (el) el.textContent = text;
}

function openRateModal() {
  syncRateUIText();
  qs('rateModal')?.classList.add('show');
}

function closeRateModal() {
  qs('rateModal')?.classList.remove('show');
}

function openThankYouModal(stars) {
  syncThankYouText();
  const starsEl = qs('thankYouStars');
  if (starsEl) starsEl.textContent = '⭐'.repeat(Math.min(5, Math.max(1, stars || 5)));
  qs('thankYouModal')?.classList.add('show');
}

function closeThankYouModal() {
  qs('thankYouModal')?.classList.remove('show');
}

function resetRateForm() {
  selectedStars = 0;
  updateStarsUI();
  if (qs('rateName')) qs('rateName').value = "";
  if (qs('rateMessage')) qs('rateMessage').value = "";
}

function updateStarsUI() {
  document.querySelectorAll("#starContainer .tt-star").forEach(btn => {
    const v = Number(btn.dataset.value);
    const active = v <= selectedStars;
    btn.classList.toggle("active", active);
    btn.textContent = active ? "★" : "☆";
  });
}

/* -------- Offline queue helpers -------- */
function loadFeedbackQueue() {
  try {
    const raw = localStorage.getItem(FEEDBACK_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveFeedbackQueue(items) {
  localStorage.setItem(FEEDBACK_QUEUE_KEY, JSON.stringify(items));
}
function enqueueFeedback(item) {
  const q = loadFeedbackQueue();
  q.push(item);
  saveFeedbackQueue(q);
}

/* -------- Send directly to Telegram -------- */
async function sendFeedbackToBackend(payload) {
  // Get bot credentials from server (keeps token safe in env variables)
  const config = await getTelegramConfig();
  if (!config || !config.botToken || !config.userId) {
    throw new Error("config_unavailable");
  }

  const stars    = "⭐".repeat(payload.rating);
  const feedback = payload.comment?.trim() || "No comment";
  const time     = payload.timestamp || new Date().toISOString();

  const text = [
    "━━━━━━━━━━━━━━━━━━",
    "⭐ Tahfidh Tracker – New Rating",
    "━━━━━━━━━━━━━━━━━━",
    "",
    `📊 Rating: ${payload.rating} / 5  ${stars}`,
    `💬 Feedback:\n${feedback}`,
    "",
    `🕒 Time: ${time}`,
    "",
    "━━━━━━━━━━━━━━━━━━"
  ].join("\n");

  const res = await fetch(
    `https://api.telegram.org/bot${config.botToken}/sendMessage`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ chat_id: config.userId, text })
    }
  );

  if (!res.ok) throw new Error("feedback_failed");
}

async function flushFeedbackQueue() {
  if (!navigator.onLine) return;
  const q = loadFeedbackQueue();
  if (!q.length) return;

  const remaining = [];
  for (const item of q) {
    try {
      await sendFeedbackToBackend(item);
    } catch {
      remaining.push(item);
    }
  }
  saveFeedbackQueue(remaining);
}

window.addEventListener("online", () => {
  flushFeedbackQueue().catch(() => {});
});

/* -------- i18n text sync -------- */
function syncRateUIText() {
  setTextSafe("rateCardTitle",    t("rateCardTitle"));
  setTextSafe("rateCardSubtitle", t("rateCardSubtitle"));
  setTextSafe("rateModalTitle",   t("rateModalTitle"));

  const nameInput = qs("rateName");
  const msgInput  = qs("rateMessage");
  if (nameInput) nameInput.placeholder = t("rateNamePh");
  if (msgInput)  msgInput.placeholder  = t("rateMsgPh");

  setTextSafe("rateCancelBtn", t("cancel"));
  setTextSafe("rateSubmitBtn", t("send"));
}

function syncThankYouText() {
  setTextSafe("thankYouTitle",   t("thankTitle"));
  setTextSafe("thankYouMessage", t("thankMsg"));
  setTextSafe("thankYouCloseBtn", t("ok"));
}

/* -------- submit -------- */
async function submitRating() {
  if (!selectedStars) {
    alert(t("selectRating"));
    return;
  }

  const name    = qs("rateName")?.value?.trim()    || "";
  const message = qs("rateMessage")?.value?.trim() || "";
  const comment = [name, message].filter(Boolean).join("\n") || "";

  const payload = {
    rating:    selectedStars,
    comment:   comment,
    timestamp: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Riyadh', hour12: false }),
    createdAt: new Date().toISOString()
  };

  // Show thank-you immediately, send in background
  enqueueFeedback(payload);
  closeRateModal();
  openThankYouModal(selectedStars);
  resetRateForm();
  flushFeedbackQueue().catch(() => {});
}

/* -------- wiring events -------- */
(function initRateUs() {
  syncRateUIText();
  flushFeedbackQueue().catch(() => {});

  // Prefetch config early so it's ready when teacher submits
  getTelegramConfig().catch(() => {});

  qs("rateCard")?.addEventListener("click", openRateModal);
  qs("rateCloseBtn")?.addEventListener("click", closeRateModal);
  qs("rateCancelBtn")?.addEventListener("click", closeRateModal);

  document.querySelectorAll("#starContainer .tt-star").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedStars = Number(btn.dataset.value);
      updateStarsUI();
    });
  });

  qs("rateSubmitBtn")?.addEventListener("click", submitRating);
  qs("thankYouCloseBtn")?.addEventListener("click", closeThankYouModal);

  qs("thankYouModal")?.addEventListener("click", (e) => {
    if (e.target === qs("thankYouModal")) closeThankYouModal();
  });
})();