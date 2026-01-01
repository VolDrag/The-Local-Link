// Feature 19 - Anupam: Provider Booking History Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import Navbar from '../../components/layout/Navbar';
import Loader from '../../components/common/Loader';
import './ProviderBookingHistory.css';

const ProviderBookingHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'provider') {
      navigate('/profile');
      return;
    }
    
    fetchProviderBookingHistory();
  }, [user, navigate, statusFilter, startDate, endDate]);

  const fetchProviderBookingHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const data = await bookingService.getProviderBookingHistory(filters);
      setBookings(data.bookings || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error fetching provider booking history:', err);
      setError(err.response?.data?.message || 'Failed to load booking history');
    } finally {
      setLoading(false);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (pricing) => {
    if (!pricing) return 'N/A';
    return `৳${pricing.amount} / ${pricing.unit}`;
  };

  const handleViewDetails = (bookingId) => {
    navigate(`/bookings/${bookingId}`);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) {
      return;
    }

    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      fetchProviderBookingHistory(); // Refresh the list
      alert(`Booking marked as ${newStatus} successfully!`);
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
  };

  if (loading) return <Loader />;

  return (
    <div className="provider-booking-history-page">
      <Navbar />
      
      <div className="provider-booking-history-container">
        <div className="history-header">
          <h1>My Service History</h1>
          <p className="subtitle">Manage and track all bookings for your services</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-label">Total Bookings</span>
                <span className="stat-value">{stats.total}</span>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{stats.pending}</span>
              </div>
            </div>
            <div className="stat-card confirmed">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-label">Confirmed</span>
                <span className="stat-value">{stats.confirmed}</span>
              </div>
            </div>
            <div className="stat-card completed">
              <div className="stat-icon">🎉</div>
              <div className="stat-content">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{stats.completed}</span>
              </div>
            </div>
            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value">৳{stats.totalRevenue || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <h3>Filter Bookings</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-actions">
              <button onClick={handleClearFilters} className="btn-clear-filters">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Bookings List */}
        <div className="bookings-section">
          <h3>Service Records ({bookings.length})</h3>
          
          {bookings.length === 0 ? (
            <div className="no-bookings">
              <div className="no-bookings-icon">📭</div>
              <h4>No bookings found</h4>
              <p>You haven't received any bookings yet or no bookings match your filters.</p>
            </div>
          ) : (
            <div className="bookings-grid">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-card-header">
                    <h4>{booking.service?.title || 'Service Unavailable'}</h4>
                    <span className={getStatusBadgeClass(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="booking-card-body">
                    <div className="booking-info-row">
                      <span className="info-icon">👤</span>
                      <div className="info-content">
                        <span className="info-label">Customer</span>
                        <span className="info-value">{booking.seeker?.name || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="booking-info-row">
                      <span className="info-icon">📧</span>
                      <div className="info-content">
                        <span className="info-label">Email</span>
                        <span className="info-value">{booking.seeker?.email || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="booking-info-row">
                      <span className="info-icon">📅</span>
                      <div className="info-content">
                        <span className="info-label">Scheduled</span>
                        <span className="info-value">{formatDate(booking.scheduledTime)}</span>
                      </div>
                    </div>
                    
                    <div className="booking-info-row">
                      <span className="info-icon">💰</span>
                      <div className="info-content">
                        <span className="info-label">Price</span>
                        <span className="info-value">{formatPrice(booking.service?.pricing)}</span>
                      </div>
                    </div>
                    
                    <div className="booking-info-row">
                      <span className="info-icon">📂</span>
                      <div className="info-content">
                        <span className="info-label">Category</span>
                        <span className="info-value">{booking.service?.category || 'N/A'}</span>
                      </div>
                    </div>

                    {booking.userNotes && (
                      <div className="booking-notes">
                        <span className="notes-label">Customer Notes:</span>
                        <p>{booking.userNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="booking-card-footer">
                    <button 
                      onClick={() => handleViewDetails(booking._id)}
                      className="btn-view-details"
                    >
                      View Details
                    </button>
                    
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                          className="btn-confirm"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                          className="btn-cancel-booking"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <button 
                        onClick={() => handleUpdateStatus(booking._id, 'completed')}
                        className="btn-complete"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderBookingHistory;