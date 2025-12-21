// CategoryCard Component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getIcon } from '../../utils/iconMapping';
import './CategoryCard.css';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  const IconComponent = getIcon(category.icon);

  const handleClick = () => {
    // Navigate to services page with category filter
    navigate(`/services?category=${category._id}&categoryName=${encodeURIComponent(category.name)}`);
  };

  return (
    <div className="category-card" onClick={handleClick}>
      <div className="category-card-icon">
        <IconComponent className="category-icon" />
      </div>
      <div className="category-card-content">
        <h3 className="category-card-title">{category.name}</h3>
        {category.description && (
          <p className="category-card-description">{category.description}</p>
        )}
        <div className="category-card-footer">
          {category.serviceCount > 0 ? (
            <span className="category-service-count">
              {category.serviceCount} {category.serviceCount === 1 ? 'service' : 'services'}
            </span>
          ) : (
            <span className="category-no-services">No services yet</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
