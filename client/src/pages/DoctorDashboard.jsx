import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const btnBase = {
  border: 'none', cursor: 'pointer', fontWeight: '600',
  transition: 'all 0.2s', fontFamily: 'inherit'
};


const DoctorDashboard = () => {
  const { user, token, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: '12px',
  border: `1.5px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
  fontFamily: 'inherit', background: darkMode ? '#0f172a' : 'white',
  color: darkMode ? '#e2e8f0' : '#374151'
};

  const card = {
  background: darkMode ? '#1e293b' : 'white',
  borderRadius: '16px',
  boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.07)',
  padding: '1.25rem'
};
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarRef = useRef(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);
const notifRef = useRef(null);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');
  const [vitalForm, setVitalForm] = useState({
    patient_id: '', heart_rate: '', systolic: '', diastolic: '',
    temperature: '', oxygen_level: '', weight: '',
  });
  const [labForm, setLabForm] = useState({
    patient_id: '', test_name: '', result: '', unit: '', status: 'normal',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState({
  Monday: { enabled: false, start: '09:00', end: '17:00' },
  Tuesday: { enabled: false, start: '09:00', end: '17:00' },
  Wednesday: { enabled: false, start: '09:00', end: '17:00' },
  Thursday: { enabled: false, start: '09:00', end: '17:00' },
  Friday: { enabled: false, start: '09:00', end: '17:00' },
  Saturday: { enabled: false, start: '09:00', end: '17:00' },
  Sunday: { enabled: false, start: '09:00', end: '17:00' },
});
const [availabilityMessage, setAvailabilityMessage] = useState('');
const [availabilityError, setAvailabilityError] = useState('');
const [appointmentSearch, setAppointmentSearch] = useState('');
const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const headers = { Authorization: `Bearer ${token}` };

 useEffect(() => { 
  fetchAppointments(); 
  fetchPatients();
  fetchNotifications();
  fetchAvailability();
}, []);

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (avatarRef.current && !avatarRef.current.contains(e.target)) {
      setShowAvatarMenu(false);
    }
    if (notifRef.current && !notifRef.current.contains(e.target)) {
      setShowNotifications(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
  const fetchAppointments = async () => {
    try {
      const res = await axios.get('https://prohealthnexus-api.onrender.com/api/appointments', { headers });
      setAppointments(res.data);
    } catch (err) { console.error(err); }
  };
const fetchPatients = async () => {
  try {
    const res = await axios.get('https://prohealthnexus-api.onrender.com/api/auth/patients', { headers });
    setPatients(res.data);
  } catch (err) { console.error(err); }
};
const fetchAvailability = async () => {
  try {
    const res = await axios.get(`https://prohealthnexus-api.onrender.com/api/availability/${user.id}`);
    if (res.data.length > 0) {
      const updatedAvailability = { ...availability };
      res.data.forEach(slot => {
        updatedAvailability[slot.day_of_week] = {
          enabled: true,
          start: slot.start_time.slice(0, 5),
          end: slot.end_time.slice(0, 5),
        };
      });
      setAvailability(updatedAvailability);
    }
  } catch (err) { console.error(err); }
};
const fetchNotifications = async () => {
  try {
    const res = await axios.get('https://prohealthnexus-api.onrender.com/api/notifications', { headers });
    setNotifications(res.data);
  } catch (err) { console.error(err); }
};
 const [updatingId, setUpdatingId] = useState(null);

