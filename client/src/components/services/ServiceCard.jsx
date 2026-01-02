// ifty
import { Link } from 'react-router-dom';
import './ServiceCard.css';

const ServiceCard = ({ service }) => {
  const {
    _id,
    title,
    description,
    pricing,
    pricingUnit,
    images,
    category,
    location,
    averageRating,
    totalReviews,
    provider,
    hasOffer,
    offerDescription,
    offerExpiry,
  } = service;

  // Debug: Log offer data
  if (hasOffer) {
    console.log('Service with offer:', {
      title,
      hasOffer,
      offerDescription,
      offerExpiry,
      pricing
    });
  }

  // Check if offer is valid (not expired)
  const isOfferValid = hasOffer && offerExpiry && new Date(offerExpiry) > new Date();

  // Format price display
  const formatPrice = () => {
    const unitLabels = {
      hour: '/hour',
      day: '/day',
      project: '/project',
      fixed: '',
    };
    
    // Extract discount percentage from offerDescription if it exists
    let discountPercent = 0;
    if (isOfferValid && offerDescription) {
      const match = offerDescription.match(/(\d+)%?\s*off/i);
      if (match) {
        discountPercent = parseInt(match[1]);
      }
    }
    
    const unit = unitLabels[pricingUnit] || '';
    const originalPrice = pricing;
    const offerPrice = discountPercent > 0 ? pricing * (1 - discountPercent / 100) : pricing;
    
    return { originalPrice, offerPrice, unit, hasDiscount: discountPercent > 0 };
  };

  // Render star rating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(averageRating) ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="service-card">
      <Link to={`/services/${_id}`} className="service-card-link">
        <div className="service-card-image">
          <img
            src={images && images[0] ? images[0] : '/placeholder-service.jpg'}
            alt={title}
          />
          {category && <span className="service-category">{category.name}</span>}
          {provider?.isVerified && (
            <span className="verified-badge provider-verified">✓ Verified Provider</span>
          )}
        </div>

        <div className="service-card-content">
          <h3 className="service-title">{title}</h3>
          
          <p className="service-description">
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </p>

          <div className="service-provider">
            <img
              src={provider?.avatar || '/placeholder-avatar.jpg'}
              alt={provider?.name}
              className="provider-avatar"
            />
            <span>{provider?.businessName || provider?.name}</span>
          </div>

          <div className="service-location">
            <span className="location-icon">📍</span>
            <span>{location.area}, {location.city}</span>
          </div>

          <div className="service-footer">
            <div className="service-rating">
              <div className="stars">{renderStars()}</div>
              <span className="rating-text">
                {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
                {totalReviews > 0 && ` (${totalReviews})`}
              </span>
            </div>

            <div className="service-price-container">
              {isOfferValid && (() => {
                const priceData = formatPrice();
                return priceData.hasDiscount ? (
                  <>
                    <span className="offer-badge">🏷️ OFFER</span>
                    <div className="price-wrapper">
                      <span className="original-price">৳{priceData.originalPrice.toFixed(0)}</span>
                      <span className="offer-price">৳{priceData.offerPrice.toFixed(0)}{priceData.unit}</span>
                    </div>
                  </>
                ) : (
                  <div className="service-price">৳{priceData.originalPrice}{priceData.unit}</div>
                );
              })()}
              {!isOfferValid && (() => {
                const priceData = formatPrice();
                return <div className="service-price">৳{priceData.originalPrice}{priceData.unit}</div>;
              })()}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ServiceCard;

