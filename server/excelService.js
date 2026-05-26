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
    this.baselineSchoolYears = {};
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

  getAdjustments(gradeLevel) {
    const baselineStudents = {
      'S201': { gradeLevel: 'Grade 1', status: 'Enrolled' },
      'S202': { gradeLevel: 'Grade 1', status: 'Enrolled' },
      'S203': { gradeLevel: 'Grade 1', status: 'Dropped' }
    };

    let enrollAdj = 0;
    let dropoutAdj = 0;

    const currentStudents = this.db.students || [];

    // 1. Check baseline students who still exist or were deleted/modified
    for (const [id, baseInfo] of Object.entries(baselineStudents)) {
      const current = currentStudents.find(s => String(s.id) === id);
      const baseGrade = baseInfo.gradeLevel.toLowerCase();
      const targetGrade = gradeLevel.toLowerCase();

      if (!current) {
        // Baseline student was deleted!
        if (baseGrade === targetGrade) {
          if (baseInfo.status.toLowerCase() === 'enrolled') {
            enrollAdj -= 1;
          } else if (baseInfo.status.toLowerCase() === 'dropped') {
            dropoutAdj -= 1;
          }
        }
      } else {
        const currGrade = String(current.gradeLevel || '').toLowerCase();
        const baseStatus = baseInfo.status.toLowerCase();
        const currStatus = String(current.status || '').toLowerCase();

        // Check if grade level changed
        if (baseGrade === targetGrade && currGrade !== targetGrade) {
          // Left this grade level
          if (baseStatus === 'enrolled') {
            enrollAdj -= 1;
          } else if (baseStatus === 'dropped') {
            dropoutAdj -= 1;
          }
        }
        if (currGrade === targetGrade && baseGrade !== targetGrade) {
          // Entered this grade level from another
          if (currStatus === 'enrolled' || currStatus === 'active') {
            enrollAdj += 1;
          } else if (currStatus === 'dropped') {
            dropoutAdj += 1;
          }
        }
        
        // If they remained in this grade level, check if status changed
        if (baseGrade === targetGrade && currGrade === targetGrade) {
          if (baseStatus !== currStatus) {
            if (baseStatus === 'enrolled' && currStatus === 'dropped') {
              enrollAdj -= 1;
              dropoutAdj += 1;
            } else if (baseStatus === 'dropped' && (currStatus === 'enrolled' || currStatus === 'active')) {
              enrollAdj += 1;
              dropoutAdj -= 1;
            }
          }
        }
      }
    }

    // 2. Check new students (not in baseline)
    for (const student of currentStudents) {
      if (!baselineStudents[String(student.id)]) {
        const currGrade = String(student.gradeLevel || '').toLowerCase();
        const targetGrade = gradeLevel.toLowerCase();
        const currStatus = String(student.status || '').toLowerCase();

        if (currGrade === targetGrade) {
          if (currStatus === 'enrolled' || currStatus === 'active' || currStatus === '') {
            enrollAdj += 1;
          } else if (currStatus === 'dropped') {
            dropoutAdj += 1;
          }
        }
      }
    }

    return { enrollAdj, dropoutAdj };
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
          schoolYears[currentSY].totalClassrooms = Number(row[4]) || 0;
          schoolYears[currentSY].totalSeats = Number(row[5]) || 0;
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
          parentPhone: s.parentPhone || '',
          address: s.address || '',
          grades
        };
      });
    }

    // Load 'Announcements' sheet if present in Excel
    if (sheetNames.includes('Announcements')) {
      const annSheet = this.workbook.Sheets['Announcements'];
      this.db.announcements = xlsx.utils.sheet_to_json(annSheet);
    }

    // Handle Baseline_Census sheet loading/parsing
    let baselineSchoolYears = {};
    if (sheetNames.includes('Baseline_Census')) {
      const baselineSheet = this.workbook.Sheets['Baseline_Census'];
      const rawBaselineData = xlsx.utils.sheet_to_json(baselineSheet, { header: 1 });
      let baselineCurrentSY = null;
      let baselineParsingGrades = false;

      for (let i = 0; i < rawBaselineData.length; i++) {
        const row = rawBaselineData[i];
        if (!row || row.length === 0) {
          baselineParsingGrades = false;
          continue;
        }

        const firstCell = String(row[0] || '').trim();

        if (firstCell.startsWith('S.Y.')) {
          baselineCurrentSY = firstCell;
          baselineSchoolYears[baselineCurrentSY] = {
            schoolYear: baselineCurrentSY,
            classrooms: [],
            totalStudents: 0,
            totalRepeaters: 0,
            totalDropouts: 0,
            totalTeachers: 0,
            totalSeats: 0
          };
          continue;
        }

        if (firstCell === 'GRADE LEVEL' && baselineCurrentSY) {
          baselineParsingGrades = true;
          continue;
        }

        if (baselineParsingGrades && baselineCurrentSY) {
          if (firstCell === 'TOTAL') {
            baselineSchoolYears[baselineCurrentSY].totalStudents = Number(row[1]) || 0;
            baselineSchoolYears[baselineCurrentSY].totalRepeaters = Number(row[2]) || 0;
            baselineSchoolYears[baselineCurrentSY].totalDropouts = Number(row[3]) || 0;
            baselineParsingGrades = false;
            continue;
          }
          if (firstCell === 'RELIEVING TEACHER') {
            continue;
          }
          if (firstCell) {
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

            baselineSchoolYears[baselineCurrentSY].classrooms.push({
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
      this.baselineSchoolYears = baselineSchoolYears;
    }

    // Set the "current" year data as the default (most recent) and initialize baselines if not present
    const yearKeys = Object.keys(this.db.schoolYears).sort().reverse();
    if (yearKeys.length > 0) {
      const latestYear = yearKeys[0];
      const syData = this.db.schoolYears[latestYear];
      this.db.classrooms = syData.classrooms;

      if (!this.baselineSchoolYears[latestYear]) {
        console.log(`[Baseline Sync] Initializing baseline for ${latestYear} from sheet values...`);
        this.baselineSchoolYears[latestYear] = {
          schoolYear: latestYear,
          classrooms: syData.classrooms.map(room => {
            const adj = this.getAdjustments(room.gradeLevel);
            return {
              gradeLevel: room.gradeLevel,
              enrollment: room.enrollment - adj.enrollAdj,
              repeaters: room.repeaters,
              dropouts: room.dropouts - adj.dropoutAdj,
              section: room.section,
              classrooms: room.classrooms,
              seats: room.seats,
              teachers: room.teachers
            };
          })
        };
      } else {
        // Check for manual user edits to baseline in VALDEZ ES sheet
        const baseSY = this.baselineSchoolYears[latestYear];
        syData.classrooms.forEach(room => {
          const baseRoom = baseSY.classrooms.find(r => r.gradeLevel === room.gradeLevel);
          if (baseRoom) {
            const adj = this.getAdjustments(room.gradeLevel);
            const expectedEnrollment = baseRoom.enrollment + adj.enrollAdj;
            const expectedDropouts = baseRoom.dropouts + adj.dropoutAdj;

            if (room.enrollment !== expectedEnrollment) {
              console.log(`[Baseline Override] Manual census enrollment change detected for ${room.gradeLevel}. Original: ${expectedEnrollment}, New: ${room.enrollment}. Updating baseline.`);
              baseRoom.enrollment = room.enrollment - adj.enrollAdj;
            }
            if (room.dropouts !== expectedDropouts) {
              console.log(`[Baseline Override] Manual census dropouts change detected for ${room.gradeLevel}. Original: ${expectedDropouts}, New: ${room.dropouts}. Updating baseline.`);
              baseRoom.dropouts = room.dropouts - adj.dropoutAdj;
            }
          }
        });
      }

      this.recalculateSummaries();
    }

    console.log(`Excel data loaded: ${yearKeys.length} school years parsed. ${this.db.students.length} students loaded.`);
  }

  recalculateSummaries() {
    const yearKeys = Object.keys(this.db.schoolYears).sort().reverse();
    if (yearKeys.length === 0) return;
    const currentSY = yearKeys[0];
    const syData = this.db.schoolYears[currentSY];
    const baseSY = this.baselineSchoolYears[currentSY];
    if (!baseSY) return;
    
    let totalStudents = 0;
    let totalRepeaters = 0;
    let totalDropouts = 0;
    
    syData.classrooms.forEach(room => {
      const baseRoom = baseSY.classrooms.find(r => r.gradeLevel === room.gradeLevel);
      if (baseRoom) {
        const adj = this.getAdjustments(room.gradeLevel);
        room.enrollment = baseRoom.enrollment + adj.enrollAdj;
        room.dropouts = baseRoom.dropouts + adj.dropoutAdj;
      }
      totalStudents += room.enrollment || 0;
      totalRepeaters += room.repeaters || 0;
      totalDropouts += room.dropouts || 0;
    });
    
    syData.totalStudents = totalStudents;
    syData.totalRepeaters = totalRepeaters;
    syData.totalDropouts = totalDropouts;
    
    // Update active teachers count based on rooms + 1 relieving teacher
    syData.totalTeachers = syData.classrooms.reduce((sum, r) => sum + (r.teachers || 0), 0) + 1;
    
    // Also update high-level db summaries
    this.db.schoolData.totalStudents = totalStudents;
    this.db.schoolData.activeTeachers = syData.totalTeachers;
  }

  generateWorkbook(requestedYear = null) {
    const workbook = xlsx.utils.book_new();
    const db = this.getDb();
    const yearKeys = Object.keys(db.schoolYears).sort().reverse();
    const TARGET_YEARS = requestedYear ? [requestedYear] : yearKeys;
    const GRADE_LEVELS = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

    // --- Helper function to format summary sheets (merges and heights) ---
    const formatSummarySheet = (sheet, rows) => {
      const merges = [];
      const heights = [];
      
      merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: 6 } });
      merges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: 6 } });
      merges.push({ s: { r: 4, c: 0 }, e: { r: 4, c: 6 } });
      
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        if (r >= 2 && r <= 4) {
          heights.push({ hpt: 26 });
        } else if (row && row.length === 1 && String(row[0]).startsWith('S.Y.')) {
          heights.push({ hpt: 24 });
          merges.push({ s: { r, c: 0 }, e: { r, c: 6 } });
        } else if (row && row[0] === 'GRADE LEVEL') {
          heights.push({ hpt: 22 });
        } else if (row && row[0] === 'TOTAL') {
          heights.push({ hpt: 20 });
        } else if (row && row[0] === 'RELIEVING TEACHER') {
          heights.push({ hpt: 18 });
        } else {
          heights.push({ hpt: 17 });
        }
      }
      sheet['!merges'] = merges;
      sheet['!rows'] = heights;
      sheet['!cols'] = [
        { wch: 22 }, // Grade Level
        { wch: 18 }, // BOSY Enrollment
        { wch: 22 }, // Number of Repeaters
        { wch: 22 }, // Number of Dropouts
        { wch: 32 }, // Number of Functional Classrooms
        { wch: 18 }, // Number of Seats
        { wch: 20 }  // Number of Teachers
      ];
    };

    const formatTableSheet = (sheet, rawDataLength) => {
      const heights = [{ hpt: 22 }];
      for (let i = 0; i < rawDataLength; i++) {
        heights.push({ hpt: 18 });
      }
      sheet['!rows'] = heights;
    };

    // 1. Generate Summary Sheet
    const summaryRows = [];
    summaryRows.push([]);
    summaryRows.push([]);
    summaryRows.push([ 'SCHOOLS DIVISION OF PAMPANGA' ]);
    summaryRows.push([ 'VALDEZ ELEMENTARY SCHOOL' ]);
    summaryRows.push([ 'FLORIDABLANCA, PAMPANGA' ]);
    summaryRows.push([]);

    for (const year of TARGET_YEARS) {
      const syData = db.schoolYears[year];
      if (!syData) continue;
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

      const relieving = syData.totalTeachers !== undefined 
        ? Math.max(0, syData.totalTeachers - syData.classrooms.reduce((sum, r) => sum + (r.teachers || 0), 0)) 
        : (syData.schoolYear === 'S.Y. 2021-2022' ? 0 : 1);
        
      summaryRows.push([ 'RELIEVING TEACHER', '', '', '', '', '', relieving ]);
      summaryRows.push([
        'TOTAL',
        syData.totalStudents,
        syData.totalRepeaters,
        syData.totalDropouts,
        syData.totalClassrooms || 15,
        syData.totalSeats || 461,
        syData.totalTeachers
      ]);
      summaryRows.push([]);
    }

    const summarySheet = xlsx.utils.aoa_to_sheet(summaryRows);
    formatSummarySheet(summarySheet, summaryRows);
    const summarySheetName = requestedYear ? requestedYear.replace('S.Y. ', 'SY ') : 'VALDEZ ES';
    xlsx.utils.book_append_sheet(workbook, summarySheet, summarySheetName);

    // 2. Generate 'Users' sheet
    const usersSheet = xlsx.utils.json_to_sheet(db.users);
    formatTableSheet(usersSheet, db.users.length);
    usersSheet['!cols'] = [
      { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 18 }
    ];
    xlsx.utils.book_append_sheet(workbook, usersSheet, 'Users');

    // 3. Generate 'Students' sheet
    const flatStudents = db.students.map(s => {
      const flat = {
        id: s.id,
        lrn: s.lrn,
        name: s.name,
        gender: s.gender,
        gradeLevel: s.gradeLevel,
        section: s.section,
        status: s.status,
        parentName: s.parentName || '',
        parentPhone: s.parentPhone || '',
        address: s.address || ''
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
    formatTableSheet(studentsSheet, flatStudents.length);
    studentsSheet['!cols'] = [
      { wch: 10 }, { wch: 16 }, { wch: 22 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 22 },
      ...Array(24).fill({ wch: 12 })
    ];
    xlsx.utils.book_append_sheet(workbook, studentsSheet, 'Students');

    // 4. Generate 'Announcements' sheet
    const announcementsSheet = xlsx.utils.json_to_sheet(db.announcements);
    formatTableSheet(announcementsSheet, db.announcements.length);
    announcementsSheet['!cols'] = [
      { wch: 10 }, { wch: 28 }, { wch: 15 }, { wch: 50 }, { wch: 15 }
    ];
    xlsx.utils.book_append_sheet(workbook, announcementsSheet, 'Announcements');

    // 5. Generate 'Baseline_Census' sheet
    const baselineRows = [];
    baselineRows.push([]);
    baselineRows.push([]);
    baselineRows.push([ 'SCHOOLS DIVISION OF PAMPANGA' ]);
    baselineRows.push([ 'VALDEZ ELEMENTARY SCHOOL' ]);
    baselineRows.push([ 'FLORIDABLANCA, PAMPANGA' ]);
    baselineRows.push([]);

    for (const year of yearKeys) {
      const syData = this.baselineSchoolYears[year] || db.schoolYears[year];
      if (!syData) continue;
      baselineRows.push([ syData.schoolYear ]);
      baselineRows.push([
        'GRADE LEVEL',
        'BOSY ENROLLMENT',
        'NUMBER OF REPEATERS',
        'NUMBER OF DROPOUTS',
        'NUMBER OF FUNCTIONAL CLASSROOMS',
        'NUMBER OF SEATS',
        'NUMBER OF TEACHERS'
      ]);

      for (const room of syData.classrooms) {
        baselineRows.push([
          room.gradeLevel.toUpperCase(),
          room.enrollment,
          room.repeaters,
          room.dropouts,
          room.classrooms,
          room.seats,
          room.teachers
        ]);
      }

      const relieving = syData.totalTeachers !== undefined 
        ? Math.max(0, syData.totalTeachers - syData.classrooms.reduce((sum, r) => sum + (r.teachers || 0), 0)) 
        : (syData.schoolYear === 'S.Y. 2021-2022' ? 0 : 1);
        
      baselineRows.push([ 'RELIEVING TEACHER', '', '', '', '', '', relieving ]);
      
      const totalS = syData.classrooms.reduce((sum, r) => sum + (r.enrollment || 0), 0);
      const totalR = syData.classrooms.reduce((sum, r) => sum + (r.repeaters || 0), 0);
      const totalD = syData.classrooms.reduce((sum, r) => sum + (r.dropouts || 0), 0);
      
      baselineRows.push([
        'TOTAL',
        totalS,
        totalR,
        totalD,
        syData.totalClassrooms || 15,
        syData.totalSeats || 461,
        syData.totalTeachers || (syData.classrooms.reduce((sum, r) => sum + (r.teachers || 0), 0) + relieving)
      ]);
      baselineRows.push([]);
    }

    const baselineSheet = xlsx.utils.aoa_to_sheet(baselineRows);
    formatSummarySheet(baselineSheet, baselineRows);
    xlsx.utils.book_append_sheet(workbook, baselineSheet, 'Baseline_Census');

    // 6. Generate 'Enrollment Trends' sheet (for analytics download)
    const trendRows = [['School Year', 'Total Students', 'Total Repeaters', 'Total Dropouts', 'Total Teachers']];
    for (const sy of TARGET_YEARS) {
      const syData = db.schoolYears[sy];
      if (!syData) continue;
      trendRows.push([
        sy,
        syData.totalStudents || 0,
        syData.totalRepeaters || 0,
        syData.totalDropouts || 0,
        syData.totalTeachers || 0
      ]);
    }
    const trendSheet = xlsx.utils.aoa_to_sheet(trendRows);
    formatTableSheet(trendSheet, trendRows.length - 1);
    trendSheet['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 16 }];
    xlsx.utils.book_append_sheet(workbook, trendSheet, 'Enrollment Trends');

    // 7. Generate 'Grade Breakdown' sheet
    const gradeRows = [['School Year', ...GRADE_LEVELS]];
    for (const sy of TARGET_YEARS) {
      const syData = db.schoolYears[sy];
      if (!syData) continue;
      const row = [sy];
      for (const grade of GRADE_LEVELS) {
        const cls = syData.classrooms?.find(c => c.gradeLevel === grade);
        row.push(cls ? cls.enrollment || 0 : 0);
      }
      gradeRows.push(row);
    }
    const gradeSheet = xlsx.utils.aoa_to_sheet(gradeRows);
    formatTableSheet(gradeSheet, gradeRows.length - 1);
    gradeSheet['!cols'] = [{ wch: 20 }, ...GRADE_LEVELS.map(() => ({ wch: 12 }))];
    xlsx.utils.book_append_sheet(workbook, gradeSheet, 'Grade Breakdown');

    return workbook;
  }

  saveData() {
    try {
      this.recalculateSummaries();
      const workbook = this.generateWorkbook();
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
    this.recalculateSummaries();
    return this.db;
  }

  importFromBuffer(buffer) {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;
      
      // If it contains Users and Students sheets, it's a full or partial database import
      if (sheetNames.includes('Users') && sheetNames.includes('Students')) {
        fs.writeFileSync(EXCEL_PATH, buffer);
        this.loadData();
        return { success: true, fullImport: true };
      }
      return { success: false, code: 'NOT_FULL_DB', error: 'Uploaded file is not a full database backup.' };
    } catch (error) {
      console.error('Import failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ExcelService();
