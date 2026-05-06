import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

const btnBase = {
  border: 'none', cursor: 'pointer', fontWeight: '600',
  transition: 'all 0.2s', fontFamily: 'inherit'
};

const Profile = () => {
  const { user, token, login, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: '12px',
  border: `1.5px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
  fontFamily: 'inherit', background: darkMode ? '#0f172a' : 'white',
  color: darkMode ? '#e2e8f0' : '#374151'
};
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };
  const backPath = user?.role === 'doctor' ? '/doctor' : user?.role === 'admin' ? '/admin' : '/patient';

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/profile', { headers });
      setFormData(prev => ({ ...prev, full_name: res.data.full_name, email: res.data.email }));
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (formData.password && formData.password !== formData.confirm_password) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      const payload = { full_name: formData.full_name, email: formData.email };
      if (formData.password) payload.password = formData.password;
      const res = await axios.put('http://localhost:5000/api/auth/profile', payload, { headers });
      login(res.data, token);
      setMessage('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '', confirm_password: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: darkMode ? '#0f172a' : '#f8faff', transition: 'background 0.3s' }}>
      {/* Navbar */}
      <nav style={{
        background: darkMode ? '#1e293b' : 'white', padding: '0 2rem',
boxShadow: darkMode ? '0 2px 20px rgba(0,0,0,0.3)' : '0 2px 20px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px', position: 'sticky', top: 0, zIndex: 100
      }}>
        <Logo size="lg" />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
  onClick={toggleDarkMode}
  style={{
    ...btnBase, background: 'none', border: 'none', width: '38px', height: '38px',
    borderRadius: '10px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}
  onMouseEnter={e => { e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'; }}
  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
>
  <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`} style={{ color: darkMode ? '#fbbf24' : '#374151', fontSize: '16px' }}></i>
</button>
          <button
            onClick={() => navigate(backPath)}
            style={{ ...btnBase, padding: '8px 16px', borderRadius: '10px', background: 'none', color: '#374151', fontSize: '13px' }}
            onMouseEnter={e => { e.target.style.background = 'rgba(0,0,0,0.05)'; e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.boxShadow = 'none'; }}
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '13px', marginRight: '6px' }}></i>Back to Dashboard
          </button>
          <button
            onClick={logout}
            style={{ ...btnBase, padding: '8px 16px', borderRadius: '10px', background: 'none', color: '#dc2626', fontSize: '13px' }}
            onMouseEnter={e => { e.target.style.background = 'rgba(220,38,38,0.06)'; e.target.style.boxShadow = '0 1px 4px rgba(220,38,38,0.12)'; }}
            onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.boxShadow = 'none'; }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '13px', marginRight: '6px' }}></i>Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Profile Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '1.5rem',
boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '12px'
          }}>
            {formData.full_name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ color: 'white', margin: '0 0 4px', fontSize: '20px', fontWeight: '700' }}>
            {formData.full_name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px', textTransform: 'capitalize' }}>
            {user?.role}
          </p>
        </div>

        <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.07)', padding: '2rem' }}>
          <h3 style={{ color: darkMode ? '#93c5fd' : '#1e3a5f', fontWeight: '700', margin: '0 0 1.5rem', fontSize: '16px' }}>
            <i className="fa-solid fa-pen-to-square" style={{ marginRight: '8px', color: darkMode ? '#2563eb' : '#2563eb' }}></i>
            Edit Profile
          </h3>

          {message && (
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #bbf7d0' }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i>{message}
            </div>
          )}
          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #fecaca' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Your full name', icon: 'fa-user' },
              { label: 'Email Address', key: 'email', type: 'email', placeholder: 'Your email', icon: 'fa-envelope' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '6px' }}>{field.label}</label>
                <div style={{ position: 'relative' }}>
                  <i className={`fa-solid ${field.icon}`} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}></i>
                  <input
                    type={field.type}
                    value={formData[field.key]}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{ ...inputStyle, paddingLeft: '40px' }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    required
                  />
                </div>
              </div>
            ))}

            <div style={{ borderTop: `1px solid ${darkMode ? '#334155' : '#f3f4f6'}`, paddingTop: '1rem', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '1rem' }}>
                Leave password fields blank to keep your current password
              </p>
              {[
                { label: 'New Password', key: 'password', placeholder: 'Enter new password' },
                { label: 'Confirm New Password', key: 'confirm_password', placeholder: 'Confirm new password' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '6px' }}>{field.label}</label>
                  <div style={{ position: 'relative' }}>
                    <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}></i>
                    <input
                      type="password"
                      value={formData[field.key]}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      style={{ ...inputStyle, paddingLeft: '40px' }}
                      onFocus={e => e.target.style.borderColor = '#2563eb'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...btnBase, padding: '13px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white', fontSize: '15px', boxShadow: 'none',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
            >
              {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;