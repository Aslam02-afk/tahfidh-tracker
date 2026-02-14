// js/reports.js

function generateWeeklyReport(studentId) {
  const data = dbLoad();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return;

  const today = new Date();
  const from  = new Date();
  from.setDate(today.getDate() - 6);

  const records = data.records.filter(r =>
    r.studentId === studentId && new Date(r.date) >= from
  );

  let text = `📘 تقرير أسبوعي\n👤 الطالب: ${student.name}\n📅 ${from.toLocaleDateString('ar-SA')} – ${today.toLocaleDateString('ar-SA')}\n\n`;

  if (!records.length) {
    text += 'لا توجد سجلات هذا الأسبوع.\n';
  } else {
    records.forEach(r => {
      text += `🗓 ${r.date}\n`;
      text += `📖 حفظ: ${r.tahfidh.surahFrom} (${r.tahfidh.ayahFrom}) → ${r.tahfidh.surahTo} (${r.tahfidh.ayahTo})\n`;
      text += `❌ أخطاء الحفظ: ${r.tahfidh.errors} | تقييم: ${r.tahfidh.rating}\n`;
      text += `🔁 مراجعة: ${r.murajaah.surahFrom} → ${r.murajaah.surahTo} | أخطاء: ${r.murajaah.errors}\n\n`;
    });
    const totalErrors = records.reduce((a, r) => a + (r.tahfidh.errors || 0), 0);
    text += `📊 إجمالي أخطاء الحفظ: ${totalErrors}\n`;
  }

  text += `\n— Tahfidh Tracker | برنامج الهدى`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

function generateMonthlyReport(studentId) {
  const data = dbLoad();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return;

  const today = new Date();
  const from  = new Date(today.getFullYear(), today.getMonth(), 1);

  const records = data.records.filter(r =>
    r.studentId === studentId && new Date(r.date) >= from
  );

  let text = `📗 تقرير شهري\n👤 الطالب: ${student.name}\n📅 ${from.toLocaleDateString('ar-SA', {month:'long', year:'numeric'})}\n\n`;
  text += `📆 أيام التسجيل: ${records.length}\n`;
  text += `❌ إجمالي أخطاء الحفظ: ${records.reduce((a, r) => a + (r.tahfidh.errors||0), 0)}\n`;
  text += `🔴 غياب: ${student.absences || 0} | 🟡 تأخر: ${student.late || 0}\n\n`;

  records.forEach(r => {
    text += `🗓 ${r.date}: ${r.tahfidh.surahFrom}→${r.tahfidh.surahTo} (${r.tahfidh.errors} أخطاء)\n`;
  });

  text += `\n— Tahfidh Tracker | برنامج الهدى`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}
