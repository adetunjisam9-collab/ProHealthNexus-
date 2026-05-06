import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';

const AuthContext = createContext();

const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );
  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  );
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const isWarningActive = useRef(false);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setShowTimeoutWarning(false);
    isWarningActive.current = false;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (!user) return;
    if (isWarningActive.current) return; // don't reset if warning is showing
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    warningRef.current = setTimeout(() => {
      isWarningActive.current = true;
      setShowTimeoutWarning(true);
    }, TIMEOUT_DURATION - 5 * 1000); // show warning 5 seconds before

    timeoutRef.current = setTimeout(() => {
      logout();
    }, TIMEOUT_DURATION);
  }, [user, logout]);

  const stayLoggedIn = useCallback(() => {
    isWarningActive.current = false;
    setShowTimeoutWarning(false);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, resetTimer]);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, resetTimer }}>
      {children}

      {showTimeoutWarning && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '2rem',
            maxWidth: '400px', width: '90%', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: '#fffbeb', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
            }}>
              <i className="fa-solid fa-clock" style={{ fontSize: '24px', color: '#d97706' }}></i>
            </div>
            <h2 style={{ color: '#1e3a5f', fontWeight: '700', margin: '0 0 8px', fontSize: '20px' }}>
              Session Expiring Soon
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 1.5rem' }}>
              You will be automatically logged out in a few seconds due to inactivity. Click Stay Logged In to continue your session.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={stayLoggedIn}
                style={{
                  padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                  color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                }}
              >
                Stay Logged In
              </button>
              <button
                onClick={logout}
                style={{
                  padding: '10px 24px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
                  background: 'white', color: '#6b7280', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                }}
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);