// js/reports.js

/**
 * Map a rating string to a numeric score.
 * Supports both Arabic and English rating values.
 */
function ratingToScore(rating) {
  if (!rating) return 0;
  const r = rating.trim();
  if (r === 'ممتاز'   || r === 'Excellent') return 4;
  if (r === 'جيد جدًا' || r === 'Very Good') return 3;
  if (r === 'جيد'     || r === 'Good')      return 2;
  if (r === 'ضعيف'    || r === 'Weak')      return 1;
  return 0;
}

/**
 * Convert an average score back to a rating label in the current language.
 */
function scoreToRating(avg) {
  const isAr = getLang() === 'ar';
  if (avg >= 3.5) return isAr ? 'ممتاز'   : 'Excellent';
  if (avg >= 2.5) return isAr ? 'جيد جدًا' : 'Very Good';
  if (avg >= 1.5) return isAr ? 'جيد'     : 'Good';
  return isAr ? 'ضعيف' : 'Weak';
}

/**
 * Get a day name from a date string (YYYY-MM-DD) in the current locale.
 */
function getDayName(dateStr) {
  const locale = getLang() === 'en' ? 'en-US' : 'ar-SA';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, { weekday: 'long' });
}

/**
 * Format a date string for display in the current locale.
 */
function fmtDate(dateStr) {
  const locale = getLang() === 'en' ? 'en-US' : 'ar-SA';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale);
}

// ====================================================
// Weekly Report
// ====================================================
function generateWeeklyReport(studentId, classId) {
  const data    = dbLoad();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return;

  const halaqah = classId ? data.halaqah.find(h => h.id === classId) : null;
  const className   = halaqah ? halaqah.name : '';
  const teacherName = halaqah ? (halaqah.teacher || '') : '';

  const today  = new Date();
  const from   = new Date();
  from.setDate(today.getDate() - 6);

  const locale = getLang() === 'en' ? 'en-US' : 'ar-SA';
  const fromStr = from.toLocaleDateString(locale);
  const toStr   = today.toLocaleDateString(locale);

  const records = data.records.filter(r =>
    r.studentId === studentId && new Date(r.date) >= from
  ).sort((a, b) => a.date.localeCompare(b.date));

  const isAr = getLang() === 'ar';
  let text = '';

  if (isAr) {
    // ---- Arabic version ----
    text += '🌿 تقرير الحفظ الأسبوعي 🌿\n\n';
    text += t('rptGreeting') + '\n\n';
    text += t('rptIntro') + '\n\n';
    text += '📖 الطالب: ' + student.name + '\n';
    text += '📅 الفترة: ' + fromStr + ' – ' + toStr + '\n\n';

    if (!records.length) {
      text += t('rptNoRecords') + '\n\n';
    } else {
      records.forEach(r => {
        const dayName = getDayName(r.date);
        text += '🗓 ' + dayName + ' – ' + fmtDate(r.date) + '\n\n';

        text += t('rptNewMemorization') + '\n';
        text += r.tahfidh.surahFrom + ' (' + r.tahfidh.ayahFrom + '–' + r.tahfidh.ayahTo + ')\n';
        text += t('errors') + ': ' + (r.tahfidh.errors || 0) + '\n';
        text += t('rating') + ': ' + (r.tahfidh.rating || '') + '\n\n';

        text += t('rptRevision') + '\n';
        text += t('rptFrom') + ' ' + r.murajaah.surahFrom + ' ' + t('rptTo') + ' ' + r.murajaah.surahTo + '\n';
        text += t('errors') + ': ' + (r.murajaah.errors || 0) + '\n\n';
      });

      const totalErrors = records.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
      const scores = records.map(r => ratingToScore(r.tahfidh.rating)).filter(s => s > 0);
      const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const weeklyRating = scoreToRating(avgScore);

      text += '📊 إجمالي أخطاء الحفظ: ' + totalErrors + '\n';
      text += t('rptWeeklyRating') + ' ' + weeklyRating + '\n\n';
    }

    text += t('rptClosing') + '\n\n';
    text += t('rptBarakallah') + '\n\n';
    if (className)   text += '— ' + className + '\n';
    if (teacherName) text += '— ' + teacherName + '\n';

  } else {
    // ---- English version ----
    text += '🌿 Weekly Tahfidh Report 🌿\n\n';
    text += t('rptGreeting') + '\n\n';
    text += t('rptIntro') + '\n\n';
    text += '📖 Student: ' + student.name + '\n';
    text += '📅 Period: ' + fromStr + ' – ' + toStr + '\n\n';

    if (!records.length) {
      text += t('rptNoRecords') + '\n\n';
    } else {
      records.forEach(r => {
        const dayName = getDayName(r.date);
        text += '🗓 ' + dayName + ' – ' + fmtDate(r.date) + '\n\n';

        text += t('rptNewMemorization') + '\n';
        text += r.tahfidh.surahFrom + ' (' + r.tahfidh.ayahFrom + '–' + r.tahfidh.ayahTo + ')\n';
        text += 'Errors: ' + (r.tahfidh.errors || 0) + '\n';
        text += 'Evaluation: ' + (r.tahfidh.rating || '') + '\n\n';

        text += t('rptRevision') + '\n';
        text += t('rptFrom') + ' ' + r.murajaah.surahFrom + ' ' + t('rptTo') + ' ' + r.murajaah.surahTo + '\n';
        text += 'Errors: ' + (r.murajaah.errors || 0) + '\n\n';
      });

      const totalErrors = records.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
      const scores = records.map(r => ratingToScore(r.tahfidh.rating)).filter(s => s > 0);
      const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const weeklyRating = scoreToRating(avgScore);

      text += '📊 Total Errors in New Memorization: ' + totalErrors + '\n';
      text += t('rptWeeklyRating') + ' ' + weeklyRating + '\n\n';
    }

    text += t('rptClosing') + '\n\n';
    text += t('rptBarakallah') + '\n\n';
    if (className)   text += '— ' + className + '\n';
    if (teacherName) text += '— ' + teacherName + '\n';
  }

  window.open('https://wa.me/?text=' + encodeURIComponent(text));
}

