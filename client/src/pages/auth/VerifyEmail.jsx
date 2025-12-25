import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/verify-email', { userId, code });
      alert('Email verified! You can now log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Verify Your Email</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
          required
        />
        <button type="submit">Verify</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
    </div>
  );
};

export default VerifyEmail;
