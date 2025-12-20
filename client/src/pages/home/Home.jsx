// Home page - Landing page with hero section and features
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/profileService';
import NotificationBell from '../../components/notifications/NotificationBell'; // Anupam - Notification Bell
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
      
      // Check if profile exists and has name (indicating it's created)
      if (data.success && data.data && data.data.name) {
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      console.error('Error checking profile:', err);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileAction = () => {
    if (hasProfile) {
      navigate('/profile');
    } else {
      navigate('/profile/edit');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Header/Navbar */}
      <header className="home-header">
        <div className="header-content">
          <h1 className="logo">The Local Link</h1>
          <nav className="nav-menu">
            {user && <NotificationBell />}
            {user ? (
              <>
                <button onClick={handleProfileAction} className="nav-btn">
                  {hasProfile ? '👤 My Profile' : '✏️ Create Profile'}
                </button>
                <button onClick={handleLogout} className="nav-btn logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="nav-btn">
                  Login
                </button>
                <button onClick={() => navigate('/register')} className="nav-btn register-btn">
                  Register
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Welcome to The Local Link</h2>
          <p className="hero-subtitle">
            Connect with local service providers and seekers in your community
          </p>
          
          {user ? (
            <>
              <div className="welcome-message">
                <h3>Hello, {user?.username}! 👋</h3>
                <p className="user-role">You are logged in</p>
              </div>
              
              {!hasProfile && (
                <div className="profile-alert">
                  <p>⚠️ You haven't created your profile yet!</p>
                  <button onClick={() => navigate('/profile/edit')} className="btn-create-profile">
                    Create Your Profile Now
                  </button>
                </div>
              )}
              
              {hasProfile && (
                <div className="profile-complete">
                  <p>✓ Your profile is complete!</p>
                  <button onClick={() => navigate('/profile')} className="btn-view-profile">
                    View Your Profile
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="guest-message">
              <h3>Join Our Community Today!</h3>
              <p>Sign in to access local services or register to get started</p>
              <div className="auth-buttons">
                <button onClick={() => navigate('/login')} className="btn-login">
                  Login
                </button>
                <button onClick={() => navigate('/register')} className="btn-register">
                  Register Now
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">{user ? 'What You Can Do' : 'Our Features'}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Find Services</h3>
            <p>Search and discover local service providers in your area</p>
            {user ? (
              <button onClick={() => navigate('/services')} className="feature-btn">
                Browse Services
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="feature-btn">
                Login to Browse
              </button>
            )}
          </div>

          {user?.role === 'provider' && (
            <div className="feature-card">
              <div className="feature-icon">➕</div>
              <h3>Add Service</h3>
              <p>List your services and reach more customers</p>
              <button onClick={() => navigate('/services/add')} className="feature-btn">
                Add New Service
              </button>
            </div>
          )}

          {user && (
            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Manage Profile</h3>
              <p>Update your information and preferences</p>
              <button onClick={handleProfileAction} className="feature-btn">
                {hasProfile ? 'View Profile' : 'Create Profile'}
              </button>
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>Admin Dashboard</h3>
              <p>Manage users, services, and platform settings</p>
              <button onClick={() => navigate('/admin/dashboard')} className="feature-btn">
                Go to Dashboard
              </button>
            </div>
          )}

          {!user && (
            <>
              <div className="feature-card">
                <div className="feature-icon">🤝</div>
                <h3>Connect Locally</h3>
                <p>Build connections with service providers in your community</p>
                <button onClick={() => navigate('/register')} className="feature-btn">
                  Get Started
                </button>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⭐</div>
                <h3>Quality Services</h3>
                <p>Access verified and trusted local service providers</p>
                <button onClick={() => navigate('/register')} className="feature-btn">
                  Join Now
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2025 The Local Link. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;