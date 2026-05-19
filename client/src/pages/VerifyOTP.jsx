import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

const VerifyOTP = () => {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const location = useLocation();
  const userId = location.state?.userId;
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only numbers
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // only one digit
    setOtpDigits(newDigits);

    // Auto move to next box
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move back on backspace
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...otpDigits];
    pasted.split('').forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setOtpDigits(newDigits);
    // Focus last filled box
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('https://prohealthnexus-api.onrender.com/api/auth/verify-otp', { userId, otp });
      login(res.data.user, res.data.token);

      if (res.data.user.role === 'patient') navigate('/patient');
      else if (res.data.user.role === 'doctor') navigate('/doctor');
      else if (res.data.user.role === 'admin') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otpDigits.every(d => d !== '');

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
            <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: '28px', color: '#2563eb' }}></i>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a5f', margin: '0 0 8px' }}>
            Check your email
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            We sent a 6-digit verification code to your email. Enter it below to continue.
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
          {/* 6 OTP boxes */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem', width: '100%' }}>
  {otpDigits.map((digit, index) => (
    <input
      key={index}
      ref={el => inputRefs.current[index] = el}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      onChange={e => handleChange(index, e.target.value)}
      onKeyDown={e => handleKeyDown(index, e)}
      onPaste={handlePaste}
      style={{
        width: 'calc(min(48px, (100vw - 6rem) / 6))', height: '52px', borderRadius: '12px',
                  border: `1.5px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
                  fontSize: '22px', fontWeight: '700', textAlign: 'center',
                  outline: 'none', color: '#1e3a5f', fontFamily: 'inherit',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: digit ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
                  background: darkMode ? '#0f172a' : 'white',
                  color: darkMode ? '#e2e8f0' : '#374151'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                }}
                onBlur={e => {
                  if (!digit) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
            ))}
          </div>

          <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-clock" style={{ marginRight: '4px' }}></i>
            Code expires in 3 minutes
          </p>

          <button
            type="submit"
            disabled={loading || !isComplete}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
              color: 'white', fontWeight: '600', fontSize: '15px',
              border: 'none', cursor: isComplete ? 'pointer' : 'not-allowed',
              boxShadow: 'none', transition: 'all 0.2s',
              opacity: loading || !isComplete ? 0.6 : 1,
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => { if (!loading && isComplete) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
          >
            {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Verifying...</> : 'Verify Code'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '1.5rem' }}>
          Didn't receive the code?{' '}
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
          >
            Go back and try again
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;