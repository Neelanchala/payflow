function arrayToCsv(headers, rows) {
  const headerLine = headers.join(',');
  const dataLines = rows.map(row =>
    headers.map(h => {
      const val = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
}

module.exports = { arrayToCsv };
