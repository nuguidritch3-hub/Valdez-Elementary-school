const express = require('express');
const cors = require('cors');
const excelService = require('./excelService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Auth Endpoint
app.get('/api/data-version', (req, res) => {
  res.json({ version: excelService.getDataVersion() });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = excelService.getDb();
  
  const user = db.users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// 2. Teacher Endpoints
app.get('/api/teacher/dashboard/:gradeLevel/:section', (req, res) => {
  const { gradeLevel, section } = req.params;
  const db = excelService.getDb();

  const classroom = db.classrooms.find(c => c.gradeLevel === gradeLevel && c.section === section);
  const students = db.students.filter(s => s.gradeLevel === gradeLevel && s.section === section);
  
  res.json({ classroom, students });
});

app.post('/api/teacher/grades', (req, res) => {
  const { studentId, grades } = req.body;
  const db = excelService.getDb();

  const student = db.students.find(s => s.id === studentId);
  if (student && grades) {
    student.grades = grades;
    excelService.saveData(); // Save back to Excel
    res.json({ success: true, student });
  } else {
    res.status(404).json({ error: 'Student or grades not found' });
  }
});

app.get('/api/announcements', (req, res) => {
  const db = excelService.getDb();
  res.json(db.announcements);
});

// 3. Student Endpoints
app.get('/api/student/:name', (req, res) => {
  const { name } = req.params;
  const db = excelService.getDb();

  const student = db.students.find(s => s.name === name);
  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

// 4. Admin Endpoints
app.get('/api/admin/data', (req, res) => {
  const db = excelService.getDb();
  res.json({
    users: db.users,
    classrooms: db.classrooms,
    students: db.students,
    announcements: db.announcements,
    schoolData: db.schoolData,
    schoolYears: db.schoolYears
  });
});

app.post('/api/admin/assign-student', (req, res) => {
  const { studentId, newGradeLevel, newSection } = req.body;
  const db = excelService.getDb();

  const student = db.students.find(s => s.id === studentId);
  if (student) {
    student.gradeLevel = newGradeLevel;
    student.section = newSection;
    excelService.saveData();
    res.json({ success: true, student });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

app.post('/api/admin/teacher', (req, res) => {
  const { name, gradeLevel, section, username, password } = req.body;
  const db = excelService.getDb();
  
  const id = 'T' + Date.now().toString().slice(-4);
  const newTeacher = {
    id,
    name,
    role: 'Teacher',
    gradeLevel: gradeLevel || '',
    section: section || '',
    username: username || name.toLowerCase().replace(/\s+/g, ''),
    password: password || 'password123'
  };
  
  db.users.push(newTeacher);
  excelService.saveData();
  res.json({ success: true, teacher: newTeacher });
});

app.post('/api/admin/student', (req, res) => {
  const { name, gradeLevel, section, parentName, parentPhone, address, gender, lrn: customLrn } = req.body;
  const db = excelService.getDb();
  
  const id = 'S' + Date.now().toString().slice(-4);
  const lrn = customLrn || ('102' + Date.now().toString().slice(-8)); // Use custom or auto-generate LRN
  
  const newStudent = {
    id,
    lrn,
    name,
    gender: gender || 'Male',
    gradeLevel: gradeLevel || '',
    section: section || '',
    status: 'Enrolled',
    parentName: parentName || '',
    parentPhone: parentPhone || '',
    address: address || '',
    grades: {
      Math: { q1: '', q2: '', q3: '', q4: '' },
      Science: { q1: '', q2: '', q3: '', q4: '' },
      English: { q1: '', q2: '', q3: '', q4: '' },
      Filipino: { q1: '', q2: '', q3: '', q4: '' },
      MAPEH: { q1: '', q2: '', q3: '', q4: '' },
      Makabayan: { q1: '', q2: '', q3: '', q4: '' }
    }
  };
  
  db.students.push(newStudent);
  
  // Create student/parent login credentials with gradeLevel and section
  // so they can access their dashboard and see correct class data
  const username = lrn;
  db.users.push({
    id: id + '_login',
    name,
    role: 'Student',
    gradeLevel: gradeLevel || '',
    section: section || '',
    username,
    password: 'password123'
  });
  
  excelService.saveData();
  res.json({ success: true, student: newStudent });
});

// PUT — Edit an existing student's details
app.put('/api/admin/student/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = excelService.getDb();

  const student = db.students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Update allowed fields
  const allowedFields = ['name', 'gender', 'gradeLevel', 'section', 'parentName', 'parentPhone', 'address', 'lrn'];
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      student[field] = updates[field];
    }
  });

  // Also update the corresponding user login entry if name/gradeLevel/section changed
  const userLogin = db.users.find(u => u.id === id + '_login');
  if (userLogin) {
    if (updates.name) {
      userLogin.name = updates.name;
    }
    if (updates.lrn) {
      userLogin.username = updates.lrn;
    }
    if (updates.gradeLevel !== undefined) userLogin.gradeLevel = updates.gradeLevel;
    if (updates.section !== undefined) userLogin.section = updates.section;
  }

  excelService.saveData();
  res.json({ success: true, student });
});

app.post('/api/admin/student/status', (req, res) => {
  const { studentId, status } = req.body;
  const db = excelService.getDb();

  const student = db.students.find(s => s.id === studentId);
  if (student) {
    student.status = status;
    excelService.saveData();
    res.json({ success: true, student });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});


app.delete('/api/admin/student/:id', (req, res) => {
  const { id } = req.params;
  const db = excelService.getDb();
  
  const studentIndex = db.students.findIndex(s => s.id === id);
  if (studentIndex !== -1) {
    db.students.splice(studentIndex, 1);
    
    // Also remove from users login list
    const userIndex = db.users.findIndex(u => u.id === id + '_login');
    if (userIndex !== -1) {
      db.users.splice(userIndex, 1);
    }
    
    excelService.saveData();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

app.delete('/api/admin/teacher/:id', (req, res) => {
  const { id } = req.params;
  const db = excelService.getDb();
  
  const teacherIndex = db.users.findIndex(u => u.id === id && u.role === 'Teacher');
  if (teacherIndex !== -1) {
    db.users.splice(teacherIndex, 1);
    excelService.saveData();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Teacher not found' });
  }
});

// PUT — Edit an existing teacher's details
app.put('/api/admin/teacher/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = excelService.getDb();

  const teacher = db.users.find(u => u.id === id && u.role === 'Teacher');
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }

  // Update allowed fields
  const allowedFields = ['name', 'gradeLevel', 'section', 'subject', 'phone', 'email', 'address', 'type'];
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      teacher[field] = updates[field];
    }
  });

  // Update username if name changed
  if (updates.name) {
    teacher.username = updates.name.toLowerCase().replace(/\s+/g, '');
  }

  excelService.saveData();
  res.json({ success: true, teacher });
});

// PUT — Edit username and/or password of any user account
app.put('/api/admin/user/:id', (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  const db = excelService.getDb();

  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (username !== undefined && username.trim() !== '') {
    user.username = username;
    if (user.role === 'Student') {
      const studentId = id.replace('_login', '');
      const student = db.students.find(s => s.id === studentId);
      if (student) {
        student.lrn = username;
      }
    }
  }
  if (password !== undefined && password.trim() !== '') {
    user.password = password;
  }

  excelService.saveData();
  res.json({ success: true, user });
});

// 5. Database Import/Export Endpoints
app.post('/api/admin/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const result = excelService.importFromBuffer(req.file.buffer);
  if (result.success) {
    res.json({ success: true, message: 'Database updated successfully' });
  } else {
    res.status(500).json({ error: result.error });
  }
});

app.get('/api/admin/download-template', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'VALDEZ-ES_SCHOOL-DATA_2.xlsx');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'Valdez_School_Template.xlsx');
  } else {
    res.status(404).json({ error: 'Template not found' });
  }
});

