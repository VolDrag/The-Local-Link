// Edit Profile Component - Create or Update Profile
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, createOrUpdateProfile } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import './EditProfile.css';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    userId: user?._id || '',
    name: '',
    age: '',
    phone: '',
    location: '',
    businessName: '',
    availabilityStatus: 'offline',
    image: null,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchExistingProfile();
  }, [user, navigate]);

  const fetchExistingProfile = async () => {
    try {
      const data = await getUserProfile(user._id);
      if (data.success && data.data) {
        const profile = data.data;
        setFormData({
          userId: user._id,
          name: profile.name || '',
          age: profile.age || '',
          phone: profile.phone || '',
          location: profile.location || '',
          businessName: profile.businessName || '',
          availabilityStatus: profile.availabilityStatus || 'offline',
          image: null,
        });
        
        if (profile.image) {
          setImagePreview(`http://localhost:5000/${profile.image}`);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Profile doesn't exist yet, that's okay
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.name || !formData.age || !formData.phone || !formData.location) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate provider fields
      if (user.role === 'provider' && !formData.businessName) {
        setError('Business name is required for providers');
        setLoading(false);
        return;
      }

      const result = await createOrUpdateProfile(formData);
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <button onClick={() => navigate('/')} className="btn-home">🏠 Home</button>
        <h1>Edit Profile</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Image Upload */}
          <div className="form-group image-upload-group">
            <label>Profile Picture</label>
            <div className="image-upload-container">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="image-preview" />
              ) : (
                <div className="image-placeholder">
                  <span>No Image</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="file-label">
                Choose Image
              </label>
            </div>
          </div>

          {/* Common Fields */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Age *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              min="18"
              max="100"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+8801812345678"
              required
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter your location"
              required
            />
          </div>

          {/* Provider-specific fields */}
          {user?.role === 'provider' && (
            <>
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Availability Status</label>
                <select
                  name="availabilityStatus"
                  value={formData.availabilityStatus}
                  onChange={handleChange}
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
