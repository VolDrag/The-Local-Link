// Enhanced Booking form with custom date/time pickers
import { useState } from 'react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import './BookingForm.css';

const BookingForm = ({ service, onClose, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [userNotes, setUserNotes] = useState('');

  // Business hours configuration (8 AM to 8 PM)
  const businessHours = { start: 8, end: 20 };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setError(null);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    // Validation
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    if (!selectedTime) {
      setError('Please select a time');
      return;
    }

    // Combine date and time
    const [hours, minutes] = selectedTime.split(':');
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Validate that the scheduled time is in the future
    const now = new Date();
    if (scheduledDateTime <= now) {
      setError('Please select a future date and time');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        serviceId: service._id,
        scheduledDate: scheduledDateTime.toISOString(),
        userNotes: userNotes.trim()
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

  // Get summary of selected date and time
  const getScheduleSummary = () => {
    if (!selectedDate || !selectedTime) return null;
    
    const [hours, minutes] = selectedTime.split(':');
    const dateTime = new Date(selectedDate);
    dateTime.setHours(parseInt(hours), parseInt(minutes));
    
    return dateTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

        <div className="datetime-container">
          <div className="form-group">
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              label="Select Date"
              required={true}
            />
          </div>

          <div className="form-group">
            <TimePicker
              selectedTime={selectedTime}
              onTimeChange={handleTimeChange}
              label="Select Time"
              required={true}
              businessHours={businessHours}
              timeSlotInterval={30}
            />
          </div>
        </div>

        {selectedDate && selectedTime && (
          <div className="schedule-summary">
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <strong>Scheduled for:</strong>
              <p>{getScheduleSummary()}</p>
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="userNotes">
            Additional Notes (Optional)
          </label>
          <textarea
            id="userNotes"
            name="userNotes"
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="Any specific requirements or questions..."
            rows="4"
            maxLength="500"
          />
          <small>{userNotes.length}/500 characters</small>
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
          <button type="submit" className="btn-submit" disabled={loading || !selectedDate || !selectedTime}>
            {loading ? 'Sending Request...' : 'Send Booking Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;