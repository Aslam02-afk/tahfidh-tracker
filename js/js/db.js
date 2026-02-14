// js/db.js
const DB_KEY = "tahfidh_tracker_db";

function dbLoad() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return { halaqah: [], students: [], records: [] };
  try { return JSON.parse(raw); }
  catch { return { halaqah: [], students: [], records: [] }; }
}

function dbSave(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

// ===== Halaqah (Classes) =====
function getHalaqahById(classId) {
  return dbLoad().halaqah.find(h => h.id === classId) || null;
}

function saveClass(halaqah) {
  const data = dbLoad();
  const idx = data.halaqah.findIndex(h => h.id === halaqah.id);
  if (idx >= 0) data.halaqah[idx] = halaqah;
  else data.halaqah.push(halaqah);
  dbSave(data);
}

function deleteClass(classId) {
  const data = dbLoad();
  const studentIds = data.students.filter(s => s.classId === classId).map(s => s.id);
  data.halaqah  = data.halaqah.filter(h => h.id !== classId);
  data.students = data.students.filter(s => s.classId !== classId);
  data.records  = data.records.filter(r => !studentIds.includes(r.studentId));
  dbSave(data);
}

// ===== Students =====
function getStudentById(studentId) {
  return dbLoad().students.find(s => s.id === studentId) || null;
}

function getStudentsByClass(classId) {
  return dbLoad().students.filter(s => s.classId === classId);
}

function saveStudent(student) {
  const data = dbLoad();
  const idx = data.students.findIndex(s => s.id === student.id);
  if (idx >= 0) data.students[idx] = student;
  else data.students.push(student);
  dbSave(data);
}

function deleteStudent(studentId) {
  const data = dbLoad();
  data.students = data.students.filter(s => s.id !== studentId);
  data.records  = data.records.filter(r => r.studentId !== studentId);
  dbSave(data);
}

// ===== Records =====
function upsertDailyRecord(record) {
  const data = dbLoad();
  const key = `${record.studentId}_${record.date}`;
  const idx = data.records.findIndex(r => `${r.studentId}_${r.date}` === key);
  if (idx >= 0) data.records[idx] = record;
  else data.records.unshift(record);
  const s = data.students.find(x => x.id === record.studentId);
  if (s) s.lastUpdated = record.date;
  dbSave(data);
}

function getDailyRecord(studentId, date) {
  return dbLoad().records.find(
    r => r.studentId === studentId && r.date === date
  ) || null;
}

// ===== Attendance =====
function recordAttendance(studentId, date, status) {
  const data = dbLoad();
  const s = data.students.find(x => x.id === studentId);
  if (!s) return;
  if (!s.attendance) s.attendance = {};
  s.attendance[date] = status;
  s.absences = Object.values(s.attendance).filter(v => v === 'absent').length;
  s.late     = Object.values(s.attendance).filter(v => v === 'late').length;
  dbSave(data);
}

// ===== Backup / Restore =====
function exportDB() {
  const data = dbLoad();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `tahfidh_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

function importDB(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed.halaqah || !parsed.students || !parsed.records) throw new Error('invalid');
    dbSave(parsed);
    return true;
  } catch { return false; }
}
