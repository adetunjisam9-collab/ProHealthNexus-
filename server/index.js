const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const authRoutes = require('./routes/auth');
const vitalsRoutes = require('./routes/vitals');
const appointmentsRoutes = require('./routes/appointments');
const labResultsRoutes = require('./routes/labresults');
const notificationsRoutes = require('./routes/notifications');
const medicalHistoryRoutes = require('./routes/medicalhistory');
const availabilityRoutes = require('./routes/availability');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/labresults', labResultsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/medical-history', medicalHistoryRoutes);
app.use('/api/availability', availabilityRoutes);

app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ message: 'ProHealth Nexus API is running and DB connected!' });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});