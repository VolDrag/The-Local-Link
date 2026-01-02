import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Forgot password page
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Check if email is provided
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setUserId(res.data.userId);
      setStep(2);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Check if code is provided
    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    // 2. Code must be 6 digits
    if (!/^\d{6}$/.test(code)) {
      setError('Code must be exactly 6 digits');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/verify-reset-code', { userId, code });
      setStep(3);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Check if passwords are provided
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    // 2. Password length validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // 3. Password must contain number
    const hasNumber = /\d/.test(newPassword);
    if (!hasNumber) {
      setError('Password must contain at least one number');
      return;
    }

    // 4. Password must contain special character
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    if (!hasSpecialChar) {
      setError('Password must contain at least one special character (!@#$%^&* etc.)');
      return;
    }

    // 5. Passwords must match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { userId, code, newPassword });
      alert('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}
        
        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="auth-form">
            <p className="auth-subtitle">Enter the 6-digit code sent to your email</p>
            <div className="form-group">
              <label htmlFor="code">Verification Code *</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength="6"
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}
        
        {step === 3 && (
          <form onSubmit={handleResetSubmit} className="auth-form">
            <p className="auth-subtitle">Create a new password</p>
            <div className="form-group">
              <label htmlFor="newPassword">New Password *</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 number, 1 special char"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        <div className="auth-footer">
          <p>
            <a onClick={() => navigate('/login')} style={{cursor: 'pointer'}}>← Back to Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

