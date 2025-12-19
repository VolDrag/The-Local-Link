// Service Reviews Page
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reviewService } from '../../services/reviewService';
import { getServiceById } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReviewForm from '../../components/reviews/ReviewForm';
import ReviewList from '../../components/reviews/ReviewList';
import './ServiceReviews.css';

const ServiceReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchServiceAndReviews();
  }, [id]);

  const fetchServiceAndReviews = async () => {
    try {
      const [serviceData, reviewData] = await Promise.all([
        getServiceById(id),
        reviewService.getServiceReviews(id, 1, 10)
      ]);

      setService(serviceData);
      setReviews(reviewData.reviews);
      setHasMore(reviewData.currentPage < reviewData.totalPages);
      setPage(1);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await reviewService.getServiceReviews(id, nextPage, 10);
      setReviews(prev => [...prev, ...data.reviews]);
      setHasMore(data.currentPage < data.totalPages);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setShowReviewForm(false);
    // Refresh service data to update rating
    getServiceById(id).then(setService);
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={star <= Math.round(rating) ? 'star filled' : 'star'}>
        ★
      </span>
    ));
  };

  if (loading && !service) {
    return (
      <div className="service-reviews-page">
        <div className="loading-container">Loading...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-reviews-page">
        <div className="error-container">Service not found</div>
      </div>
    );
  }

  const isOwner = user && service.provider?._id === user._id;

  return (
    <div className="service-reviews-page">
      <button onClick={() => navigate(`/services/${id}`)} className="back-link">
        ← Back to Service
      </button>

      <div className="reviews-header">
        <div className="service-info">
          <h1>{service.title}</h1>
          <div className="rating-summary">
            <div className="stars-large">{renderStars(service.averageRating)}</div>
            <span className="rating-value">
              {service.averageRating > 0 ? service.averageRating.toFixed(1) : 'No ratings'}
            </span>
            <span className="review-count">
              ({service.totalReviews} {service.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        {user && !isOwner && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="btn-write-review"
          >
            {showReviewForm ? 'Cancel' : '✍️ Write a Review'}
          </button>
        )}
      </div>

      {showReviewForm && (
        <ReviewForm
          serviceId={id}
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      <ReviewList
        reviews={reviews}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
};

export default ServiceReviews;