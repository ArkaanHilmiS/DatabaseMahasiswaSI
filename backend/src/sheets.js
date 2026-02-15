const { google } = require('googleapis');

// Inisialisasi Google Sheets client dengan Service Account
function getSheetClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// Ambil semua data mahasiswa dari sheet
async function getMahasiswa() {
  const sheets = getSheetClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${process.env.SHEET_NAME}!A:F`,
  });

  const rows = res.data.values;
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map(h => h.toLowerCase().trim());
  return rows.slice(1).map((row, index) => ({
    _row: index + 2, // baris di sheet (mulai dari 2 karena baris 1 = header)
    nim: row[headers.indexOf('nim')] || '',
    nama: row[headers.indexOf('nama')] || '',
    prodi: row[headers.indexOf('prodi')] || '',
    angkatan: row[headers.indexOf('angkatan')] || '',
    status: row[headers.indexOf('status')] || 'Aktif',
  }));
}

// Tambah data mahasiswa baru (append ke sheet)
async function addMahasiswa(data) {
  const sheets = getSheetClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${process.env.SHEET_NAME}!A:F`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[data.nim, data.nama, data.prodi, data.angkatan, data.status]],
    },
  });
}

// Update data mahasiswa berdasarkan nomor baris
async function updateMahasiswa(rowNumber, data) {
  const sheets = getSheetClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${process.env.SHEET_NAME}!A${rowNumber}:E${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[data.nim, data.nama, data.prodi, data.angkatan, data.status]],
    },
  });
}

module.exports = { getMahasiswa, addMahasiswa, updateMahasiswa };