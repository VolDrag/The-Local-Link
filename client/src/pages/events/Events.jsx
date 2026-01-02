import { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedEventId, setExpandedEventId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getActiveEvents();
      setEvents(data);
      setError('');
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isEventExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="events-page">
        <div className="events-container">
          <div className="loading-spinner">Loading events...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page">
        <div className="events-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-container">
        <header className="events-header">
          <h1>🎉 Events & Offers</h1>
          <p className="events-subtitle">
            Discover exclusive events and special offers tailored for you
            {user && user.role === 'seeker' && ' as a seeker'}
            {user && user.role === 'provider' && ' as a provider'}
          </p>
        </header>

        {events.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon">📭</div>
            <h2>No Events Available</h2>
            <p>Check back soon for new events and exciting offers!</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => {
              const isExpanded = expandedEventId === event._id;
              const expired = isEventExpired(event.endDate);
              
              return (
                <div 
                  key={event._id} 
                  className={`event-card ${isExpanded ? 'expanded' : ''} ${expired ? 'expired' : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${event.color}dd 0%, ${event.color}99 100%)`,
                    boxShadow: `0 8px 32px ${event.color}40`
                  }}
                  onClick={() => toggleExpand(event._id)}
                >
                  <div className="event-card-content">
                    {/* Title Section - Always Visible */}
                    <div className="event-title-section">
                      <h2 className="event-title">{event.title}</h2>
                      {event.discount && (
                        <span className="event-discount-badge">{event.discount}</span>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="event-category-badge">{event.category}</div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="event-details">
                        <div className="event-description">
                          <p>{event.description}</p>
                        </div>

                        <div className="event-info-grid">
                          <div className="event-info-item">
                            <span className="info-icon">📅</span>
                            <div className="info-content">
                              <span className="info-label">Start Date</span>
                              <span className="info-value">{formatDate(event.startDate)}</span>
                            </div>
                          </div>

                          <div className="event-info-item">
                            <span className="info-icon">🏁</span>
                            <div className="info-content">
                              <span className="info-label">End Date</span>
                              <span className="info-value">{formatDate(event.endDate)}</span>
                            </div>
                          </div>

                          {event.targetAudience !== 'all' && (
                            <div className="event-info-item">
                              <span className="info-icon">
                                {event.targetAudience === 'seeker' ? '🔍' : '🛠️'}
                              </span>
                              <div className="info-content">
                                <span className="info-label">For</span>
                                <span className="info-value">
                                  {event.targetAudience === 'seeker' ? 'Seekers' : 'Providers'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {expired && (
                          <div className="expired-notice">
                            ⚠️ This event has ended
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expand Indicator */}
                    <div className="expand-indicator">
                      {isExpanded ? '▲ Click to collapse' : '▼ Click for details'}
                    </div>
                  </div>

                  {/* Glossy Overlay Effect */}
                  <div className="glossy-overlay"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
