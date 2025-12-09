// ifty
import ServiceCard from './ServiceCard';
import './ServiceList.css';

const ServiceList = ({ services, pagination, onPageChange }) => {
  const { currentPage, totalPages, totalResults } = pagination;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (!services || services.length === 0) {
    return (
      <div className="no-services">
        <p>No services found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="service-list-container">
      <div className="results-info">
        <p>Showing {services.length} of {totalResults} results</p>
      </div>

      <div className="service-grid">
        {services.map((service) => (
          <ServiceCard key={service._id} service={service} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="page-numbers">
            {currentPage > 3 && (
              <>
                <button className="page-number" onClick={() => onPageChange(1)}>
                  1
                </button>
                {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
              </>
            )}

            {getPageNumbers().map((page) => (
              <button
                key={page}
                className={`page-number ${page === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                <button className="page-number" onClick={() => onPageChange(totalPages)}>
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceList;

