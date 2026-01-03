// ifty
import { Link } from 'react-router-dom';
import FavoriteButton from '../favorites/FavoriteButton'; // Feature 20
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
    hasDiscount,
    originalPrice,
    discountedPrice,
    discountPercentage,
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
    
    const unit = unitLabels[pricingUnit] || '';
    
    // Use category-based discount from backend if available
    if (hasDiscount && originalPrice && discountedPrice) {
      return {
        originalPrice: originalPrice,
        offerPrice: discountedPrice,
        unit: unit,
        hasDiscount: true,
        discountPercent: discountPercentage
      };
    }
    
    // Extract discount percentage from offerDescription if it exists (legacy offer system)
    let discountPercent = 0;
    if (isOfferValid && offerDescription) {
      const match = offerDescription.match(/(\d+)%?\s*off/i);
      if (match) {
        discountPercent = parseInt(match[1]);
      }
    }
    
    const price = pricing || originalPrice || 0;
    const offerPrice = discountPercent > 0 ? price * (1 - discountPercent / 100) : price;
    
    return { originalPrice: price, offerPrice, unit, hasDiscount: discountPercent > 0, discountPercent };
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
          {/* Feature 20: Favorite Button */}
          <div className="favorite-btn-wrapper">
            <FavoriteButton serviceId={_id} size="small" />
          </div>
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
              {(() => {
                const priceData = formatPrice();
                return priceData.hasDiscount ? (
                  <>
                    <span className="offer-badge">🏷️ {priceData.discountPercent}% OFF</span>
                    <div className="price-wrapper">
                      <span className="original-price">৳{priceData.originalPrice.toFixed(0)}</span>
                      <span className="offer-price">৳{priceData.offerPrice.toFixed(0)}{priceData.unit}</span>
                    </div>
                  </>
                ) : (
                  <div className="service-price">৳{priceData.originalPrice}{priceData.unit}</div>
                );
              })()}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ServiceCard;

