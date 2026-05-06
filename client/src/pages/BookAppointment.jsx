import Logo from '../components/Logo';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const btnBase = {
  border: 'none', cursor: 'pointer', fontWeight: '600',
  transition: 'all 0.2s', fontFamily: 'inherit'
};


const BookAppointment = () => {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: '12px',
  border: `1.5px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
  fontFamily: 'inherit', background: darkMode ? '#0f172a' : 'white',
  color: darkMode ? '#e2e8f0' : '#374151'
};
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [formData, setFormData] = useState({ doctor_id: '', appointment_date: '', notes: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/doctors');
      setDoctors(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchDoctorAvailability = async (doctorId) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/availability/${doctorId}`);
    setDoctorAvailability(res.data);
  } catch (err) { console.error(err); }
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setMessage('');

  // Validate against doctor availability
  if (doctorAvailability.length > 0 && formData.appointment_date) {
    const selectedDate = new Date(formData.appointment_date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDay = days[selectedDate.getDay()];
    const selectedTime = selectedDate.toTimeString().slice(0, 5);

    const availableSlot = doctorAvailability.find(slot => slot.day_of_week === selectedDay);

    if (!availableSlot) {
      setError(`This doctor is not available on ${selectedDay}. Please choose a different day.`);
      setLoading(false);
      return;
    }

    if (selectedTime < availableSlot.start_time.slice(0, 5) || selectedTime > availableSlot.end_time.slice(0, 5)) {
      setError(`This doctor is only available from ${availableSlot.start_time.slice(0, 5)} to ${availableSlot.end_time.slice(0, 5)} on ${selectedDay}.`);
      setLoading(false);
      return;
    }
  }

  try {
    await axios.post('http://localhost:5000/api/appointments', formData, { headers });
      setMessage('Appointment booked successfully!');
      setFormData({ doctor_id: '', appointment_date: '', notes: '' });
      setTimeout(() => navigate('/patient'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: darkMode ? '#0f172a' : '#f8faff', transition: 'background 0.3s' }}>
      {/* Navbar */}
      <nav style={{
        background: 'white', padding: '0 2rem',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px', position: 'sticky', top: 0, zIndex: 100
      }}>
        <Logo size="lg" />
        <button
          onClick={() => navigate('/patient')}
          style={{ ...btnBase, padding: '8px 16px', borderRadius: '10px', background: '#f3f4f6', color: '#374151', fontSize: '13px' }}
          onMouseEnter={e => { e.target.style.background = '#e5e7eb'; e.target.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.target.style.background = '#f3f4f6'; e.target.style.transform = 'translateY(0)'; }}
        >
          <i className="fa-solid fa-arrow-left" style={{ fontSize: '13px', marginRight: '6px' }}></i>Back to Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{
         background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
          borderRadius: '20px', padding: '1.5rem 2rem', marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: 'white', margin: '0 0 4px', fontSize: '22px', fontWeight: '700' }}>
            Book an Appointment 📅
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
            Schedule a visit with one of our doctors
          </p>
        </div>

        <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.07)', padding: '2rem' }}>
          {message && (
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #bbf7d0' }}>
              ✅ {message} Redirecting...
            </div>
          )}
          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151' }}>
                Select Doctor
              </label>
              <select
  value={formData.doctor_id}
  onChange={e => {
    setFormData({ ...formData, doctor_id: e.target.value });
    if (e.target.value) fetchDoctorAvailability(e.target.value);
    else setDoctorAvailability([]);
  }}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                required
              >
                <option value="">-- Choose a doctor --</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>Dr. {doctor.full_name}</option>
                ))}
              </select>
            </div>

{doctorAvailability.length > 0 && (
  <div style={{ background: darkMode ? '#1e293b' : '#f8faff', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}` }}>
    <p style={{ fontSize: '12px', fontWeight: '600', color: '#1e3a5f', margin: '0 0 8px' }}>
      <i className="fa-solid fa-clock" style={{ marginRight: '6px', color: '#2563eb' }}></i>
      Doctor's Available Hours
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {doctorAvailability.map((slot, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#374151', fontWeight: '500' }}>{slot.day_of_week}</span>
          <span style={{ color: '#6b7280' }}>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
        </div>
      ))}
    </div>
  </div>
)}

{formData.doctor_id && doctorAvailability.length === 0 && (
  <div style={{ background: '#fffbeb', padding: '12px 16px', borderRadius: '12px', border: '1px solid #fde68a', fontSize: '12px', color: '#d97706' }}>
    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
    This doctor has not set their availability yet. You can still book an appointment.
  </div>
)}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151' }}>
                Appointment Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.appointment_date}
                onChange={e => setFormData({ ...formData, appointment_date: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '6px' }}>
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Describe your symptoms or reason for visit..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...btnBase, padding: '13px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white', fontSize: '15px',
                boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;