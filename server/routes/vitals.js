const auditLog = require('../utils/auditLog');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Add vitals (doctor only)
router.post('/', authMiddleware, async (req, res) => {
  const { patient_id, heart_rate, systolic, diastolic, temperature, oxygen_level, weight } = req.body;

  try {
    const newVital = await pool.query(
      'INSERT INTO vitals (patient_id, recorded_by, heart_rate, systolic, diastolic, temperature, oxygen_level, weight) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [patient_id, req.user.id, heart_rate, systolic, diastolic, temperature, oxygen_level, weight]
    );

    // Log the vitals entry
    await auditLog(req.user.id, 'ADD_VITALS', `Vitals added for patient #${patient_id}`, req.ip);

    res.status(201).json(newVital.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vitals for a patient
router.get('/:patient_id', authMiddleware, async (req, res) => {
  const { patient_id } = req.params;

  try {
    const vitals = await pool.query(
      'SELECT * FROM vitals WHERE patient_id = $1 ORDER BY recorded_at DESC',
      [patient_id]
    );
    
    res.json(vitals.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;