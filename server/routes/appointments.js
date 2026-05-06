const auditLog = require('../utils/auditLog');
const sendEmail = require('../utils/email');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Book appointment (patient)
router.post('/', authMiddleware, async (req, res) => {
  const { doctor_id, appointment_date, notes } = req.body;

  try {
    const newAppointment = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, doctor_id, appointment_date, notes]
    );

    const appointment = newAppointment.rows[0];

    // Get patient name
    const patient = await pool.query(
      'SELECT full_name FROM users WHERE id = $1',
      [req.user.id]
    );

    // Send notification to doctor
    if (patient.rows.length > 0) {
      const message = `Appointment #${appointment.id}: ${patient.rows[0].full_name} has booked an appointment with you on ${new Date(appointment_date).toLocaleString()}.`;
      await pool.query(
        'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
        [doctor_id, message]
      );
    }

   // Log the booking
 await auditLog(req.user.id, 'BOOK_APPOINTMENT', `Patient booked appointment #${appointment.id}`, req.ip);

res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Get all appointments for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'patient') {
      appointments = await pool.query(
        'SELECT a.*, u.full_name as doctor_name FROM appointments a JOIN users u ON a.doctor_id = u.id WHERE a.patient_id = $1 ORDER BY a.appointment_date DESC',
        [req.user.id]
      );
    } else if (req.user.role === 'doctor') {
      appointments = await pool.query(
        'SELECT a.*, u.full_name as patient_name FROM appointments a JOIN users u ON a.patient_id = u.id WHERE a.doctor_id = $1 ORDER BY a.appointment_date DESC',
        [req.user.id]
      );
    } else {
      appointments = await pool.query(
        'SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name FROM appointments a JOIN users p ON a.patient_id = p.id JOIN users d ON a.doctor_id = d.id ORDER BY a.appointment_date DESC'
      );
    }

    res.json(appointments.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update appointment status (doctor/admin)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Get current appointment status first
    const current = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // If status is already the same don't update
    if (current.rows[0].status === status) {
      return res.json(current.rows[0]);
    }

    const updated = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    const appointment = updated.rows[0];

    // Create notification message
    let message = '';
    if (status === 'confirmed') {
      message = 'Your appointment has been confirmed by your doctor.';
    } else if (status === 'completed') {
      message = 'Your appointment has been marked as completed.';
    } else if (status === 'cancelled') {
      message = 'Your appointment has been cancelled.';
    }

    if (message) {
      // Check if notification already exists for this specific appointment and status
const notifMessage = `Appointment #${appointment.id}: ${message}`;
const existingNotif = await pool.query(
  'SELECT * FROM notifications WHERE user_id = $1 AND message = $2',
  [appointment.patient_id, notifMessage]
);

if (existingNotif.rows.length === 0) {
  await pool.query(
    'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
    [appointment.patient_id, notifMessage]
  );

        // Get patient email
        const patient = await pool.query(
          'SELECT email, full_name FROM users WHERE id = $1',
          [appointment.patient_id]
        );

        if (patient.rows.length > 0) {
          await sendEmail(
            patient.rows[0].email,
            'Appointment Update - ProHealth Nexus',
            `Dear ${patient.rows[0].full_name}, <br><br>${message}<br><br>Please log in to ProHealth Nexus to view your appointment details.`
          );
        }
      }
    }

    // Log the status update
 await auditLog(req.user.id, 'UPDATE_APPOINTMENT', `Appointment #${id} status changed to ${status}`, req.ip);

res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel appointment (patient only)
router.put('/cancel/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // Make sure the appointment belongs to the patient
    const appointment = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND patient_id = $2',
      [id, req.user.id]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.rows[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed appointment' });
    }

    if (appointment.rows[0].status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    // Cancel the appointment
    const updated = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );

    // Notify the doctor
    const notifMessage = `Appointment #${id}: A patient has cancelled their appointment scheduled for ${new Date(appointment.rows[0].appointment_date).toLocaleString()}.`;
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [appointment.rows[0].doctor_id, notifMessage]
    );

    // Send email to doctor
    const doctor = await pool.query(
      'SELECT email, full_name FROM users WHERE id = $1',
      [appointment.rows[0].doctor_id]
    );

    if (doctor.rows.length > 0) {
      await sendEmail(
        doctor.rows[0].email,
        'Appointment Cancelled - ProHealth Nexus',
        `Dear Dr. ${doctor.rows[0].full_name},<br><br>
        A patient has cancelled their appointment scheduled for ${new Date(appointment.rows[0].appointment_date).toLocaleString()}.<br><br>
        Please log in to ProHealth Nexus to view your updated schedule.`
      );
    }

    await auditLog(req.user.id, 'CANCEL_APPOINTMENT', `Patient cancelled appointment #${id}`, req.ip);

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;