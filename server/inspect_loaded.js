const excelService = require('./excelService');
const db = excelService.getDb();
console.log('=== In-Memory excelService DB state ===');
console.log('schoolData:', db.schoolData);
console.log('schoolYears keys:', Object.keys(db.schoolYears));
const latestYear = Object.keys(db.schoolYears).sort().reverse()[0];
console.log(`Latest year: ${latestYear}`);
console.log(`Latest year totalStudents: ${db.schoolYears[latestYear].totalStudents}`);
console.log(`Latest year classrooms length: ${db.schoolYears[latestYear].classrooms.length}`);
db.schoolYears[latestYear].classrooms.forEach(c => {
  console.log(`- Grade: ${c.gradeLevel}, Section: ${c.section}, Enrollment: ${c.enrollment}, Repeaters: ${c.repeaters}, Teachers: ${c.teachers}`);
});
