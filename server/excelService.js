const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_PATH = path.join(__dirname, 'data', 'database.xlsx');

class ExcelService {
  constructor() {
    this.workbook = null;
    this.dataVersion = 0; // Increments on every data reload so frontends can detect changes
    this._fileWatcher = null;
    this._reloadDebounce = null;
    this.lastLoadedMtime = 0;
    this.db = {
      users: [
        { id: 'A001', name: 'Admin', role: 'Admin', username: 'admin', password: 'password123' },
        { id: 'T101', name: 'Maria Santos', role: 'Teacher', gradeLevel: 'Grade 1', section: 'Mabini', username: 'teacher_maria', password: 'password123' },
        { id: 'S201', name: 'Juan Dela Cruz', role: 'Student', gradeLevel: 'Grade 1', section: 'Mabini', username: 'student_juan', password: 'password123' }
      ],
      classrooms: [],
      students: [
        {
          id: 'S201', lrn: '109876543210', name: 'Juan Dela Cruz', gender: 'Male',
          gradeLevel: 'Grade 1', section: 'Mabini', status: 'Enrolled',
          grades: {
            Math: { q1: 72, q2: 75, q3: null, q4: null },
            Science: { q1: 82, q2: 85, q3: null, q4: null },
            English: { q1: 90, q2: 92, q3: null, q4: null },
            Filipino: { q1: 88, q2: 87, q3: null, q4: null },
            MAPEH: { q1: 89, q2: 91, q3: null, q4: null },
            Makabayan: { q1: 86, q2: 89, q3: null, q4: null }
          }
        },
        {
          id: 'S202', lrn: '109876543211', name: 'Ana Reyes', gender: 'Female',
          gradeLevel: 'Grade 1', section: 'Mabini', status: 'Enrolled',
          grades: {
            Math: { q1: 90, q2: 92, q3: null, q4: null },
            Science: { q1: 88, q2: 90, q3: null, q4: null },
            English: { q1: 95, q2: 94, q3: null, q4: null },
            Filipino: { q1: 92, q2: 91, q3: null, q4: null },
            MAPEH: { q1: 93, q2: 91, q3: null, q4: null },
            Makabayan: { q1: 89, q2: 90, q3: null, q4: null }
          }
        },
        {
          id: 'S203', lrn: '109876543212', name: 'Pedro Penduko', gender: 'Male',
          gradeLevel: 'Grade 1', section: 'Mabini', status: 'Dropped',
          grades: {
            Math: { q1: 75, q2: null, q3: null, q4: null },
            Science: { q1: 78, q2: null, q3: null, q4: null },
            English: { q1: 74, q2: null, q3: null, q4: null },
            Filipino: { q1: 76, q2: null, q3: null, q4: null },
            MAPEH: { q1: 81, q2: null, q3: null, q4: null },
            Makabayan: { q1: 80, q2: null, q3: null, q4: null }
          }
        }
      ],
      announcements: [
        {
          id: 1, title: 'Welcome to S.Y. 2025-2026!', date: '2025-08-01',
          content: 'Welcome to the new school year at Valdez Elementary School. Let\'s make this year a great one!',
          target: 'All'
        },
        {
          id: 2, title: 'PTA Meeting for Grade 1', date: '2025-09-15',
          content: 'There will be a PTA meeting for all Grade 1 parents on Friday at 3:00 PM.',
          target: 'Grade 1'
        }
      ],
      schoolData: {
        totalStudents: 0,
        activeTeachers: 0,
      },
      // New: all school years parsed from database.xlsx
      schoolYears: {}
    };
    this.loadData();
    this._watchFile();
  }

  // Watch parent directory for database.xlsx changes to avoid breaking during Excel's atomic swaps
  _watchFile() {
    const dir = path.dirname(EXCEL_PATH);
    if (!fs.existsSync(dir)) return;
    try {
      this._fileWatcher = fs.watch(dir, (eventType, filename) => {
        if (filename === 'database.xlsx') {
          // Debounce: Excel often fires multiple change events when saving
          clearTimeout(this._reloadDebounce);
          this._reloadDebounce = setTimeout(() => {
            console.log('[Auto-Reload] database.xlsx changed externally, reloading data...');
            try {
              this.loadData();
              this.dataVersion++;
              console.log(`[Auto-Reload] Data reloaded successfully. Version: ${this.dataVersion}`);
            } catch (err) {
              console.error('[Auto-Reload] Failed to reload data:', err.message);
            }
          }, 1000);
        }
      });
      console.log('[File Watcher] Watching database directory for changes.');
    } catch (err) {
      console.error('[File Watcher] Could not watch database directory:', err.message);
    }
  }

