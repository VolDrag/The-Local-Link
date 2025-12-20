// Anupam - Notification Bell Component
import { useState, useEffect } from 'react';
import { getNotifications } from '../../services/notificationService';
import NotificationDropdown from './NotificationDropdown';
import './NotificationBell.css';

const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications({ limit: 10, skip: 0 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNotificationUpdate = () => {
    fetchNotifications();
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell-btn" 
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onClose={() => setShowDropdown(false)}
          onUpdate={handleNotificationUpdate}
        />
      )}
    </div>
  );
};

export default NotificationBell;