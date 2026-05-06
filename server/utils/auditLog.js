const pool = require('../db');

const auditLog = async (user_id, action, details, ip_address) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [user_id, action, details, ip_address]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

module.exports = auditLog;