const updateAppointmentStatus = async (id, status) => {
  if (updatingId === id) return;
  setUpdatingId(id);
  
  // Optimistic update — update UI instantly
  setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));

  try {
    await axios.put(`https://prohealthnexus-api.onrender.com/api/appointments/${id}`, { status }, { headers });
  } catch (err) {
    console.error(err);
    // Revert if failed
    fetchAppointments();
  } finally {
    setUpdatingId(null);
  }
};
  const handleVitalSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://prohealthnexus-api.onrender.com/api/vitals', vitalForm, { headers });
      setMessage('Vitals recorded successfully!');
      setError('');
      setVitalForm({ patient_id: '', heart_rate: '', systolic: '', diastolic: '', temperature: '', oxygen_level: '', weight: '' });
    } catch (err) { setError('Error recording vitals'); setMessage(''); }
  };

  const handleLabSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://prohealthnexus-api.onrender.com/api/labresults', labForm, { headers });
      setMessage('Lab result added successfully!');
      setError('');
      setLabForm({ patient_id: '', test_name: '', result: '', unit: '', status: 'normal' });
    } catch (err) { setError('Error adding lab result'); setMessage(''); }
  };

  const statusColor = (status) => {
    if (status === 'confirmed') return { bg: '#f0fdf4', color: '#16a34a' };
    if (status === 'completed') return { bg: '#eff6ff', color: '#2563eb' };
    if (status === 'cancelled') return { bg: '#fef2f2', color: '#dc2626' };
    return { bg: '#fffbeb', color: '#d97706' };
  };

  const tabs = ['appointments', 'record vitals', 'add lab result'];
  const [historyForm, setHistoryForm] = useState({
  patient_id: '',
  appointment_id: '',
  symptoms: '',
  diagnosis: '',
  treatment: '',
  prescription: '',
  notes: '',
});
const [historyMessage, setHistoryMessage] = useState('');
const [historyError, setHistoryError] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: darkMode ? '#0f172a' : '#f8faff', transition: 'background 0.3s' }}>
      {/* Navbar */}