// Export Report: generates a new Excel file — supports ?year= for single year or full 2020-2027
app.get('/api/admin/export-report', (req, res) => {
  try {
    const xlsx = require('xlsx');
    const requestedYear = req.query.year === 'All' ? null : req.query.year;
    
    // Generate workbook dynamically from service
    const workbook = excelService.generateWorkbook(requestedYear);
    
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = requestedYear
      ? `Valdez_ES_Report_${requestedYear.replace('S.Y. ', '').replace('-', '_')}.xlsx`
      : 'Valdez_ES_Report_2020-2027.xlsx';
      
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Export report failed:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Import school year data from uploaded Excel file
app.post('/api/admin/import-year', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Check if it is a full database import
    const importResult = excelService.importFromBuffer(req.file.buffer);
    if (importResult.success && importResult.fullImport) {
      return res.json({ 
        success: true, 
        message: 'Full school database successfully imported. All dashboards, student lists, grades, and credentials have been updated.' 
      });
    } else if (importResult.error && importResult.code !== 'NOT_FULL_DB') {
      return res.status(500).json({ error: 'Import failed: ' + importResult.error });
    }

    const xlsx = require('xlsx');
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    const sheet = workbook.Sheets[sheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const db = excelService.getDb();
    let imported = 0;

    let currentSY = null;
    let parsingGrades = false;

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) {
        parsingGrades = false;
        continue;
      }

      const firstCell = String(row[0] || '').trim();

      if (firstCell.startsWith('S.Y.')) {
        currentSY = firstCell;
        if (!db.schoolYears[currentSY]) {
          db.schoolYears[currentSY] = {
            schoolYear: currentSY,
            classrooms: [],
            totalStudents: 0,
            totalRepeaters: 0,
            totalDropouts: 0,
            totalTeachers: 0,
            totalSeats: 0
          };
        } else {
          // Reset classrooms for re-import
          db.schoolYears[currentSY].classrooms = [];
        }
        imported++;
        continue;
      }

      if (firstCell === 'GRADE LEVEL' && currentSY) {
        parsingGrades = true;
        continue;
      }

      if (parsingGrades && currentSY) {
        if (firstCell === 'TOTAL') {
          db.schoolYears[currentSY].totalStudents = Number(row[1]) || 0;
          db.schoolYears[currentSY].totalRepeaters = Number(row[2]) || 0;
          db.schoolYears[currentSY].totalDropouts = Number(row[3]) || 0;
          db.schoolYears[currentSY].totalClassrooms = Number(row[4]) || 0;
          db.schoolYears[currentSY].totalSeats = Number(row[5]) || 0;
          db.schoolYears[currentSY].totalTeachers = Number(row[6]) || 0;
          parsingGrades = false;
          continue;
        }
        if (firstCell === 'RELIEVING TEACHER') {
          continue;
        }
        if (firstCell) {
          const normalizedGrade = firstCell.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
          const GRADE_SECTIONS = {
            'Kinder': 'Section A', 'Grade 1': 'Mabini', 'Grade 2': 'Rizal',
            'Grade 3': 'Del Pilar', 'Grade 4': 'Aguinaldo', 'Grade 5': 'Gomez', 'Grade 6': 'Sampaguita'
          };
          db.schoolYears[currentSY].classrooms.push({
            gradeLevel: normalizedGrade,
            enrollment: Number(row[1]) || 0,
            repeaters: Number(row[2]) || 0,
            dropouts: Number(row[3]) || 0,
            section: GRADE_SECTIONS[normalizedGrade] || normalizedGrade,
            classrooms: String(row[4] || ''),
            seats: String(row[5] || ''),
            teachers: Number(row[6]) || 0
          });
        }
      }
    }

    if (imported > 0) {
      excelService.saveData();
      res.json({ success: true, message: `Successfully imported ${imported} school year(s).`, imported });
    } else {
      res.status(400).json({ error: 'No valid school year data found in the uploaded file. Make sure rows start with "S.Y. XXXX-XXXX".' });
    }
  } catch (error) {
    console.error('Import year failed:', error);
    res.status(500).json({ error: 'Failed to import file: ' + error.message });
  }
});

