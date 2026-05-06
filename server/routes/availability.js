const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const auditLog = require('../utils/auditLog');

// Set availability (doctor only)
router.post('/', authMiddleware, async (req, res) => {
  const { availabilities } = req.body;

  try {
    // Delete existing availability for this doctor
    await pool.query('DELETE FROM doctor_availability WHERE doctor_id = $1', [req.user.id]);

    // Insert new availability
    for (const slot of availabilities) {
      await pool.query(
        'INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, slot.day_of_week, slot.start_time, slot.end_time, slot.is_available]
      );
    }

    await auditLog(req.user.id, 'SET_AVAILABILITY', `Doctor updated their availability`, req.ip);

    res.json({ message: 'Availability updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get availability for a specific doctor
router.get('/:doctor_id', async (req, res) => {
  const { doctor_id } = req.params;

  try {
    const availability = await pool.query(
      'SELECT * FROM doctor_availability WHERE doctor_id = $1 AND is_available = true ORDER BY CASE day_of_week WHEN \'Monday\' THEN 1 WHEN \'Tuesday\' THEN 2 WHEN \'Wednesday\' THEN 3 WHEN \'Thursday\' THEN 4 WHEN \'Friday\' THEN 5 WHEN \'Saturday\' THEN 6 WHEN \'Sunday\' THEN 7 END',
      [doctor_id]
    );

    res.json(availability.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all doctors with their availability
router.get('/', async (req, res) => {
  try {
    const doctors = await pool.query(
      `SELECT u.id, u.full_name, u.email,
       json_agg(json_build_object(
         'day_of_week', da.day_of_week,
         'start_time', da.start_time,
         'end_time', da.end_time
       )) as availability
       FROM users u
       LEFT JOIN doctor_availability da ON u.id = da.doctor_id AND da.is_available = true
       WHERE u.role = 'doctor'
       GROUP BY u.id, u.full_name, u.email`,
    );

    res.json(doctors.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;