const xlsx = require('xlsx');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'data', 'database.xlsx');

function restoreDatabase() {
  console.log('--- Restoring S.Y. 2025-2026 Census Totals in database.xlsx ---');
  try {
    const workbook = xlsx.readFile(FILE_PATH);
    const sheet = workbook.Sheets['VALDEZ ES'];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Find where S.Y. 2025-2026 starts
    let startIdx = -1;
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && row[0] && String(row[0]).trim() === 'S.Y. 2025-2026') {
        startIdx = i;
        break;
      }
    }

    if (startIdx === -1) {
      console.error('Could not find S.Y. 2025-2026 row!');
      return;
    }

    console.log(`Found S.Y. 2025-2026 at row ${startIdx + 1}`);

    const origSheet = workbook.Sheets['VALDEZ ES'];
    
    function setCell(sheet, rowIdx, colIdx, val) {
      const cellAddress = xlsx.utils.encode_cell({ r: rowIdx, c: colIdx });
      if (!sheet[cellAddress]) {
        sheet[cellAddress] = { t: 'n' };
      }
      sheet[cellAddress].v = val;
      if (typeof val === 'number') {
        sheet[cellAddress].t = 'n';
      } else {
        sheet[cellAddress].t = 's';
      }
    }

    // Edit cells directly on the original sheet to preserve all structural properties!
    // Kinder
    setCell(origSheet, startIdx + 2, 1, 53);
    setCell(origSheet, startIdx + 2, 2, 1);
    setCell(origSheet, startIdx + 2, 3, 0);

    // Grade 1
    setCell(origSheet, startIdx + 3, 1, 73);
    setCell(origSheet, startIdx + 3, 2, 3);
    setCell(origSheet, startIdx + 3, 3, 1);

    // Grade 2
    setCell(origSheet, startIdx + 4, 1, 67);
    setCell(origSheet, startIdx + 4, 2, 0);
    setCell(origSheet, startIdx + 4, 3, 0);

    // Grade 3
    setCell(origSheet, startIdx + 5, 1, 80);
    setCell(origSheet, startIdx + 5, 2, 1);
    setCell(origSheet, startIdx + 5, 3, 0);

    // Grade 4
    setCell(origSheet, startIdx + 6, 1, 75);
    setCell(origSheet, startIdx + 6, 2, 0);
    setCell(origSheet, startIdx + 6, 3, 0);

    // Grade 5
    setCell(origSheet, startIdx + 7, 1, 80);
    setCell(origSheet, startIdx + 7, 2, 0);
    setCell(origSheet, startIdx + 7, 3, 0);

    // Grade 6
    setCell(origSheet, startIdx + 8, 1, 70);
    setCell(origSheet, startIdx + 8, 2, 0);
    setCell(origSheet, startIdx + 8, 3, 0);

    // Total
    setCell(origSheet, startIdx + 10, 1, 498);
    setCell(origSheet, startIdx + 10, 2, 5);
    setCell(origSheet, startIdx + 10, 3, 1);

    xlsx.writeFile(workbook, FILE_PATH);
    console.log('database.xlsx updated successfully and saved!');

  } catch (err) {
    console.error('Error restoring database:', err);
  }
}

restoreDatabase();
