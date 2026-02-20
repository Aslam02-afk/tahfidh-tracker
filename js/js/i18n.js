// js/i18n.js – Arabic / English translations

const LANG = {
  ar: {
    // Nav
    home: 'الرئيسية', settings: 'الإعدادات', contact: 'تواصل',
    students: 'الطلاب', records: 'السجلات', record: 'السجل',

    // Home
    appTitle: 'إدارة التحفيظ', appSub: 'Tahfidh Tracker',
    classes: 'الحلقات', addNewClass: 'إضافة حلقة جديدة',
    noClassesYet: 'لا توجد حلقات بعد',
    noClassesHint: 'اضغط الزر أدناه لإضافة أول حلقة',
    teacher: 'المعلم', student: 'طالب', progressToday: 'تقدم اليوم',
    edit: 'تعديل',
    confirmDeleteClass: 'حذف حلقة "$1"؟\nسيتم حذف جميع الطلاب والسجلات نهائياً.',

    // Class page
    teacherLabel: 'المعلم:', studentCount: 'عدد الطلاب',
    weeklyReport: 'تقرير أسبوعي', monthlyReport: 'تقرير شهري',
    exportExcel: 'تصدير Excel',
    searchStudent: 'بحث عن طالب', searchPlaceholder: 'اكتب اسم الطالب...',
    noStudents: 'لا يوجد طلاب في هذه الحلقة', noResults: 'لا توجد نتائج',
    absences: 'غياب', late: 'تأخر',
    recordedToday: 'سُجِّل اليوم', notRecorded: 'لم يُسجَّل اليوم',
    absent: 'غائب', lateLabel: 'متأخر', present: 'حاضر',
    openRecord: 'سجل الطالب', noStudentsAlert: 'لا يوجد طلاب',
    confirmDeleteStudent: 'حذف الطالب "$1"؟\nسيتم حذف جميع سجلاته.',

    // Record page
    studentRecord: 'سجل الطالب', date: 'التاريخ',
    tahfidh: 'الحفظ (Tahfidh)', murajaah: 'المراجعة (Murājaʿah)',
    fromSurah: 'من سورة', toSurah: 'إلى سورة',
    fromAyah: 'من آية', toAyah: 'إلى آية',
    errors: 'عدد الأخطاء', rating: 'التقييم',
    saveRecord: 'حفظ سجل اليوم', savedAlert: 'تم حفظ السجل',
    chooseSurah: '-- اختر السورة --',
    excellent: 'ممتاز', veryGood: 'جيد جدًا', good: 'جيد', weak: 'ضعيف',

    // Add class
    addClassTitle: 'إضافة حلقة جديدة', editClassTitle: 'تعديل الحلقة',
    className: 'اسم الحلقة', teacherName: 'اسم المعلم',
    teacherGender: 'جنس المعلم', teacherGenderMale: 'معلم', teacherGenderFemale: 'معلمة',
    classTime: 'وقت الحلقة', classTimeMorning: 'صباحي', classTimeEvening: 'مسائي',
    notes: 'ملاحظات (اختياري)',
    classNamePh: 'مثال: الصفوف الأولية', teacherPh: 'مثال: عبدالله',
    notesPh: 'أي معلومات إضافية...',
    saveClass: 'حفظ الحلقة', deleteClass: 'حذف الحلقة',
    enterClassName: 'يرجى إدخال اسم الحلقة',
    confirmDeleteClassFull: 'حذف حلقة "$1"؟\nسيتم حذف جميع الطلاب والسجلات.',

    // Add student
    addStudentTitle: 'إضافة طالب', editStudentTitle: 'تعديل بيانات الطالب',
    studentName: 'اسم الطالب', gender: 'الجنس',
    male: 'ذكر', female: 'أنثى',
    phone: 'رقم الهاتف (اختياري)', lastSurah: 'آخر سورة محفوظة',
    fullNamePh: 'الاسم الكامل', phonePh: '+966...',
    saveStudent: 'حفظ الطالب', deleteStudent: 'حذف الطالب',
    enterStudentName: 'يرجى إدخال اسم الطالب',
    confirmDeleteStudentFull: 'حذف الطالب "$1"؟\nسيتم حذف جميع سجلاته.',

    // Settings
    settingsTitle: 'الإعدادات',
    appearance: 'المظهر', darkMode: 'الوضع الليلي',
    darkModeDesc: 'خلفية داكنة تريح العيون',
    enable: 'تفعيل', disable: 'إيقاف',
    langSection: 'اللغة', langLabel: 'لغة التطبيق',
    langDesc: 'تغيير لغة الواجهة والتقارير',
    backup: 'النسخ الاحتياطي',
    exportData: 'تصدير البيانات (JSON)',
    importLabel: 'استيراد نسخة احتياطية',
    importData: 'استيراد البيانات',
    danger: 'خطر', clearAll: 'مسح جميع البيانات',
    clearWarning: 'سيتم حذف جميع الحلقات والطلاب والسجلات بشكل نهائي',
    contactSection: 'التواصل', contactBtn: 'تواصل مع برنامج الهدى',
    selectFile: 'يرجى اختيار ملف JSON',
    importSuccess: 'تم استيراد البيانات بنجاح',
    importFail: 'فشل الاستيراد. تأكد من أن الملف صحيح.',
    clearConfirm: 'هل أنت متأكد؟\nسيتم حذف جميع البيانات نهائياً ولا يمكن التراجع.',
    clearDone: 'تم مسح جميع البيانات.',

    // Contact
    contactTitle: 'التواصل مع برنامج الهدى',
    contactIntro: 'إذا كان لديك اقتراح، مشكلة تقنية، أو طلب خاص، يسعدنا تواصلك مع',
    contactHudaa: 'برنامج الهدى',
    contactNameLabel: 'اسم المعلم (اختياري)', contactNamePh: 'اكتب اسمك',
    contactSubject: 'الموضوع',
    subSuggestion: 'اقتراح تطوير', subBug: 'مشكلة تقنية',
    subData: 'استفسار عن البيانات', subSupport: 'طلب دعم', subOther: 'أخرى',
    contactMsg: 'الرسالة', contactMsgPh: 'اكتب رسالتك هنا...',
    sendMsg: 'إرسال الرسالة',
    emailNote: 'سيتم فتح تطبيق البريد الإلكتروني لإرسال الرسالة مباشرة',
    emptyMsg: 'يرجى كتابة الرسالة قبل الإرسال',
    emailTeacher: 'اسم المعلم', emailMessage: 'الرسالة',
    emailSent: 'تم الإرسال من تطبيق Tahfidh Tracker',
    notMentioned: 'غير مذكور',

    // Add class (extra keys for HTML data-i18n)
    teacherNameLabel: 'اسم المعلم', teacherNamePh: 'مثال: عبدالله',
    notesOptional: 'ملاحظات (اختياري)',

    // Add student (extra keys)
    addStudent: 'إضافة طالب', studentNameLabel: 'اسم الطالب *',
    studentNamePh: 'الاسم الكامل', phoneOptional: 'رقم الهاتف (اختياري)',
    courseLabel: 'المسار', courseHifdh: 'حفظ', courseTalqin: 'تلقين', courseMurajaah: 'مراجعة',

    // Record page (extra)
    noHifdhToday: 'لا يوجد حفظ اليوم', hifdhOff: 'الحفظ مُعطّل اليوم',

    // Settings (extra keys for HTML data-i18n)
    languageSection: 'اللغة', languageLabel: 'لغة التطبيق',
    languageDesc: 'عربي أو إنجليزي',
    appearanceSection: 'المظهر', darkModeLabel: 'الوضع الليلي',
    backupSection: 'النسخ الاحتياطي', importBackup: 'استيراد نسخة احتياطية',
    dangerSection: 'خطر', clearAllData: 'مسح جميع البيانات',
    contactAlHudaa: 'تواصل مع برنامج الهدى',
    v13notes: 'قارئ القرآن — اختبارات الطلاب — تقارير إسلامية محسّنة — أيقونات مخصصة',
    v12notes: 'دعم اللغة الإنجليزية — تقارير ثنائية اللغة للأولياء',
    v11notes: 'حفظ ومراجعة مع قائمة 114 سورة — تقارير أسبوعية وشهرية — الوضع الليلي — نسخ احتياطي — تسجيل الحضور',
    v10notes: 'الإصدار الأول: إدارة الحلقات والطلاب وتصدير Excel',

    // Contact (extra keys for HTML data-i18n)
    contactUsTitle: 'تواصل معنا',
    contactUsDesc: 'إذا كان لديك اقتراح، مشكلة تقنية، أو طلب خاص، يسعدنا تواصلك مع برنامج الهدى.',
    teacherNameOptional: 'اسم المعلم (اختياري)',
    teacherNameContactPh: 'اكتب اسمك',
    subject: 'الموضوع', message: 'الرسالة',
    subjectSuggestion: 'اقتراح تطوير', subjectBug: 'مشكلة تقنية',
    subjectDataInquiry: 'استفسار عن البيانات', subjectSupport: 'طلب دعم', subjectOther: 'أخرى',
    messagePh: 'اكتب رسالتك هنا...',
    sendMessage: 'إرسال الرسالة',
    pleaseWriteMessage: 'يرجى كتابة الرسالة قبل الإرسال',
    teacherNameEmail: 'اسم المعلم', messageEmail: 'الرسالة',
    sentFromApp: 'تم الإرسال من تطبيق Tahfidh Tracker',

    // Dates
    hijriDate: 'التاريخ الهجري', gregorianDate: 'التاريخ الميلادي',

    // About
    aboutTitle: 'برنامج الهدى | Al Hudaa Program', aboutSub: 'Al Hudaa Program',
    aboutDesc: 'تطبيق إدارة التحفيظ لمساعدة معلمي القرآن في متابعة بيانات الطلاب وتسجيل الحفظ والمراجعة اليومية',
    aboutDescEn: 'Designed to help Quran teachers track student progress, record daily memorization & revision, and send reports to parents.',
    whatsNew: 'ما الجديد | What\'s New',
    footer: 'Made by Al Hudaa Program | صُنع بواسطة برنامج الهدى',

    // Reports
    rptWeekly: 'تقرير أسبوعي', rptMonthly: 'تقرير شهري',
    rptStudent: 'الطالب:', rptNoRecords: 'لا توجد سجلات هذا الأسبوع.',
    rptTahfidh: 'حفظ:', rptErrors: 'أخطاء الحفظ:',
    rptRating: 'تقييم:', rptMurajaah: 'مراجعة:', rptMurajaahErrors: 'أخطاء:',
    rptTotalErrors: 'إجمالي أخطاء الحفظ:', rptDays: 'أيام التسجيل:',
    rptAbsences: 'غياب:', rptLate: 'تأخر:',
    rptErrorsSuffix: 'أخطاء', rptSignature: '— Tahfidh Tracker | برنامج الهدى',

    noExportData: 'لا توجد بيانات للتصدير',

    // Exam fields
    examJuzCount: 'عدد أجزاء الاختبار',
    examPercentage: 'نسبة الاختبار %',
    examNotes: 'ملاحظات الاختبار',
    examJuzPh: 'مثال: 3',
    examPercentPh: 'مثال: 85',
    examNotesPh: 'ملاحظات عن أداء الطالب في الاختبار...',

    // Report format
    rptGreeting: 'السلام عليكم ورحمة الله وبركاته',
    rptIntro: 'يسرنا مشاركة التقرير الأسبوعي للطالب:',
    rptNewMemorization: 'الحفظ الجديد:',
    rptRevision: 'المراجعة:',
    rptFrom: 'من',
    rptTo: 'إلى',
    rptWeeklyRating: 'التقييم الأسبوعي:',
    rptClosing: 'نسأل الله أن يبارك في حفظه ويثبته ويجعله من أهل القرآن.',
    rptBarakallah: 'بارك الله فيكم.',
    rptClassName: '—',

    // Student Detail
    studentDetail: 'بيانات الطالب',
    studentInfo: 'معلومات الطالب',
    phoneLabel: 'الهاتف',
    lastSurahLabel: 'آخر سورة محفوظة',
    notesLabel: 'ملاحظات',
    noPhone: 'غير مسجل',
    noNotes: 'لا توجد ملاحظات',
    noLastSurah: 'غير محدد',
    attendanceSummary: 'ملخص الحضور',
    totalAbsences: 'إجمالي الغياب',
    totalLate: 'إجمالي التأخر',
    examInfo: 'بيانات الاختبار',
    examJuz: 'أجزاء الاختبار',
    examPercent: 'نسبة الاختبار',
    recentRecords: 'آخر السجلات',
    noRecordsYet: 'لا توجد سجلات بعد',
    sendWeeklyReport: 'إرسال تقرير أسبوعي لولي الأمر',
    sendMonthlyReport: 'إرسال تقرير شهري لولي الأمر',
    editStudent: 'تعديل بيانات الطالب',
    newMemorization: 'حفظ جديد',
    revision: 'مراجعة',

    // Theme Picker
    themeSection: 'خلفية التطبيق',
    themeNone: 'بلا خلفية', themeArabic: 'أنماط عربية',
    themeFlower: 'أزهار', themeBg: 'خلفية كاملة',

    // Share
    shareSection: 'شارك التطبيق',
    shareDesc: 'شارك Tahfidh Tracker مع المعلمين والزملاء',
    shareBtn: 'مشاركة التطبيق',
    shareCopied: 'تم نسخ الرابط!',

    // Quran Reader
    quran: 'القرآن', quranTitle: 'القرآن الكريم', quranSubtitle: 'تلاوة وقراءة',
    allJuz: 'كل الأجزاء', ayahs: 'آية', loadingQuran: 'جاري تحميل القرآن...',
    quranLoadError: 'فشل تحميل بيانات القرآن. يرجى المحاولة مرة أخرى.',
    quranLoadError: 'فشل تحميل بيانات القرآن. يرجى المحاولة مرة أخرى.',

// Rate Us
rateSectionTitle: "قيّمنا",
rateCardTitle: "قيّم التطبيق",
rateCardSubtitle: "ساعدنا في تحسين Tahfidh Tracker",
rateModalTitle: "قيّم Tahfidh Tracker",
rateNamePh: "الاسم (اختياري)",
rateMsgPh: "اقتراحات / كيف يمكننا التحسين؟ (اختياري)",
send: "إرسال",
cancel: "إلغاء",
ok: "حسنًا",
selectRating: "اختر عدد النجوم أولاً",
thankTitle: "شكرًا لك!",
thankMsg: "شكرًا لتقييمك.",
},

  en: {
    // Nav
    home: 'Home', settings: 'Settings', contact: 'Contact',
    students: 'Students', records: 'Records', record: 'Record',

    // Home
    appTitle: 'Tahfidh Management', appSub: 'Tahfidh Tracker',
    classes: 'Classes', addNewClass: 'Add New Class',
    noClassesYet: 'No classes yet',
    noClassesHint: 'Tap the button below to add your first class',
    teacher: 'Teacher', student: 'student', progressToday: 'Today\'s progress',
    edit: 'Edit',
    confirmDeleteClass: 'Delete class "$1"?\nAll students and records will be permanently deleted.',

    // Class page
    teacherLabel: 'Teacher:', studentCount: 'Students',
    weeklyReport: 'Weekly Report', monthlyReport: 'Monthly Report',
    exportExcel: 'Export Excel',
    searchStudent: 'Search student', searchPlaceholder: 'Type student name...',
    noStudents: 'No students in this class', noResults: 'No results found',
    absences: 'Absences', late: 'Late',
    recordedToday: 'Recorded today', notRecorded: 'Not recorded today',
    absent: 'Absent', lateLabel: 'Late', present: 'Present',
    openRecord: 'Open Record', noStudentsAlert: 'No students',
    confirmDeleteStudent: 'Delete student "$1"?\nAll records will be deleted.',

    // Record page
    studentRecord: 'Student Record', date: 'Date',
    tahfidh: 'Tahfidh (Memorization)', murajaah: 'Murājaʿah (Revision)',
    fromSurah: 'From Surah', toSurah: 'To Surah',
    fromAyah: 'From Ayah', toAyah: 'To Ayah',
    errors: 'Errors', rating: 'Rating',
    saveRecord: 'Save Today\'s Record', savedAlert: 'Record saved',
    chooseSurah: '-- Choose Surah --',
    excellent: 'Excellent', veryGood: 'Very Good', good: 'Good', weak: 'Weak',

    // Add class
    addClassTitle: 'Add New Class', editClassTitle: 'Edit Class',
    className: 'Class Name', teacherName: 'Teacher Name',
    teacherGender: 'Teacher Gender', teacherGenderMale: 'Male', teacherGenderFemale: 'Female',
    classTime: 'Class Time', classTimeMorning: 'Morning', classTimeEvening: 'Evening',
    notes: 'Notes (optional)',
    classNamePh: 'e.g. Beginners Class', teacherPh: 'e.g. Abdullah',
    notesPh: 'Any additional info...',
    saveClass: 'Save Class', deleteClass: 'Delete Class',
    enterClassName: 'Please enter class name',
    confirmDeleteClassFull: 'Delete class "$1"?\nAll students and records will be deleted.',

    // Add student
    addStudentTitle: 'Add Student', editStudentTitle: 'Edit Student',
    studentName: 'Student Name', gender: 'Gender',
    male: 'Male', female: 'Female',
    phone: 'Phone (optional)', lastSurah: 'Last Memorized Surah',
    fullNamePh: 'Full name', phonePh: '+966...',
    saveStudent: 'Save Student', deleteStudent: 'Delete Student',
    enterStudentName: 'Please enter student name',
    confirmDeleteStudentFull: 'Delete student "$1"?\nAll records will be deleted.',

    // Settings
    settingsTitle: 'Settings',
    appearance: 'Appearance', darkMode: 'Dark Mode',
    darkModeDesc: 'Dark background easy on the eyes',
    enable: 'Enable', disable: 'Disable',
    langSection: 'Language', langLabel: 'App Language',
    langDesc: 'Change interface and report language',
    backup: 'Backup & Restore',
    exportData: 'Export Data (JSON)',
    importLabel: 'Import Backup',
    importData: 'Import Data',
    danger: 'Danger Zone', clearAll: 'Clear All Data',
    clearWarning: 'All classes, students and records will be permanently deleted',
    contactSection: 'Contact', contactBtn: 'Contact Al Hudaa Program',
    selectFile: 'Please select a JSON file',
    importSuccess: 'Data imported successfully',
    importFail: 'Import failed. Make sure the file is valid.',
    clearConfirm: 'Are you sure?\nAll data will be permanently deleted and cannot be undone.',
    clearDone: 'All data has been cleared.',

    // Contact
    contactTitle: 'Contact Al Hudaa Program',
    contactIntro: 'If you have a suggestion, technical issue, or special request, we\'d love to hear from',
    contactHudaa: 'Al Hudaa Program',
    contactNameLabel: 'Teacher name (optional)', contactNamePh: 'Enter your name',
    contactSubject: 'Subject',
    subSuggestion: 'Feature suggestion', subBug: 'Technical issue',
    subData: 'Data inquiry', subSupport: 'Support request', subOther: 'Other',
    contactMsg: 'Message', contactMsgPh: 'Write your message here...',
    sendMsg: 'Send Message',
    emailNote: 'This will open your email app to send the message',
    emptyMsg: 'Please write a message before sending',
    emailTeacher: 'Teacher', emailMessage: 'Message',
    emailSent: 'Sent from Tahfidh Tracker app',
    notMentioned: 'Not mentioned',

    // Add class (extra keys)
    teacherNameLabel: 'Teacher Name', teacherNamePh: 'e.g. Abdullah',
    notesOptional: 'Notes (optional)',

    // Add student (extra keys)
    addStudent: 'Add Student', studentNameLabel: 'Student Name *',
    studentNamePh: 'Full name', phoneOptional: 'Phone (optional)',
    courseLabel: 'Course', courseHifdh: 'Hifdh', courseTalqin: 'Talqin', courseMurajaah: 'Murajaah',

    // Record page (extra)
    noHifdhToday: 'No Hifdh Today', hifdhOff: 'Hifdh is off today',

    // Settings (extra keys)
    languageSection: 'Language', languageLabel: 'App Language',
    languageDesc: 'Arabic or English',
    appearanceSection: 'Appearance', darkModeLabel: 'Dark Mode',
    backupSection: 'Backup & Restore', importBackup: 'Import Backup',
    dangerSection: 'Danger Zone', clearAllData: 'Clear All Data',
    contactAlHudaa: 'Contact Al Hudaa Program',
    v13notes: 'Quran reader — Student exams — Enhanced Islamic reports — Custom icons',
    v12notes: 'English language support — Bilingual reports for parents',
    v11notes: 'Tahfidh & revision with 114 surahs — Weekly & monthly reports — Dark mode — Backup — Attendance',
    v10notes: 'First release: Class & student management, Excel export',

    // Contact (extra keys)
    contactUsTitle: 'Contact Us',
    contactUsDesc: 'If you have a suggestion, technical issue, or special request, we\'d love to hear from Al Hudaa Program.',
    teacherNameOptional: 'Teacher name (optional)',
    teacherNameContactPh: 'Enter your name',
    subject: 'Subject', message: 'Message',
    subjectSuggestion: 'Feature suggestion', subjectBug: 'Technical issue',
    subjectDataInquiry: 'Data inquiry', subjectSupport: 'Support request', subjectOther: 'Other',
    messagePh: 'Write your message here...',
    sendMessage: 'Send Message',
    pleaseWriteMessage: 'Please write a message before sending',
    teacherNameEmail: 'Teacher', messageEmail: 'Message',
    sentFromApp: 'Sent from Tahfidh Tracker app',

    // Dates
    hijriDate: 'Hijri Date', gregorianDate: 'Gregorian Date',

    // About
    aboutTitle: 'Al Hudaa Program | برنامج الهدى', aboutSub: 'برنامج الهدى',
    aboutDesc: 'Designed to help Quran teachers track student progress, record daily memorization & revision, and send reports to parents.',
    aboutDescEn: 'تطبيق إدارة حلقات التحفيظ مصمم لمساعدة المعلمين في متابعة بيانات الطلاب.',
    whatsNew: 'What\'s New',
    footer: 'Made by Al Hudaa Program',

    // Reports
    rptWeekly: 'Weekly Report', rptMonthly: 'Monthly Report',
    rptStudent: 'Student:', rptNoRecords: 'No records this week.',
    rptTahfidh: 'Tahfidh:', rptErrors: 'Tahfidh errors:',
    rptRating: 'Rating:', rptMurajaah: 'Revision:', rptMurajaahErrors: 'errors:',
    rptTotalErrors: 'Total tahfidh errors:', rptDays: 'Days recorded:',
    rptAbsences: 'Absences:', rptLate: 'Late:',
    rptErrorsSuffix: 'errors', rptSignature: '— Tahfidh Tracker | Al Hudaa Program',

    noExportData: 'No data to export',

    // Exam fields
    examJuzCount: 'Exam Juz Count',
    examPercentage: 'Exam Percentage %',
    examNotes: 'Exam Notes',
    examJuzPh: 'e.g. 3',
    examPercentPh: 'e.g. 85',
    examNotesPh: 'Notes about exam performance...',

    // Report format
    rptGreeting: 'Assalamu \'alaykum wa rahmatullahi wa barakatuh,',
    rptIntro: 'We are pleased to share the weekly progress report of the student:',
    rptNewMemorization: 'New Memorization (Tahfidh):',
    rptRevision: 'Revision (Muraja\'ah):',
    rptFrom: 'From',
    rptTo: 'to',
    rptWeeklyRating: 'Weekly Rating:',
    rptClosing: 'Alhamdulillah, the student is showing good effort. We ask Allah to bless his learning and make him among Ahlul-Qur\'an.',
    rptBarakallah: 'Barakallahu feekum.',
    rptClassName: '—',

    // Student Detail
    studentDetail: 'Student Details',
    studentInfo: 'Student Information',
    phoneLabel: 'Phone',
    lastSurahLabel: 'Last Memorized Surah',
    notesLabel: 'Notes',
    noPhone: 'Not registered',
    noNotes: 'No notes',
    noLastSurah: 'Not specified',
    attendanceSummary: 'Attendance Summary',
    totalAbsences: 'Total Absences',
    totalLate: 'Total Late',
    examInfo: 'Exam Information',
    examJuz: 'Exam Juz',
    examPercent: 'Exam Percentage',
    recentRecords: 'Recent Records',
    noRecordsYet: 'No records yet',
    sendWeeklyReport: 'Send Weekly Report to Parent',
    sendMonthlyReport: 'Send Monthly Report to Parent',
    editStudent: 'Edit Student',
    newMemorization: 'New Memorization',
    revision: 'Revision',

    // Theme Picker
    themeSection: 'App Background',
    themeNone: 'None', themeArabic: 'Arabic Patterns',
    themeFlower: 'Flowers', themeBg: 'Full Background',

    // Share
    shareSection: 'Share the App',
    shareDesc: 'Share Tahfidh Tracker with teachers and colleagues',
    shareBtn: 'Share App',
    shareCopied: 'Link copied!',

    // Quran Reader
    quran: 'Quran', quranTitle: 'The Noble Quran', quranSubtitle: 'Quran Reader',
    allJuz: 'All Juz', ayahs: 'Ayahs', loadingQuran: 'Loading Quran...',
    quranLoadError: 'Failed to load Quran data. Please try again.',
    quranLoadError: 'Failed to load Quran data. Please try again.',

// Rate Us
rateSectionTitle: "Rate Us",
rateCardTitle: "Rate the App",
rateCardSubtitle: "Help us improve Tahfidh Tracker",
rateModalTitle: "Rate Tahfidh Tracker",
rateNamePh: "Name (optional)",
rateMsgPh: "Recommendation / How can we improve? (optional)",
send: "Send",
cancel: "Cancel",
ok: "OK",
selectRating: "Please select a rating first",
thankTitle: "Thank You!",
thankMsg: "Thank you for your rating.",
}

};

function getLang() { return localStorage.getItem('appLang') || 'ar'; }
function t(key) { return (LANG[getLang()] || LANG.ar)[key] || (LANG.ar)[key] || key; }

function setLang(lang) {
  localStorage.setItem('appLang', lang);
  applyLang();
}

function toggleLang() {
  setLang(getLang() === 'ar' ? 'en' : 'ar');
  // Re-render dynamic content if functions exist
  if (typeof renderClasses === 'function') renderClasses();
  if (typeof renderPage === 'function') renderPage();
  if (typeof renderQuranPage === 'function') renderQuranPage();
}

function applyLang() {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr';

  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Update all data-i18n-ph (placeholder)
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });

  // Update all data-i18n-html
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });

  // Update lang toggle button
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'ar' ? 'EN' : 'ع';
}

// Auto-apply on load
applyLang();