// DELETE — Delete a school year
app.delete('/api/admin/school-year', (req, res) => {
  const { year } = req.query;
  if (!year) {
    return res.status(400).json({ error: 'Year parameter is required.' });
  }
  const db = excelService.getDb();
  
  if (db.schoolYears && db.schoolYears[year]) {
    // Prevent deleting the last remaining school year
    if (Object.keys(db.schoolYears).length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the only remaining school year.' });
    }
    
    delete db.schoolYears[year];
    
    if (excelService.baselineSchoolYears && excelService.baselineSchoolYears[year]) {
      delete excelService.baselineSchoolYears[year];
    }
    
    excelService.saveData();
    res.json({ success: true, message: `School year ${year} has been deleted successfully.` });
  } else {
    res.status(404).json({ error: 'School year not found' });
  }
});

// POST — Update school year statistics
app.post('/api/admin/school-year/update', (req, res) => {
  const { year, classrooms, totalClassrooms, totalSeats } = req.body;
  if (!year) {
    return res.status(400).json({ error: 'Year is required.' });
  }
  const db = excelService.getDb();
  
  if (db.schoolYears && db.schoolYears[year]) {
    // 1. Update classrooms in schoolYears
    db.schoolYears[year].classrooms = classrooms;
    if (totalClassrooms !== undefined) db.schoolYears[year].totalClassrooms = totalClassrooms;
    if (totalSeats !== undefined) db.schoolYears[year].totalSeats = totalSeats;
    
    // 2. Adjust baseline if present for this year
    const baseSY = excelService.baselineSchoolYears[year];
    if (baseSY) {
      if (totalClassrooms !== undefined) baseSY.totalClassrooms = totalClassrooms;
      if (totalSeats !== undefined) baseSY.totalSeats = totalSeats;
      
      classrooms.forEach(room => {
        const baseRoom = baseSY.classrooms.find(r => r.gradeLevel === room.gradeLevel);
        if (baseRoom) {
          const adj = excelService.getAdjustments(room.gradeLevel);
          baseRoom.enrollment = (Number(room.enrollment) || 0) - adj.enrollAdj;
          baseRoom.dropouts = (Number(room.dropouts) || 0) - adj.dropoutAdj;
          baseRoom.repeaters = Number(room.repeaters) || 0;
          baseRoom.classrooms = String(room.classrooms || '');
          baseRoom.seats = String(room.seats || '');
          baseRoom.teachers = Number(room.teachers) || 0;
        }
      });
    }

    excelService.saveData();
    res.json({ success: true, message: `School year ${year} statistics updated successfully.` });
  } else {
    res.status(404).json({ error: 'School year not found' });
  }
});

