// #ifty - Categories browse page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../../services/serviceService';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import CategoryCard from '../../components/services/CategoryCard';
import Breadcrumb from '../../components/common/Breadcrumb';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    loadCategories();
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      const data = await eventService.getActiveEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setEventsLoading(false);
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

  return (
    <div className="categories-page">
      <Breadcrumb />
      
      <div className="categories-page-header">
        <h1>Browse by Category</h1>
        <p className="categories-page-subtitle">
          Explore services by category to find what you need
        </p>
      </div>

      {loading ? (
        <div className="categories-loading">
          <div className="loader"></div>
          <p>Loading categories...</p>
        </div>
      ) : categories.length > 0 ? (
        <div className="categories-grid">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      ) : (
        <div className="no-categories">
          <p>No categories available at the moment.</p>
          <button onClick={() => navigate('/services')} className="btn-browse-all">
            Browse All Services
          </button>
        </div>
      )}

      {/* Events & Offers Section - Only shown for logged in users */}
      {user && (
        <div className="events-section">
          <div className="events-section-header">
            <h2>🎉 Events & Offers</h2>
            <p className="events-section-subtitle">
              Discover exclusive events and special offers tailored for you
              {user.role === 'seeker' && ' as a seeker'}
              {user.role === 'provider' && ' as a provider'}
            </p>
          </div>

          {eventsLoading ? (
            <div className="events-loading">
              <div className="loader"></div>
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="no-events">
              <div className="no-events-icon">📭</div>
              <h3>No Events Available</h3>
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
                      <div className="event-title-section">
                        <h3 className="event-title">{event.title}</h3>
                        {event.discount && (
                          <span className="event-discount-badge">{event.discount}</span>
                        )}
                      </div>

                      <div className="event-category-badge">{event.category}</div>

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

                      <div className="expand-indicator">
                        {isExpanded ? '▲ Click to collapse' : '▼ Click for details'}
                      </div>
                    </div>

                    <div className="event-glossy-overlay"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