// ====================================================
// Monthly Report
// ====================================================
function generateMonthlyReport(studentId, classId) {
  const data    = dbLoad();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return;

  const halaqah = classId ? data.halaqah.find(h => h.id === classId) : null;
  const className   = halaqah ? halaqah.name : '';
  const teacherName = halaqah ? (halaqah.teacher || '') : '';

  const today = new Date();
  const from  = new Date(today.getFullYear(), today.getMonth(), 1);

  const locale = getLang() === 'en' ? 'en-US' : 'ar-SA';
  const monthName = from.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const records = data.records.filter(r =>
    r.studentId === studentId && new Date(r.date) >= from
  ).sort((a, b) => a.date.localeCompare(b.date));

  const isAr = getLang() === 'ar';
  let text = '';

  if (isAr) {
    // ---- Arabic version ----
    text += '🌿 تقرير الحفظ الشهري 🌿\n\n';
    text += t('rptGreeting') + '\n\n';
    text += 'يسرنا مشاركة التقرير الشهري للطالب:\n\n';
    text += '📖 الطالب: ' + student.name + '\n';
    text += '📅 الشهر: ' + monthName + '\n';
    text += '📆 أيام التسجيل: ' + records.length + '\n';
    text += '🔴 غياب: ' + (student.absences || 0) + ' | 🟡 تأخر: ' + (student.late || 0) + '\n\n';

    if (!records.length) {
      text += t('rptNoRecords') + '\n\n';
    } else {
      records.forEach(r => {
        const dayName = getDayName(r.date);
        text += '🗓 ' + dayName + ' – ' + fmtDate(r.date) + '\n\n';

        text += t('rptNewMemorization') + '\n';
        text += r.tahfidh.surahFrom + ' (' + r.tahfidh.ayahFrom + '–' + r.tahfidh.ayahTo + ')\n';
        text += t('errors') + ': ' + (r.tahfidh.errors || 0) + '\n';
        text += t('rating') + ': ' + (r.tahfidh.rating || '') + '\n\n';

        text += t('rptRevision') + '\n';
        text += t('rptFrom') + ' ' + r.murajaah.surahFrom + ' ' + t('rptTo') + ' ' + r.murajaah.surahTo + '\n';
        text += t('errors') + ': ' + (r.murajaah.errors || 0) + '\n\n';
      });

      const totalErrors = records.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
      const scores = records.map(r => ratingToScore(r.tahfidh.rating)).filter(s => s > 0);
      const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const monthlyRating = scoreToRating(avgScore);

      text += '📊 إجمالي أخطاء الحفظ: ' + totalErrors + '\n';
      text += '⭐ التقييم الشهري: ' + monthlyRating + '\n\n';
    }

    text += t('rptClosing') + '\n\n';
    text += t('rptBarakallah') + '\n\n';
    if (className)   text += '— ' + className + '\n';
    if (teacherName) text += '— ' + teacherName + '\n';

  } else {
    // ---- English version ----
    text += '🌿 Monthly Tahfidh Report 🌿\n\n';
    text += t('rptGreeting') + '\n\n';
    text += 'We are pleased to share the monthly progress report of the student:\n\n';
    text += '📖 Student: ' + student.name + '\n';
    text += '📅 Month: ' + monthName + '\n';
    text += '📆 Days recorded: ' + records.length + '\n';
    text += '🔴 Absences: ' + (student.absences || 0) + ' | 🟡 Late: ' + (student.late || 0) + '\n\n';

    if (!records.length) {
      text += t('rptNoRecords') + '\n\n';
    } else {
      records.forEach(r => {
        const dayName = getDayName(r.date);
        text += '🗓 ' + dayName + ' – ' + fmtDate(r.date) + '\n\n';

        text += t('rptNewMemorization') + '\n';
        text += r.tahfidh.surahFrom + ' (' + r.tahfidh.ayahFrom + '–' + r.tahfidh.ayahTo + ')\n';
        text += 'Errors: ' + (r.tahfidh.errors || 0) + '\n';
        text += 'Evaluation: ' + (r.tahfidh.rating || '') + '\n\n';

        text += t('rptRevision') + '\n';
        text += t('rptFrom') + ' ' + r.murajaah.surahFrom + ' ' + t('rptTo') + ' ' + r.murajaah.surahTo + '\n';
        text += 'Errors: ' + (r.murajaah.errors || 0) + '\n\n';
      });

      const totalErrors = records.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
      const scores = records.map(r => ratingToScore(r.tahfidh.rating)).filter(s => s > 0);
      const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const monthlyRating = scoreToRating(avgScore);

      text += '📊 Total Errors in New Memorization: ' + totalErrors + '\n';
      text += '⭐ Monthly Rating: ' + monthlyRating + '\n\n';
    }

    text += t('rptClosing') + '\n\n';
    text += t('rptBarakallah') + '\n\n';
    if (className)   text += '— ' + className + '\n';
    if (teacherName) text += '— ' + teacherName + '\n';
  }

  window.open('https://wa.me/?text=' + encodeURIComponent(text));
}
