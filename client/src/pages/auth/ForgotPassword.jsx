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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setUserId(res.data.userId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset code');
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/verify-reset-code', { userId, code });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password', { userId, code, newPassword });
      alert('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="auth-form">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit">Send Reset Code</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleCodeSubmit} className="auth-form">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            required
          />
          <button type="submit">Verify Code</button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handleResetSubmit} className="auth-form">
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      )}
      {error && <div style={{color:'red'}}>{error}</div>}
    </div>
  );
};

export default ForgotPassword;

