import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';


const btnBase = {
  border: 'none', cursor: 'pointer', fontWeight: '600',
  transition: 'all 0.2s', fontFamily: 'inherit'
};


const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const card = {
  background: darkMode ? '#1e293b' : 'white',
  borderRadius: '16px',
  boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.07)',
  padding: '1.25rem'
};
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [auditLogs, setAuditLogs] = useState([]);
  const [adminForm, setAdminForm] = useState({ full_name: '', email: '', password: '' });
const [adminMessage, setAdminMessage] = useState('');
const [adminError, setAdminError] = useState('');
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
const avatarRef = useRef(null);
const [showMobileMenu, setShowMobileMenu] = useState(false);
const [userSearch, setUserSearch] = useState('');
const [userRoleFilter, setUserRoleFilter] = useState('all');
const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
  const handleClickOutside = (e) => {
    if (avatarRef.current && !avatarRef.current.contains(e.target)) {
      setShowAvatarMenu(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  const fetchData = async () => {
  try {
    const [usersRes, appointmentsRes, auditRes] = await Promise.all([
      axios.get('https://prohealthnexus-api.onrender.com/api/auth/users', { headers }),
      axios.get('https://prohealthnexus-api.onrender.com/api/appointments', { headers }),
      axios.get('https://prohealthnexus-api.onrender.com/api/auth/audit-logs', { headers }),
    ]);
    setUsers(usersRes.data);
    setAppointments(appointmentsRes.data);
    setAuditLogs(auditRes.data);
  } catch (err) { console.error(err); }
};

  const patients = users.filter(u => u.role === 'patient');
  const doctors = users.filter(u => u.role === 'doctor');

  const roleStyle = (role) => {
    if (role === 'doctor') return { bg: '#eff6ff', color: '#2563eb' };
    if (role === 'admin') return { bg: '#f5f3ff', color: '#7c3aed' };
    return { bg: '#f0fdf4', color: '#16a34a' };
  };

  const statusColor = (status) => {
    if (status === 'confirmed') return { bg: '#f0fdf4', color: '#16a34a' };
    if (status === 'completed') return { bg: '#eff6ff', color: '#2563eb' };
    if (status === 'cancelled') return { bg: '#fef2f2', color: '#dc2626' };
    return { bg: '#fffbeb', color: '#d97706' };
  };

  const statCards = [
  { label: 'Total Users', value: users.length, color: '#2563eb', bg: darkMode ? '#1b1d2d' : '#eff6ff', icon: 'fa-users' },
{ label: 'Patients', value: patients.length, color: '#16a34a', bg: darkMode ? '#0f2419' : '#f0fdf4', icon: 'fa-hospital-user' },
{ label: 'Doctors', value: doctors.length, color: '#7c3aed', bg: darkMode ? '#1e1b2d' : '#f5f3ff', icon: 'fa-user-doctor' },
{ label: 'Appointments', value: appointments.length, color: '#d97706', bg: darkMode ? '#2d2410' : '#fffbeb', icon: 'fa-calendar-check' },
];

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
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
    {['users', 'appointments', 'audit logs', 'create admin'].map(tab => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        style={{
          ...btnBase, padding: '8px 16px',
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
              <div style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#1e3a5f' }}>{user.full_name}</div>
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
      { tab: 'users', icon: 'fa-users' },
      { tab: 'appointments', icon: 'fa-calendar-check' },
      { tab: 'audit logs', icon: 'fa-shield-halved' },
      { tab: 'create admin', icon: 'fa-user-shield' },
    ].map(({ tab, icon }) => (
      <button
        key={tab}
        onClick={() => { setActiveTab(tab); setShowMobileMenu(false); }}
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
          <h2 style={{ color: 'white', margin: '0 0 4px', fontSize: '22px', fontWeight: '700' }}>
            <i className="fa-solid fa-shield-halved" style={{ marginRight: '10px' }}></i>Admin Dashboard
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
            Managing {users.length} users and {appointments.length} appointments
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {statCards.map((stat, i) => (
            <div key={i} style={{ ...card, borderTop: `4px solid ${stat.color}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <i className={`fa-solid ${stat.icon}`} style={{ fontSize: '18px', color: stat.color }}></i>
</div>
              <div>
                <p style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280', margin: '0 0 4px', fontWeight: '600' }}>{stat.label}</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: stat.color, margin: 0 }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>


        {/* Users Tab */}
        {activeTab === 'users' && (
  <div className="fade-in">

       <div style={{ marginBottom: '1rem' }}>
  <h3 style={{ color: darkMode ? '#e2e8f0' : '#1e3a5f', fontWeight: '700', fontSize: '16px', margin: '0 0 10px' }}>All Users</h3>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
    <div style={{ position: 'relative' }}>
      <i className="fa-solid fa-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '13px' }}></i>
      <input
        type="text"
        placeholder="Search users..."
        value={userSearch}
        onChange={e => setUserSearch(e.target.value)}
        style={{ padding: '8px 12px 8px 32px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '13px', outline: 'none', fontFamily: 'inherit', width: 'min(180px, 45%)' }}
        onFocus={e => e.target.style.borderColor = '#2563eb'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
    </div>
    
    <select
      value={userRoleFilter}
      onChange={e => setUserRoleFilter(e.target.value)}
      style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: 'white', cursor: 'pointer' }}
    >
      <option value="all">All Roles</option>
      <option value="patient">Patients</option>
      <option value="doctor">Doctors</option>
      <option value="admin">Admins</option>
    </select>
  </div>
</div>
            <div style={card}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${darkMode ? '#334155' : '#f3f4f6'}` }}>
                    {['Name', 'Email', 'Role', 'Joined'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: darkMode ? '#94a3b8' : '#6b7280', fontWeight: '600', fontSize: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => {
  const matchesSearch = u.full_name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
  const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
  return matchesSearch && matchesRole;
}).map(u => {
                    const r = roleStyle(u.role);
                    return (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${darkMode ? '#334155' : '#f9fafb'}` }}>
                        <td style={{ padding: '12px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#1e3a5f' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px', height: '34px', borderRadius: '10px',
                              background: r.bg, color: r.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: '700', fontSize: '13px'
                            }}>
                              {u.full_name.charAt(0).toUpperCase()}
                            </div>
                            {u.full_name}
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: darkMode ? '#94a3b8' : '#6b7280' }}>{u.email}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: r.bg, color: r.color, fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#9ca3af', fontSize: '13px' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
  <div className="fade-in">
            <div style={{ marginBottom: '1rem' }}>
  <h3 style={{ color: darkMode ? '#e2e8f0' : '#1e3a5f', fontWeight: '700', fontSize: '16px', margin: '0 0 10px' }}>All Appointments</h3>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
  <select
    value={appointmentStatusFilter}
    onChange={e => setAppointmentStatusFilter(e.target.value)}
    style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: 'white', cursor: 'pointer' }}
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
              <div style={card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${darkMode ? '#334155' : '#f3f4f6'}` }}>
                      {['Patient', 'Doctor', 'Date', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: darkMode ? '#94a3b8' : '#6b7280', fontWeight: '600', fontSize: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.filter(appt => appointmentStatusFilter === 'all' || appt.status === appointmentStatusFilter).map(appt => {
                      const s = statusColor(appt.status);
                      return (
                        <tr key={appt.id} style={{ borderBottom: `1px solid ${darkMode ? '#334155' : '#f9fafb'}` }}>
                          <td style={{ padding: '12px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#1e3a5f' }}>{appt.patient_name}</td>
                          <td style={{ padding: '12px', color: darkMode ? '#94a3b8' : '#6b7280' }}>{appt.doctor_name}</td>
                          <td style={{ padding: '12px', color: darkMode ? '#94a3b8' : '#6b7280', fontSize: '13px' }}>{new Date(appt.appointment_date).toLocaleString()}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ background: s.bg, color: s.color, fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>
                              {appt.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit logs' && (
          <div className="fade-in">
            <h3 style={{ color: darkMode ? '#e2e8f0' : '#1e3a5f', fontWeight: '700', marginBottom: '1rem', fontSize: '16px' }}>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: '8px', color: '#2563eb' }}></i>
              Audit Logs
            </h3>
            {auditLogs.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No audit logs yet.</div>
            ) : (
              <div style={card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${darkMode ? '#334155' : '#f3f4f6'}` }}>
                      {['User', 'Action', 'Details', 'IP Address', 'Time'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: darkMode ? '#94a3b8' : '#6b7280', fontWeight: '600', fontSize: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: `1px solid ${darkMode ? '#334155' : '#f9fafb'}` }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: '600', color: darkMode ? '#e2e8f0' : '#1e3a5f', fontSize: '13px' }}>{log.full_name}</div>
                          <div style={{ color: darkMode ? '#94a3b8' : '#9ca3af', fontSize: '11px', textTransform: 'capitalize' }}>{log.user_role}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            background: log.action === 'LOGIN' ? '#eff6ff' :
                              log.action === 'REGISTER' ? '#f0fdf4' :
                              log.action.includes('VIEW') ? '#fffbeb' : '#f5f3ff',
                            color: log.action === 'LOGIN' ? '#2563eb' :
                              log.action === 'REGISTER' ? '#16a34a' :
                              log.action.includes('VIEW') ? '#d97706' : '#7c3aed',
                            fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: darkMode ? '#94a3b8' : '#6b7280', fontSize: '13px' }}>{log.details}</td>
                        <td style={{ padding: '10px 12px', color: darkMode ? '#94a3b8' : '#9ca3af', fontSize: '12px' }}>{log.ip_address}</td>
                        <td style={{ padding: '10px 12px', color: darkMode ? '#94a3b8' : '#9ca3af', fontSize: '12px' }}>{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                 ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create Admin Tab */}
        {activeTab === 'create admin' && (
          <div className="fade-in" style={{ maxWidth: '520px' }}>
            <h3 style={{ color: darkMode ? '#e2e8f0' : '#1e3a5f', fontWeight: '700', marginBottom: '1rem', fontSize: '16px' }}>
              <i className="fa-solid fa-user-shield" style={{ marginRight: '8px', color: '#2563eb' }}></i>
              Create Admin Account
            </h3>
            <div style={{ ...card }}>
              {adminMessage && (
                <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #bbf7d0' }}>
                  <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i>{adminMessage}
                </div>
              )}
              {adminError && (
                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #fecaca' }}>
                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>{adminError}
                </div>
              )}
              <form onSubmit={async (e) => {
                e.preventDefault();
                setAdminMessage('');
                setAdminError('');
                try {
                  await axios.post('https://prohealthnexus-api.onrender.com/api/auth/create-admin', adminForm, { headers });
                  setAdminMessage(`Admin account created for ${adminForm.email}`);
                  setAdminForm({ full_name: '', email: '', password: '' });
                } catch (err) {
                  setAdminError(err.response?.data?.error || 'Failed to create admin');
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Enter full name', icon: 'fa-user' },
                  { label: 'Email Address', key: 'email', type: 'email', placeholder: 'Enter email address', icon: 'fa-envelope' },
                  { label: 'Password', key: 'password', type: 'password', placeholder: 'Create a strong password', icon: 'fa-lock' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{field.label}</label>
                    <div style={{ position: 'relative' }}>
                      <i className={`fa-solid ${field.icon}`} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}></i>
                      <input
                        type={field.type}
                        value={adminForm[field.key]}
                        onChange={e => setAdminForm({ ...adminForm, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        required
                        style={{
                          width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px',
                          border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none',
                          transition: 'border-color 0.2s', boxSizing: 'border-box', fontFamily: 'inherit'
                        }}
                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  style={{
                    padding: '13px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                    color: 'white', fontWeight: '600', fontSize: '15px',
                    cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                >
                  <i className="fa-solid fa-user-plus" style={{ marginRight: '8px' }}></i>
                  Create Admin Account
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDashboard;