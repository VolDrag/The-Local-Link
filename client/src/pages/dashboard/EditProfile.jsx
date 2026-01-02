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
    setError('');
    setSuccess('');

    // 1. Check required fields
    if (!formData.name || !formData.phone || !formData.location) {
      setError('Name, phone, and location are required fields');
      return;
    }

    // 2. Name validation (2-100 characters)
    if (formData.name.length < 2 || formData.name.length > 100) {
      setError('Name must be between 2 and 100 characters');
      return;
    }

    // 3. Name can only contain letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.name)) {
      setError('Name can only contain letters and spaces');
      return;
    }

    // 4. Age validation (if provided)
    if (formData.age) {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
        setError('Age must be between 18 and 120');
        return;
      }
    }

    // 5. Phone format validation (+880 followed by 10 digits)
    const phoneRegex = /^\+880\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Phone number must start with +880 followed by exactly 10 digits (e.g., +8801712345678)');
      return;
    }

    // 6. Location validation (must be from allowed cities)
    const allowedLocations = ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet'];
    if (!allowedLocations.includes(formData.location)) {
      setError('Please select a valid location');
      return;
    }

    // 7. For providers, validate business name
    if (user?.role === 'provider') {
      if (!formData.businessName) {
        setError('Business name is required for providers');
        return;
      }
      if (formData.businessName.length < 2 || formData.businessName.length > 100) {
        setError('Business name must be between 2 and 100 characters');
        return;
      }
    }

    // 8. Image file validation (if uploaded)
    if (formData.image) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(formData.image.type)) {
        setError('Only JPEG, PNG, and GIF images are allowed');
        return;
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (formData.image.size > maxSize) {
        setError('Image size must be less than 5MB');
        return;
      }
    }

    // Continue with form submission
    setLoading(true);

    try {
      // Prepare data to send - exclude provider fields for seekers
      const dataToSend = {
        userId: formData.userId,
        name: formData.name.trim(),
        age: formData.age,
        phone: formData.phone.trim(),
        location: formData.location,
        image: formData.image
      };

      // Only include provider-specific fields if user is a provider
      if (user?.role === 'provider') {
        dataToSend.businessName = formData.businessName.trim();
        dataToSend.availabilityStatus = formData.availabilityStatus;
      }

      const result = await createOrUpdateProfile(dataToSend);
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        setError(result.message || 'Failed to update profile');
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
              placeholder="+8801712345678"
              required
            />
            <small className="field-hint">Format: +880 followed by 10 digits</small>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange} required
            >
              <option value="">Select your location</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Khulna">Khulna</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Sylhet">Sylhet</option>
            </select>
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
