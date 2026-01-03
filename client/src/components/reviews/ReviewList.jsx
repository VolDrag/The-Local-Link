// Review List Component
import { useState } from 'react';
import './ReviewList.css';

const ReviewList = ({ reviews, loading, onLoadMore, hasMore }) => {
  const [reportingReviewId, setReportingReviewId] = useState(null);

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={star <= rating ? 'star filled' : 'star'}>
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReport = (reviewId) => {
    // TODO: Implement report functionality
    console.log('Reporting review:', reviewId);
    alert('Report functionality coming soon!');
  };

  if (loading && reviews.length === 0) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="no-reviews">
        <p>No reviews yet. Be the first to review this service!</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      <h3>Customer Reviews ({reviews.length})</h3>
      
      <div className="reviews-container">
        {reviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <img
                  src={review.user?.avatar || '/placeholder-avatar.jpg'}
                  alt={review.user?.name}
                  className="reviewer-avatar"
                />
                <div>
                  <h4>{review.user?.name || 'Anonymous'}</h4>
                  <p className="review-date">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              <div className="review-rating">
                {renderStars(review.rating)}
              </div>
            </div>

            <div className="review-body">
              <p className="review-comment">{review.comment}</p>
            </div>

            {review.providerResponse && (
              <div className="provider-response">
                <strong>Provider Response:</strong>
                <p>{review.providerResponse}</p>
                {review.responseDate && (
                  <small>{formatDate(review.responseDate)}</small>
                )}
              </div>
            )}

            <div className="review-actions">
              <button 
                className="btn-report" 
                onClick={() => handleReport(review._id)}
                title="Report this review"
              >
                🚩 Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="btn-load-more"
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;