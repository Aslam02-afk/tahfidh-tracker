// js/reports.js

/**
 * Map a rating string to a numeric score.
 * Supports both Arabic and English rating values.
 */
function ratingToScore(rating) {
  if (!rating) return 0;
  const r = rating.trim();
  if (r === 'ممتاز'          || r === 'Excellent')         return 4;
  if (r === 'جيد جدًا'       || r === 'Very Good')         return 3;
  if (r === 'جيد'             || r === 'Good')              return 2;
  if (r === 'مقبول'           || r === 'Acceptable')        return 1.5;
  if (r === 'يحتاج تحسين'    || r === 'Needs Improvement') return 1;
  if (r === 'ضعيف'            || r === 'Weak')              return 1;
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

/**
 * Helper: render a single record's day block (tahfidh + murajaah).
 * Skips tahfidh if the student is murajaah-only or if noHifdh is set for the day.
 */
function renderRecordBlock(r, skipTahfidh, isAr) {
  const dayName = getDayName(r.date);
  let block = '' + dayName + ' – ' + fmtDate(r.date) + '\n\n';

  if (!skipTahfidh && !r.noHifdh) {
    block += (isAr ? t('rptNewMemorization') : t('rptNewMemorization')) + '\n';
    block += r.tahfidh.surahFrom + ' (' + r.tahfidh.ayahFrom + '–' + r.tahfidh.ayahTo + ')\n';
    block += (isAr ? t('errors') : 'Errors') + ': ' + (r.tahfidh.errors || 0) + '\n';
    block += (isAr ? t('rating') : 'Evaluation') + ': ' + (r.tahfidh.rating || '') + '\n\n';
  }

  block += (isAr ? t('rptRevision') : t('rptRevision')) + '\n';
  block += t('rptFrom') + ' ' + r.murajaah.surahFrom + ' ' + t('rptTo') + ' ' + r.murajaah.surahTo + '\n';
  block += (isAr ? t('errors') : 'Errors') + ': ' + (r.murajaah.errors || 0) + '\n\n';

  return block;
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
  const skipTahfidh = student.course === 'murajaah';

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
    text += 'تقرير الحفظ الأسبوعي\n\n';
    text += t('rptGreeting') + '\n\n';
    text += t('rptIntro') + '\n\n';
    text += 'الطالب: ' + student.name + '\n';
    text += 'الفترة: ' + fromStr + ' – ' + toStr + '\n\n';

    if (!records.length) {
      text += t('rptNoRecords') + '\n\n';
    } else {
      records.forEach(r => { text += renderRecordBlock(r, skipTahfidh, true); });

      if (!skipTahfidh) {
        const hifdhRecords = records.filter(r => !r.noHifdh);
        const totalErrors = hifdhRecords.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
        const scores = hifdhRecords.map(r => ratingToScore(r.tahfidh.rating)).filter(s => s > 0);
        const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const weeklyRating = scoreToRating(avgScore);

        text += 'إجمالي أخطاء الحفظ: ' + totalErrors + '\n';
        text += t('rptWeeklyRating') + ' ' + weeklyRating + '\n\n';
      }
    }

    text += t('rptClosing') + '\n\n';
    text += t('rptBarakallah') + '\n\n';
    if (className)   text += '— ' + className + '\n';
    if (teacherName) text += '— ' + teacherName + '\n';

  } else {
    text += 'Weekly Tahfidh Report\n\n';
    text += t('rptGreeting') + '\n\n';
    text += t('rptIntro') + '\n\n';
    text += 'Student: ' + student.name + '\n';
    text += 'Period: ' + fromStr + ' – ' + toStr + '\n\n';

    if (!records.length) {
      text += t('rptNoRecords') + '\n\n';
    } else {
      records.forEach(r => { text += renderRecordBlock(r, skipTahfidh, false); });

      if (!skipTahfidh) {
        const hifdhRecords = records.filter(r => !r.noHifdh);
        const totalErrors = hifdhRecords.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
        const scores = hifdhRecords.map(r => ratingToScore(r.tahfidh.rating)).filter(s => s > 0);
        const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const weeklyRating = scoreToRating(avgScore);

        text += 'Total Errors in New Memorization: ' + totalErrors + '\n';
        text += t('rptWeeklyRating') + ' ' + weeklyRating + '\n\n';
      }
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
  const skipTahfidh = student.course === 'murajaah';

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
    text += 'تقرير الحفظ الشهري\n\n';
    text += t('rptGreeting') + '\n\n';
    text += 'يسرنا مشاركة التقرير الشهري للطالب:\n\n';
    text += 'الطالب: ' + student.name + '\n';
    text += 'الشهر: ' + monthName + '\n';
    text += 'أيام التسجيل: ' + records.length + '\n';
    text += 'غياب: ' + (student.absences || 0) + ' | تأخر: ' + (student.late || 0) + '\n\n';

    if (!records.length) {
      text += t('rptNoRecords') + '\n\n';
    } else {
      records.forEach(r => { text += renderRecordBlock(r, skipTahfidh, true); });

      if (!skipTahfidh) {
        const hifdhRecords = records.filter(r => !r.noHifdh);
        const totalErrors = hifdhRecords.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
        const scores = hifdhRecords.map(r => ratingToScore(r.tahfidh.rating)).filter(s => s > 0);
        const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const monthlyRating = scoreToRating(avgScore);

        text += 'إجمالي أخطاء الحفظ: ' + totalErrors + '\n';
        text += 'التقييم الشهري: ' + monthlyRating + '\n\n';
      }
    }

    text += t('rptClosing') + '\n\n';
    text += t('rptBarakallah') + '\n\n';
    if (className)   text += '— ' + className + '\n';
    if (teacherName) text += '— ' + teacherName + '\n';

  } else {
    text += 'Monthly Tahfidh Report\n\n';
    text += t('rptGreeting') + '\n\n';
    text += 'We are pleased to share the monthly progress report of the student:\n\n';
    text += 'Student: ' + student.name + '\n';
    text += 'Month: ' + monthName + '\n';
    text += 'Days recorded: ' + records.length + '\n';
    text += 'Absences: ' + (student.absences || 0) + ' | Late: ' + (student.late || 0) + '\n\n';

    if (!records.length) {
      text += t('rptNoRecords') + '\n\n';
    } else {
      records.forEach(r => { text += renderRecordBlock(r, skipTahfidh, false); });

      if (!skipTahfidh) {
        const hifdhRecords = records.filter(r => !r.noHifdh);
        const totalErrors = hifdhRecords.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
        const scores = hifdhRecords.map(r => ratingToScore(r.tahfidh.rating)).filter(s => s > 0);
        const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const monthlyRating = scoreToRating(avgScore);

        text += 'Total Errors in New Memorization: ' + totalErrors + '\n';
        text += 'Monthly Rating: ' + monthlyRating + '\n\n';
      }
    }

    text += t('rptClosing') + '\n\n';
    text += t('rptBarakallah') + '\n\n';
    if (className)   text += '— ' + className + '\n';
    if (teacherName) text += '— ' + teacherName + '\n';
  }

  window.open('https://wa.me/?text=' + encodeURIComponent(text));
}

// ====================================================
// Report Format Modal
// ====================================================
var _rptType      = '';
var _rptStudentId = '';
var _rptClassId   = '';

function showReportFormatModal(type, studentId, classId) {
  _rptType      = type;
  _rptStudentId = studentId;
  _rptClassId   = classId;
  const modal = document.getElementById('reportFmtModal');
  if (modal) modal.classList.add('show');
}

function closeReportFmtModal() {
  const modal = document.getElementById('reportFmtModal');
  if (modal) modal.classList.remove('show');
}

function submitReportFormat(format) {
  closeReportFmtModal();
  if (format === 'msg') {
    if (_rptType === 'weekly') generateWeeklyReport(_rptStudentId, _rptClassId);
    else                        generateMonthlyReport(_rptStudentId, _rptClassId);
  } else {
    generateReportDocument(_rptType, _rptStudentId, _rptClassId, format);
  }
}

// ====================================================
// PDF / Image Report Generator
// ====================================================
function generateReportDocument(type, studentId, classId, format) {
  const data    = dbLoad();
  const student = data.students.find(function(s) { return s.id === studentId; });
  if (!student) return;

  const halaqah     = classId ? data.halaqah.find(function(h) { return h.id === classId; }) : null;
  const skipTahfidh = student.course === 'murajaah';
  const isAr        = getLang() === 'ar';
  const locale      = isAr ? 'ar-SA' : 'en-US';
  const today       = new Date();
  var from, records, title, periodLabel;

  if (type === 'weekly') {
    from = new Date();
    from.setDate(today.getDate() - 6);
    records = data.records.filter(function(r) {
      return r.studentId === studentId && new Date(r.date) >= from;
    }).sort(function(a, b) { return a.date.localeCompare(b.date); });
    title       = isAr ? 'التقرير الأسبوعي' : 'Weekly Report';
    periodLabel = from.toLocaleDateString(locale) + ' – ' + today.toLocaleDateString(locale);
  } else {
    from = new Date(today.getFullYear(), today.getMonth(), 1);
    records = data.records.filter(function(r) {
      return r.studentId === studentId && new Date(r.date) >= from;
    }).sort(function(a, b) { return a.date.localeCompare(b.date); });
    title       = isAr ? 'التقرير الشهري' : 'Monthly Report';
    periodLabel = from.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }

  const html = buildReportHTML(student, halaqah, records, skipTahfidh, isAr, locale, title, periodLabel, format);
  const win  = window.open('', '_blank');
  if (!win) { alert(isAr ? 'يرجى السماح بالنوافذ المنبثقة' : 'Please allow popups'); return; }
  win.document.write(html);
  win.document.close();
}

function buildReportHTML(student, halaqah, records, skipTahfidh, isAr, locale, title, periodLabel, format) {
  const dir         = isAr ? 'rtl' : 'ltr';
  const className   = halaqah ? halaqah.name            : '';
  const teacherName = halaqah ? (halaqah.teacher || '')  : '';
  const logoSrc     = halaqah && halaqah.teacherPhoto    ? halaqah.teacherPhoto : '';
  const appName     = isAr ? 'إدارة التحفيظ' : 'Tahfidh Management';

  const hifdhRecords = records.filter(function(r) { return !r.noHifdh && !skipTahfidh; });
  const totalTErrors = hifdhRecords.reduce(function(a, r) { return a + (r.tahfidh.errors || 0); }, 0);
  const hifdhScores  = hifdhRecords.map(function(r) { return ratingToScore(r.tahfidh.rating); }).filter(function(s) { return s > 0; });
  const avgHifdh     = hifdhScores.length ? hifdhScores.reduce(function(a, b) { return a + b; }, 0) / hifdhScores.length : 0;
  const totalMErrors = records.reduce(function(a, r) { return a + (r.murajaah.errors || 0); }, 0);
  const mScores      = records.map(function(r) { return ratingToScore(r.murajaah.rating); }).filter(function(s) { return s > 0; });
  const avgMurajaah  = mScores.length ? mScores.reduce(function(a, b) { return a + b; }, 0) / mScores.length : 0;
  const overallRating = scoreToRating(skipTahfidh ? avgMurajaah : (avgHifdh + avgMurajaah) / 2);

  function ratingColor(r) {
    if (r === 'ممتاز'       || r === 'Excellent')         return '#16A34A';
    if (r === 'جيد جدًا'    || r === 'Very Good')         return '#0369A1';
    if (r === 'جيد'          || r === 'Good')              return '#D97706';
    if (r === 'مقبول'        || r === 'Acceptable')        return '#B45309';
    if (r === 'يحتاج تحسين' || r === 'Needs Improvement') return '#DC2626';
    return '#DC2626';
  }

  const thStyle      = 'background:#0D2C54;color:#fff;padding:10px 8px;font-size:0.82rem;font-weight:700;';
  const overallColor = ratingColor(overallRating);

  var hifdhRows = '';
  if (!skipTahfidh) {
    records.forEach(function(r) {
      if (r.noHifdh) {
        hifdhRows += '<tr><td>' + getDayName(r.date) + '</td><td>' + fmtDate(r.date) + '</td>'
          + '<td colspan="4" style="text-align:center;color:#6B7280;font-style:italic;">'
          + (isAr ? 'لا حفظ اليوم' : 'No new memorization') + '</td></tr>';
      } else {
        const rc = ratingColor(r.tahfidh.rating);
        hifdhRows += '<tr>'
          + '<td>' + getDayName(r.date) + '</td>'
          + '<td>' + fmtDate(r.date) + '</td>'
          + '<td>' + (r.tahfidh.surahFrom || '—') + '</td>'
          + '<td>' + (r.tahfidh.ayahFrom || '—') + ' – ' + (r.tahfidh.ayahTo || '—') + '</td>'
          + '<td>' + (r.tahfidh.errors || 0) + '</td>'
          + '<td style="color:' + rc + ';font-weight:700;">' + (r.tahfidh.rating || '—') + '</td>'
          + '</tr>';
      }
    });
  }

  var mRows = '';
  records.forEach(function(r) {
    const rc = ratingColor(r.murajaah.rating);
    mRows += '<tr>'
      + '<td>' + getDayName(r.date) + '</td>'
      + '<td>' + fmtDate(r.date) + '</td>'
      + '<td>' + (r.murajaah.surahFrom || '—') + '</td>'
      + '<td>' + (r.murajaah.surahTo || '—') + '</td>'
      + '<td>' + (r.murajaah.errors || 0) + '</td>'
      + '<td style="color:' + rc + ';font-weight:700;">' + (r.murajaah.rating || '—') + '</td>'
      + '</tr>';
  });

  const logoHtml = logoSrc
    ? '<img src="' + logoSrc + '" alt="" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:4px solid #0D2C54;display:block;margin:0 auto 10px;">'
    : '<div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#0D2C54,#0F766E);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:2rem;color:#fff;">📖</div>';

  const shareLabel = isAr ? '📤 مشاركة' : '📤 Share';
  const shareScript = format === 'pdf'
    ? "async function shareReport(){var btn=document.getElementById('shareBtn');btn.disabled=true;btn.textContent='⏳...';try{var canvas=await html2canvas(document.querySelector('.page'),{scale:2,useCORS:true,backgroundColor:'#fff'});var imgData=canvas.toDataURL('image/jpeg',0.92);var pdf=new window.jspdf.jsPDF({orientation:'p',unit:'mm',format:'a4'});var pw=pdf.internal.pageSize.getWidth();var ph=pdf.internal.pageSize.getHeight();var ih=(canvas.height*pw)/canvas.width;var y=0;while(y<ih){if(y>0)pdf.addPage();pdf.addImage(imgData,'JPEG',0,-y,pw,ih);y+=ph;}var blob=pdf.output('blob');var file=new File([blob],'tahfidh-report.pdf',{type:'application/pdf'});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:document.title});}else{pdf.save('tahfidh-report.pdf');}}catch(e){alert(e.message);}finally{btn.disabled=false;btn.textContent='" + (isAr ? '📤 مشاركة' : '📤 Share') + "';}}"
    : "async function shareReport(){var btn=document.getElementById('shareBtn');btn.disabled=true;btn.textContent='⏳...';try{var canvas=await html2canvas(document.querySelector('.page'),{scale:2,useCORS:true,backgroundColor:'#F8FAFC'});canvas.toBlob(async function(blob){var file=new File([blob],'tahfidh-report.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:document.title});}else{var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='tahfidh-report.png';a.click();}btn.disabled=false;btn.textContent='" + (isAr ? '📤 مشاركة' : '📤 Share') + "';},'image/png');}catch(e){alert(e.message);btn.disabled=false;btn.textContent='" + (isAr ? '📤 مشاركة' : '📤 Share') + "';}}";

  return '<!DOCTYPE html><html dir="' + dir + '" lang="' + (isAr ? 'ar' : 'en') + '"><head>'
    + '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>' + title + ' – ' + student.name + '</title>'
    + '<style>'
    + 'body{margin:0;padding:0;font-family:"Segoe UI",Tahoma,Arial,sans-serif;background:#F8FAFC;color:#1E293B;direction:' + dir + ';}'
    + '@page{margin:1.5cm;size:A4;}'
    + '@media print{.no-print{display:none!important;}body{background:#fff;}tr{page-break-inside:avoid;}}'
    + '.page{max-width:800px;margin:0 auto;padding:20px;}'
    + 'table{width:100%;border-collapse:collapse;margin-bottom:20px;}'
    + 'tr:nth-child(even) td{background:#F8FAFC;}'
    + 'td{padding:9px 8px;font-size:0.82rem;border-bottom:1px solid #E5E7EB;}'
    + '.summary-box{background:linear-gradient(135deg,#0D2C54,#0F766E);color:#fff;border-radius:14px;padding:20px;margin:20px 0;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;print-color-adjust:exact;-webkit-print-color-adjust:exact;}'
    + '.summary-item .val{font-size:1.6rem;font-weight:900;}'
    + '.summary-item .lbl{font-size:0.75rem;opacity:0.85;margin-top:4px;}'
    + 'h2{color:#0D2C54;border-bottom:3px solid #0D2C54;padding-bottom:6px;font-size:1rem;margin-top:24px;}'
    + '.action-bar{position:sticky;top:0;background:rgba(255,255,255,0.95);backdrop-filter:blur(4px);padding:10px 20px;display:flex;gap:10px;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);z-index:100;}'
    + '.action-bar button{padding:8px 22px;border:none;border-radius:8px;font-size:0.9rem;cursor:pointer;font-family:inherit;font-weight:700;}'
    + '.btn-print{background:#0D2C54;color:#fff;}'
    + '.btn-close{background:#F3F4F6;color:#374151;}'
    + '</style></head><body>'
    + '<div class="action-bar no-print">'
    + '<button id="shareBtn" class="btn-print" onclick="shareReport()">' + shareLabel + '</button>'
    + '<button class="btn-close" onclick="window.close()">' + (isAr ? '✕ إغلاق' : '✕ Close') + '</button>'
    + '</div>'
    + '<div class="page">'
    + '<div style="text-align:center;padding:24px 0 16px;">'
    + logoHtml
    + '<h1 style="margin:0;font-size:1.5rem;color:#0D2C54;font-weight:900;">' + title + '</h1>'
    + (className   ? '<div style="color:#0F766E;font-weight:700;font-size:0.95rem;margin-top:4px;">' + className + '</div>' : '')
    + (teacherName ? '<div style="color:#6B7280;font-size:0.88rem;margin-top:2px;">' + (isAr ? 'المعلم: ' : 'Teacher: ') + teacherName + '</div>' : '')
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">'
    + '<div style="background:#F3F6FA;padding:12px;border-radius:10px;"><div style="color:#6B7280;font-size:0.78rem;">' + (isAr ? 'اسم الطالب' : 'Student Name') + '</div><div style="font-weight:900;font-size:1rem;margin-top:3px;">' + student.name + '</div></div>'
    + '<div style="background:#F3F6FA;padding:12px;border-radius:10px;"><div style="color:#6B7280;font-size:0.78rem;">' + (isAr ? 'الفترة' : 'Period') + '</div><div style="font-weight:700;font-size:0.88rem;margin-top:3px;">' + periodLabel + '</div></div>'
    + '<div style="background:#F3F6FA;padding:12px;border-radius:10px;"><div style="color:#6B7280;font-size:0.78rem;">' + (isAr ? 'أيام التسجيل' : 'Days Recorded') + '</div><div style="font-weight:900;font-size:1rem;margin-top:3px;">' + records.length + '</div></div>'
    + '<div style="background:#F3F6FA;padding:12px;border-radius:10px;"><div style="color:#6B7280;font-size:0.78rem;">' + (isAr ? 'الغياب / التأخر' : 'Absent / Late') + '</div><div style="font-weight:700;font-size:0.88rem;margin-top:3px;">' + (student.absences || 0) + ' / ' + (student.late || 0) + '</div></div>'
    + '</div>'
    + (!skipTahfidh ? (
        '<h2>' + (isAr ? 'تفاصيل الحفظ الجديد' : 'New Memorization Details') + '</h2>'
        + '<table><thead><tr>'
        + '<th style="' + thStyle + '">' + (isAr ? 'اليوم' : 'Day') + '</th>'
        + '<th style="' + thStyle + '">' + (isAr ? 'التاريخ' : 'Date') + '</th>'
        + '<th style="' + thStyle + '">' + (isAr ? 'السورة' : 'Surah') + '</th>'
        + '<th style="' + thStyle + '">' + (isAr ? 'الآيات' : 'Ayahs') + '</th>'
        + '<th style="' + thStyle + '">' + (isAr ? 'الأخطاء' : 'Errors') + '</th>'
        + '<th style="' + thStyle + '">' + (isAr ? 'التقييم' : 'Rating') + '</th>'
        + '</tr></thead><tbody>'
        + (hifdhRows || '<tr><td colspan="6" style="text-align:center;padding:16px;color:#6B7280;">' + (isAr ? 'لا توجد سجلات' : 'No records') + '</td></tr>')
        + '</tbody></table>'
      ) : '')
    + '<h2>' + (isAr ? 'تفاصيل المراجعة' : 'Revision Details') + '</h2>'
    + '<table><thead><tr>'
    + '<th style="' + thStyle + '">' + (isAr ? 'اليوم' : 'Day') + '</th>'
    + '<th style="' + thStyle + '">' + (isAr ? 'التاريخ' : 'Date') + '</th>'
    + '<th style="' + thStyle + '">' + (isAr ? 'من سورة' : 'From Surah') + '</th>'
    + '<th style="' + thStyle + '">' + (isAr ? 'إلى سورة' : 'To Surah') + '</th>'
    + '<th style="' + thStyle + '">' + (isAr ? 'الأخطاء' : 'Errors') + '</th>'
    + '<th style="' + thStyle + '">' + (isAr ? 'التقييم' : 'Rating') + '</th>'
    + '</tr></thead><tbody>'
    + (mRows || '<tr><td colspan="6" style="text-align:center;padding:16px;color:#6B7280;">' + (isAr ? 'لا توجد سجلات' : 'No records') + '</td></tr>')
    + '</tbody></table>'
    + '<div class="summary-box">'
    + (!skipTahfidh ? '<div class="summary-item"><div class="val">' + totalTErrors + '</div><div class="lbl">' + (isAr ? 'أخطاء الحفظ' : 'Memorization Errors') + '</div></div>' : '')
    + '<div class="summary-item"><div class="val">' + totalMErrors + '</div><div class="lbl">' + (isAr ? 'أخطاء المراجعة' : 'Revision Errors') + '</div></div>'
    + '<div class="summary-item"><div class="val" style="color:' + overallColor + ';text-shadow:0 0 8px rgba(255,255,255,0.3);">' + overallRating + '</div><div class="lbl">' + (isAr ? 'التقييم الإجمالي' : 'Overall Rating') + '</div></div>'
    + '</div>'
    + '<div style="text-align:center;margin:24px 0;padding:16px;background:#F0FDF4;border-radius:12px;border:1px solid #BBF7D0;">'
    + '<div style="font-size:1.1rem;font-weight:700;color:#166534;">' + (isAr ? 'جزاكم الله خيرًا' : 'Barak Allahu feek') + '</div>'
    + '<div style="color:#6B7280;font-size:0.85rem;margin-top:4px;">' + (isAr ? 'نسأل الله التوفيق والسداد' : 'May Allah grant you success') + '</div>'
    + '</div>'
    + '<div style="text-align:center;color:#9CA3AF;font-size:0.78rem;padding:16px 0;border-top:1px solid #E5E7EB;margin-top:8px;">'
    + (isAr ? 'صُنع بواسطة ' : 'Made by ') + appName
    + '</div>'
    + '</div>'
    + '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" crossorigin="anonymous"><\/script>'
    + (format === 'pdf' ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" crossorigin="anonymous"><\/script>' : '')
    + '<script>' + shareScript + '<\/script>'
    + '</body></html>';
}
