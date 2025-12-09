// ifty
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ServiceList from '../../components/services/ServiceList';
import {
  searchServices,
  getCountries,
  getCitiesByCountry,
  getAreasByCity,
} from '../../services/api';
import './ServiceSearch.css';

const ServiceSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [limit] = useState(20);

  // Data states
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Location options
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState({
    countries: false,
    cities: false,
    areas: false,
  });

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoadingLocations((prev) => ({ ...prev, countries: true }));
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (err) {
        console.error('Error loading countries:', err);
      } finally {
        setLoadingLocations((prev) => ({ ...prev, countries: false }));
      }
    };
    loadCountries();
  }, []);

  // Load cities when country changes
  useEffect(() => {
    if (country) {
      const loadCities = async () => {
        setLoadingLocations((prev) => ({ ...prev, cities: true }));
        try {
          const data = await getCitiesByCountry(country);
          setCities(data);
          if (!data.includes(city)) {
            setCity('');
            setArea('');
          }
        } catch (err) {
          console.error('Error loading cities:', err);
        } finally {
          setLoadingLocations((prev) => ({ ...prev, cities: false }));
        }
      };
      loadCities();
    } else {
      setCities([]);
      setCity('');
      setArea('');
    }
  }, [country]);

  // Load areas when city changes
  useEffect(() => {
    if (country && city) {
      const loadAreas = async () => {
        setLoadingLocations((prev) => ({ ...prev, areas: true }));
        try {
          const data = await getAreasByCity(country, city);
          setAreas(data);
          if (!data.includes(area)) {
            setArea('');
          }
        } catch (err) {
          console.error('Error loading areas:', err);
        } finally {
          setLoadingLocations((prev) => ({ ...prev, areas: false }));
        }
      };
      loadAreas();
    } else {
      setAreas([]);
      setArea('');
    }
  }, [country, city]);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          keyword,
          country,
          city,
          area,
          category,
          minRating,
          sort,
          page,
          limit,
        };

        Object.keys(params).forEach(
          (key) => !params[key] && delete params[key]
        );

        const data = await searchServices(params);
        setServices(data.services);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalResults: data.totalResults,
        });

        setSearchParams(params);
      } catch (err) {
        setError('Failed to load services. Please try again.');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [keyword, country, city, area, category, minRating, sort, page, limit]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setKeyword('');
    setCountry('');
    setCity('');
    setArea('');
    setCategory('');
    setMinRating('');
    setSort('relevance');
    setPage(1);
  };

  return (
    <div className="service-search-page">
      <div className="search-header">
        <h1>Find Local Services</h1>
        <p>Discover trusted service providers in your area</p>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Search for services..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </div>
        </form>

        <div className="filters-section">
          <div className="filters-header">
            <h3>Filters</h3>
            <button onClick={handleClearFilters} className="clear-filters-btn">
              Clear All
            </button>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loadingLocations.countries}
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!country || loadingLocations.cities}
              >
                <option value="">All Cities</option>
                {cities.length === 0 && country && !loadingLocations.cities && (
                  <option disabled>No cities available</option>
                )}
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Area</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                disabled={!city || loadingLocations.areas}
              >
                <option value="">All Areas</option>
                {areas.length === 0 && city && !loadingLocations.areas && (
                  <option disabled>No areas available</option>
                )}
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All Categories</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Minimum Rating</label>
              <select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                <option value="">Any Rating</option>
                <option value="4">4★ & above</option>
                <option value="3">3★ & above</option>
                <option value="2">2★ & above</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="results-section">
        {loading ? (
          <div className="loading-spinner">
            <p>Loading services...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <ServiceList
            services={services}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceSearch;

