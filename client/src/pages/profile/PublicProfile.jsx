import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserProfile } from '../../services/profileService';
import PortfolioDisplay from '../../components/portfolio/PortfolioDisplay';
import Layout from '../../components/layout/Layout';
import { fileUrl } from '../../utils/helpers';
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
        if (data.success) setProfile(data.data);
        else setError('Profile not found');
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return <Layout><div className="profile-container"><div className="loading">Loading profile...</div></div></Layout>;
  }
  if (error || !profile) {
    return <Layout><div className="profile-container"><div className="error-message">{error || 'Profile not found'}</div></div></Layout>;
  }

  return (
    <Layout>
      <div className="profile-container public-profile">
        <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
        <div className="profile-header">
          <h1>{profile.name}</h1>
          {profile.user?.role && <span className="role-badge">{profile.user.role}</span>}
          {profile.isVerified && <span className="verified-badge">Verified</span>}
        </div>
        <div className="profile-content">
          <div className="profile-image-section">
            {profile.image ? (
              <img src={fileUrl(profile.image)} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-image-placeholder">
                <span>{profile.name?.charAt(0)?.toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="profile-info">
            <div className="info-group"><label>Email</label><p>{profile.user?.email}</p></div>
            <div className="info-group"><label>Business name</label><p>{profile.businessName || 'Not specified'}</p></div>
            <div className="info-group"><label>Phone</label><p>{profile.phone || 'Not specified'}</p></div>
            <div className="info-group"><label>Location</label><p>{profile.location || 'Not specified'}</p></div>
            <div className="info-group">
              <label>Availability</label>
              <p className={`status-badge ${profile.availabilityStatus === 'online' ? 'online' : 'offline'}`}>
                {profile.availabilityStatus === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        {profile.services?.length > 0 && (
          <div className="services-section">
            <h3>Services</h3>
            <div className="services-list">
              {profile.services.map((service) => (
                <div key={service._id} className="service-item">
                  <h4><Link to={`/services/${service._id}`}>{service.title}</Link></h4>
                  <p>{service.description}</p>
                  <span className="service-price">৳{service.pricing}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {profile.user?.role === 'provider' && (
          <div className="portfolio-section">
            <h3>Portfolio</h3>
            <PortfolioDisplay providerId={profile.user._id} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PublicProfile;
