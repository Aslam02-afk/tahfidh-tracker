// js/db.js
const DB_KEY        = "tahfidh_tracker_db";
const DB_BACKUP_KEY = "tahfidh_tracker_db_backup";   // auto-backup copy
const DB_BACKUP_TS  = "tahfidh_tracker_backup_ts";   // last backup timestamp
const DB_REMIND_KEY = "tahfidh_tracker_remind_ts";   // last reminder timestamp

// ── Core load/save ────────────────────────────────────────────────────────
function dbLoad() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return _tryEmergencyRestore();
  try {
    const parsed = JSON.parse(raw);
    // Sanity check — if parsed is empty but backup has data, restore
    const isEmpty = !parsed.halaqah?.length && !parsed.students?.length && !parsed.records?.length;
    if (isEmpty) return _tryEmergencyRestore();
    return parsed;
  } catch {
    return _tryEmergencyRestore();
  }
}

function dbSave(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  _autoBackup(data);
}

// ── Auto-backup on every save ─────────────────────────────────────────────
function _autoBackup(data) {
  try {
    localStorage.setItem(DB_BACKUP_KEY, JSON.stringify(data));
    localStorage.setItem(DB_BACKUP_TS, new Date().toISOString());
  } catch (e) {
    // localStorage full — try clearing old backup first
    try {
      localStorage.removeItem(DB_BACKUP_KEY);
      localStorage.setItem(DB_BACKUP_KEY, JSON.stringify(data));
      localStorage.setItem(DB_BACKUP_TS, new Date().toISOString());
    } catch {}
  }
}

// ── Emergency restore from backup if main key is wiped ───────────────────
function _tryEmergencyRestore() {
  const empty = { halaqah: [], students: [], records: [] };
  try {
    const raw = localStorage.getItem(DB_BACKUP_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    if (!parsed.halaqah || !parsed.students || !parsed.records) return empty;
    const hasData = parsed.halaqah.length || parsed.students.length || parsed.records.length;
    if (!hasData) return empty;
    // Restore main key from backup
    localStorage.setItem(DB_KEY, raw);
    console.warn('[DB] Main data was missing — restored from auto-backup ✅');
    _showRestoreNotice();
    return parsed;
  } catch {
    return empty;
  }
}

// ── Show a notice when auto-restore happens ───────────────────────────────
function _showRestoreNotice() {
  // Delay to let the page render first
  setTimeout(function() {
    const isAr = getLang && getLang() === 'ar';
    const msg = isAr
      ? '⚠️ تم استعادة بياناتك تلقائيًا من النسخة الاحتياطية.\nيُرجى تصدير نسخة احتياطية الآن من الإعدادات.'
      : '⚠️ Your data was automatically restored from backup.\nPlease export a backup now from Settings.';
    alert(msg);
  }, 1000);
}

// ── Weekly backup reminder ────────────────────────────────────────────────
function checkBackupReminder() {
  try {
    const last = localStorage.getItem(DB_REMIND_KEY);
    const now  = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    if (last && (now - parseInt(last)) < week) return;

    // Only remind if there's actual data
    const data = dbLoad();
    if (!data.students.length && !data.records.length) return;

    localStorage.setItem(DB_REMIND_KEY, String(now));

    const isAr = getLang && getLang() === 'ar';
    const msg = isAr
      ? '💾 تذكير: يُنصح بتصدير نسخة احتياطية من بياناتك أسبوعيًا.\nهل تريد الذهاب إلى الإعدادات الآن؟'
      : '💾 Reminder: It is recommended to export a backup weekly.\nGo to Settings now?';

    if (confirm(msg)) {
      window.location.href = 'settings.html';
    }
  } catch {}
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
  // Reset reminder timer after manual export
  localStorage.setItem(DB_REMIND_KEY, String(Date.now()));
}

function importDB(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed.halaqah || !parsed.students || !parsed.records) throw new Error('invalid');
    dbSave(parsed);
    return true;
  } catch { return false; }
}

// ===== Last auto-backup info (for settings page display) =====
function getLastBackupTime() {
  const ts = localStorage.getItem(DB_BACKUP_TS);
  if (!ts) return null;
  return new Date(ts);
}