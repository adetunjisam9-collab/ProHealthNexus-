import Logo from '../components/Logo';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', role: 'patient'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

  // Validate password
  if (formData.password.length < 8) {
    setLoading(false);
    return setError('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(formData.password)) {
    setLoading(false);
    return setError('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(formData.password)) {
    setLoading(false);
    return setError('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(formData.password)) {
    setLoading(false);
    return setError('Password must contain at least one special character (!@#$%^&*)');
  }

  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', formData);
    setError('');
    // Show success message instead of redirecting
    setFormData({ full_name: '', email: '', password: '', role: 'patient' });
    setSuccess(res.data.message);
  } catch (err) {
    setError(err.response?.data?.error || 'Registration failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Side - Image */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
        className="register-image-panel"
      >
        <img
          src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&auto=format&fit=crop&q=80"
          alt="Healthcare"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(30,58,95,0.88), rgba(37,99,235,0.75))',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '3rem'
        }}>
          <div style={{ color: 'white' }}>
            <Logo size="lg" />
            <h2 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 12px', lineHeight: 1.3 }}>
              Join thousands of patients managing their health
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.85, margin: '0 0 2rem', lineHeight: 1.6 }}>
              Create your account today and take control of your healthcare journey.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: 'fa-check-circle', text: 'Free to register and use' },
                { icon: 'fa-check-circle', text: 'Secure and private health records' },
                { icon: 'fa-check-circle', text: 'Book appointments in seconds' },
                { icon: 'fa-check-circle', text: 'Real time health tracking' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className={`fa-solid ${item.icon}`} style={{ fontSize: '16px', opacity: 0.9 }}></i>
                  <span style={{ fontSize: '15px', opacity: 0.9 }}>{item.text}</span>
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
        <div style={{ marginBottom: '1.5rem' }}>
  <Logo size="md" />
  <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a5f', margin: '12px 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <i className="fa-solid fa-hospital" style={{ color: '#2563eb', fontSize: '16px' }}></i>
    Create your account
  </h1>
  <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
    Join ProHealth Nexus today — it's free!
  </p>   -
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
        {success && (
  <div style={{
    background: '#f0fdf4', color: '#16a34a', padding: '16px',
    borderRadius: '12px', marginBottom: '1.5rem', fontSize: '14px',
    border: '1px solid #bbf7d0', textAlign: 'center'
  }}>
    <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
    <strong>Check your email!</strong><br />
    {success}
  </div>
)}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-user" style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: '#9ca3af', fontSize: '14px'
              }}></i>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
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

          <div>
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

         <div>
  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
    Password
  </label>
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
      placeholder="Create a password"
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
  {formData.password && (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[
          formData.password.length >= 8,
          /[A-Z]/.test(formData.password),
          /[0-9]/.test(formData.password),
          /[!@#$%^&*]/.test(formData.password),
        ].map((met, i) => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: met ? '#16a34a' : '#e5e7eb',
            transition: 'background 0.2s'
          }}></div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {[
          { label: '8+ characters', met: formData.password.length >= 8 },
          { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
          { label: 'Number', met: /[0-9]/.test(formData.password) },
          { label: 'Special char', met: /[!@#$%^&*]/.test(formData.password) },
        ].map((req, i) => (
          <span key={i} style={{ fontSize: '11px', color: req.met ? '#16a34a' : '#9ca3af' }}>
            <i className={`fa-solid ${req.met ? 'fa-check' : 'fa-xmark'}`} style={{ marginRight: '3px', fontSize: '10px' }}></i>
            {req.label}
          </span>
        ))}
      </div>
    </div>
  )}
</div>

          {formData.password && (
  <div style={{ marginTop: '8px' }}>
    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
      {[
        formData.password.length >= 8,
        /[A-Z]/.test(formData.password),
        /[0-9]/.test(formData.password),
        /[!@#$%^&*]/.test(formData.password),
      ].map((met, i) => (
        <div key={i} style={{
          flex: 1, height: '4px', borderRadius: '2px',
          background: met ? '#16a34a' : '#e5e7eb',
          transition: 'background 0.2s'
        }}></div>
      ))}
    </div>
    <div style={{ fontSize: '11px', color: '#6b7280' }}>
      {[
        { label: '8+ characters', met: formData.password.length >= 8 },
        { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
        { label: 'Number', met: /[0-9]/.test(formData.password) },
        { label: 'Special char', met: /[!@#$%^&*]/.test(formData.password) },
      ].map((req, i) => (
        <span key={i} style={{ marginRight: '10px', color: req.met ? '#16a34a' : '#9ca3af' }}>
          <i className={`fa-solid ${req.met ? 'fa-check' : 'fa-xmark'}`} style={{ marginRight: '3px', fontSize: '10px' }}></i>
          {req.label}
        </span>
      ))}
    </div>
  </div>
)}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              I am a
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
  { value: 'patient', label: 'Patient', icon: 'fa-hospital-user' },
  { value: 'doctor', label: 'Doctor', icon: 'fa-user-doctor' },
].map(role => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  style={{
                    padding: '12px 8px', borderRadius: '12px', border: '1.5px solid',
                    borderColor: formData.role === role.value ? '#2563eb' : '#e5e7eb',
                    background: formData.role === role.value ? '#eff6ff' : 'white',
                    color: formData.role === role.value ? '#2563eb' : '#6b7280',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                  }}
                >
                  <i className={`fa-solid ${role.icon}`} style={{ fontSize: '18px' }}></i>
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>{role.label}</span>
                </button>
              ))}
            </div>
          </div>

{/* Terms and Conditions */}
<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: '#f8faff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
  <input
    type="checkbox"
    id="terms"
    checked={agreedToTerms}
    onChange={e => setAgreedToTerms(e.target.checked)}
    style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#2563eb', flexShrink: 0, cursor: 'pointer' }}
  />
  <label htmlFor="terms" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer', lineHeight: 1.5 }}>
    I have read and agree to the{' '}
    <button
      type="button"
      onClick={() => setShowTerms(true)}
      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', fontSize: '13px', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}
    >
      Terms and Conditions
    </button>
    {' '}and{' '}
    <button
      type="button"
      onClick={() => setShowTerms(true)}
      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', fontSize: '13px', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}
    >
      Privacy Policy
    </button>
    {' '}of ProHealth Nexus
  </label>
</div>

<button
  type="submit"
  disabled={loading || !agreedToTerms}
  style={{
    width: '100%', padding: '13px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white', fontWeight: '600', fontSize: '15px',
    border: 'none', cursor: agreedToTerms ? 'pointer' : 'not-allowed',
    boxShadow: 'none', transition: 'all 0.2s',
    opacity: loading || !agreedToTerms ? 0.6 : 1,
    fontFamily: 'inherit', marginTop: '0.5rem'
  }}
  onMouseEnter={e => { if (!loading && agreedToTerms) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}}
  onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
>
  {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Creating account...</> : 'Create Account'}
</button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Sign in here
          </Link>
        </p>
      </div>

      <style>{`
        .register-image-panel { display: none; }
        @media (min-width: 768px) {
          .register-image-panel { display: block !important; flex: 1; }
        }
      `}</style>
      {/* Terms and Conditions Modal */}
{showTerms && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '1rem'
  }}>
    <div style={{
      background: 'white', borderRadius: '20px', width: '100%', maxWidth: '640px',
      maxHeight: '85vh', display: 'flex', flexDirection: 'column',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }}>
      {/* Modal Header */}
      <div style={{
        padding: '1.5rem 2rem', borderBottom: '1px solid #f3f4f6',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0
      }}>
        <div>
          <h2 style={{ color: '#1e3a5f', fontWeight: '700', margin: '0 0 4px', fontSize: '18px' }}>
            <i className="fa-solid fa-shield-halved" style={{ marginRight: '8px', color: '#2563eb' }}></i>
            Terms and Conditions & Privacy Policy
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>ProHealth Nexus Healthcare Platform — Effective April 2026</p>
        </div>
        <button
          onClick={() => setShowTerms(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px', padding: '4px' }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Modal Body */}
      <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, fontSize: '13px', color: '#374151', lineHeight: 1.8 }}>

        <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>1. Acceptance of Terms</h3>
        <p style={{ marginBottom: '16px' }}>By registering and using ProHealth Nexus, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use this platform. These terms apply to all users including patients, doctors, and administrators.</p>

        <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>2. Description of Service</h3>
        <p style={{ marginBottom: '16px' }}>ProHealth Nexus is a web-based healthcare management platform that enables patients to book medical appointments, view health records, and receive notifications. Doctors can record patient vitals, manage appointments, and add lab results. The platform does not provide direct medical advice or diagnosis.</p>

        <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>3. HIPAA Notice & Protected Health Information</h3>
        <p style={{ marginBottom: '8px' }}>ProHealth Nexus is designed in alignment with the Health Insurance Portability and Accountability Act (HIPAA). As a user of this platform:</p>
        <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '6px' }}>Your Protected Health Information (PHI) including vitals, lab results, and appointment records is stored securely in our database.</li>
          <li style={{ marginBottom: '6px' }}>PHI is only accessible to authorised healthcare providers directly involved in your care.</li>
          <li style={{ marginBottom: '6px' }}>We do not sell, share, or disclose your health information to third parties without your explicit consent except as required by law.</li>
          <li style={{ marginBottom: '6px' }}>All data transmissions are protected using industry standard security protocols.</li>
          <li style={{ marginBottom: '6px' }}>You have the right to request access to, correction of, or deletion of your personal health information.</li>
        </ul>

        <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>4. User Responsibilities</h3>
        <p style={{ marginBottom: '8px' }}>As a registered user of ProHealth Nexus, you agree to:</p>
        <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '6px' }}>Provide accurate, complete, and truthful information during registration and throughout your use of the platform.</li>
          <li style={{ marginBottom: '6px' }}>Keep your login credentials confidential and not share your account with others.</li>
          <li style={{ marginBottom: '6px' }}>Notify ProHealth Nexus immediately if you suspect unauthorised access to your account.</li>
          <li style={{ marginBottom: '6px' }}>Use the platform only for lawful purposes and in accordance with these terms.</li>
          <li style={{ marginBottom: '6px' }}>Not attempt to access data belonging to other users or disrupt the platform's services.</li>
        </ul>

        <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>5. Privacy Policy & Data Collection</h3>
        <p style={{ marginBottom: '8px' }}>ProHealth Nexus collects and processes the following categories of data:</p>
        <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '6px' }}><strong>Personal Information:</strong> Full name, email address, and account role.</li>
          <li style={{ marginBottom: '6px' }}><strong>Health Information:</strong> Vitals (heart rate, blood pressure, temperature, oxygen levels, weight), lab results, and appointment records.</li>
          <li style={{ marginBottom: '6px' }}><strong>Technical Data:</strong> IP addresses, login timestamps, and audit logs for security purposes.</li>
          <li style={{ marginBottom: '6px' }}><strong>Communication Data:</strong> Email notifications sent to your registered email address.</li>
        </ul>
        <p style={{ marginBottom: '16px' }}>All data is stored in a secure PostgreSQL database. Passwords are hashed using bcryptjs and are never stored in plain text. We implement Two Factor Authentication (2FA) and session management to protect your account.</p>

        <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>6. Email Communications</h3>
        <p style={{ marginBottom: '16px' }}>By registering on ProHealth Nexus, you consent to receiving email communications including account verification emails, two-factor authentication codes, appointment notifications, and health record updates. You may not opt out of security-related emails such as OTP codes and account verification emails as these are essential to the platform's security.</p>

        <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>7. Medical Disclaimer</h3>
        <p style={{ marginBottom: '16px' }}>ProHealth Nexus is a healthcare management and record-keeping platform. It does not provide medical advice, diagnosis, or treatment recommendations. Health information recorded on this platform should only be interpreted by qualified medical professionals. Always consult a qualified healthcare provider for medical decisions. In case of a medical emergency, contact emergency services immediately.</p>

        <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>8. Security</h3>
        <p style={{ marginBottom: '16px' }}>ProHealth Nexus implements multiple layers of security including password hashing, Two Factor Authentication, session timeouts, role-based access control, and audit logging. However, no system is completely infallible. Users are responsible for maintaining the confidentiality of their credentials and reporting any security concerns to the platform administrator.</p>

        <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>9. Termination</h3>
        <p style={{ marginBottom: '16px' }}>ProHealth Nexus reserves the right to suspend or terminate any account that violates these terms, provides false information, or engages in activities that compromise the security or integrity of the platform or other users' data.</p>

        <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>10. Changes to Terms</h3>
        <p style={{ marginBottom: '16px' }}>ProHealth Nexus reserves the right to update these Terms and Conditions at any time. Users will be notified of significant changes via email. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>

        <h3 style={{ color: '#1e3a5f', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>11. Contact</h3>
        <p style={{ marginBottom: '16px' }}>For questions about these terms, privacy concerns, or to request access to your data, please contact the ProHealth Nexus administrator through the platform.</p>

        <div style={{ background: '#f8faff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', marginTop: '8px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
            <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px', color: '#2563eb' }}></i>
            ProHealth Nexus is committed to protecting your health data and privacy in accordance with HIPAA guidelines and international data protection standards.
          </p>
        </div>
      </div>

      {/* Modal Footer */}
      <div style={{
        padding: '1.25rem 2rem', borderTop: '1px solid #f3f4f6',
        display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0
      }}>
        <button
          onClick={() => setShowTerms(false)}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
            background: 'white', color: '#6b7280', fontWeight: '600', fontSize: '13px',
            cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          Close
        </button>
        <button
          onClick={() => { setAgreedToTerms(true); setShowTerms(false); }}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            color: 'white', fontWeight: '600', fontSize: '13px',
            cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          <i className="fa-solid fa-check" style={{ marginRight: '6px' }}></i>
          I Agree to the Terms
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Register;