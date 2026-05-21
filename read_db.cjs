const xlsx = require('xlsx');
const wb = xlsx.readFile('./server/data/database.xlsx');
console.log('Sheet names:', wb.SheetNames);
for (const name of wb.SheetNames) {
  const data = xlsx.utils.sheet_to_json(wb.Sheets[name]);
  console.log('\n=== ' + name + ' (' + data.length + ' rows) ===');
  console.log(JSON.stringify(data.slice(0, 50), null, 2));
}
