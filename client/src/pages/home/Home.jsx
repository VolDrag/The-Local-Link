import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/profileService';
import Layout from '../../components/layout/Layout';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile(user._id);
      setHasProfile(Boolean(data.success && data.data && data.data.name));
    } catch {
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="home-container"><div className="loading">Loading...</div></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="home-container">
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">Trusted local help, paid only when the job is done.</h2>
            <p className="hero-subtitle">
              Search nearby providers, hold payment in bKash until completion, and book people whose identity has been reviewed.
            </p>

            {user ? (
              <>
                <div className="welcome-message">
                  <h3>Hello, {user?.username}</h3>
                  <p className="user-role">{user.role} account</p>
                </div>
                {!hasProfile && (
                  <div className="profile-alert">
                    <p>Finish your profile so providers and seekers can reach you.</p>
                    <button onClick={() => navigate('/profile/edit')} className="btn-create-profile">Create profile</button>
                  </div>
                )}
              </>
            ) : (
              <div className="guest-message">
                <div className="auth-buttons">
                  <button onClick={() => navigate('/login')} className="btn-login">Login</button>
                  <button onClick={() => navigate('/register')} className="btn-register">Register</button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-title">What you can do</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Find services</h3>
              <p>Filter by category, map radius, and rating. Featured listings appear first.</p>
              <button onClick={() => navigate(user ? '/categories' : '/login')} className="feature-btn">Browse</button>
            </div>
            {user?.role === 'provider' && (
              <>
                <div className="feature-card">
                  <h3>List a service</h3>
                  <p>Set hourly to monthly rates and pin your location on the map.</p>
                  <button onClick={() => navigate('/services/add')} className="feature-btn">Add service</button>
                </div>
                <div className="feature-card">
                  <h3>Get verified</h3>
                  <p>Upload NID or a trade license before you can accept bookings.</p>
                  <button onClick={() => navigate('/verification')} className="feature-btn">Verify identity</button>
                </div>
              </>
            )}
            {user?.role === 'seeker' && (
              <div className="feature-card">
                <h3>Your bookings</h3>
                <p>Pay to hold a slot, chat about arrival, reschedule, or open a dispute.</p>
                <button onClick={() => navigate('/bookings/history')} className="feature-btn">Open bookings</button>
              </div>
            )}
            {user?.role === 'admin' && (
              <div className="feature-card">
                <h3>Operate the platform</h3>
                <p>Verify providers, resolve disputes, and approve payouts.</p>
                <button onClick={() => navigate('/admin/dashboard')} className="feature-btn">Dashboard</button>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
