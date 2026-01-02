// Register page
// Teammate 1: User registration form
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../assets/Style/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    providesServices: 'no',
    businessName: '',
  });
  const [error, setError] = useState('');

  const {
    username,
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    phone,
    location,
    providesServices,
    businessName,
  } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Check required fields
    if (!username || !email || !password || !confirmPassword || !firstName || !phone || !location) {
      setError('Please fill in all required fields');
      return;
    }

    // 2. Username validation
    if (username.length < 3 || username.length > 30) {
      setError('Username must be between 3 and 30 characters');
      return;
    }

    // 3. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address');
      return;
    }

    // 4. First name validation
    if (firstName.length < 2 || firstName.length > 50) {
      setError('First name must be between 2 and 50 characters');
      return;
    }

    // 5. Password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // 6. Password must contain number
    const hasNumber = /\d/.test(password);
    if (!hasNumber) {
      setError('Password must contain at least one number');
      return;
    }

    // 7. Password must contain special character
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasSpecialChar) {
      setError('Password must contain at least one special character (!@#$%^&* etc.)');
      return;
    }

    // 8. Password confirmation match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // 9. Phone validation (required)
    const phoneRegex = /^\+880\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setError('Phone number must start with +880 followed by exactly 10 digits');
      return;
    }

    // 10. Location validation
    const allowedLocations = ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Comilla'];
    if (!allowedLocations.includes(location)) {
      setError('Please select a valid location');
      return;
    }

    // 11. Business name validation for providers
    if (providesServices === 'yes' && (!businessName || businessName.trim() === '')) {
      setError('Business name is required for service providers');
      return;
    }

    // Prepare data - set role based on providesServices
    const role = providesServices === 'yes' ? 'provider' : 'seeker';
    
    const userData = {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      location,
      role,
    };

    if (providesServices === 'yes') {
      userData.businessName = businessName;
    }

    // Call register
    const result = await register(userData);

    if (result.success) {
      // Redirect based on role
      if (result.data.role === 'provider') {
        navigate('/');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button onClick={() => navigate('/')} className="btn-home">🏠 Home</button>
        <h2>Register for The Local Link</h2>
        <p className="auth-subtitle">Create your account and get started</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter password (min 6 chars)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={handleChange}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={handleChange}
                placeholder="+8801XXXXXXXXX"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <select
                id="location"
                name="location"
                value={location}
                onChange={handleChange}
                required
              >
                <option value="">Select your location</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Khulna">Khulna</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Comilla">Comilla</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="providesServices">Do you provide any services? *</label>
            <select id="providesServices" name="providesServices" value={providesServices} onChange={handleChange} required>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {providesServices === 'yes' && (
            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={businessName}
                onChange={handleChange}
                placeholder="Enter your business name"
                required
              />
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