<nav style={{
  background: darkMode ? '#1e293b' : 'white', padding: '0 1.5rem',
  boxShadow: darkMode ? '0 2px 20px rgba(0,0,0,0.3)' : '0 2px 20px rgba(0,0,0,0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  height: '64px', position: 'sticky', top: 0, zIndex: 100
}}>
  <Logo size="md" />

  {/* Desktop Center Nav */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', overflowX: 'auto', scrollbarWidth: 'none' }} className="desktop-nav">
    {['appointments', 'record vitals', 'add lab result', 'medical history', 'availability'].map(tab => (
      <button
        key={tab}
        onClick={() => { setActiveTab(tab); setMessage(''); setError(''); }}
        style={{
          ...btnBase, padding: '8px 14px',
          fontSize: '13px', textTransform: 'capitalize', background: 'none',
          color: activeTab === tab ? '#2563eb' : (darkMode ? '#94a3b8' : '#6b7280'),
          fontWeight: activeTab === tab ? '600' : '500',
          borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
          borderRadius: '0',
        }}
        onMouseEnter={e => { if (activeTab !== tab) e.target.style.color = darkMode ? '#e2e8f0' : '#374151'; }}
        onMouseLeave={e => { if (activeTab !== tab) e.target.style.color = darkMode ? '#94a3b8' : '#6b7280'; }}
      >
        {tab}
      </button>
    ))}
  </div>

  {/* Right Side */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
    {/* Dark Mode Toggle */}
    <button
      onClick={toggleDarkMode}
      style={{ ...btnBase, background: 'none', border: 'none', width: '38px', height: '38px', borderRadius: '10px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseEnter={e => { e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
    >
      <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`} style={{ color: darkMode ? '#fbbf24' : '#374151', fontSize: '16px' }}></i>
    </button>

    {/* Bell */}
    <div ref={notifRef} style={{ position: 'relative' }}>
      <button
        onClick={async () => {
          setShowNotifications(!showNotifications);
          if (!showNotifications && notifications.filter(n => !n.is_read).length > 0) {
            try {
              await Promise.all(
                notifications.filter(n => !n.is_read)
                  .map(n => axios.put(`https://prohealthnexus-api.onrender.com/api/notifications/${n.id}`, {}, { headers }))
              );
              setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            } catch (err) { console.error(err); }
          }
        }}
        style={{ ...btnBase, background: 'none', border: 'none', width: '38px', height: '38px', borderRadius: '10px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      >
        <i className="fa-solid fa-bell" style={{ fontSize: '16px', color: darkMode ? '#94a3b8' : '#374151' }}></i>
        {notifications.filter(n => !n.is_read).length > 0 && (
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            background: '#ef4444', color: 'white', fontSize: '10px',
            fontWeight: '700', borderRadius: '10px', padding: '1px 4px',
            minWidth: '16px', textAlign: 'center', lineHeight: '14px'
          }}>{notifications.filter(n => !n.is_read).length}</span>
        )}
      </button>

      {showNotifications && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowNotifications(false)} />
          <div style={{
            position: 'fixed', right: '1rem', top: '70px', width: 'min(300px, calc(100vw - 2rem))',
            background: darkMode ? '#1e293b' : 'white', borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 200,
            border: `1px solid ${darkMode ? '#334155' : '#f3f4f6'}`, overflow: 'hidden'
          }}>
            <div style={{ padding: '16px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f3f4f6'}`, fontWeight: '600', color: darkMode ? '#e2e8f0' : '#1e3a5f', fontSize: '14px' }}>
              <i className="fa-solid fa-bell" style={{ marginRight: '8px', color: '#2563eb' }}></i>
              Notifications
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No notifications yet</div>
            ) : (
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '14px 16px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f9fafb'}`,
                    background: n.is_read ? (darkMode ? '#1e293b' : 'white') : (darkMode ? '#1e3a5f' : '#eff6ff')
                  }}>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: darkMode ? '#e2e8f0' : '#374151' }}>{n.message}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>

    {/* Avatar Dropdown */}
    <div style={{ position: 'relative' }} ref={avatarRef}>
      <button
        onClick={() => setShowAvatarMenu(!showAvatarMenu)}
        style={{ ...btnBase, display: 'flex', alignItems: 'center', gap: '6px', background: 'none', padding: '6px 8px', borderRadius: '10px' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px', background: '#1e3a5f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0
        }}>
          {user.full_name.charAt(0).toUpperCase()}
        </div>
        <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', color: '#9ca3af' }} className="desktop-only"></i>
      </button>

      {showAvatarMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowAvatarMenu(false)} />
          <div style={{
            position: 'fixed', right: '1rem', top: '70px', width: 'min(200px, calc(100vw - 2rem))',
            background: darkMode ? '#1e293b' : 'white', borderRadius: '14px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)', zIndex: 200,
            border: `1px solid ${darkMode ? '#334155' : '#f3f4f6'}`, overflow: 'hidden'
          }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${darkMode ? '#334155' : '#f3f4f6'}` }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#1e3a5f' }}>Dr. {user.full_name}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            {[
              { icon: 'fa-user', label: 'My Profile', action: () => { navigate('/profile'); setShowAvatarMenu(false); } },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                style={{ ...btnBase, width: '100%', padding: '12px 16px', background: 'none', color: darkMode ? '#e2e8f0' : '#374151', fontSize: '13px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#334155' : '#f8faff'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <i className={`fa-solid ${item.icon}`} style={{ color: '#2563eb', width: '16px' }}></i>
                {item.label}
              </button>
            ))}
            <div style={{ borderTop: `1px solid ${darkMode ? '#334155' : '#f3f4f6'}` }}>
              <button
                onClick={logout}
                style={{ ...btnBase, width: '100%', padding: '12px 16px', background: 'none', color: '#dc2626', fontSize: '13px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#2d1b1b' : '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <i className="fa-solid fa-right-from-bracket" style={{ width: '16px' }}></i>
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>

    {/* Hamburger Menu - Mobile Only */}
    <button
      onClick={() => setShowMobileMenu(!showMobileMenu)}
      className="mobile-only"
      style={{ ...btnBase, background: 'none', border: 'none', width: '38px', height: '38px', borderRadius: '10px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <i className={`fa-solid ${showMobileMenu ? 'fa-xmark' : 'fa-bars'}`} style={{ color: darkMode ? '#e2e8f0' : '#374151' }}></i>
    </button>
  </div>
</nav>

{/* Mobile Tab Menu */}
{showMobileMenu && (
  <div style={{
    background: darkMode ? '#1e293b' : 'white',
    borderBottom: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
    padding: '8px 1rem', display: 'flex', flexDirection: 'column', gap: '4px',
    position: 'sticky', top: '64px', zIndex: 99
  }} className="mobile-menu">
    {[
      { tab: 'appointments', icon: 'fa-calendar-check' },
      { tab: 'record vitals', icon: 'fa-heart-pulse' },
      { tab: 'add lab result', icon: 'fa-flask' },
      { tab: 'medical history', icon: 'fa-file-medical' },
      { tab: 'availability', icon: 'fa-calendar-days' },
    ].map(({ tab, icon }) => (
      <button
        key={tab}
        onClick={() => { setActiveTab(tab); setMessage(''); setError(''); setShowMobileMenu(false); }}
        style={{
          ...btnBase, padding: '12px 16px', borderRadius: '10px',
          fontSize: '14px', textTransform: 'capitalize', textAlign: 'left',
          background: activeTab === tab ? (darkMode ? '#334155' : '#eff6ff') : 'none',
          color: activeTab === tab ? '#2563eb' : (darkMode ? '#94a3b8' : '#6b7280'),
          fontWeight: activeTab === tab ? '600' : '500',
        }}
      >
        <i className={`fa-solid ${icon}`} style={{ marginRight: '10px', color: activeTab === tab ? '#2563eb' : '#9ca3af' }}></i>
        {tab}
      </button>
    ))}
  </div>
)}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
borderRadius: '16px', padding: '1.25rem 1.75rem', marginBottom: '1.5rem',
boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: 'white', margin: '0 0 4px', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
  <i className="fa-solid fa-stethoscope"></i>
  Good day, Dr. {user.full_name.split(' ')[0]}
</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
            {appointments.filter(a => a.status === 'pending').length} pending appointments today
          </p>
        </div>

        

        {message && (
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #bbf7d0' }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
  <div className="fade-in">
           <div style={{ marginBottom: '1rem' }}>
  <h3 style={{ color: darkMode ? '#e2e8f0' : '#1e3a5f', fontWeight: '700', fontSize: '16px', margin: '0 0 10px' }}>My Appointments</h3>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
    <div style={{ position: 'relative' }}>
      <i className="fa-solid fa-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '13px' }}></i>
      <input
        type="text"
        placeholder="Search patient..."
        value={appointmentSearch}
        onChange={e => setAppointmentSearch(e.target.value)}
        style={{ padding: '8px 12px 8px 32px', borderRadius: '10px', border: `1.5px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px', outline: 'none', fontFamily: 'inherit', width: 'min(160px, 100%)' }}
        onFocus={e => e.target.style.borderColor = '#2563eb'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
    </div>
    <select
      value={appointmentStatusFilter}
      onChange={e => setAppointmentStatusFilter(e.target.value)}
      style={{ padding: '8px 12px', borderRadius: '10px', border: `1.5px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: darkMode ? '#0f172a' : 'white', cursor: 'pointer' }}
    >
      <option value="all">All Status</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  </div>
</div>
            {appointments.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No appointments yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appointments.filter(appt => {
  const matchesSearch = appt.patient_name?.toLowerCase().includes(appointmentSearch.toLowerCase());
  const matchesStatus = appointmentStatusFilter === 'all' || appt.status === appointmentStatusFilter;
  return matchesSearch && matchesStatus;
}).map(appt => {
                  const s = statusColor(appt.status);
                  return (
                    <div key={appt.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: '600', color: '#1e3a5f', margin: '0 0 4px' }}>{appt.patient_name}</p>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>{new Date(appt.appointment_date).toLocaleString()}</p>
                        {appt.notes && <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{appt.notes}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
                          {appt.status}
                        </span>
                        {appt.status === 'pending' && (
<button
  onClick={() => updateAppointmentStatus(appt.id, 'confirmed')}
  disabled={updatingId === appt.id}
  style={{ ...btnBase, padding: '6px 14px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', fontSize: '12px', opacity: updatingId === appt.id ? 0.6 : 1 }}
  onMouseEnter={e => { if (updatingId !== appt.id) { e.target.style.background = '#dcfce7'; e.target.style.transform = 'translateY(-1px)'; }}}
  onMouseLeave={e => { e.target.style.background = '#f0fdf4'; e.target.style.transform = 'translateY(0)'; }}
>
  {updatingId === appt.id ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Confirm'}
</button>
                        )}
                        {appt.status === 'confirmed' && (
                          <button
  onClick={() => updateAppointmentStatus(appt.id, 'completed')}
  disabled={updatingId === appt.id}
  style={{ ...btnBase, padding: '6px 14px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', fontSize: '12px', opacity: updatingId === appt.id ? 0.6 : 1 }}
  onMouseEnter={e => { if (updatingId !== appt.id) { e.target.style.background = '#dbeafe'; e.target.style.transform = 'translateY(-1px)'; }}}
  onMouseLeave={e => { e.target.style.background = '#eff6ff'; e.target.style.transform = 'translateY(0)'; }}
>
  {updatingId === appt.id ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Complete'}
</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Record Vitals Tab */}
        {activeTab === 'record vitals' && (
  <div className="fade-in" style={{ ...card, maxWidth: '520px' }}>
            <h3 style={{ color: '#1e3a5f', fontWeight: '700', marginBottom: '1.5rem', fontSize: '16px' }}>Record Patient Vitals</h3>
            <form onSubmit={handleVitalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '6px' }}>Select Patient</label>
  <select
    value={vitalForm.patient_id}
    onChange={e => setVitalForm({ ...vitalForm, patient_id: e.target.value })}
    style={{ ...inputStyle, background: darkMode ? '#0f172a' : 'white' }}
    onFocus={e => e.target.style.borderColor = '#2563eb'}
    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
    required
  >
    <option value="">-- Select a patient --</option>
    {patients.map(p => (
      <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
    ))}
  </select>
</div>

{[
  { label: 'Heart Rate (bpm)', name: 'heart_rate', type: 'number' },
  { label: 'Systolic BP (mmHg)', name: 'systolic', type: 'number' },
  { label: 'Diastolic BP (mmHg)', name: 'diastolic', type: 'number' },
  { label: 'Temperature (°C)', name: 'temperature', type: 'number' },
  { label: 'Oxygen Level (%)', name: 'oxygen_level', type: 'number' },
  { label: 'Weight (kg)', name: 'weight', type: 'number' },
].map(field => (
  <div key={field.name}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '6px' }}>{field.label}</label>
    <input
      type={field.type}
      name={field.name}
      value={vitalForm[field.name]}
      onChange={e => setVitalForm({ ...vitalForm, [e.target.name]: e.target.value })}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = '#2563eb'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      required
    />
  </div>
))}
              <button
              type="submit"
              style={{
              ...btnBase, padding: '13px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white', fontSize: '15px',
              boxShadow: 'none',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
      >
              Save Vitals
              </button>
            </form>
          </div>
        )}

        {/* Add Lab Result Tab */}
        {activeTab === 'add lab result' && (
  <div className="fade-in" style={{ ...card, maxWidth: '520px' }}>
            <h3 style={{ color: '#1e3a5f', fontWeight: '700', marginBottom: '1.5rem', fontSize: '16px' }}>Add Lab Result</h3>
            <form onSubmit={handleLabSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '6px' }}>Select Patient</label>
  <select
    value={labForm.patient_id}
    onChange={e => setLabForm({ ...labForm, patient_id: e.target.value })}
    style={{ ...inputStyle, background: darkMode ? '#0f172a' : 'white' }}
    onFocus={e => e.target.style.borderColor = '#2563eb'}
    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
    required
  >
    <option value="">-- Select a patient --</option>
    {patients.map(p => (
      <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
    ))}
  </select>
</div>

{[
  { label: 'Test Name', name: 'test_name', type: 'text' },
  { label: 'Result', name: 'result', type: 'text' },
  { label: 'Unit', name: 'unit', type: 'text' },
].map(field => (
  <div key={field.name}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '6px' }}>{field.label}</label>
    <input
      type={field.type}
      name={field.name}
      value={labForm[field.name]}
      onChange={e => setLabForm({ ...labForm, [e.target.name]: e.target.value })}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = '#2563eb'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      required
    />
  </div>
))}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '6px' }}>Status</label>
                <select
                  name="status"
                  value={labForm.status}
                  onChange={e => setLabForm({ ...labForm, status: e.target.value })}
                  style={{ ...inputStyle, background: darkMode ? '#0f172a' : 'white' }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button
                type="submit"
                style={{
                  ...btnBase, padding: '13px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white', fontSize: '15px',
                  boxShadow: '0 4px 15px rgba(37,99,235,0.4)'
                }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
              >
                Save Lab Result
              </button>
            </form>
          </div>
        )}
        {/* Medical History Tab */}
{activeTab === 'medical history' && (
  <div className="fade-in" style={{ maxWidth: '560px' }}>
    <h3 style={{ color: '#1e3a5f', fontWeight: '700', marginBottom: '1rem', fontSize: '16px' }}>
      <i className="fa-solid fa-file-medical" style={{ marginRight: '8px', color: '#2563eb' }}></i>
      Add Medical History
    </h3>
    <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '16px', boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.07)', padding: '1.5rem' }}>
      {historyMessage && (
        <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #bbf7d0' }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i>{historyMessage}
        </div>
      )}
      {historyError && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #fecaca' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>{historyError}
        </div>
      )}
      <form onSubmit={async (e) => {
        e.preventDefault();
        setHistoryMessage('');
        setHistoryError('');
        try {
  await axios.post('https://prohealthnexus-api.onrender.com/api/medical-history', historyForm, { headers });
  setHistoryMessage('Medical history added successfully!');
  setHistoryForm({ patient_id: '', appointment_id: '', symptoms: '', diagnosis: '', treatment: '', prescription: '', notes: '' });
  setTimeout(() => setHistoryMessage(''), 3000);
} catch (err) {
  setHistoryError(err.response?.data?.error || 'Failed to add medical history');
  setTimeout(() => setHistoryError(''), 3000);
}
      }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '6px' }}>Select Patient</label>
          <select
            value={historyForm.patient_id}
            onChange={e => setHistoryForm({ ...historyForm, patient_id: e.target.value })}
           style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1.5px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#e2e8f0' : '#374151' }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            required
          >
            <option value="">-- Select a patient --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
            ))}
          </select>
        </div>

        {[
          { label: 'Symptoms', name: 'symptoms', placeholder: 'Describe the patient\'s symptoms...' },
          { label: 'Diagnosis', name: 'diagnosis', placeholder: 'Enter diagnosis...' },
          { label: 'Treatment Plan', name: 'treatment', placeholder: 'Describe the treatment plan...' },
          { label: 'Prescription', name: 'prescription', placeholder: 'List medications and dosage...' },
          { label: 'Additional Notes', name: 'notes', placeholder: 'Any additional notes...' },
        ].map(field => (
          <div key={field.name}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '6px' }}>{field.label}</label>
            <textarea
              value={historyForm[field.name]}
              onChange={e => setHistoryForm({ ...historyForm, [field.name]: e.target.value })}
              placeholder={field.placeholder}
              rows={3}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1.5px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        ))}

        <button
          type="submit"
          style={{
            padding: '13px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            color: 'white', fontWeight: '600', fontSize: '15px',
            cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'none', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
        >
          <i className="fa-solid fa-file-medical" style={{ marginRight: '8px' }}></i>
          Save Medical History
        </button>
      </form>
    </div>
  </div>
)}

{/* Availability Tab */}
{activeTab === 'availability' && (
  <div className="fade-in" style={{ maxWidth: '560px' }}>
    <h3 style={{ color: '#1e3a5f', fontWeight: '700', marginBottom: '1rem', fontSize: '16px' }}>
      <i className="fa-solid fa-calendar-days" style={{ marginRight: '8px', color: '#2563eb' }}></i>
      Set My Availability
    </h3>
    <div style={{ background: darkMode ? '#0f172a' : 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', padding: '1.5rem' }}>
      {availabilityMessage && (
        <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #bbf7d0' }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i>{availabilityMessage}
        </div>
      )}
      {availabilityError && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #fecaca' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>{availabilityError}
        </div>
      )}

      <p style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#6b7280', marginBottom: '1.5rem' }}>
        Select the days you are available and set your working hours for each day.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
        {Object.keys(availability).map(day => (
          <div key={day} style={{
            padding: '14px 16px', borderRadius: '12px',
            border: `1.5px solid ${availability[day].enabled ? '#2563eb' : '#e5e7eb'}`,
            background: availability[day].enabled ? '#f8faff' : 'white',
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={availability[day].enabled}
                  onChange={e => setAvailability(prev => ({
                    ...prev,
                    [day]: { ...prev[day], enabled: e.target.checked }
                  }))}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '600', color: '#1e3a5f', fontSize: '14px' }}>{day}</span>
              </div>
              {availability[day].enabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="time"
                    value={availability[day].start}
                    onChange={e => setAvailability(prev => ({
                      ...prev,
                      [day]: { ...prev[day], start: e.target.value }
                    }))}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: `1.5px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>to</span>
                  <input
                    type="time"
                    value={availability[day].end}
                    onChange={e => setAvailability(prev => ({
                      ...prev,
                      [day]: { ...prev[day], end: e.target.value }
                    }))}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: `1.5px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={async () => {
          setAvailabilityMessage('');
          setAvailabilityError('');
          const availabilities = Object.keys(availability)
            .filter(day => availability[day].enabled)
            .map(day => ({
              day_of_week: day,
              start_time: availability[day].start,
              end_time: availability[day].end,
              is_available: true
            }));

          try {
            const res = await axios.post('https://prohealthnexus-api.onrender.com/api/availability', { availabilities }, { headers });
            setAvailabilityMessage(res.data.message);
            setTimeout(() => setAvailabilityMessage(''), 3000);
          } catch (err) {
            setAvailabilityError(err.response?.data?.error || 'Failed to update availability');
          }
        }}
        style={{
          width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
          background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
          color: 'white', fontWeight: '600', fontSize: '15px',
          cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'none', transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
      >
        <i className="fa-solid fa-calendar-check" style={{ marginRight: '8px' }}></i>
        Save Availability
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default DoctorDashboard;