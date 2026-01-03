// Feature 20: Favorite Button Component
// Heart icon toggle for adding/removing services from favorites
// #ifty
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toggleFavorite, checkFavorite } from '../../services/favoritesService';
import './FavoriteButton.css';

const FavoriteButton = ({ serviceId, size = 'medium', showText = false, onToggle }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Check if service is already favorited on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (user && serviceId) {
        try {
          const response = await checkFavorite(serviceId);
          setIsFavorite(response.isFavorite);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        } finally {
          setInitialLoading(false);
        }
      } else {
        setInitialLoading(false);
      }
    };

    checkStatus();
  }, [user, serviceId]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Could redirect to login or show a modal
      alert('Please login to save favorites');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const response = await toggleFavorite(serviceId);
      setIsFavorite(response.isFavorite);
      
      // Callback for parent component if needed
      if (onToggle) {
        onToggle(response.isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if not logged in (optional: could show disabled state instead)
  if (!user) {
    return (
      <button
        className={`favorite-btn favorite-btn-${size} disabled`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          alert('Please login to save favorites');
        }}
        title="Login to save favorites"
      >
        <span className="heart-icon">🤍</span>
        {showText && <span className="favorite-text">Save</span>}
      </button>
    );
  }

  if (initialLoading) {
    return (
      <button className={`favorite-btn favorite-btn-${size} loading`} disabled>
        <span className="heart-icon">🤍</span>
      </button>
    );
  }

  return (
    <button
      className={`favorite-btn favorite-btn-${size} ${isFavorite ? 'active' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleToggle}
      disabled={loading}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <span className="heart-icon">{isFavorite ? '❤️' : '🤍'}</span>
      {showText && (
        <span className="favorite-text">
          {isFavorite ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
