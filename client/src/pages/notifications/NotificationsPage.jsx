// Anupam - Notifications Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from '../../services/notificationService';
// Import bookingService
import bookingService from '../../services/bookingService';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications({ 
        limit: 50, 
        skip: 0, 
        unreadOnly: filter === 'unread' 
      });
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };


const handleConfirmBooking = async (e, bookingId) => {
  e.stopPropagation();
  console.log('🔍 Attempting to confirm booking:', bookingId);
  console.log('🔍 Type of bookingId:', typeof bookingId);
  try {
    await bookingService.updateBookingStatus(bookingId, 'confirmed');
    alert('Booking confirmed successfully!');
    fetchNotifications();
  } catch (error) {
    console.error('❌ Error confirming booking:', error);
    console.error('❌ Error response:', error.response?.data);
    alert('Failed to confirm booking: ' + (error.response?.data?.message || error.message));
  }
};

  const handleCancelBooking = async (e, bookingId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    try {
      await bookingService.updateBookingStatus(bookingId, 'cancelled');
      alert('Booking cancelled successfully!');
      fetchNotifications();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking: ' + (error.response?.data?.message || error.message));
    }
  };


  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_created':
        return '📅';
      case 'booking_confirmed':
        return '✅';
      case 'booking_completed':
        return '🎉';
      case 'booking_cancelled':
        return '❌';
      case 'review_received':
        return '⭐';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
      </div>

      <div className="notifications-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
        </div>
        {notifications.length > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      <div className="notifications-content">
        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <p>No notifications to display</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
              >
                <div 
                  className="notification-main"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon-large">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-details">
                    <h3>{notification.title}</h3>
                    <p>{notification.message}</p>
                    <span className="notification-timestamp">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
        
                <div className="notification-actions">
  {/* Show Confirm/Cancel buttons ONLY for pending booking_created notifications */}
  {notification.type === 'booking_created' && 
   notification.relatedBooking && 
   notification.relatedBooking.status === 'pending' && (
    <>
      <button
        className="action-btn confirm-btn"
        onClick={(e) => handleConfirmBooking(e, notification.relatedBooking._id || notification.relatedBooking)}
        title="Confirm booking"
      >
        ✅ Confirm
      </button>
      <button
        className="action-btn cancel-btn"
        onClick={(e) => handleCancelBooking(e, notification.relatedBooking._id || notification.relatedBooking)}
        title="Cancel booking"
      >
        ❌ Cancel
      </button>
    </>
  )}
  
  {/* Show status badge if booking is no longer pending */}
  {notification.type === 'booking_created' && 
   notification.relatedBooking && 
   notification.relatedBooking.status !== 'pending' && (
    <span className={`status-badge ${notification.relatedBooking.status}`}>
      {notification.relatedBooking.status === 'confirmed' && '✅ Confirmed'}
      {notification.relatedBooking.status === 'cancelled' && '❌ Cancelled'}
      {notification.relatedBooking.status === 'completed' && '🎉 Completed'}
    </span>
  )}
  
  {!notification.isRead && (
    <button
      className="action-btn read-btn"
      onClick={() => handleMarkAsRead(notification._id)}
      title="Mark as read"
    >
      ✓
    </button>
  )}
  <button
    className="action-btn delete-btn"
    onClick={() => handleDelete(notification._id)}
    title="Delete"
  >
    🗑️
  </button>
</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;