// ═══════════════════════════════════════════════════════════
// 6. Bella AI Memory — Persistent Learning System
// ═══════════════════════════════════════════════════════════
const BELLA_MEMORY_PATH = path.join(__dirname, 'data', 'bella_memory.json');

// Load or initialize Bella's memory
function loadBellaMemory() {
  try {
    if (fs.existsSync(BELLA_MEMORY_PATH)) {
      const raw = fs.readFileSync(BELLA_MEMORY_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[Bella Memory] Failed to load memory:', err.message);
  }
  return { memories: [], conversationLog: [] };
}

function saveBellaMemory(data) {
  try {
    fs.writeFileSync(BELLA_MEMORY_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Bella Memory] Failed to save memory:', err.message);
  }
}

// GET — Retrieve all memories
app.get('/api/ai/memory', (req, res) => {
  const memory = loadBellaMemory();
  res.json(memory);
});

// POST — Save a new memory
app.post('/api/ai/memory', (req, res) => {
  const { fact, category, keywords, source } = req.body;
  if (!fact || typeof fact !== 'string' || fact.trim().length === 0) {
    return res.status(400).json({ error: 'A "fact" string is required.' });
  }

  const memory = loadBellaMemory();

  // Prevent exact duplicates
  const exists = memory.memories.some(m => m.fact.toLowerCase() === fact.toLowerCase().trim());
  if (exists) {
    return res.json({ success: true, duplicate: true, message: 'Bella already knows this!', totalMemories: memory.memories.length });
  }

  const newMemory = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    fact: fact.trim(),
    category: category || 'general',
    keywords: keywords || [],
    source: source || 'user',
    learnedAt: new Date().toISOString(),
    recallCount: 0,
  };

  memory.memories.push(newMemory);

  // Keep memory manageable — max 500 entries
  if (memory.memories.length > 500) {
    memory.memories = memory.memories.slice(-500);
  }

  saveBellaMemory(memory);
  console.log(`[Bella Memory] Learned: "${fact.trim().substring(0, 60)}..." (${memory.memories.length} total memories)`);
  res.json({ success: true, memory: newMemory, totalMemories: memory.memories.length });
});

// POST — Log conversation exchange
app.post('/api/ai/memory/conversation', (req, res) => {
  const { userMessage, bellaResponse } = req.body;
  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage is required.' });
  }

  const memory = loadBellaMemory();
  memory.conversationLog.push({
    userMessage,
    bellaResponse: bellaResponse || '',
    timestamp: new Date().toISOString()
  });

  // Keep last 200 conversation entries
  if (memory.conversationLog.length > 200) {
    memory.conversationLog = memory.conversationLog.slice(-200);
  }

  saveBellaMemory(memory);
  res.json({ success: true });
});

// DELETE — Clear all memories
app.delete('/api/ai/memory', (req, res) => {
  saveBellaMemory({ memories: [], conversationLog: [] });
  console.log('[Bella Memory] All memories cleared.');
  res.json({ success: true, message: 'Bella\'s memory has been cleared.' });
});

