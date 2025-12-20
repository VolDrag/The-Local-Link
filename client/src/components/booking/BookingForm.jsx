// Booking form component
// Booking form component
import { useState } from 'react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './BookingForm.css';

const BookingForm = ({ service, onClose, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    scheduledDate: '',
    userNotes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    // Validation
    if (!formData.scheduledDate) {
      setError('Please select a date and time');
      return;
    }

    const selectedDate = new Date(formData.scheduledDate);
    const now = new Date();
    
    if (selectedDate < now) {
      setError('Please select a future date and time');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        serviceId: service._id,
        scheduledDate: formData.scheduledDate,
        userNotes: formData.userNotes
      };

      const newBooking = await bookingService.createBooking(bookingData);
      
      if (onSuccess) {
        onSuccess(newBooking);
      }
      
      alert('Booking request sent successfully!');
      if (onClose) {
        onClose();
      }
      navigate('/profile');
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      <div className="booking-form-header">
        <h2>Book This Service</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose} type="button">×</button>
        )}
      </div>

      <div className="service-summary">
        <h3>{service.title}</h3>
        <p className="service-price">৳{service.pricing}/{service.pricingUnit}</p>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="scheduledDate">
            Preferred Date & Time <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            id="scheduledDate"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="userNotes">
            Additional Notes (Optional)
          </label>
          <textarea
            id="userNotes"
            name="userNotes"
            value={formData.userNotes}
            onChange={handleChange}
            placeholder="Any specific requirements or questions..."
            rows="4"
            maxLength="500"
          />
          <small>{formData.userNotes.length}/500 characters</small>
        </div>

        <div className="booking-info">
          <p><strong>Note:</strong> Your booking request will be sent to the provider for confirmation.</p>
        </div>

        <div className="form-actions">
          {onClose && (
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
          )}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Sending Request...' : 'Send Booking Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
