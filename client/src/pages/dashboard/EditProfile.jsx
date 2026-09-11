import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, createOrUpdateProfile } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import { BD_CITIES, fileUrl } from '../../utils/helpers';
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
      const profile = data.success ? data.data : null;
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      setFormData({
        userId: user._id,
        name: profile?.name || fullName || user.username || '',
        age: profile?.age || '',
        phone: profile?.phone || user.phone || '',
        location: profile?.location || user.location || '',
        businessName: profile?.businessName || user.businessName || '',
        availabilityStatus: profile?.availabilityStatus || 'offline',
        image: null,
      });
      if (profile?.image) {
        setImagePreview(fileUrl(profile.image));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Use a JPEG, PNG, WebP, or GIF image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.phone || !formData.location) {
      setError('Name, phone, and location are required');
      return;
    }
    if (formData.name.length < 2 || formData.name.length > 100) {
      setError('Name must be between 2 and 100 characters');
      return;
    }
    if (!/^[a-zA-Z][a-zA-Z.\s'-]*$/.test(formData.name)) {
      setError('Name can contain letters, spaces, dots, hyphens, and apostrophes');
      return;
    }
    if (formData.age) {
      const ageNum = parseInt(formData.age, 10);
      if (Number.isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
        setError('Age must be between 18 and 120');
        return;
      }
    }
    if (!/^\+880\d{10}$/.test(formData.phone)) {
      setError('Phone must be +880 followed by 10 digits');
      return;
    }
    if (!BD_CITIES.includes(formData.location)) {
      setError('Please select a valid location');
      return;
    }
    if (user?.role === 'provider') {
      if (!formData.businessName?.trim()) {
        setError('Business name is required for providers');
        return;
      }
    }

    setLoading(true);
    try {
      const dataToSend = {
        userId: formData.userId,
        name: formData.name.trim(),
        age: formData.age,
        phone: formData.phone.trim(),
        location: formData.location,
        image: formData.image,
      };
      if (user?.role === 'provider') {
        dataToSend.businessName = formData.businessName.trim();
        dataToSend.availabilityStatus = formData.availabilityStatus;
      }

      const result = await createOrUpdateProfile(dataToSend);
      if (result.success) {
        setSuccess(result.message || 'Profile saved');
        setTimeout(() => navigate('/profile'), 800);
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="edit-profile-container">
        <div className="edit-profile-card">
          <h1>Edit profile</h1>
          <p className="module-lead" style={{ marginBottom: '1.5rem' }}>
            Your photo and details are what seekers and providers see before a booking.
          </p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group image-upload-group">
              <label>Profile picture</label>
              <div className="image-upload-container">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="image-placeholder">
                    <span>{formData.name?.charAt(0)?.toUpperCase() || '+'}</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="file-input"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="upload-label">
                  {imagePreview ? 'Change photo' : 'Add photo'}
                </label>
                <p className="image-hint">JPEG, PNG, or WebP · max 5MB</p>
              </div>
            </div>

            <div className="form-group">
              <label>Full name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Optional" min="18" max="120" />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+8801712345678" required />
              <small className="field-hint">Format: +880 and 10 digits</small>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <select id="location" name="location" value={formData.location} onChange={handleChange} required>
                <option value="">Select your location</option>
                {BD_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {user?.role === 'provider' && (
              <>
                <div className="form-group">
                  <label>Business name *</label>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Availability</label>
                  <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleChange}>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/profile')} className="btn-cancel" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-submit btn-save" disabled={loading}>
                {loading ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;
