import XLSX from 'xlsx';

const Parse = (filename) => {
  try {
    const workbook = XLSX.readFile(filename);
    const result = {};

    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });

      // Clean and normalize keys
      const cleanedData = jsonData.map(row => {
        const cleanedRow = {};
        Object.keys(row).forEach(key => {
          const trimmedKey = key.trim();
          const normalizedKey = trimmedKey.split(' ')[0]; // remove units like (mg/L)
          cleanedRow[normalizedKey] = row[key];
        });
        return cleanedRow;
      });

      if (cleanedData.length > 0) {
        result[sheetName] = cleanedData;
      }
    });

    return result;

  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw error;
  }
};

export default Parse;
