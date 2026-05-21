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
  const { name, gradeLevel, section, parentName, gender, lrn: customLrn } = req.body;
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
  const username = name.toLowerCase().replace(/\s+/g, '');
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
