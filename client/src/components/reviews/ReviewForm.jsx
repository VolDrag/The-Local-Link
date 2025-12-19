// Review Form Component
import { useState } from 'react';
import { reviewService } from '../../services/reviewService';
import './ReviewForm.css';

const ReviewForm = ({ serviceId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please add a comment');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const review = await reviewService.createReview({
        serviceId,
        rating,
        comment: comment.trim()
      });

      alert('Review submitted successfully!');
      if (onSuccess) {
        onSuccess(review);
      }
    } catch (err) {
      console.error('Review error:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="review-form-container">
      <h3>Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="review-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Rating <span className="required">*</span></label>
          <div className="star-rating">
            {renderStars()}
            {rating > 0 && <span className="rating-text">({rating} out of 5)</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment">
            Your Review <span className="required">*</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this service..."
            maxLength={500}
            rows={5}
            required
          />
          <small>{comment.length}/500 characters</small>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;