  getDataVersion() {
    this._checkReload();
    return this.dataVersion;
  }

  loadData() {
    if (!fs.existsSync(EXCEL_PATH)) {
      console.error(`Excel file not found at ${EXCEL_PATH}`);
      return;
    }
    
    try {
      this.lastLoadedMtime = fs.statSync(EXCEL_PATH).mtimeMs;
    } catch (e) {
      this.lastLoadedMtime = Date.now();
    }
    
    this.workbook = xlsx.readFile(EXCEL_PATH);
    const sheetNames = this.workbook.SheetNames;
    const summarySheetName = sheetNames.includes('VALDEZ ES') ? 'VALDEZ ES' : sheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(this.workbook.Sheets[summarySheetName], { header: 1 });

    const schoolYears = {};
    let currentSY = null;
    let parsingGrades = false;

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) {
        parsingGrades = false;
        continue;
      }

      const firstCell = String(row[0] || '').trim();

      // Detect school year header like "S.Y. 2025-2026"
      if (firstCell.startsWith('S.Y.')) {
        currentSY = firstCell;
        schoolYears[currentSY] = {
          schoolYear: currentSY,
          classrooms: [],
          totalStudents: 0,
          totalRepeaters: 0,
          totalDropouts: 0,
          totalTeachers: 0,
          totalSeats: 0
        };
        continue;
      }

      // Detect header row
      if (firstCell === 'GRADE LEVEL' && currentSY) {
        parsingGrades = true;
        continue;
      }

