// js/export.js
function exportClassToExcel(classId) {
  const data = dbLoad();

  const students = data.students.filter(s => s.classId === classId);
  const records = data.records.filter(r => r.classId === classId);

  if (!records.length) {
    alert("لا توجد بيانات للتصدير");
    return;
  }

  const rows = [];

  rows.push([
    "اسم الطالب",
    "التاريخ",
    "الحفظ من",
    "الحفظ إلى",
    "أخطاء الحفظ",
    "تقييم الحفظ",
    "المراجعة من",
    "المراجعة إلى",
    "أخطاء المراجعة",
    "تقييم المراجعة"
  ]);

  records.forEach(r => {
    const student = students.find(s => s.id === r.studentId);
    if (!student) return;

    rows.push([
      student.name,
      r.date,
      `${r.tahfidh.surahFrom} (${r.tahfidh.ayahFrom})`,
      `${r.tahfidh.surahTo} (${r.tahfidh.ayahTo})`,
      r.tahfidh.errors,
      r.tahfidh.rating,
      `${r.murajaah.surahFrom} (${r.murajaah.ayahFrom})`,
      `${r.murajaah.surahTo} (${r.murajaah.ayahTo})`,
      r.murajaah.errors,
      r.murajaah.rating
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tahfidh Records");

  const filename = `Tahfidh_${classId}_${new Date().toISOString().slice(0,7)}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
