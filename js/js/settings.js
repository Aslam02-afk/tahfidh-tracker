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
   - Sends to backend (NO token in app)
   ========================= */

// Use relative URL when served by the Express server, or set full URL for external hosting
const FEEDBACK_API_URL = "/api/send-rating";
const FEEDBACK_QUEUE_KEY = "tt_feedback_queue_v1";

var selectedStars = 0;

function setTextSafe(id, text) {
  const el = qs(id);
  if (el) el.textContent = text;
}

function openRateModal() {
  // Update text according to current language
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

async function sendFeedbackToBackend(payload) {
  const res = await fetch(FEEDBACK_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rating:    payload.rating,
      comment:   payload.comment || "",
      timestamp: payload.timestamp
    })
  });
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
  // These keys must exist in your translations
  setTextSafe("rateCardTitle", t("rateCardTitle"));
  setTextSafe("rateCardSubtitle", t("rateCardSubtitle"));
  setTextSafe("rateModalTitle", t("rateModalTitle"));

  const nameInput = qs("rateName");
  const msgInput = qs("rateMessage");
  if (nameInput) nameInput.placeholder = t("rateNamePh");
  if (msgInput) msgInput.placeholder = t("rateMsgPh");

  setTextSafe("rateCancelBtn", t("cancel"));
  setTextSafe("rateSubmitBtn", t("send"));
}

function syncThankYouText() {
  setTextSafe("thankYouTitle", t("thankTitle"));
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

  // Always show thank-you popup (even if queued)
  const submitBtn = qs("rateSubmitBtn");
  if (submitBtn) submitBtn.disabled = true;

  try {
    if (!navigator.onLine) {
      enqueueFeedback(payload);
      closeRateModal();
      openThankYouModal(selectedStars);
      resetRateForm();
      return;
    }

    await sendFeedbackToBackend(payload);
    closeRateModal();
    openThankYouModal(selectedStars);
    resetRateForm();
  } catch (e) {
    // Queue so it won't be lost
    enqueueFeedback(payload);
    closeRateModal();
    openThankYouModal(selectedStars);
    resetRateForm();
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    flushFeedbackQueue().catch(() => {});
  }
}

/* -------- wiring events -------- */
(function initRateUs() {
  // Sync UI labels once (and after language changes, you already call applyLang() in switchLang)
  syncRateUIText();
  flushFeedbackQueue().catch(() => {});

  // Card click
  qs("rateCard")?.addEventListener("click", openRateModal);

  // Close/cancel
  qs("rateCloseBtn")?.addEventListener("click", closeRateModal);
  qs("rateCancelBtn")?.addEventListener("click", closeRateModal);

  // Stars
  document.querySelectorAll("#starContainer .tt-star").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedStars = Number(btn.dataset.value);
      updateStarsUI();
    });
  });

  // Submit
  qs("rateSubmitBtn")?.addEventListener("click", submitRating);

  // Thank you close
  qs("thankYouCloseBtn")?.addEventListener("click", closeThankYouModal);

  // Optional: click outside to close thank-you
  qs("thankYouModal")?.addEventListener("click", (e) => {
    if (e.target === qs("thankYouModal")) closeThankYouModal();
  });
})();
