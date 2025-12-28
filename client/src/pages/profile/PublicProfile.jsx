// PublicProfile.jsx - View another user's/provider's profile
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../services/profileService';
import './PublicProfile.css';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getUserProfile(id);
        if (data.success) {
          setProfile(data.data);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="profile-container"><div className="loading">Loading profile...</div></div>;
  }
  if (error || !profile) {
    return <div className="profile-container"><div className="error-message">{error || 'Profile not found'}</div></div>;
  }

  return (
    <div className="profile-container public-profile">
      <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
      <div className="profile-header">
        <h1>{profile.name}</h1>
        {profile.user?.role && <span className="role-badge">{profile.user.role}</span>}
        {profile.isVerified && <span className="verified-badge">✓ Verified</span>}
      </div>
      <div className="profile-content">
        <div className="profile-image-section">
          {profile.image ? (
            <img src={`http://localhost:5000/${profile.image}`} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-image-placeholder">
              <span>{profile.name?.charAt(0)?.toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="profile-info">
          <div className="info-group"><label>Email</label><p>{profile.user?.email}</p></div>
          <div className="info-group"><label>Business Name</label><p>{profile.businessName || 'Not specified'}</p></div>
          <div className="info-group"><label>Phone</label><p>{profile.phone || 'Not specified'}</p></div>
          <div className="info-group"><label>Location</label><p>{profile.location || 'Not specified'}</p></div>
          <div className="info-group"><label>User Availability</label><p className={`status-badge ${profile.availabilityStatus === 'online' ? 'online' : 'offline'}`}>{profile.availabilityStatus === 'online' ? '● Online' : '○ Offline'}</p></div>
        </div>
      </div>
      {/* Services */}
      {profile.services && profile.services.length > 0 && (
        <div className="services-section">
          <h3>Services</h3>
          <div className="services-list">
            {profile.services.map((service) => (
              <div key={service._id} className="service-item">
                <h4>{service.title}</h4>
                <p>{service.description}</p>
                <span className="service-category">📁 {service.category}</span>
                <span className="service-price">৳{service.pricing}</span>
                <div className="availability-section">
                  <span className="availability-label">Current Status:</span>
                  <span className={`status-badge-small ${service.availabilityStatus === 'online' ? 'online' : 'offline'}`}>
                    {service.availabilityStatus === 'online' ? '🟢 ONLINE' : '⚫ OFFLINE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Portfolio (if any) */}
      {profile.portfolio && profile.portfolio.length > 0 && (
        <div className="portfolio-section">
          <h3>Portfolio</h3>
          <div className="portfolio-list">
            {profile.portfolio.map((item, idx) => (
              <div key={idx} className="portfolio-item">
                {item.image && <img src={item.image} alt={item.title || 'Portfolio'} style={{width: '100%', borderRadius: '8px', marginBottom: '8px'}} />}
                {item.title && <p className="portfolio-title">{item.title}</p>}
                {item.description && <p className="portfolio-description">{item.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
