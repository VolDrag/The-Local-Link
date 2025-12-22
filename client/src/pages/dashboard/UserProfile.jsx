// User Profile Display Component
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, deleteUser } from '../../services/profileService';
import { deleteService, toggleServiceAvailability } from '../../services/serviceService';
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

  const handleAddService = () => {
    navigate('/services/add');
  };

  const handleEditService = (serviceId) => {
    navigate(`/services/${serviceId}/edit`);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await deleteService(serviceId);
      // Refresh profile to update services list
      fetchProfile();
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err.message || 'Failed to delete service');
    }
  };

  const handleToggleAvailability = async (serviceId, currentStatus) => {
    try {
      await toggleServiceAvailability(serviceId);
      // Refresh profile to update services list
      fetchProfile();
      alert(`Service is now ${currentStatus === 'online' ? 'offline' : 'online'}!`);
    } catch (err) {
      console.error('Error toggling service availability:', err);
      setError(err.message || 'Failed to toggle service availability');
    }
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

          {/* Verified Status - Show for all users */}
          <div className="info-group">
            <label>Verified Status</label>
            <p className={`status-badge ${profile.isVerified ? 'verified' : 'not-verified'} ${user?.role === 'seeker' ? 'seeker-verified' : 'provider-verified'}`}>
              {profile.isVerified ? (
                <>
                  ✓ Verified 
                  {user?.role === 'seeker' && ' (3+ bookings & reviews)'}
                  {user?.role === 'provider' && ' (5+ completed bookings & reviews)'}
                </>
              ) : (
                <>
                  ✗ Not Verified
                  {user?.role === 'seeker' && ' (Need 3 bookings & 3 reviews)'}
                  {user?.role === 'provider' && ' (Need 5 completed bookings & 5 reviews)'}
                </>
              )}
            </p>
          </div>

          {/* Provider-specific fields */}
          {user?.role === 'provider' && (
            <>
              <div className="info-group">
                <label>Business Name</label>
                <p>{profile.businessName || 'Not specified'}</p>
              </div>
              
              <div className="info-group">
                <label>Availability</label>
                <p className={`status-badge ${profile.availabilityStatus === 'online' ? 'online' : 'offline'}`}>
                  {profile.availabilityStatus === 'online' ? '● Online' : '○ Offline'}
                </p>
              </div>

              <div className="info-group services-section">
                <div className="services-header">
                  <label>My Services</label>
                  <button onClick={handleAddService} className="btn-add-service">
                    + Add New Service
                  </button>
                </div>
                {profile.services && profile.services.length > 0 ? (
                  <div className="services-list">
                    {profile.services.map((service) => (
                      <div key={service._id} className="service-item">
                        <div className="service-header">
                          <h4>{service.title}</h4>
                        </div>
                        <p className="service-description">{service.description}</p>
                        <div className="service-details">
                          <span className="service-category">📁 {service.category}</span>
                          <span className="service-price">৳{service.pricing}</span>
                        </div>
                        
                        {/* Current Status Section */}
                        <div className="availability-section">
                          <div className="availability-display">
                            <span className="availability-label">Current Status:</span>
                            <span className={`status-badge-small ${service.availabilityStatus === 'online' ? 'online' : 'offline'}`}>
                              {service.availabilityStatus === 'online' ? '🟢 ONLINE' : '⚫ OFFLINE'}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleToggleAvailability(service._id, service.availabilityStatus)} 
                            className="btn-toggle-status"
                          >
                            {service.availabilityStatus === 'online' ? 'Set Offline' : 'Set Online'}
                          </button>
                        </div>

                        <div className="service-actions">
                          <button 
                            onClick={() => handleEditService(service._id)} 
                            className="btn-edit-service"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteService(service._id)} 
                            className="btn-delete-service"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-services">
                    <p className="no-services-message">
                      No services created yet. Create your first service to showcase your offerings!
                    </p>
                    <button onClick={handleAddService} className="btn-create-first-service">
                      Create Your First Service
                    </button>
                  </div>
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
