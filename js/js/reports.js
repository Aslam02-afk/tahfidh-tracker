// js/reports.js

function generateWeeklyReport(studentId) {
  const data = dbLoad();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return;

  const today = new Date();
  const from  = new Date();
  from.setDate(today.getDate() - 6);
  const locale = getLang() === 'en' ? 'en-US' : 'ar-SA';

  const records = data.records.filter(r =>
    r.studentId === studentId && new Date(r.date) >= from
  );

  let text = `${t('rptWeekly')}\n${t('rptStudent')} ${student.name}\n📅 ${from.toLocaleDateString(locale)} – ${today.toLocaleDateString(locale)}\n\n`;

  if (!records.length) {
    text += t('rptNoRecords') + '\n';
  } else {
    records.forEach(r => {
      text += `🗓 ${r.date}\n`;
      text += `${t('rptTahfidh')} ${r.tahfidh.surahFrom} (${r.tahfidh.ayahFrom}) → ${r.tahfidh.surahTo} (${r.tahfidh.ayahTo})\n`;
      text += `${t('rptErrors')} ${r.tahfidh.errors} | ${t('rptRating')} ${r.tahfidh.rating}\n`;
      text += `${t('rptMurajaah')} ${r.murajaah.surahFrom} → ${r.murajaah.surahTo} | ${t('rptMurajaahErrors')} ${r.murajaah.errors}\n\n`;
    });
    const totalErrors = records.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
    text += `${t('rptTotalErrors')} ${totalErrors}\n`;
  }

  text += `\n${t('rptSignature')}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

function generateMonthlyReport(studentId) {
  const data = dbLoad();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return;

  const today = new Date();
  const from  = new Date(today.getFullYear(), today.getMonth(), 1);
  const locale = getLang() === 'en' ? 'en-US' : 'ar-SA';

  const records = data.records.filter(r =>
    r.studentId === studentId && new Date(r.date) >= from
  );

  let text = `${t('rptMonthly')}\n${t('rptStudent')} ${student.name}\n📅 ${from.toLocaleDateString(locale, {month:'long', year:'numeric'})}\n\n`;
  text += `${t('rptDays')} ${records.length}\n`;
  text += `${t('rptTotalErrors')} ${records.reduce((a, r) => a + (r.tahfidh.errors||0), 0)}\n`;
  text += `${t('rptAbsences')} ${student.absences || 0} | ${t('rptLate')} ${student.late || 0}\n\n`;

  records.forEach(r => {
    text += `🗓 ${r.date}: ${r.tahfidh.surahFrom}→${r.tahfidh.surahTo} (${r.tahfidh.errors} ${t('rptErrorsSuffix')})\n`;
  });

  text += `\n${t('rptSignature')}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}
