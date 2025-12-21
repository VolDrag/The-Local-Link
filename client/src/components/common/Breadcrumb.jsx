// Breadcrumb Navigation Component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ categoryName }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Build breadcrumb trail
  const breadcrumbs = [
    { label: 'Home', path: '/' }
  ];

  // Check if we're on the services page
  if (location.pathname === '/services') {
    // If category is selected, show category in breadcrumb
    if (categoryName) {
      breadcrumbs.push({ label: 'Browse Categories', path: '/#categories' });
      breadcrumbs.push({ label: `${categoryName}`, path: null }); // Current page, no link
    } else {
      breadcrumbs.push({ label: 'Search Services', path: null }); // Current page, no link
    }
  }

  // Don't show breadcrumb if we're just on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb navigation">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="breadcrumb-item">
            {crumb.path ? (
              <>
                <Link to={crumb.path} className="breadcrumb-link">
                  {crumb.label}
                </Link>
                {index < breadcrumbs.length - 1 && (
                  <span className="breadcrumb-separator">/</span>
                )}
              </>
            ) : (
              <span className="breadcrumb-current">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
