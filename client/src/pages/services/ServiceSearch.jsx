// ifty
import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import ServiceList from '../../components/services/ServiceList';
import Breadcrumb from '../../components/common/Breadcrumb';
import { getCategories } from '../../services/serviceService';
import {
  searchServices,
  getCountries,
  getCitiesByCountry,
  getAreasByCity,
} from '../../services/api';
import './ServiceSearch.css';

// Feature 11: Lazy load the map component
const ServiceMap = lazy(() => import('../../components/map/ServiceMap'));

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

  // Feature 11: Map and location states
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(searchParams.get('radius') || 'all');

  // Data states
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Location options
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState(searchParams.get('categoryName') || '');
  const [loadingLocations, setLoadingLocations] = useState({
    countries: false,
    cities: false,
    areas: false,
  });

  // Load countries and categories on mount
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

    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    loadCountries();
    loadCategories();
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

        // Feature 11: Add location params for radius filtering
        if (userLocation && radius && radius !== 'all') {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
          params.radius = radius;
        }

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
  }, [keyword, country, city, area, category, minRating, sort, page, limit, userLocation, radius]);

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
    setCategoryName('');
    setMinRating('');
    setSort('relevance');
    setPage(1);
    setRadius('all');
    setUserLocation(null);
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setCategory(selectedCategoryId);
    
    if (selectedCategoryId) {
      const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
      setCategoryName(selectedCategory?.name || '');
    } else {
      setCategoryName('');
    }
  };

  return (
    <div className="service-search-page">
      <Breadcrumb categoryName={categoryName} />
      
      <div className="search-header">
        <h1>Find Local Services</h1>
        <p>Discover trusted service providers in your area</p>
        {categoryName && (
          <div className="active-category-filter">
            <span>Browsing: <strong>{categoryName}</strong></span>
            <button 
              onClick={() => {
                setCategory('');
                setCategoryName('');
              }} 
              className="remove-category-btn"
              title="Clear category filter"
            >
              ✕
            </button>
          </div>
        )}
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

            {/* Feature 11: Radius filter for nearby services */}
            <div className="filter-group">
              <label>Distance {!userLocation && <span className="hint">(set location first)</span>}</label>
              <select 
                value={radius} 
                onChange={(e) => setRadius(e.target.value)}
                disabled={!userLocation}
              >
                <option value="all">All Distances</option>
                <option value="2">Within 2 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feature 11: View Toggle - List/Map */}
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
          <button
            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            🗺️ Map View
          </button>
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
          <>
            {/* Feature 11: Map View */}
            {viewMode === 'map' && (
              <Suspense fallback={<div className="loading-spinner"><p>Loading map...</p></div>}>
                <ServiceMap 
                  services={services} 
                  userLocation={userLocation}
                  onLocationChange={setUserLocation}
                  radius={radius}
                />
              </Suspense>
            )}
            
            {/* Service List (always shown below map, or alone in list view) */}
            <ServiceList
              services={services}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceSearch;

