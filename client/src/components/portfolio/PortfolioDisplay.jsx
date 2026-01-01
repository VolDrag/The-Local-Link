// ============= Feature 25: Provider Portfolio Showcase - START =============
// Portfolio Display Component
// Read-only portfolio viewer for viewing provider portfolios (customers view this)
import React, { useState, useEffect } from 'react';
import './PortfolioDisplay.css';

const PortfolioDisplay = ({ providerId, portfolioData }) => {
  // STEP 1: State variables - storage boxes for our data
  const [portfolio, setPortfolio] = useState(portfolioData || []); // Portfolio works to display
  const [loading, setLoading] = useState(!portfolioData); // Is data being fetched?
  const [error, setError] = useState(''); // Error message if fetch fails
  const [lightboxOpen, setLightboxOpen] = useState(false); // Is fullscreen modal open?
  const [currentImageIndex, setCurrentImageIndex] = useState({ workIndex: 0, imageIndex: 0 }); // Which image is shown in lightbox

  // STEP 2: Load portfolio when component starts
  useEffect(() => {
    // If portfolioData is provided as prop, use it directly (faster)
    if (portfolioData) {
      setPortfolio(portfolioData);
      setLoading(false);
    } else if (providerId) {
      // Otherwise fetch from backend API
      fetchPortfolio();
    }
  }, [providerId, portfolioData]);

  // STEP 3: Fetch portfolio from backend
  const fetchPortfolio = async () => {
    if (!providerId) return;

    try {
      setLoading(true);
      setError('');
      
      // Call backend API to get provider's portfolio
      const response = await fetch(`http://localhost:5000/api/users/portfolio/${providerId}`);
      const data = await response.json();

      if (data.success) {
        setPortfolio(data.data.portfolio || []);
      } else {
        setError(data.message || 'Failed to load portfolio');
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Error loading portfolio');
    } finally {
      setLoading(false);
    }
  };

  // STEP 4: Open lightbox (fullscreen image viewer)
  const openLightbox = (workIndex, imageIndex) => {
    setCurrentImageIndex({ workIndex, imageIndex }); // Remember which image to show
    setLightboxOpen(true); // Open the modal
  };

  // STEP 5: Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // STEP 6: Navigate to next image in lightbox
  const goToNext = () => {
    const currentWork = portfolio[currentImageIndex.workIndex];
    const nextImageIndex = currentImageIndex.imageIndex + 1;
    
    // If there are more images in current work, show next image
    if (nextImageIndex < currentWork.images.length) {
      setCurrentImageIndex({ ...currentImageIndex, imageIndex: nextImageIndex });
    } else {
      // If this was the last image of current work, jump to next work's first image
      const nextWorkIndex = currentImageIndex.workIndex + 1;
      if (nextWorkIndex < portfolio.length) {
        setCurrentImageIndex({ workIndex: nextWorkIndex, imageIndex: 0 });
      }
    }
  };

  // STEP 7: Navigate to previous image in lightbox
  const goToPrevious = () => {
    const prevImageIndex = currentImageIndex.imageIndex - 1;
    
    // If not the first image of current work, show previous image
    if (prevImageIndex >= 0) {
      setCurrentImageIndex({ ...currentImageIndex, imageIndex: prevImageIndex });
    } else {
      // If this was the first image of current work, jump to previous work's last image
      const prevWorkIndex = currentImageIndex.workIndex - 1;
      if (prevWorkIndex >= 0) {
        const prevWork = portfolio[prevWorkIndex];
        setCurrentImageIndex({ workIndex: prevWorkIndex, imageIndex: prevWork.images.length - 1 });
      }
    }
  };

  // STEP 8: Handle keyboard shortcuts (ESC to close, arrows to navigate)
  const handleKeyPress = (e) => {
    if (!lightboxOpen) return;
    
    if (e.key === 'Escape') {
      closeLightbox(); // ESC key closes lightbox
    } else if (e.key === 'ArrowRight') {
      goToNext(); // Right arrow → next image
    } else if (e.key === 'ArrowLeft') {
      goToPrevious(); // Left arrow ← previous image
    }
  };

  // STEP 9: Setup keyboard listener when component loads
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress); // Cleanup when component unmounts
  }, [lightboxOpen]);

  // STEP 10: Calculate total number of images across all works
  const totalImages = portfolio.reduce((sum, work) => sum + (work.images?.length || 0), 0);

  // STEP 11: Show loading spinner while fetching data
  // STEP 11: Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="portfolio-display">
        <div className="portfolio-loading">
          <div className="loading-spinner"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  // STEP 12: Show error message if fetch failed
  if (error) {
    return (
      <div className="portfolio-display">
        <div className="portfolio-error">{error}</div>
      </div>
    );
  }

  // STEP 13: Show empty state if no portfolio works
  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="portfolio-display">
        <h3>
          <span className="portfolio-icon">🖼️</span>
          Portfolio
        </h3>
        <div className="portfolio-empty">
          <div className="portfolio-empty-icon">📸</div>
          <p>No portfolio items to display yet</p>
        </div>
      </div>
    );
  }

  // STEP 14: Display portfolio in gallery grid
  return (
    <div className="portfolio-display">
      <h3>
        <span className="portfolio-icon">🖼️</span>
        Portfolio
      </h3>
      <div className="portfolio-stats">
        {portfolio.length} {portfolio.length === 1 ? 'work' : 'works'} • {totalImages} {totalImages === 1 ? 'image' : 'images'}
      </div>

      {/* Gallery grid showing all works */}
      <div className="portfolio-gallery">
        {portfolio.map((work, workIndex) => (
          <div key={workIndex} className="portfolio-work-card">
            <div className="portfolio-work-images">
              {work.images && work.images.map((imageUrl, imgIndex) => (
                <div
                  key={imgIndex}
                  className="portfolio-work-image-wrapper"
                  onClick={() => openLightbox(workIndex, imgIndex)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && openLightbox(workIndex, imgIndex)}
                >
                  <img
                    src={`http://localhost:5000/${imageUrl}`}
                    alt={`${work.title} - Image ${imgIndex + 1}`}
                    className="portfolio-work-image"
                    loading="lazy"
                  />
                  {work.images.length > 1 && (
                    <span className="image-badge">{imgIndex + 1}/{work.images.length}</span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="portfolio-work-info">
              <h4 className="portfolio-work-title">{work.title}</h4>
              <p className="portfolio-work-description">{work.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* STEP 15: Lightbox modal for fullscreen image viewing */}
      {lightboxOpen && portfolio[currentImageIndex.workIndex] && (
        <div className="portfolio-lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
              ×
            </button>
            
            <button
              className="lightbox-nav prev"
              onClick={goToPrevious}
              aria-label="Previous image"
              disabled={currentImageIndex.workIndex === 0 && currentImageIndex.imageIndex === 0}
            >
              ‹
            </button>
            <button
              className="lightbox-nav next"
              onClick={goToNext}
              aria-label="Next image"
              disabled={
                currentImageIndex.workIndex === portfolio.length - 1 &&
                currentImageIndex.imageIndex === portfolio[currentImageIndex.workIndex].images.length - 1
              }
            >
              ›
            </button>

            <img
              src={`http://localhost:5000/${portfolio[currentImageIndex.workIndex].images[currentImageIndex.imageIndex]}`}
              alt={portfolio[currentImageIndex.workIndex].title}
              className="lightbox-image"
            />
            
            <div className="lightbox-description">
              <h3>{portfolio[currentImageIndex.workIndex].title}</h3>
              <p>{portfolio[currentImageIndex.workIndex].description}</p>
              <small>
                Image {currentImageIndex.imageIndex + 1} of {portfolio[currentImageIndex.workIndex].images.length}
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDisplay;
// ============= Feature 25: Provider Portfolio Showcase - END =============
