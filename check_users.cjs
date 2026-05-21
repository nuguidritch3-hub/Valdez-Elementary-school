const excelService = require('./server/excelService');
const db = excelService.getDb();
console.log('Users in DB:', JSON.stringify(db.users, null, 2));
