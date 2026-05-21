const xlsx = require('xlsx');

const createMockExcel = () => {
  const workbook = xlsx.utils.book_new();

  // 1. Users Sheet
  const usersData = [
    { id: 'A001', name: 'Admin Principal', role: 'Admin', username: 'admin', password: 'password123' },
    { id: 'T101', name: 'Maria Santos', role: 'Teacher', gradeLevel: 'Grade 1', section: 'Mabini', username: 'teacher_maria', password: 'password123' },
    { id: 'T102', name: 'Leni Robredo', role: 'Teacher', gradeLevel: 'Grade 2', section: 'Bonifacio', username: 'teacher_leni', password: 'password123' },
    { id: 'S201', name: 'Juan Dela Cruz', role: 'Student', gradeLevel: 'Grade 1', section: 'Mabini', username: 'student_juan', password: 'password123' }
  ];
  const usersSheet = xlsx.utils.json_to_sheet(usersData);
  xlsx.utils.book_append_sheet(workbook, usersSheet, 'Users');

  // 2. Classrooms Sheet
  const classroomsData = [
    { gradeLevel: 'Kinder', section: 'Rizal', adviser: 'TBD', totalSeats: 30, bosyEnrollment: 28, dropouts: 0, repeaters: 1 },
    { gradeLevel: 'Grade 1', section: 'Mabini', adviser: 'Maria Santos', totalSeats: 40, bosyEnrollment: 38, dropouts: 1, repeaters: 2 },
    { gradeLevel: 'Grade 2', section: 'Bonifacio', adviser: 'TBD', totalSeats: 40, bosyEnrollment: 35, dropouts: 0, repeaters: 0 }
  ];
  const classroomsSheet = xlsx.utils.json_to_sheet(classroomsData);
  xlsx.utils.book_append_sheet(workbook, classroomsSheet, 'Classrooms');

  // 3. Students Sheet
  const studentsData = [
    { id: 'S201', lrn: '109876543210', name: 'Juan Dela Cruz', gender: 'Male', gradeLevel: 'Grade 1', section: 'Mabini', status: 'Enrolled', Math_Q1: 72, Math_Q2: 75, Math_Q3: '', Math_Q4: '', Science_Q1: 82, Science_Q2: 85, Science_Q3: '', Science_Q4: '', English_Q1: 90, English_Q2: 92, English_Q3: '', English_Q4: '', Filipino_Q1: 88, Filipino_Q2: 87, Filipino_Q3: '', Filipino_Q4: '', MAPEH_Q1: 89, MAPEH_Q2: 91, MAPEH_Q3: '', MAPEH_Q4: '', Makabayan_Q1: 86, Makabayan_Q2: 89, Makabayan_Q3: '', Makabayan_Q4: '' },
    { id: 'S202', lrn: '109876543211', name: 'Ana Reyes', gender: 'Female', gradeLevel: 'Grade 1', section: 'Mabini', status: 'Enrolled', Math_Q1: 90, Math_Q2: 92, Math_Q3: '', Math_Q4: '', Science_Q1: 88, Science_Q2: 90, Science_Q3: '', Science_Q4: '', English_Q1: 95, English_Q2: 94, English_Q3: '', English_Q4: '', Filipino_Q1: 92, Filipino_Q2: 91, Filipino_Q3: '', Filipino_Q4: '', MAPEH_Q1: 93, MAPEH_Q2: 91, MAPEH_Q3: '', MAPEH_Q4: '', Makabayan_Q1: 89, Makabayan_Q2: 90, Makabayan_Q3: '', Makabayan_Q4: '' },
    { id: 'S203', lrn: '109876543212', name: 'Pedro Penduko', gender: 'Male', gradeLevel: 'Grade 1', section: 'Mabini', status: 'Dropped', Math_Q1: 75, Math_Q2: '', Math_Q3: '', Math_Q4: '', Science_Q1: 78, Science_Q2: '', Science_Q3: '', Science_Q4: '', English_Q1: 74, English_Q2: '', English_Q3: '', English_Q4: '', Filipino_Q1: 76, Filipino_Q2: '', Filipino_Q3: '', Filipino_Q4: '', MAPEH_Q1: 81, MAPEH_Q2: '', MAPEH_Q3: '', MAPEH_Q4: '', Makabayan_Q1: 80, Makabayan_Q2: '', Makabayan_Q3: '', Makabayan_Q4: '' }
  ];
  const studentsSheet = xlsx.utils.json_to_sheet(studentsData);
  xlsx.utils.book_append_sheet(workbook, studentsSheet, 'Students');

  // 4. Announcements Sheet
  const announcementsData = [
    { id: 1, title: 'Welcome to S.Y. 2025-2026!', date: '2025-08-01', content: 'Welcome to the new school year at Valdez Elementary School. Let\'s make this year a great one!', target: 'All' },
    { id: 2, title: 'PTA Meeting for Grade 1', date: '2025-09-15', content: 'There will be a PTA meeting for all Grade 1 parents on Friday at 3:00 PM.', target: 'Grade 1' }
  ];
  const announcementsSheet = xlsx.utils.json_to_sheet(announcementsData);
  xlsx.utils.book_append_sheet(workbook, announcementsSheet, 'Announcements');

  // Write to file
  const fs = require('fs');
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }
  xlsx.writeFile(workbook, './data/VALDEZ-ES_SCHOOL-DATA_2.xlsx');
  console.log('Mock Excel file created at ./data/VALDEZ-ES_SCHOOL-DATA_2.xlsx');
};

createMockExcel();
