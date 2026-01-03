// Feature 20: Favorites Page
// Displays user's saved/favorite services
// #ifty
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFavorites } from '../../services/favoritesService';
import ServiceCard from '../../components/services/ServiceCard';
import Navbar from '../../components/layout/Navbar';
import Loader from '../../components/common/Loader';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/favorites' } });
    }
  }, [user, authLoading, navigate]);

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await getFavorites();
        setFavorites(response.favorites || []);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [user]);

  if (authLoading) {
    return <Loader />;
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="favorites-page">
      <Navbar />
      
      <div className="favorites-container">
        <div className="favorites-header">
          <h1>❤️ My Favorites</h1>
          <p>Services you've saved for later</p>
        </div>

        {loading ? (
          <div className="favorites-loading">
            <Loader />
          </div>
        ) : error ? (
          <div className="favorites-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="no-favorites">
            <div className="empty-icon">💔</div>
            <h2>No favorites yet</h2>
            <p>Start exploring services and save the ones you like!</p>
            <Link to="/services" className="browse-btn">
              Browse Services
            </Link>
          </div>
        ) : (
          <>
            <div className="favorites-count">
              <span>{favorites.length} saved service{favorites.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="favorites-grid">
              {favorites.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
