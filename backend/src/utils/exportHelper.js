import * as XLSX from 'xlsx';

/**
 * Converts array of records to formatted CSV string.
 */
export function generateCsv(records, fields) {
  if (!records || records.length === 0) {
    return fields.map(f => `"${f.label}"`).join(',') + '\n';
  }

  const header = fields.map(f => `"${f.label}"`).join(',');
  const rows = records.map(record => {
    return fields
      .map(f => {
        let val = typeof f.key === 'function' ? f.key(record) : record[f.key];
        if (val === null || val === undefined) val = '';
        const strVal = String(val).replace(/"/g, '""'); // escape double quotes
        return `"${strVal}"`;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Generates an Excel XLSX buffer from an array of records.
 */
export function generateExcelBuffer(records, fields, sheetName = 'BizWebCheck Results') {
  const data = records.map(record => {
    const row = {};
    fields.forEach(f => {
      const val = typeof f.key === 'function' ? f.key(record) : record[f.key];
      row[f.label] = val !== undefined && val !== null ? val : '';
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
