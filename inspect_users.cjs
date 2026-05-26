const excelService = require('./server/excelService');
const db = excelService.db;

console.log('Sample User from Users table:');
console.log(db.users[0]);
console.log(db.users.find(u => u.role === 'Teacher'));

console.log('\nSample Student from Students table:');
console.log(db.students[0]);
