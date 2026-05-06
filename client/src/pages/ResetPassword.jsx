import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const res = await axios.post(`https://prohealthnexus-api.onrender.com/api/auth/reset-password/${token}`, {
        password: formData.password
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
  minHeight: '100vh',
  background: darkMode ? '#0f172a' : 'linear-gradient(135deg, #f0f4ff 0%, #f0fdf4 100%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
}}>
      <div style={{
        background: darkMode ? '#1e293b' : 'white', borderRadius: '20px',
boxShadow: darkMode ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.1)',
        padding: '2.5rem', width: '100%', maxWidth: '420px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Logo size="md" />
          </div>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: '#eff6ff', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
          }}>
            <i className="fa-solid fa-key" style={{ fontSize: '28px', color: '#2563eb' }}></i>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a5f', margin: '0 0 8px' }}>
            Reset Password
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Enter your new password below.
          </p>
        </div>

        {message && (
          <div style={{
            background: '#f0fdf4', color: '#16a34a', padding: '16px',
            borderRadius: '12px', marginBottom: '1.5rem', fontSize: '14px',
            border: '1px solid #bbf7d0', textAlign: 'center'
          }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
            <strong>Password Reset!</strong><br />
            {message}<br />
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Redirecting to login...</span>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2', color: '#dc2626', padding: '12px 16px',
            borderRadius: '12px', marginBottom: '1.5rem', fontSize: '14px',
            border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'New Password', key: 'password', placeholder: 'Enter new password' },
              { label: 'Confirm New Password', key: 'confirm_password', placeholder: 'Confirm new password' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  {field.label}
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-lock" style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: darkMode ? '#e2e8f0' : '#374151'
                  }}></i>
                  <input
                    type="password"
                    value={formData[field.key]}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    required
                    style={{
                     width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px',
border: `1.5px solid ${darkMode ? '#334155' : '#e5e7eb'}`, fontSize: '14px', outline: 'none',
transition: 'border-color 0.2s', boxSizing: 'border-box', fontFamily: 'inherit',
background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#e2e8f0' : '#374151'
                    }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            ))}

            <div style={{ background: '#f8faff', padding: '12px', borderRadius: '10px', fontSize: '12px', color: '#6b7280' }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: '6px', color: '#2563eb' }}></i>
              Password must be at least 8 characters with uppercase, number and special character (!@#$%^&*)
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                color: 'white', fontWeight: '600', fontSize: '15px',
                border: 'none', cursor: 'pointer', boxShadow: 'none',
                transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
                fontFamily: 'inherit'
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
            >
              {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Resetting...</> : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;