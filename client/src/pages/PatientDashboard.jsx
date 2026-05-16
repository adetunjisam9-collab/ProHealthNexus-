import { useTheme } from '../context/ThemeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Logo from '../components/Logo';
import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const btnBase = {
  border: 'none', cursor: 'pointer', fontWeight: '600',
  transition: 'all 0.2s', fontFamily: 'inherit'
};


const PatientDashboard = () => {
  const { user, token, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const card = {
  background: darkMode ? '#1e293b' : 'white',
  borderRadius: '16px',
  boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.07)',
  padding: '1.25rem'
};

  const navigate = useNavigate();
  const [vitals, setVitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarRef = useRef(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState('all');

useEffect(() => {
  const handleClickOutside = (e) => {
    if (notifRef.current && !notifRef.current.contains(e.target)) {
      setShowNotifications(false);
    }
    if (avatarRef.current && !avatarRef.current.contains(e.target)) {
      setShowAvatarMenu(false);
    }
    if (showMobileMenu && !e.target.closest('.mobile-menu') && !e.target.closest('.mobile-only')) {
      setShowMobileMenu(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  document.addEventListener('touchstart', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('touchstart', handleClickOutside);
  };
}, [showMobileMenu]);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [vitalsRes, appointmentsRes, labRes, notifRes, historyRes] = await Promise.all([
  axios.get(`https://prohealthnexus-api.onrender.com/api/vitals/${user.id}`, { headers }),
  axios.get('https://prohealthnexus-api.onrender.com/api/appointments', { headers }),
  axios.get(`https://prohealthnexus-api.onrender.com/api/labresults/${user.id}`, { headers }),
  axios.get('https://prohealthnexus-api.onrender.com/api/notifications', { headers }),
  axios.get(`https://prohealthnexus-api.onrender.com/api/medical-history/${user.id}`, { headers }),
]);
setVitals(vitalsRes.data);
setAppointments(appointmentsRes.data);
setLabResults(labRes.data);
setNotifications(notifRes.data);
setMedicalHistory(historyRes.data);
    } catch (err) { console.error(err); }
  };
const [cancellingId, setCancellingId] = useState(null);

const cancelAppointment = async (id) => {
  if (cancellingId === id) return;
  setCancellingId(id);
  try {
    await axios.put(`https://prohealthnexus-api.onrender.com/api/appointments/cancel/${id}`, {}, { headers });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  } catch (err) {
    console.error(err);
  } finally {
    setCancellingId(null);
  }
};
  const latestVital = vitals[0] || {};
  const exportHealthRecord = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ProHealth Nexus', 14, 15);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Patient Health Record', 14, 24);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 31);

  // Patient Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 14, 48);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${user.full_name}`, 14, 57);
  doc.text(`Email: ${user.email}`, 14, 64);
  doc.text(`Role: ${user.role}`, 14, 71);

  let yPos = 85;

  // Latest Vitals
  if (vitals.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('Latest Vitals', 14, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Vital', 'Value', 'Recorded At']],
      body: [
        ['Heart Rate', `${latestVital.heart_rate || '--'} bpm`, new Date(latestVital.recorded_at).toLocaleString()],
        ['Blood Pressure', `${latestVital.systolic || '--'}/${latestVital.diastolic || '--'} mmHg`, new Date(latestVital.recorded_at).toLocaleString()],
        ['Temperature', `${latestVital.temperature || '--'} °C`, new Date(latestVital.recorded_at).toLocaleString()],
        ['Oxygen Level', `${latestVital.oxygen_level || '--'} %`, new Date(latestVital.recorded_at).toLocaleString()],
        ['Weight', `${latestVital.weight || '--'} kg`, new Date(latestVital.recorded_at).toLocaleString()],
      ],
      headStyles: { fillColor: [30, 58, 95] },
      styles: { fontSize: 10 },
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // Lab Results
  if (labResults.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('Lab Results', 14, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Test', 'Result', 'Unit', 'Status', 'Date']],
      body: labResults.map(r => [
        r.test_name,
        r.result,
        r.unit || '--',
        r.status,
        new Date(r.test_date).toLocaleDateString()
      ]),
      headStyles: { fillColor: [30, 58, 95] },
      styles: { fontSize: 10 },
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // Appointments
  if (appointments.length > 0) {
    if (yPos > 220) { doc.addPage(); yPos = 20; }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('Appointments', 14, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Doctor', 'Date', 'Status', 'Notes']],
      body: appointments.map(a => [
        a.doctor_name,
        new Date(a.appointment_date).toLocaleString(),
        a.status,
        a.notes || '--'
      ]),
      headStyles: { fillColor: [30, 58, 95] },
      styles: { fontSize: 10 },
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // Medical History
  if (medicalHistory.length > 0) {
    if (yPos > 220) { doc.addPage(); yPos = 20; }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('Medical History', 14, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Doctor', 'Symptoms', 'Diagnosis', 'Treatment', 'Date']],
      body: medicalHistory.map(m => [
        m.doctor_name,
        m.symptoms || '--',
        m.diagnosis || '--',
        m.treatment || '--',
        new Date(m.created_at).toLocaleDateString()
      ]),
      headStyles: { fillColor: [30, 58, 95] },
      styles: { fontSize: 10 },
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('This document is confidential and intended for the named patient only.', 14, doc.internal.pageSize.height - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.height - 10);
  }

  doc.save(`${user.full_name}_Health_Record_${new Date().toLocaleDateString()}.pdf`);
};
  const chartData = vitals.slice(0, 7).reverse().map((v, i) => ({
    name: `R${i + 1}`, heartRate: v.heart_rate, systolic: v.systolic, diastolic: v.diastolic,
  }));

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const vitalCards = [
  { label: 'Heart Rate', value: latestVital.heart_rate, unit: 'bpm', color: '#ef4444', bg: darkMode ? '#2d1b1b' : '#fef2f2', icon: 'fa-heart' },
  { label: 'Blood Pressure', value: latestVital.systolic ? `${latestVital.systolic}/${latestVital.diastolic}` : null, unit: 'mmHg', color: '#2563eb', bg: darkMode ? '#1b1d2d' : '#eff6ff', icon: 'fa-droplet' },
  { label: 'Temperature', value: latestVital.temperature, unit: '°C', color: '#f59e0b', bg: darkMode ? '#2d2410' : '#fffbeb', icon: 'fa-temperature-half' },
  { label: 'Oxygen (SpO2)', value: latestVital.oxygen_level, unit: '%', color: '#10b981', bg: darkMode ? '#0f2419' : '#f0fdf4', icon: 'fa-lungs' },
];

  const statusColor = (status) => {
    if (status === 'confirmed') return { bg: '#f0fdf4', color: '#16a34a' };
    if (status === 'completed') return { bg: '#eff6ff', color: '#2563eb' };
    if (status === 'cancelled') return { bg: '#fef2f2', color: '#dc2626' };
    return { bg: '#fffbeb', color: '#d97706' };
  };

  const labStatusColor = (status) => {
    if (status === 'normal') return { bg: '#f0fdf4', color: '#16a34a' };
    if (status === 'high') return { bg: '#fef2f2', color: '#dc2626' };
    return { bg: '#fffbeb', color: '#d97706' };
  };

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
    {['overview', 'appointments', 'lab results', 'medical history'].map(tab => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
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
          if (!showNotifications && unreadCount > 0) {
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
        onMouseEnter={e => { e.target.style.background = 'rgba(0,0,0,0.05)'; }}
        onMouseLeave={e => { e.target.style.background = 'none'; }}
      >
        <i className="fa-solid fa-bell" style={{ fontSize: '16px', color: darkMode ? '#94a3b8' : '#374151' }}></i>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            background: '#ef4444', color: 'white', fontSize: '10px',
            fontWeight: '700', borderRadius: '10px', padding: '1px 4px',
            minWidth: '16px', textAlign: 'center', lineHeight: '14px'
          }}>{unreadCount}</span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
  <>
    <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowNotifications(false)} />
    <div style={{
      position: 'fixed', right: '1rem', top: '70px', width: 'min(300px, calc(100vw - 2rem))',
      background: darkMode ? '#1e293b' : 'white', borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 200,
      border: `1px solid ${darkMode ? '#334155' : '#f3f4f6'}`, overflow: 'hidden',
      maxWidth: 'calc(100vw - 2rem)'
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
            <div style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#1e3a5f' }}>{user.full_name}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'capitalize' }}>{user.role}</div>
          </div>
          {[
            { icon: 'fa-user', label: 'My Profile', action: () => { navigate('/profile'); setShowAvatarMenu(false); } },
            { icon: 'fa-calendar-plus', label: 'Book Appointment', action: () => { navigate('/book-appointment'); setShowAvatarMenu(false); } },
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

    {/* Hamburger Menu Button - Mobile Only */}
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
    {['overview', 'appointments', 'lab results', 'medical history'].map(tab => (
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
        <i className={`fa-solid ${tab === 'overview' ? 'fa-house-medical' : tab === 'appointments' ? 'fa-calendar-check' : tab === 'lab results' ? 'fa-flask' : 'fa-file-medical'}`} style={{ marginRight: '10px', color: activeTab === tab ? '#2563eb' : '#9ca3af' }}></i>
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
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  flexWrap: 'wrap', gap: '12px'
}}>
  <div>
    <h2 style={{ color: 'white', margin: '0 0 4px', fontSize: '20px', fontWeight: '700' }}>
      <i className="fa-solid fa-house-medical" style={{ marginRight: '10px' }}></i>Welcome back, {user.full_name.split(' ')[0]}
    </h2>
    <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
      Here's your health overview for today
    </p>
  </div>
  <div style={{ display: 'flex', gap: '10px' }}>
  <button
    onClick={exportHealthRecord}
    style={{
      ...btnBase, padding: '10px 18px', borderRadius: '10px',
      background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '13px',
      boxShadow: 'none', border: '1px solid rgba(255,255,255,0.3)'
    }}
    onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.25)'; }}
    onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; }}
  >
    <i className="fa-solid fa-file-pdf" style={{ marginRight: '6px' }}></i>
    Export PDF
  </button>
  <button
    onClick={() => navigate('/book-appointment')}
    style={{
      ...btnBase, padding: '10px 18px', borderRadius: '10px',
      background: 'white', color: '#2563eb', fontSize: '13px',
      boxShadow: 'none', flexShrink: 0
    }}
    onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
  >
    <i className="fa-solid fa-calendar-plus" style={{ marginRight: '6px' }}></i>
    Book Appointment
  </button>
</div>
</div>

        {/* Tabs */}
        <div className="desktop-nav" style={{
  display: 'flex', background: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '12px',
  padding: '4px', marginBottom: '1.5rem', gap: '2px',
  overflowX: 'auto', scrollbarWidth: 'none'
}}>
  {['overview', 'appointments', 'lab results', 'medical history'].map(tab => (
         <button
          key={tab}
            onClick={() => setActiveTab(tab)}
             style={{
           ...btnBase, padding: '8px 18px', borderRadius: '9px',
               fontSize: '13px', textTransform: 'capitalize',
                background: activeTab === tab ? (darkMode ? '#334155' : 'white') : 'transparent',
color: activeTab === tab ? (darkMode ? 'white' : '#1e3a5f') : (darkMode ? '#94a3b8' : '#6b7280'),
boxShadow: activeTab === tab ? (darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.1)') : 'none',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                fontWeight: activeTab === tab ? '600' : '500',
        }}
      >
      {tab}
       </button>
     ))}
    </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
  <div className="fade-in">
            <h3 style={{ color: '#1e3a5f', fontWeight: '700', marginBottom: '1rem', fontSize: '16px' }}>My Vitals</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {vitalCards.map((v, i) => (
  <div key={i} style={{ ...card, borderTop: `4px solid ${v.color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, fontWeight: '600' }}>{v.label}</p>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`fa-solid ${v.icon}`} style={{ fontSize: '14px', color: v.color }}></i>
      </div>
    </div>
    <p style={{ margin: 0 }}>
      <span style={{ fontSize: '26px', fontWeight: '700', color: v.color }}>{v.value || '--'}</span>
      <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>{v.unit}</span>
    </p>
  </div>
))}
            </div>

            {chartData.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={card}>
                  <h4 style={{ color: '#1e3a5f', fontWeight: '600', margin: '0 0 1rem', fontSize: '14px' }}>Blood Pressure Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="diastolic" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={card}>
                  <h4 style={{ color: '#1e3a5f', fontWeight: '600', margin: '0 0 1rem', fontSize: '14px' }}>Heart Rate Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="heartRate" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                No vitals recorded yet. Your doctor will add them after your visit.
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
  <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
  <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '16px', margin: 0 }}>My Appointments</h3>
  <select
    value={appointmentFilter}
    onChange={e => setAppointmentFilter(e.target.value)}
    style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: 'white', cursor: 'pointer' }}
  >
    <option value="all">All</option>
    <option value="pending">Pending</option>
    <option value="confirmed">Confirmed</option>
    <option value="completed">Completed</option>
    <option value="cancelled">Cancelled</option>
  </select>
</div>
            {appointments.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No appointments yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {appointments.filter(appt => appointmentFilter === 'all' || appt.status === appointmentFilter).map(appt => {
  const s = statusColor(appt.status);
  return (
    <div key={appt.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ fontWeight: '600', color: '#1e3a5f', margin: '0 0 4px' }}>{appt.doctor_name}</p>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>{new Date(appt.appointment_date).toLocaleString()}</p>
        {appt.notes && <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{appt.notes}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ background: s.bg, color: s.color, fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
          {appt.status}
        </span>
        {(appt.status === 'pending' || appt.status === 'confirmed') && (
          <button
            onClick={() => cancelAppointment(appt.id)}
            disabled={cancellingId === appt.id}
            style={{
              ...btnBase, padding: '4px 12px', borderRadius: '20px',
              background: '#fef2f2', color: '#dc2626', fontSize: '12px',
              opacity: cancellingId === appt.id ? 0.6 : 1
            }}
            onMouseEnter={e => { e.target.style.background = '#fee2e2'; }}
            onMouseLeave={e => { e.target.style.background = '#fef2f2'; }}
          >
            {cancellingId === appt.id ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Cancel'}
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

        {/* Lab Results Tab */}
        {activeTab === 'lab results' && (
  <div className="fade-in">
            <h3 style={{ color: '#1e3a5f', fontWeight: '700', marginBottom: '1rem', fontSize: '16px' }}>Lab Results</h3>
            {labResults.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No lab results yet.</div>
            ) : (
              <div style={card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                      {['Test', 'Result', 'Unit', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {labResults.map(r => {
                      const s = labStatusColor(r.status);
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                          <td style={{ padding: '12px', fontWeight: '600', color: '#1e3a5f' }}>{r.test_name}</td>
                          <td style={{ padding: '12px', color: '#374151' }}>{r.result}</td>
                          <td style={{ padding: '12px', color: '#6b7280' }}>{r.unit}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ background: s.bg, color: s.color, fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#9ca3af', fontSize: '13px' }}>{new Date(r.test_date).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

       {/* Medical History Tab */}
{activeTab === 'medical history' && (
  <div className="fade-in">
    <h3 style={{ color: darkMode ? '#e2e8f0' : '#1e3a5f', fontWeight: '700', marginBottom: '1rem', fontSize: '16px' }}>
      <i className="fa-solid fa-file-medical" style={{ marginRight: '8px', color: '#2563eb' }}></i>
      My Medical History
    </h3>
    {medicalHistory.length === 0 ? (
      <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
        No medical history recorded yet.
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {medicalHistory.map(record => (
          <div key={record.id} style={{ ...card, borderLeft: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontWeight: '700', color: darkMode ? '#e2e8f0' : '#1e3a5f', margin: '0 0 4px', fontSize: '15px' }}>
                  <i className="fa-solid fa-user-doctor" style={{ marginRight: '8px', color: '#2563eb' }}></i>
                  Dr. {record.doctor_name}
                </p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                  {new Date(record.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Symptoms', value: record.symptoms, icon: 'fa-face-dizzy', color: '#ef4444' },
                { label: 'Diagnosis', value: record.diagnosis, icon: 'fa-stethoscope', color: '#2563eb' },
                { label: 'Treatment', value: record.treatment, icon: 'fa-kit-medical', color: '#16a34a' },
                { label: 'Prescription', value: record.prescription, icon: 'fa-pills', color: '#d97706' },
              ].map((item, i) => item.value && (
                <div key={i} style={{ background: darkMode ? '#0f172a' : '#f8faff', padding: '12px', borderRadius: '10px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: item.color, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className={`fa-solid ${item.icon}`} style={{ marginRight: '6px' }}></i>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '13px', color: darkMode ? '#cbd5e1' : '#374151', margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {record.notes && (
              <div style={{ marginTop: '12px', background: darkMode ? '#0f172a' : '#fffbeb', padding: '12px', borderRadius: '10px' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#d97706', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <i className="fa-solid fa-note-sticky" style={{ marginRight: '6px' }}></i>
                  Additional Notes
                </p>
                <p style={{ fontSize: '13px', color: darkMode ? '#cbd5e1' : '#374151', margin: 0 }}>{record.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default PatientDashboard;