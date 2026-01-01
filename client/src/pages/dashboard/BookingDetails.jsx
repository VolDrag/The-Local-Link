// Feature 19 - Booking Details Page
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import Navbar from '../../components/layout/Navbar';
import Loader from '../../components/common/Loader';
import './BookingDetails.css';

const BookingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookingDetails();
  }, [id, user, navigate]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getBookingById(id);
      setBooking(data);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) {
      return;
    }

    try {
      setUpdating(true);
      await bookingService.updateBookingStatus(id, newStatus);
      await fetchBookingDetails(); // Refresh booking data
      alert(`Booking status updated to ${newStatus} successfully!`);
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'status-badge pending',
      confirmed: 'status-badge confirmed',
      completed: 'status-badge completed',
      cancelled: 'status-badge cancelled'
    };
    return classes[status] || 'status-badge';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (pricing) => {
    if (!pricing) return 'N/A';
    return `৳${pricing.amount} / ${pricing.unit}`;
  };

  if (loading) return <Loader />;

  if (error || !booking) {
    return (
      <div className="booking-details-page">
        <Navbar />
        <div className="booking-details-container">
          <div className="error-message">
            <span>⚠️</span> {error || 'Booking not found'}
          </div>
          <button onClick={() => navigate(-1)} className="btn-back">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isProvider = user._id === booking.provider._id;
  const isSeeker = user._id === booking.seeker._id;

  return (
    <div className="booking-details-page">
      <Navbar />
      
      <div className="booking-details-container">
        <div className="details-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Back
          </button>
          <h1>Booking Details</h1>
          <span className={getStatusBadgeClass(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        <div className="details-content">
          {/* Service Information */}
          <section className="details-section">
            <h2>📋 Service Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Service Name</label>
                <p>{booking.service?.title || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Category</label>
                <p>{booking.service?.category || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Price</label>
                <p className="price-value">{formatPrice(booking.service?.pricing)}</p>
              </div>
              {booking.service?.description && (
                <div className="info-item full-width">
                  <label>Description</label>
                  <p>{booking.service.description}</p>
                </div>
              )}
            </div>
          </section>

          {/* Booking Details */}
          <section className="details-section">
            <h2>📅 Booking Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Booking ID</label>
                <p className="booking-id">{booking._id}</p>
              </div>
              <div className="info-item">
                <label>Scheduled Date & Time</label>
                <p className="scheduled-time">{formatDate(booking.scheduledTime)}</p>
              </div>
              <div className="info-item">
                <label>Booking Created</label>
                <p>{formatDate(booking.createdAt)}</p>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <p>{formatDate(booking.updatedAt)}</p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="details-section">
            <h2>👥 Contact Information</h2>
            <div className="contact-grid">
              {isProvider && (
                <div className="contact-card">
                  <h3>Customer (Service Seeker)</h3>
                  <div className="contact-info">
                    <p><strong>Name:</strong> {booking.seeker?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {booking.seeker?.email || 'N/A'}</p>
                    {booking.seeker?.phone && (
                      <p><strong>Phone:</strong> {booking.seeker.phone}</p>
                    )}
                  </div>
                </div>
              )}
              
              {isSeeker && (
                <div className="contact-card">
                  <h3>Provider (Service Provider)</h3>
                  <div className="contact-info">
                    <p><strong>Name:</strong> {booking.provider?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {booking.provider?.email || 'N/A'}</p>
                    {booking.provider?.phone && (
                      <p><strong>Phone:</strong> {booking.provider.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Customer Notes */}
          {booking.userNotes && (
            <section className="details-section">
              <h2>📝 Customer Notes</h2>
              <div className="notes-box">
                <p>{booking.userNotes}</p>
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <section className="details-actions">
            {isProvider && (
              <>
                {booking.status === 'pending' && (
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleUpdateStatus('confirmed')}
                      className="btn-action btn-confirm"
                      disabled={updating}
                    >
                      ✅ Confirm Booking
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('cancelled')}
                      className="btn-action btn-cancel"
                      disabled={updating}
                    >
                      ❌ Cancel Booking
                    </button>
                  </div>
                )}
                
                {booking.status === 'confirmed' && (
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleUpdateStatus('completed')}
                      className="btn-action btn-complete"
                      disabled={updating}
                    >
                      ✓ Mark as Completed
                    </button>
                  </div>
                )}
              </>
            )}

            {isSeeker && booking.status === 'completed' && (
              <div className="action-buttons">
                <button 
                  onClick={() => navigate(`/services/${booking.service._id}/reviews`)}
                  className="btn-action btn-review"
                >
                  ⭐ Leave a Review
                </button>
              </div>
            )}

            <button 
              onClick={() => navigate(`/services/${booking.service._id}`)}
              className="btn-action btn-view-service"
            >
              👁️ View Service Details
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;