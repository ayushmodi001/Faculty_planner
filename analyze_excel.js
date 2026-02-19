const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '7TH SEM CSE MASTER TT (1).xlsx');
const workbook = XLSX.readFile(filePath);
const targetSheet = '7CSE1';
const worksheet = workbook.Sheets[targetSheet];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`--- Rows 8-16 of ${targetSheet} ---`);
data.slice(8, 17).forEach((row, i) => {
    // Only print first 6 columns to avoid truncation
    const truncatedRow = row ? row.slice(0, 7) : [];
    console.log(`[Row ${8 + i}]`, JSON.stringify(truncatedRow));
});