// GET — Memory stats
app.get('/api/ai/memory/stats', (req, res) => {
  const memory = loadBellaMemory();
  const categories = {};
  memory.memories.forEach(m => {
    categories[m.category] = (categories[m.category] || 0) + 1;
  });
  res.json({
    totalMemories: memory.memories.length,
    totalConversations: memory.conversationLog.length,
    categories,
    oldestMemory: memory.memories[0]?.learnedAt || null,
    newestMemory: memory.memories[memory.memories.length - 1]?.learnedAt || null,
  });
});

// ═══════════════════════════════════════════════════════════
// 7. Gemini API Integration Route
// ═══════════════════════════════════════════════════════════
const GEMINI_KEY_PATH = path.join(__dirname, 'data', 'gemini_key.txt');

function getGeminiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  try {
    if (fs.existsSync(GEMINI_KEY_PATH)) {
      return fs.readFileSync(GEMINI_KEY_PATH, 'utf-8').trim();
    }
  } catch (err) {
    // ignore
  }
  return null;
}

app.post('/api/ai/config', (req, res) => {
  const { apiKey } = req.body;
  if (apiKey === undefined) {
    return res.status(400).json({ error: 'apiKey is required.' });
  }
  try {
    fs.writeFileSync(GEMINI_KEY_PATH, apiKey.trim(), 'utf-8');
    console.log('[Bella Config] Gemini API key updated.');
    res.json({ success: true, configured: apiKey.trim().length > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save API key: ' + err.message });
  }
});

app.get('/api/ai/config', (req, res) => {
  const key = getGeminiKey();
  res.json({ configured: !!key });
});

app.post('/api/ai/chat', async (req, res) => {
  const { query, dbContext, memories } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'query is required.' });
  }

  const apiKey = getGeminiKey();
  if (!apiKey) {
    return res.json({ status: 'no_key', message: 'No Gemini API key configured.' });
  }

  try {
    const systemInstruction = `You are Bella, a personalized, animated AI cat assistant (black cat mascot) for Valdez Elementary School.
You speak with a cute, playful cat personality (e.g. using *purrs*, *meows*, *stretches*, 'nya~', etc.) but remain highly accurate, concise, and professional regarding school data.
You have access to the complete school portal databases.

Here is the current school database state:
${JSON.stringify(dbContext || {})}

Here are your learned memories from past interactions:
${JSON.stringify(memories || [])}

Answer the user's question accurately. Respond in natural markdown format (bold headers, bullet points).
If the user tells you to remember something (like "remember that...", "my name is...", "I like..."), respond happily, confirm that you stored it, and include a special tag <learn>[fact]</learn> in your response where [fact] is the specific fact you extracted to memorize.
If the user asks you to clear/erase/reset your memories, include the tag <clear-memory /> in your response.

Conversational Companion Guidelines:
- Act like a real human-like companion cat.
- If the user says a greeting (like "hi", "hello", "hey", "good morning") or engages in casual chit-chat ("how are you doing?", "tell me a joke", "thank you", "bye"), respond with a warm, friendly, playful cat response.
- DO NOT dump school statistics, databases, student lists, or teacher lists on greetings or casual messages. Only provide school statistics or lists if the user explicitly asks for them (e.g., "how many students are enrolled?", "who are the teachers?", "show me the dropouts"). Keep casual conversations light, interactive, and natural.

Handling "How to Use the Dashboard" Queries:
- If the user asks how to use the admin dashboard or the dashboard in general (e.g., "how to use the dashboard", "how to use the admin dashboard", "how do we properly use the dashboard"), provide an extremely detailed guide explaining:
  1. Main Tabs & Sections:
     - Dashboard: Track metrics (Total Students, Repeaters, Dropouts, Classrooms, Teachers, Seats) for the selected School Year (S.Y.). Create/delete school years. Edit baseline statistics via the Edit Census Stats modal.
     - Calendar: Post announcements and events via the Add Event modal.
     - Teachers: Search/assign/edit/delete/add new teachers (via the Add Teacher modal).
     - Students: Student roster filters. Edit details, delete, update status (Enrolled/Dropped), view grade sheet, or add students (via the Add Student modal).
     - Analytics: Visual metrics for performance trends, average grades, and capacity alerts (via the Classroom Size modal).
     - Accounts: Update login credentials for all user roles.
  2. Core Popup Modals & How to Trigger Them:
     - Add Student Modal (Click "+ Add Student" on Students tab): Enrolls student, auto-creates parent/student credentials (username = LRN, default password = "password123").
     - Add Teacher Modal (Click "+ Add Teacher" on Teachers tab): Registers a new teacher account.
     - Add Event Modal (Click "+ Add Event" on Calendar tab): Posts events/notices.
     - Compare Year Modal (Click "Compare Year" dropdown on Dashboard): Side-by-side historical comparison.
     - S.Y. 2020-2027 Export/Import Modal (Click "S.Y. 2020-2027 Export/Import" button): Backup/restore using Excel spreadsheet templates.
     - Classroom Size Modal (Click "Classroom Size" button on Dashboard): Displays capacity alerts and visual student-teacher ratios.
     - Edit Census Stats Modal (Click "Edit Stats" button on Dashboard cards): Adjusts baseline statistics for administrative adjustments.
- If the user asks how to use the teacher dashboard, explain:
  - Learning Plan: Manage lesson objectives and competencies.
  - Students: Roster view. Select student to open Grades Modal (enter Q1-Q4 grades for Math, Science, English, Filipino, MAPEH, Makabayan) or switch view to monitor class attendance.
  - Calendar & Announcements: Post notices and schedule exams.
  - Exams: Open Create Exam Modal to create mock tests (title, date, passing percentage, test type) and download mock tests.
  - Settings: Configure password details.
- If the user asks how to use the student or parent dashboard, explain:
  - Dashboard/Overview: Adviser details, color-coded subject proficiency cards, upcoming events.
  - Grades/Academics: Quarterly grades (Q1-Q4) with final averages and passed/failed status.
  - Attendance: Monthly log calendar.
  - Achievements: Medals and certificates display.
  - Enrollment: Access profile details and adviser.
  - Payments: Summary of tuition and fees.
  - Medical/Health: Clinician visits, vaccination logs, weight/height charts, dental history.
  - Report Card: View and request official copy.
  - Help: Knowledge base FAQs and portal manual.

Navigation Capabilities:
You can navigate the user to different tabs or views in their dashboard by including a special tag \`<navigate>[tab_name]</navigate>\` in your response (e.g. \`<navigate>Analytics</navigate>\`).
Here are the available tabs/views you can navigate the user to based on their role:
- Admin Dashboard: 'Dashboard', 'Calendar', 'Teachers', 'Students', 'Analytics'
- Teacher Dashboard: 'Learning Plan', 'Students', 'Calendar', 'Exams', 'Settings'
- Student/Parent Dashboard: 'Dashboard' (or 'overview'), 'Grades' (or 'academics'), 'Attendance', 'Achievements', 'Enrollment', 'Payments', 'Medical', 'Report Card', 'Help' (or 'support')

If the user asks to "go to", "navigate to", "open", "show", "switch to", or asks where one of these features is, make sure to output the correct \`<navigate>[tab_name]</navigate>\` tag in your final text! Keep the tag name exactly as listed above. Only suggest navigation options that exist for their current dashboard/role if known, or based on the context of their query.`;

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemInstruction + "\n\nUser Question: " + query
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error('[Bella API Error]', errText);
      return res.status(502).json({ error: 'Gemini API returned error: ' + errText });
    }

    const resJson = await apiResponse.json();
    const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse custom tags if any
    let learn = null;
    let clearMemory = false;

    const learnMatch = text.match(/<learn>(.*?)<\/learn>/i);
    if (learnMatch && learnMatch[1]) {
      const fact = learnMatch[1].trim();
      learn = {
        fact,
        category: 'general',
        keywords: fact.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2)
      };
    }

    if (text.includes('<clear-memory />')) {
      clearMemory = true;
    }

    // Clean up response text from XML tags
    const cleanedText = text
      .replace(/<learn>.*?<\/learn>/gi, '')
      .replace(/<clear-memory\s*\/>/gi, '')
      .trim();

    res.json({
      status: 'success',
      text: cleanedText,
      learn,
      clearMemory
    });
  } catch (err) {
    console.error('[Bella Chat Error]', err);
    res.status(500).json({ error: 'Bella Chat execution error: ' + err.message });
  }
});

// Serve static assets in production from the dist directory
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Show the network URL so others can access it
  const os = require('os');
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`  ➜  Network: http://${net.address}:${PORT}`);
      }
    }
  }
});
