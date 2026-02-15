const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware');
const { getMahasiswa, addMahasiswa, updateMahasiswa } = require('../sheets');

// GET /api/mahasiswa — semua role bisa akses
router.get('/', requireAuth, async (req, res) => {
  try {
    const data = await getMahasiswa();
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data dari Google Sheets' });
  }
});

// POST /api/mahasiswa — hanya admin dan owner
router.post('/', requireAuth, requireRole('admin', 'owner'), async (req, res) => {
  const { nim, nama, prodi, angkatan, status } = req.body;

  // Validasi sederhana
  if (!nim || !nama || !prodi || !angkatan) {
    return res.status(400).json({ error: 'NIM, Nama, Prodi, dan Angkatan wajib diisi' });
  }

  try {
    await addMahasiswa({ nim, nama, prodi, angkatan, status: status || 'Aktif' });
    res.json({ success: true, message: 'Data berhasil ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan data' });
  }
});

// PUT /api/mahasiswa/:row — hanya admin dan owner
router.put('/:row', requireAuth, requireRole('admin', 'owner'), async (req, res) => {
  const rowNumber = parseInt(req.params.row);
  const { nim, nama, prodi, angkatan, status } = req.body;

  if (!rowNumber || rowNumber < 2) {
    return res.status(400).json({ error: 'Nomor baris tidak valid' });
  }

  try {
    await updateMahasiswa(rowNumber, { nim, nama, prodi, angkatan, status });
    res.json({ success: true, message: 'Data berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengupdate data' });
  }
});

module.exports = router;