// User Profile Display Component
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, deleteUser } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile(user._id);
      
      if (data.success) {
        setProfile(data.data);
      } else {
        // Profile doesn't exist yet
        setProfile(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      setError('');
      
      const result = await deleteUser(user._id);
      
      if (result.success) {
        // Logout and redirect to home
        logout();
        navigate('/', { state: { message: 'Account deleted successfully' } });
      } else {
        setError(result.message || 'Failed to delete account');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!profile || !profile.name) {
    return (
      <div className="profile-container">
        <div className="no-profile">
          <h2>No Profile Found</h2>
          <p>You haven't created your profile yet.</p>
          <button onClick={handleEditProfile} className="btn-primary">
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate('/')} className="btn-home">🏠 Home</button>
        <h1>My Profile</h1>
        <div className="header-actions">
          <button onClick={handleEditProfile} className="btn-edit">
            Edit Profile
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="btn-delete">
            Delete Account
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-image-section">
          {profile.image ? (
            <img 
              src={`http://localhost:5000/${profile.image}`} 
              alt="Profile" 
              className="profile-image"
            />
          ) : (
            <div className="profile-image-placeholder">
              <span>{profile.name?.charAt(0)?.toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="info-group">
            <label>Name</label>
            <p>{profile.name}</p>
          </div>

          {profile.user && (
            <>
              <div className="info-group">
                <label>Username</label>
                <p>{profile.user.username}</p>
              </div>

              <div className="info-group">
                <label>Email</label>
                <p>{profile.user.email}</p>
              </div>

              <div className="info-group">
                <label>Role</label>
                <p className="role-badge">{profile.user.role}</p>
              </div>
            </>
          )}

          <div className="info-group">
            <label>Age</label>
            <p>{profile.age || 'Not specified'}</p>
          </div>

          <div className="info-group">
            <label>Phone</label>
            <p>{profile.phone || 'Not specified'}</p>
          </div>

          <div className="info-group">
            <label>Location</label>
            <p>{profile.location || 'Not specified'}</p>
          </div>

          {/* Provider-specific fields */}
          {profile.user?.role === 'provider' && (
            <>
              <div className="info-group">
                <label>Business Name</label>
                <p>{profile.businessName || 'Not specified'}</p>
              </div>

              <div className="info-group">
                <label>Verified Status</label>
                <p className={`status-badge ${profile.isVerified ? 'verified' : 'not-verified'}`}>
                  {profile.isVerified ? '✓ Verified' : '✗ Not Verified'}
                </p>
              </div>

              <div className="info-group">
                <label>Availability</label>
                <p className={`status-badge ${profile.availabilityStatus === 'online' ? 'online' : 'offline'}`}>
                  {profile.availabilityStatus === 'online' ? '● Online' : '○ Offline'}
                </p>
              </div>

              <div className="info-group">
                <label>My Services</label>
                {profile.services && profile.services.length > 0 ? (
                  <div className="services-list">
                    {profile.services.map((service) => (
                      <div key={service._id} className="service-item">
                        <h4>{service.title}</h4>
                        <p>{service.description}</p>
                        <span className="service-price">৳{service.pricing}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-services-message">
                    No services created yet. Create your first service to showcase your offerings!
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Account</h2>
            <p className="warning-text">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <p className="warning-subtext">
              All your data including profile, services, bookings, and reviews will be permanently deleted.
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="btn-cancel"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount} 
                className="btn-confirm-delete"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
