const excelService = require('./server/excelService');
excelService.loadData();
const db = excelService.getDb();
const sy = 'S.Y. 2025-2026';
console.log('Raw classrooms data:');
db.schoolYears[sy].classrooms.forEach(c => {
  console.log(`'${c.gradeLevel}': len=${c.gradeLevel.length}`);
});
console.log('Full JSON object:');
console.log(JSON.stringify(db.schoolYears[sy].classrooms, null, 2));
