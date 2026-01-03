//######Rafi######
// EditService.jsx - Edit existing service listing
import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateService, getCategories } from '../../services/serviceService';
import { getServiceById, getCountries, getCitiesByCountry, getAreasByCity } from '../../services/api';
import './AddService.css'; // Reusing the same CSS

// Feature 11: Lazy load LocationPicker for map
const LocationPicker = lazy(() => import('../../components/map/LocationPicker'));

const EditService = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get service ID from URL
  const [loading, setLoading] = useState(false);
  const [fetchingService, setFetchingService] = useState(true);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    pricing: '',
    pricingUnit: 'fixed',
    location: {
      country: '',
      city: '',
      area: '',
      // Feature 11: Add coordinates for map
      coordinates: null,
    },
    images: [],
    hasOffer: false,
    offerDescription: '',
    offerExpiry: '',
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Fetch service data, categories and countries on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setFetchingService(true);
        const [serviceData, categoriesData, countriesData] = await Promise.all([
          getServiceById(id),
          getCategories(),
          getCountries(),
        ]);
        
        setCategories(categoriesData);
        setCountries(countriesData);
        
        // Pre-fill form with existing service data
        setFormData({
          title: serviceData.title || '',
          description: serviceData.description || '',
          category: serviceData.category?._id || serviceData.category || '',
          pricing: serviceData.pricing || '',
          pricingUnit: serviceData.pricingUnit || 'fixed',
          location: {
            country: serviceData.location?.country || '',
            city: serviceData.location?.city || '',
            area: serviceData.location?.area || '',
            // Feature 11: Load existing coordinates if available
            coordinates: serviceData.location?.coordinates?.coordinates 
              ? { 
                  lng: serviceData.location.coordinates.coordinates[0], 
                  lat: serviceData.location.coordinates.coordinates[1] 
                } 
              : null,
          },
          images: serviceData.images || [],
          hasOffer: serviceData.specialOffers?.hasOffer || false,
          offerDescription: serviceData.specialOffers?.offerDescription || '',
          offerExpiry: serviceData.specialOffers?.offerExpiry 
            ? new Date(serviceData.specialOffers.offerExpiry).toISOString().split('T')[0]
            : '',
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setSubmitError('Failed to load service data. Please try again.');
      } finally {
        setFetchingService(false);
      }
    };

    fetchInitialData();
  }, [id]);

  // Fetch cities when country changes
  useEffect(() => {
    const fetchCities = async () => {
      if (formData.location.country) {
        try {
          const citiesData = await getCitiesByCountry(formData.location.country);
          setCities(citiesData);
        } catch (error) {
          console.error('Error fetching cities:', error);
        }
      }
    };

    if (!fetchingService) {
      fetchCities();
    }
  }, [formData.location.country, fetchingService]);

  // Fetch areas when city changes
  useEffect(() => {
    const fetchAreas = async () => {
      if (formData.location.country && formData.location.city) {
        try {
          const areasData = await getAreasByCity(
            formData.location.country,
            formData.location.city
          );
          setAreas(areasData);
        } catch (error) {
          console.error('Error fetching areas:', error);
        }
      }
    };

    if (!fetchingService) {
      fetchAreas();
    }
  }, [formData.location.city, fetchingService]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle location fields (e.g., "location.country")
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        location: { ...formData.location, [field]: value }
      });
    } 
    // Handle regular fields
    else {
      const fieldValue = type === 'checkbox' ? checked : value;
      setFormData({ ...formData, [name]: fieldValue });
    }

    // Clear error for this field when user fixes it
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const value = e.target.value;
    const imageUrls = value.split(',').map(url => url.trim()).filter(url => url);
    setFormData({
      ...formData,
      images: imageUrls,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Service title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Service description is required';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.pricing) {
      newErrors.pricing = 'Pricing is required';
    } else if (isNaN(formData.pricing) || parseFloat(formData.pricing) < 0) {
      newErrors.pricing = 'Please enter a valid price';
    }

    if (!formData.location.country) newErrors.country = 'Country is required';
    if (!formData.location.city) newErrors.city = 'City is required';
    if (!formData.location.area) newErrors.area = 'Area is required';

    if (formData.hasOffer && !formData.offerDescription.trim()) {
      newErrors.offerDescription = 'Offer description is required';
    }
    if (formData.hasOffer && !formData.offerExpiry) {
      newErrors.offerExpiry = 'Offer expiry date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!validateForm()) {
      setSubmitError('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const serviceData = {
        ...formData,
        pricing: parseFloat(formData.pricing),
      };

      await updateService(id, serviceData);
      
      setSubmitSuccess('Service updated successfully!');
      
      // Redirect to service details page after 2 seconds
      setTimeout(() => {
        navigate(`/services/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating service:', error);
      setSubmitError(error.message || 'Failed to update service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/services/${id}`);
  };

  if (fetchingService) {
    return (
      <div className="add-service-container">
        <div className="add-service-card">
          <p>Loading service data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-service-container">
      <div className="add-service-card">
        <h1>Edit Service</h1>
        <p className="subtitle">Update your service listing information</p>

        {submitError && <div className="alert alert-error">{submitError}</div>}
        {submitSuccess && <div className="alert alert-success">{submitSuccess}</div>}

        <form onSubmit={handleSubmit} className="add-service-form">
          {/* Basic Information */}
          <section className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title">
                Service Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Professional Kitchen Plumbing"
                maxLength="100"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your service in detail..."
                rows="6"
                maxLength="2000"
                className={errors.description ? 'error' : ''}
              />
              <small>{formData.description.length}/2000 characters</small>
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>
          </section>

          {/* Pricing */}
          <section className="form-section">
            <h2>Pricing</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pricing">
                  Price <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="pricing"
                  name="pricing"
                  value={formData.pricing}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={errors.pricing ? 'error' : ''}
                />
                {errors.pricing && <span className="error-message">{errors.pricing}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="pricingUnit">Pricing Unit</label>
                <select
                  id="pricingUnit"
                  name="pricingUnit"
                  value={formData.pricingUnit}
                  onChange={handleChange}
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hour">Per Hour</option>
                  <option value="day">Per Day</option>
                  <option value="project">Per Project</option>
                </select>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="form-section">
            <h2>Location</h2>

            <div className="form-group">
              <label htmlFor="country">
                Country <span className="required">*</span>
              </label>
              <select
                id="country"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                className={errors.country ? 'error' : ''}
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">
                  City <span className="required">*</span>
                </label>
                <select
                  id="city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  disabled={!formData.location.country}
                  className={errors.city ? 'error' : ''}
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="area">
                  Area <span className="required">*</span>
                </label>
                <select
                  id="area"
                  name="location.area"
                  value={formData.location.area}
                  onChange={handleChange}
                  disabled={!formData.location.city}
                  className={errors.area ? 'error' : ''}
                >
                  <option value="">Select an area</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                {errors.area && <span className="error-message">{errors.area}</span>}
              </div>
            </div>

            {/* Feature 11: Location Picker Map */}
            <Suspense fallback={<div className="map-loading">Loading map...</div>}>
              <LocationPicker
                coordinates={formData.location.coordinates}
                onCoordinatesChange={(coords) => {
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      coordinates: coords
                    }
                  });
                }}
              />
            </Suspense>
          </section>

          {/* Images */}
          <section className="form-section">
            <h2>Images (Optional)</h2>

            <div className="form-group">
              <label htmlFor="images">Image URLs</label>
              <textarea
                id="images"
                name="images"
                value={formData.images.join(', ')}
                onChange={handleImageChange}
                placeholder="Enter image URLs separated by commas"
                rows="3"
              />
              <small>Separate multiple URLs with commas</small>
            </div>
          </section>

          {/* Special Offer */}
          <section className="form-section">
            <h2>Special Offer (Optional)</h2>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="hasOffer"
                  checked={formData.hasOffer}
                  onChange={handleChange}
                />
                This service has a special offer
              </label>
            </div>

            {formData.hasOffer && (
              <>
                <div className="form-group">
                  <label htmlFor="offerDescription">
                    Offer Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="offerDescription"
                    name="offerDescription"
                    value={formData.offerDescription}
                    onChange={handleChange}
                    placeholder="Describe your special offer..."
                    rows="3"
                    maxLength="200"
                    className={errors.offerDescription ? 'error' : ''}
                  />
                  {errors.offerDescription && (
                    <span className="error-message">{errors.offerDescription}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="offerExpiry">
                    Offer Expiry Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="offerExpiry"
                    name="offerExpiry"
                    value={formData.offerExpiry}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.offerExpiry ? 'error' : ''}
                  />
                  {errors.offerExpiry && (
                    <span className="error-message">{errors.offerExpiry}</span>
                  )}
                </div>
              </>
            )}
          </section>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating Service...' : 'Update Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditService;