      // Parse grade rows
      if (parsingGrades && currentSY) {
        if (firstCell === 'TOTAL') {
          schoolYears[currentSY].totalStudents = Number(row[1]) || 0;
          schoolYears[currentSY].totalRepeaters = Number(row[2]) || 0;
          schoolYears[currentSY].totalDropouts = Number(row[3]) || 0;
          schoolYears[currentSY].totalTeachers = Number(row[6]) || 0;
          parsingGrades = false;
          continue;
        }
        if (firstCell === 'RELIEVING TEACHER') {
          continue;
        }
        if (firstCell) {
          // Normalize casing: "KINDER" -> "Kinder", "GRADE 1" -> "Grade 1"
          const normalizedGrade = firstCell.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
          const GRADE_SECTIONS = {
            'Kinder': 'Section A',
            'Grade 1': 'Mabini',
            'Grade 2': 'Rizal',
            'Grade 3': 'Del Pilar',
            'Grade 4': 'Aguinaldo',
            'Grade 5': 'Gomez',
            'Grade 6': 'Sampaguita'
          };
          const defaultSection = GRADE_SECTIONS[normalizedGrade] || normalizedGrade;

          schoolYears[currentSY].classrooms.push({
            gradeLevel: normalizedGrade,
            enrollment: Number(row[1]) || 0,
            repeaters: Number(row[2]) || 0,
            dropouts: Number(row[3]) || 0,
            section: defaultSection,
            classrooms: String(row[4] || ''),
            seats: String(row[5] || ''),
            teachers: Number(row[6]) || 0
          });
        }
      }
    }

    this.db.schoolYears = schoolYears;

    // Load 'Users' sheet if present in Excel
    if (sheetNames.includes('Users')) {
      const usersSheet = this.workbook.Sheets['Users'];
      this.db.users = xlsx.utils.sheet_to_json(usersSheet).map(u => {
        let sec = u.section;
        if (sec === '2 (8x6)' || sec === 'Grade 1') sec = 'Mabini';
        if (sec === '2 (7x6)' || sec === 'Grade 6') sec = 'Sampaguita';
        if (sec === '3 (6x7)' || sec === 'Kinder') sec = 'Section A';
        return { ...u, section: sec || '' };
      });
    }
    
    // Load 'Students' sheet if present in Excel (with grade mapping)
    if (sheetNames.includes('Students')) {
      const studentsSheet = this.workbook.Sheets['Students'];
      const rawStudents = xlsx.utils.sheet_to_json(studentsSheet);
      this.db.students = rawStudents.map(s => {
        const getGrade = (subj, q) => {
          const val = s[`${subj}_${q.toUpperCase()}`] !== undefined ? s[`${subj}_${q.toUpperCase()}`] : s[`${subj}_${q.toLowerCase()}`];
          return val === '' || val === undefined ? null : Number(val);
        };
        const grades = {
          Math: { q1: getGrade('Math', 'q1'), q2: getGrade('Math', 'q2'), q3: getGrade('Math', 'q3'), q4: getGrade('Math', 'q4') },
          Science: { q1: getGrade('Science', 'q1'), q2: getGrade('Science', 'q2'), q3: getGrade('Science', 'q3'), q4: getGrade('Science', 'q4') },
          English: { q1: getGrade('English', 'q1'), q2: getGrade('English', 'q2'), q3: getGrade('English', 'q3'), q4: getGrade('English', 'q4') },
          Filipino: { q1: getGrade('Filipino', 'q1'), q2: getGrade('Filipino', 'q2'), q3: getGrade('Filipino', 'q3'), q4: getGrade('Filipino', 'q4') },
          MAPEH: { q1: getGrade('MAPEH', 'q1'), q2: getGrade('MAPEH', 'q2'), q3: getGrade('MAPEH', 'q3'), q4: getGrade('MAPEH', 'q4') },
          Makabayan: { q1: getGrade('Makabayan', 'q1'), q2: getGrade('Makabayan', 'q2'), q3: getGrade('Makabayan', 'q3'), q4: getGrade('Makabayan', 'q4') }
        };
        
        let sec = s.section;
        if (sec === '2 (8x6)' || sec === 'Grade 1') sec = 'Mabini';
        if (sec === '2 (7x6)' || sec === 'Grade 6') sec = 'Sampaguita';
        if (sec === '3 (6x7)' || sec === 'Kinder') sec = 'Section A';
        
        return {
          id: String(s.id),
          lrn: String(s.lrn),
          name: s.name,
          gender: s.gender,
          gradeLevel: s.gradeLevel,
          section: sec || '',
          status: s.status,
          parentName: s.parentName || '',
          grades
        };
      });
    }

    // Load 'Announcements' sheet if present in Excel
    if (sheetNames.includes('Announcements')) {
      const annSheet = this.workbook.Sheets['Announcements'];
      this.db.announcements = xlsx.utils.sheet_to_json(annSheet);
    }

    // Set the "current" year data as the default (most recent)
    const yearKeys = Object.keys(schoolYears).sort().reverse();
    if (yearKeys.length > 0) {
      const latest = schoolYears[yearKeys[0]];
      this.db.classrooms = latest.classrooms;
      
      // Update high level metrics to match the actual students database if it has data
      if (this.db.students.length > 0) {
        this.recalculateSummaries();
      } else {
        this.db.schoolData = {
          totalStudents: latest.totalStudents,
          activeTeachers: latest.totalTeachers,
        };
      }
    }

    console.log(`Excel data loaded: ${yearKeys.length} school years parsed. ${this.db.students.length} students loaded.`);
  }

  recalculateSummaries() {
    const yearKeys = Object.keys(this.db.schoolYears).sort().reverse();
    if (yearKeys.length === 0) return;
    const currentSY = yearKeys[0];
    const syData = this.db.schoolYears[currentSY];
    
    // Calculate total students, repeaters, dropouts as the sum of classrooms parsed from Excel
    let totalStudents = 0;
    let totalRepeaters = 0;
    let totalDropouts = 0;
    
    for (const room of syData.classrooms) {
      totalStudents += room.enrollment || 0;
      totalRepeaters += room.repeaters || 0;
      totalDropouts += room.dropouts || 0;
    }
    
    syData.totalStudents = totalStudents;
    syData.totalRepeaters = totalRepeaters;
    syData.totalDropouts = totalDropouts;
    
    // Update active teachers count based on rooms
    syData.totalTeachers = syData.classrooms.reduce((sum, r) => sum + (r.teachers || 0), 0);
    
    // Also update high-level db summaries
    this.db.schoolData.totalStudents = totalStudents;
    this.db.schoolData.activeTeachers = syData.totalTeachers;
  }

  saveData() {
    try {
      this.recalculateSummaries();
      const workbook = xlsx.utils.book_new();

      // 1. Re-generate 'VALDEZ ES' sheet content
      const summaryRows = [];
      summaryRows.push([]);
      summaryRows.push([]);
      summaryRows.push([ '   SCHOOLS DIVISION OF PAMPANGA' ]);
      summaryRows.push([ '    VALDEZ ELEMENTARY SCHOOL' ]);
      summaryRows.push([ '    FLORIDABLANCA, PAMPANGA' ]);
      summaryRows.push([]);

      // Sort school years descending to match original excel file
      const yearKeys = Object.keys(this.db.schoolYears).sort().reverse();
      for (const year of yearKeys) {
        const syData = this.db.schoolYears[year];
        summaryRows.push([ syData.schoolYear ]);
        summaryRows.push([
          'GRADE LEVEL',
          'BOSY ENROLLMENT',
          'NUMBER OF REPEATERS',
          'NUMBER OF DROPOUTS',
          'NUMBER OF FUNCTIONAL CLASSROOMS',
          'NUMBER OF SEATS',
          'NUMBER OF TEACHERS'
        ]);

        for (const room of syData.classrooms) {
          summaryRows.push([
            room.gradeLevel.toUpperCase(),
            room.enrollment,
            room.repeaters,
            room.dropouts,
            room.classrooms,
            room.seats,
            room.teachers
          ]);
        }

        summaryRows.push([ 'RELIEVING TEACHER', '', '', '', '', '', 1 ]);
        summaryRows.push([
          'TOTAL',
          syData.totalStudents,
          syData.totalRepeaters,
          syData.totalDropouts,
          15, // functional classrooms total
          461, // seats total
          syData.totalTeachers
        ]);
        summaryRows.push([]);
      }

      const summarySheet = xlsx.utils.aoa_to_sheet(summaryRows);
      xlsx.utils.book_append_sheet(workbook, summarySheet, 'VALDEZ ES');

      // 2. Generate 'Users' sheet
      const usersSheet = xlsx.utils.json_to_sheet(this.db.users);
      xlsx.utils.book_append_sheet(workbook, usersSheet, 'Users');

      // 3. Generate 'Students' sheet (flattening the nested grades object)
      const flatStudents = this.db.students.map(s => {
        const flat = {
          id: s.id,
          lrn: s.lrn,
          name: s.name,
          gender: s.gender,
          gradeLevel: s.gradeLevel,
          section: s.section,
          status: s.status,
          parentName: s.parentName || ''
        };
        const subjects = ['Math', 'Science', 'English', 'Filipino', 'MAPEH', 'Makabayan'];
        const quarters = ['q1', 'q2', 'q3', 'q4'];
        
        for (const subj of subjects) {
          for (const q of quarters) {
            const val = s.grades?.[subj]?.[q];
            flat[`${subj}_${q.toUpperCase()}`] = val !== null && val !== undefined ? val : '';
          }
        }
        return flat;
      });
      const studentsSheet = xlsx.utils.json_to_sheet(flatStudents);
      xlsx.utils.book_append_sheet(workbook, studentsSheet, 'Students');

      // 4. Generate 'Announcements' sheet
      const announcementsSheet = xlsx.utils.json_to_sheet(this.db.announcements);
      xlsx.utils.book_append_sheet(workbook, announcementsSheet, 'Announcements');

      // Write workbook back to disk
      xlsx.writeFile(workbook, EXCEL_PATH);
      console.log(`Excel database successfully saved to ${EXCEL_PATH}`);
    } catch (error) {
      console.error('Failed to save Excel data:', error);
    }
  }

  _checkReload() {
    try {
      if (fs.existsSync(EXCEL_PATH)) {
        const stat = fs.statSync(EXCEL_PATH);
        if (stat.mtimeMs !== this.lastLoadedMtime) {
          console.log('[Auto-Reload] mtime change detected during getDb, reloading data...');
          try {
            this.loadData();
            this.dataVersion++;
            console.log(`[Auto-Reload] Data reloaded successfully. Version: ${this.dataVersion}`);
          } catch (err) {
            console.error('[Auto-Reload] Failed to reload data:', err.message);
          }
        }
      }
    } catch (err) {
      console.error('[Auto-Reload] Check failed:', err.message);
    }
  }

  getDb() {
    this._checkReload();
    return this.db;
  }

  importFromBuffer(buffer) {
    try {
      fs.writeFileSync(EXCEL_PATH, buffer);
      this.loadData();
      return { success: true };
    } catch (error) {
      console.error('Import failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ExcelService();
