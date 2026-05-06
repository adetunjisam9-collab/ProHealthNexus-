import Logo from '../components/Logo';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
    const res = await axios.post('https://prohealthnexus-api.onrender.com/api/auth/login', formData);
if (res.data.token) {
  // No 2FA - direct login
  login(res.data.user, res.data.token);
  if (res.data.user.role === 'patient') navigate('/patient');
  else if (res.data.user.role === 'doctor') navigate('/doctor');
  else if (res.data.user.role === 'admin') navigate('/admin');
} else {
  // 2FA required
  navigate('/verify-otp', { state: { userId: res.data.userId } });
}
  } catch (err) {
    setError(err.response?.data?.error || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Side - Image */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        display: 'none', // hidden on mobile
      }}
        className="login-image-panel"
      >
        <img
          src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1200&auto=format&fit=crop&q=80"
          alt="Healthcare"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(30,58,95,0.88), rgba(37,99,235,0.75))',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '3rem'
        }}>
          <div style={{ color: 'white' }}>
            <div style={{ marginBottom: '2rem' }}>
  <Logo size="lg" />
</div>
            <h2 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 12px', lineHeight: 1.3 }}>
              Your Health, Our Priority
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.85, margin: '0 0 2rem', lineHeight: 1.6 }}>
              Access your health records, book appointments and stay connected with your healthcare team all in one place.
            </p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[
                { icon: 'fa-calendar-check', text: 'Easy Booking' },
                { icon: 'fa-heart-pulse', text: 'Health Tracking' },
                { icon: 'fa-shield-halved', text: 'Secure Records' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className={`fa-solid ${item.icon}`} style={{ fontSize: '16px', opacity: 0.9 }}></i>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{
        width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '3rem 2.5rem',
        background: 'white', overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2.5rem' }}>
          <Logo size="lg" />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a5f', margin: '0 0 8px' }}>
            <i className="fa-solid fa-user-check" style={{ marginRight: '8px', color: '#2563eb', fontSize: '20px' }}></i>Welcome back
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
            Sign in to your account to continue
          </p>
        </div>

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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-envelope" style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: '#9ca3af', fontSize: '14px'
              }}></i>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
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

          <div style={{ marginBottom: '2rem' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
      Password
    </label>
    <Link to="/forgot-password" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
      Forgot password?
    </Link>
  </div>
  <div style={{ position: 'relative' }}>
    <i className="fa-solid fa-lock" style={{
      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
      color: '#9ca3af', fontSize: '14px'
    }}></i>
    <input
      type="password"
      name="password"
      value={formData.password}
      onChange={handleChange}
      placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white', fontWeight: '600', fontSize: '15px',
              border: 'none', cursor: 'pointer', boxShadow: 'none',
              transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
          >
            {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Create one here
          </Link>
        </p>

        {/* Bottom image strip for mobile */}
        <div style={{ marginTop: '2rem', borderRadius: '16px', overflow: 'hidden', height: '160px' }}
          className="login-mobile-image"
        >
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80"
            alt="Healthcare"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .login-image-panel { display: flex !important; flex: 1; }
          .login-mobile-image { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;