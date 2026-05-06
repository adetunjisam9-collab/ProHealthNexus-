const auditLog = require('../utils/auditLog');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Add lab result (doctor)
router.post('/', authMiddleware, async (req, res) => {
  const { patient_id, test_name, result, unit, status } = req.body;

  try {
    const newResult = await pool.query(
      'INSERT INTO lab_results (patient_id, doctor_id, test_name, result, unit, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [patient_id, req.user.id, test_name, result, unit, status]
    );
// Log the lab result
await auditLog(req.user.id, 'ADD_LAB_RESULT', `Lab result added for patient #${patient_id}`, req.ip);
    res.status(201).json(newResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get lab results for a patient
router.get('/:patient_id', authMiddleware, async (req, res) => {
  const { patient_id } = req.params;

  try {
    const results = await pool.query(
      'SELECT * FROM lab_results WHERE patient_id = $1 ORDER BY test_date DESC',
      [patient_id]
    );

    res.json(results.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;