// ifty
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getServiceById } from '../../services/api';
import { deleteService } from '../../services/serviceService';  //*Rafi*/
import { useAuth } from '../../context/AuthContext';    //*Rafi*/
import BookingForm from '../../components/booking/BookingForm';//Anupam
import './ServiceDetails.css';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();   // Get current logged-in user info  //*Rafi*/
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);  //*Rafi*/
  const [showBookingForm, setShowBookingForm] = useState(false); //Anupam
  const [deleting, setDeleting] = useState(false);    //*Rafi*/

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getServiceById(id);
        setService(data);
      } catch (err) {
        setError('Failed to load service details. Please try again.');
        console.error('Error fetching service:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  const formatPrice = () => {
    if (!service) return '';
    const unitLabels = {
      hour: '/hour',
      day: '/day',
      project: '/project',
      fixed: '',
    };
    return `৳${service.pricing}${unitLabels[service.pricingUnit] || ''}`;
  };
//****Rafi****/
//feature 15: Delete Service
  // Check if current user is the owner or admin
  const isOwner = user && service && user._id === service.provider?._id;
  const isAdmin = user && user.role === 'admin';
  const canEdit = isOwner || isAdmin;

  const handleEdit = () => {
    navigate(`/services/${id}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteService(id);
      alert('Service deleted successfully!');
      navigate('/services');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert(error.message || 'Failed to delete service. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };
//Anupam - Booking handlers
const handleBookService = () => {
  if (!user) {
    navigate('/login');
    return;
  }
  setShowBookingForm(true);
};

const handleBookingSuccess = (booking) => {
  setShowBookingForm(false);
};
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };


  if (loading) {
    return (
      <div className="service-details-page">
        <div className="loading-container">
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="service-details-page">
        <div className="error-container">
          <p>{error || 'Service not found'}</p>
          <button onClick={() => navigate('/services')} className="back-btn">
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  const { provider, category, location } = service;

  return (
    <div className="service-details-page">
      <button onClick={() => navigate('/services')} className="back-link">
        ← Back to Search
      </button>

      <div className="service-details-container">
        <div className="service-images">
          <div className="main-image">
            <img
              src={
                service.images && service.images[selectedImage]
                  ? service.images[selectedImage]
                  : '/placeholder-service.jpg'
              }
              alt={service.title}
            />
          </div>
          {service.images && service.images.length > 1 && (
            <div className="image-thumbnails">
              {service.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${service.title} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="service-info">
          <div className="service-header">
            <div>
              <h1>{service.title}</h1>
              {category && <span className="category-badge">{category.name}</span>}
            </div>
            <div className="price-tag">{formatPrice()}</div>
          </div>

          <div className="rating-section">
            <div className="stars">{renderStars(service.averageRating)}</div>
            <span className="rating-value">
              {service.averageRating > 0 ? service.averageRating.toFixed(1) : 'No ratings'}
            </span>
            <span className="review-count">
              ({service.totalReviews} {service.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
            <Link to={`/services/${id}/reviews`} className="view-reviews-btn">
              View All Reviews
            </Link>
          </div>

          <div className="location-section">
            <h3>Location</h3>
            <p>
              📍 {location.area}, {location.city}, {location.country}
            </p>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p>{service.description}</p>
          </div>

          {service.hasOffer && service.offerDescription && (
            <div className="offer-section">
              <h4>Special Offer</h4>
              <p>{service.offerDescription}</p>
              {service.offerExpiry && (
                <span className="offer-expiry">
                  Valid until: {new Date(service.offerExpiry).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          <div className="action-buttons">
  {!isOwner && (
    <button className="book-now-btn" onClick={handleBookService}>
      📅 Book Now
    </button>
  )}
  <button className="contact-btn">Contact Provider</button>
  <button className="bookmark-btn">♥ Save</button>
</div>

        </div>

        <div className="provider-info">
          <h3>Service Provider</h3>
          <div className="provider-card">
            <img
              src={provider?.avatar || '/placeholder-avatar.jpg'}
              alt={provider?.name}
              className="provider-avatar"
            />
            <div className="provider-details">
              <h4>{provider?.businessName || provider?.name}</h4>
              {provider?.isVerified && (
                <span className="verified-badge">✓ Verified Provider</span>
              )}
              {provider?.bio && <p className="provider-bio">{provider.bio}</p>}
              
              <div className="provider-contact">
                {provider?.email && (
                  <p>
                    <strong>Email:</strong> {provider.email}
                  </p>
                )}
                {provider?.phone && (
                  <p>
                    <strong>Phone:</strong> {provider.phone}
                  </p>
                )}
                {provider?.location && (
                  <p>
                    <strong>Location:</strong> {provider.location.city}, {provider.location.country}
                  </p>
                )}
              </div>

              {provider?.availability && (
                <div className="availability-status">
                  <span className={`status-indicator ${provider.availability}`}>
                    {provider.availability === 'online' && '🟢 Available'}
                    {provider.availability === 'offline' && '⚫ Offline'}
                    {provider.availability === 'busy' && '🟡 Busy'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {provider?.portfolio && provider.portfolio.length > 0 && (
            <div className="portfolio-preview">
              <h4>Portfolio</h4>
              <div className="portfolio-grid">
                {provider.portfolio.slice(0, 4).map((item, index) => (
                  <div key={index} className="portfolio-item">
                    {item?.image && <img src={item.image} alt={item?.title || 'Portfolio item'} />}
                    {item?.title && <p className="portfolio-title">{item.title}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this service? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={handleDeleteCancel}
                className="btn-cancel"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn-delete"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showBookingForm && (
        <div className="modal-overlay" onClick={() => setShowBookingForm(false)}>
          <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
            <BookingForm 
              service={service} 
              onClose={() => setShowBookingForm(false)}
              onSuccess={handleBookingSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;
