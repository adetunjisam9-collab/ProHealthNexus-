const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const auditLog = require('../utils/auditLog');

// Add medical history (doctor only)
router.post('/', authMiddleware, async (req, res) => {
  const { patient_id, appointment_id, symptoms, diagnosis, treatment, prescription, notes } = req.body;

  try {
    const newRecord = await pool.query(
      'INSERT INTO medical_history (patient_id, doctor_id, appointment_id, symptoms, diagnosis, treatment, prescription, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [patient_id, req.user.id, appointment_id || null, symptoms, diagnosis, treatment, prescription, notes]
    );

    await auditLog(req.user.id, 'ADD_MEDICAL_HISTORY', `Medical history added for patient #${patient_id}`, req.ip);

    res.status(201).json(newRecord.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get medical history for a patient
router.get('/:patient_id', authMiddleware, async (req, res) => {
  const { patient_id } = req.params;

  try {
    const records = await pool.query(
      `SELECT m.*, u.full_name as doctor_name, a.appointment_date 
       FROM medical_history m 
       JOIN users u ON m.doctor_id = u.id 
       LEFT JOIN appointments a ON m.appointment_id = a.id
       WHERE m.patient_id = $1 
       ORDER BY m.created_at DESC`,
      [patient_id]
    );

    await auditLog(req.user.id, 'VIEW_MEDICAL_HISTORY', `Viewed medical history for patient #${patient_id}`, req.ip);

    res.json(records.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;