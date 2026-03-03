// js/reports.js

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

function scoreToRating(avg) {
  const isAr = getLang() === 'ar';
  if (avg >= 3.5) return isAr ? 'ممتاز'   : 'Excellent';
  if (avg >= 2.5) return isAr ? 'جيد جدًا' : 'Very Good';
  if (avg >= 1.5) return isAr ? 'جيد'     : 'Good';
  return isAr ? 'ضعيف' : 'Weak';
}

function getDayName(dateStr) {
  const locale = getLang() === 'en' ? 'en-US' : 'ar-SA';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, { weekday: 'long' });
}

function fmtDate(dateStr) {
  const locale = getLang() === 'en' ? 'en-US' : 'ar-SA';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function isAbsent(r)         { return r.attendance === 'absent'; }
function tahfidhOff(r)       { return r.noHifdh || r.tahfidhEnabled === false; }
function murajaahOff(r)      { return r.murajaahEnabled === false; }
function noTahfidhRating(r)  { return !r.tahfidh || !r.tahfidh.rating; }
function noMurajaahRating(r) { return !r.murajaah || !r.murajaah.rating; }

// ── WhatsApp text block per day ────────────────────────────────────────────
function renderRecordBlock(r, skipTahfidh, isAr) {
  const absent    = isAbsent(r);
  const dayName   = getDayName(r.date);
  const dateLabel = fmtDate(r.date);
  const noRecord  = isAr ? '⚠️ لا يوجد سجل' : '⚠️ No record';
  const absentLbl = isAr ? '🔴 غائب'         : '🔴 Absent';
  const notTaken  = isAr ? '🟡 لم يؤدِ'      : '🟡 Not taken';

  let block = dayName + ' – ' + dateLabel + '\n';

  if (absent) {
    block += absentLbl + '\n';
    if (r.teacherComments) block += '📝 ' + r.teacherComments + '\n';
    block += '\n';
    return block;
  }

  // Tahfidh
  if (!skipTahfidh) {
    if (tahfidhOff(r)) {
      block += (isAr ? 'الحفظ: ' : 'Tahfidh: ') + notTaken + '\n';
    } else {
      block += (isAr ? t('rptNewMemorization') : t('rptNewMemorization')) + '\n';
      block += (r.tahfidh.surahFrom || '') + ' (' + (r.tahfidh.ayahFrom || '') + '–' + (r.tahfidh.ayahTo || '') + ')\n';
      block += (isAr ? t('errors') : 'Errors') + ': ' + (r.tahfidh.errors || 0) + '\n';
      block += (isAr ? t('rating') : 'Rating') + ': ' + (r.tahfidh.rating || notTaken) + '\n';
    }
  }

  // Murajaah
  if (murajaahOff(r)) {
    block += (isAr ? 'المراجعة: ' : 'Murajaah: ') + notTaken + '\n';
  } else {
    block += (isAr ? t('rptRevision') : t('rptRevision')) + '\n';
    block += t('rptFrom') + ' ' + (r.murajaah.surahFrom || '') + ' ' + t('rptTo') + ' ' + (r.murajaah.surahTo || '') + '\n';
    block += (isAr ? t('errors') : 'Errors') + ': ' + (r.murajaah.errors || 0) + '\n';
    block += (isAr ? t('rating') : 'Rating') + ': ' + (r.murajaah.rating || notTaken) + '\n';
  }

  block += '\n';
  if (r.teacherComments) block += '📝 ' + (isAr ? 'ملاحظة: ' : 'Note: ') + r.teacherComments + '\n';
  block += '\n';
  return block;
}

// ====================================================
// Date Range Modal
// ====================================================
var _rptType      = '';
var _rptStudentId = '';
var _rptClassId   = '';

function showReportFormatModal(type, studentId, classId) {
  _rptType      = type;
  _rptStudentId = studentId;
  _rptClassId   = classId;

  // Show date range picker first
  _showDateRangeModal(type);
}

function _showDateRangeModal(type) {
  const isAr  = getLang() === 'ar';
  const today = new Date().toISOString().slice(0, 10);

  // Default date range
  var fromDate, toDate = today;
  if (type === 'weekly') {
    var f = new Date(); f.setDate(f.getDate() - 6);
    fromDate = f.toISOString().slice(0, 10);
  } else {
    var n = new Date();
    fromDate = new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10);
  }

  // Build modal HTML if not exists
  var existing = document.getElementById('dateRangeModal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'dateRangeModal';
  modal.className = 'tt-modal show';
  modal.innerHTML = `
    <div class="tt-modal-box" style="max-width:340px;">
      <div class="tt-modal-header">
        <div class="tt-modal-title">${isAr ? 'اختر فترة التقرير' : 'Select Report Period'}</div>
        <button class="tt-icon-btn" onclick="closeDateRangeModal()">✕</button>
      </div>
      <div style="padding:12px 0;">
        <div class="form-group">
          <label class="form-label">${isAr ? 'من تاريخ' : 'From Date'}</label>
          <input id="rptFromDate" type="date" class="form-input" value="${fromDate}" max="${today}" />
        </div>
        <div class="form-group">
          <label class="form-label">${isAr ? 'إلى تاريخ' : 'To Date'}</label>
          <input id="rptToDate" type="date" class="form-input" value="${toDate}" max="${today}" />
        </div>
      </div>
      <div class="tt-actions">
        <button class="btn btn-secondary" onclick="closeDateRangeModal()">${isAr ? 'إلغاء' : 'Cancel'}</button>
        <button class="btn btn-primary" onclick="_submitDateRange()">${isAr ? 'التالي ←' : 'Next →'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeDateRangeModal() {
  var m = document.getElementById('dateRangeModal');
  if (m) m.remove();
}

function _submitDateRange() {
  var fromDate = document.getElementById('rptFromDate').value;
  var toDate   = document.getElementById('rptToDate').value;
  if (!fromDate || !toDate || fromDate > toDate) {
    alert(getLang() === 'ar' ? 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية' : 'From date must be before To date');
    return;
  }
  closeDateRangeModal();
  _showFormatModal(fromDate, toDate);
}

function _showFormatModal(fromDate, toDate) {
  var modal = document.getElementById('reportFmtModal');
  if (modal) {
    modal.setAttribute('data-from', fromDate);
    modal.setAttribute('data-to', toDate);
    modal.classList.add('show');
  }
}

function closeReportFmtModal() {
  var modal = document.getElementById('reportFmtModal');
  if (modal) modal.classList.remove('show');
}

function submitReportFormat(format) {
  var modal    = document.getElementById('reportFmtModal');
  var fromDate = modal ? modal.getAttribute('data-from') : null;
  var toDate   = modal ? modal.getAttribute('data-to')   : null;
  closeReportFmtModal();

  if (format === 'msg') {
    _generateWhatsAppReport(_rptStudentId, _rptClassId, fromDate, toDate);
  } else {
    _generateDocReport(_rptStudentId, _rptClassId, fromDate, toDate, format);
  }
}

// ── Get records between two dates ──────────────────────────────────────────
function _getRecords(studentId, fromDate, toDate) {
  const data = dbLoad();
  return data.records.filter(function(r) {
    return r.studentId === studentId && r.date >= fromDate && r.date <= toDate;
  }).sort(function(a, b) { return a.date.localeCompare(b.date); });
}

// ====================================================
// WhatsApp Report
// ====================================================
function _generateWhatsAppReport(studentId, classId, fromDate, toDate) {
  const data        = dbLoad();
  const student     = data.students.find(s => s.id === studentId);
  if (!student) return;
  const halaqah     = classId ? data.halaqah.find(h => h.id === classId) : null;
  const className   = halaqah ? halaqah.name : '';
  const teacherName = halaqah ? (halaqah.teacher || '') : '';
  const skipTahfidh = student.course === 'murajaah';
  const records     = _getRecords(studentId, fromDate, toDate);
  const isAr        = getLang() === 'ar';
  const locale      = isAr ? 'ar-SA' : 'en-US';
  const fromLabel   = new Date(fromDate + 'T00:00:00').toLocaleDateString(locale);
  const toLabel     = new Date(toDate   + 'T00:00:00').toLocaleDateString(locale);

  // Active records only (not absent, section on)
  const hifdhActive    = records.filter(r => !isAbsent(r) && !tahfidhOff(r) && !skipTahfidh);
  const murajaahActive = records.filter(r => !isAbsent(r) && !murajaahOff(r));

  const totalTErr  = hifdhActive.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
  const tScores    = hifdhActive.map(r => ratingToScore(r.tahfidh.rating)).filter(s => s > 0);
  const avgT       = tScores.length ? tScores.reduce((a, b) => a + b, 0) / tScores.length : 0;
  const weekRating = scoreToRating(skipTahfidh ? (murajaahActive.map(r => ratingToScore(r.murajaah.rating)).filter(s=>s>0).reduce((a,b)=>a+b,0) / (murajaahActive.length || 1)) : avgT);

  let text = '';
  if (isAr) {
    text += 'تقرير الحفظ\n\n';
    text += t('rptGreeting') + '\n\n';
    text += t('rptIntro') + '\n\n';
    text += 'الطالب: ' + student.name + '\n';
    text += 'الفترة: ' + fromLabel + ' – ' + toLabel + '\n\n';
    if (!records.length) {
      text += t('rptNoRecords') + '\n\n';
    } else {
      records.forEach(r => { text += renderRecordBlock(r, skipTahfidh, true); });
      if (!skipTahfidh && tScores.length) {
        text += 'إجمالي أخطاء الحفظ: ' + totalTErr + '\n';
        text += t('rptWeeklyRating') + ' ' + weekRating + '\n\n';
      }
    }
    text += t('rptClosing') + '\n\n' + t('rptBarakallah') + '\n\n';
    if (className)   text += '— ' + className + '\n';
    if (teacherName) text += '— ' + teacherName + '\n';
  } else {
    text += 'Tahfidh Report\n\n';
    text += t('rptGreeting') + '\n\n';
    text += t('rptIntro') + '\n\n';
    text += 'Student: ' + student.name + '\n';
    text += 'Period: ' + fromLabel + ' – ' + toLabel + '\n\n';
    if (!records.length) {
      text += t('rptNoRecords') + '\n\n';
    } else {
      records.forEach(r => { text += renderRecordBlock(r, skipTahfidh, false); });
      if (!skipTahfidh && tScores.length) {
        text += 'Total Memorization Errors: ' + totalTErr + '\n';
        text += t('rptWeeklyRating') + ' ' + weekRating + '\n\n';
      }
    }
    text += t('rptClosing') + '\n\n' + t('rptBarakallah') + '\n\n';
    if (className)   text += '— ' + className + '\n';
    if (teacherName) text += '— ' + teacherName + '\n';
  }

  const phone = (student.phone || '').replace(/\D/g, '');
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text));
}

// Keep old function names working
function generateWeeklyReport(studentId, classId)  { showReportFormatModal('weekly',  studentId, classId); }
function generateMonthlyReport(studentId, classId) { showReportFormatModal('monthly', studentId, classId); }

// ====================================================
// PDF / Image Report
// ====================================================
function _generateDocReport(studentId, classId, fromDate, toDate, format) {
  const data        = dbLoad();
  const student     = data.students.find(s => s.id === studentId);
  if (!student) return;
  const halaqah     = classId ? data.halaqah.find(h => h.id === classId) : null;
  const skipTahfidh = student.course === 'murajaah';
  const isAr        = getLang() === 'ar';
  const locale      = isAr ? 'ar-SA' : 'en-US';
  const records     = _getRecords(studentId, fromDate, toDate);
  const fromLabel   = new Date(fromDate + 'T00:00:00').toLocaleDateString(locale);
  const toLabel     = new Date(toDate   + 'T00:00:00').toLocaleDateString(locale);
  const periodLabel = fromLabel + ' – ' + toLabel;
  const title       = isAr ? 'تقرير الحفظ' : 'Tahfidh Report';

  const html = buildReportHTML(student, halaqah, records, skipTahfidh, isAr, locale, title, periodLabel, format);
  const win  = window.open('', '_blank');
  if (!win) { alert(isAr ? 'يرجى السماح بالنوافذ المنبثقة' : 'Please allow popups'); return; }
  win.document.write(html);
  win.document.close();
}

// Legacy wrappers
function generateReportDocument(type, studentId, classId, format) {
  showReportFormatModal(type, studentId, classId);
}

// ====================================================
// HTML Report Builder
// ====================================================
function buildReportHTML(student, halaqah, records, skipTahfidh, isAr, locale, title, periodLabel, format) {
  const dir         = isAr ? 'rtl' : 'ltr';
  const className   = halaqah ? halaqah.name           : '';
  const teacherName = halaqah ? (halaqah.teacher || '') : '';
  const logoSrc     = halaqah && halaqah.teacherPhoto   ? halaqah.teacherPhoto : '';
  const appName     = isAr ? 'إدارة التحفيظ' : 'Tahfidh Management';
  const notTaken    = isAr ? 'لم يؤدِ' : 'Not taken';
  const absentLbl   = isAr ? 'غائب'    : 'Absent';
  const noRecLbl    = isAr ? 'لا يوجد سجل' : 'No record';

  // ── Summary calculations (active records only) ──────────────────────────
  const hifdhActive    = records.filter(r => !isAbsent(r) && !tahfidhOff(r) && !skipTahfidh);
  const murajaahActive = records.filter(r => !isAbsent(r) && !murajaahOff(r));

  const totalTErrors = hifdhActive.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
  const hifdhScores  = hifdhActive.map(r => ratingToScore(r.tahfidh.rating)).filter(s => s > 0);
  const avgHifdh     = hifdhScores.length ? hifdhScores.reduce((a, b) => a + b, 0) / hifdhScores.length : 0;

  const totalMErrors = murajaahActive.reduce((a, r) => a + (r.murajaah.errors || 0), 0);
  const mScores      = murajaahActive.map(r => ratingToScore(r.murajaah.rating)).filter(s => s > 0);
  const avgMurajaah  = mScores.length ? mScores.reduce((a, b) => a + b, 0) / mScores.length : 0;

  const overallRating = scoreToRating(
    skipTahfidh ? avgMurajaah
    : (hifdhScores.length && mScores.length) ? (avgHifdh + avgMurajaah) / 2
    : hifdhScores.length ? avgHifdh : avgMurajaah
  );

  function ratingColor(r) {
    if (r === 'ممتاز'       || r === 'Excellent')         return '#16A34A';
    if (r === 'جيد جدًا'    || r === 'Very Good')         return '#0369A1';
    if (r === 'جيد'          || r === 'Good')              return '#D97706';
    if (r === 'مقبول'        || r === 'Acceptable')        return '#B45309';
    if (r === 'يحتاج تحسين' || r === 'Needs Improvement') return '#DC2626';
    return '#DC2626';
  }

  const thStyle = 'background:#0D2C54;color:#fff;padding:10px 8px;font-size:0.82rem;font-weight:700;';

  // ── Tahfidh rows ──────────────────────────────────────────────────────────
  var hifdhRows = '';
  if (!skipTahfidh) {
    records.forEach(function(r) {
      if (isAbsent(r)) {
        // Red row — absent
        hifdhRows += '<tr>'
          + '<td style="background:#FEE2E2;color:#DC2626;font-weight:700;">' + getDayName(r.date) + '</td>'
          + '<td style="background:#FEE2E2;color:#DC2626;font-weight:700;">' + fmtDate(r.date) + '</td>'
          + '<td colspan="3" style="background:#FEE2E2;text-align:center;color:#DC2626;font-weight:700;">🔴 ' + absentLbl + '</td>'
          + '<td style="background:#FEE2E2;color:#6B7280;font-size:0.78rem;">' + (r.teacherComments || '') + '</td>'
          + '</tr>';
      } else if (tahfidhOff(r)) {
        // Yellow row — not taken
        hifdhRows += '<tr>'
          + '<td style="background:#FEFCE8;">' + getDayName(r.date) + '</td>'
          + '<td style="background:#FEFCE8;">' + fmtDate(r.date) + '</td>'
          + '<td colspan="3" style="background:#FEFCE8;text-align:center;color:#B45309;font-weight:700;">🟡 ' + notTaken + '</td>'
          + '<td style="background:#FEFCE8;color:#6B7280;font-size:0.78rem;">' + (r.teacherComments || '') + '</td>'
          + '</tr>';
      } else {
        const hasData = r.tahfidh && r.tahfidh.surahFrom;
        if (!hasData) {
          // Yellow — present but no data entered
          hifdhRows += '<tr>'
            + '<td style="background:#FEFCE8;">' + getDayName(r.date) + '</td>'
            + '<td style="background:#FEFCE8;">' + fmtDate(r.date) + '</td>'
            + '<td colspan="3" style="background:#FEFCE8;text-align:center;color:#B45309;font-weight:700;">🟡 ' + noRecLbl + '</td>'
            + '<td style="background:#FEFCE8;color:#6B7280;font-size:0.78rem;">' + (r.teacherComments || '') + '</td>'
            + '</tr>';
        } else {
          const rc = r.tahfidh.rating ? ratingColor(r.tahfidh.rating) : '#B45309';
          const ratingDisplay = r.tahfidh.rating
            ? '<span style="color:' + rc + ';font-weight:700;">' + r.tahfidh.rating + '</span>'
            : '<span style="color:#B45309;font-weight:700;">🟡 ' + notTaken + '</span>';
          hifdhRows += '<tr>'
            + '<td>' + getDayName(r.date) + '</td>'
            + '<td>' + fmtDate(r.date) + '</td>'
            + '<td>' + (r.tahfidh.surahFrom || '—') + '</td>'
            + '<td>' + (r.tahfidh.ayahFrom || '—') + ' – ' + (r.tahfidh.ayahTo || '—') + '</td>'
            + '<td>' + (r.tahfidh.errors || 0) + '</td>'
            + '<td>' + ratingDisplay + '</td>'
            + '<td style="color:#6B7280;font-size:0.78rem;">' + (r.teacherComments || '') + '</td>'
            + '</tr>';
        }
      }
    });
  }

  // ── Murajaah rows ─────────────────────────────────────────────────────────
  var mRows = '';
  records.forEach(function(r) {
    if (isAbsent(r)) {
      mRows += '<tr>'
        + '<td style="background:#FEE2E2;color:#DC2626;font-weight:700;">' + getDayName(r.date) + '</td>'
        + '<td style="background:#FEE2E2;color:#DC2626;font-weight:700;">' + fmtDate(r.date) + '</td>'
        + '<td colspan="3" style="background:#FEE2E2;text-align:center;color:#DC2626;font-weight:700;">🔴 ' + absentLbl + '</td>'
        + '<td style="background:#FEE2E2;color:#6B7280;font-size:0.78rem;">' + (r.teacherComments || '') + '</td>'
        + '</tr>';
    } else if (murajaahOff(r)) {
      mRows += '<tr>'
        + '<td style="background:#FEFCE8;">' + getDayName(r.date) + '</td>'
        + '<td style="background:#FEFCE8;">' + fmtDate(r.date) + '</td>'
        + '<td colspan="3" style="background:#FEFCE8;text-align:center;color:#B45309;font-weight:700;">🟡 ' + notTaken + '</td>'
        + '<td style="background:#FEFCE8;color:#6B7280;font-size:0.78rem;">' + (r.teacherComments || '') + '</td>'
        + '</tr>';
    } else {
      const hasData = r.murajaah && r.murajaah.surahFrom;
      if (!hasData) {
        mRows += '<tr>'
          + '<td style="background:#FEFCE8;">' + getDayName(r.date) + '</td>'
          + '<td style="background:#FEFCE8;">' + fmtDate(r.date) + '</td>'
          + '<td colspan="3" style="background:#FEFCE8;text-align:center;color:#B45309;font-weight:700;">🟡 ' + noRecLbl + '</td>'
          + '<td style="background:#FEFCE8;color:#6B7280;font-size:0.78rem;">' + (r.teacherComments || '') + '</td>'
          + '</tr>';
      } else {
        const rc = r.murajaah.rating ? ratingColor(r.murajaah.rating) : '#B45309';
        const ratingDisplay = r.murajaah.rating
          ? '<span style="color:' + rc + ';font-weight:700;">' + r.murajaah.rating + '</span>'
          : '<span style="color:#B45309;font-weight:700;">🟡 ' + notTaken + '</span>';
        mRows += '<tr>'
          + '<td>' + getDayName(r.date) + '</td>'
          + '<td>' + fmtDate(r.date) + '</td>'
          + '<td>' + (r.murajaah.surahFrom || '—') + '</td>'
          + '<td>' + (r.murajaah.surahTo   || '—') + '</td>'
          + '<td>' + (r.murajaah.errors    || 0)   + '</td>'
          + '<td>' + ratingDisplay + '</td>'
          + '<td style="color:#6B7280;font-size:0.78rem;">' + (r.teacherComments || '') + '</td>'
          + '</tr>';
      }
    }
  });

  const logoHtml = logoSrc
    ? '<img src="' + logoSrc + '" alt="" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:4px solid #0D2C54;display:block;margin:0 auto 10px;">'
    : '<div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#0D2C54,#0F766E);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:2rem;color:#fff;">📖</div>';

  const shareLabel = isAr ? '📤 مشاركة' : '📤 Share';
  const overallColor = ratingColor(overallRating);

  const shareScript = format === 'pdf'
    ? "async function shareReport(){var btn=document.getElementById('shareBtn');btn.disabled=true;btn.textContent='⏳...';try{var canvas=await html2canvas(document.querySelector('.page'),{scale:2,useCORS:true,backgroundColor:'#fff'});var imgData=canvas.toDataURL('image/jpeg',0.92);var pdf=new window.jspdf.jsPDF({orientation:'p',unit:'mm',format:'a4'});var pw=pdf.internal.pageSize.getWidth();var ph=pdf.internal.pageSize.getHeight();var ih=(canvas.height*pw)/canvas.width;var y=0;while(y<ih){if(y>0)pdf.addPage();pdf.addImage(imgData,'JPEG',0,-y,pw,ih);y+=ph;}var blob=pdf.output('blob');var file=new File([blob],'tahfidh-report.pdf',{type:'application/pdf'});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:document.title});}else{pdf.save('tahfidh-report.pdf');}}catch(e){alert(e.message);}finally{btn.disabled=false;btn.textContent='" + (isAr ? '📤 مشاركة' : '📤 Share') + "';}}"
    : "async function shareReport(){var btn=document.getElementById('shareBtn');btn.disabled=true;btn.textContent='⏳...';try{var canvas=await html2canvas(document.querySelector('.page'),{scale:2,useCORS:true,backgroundColor:'#F8FAFC'});canvas.toBlob(async function(blob){var file=new File([blob],'tahfidh-report.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:document.title});}else{var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='tahfidh-report.png';a.click();}btn.disabled=false;btn.textContent='" + (isAr ? '📤 مشاركة' : '📤 Share') + "';},'image/png');}catch(e){alert(e.message);btn.disabled=false;btn.textContent='" + (isAr ? '📤 مشاركة' : '📤 Share') + "';}}";

  // Legend HTML
  const legendHtml = '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;font-size:0.8rem;">'
    + '<span style="display:flex;align-items:center;gap:4px;"><span style="width:14px;height:14px;background:#FEE2E2;border-radius:3px;display:inline-block;"></span> ' + (isAr ? 'غائب' : 'Absent') + '</span>'
    + '<span style="display:flex;align-items:center;gap:4px;"><span style="width:14px;height:14px;background:#FEFCE8;border-radius:3px;display:inline-block;"></span> ' + (isAr ? 'لم يؤدِ / لا سجل' : 'Not taken / No record') + '</span>'
    + '</div>';

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
    + legendHtml
    + (!skipTahfidh ? (
        '<h2>' + (isAr ? 'تفاصيل الحفظ الجديد' : 'New Memorization Details') + '</h2>'
        + '<table><thead><tr>'
        + '<th style="' + thStyle + '">' + (isAr ? 'اليوم'    : 'Day')    + '</th>'
        + '<th style="' + thStyle + '">' + (isAr ? 'التاريخ'  : 'Date')   + '</th>'
        + '<th style="' + thStyle + '">' + (isAr ? 'السورة'   : 'Surah')  + '</th>'
        + '<th style="' + thStyle + '">' + (isAr ? 'الآيات'   : 'Ayahs') + '</th>'
        + '<th style="' + thStyle + '">' + (isAr ? 'الأخطاء'  : 'Errors') + '</th>'
        + '<th style="' + thStyle + '">' + (isAr ? 'التقييم'  : 'Rating') + '</th>'
        + '<th style="' + thStyle + '">' + (isAr ? 'ملاحظات'  : 'Notes')  + '</th>'
        + '</tr></thead><tbody>'
        + (hifdhRows || '<tr><td colspan="6" style="text-align:center;padding:16px;color:#6B7280;">' + (isAr ? 'لا توجد سجلات' : 'No records') + '</td></tr>')
        + '</tbody></table>'
      ) : '')
    + '<h2>' + (isAr ? 'تفاصيل المراجعة' : 'Revision Details') + '</h2>'
    + '<table><thead><tr>'
    + '<th style="' + thStyle + '">' + (isAr ? 'اليوم'      : 'Day')       + '</th>'
    + '<th style="' + thStyle + '">' + (isAr ? 'التاريخ'    : 'Date')      + '</th>'
    + '<th style="' + thStyle + '">' + (isAr ? 'من سورة'    : 'From Surah') + '</th>'
    + '<th style="' + thStyle + '">' + (isAr ? 'إلى سورة'   : 'To Surah')  + '</th>'
    + '<th style="' + thStyle + '">' + (isAr ? 'الأخطاء'    : 'Errors')    + '</th>'
    + '<th style="' + thStyle + '">' + (isAr ? 'التقييم'    : 'Rating')    + '</th>'
    + '<th style="' + thStyle + '">' + (isAr ? 'ملاحظات'    : 'Notes')     + '</th>'
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