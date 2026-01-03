// Feature 11: Service Map Component
// Interactive map displaying services with location markers
// #ifty
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ServiceMap.css';

// Fix for default marker icons in Leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icon for services
const serviceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to recenter map when center changes
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

// Component to handle map clicks for manual location setting
const MapClickHandler = ({ onMapClick, isActive }) => {
  useMapEvents({
    click: (e) => {
      if (isActive && onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
};

const ServiceMap = ({ 
  services, 
  userLocation, 
  onLocationChange,
  radius,
  showRadius = true 
}) => {
  // Default center: Dhaka, Bangladesh
  const defaultCenter = [23.8103, 90.4125];
  const [mapCenter, setMapCenter] = useState(userLocation || defaultCenter);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationAccuracy, setLocationAccuracy] = useState(null); // in meters
  const [isManualMode, setIsManualMode] = useState(false); // for click-to-set location

  // Filter services that have valid coordinates
  const servicesWithCoords = services.filter(
    (service) => {
      const coords = service.location?.coordinates?.coordinates;
      return coords && coords.length === 2 && coords[0] !== 0 && coords[1] !== 0;
    }
  );

  // Count services without coordinates
  const servicesWithoutCoords = services.length - servicesWithCoords.length;

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError('');
    setLocationAccuracy(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = [position.coords.latitude, position.coords.longitude];
        const accuracy = position.coords.accuracy; // accuracy in meters
        
        setMapCenter(newLocation);
        setLocationAccuracy(accuracy);
        
        if (onLocationChange) {
          onLocationChange({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: accuracy
          });
        }
        setIsLocating(false);
        
        // Show warning if accuracy is low (> 1km)
        if (accuracy > 1000) {
          setLocationError(`Location accuracy is low (~${(accuracy/1000).toFixed(1)}km). For better accuracy, use a mobile device with GPS.`);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please allow location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location unavailable. Try using a device with GPS.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('Failed to get location');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle map click for manual location setting
  const handleMapClick = (latlng) => {
    const newLocation = [latlng.lat, latlng.lng];
    setMapCenter(newLocation);
    setLocationError('');
    setLocationAccuracy(null); // Manual location has no accuracy metric
    setIsManualMode(false); // Exit manual mode after setting
    
    if (onLocationChange) {
      onLocationChange({
        lat: latlng.lat,
        lng: latlng.lng,
        isManual: true
      });
    }
  };

  // Toggle manual location mode
  const toggleManualMode = () => {
    setIsManualMode(!isManualMode);
    if (!isManualMode) {
      setLocationError('Click on the map to set your location');
    } else {
      setLocationError('');
    }
  };

  // Update map center when user location changes
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  // Convert radius from km to meters for the circle
  const radiusInMeters = radius && radius !== 'all' ? parseFloat(radius) * 1000 : null;

  return (
    <div className="service-map-wrapper">
      <div className="map-controls">
        <button
          className="locate-me-btn"
          onClick={handleLocateMe}
          disabled={isLocating || isManualMode}
        >
          {isLocating ? '📍 Locating...' : '📍 Show My Location'}
        </button>
        
        <button
          className={`manual-location-btn ${isManualMode ? 'active' : ''}`}
          onClick={toggleManualMode}
          disabled={isLocating}
        >
          {isManualMode ? '✖ Cancel' : '🖱️ Click on Map'}
        </button>
        
        {locationError && (
          <span className={`location-error-inline ${isManualMode ? 'info-message' : ''}`}>
            {locationError}
          </span>
        )}
      </div>

      {isManualMode && (
        <div className="manual-mode-hint">
          👆 Click anywhere on the map to set your location
        </div>
      )}

      <div className="service-map-container">
        <MapContainer
          center={mapCenter}
          zoom={12}
          className="service-map"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapRecenter center={mapCenter} />
          <MapClickHandler onMapClick={handleMapClick} isActive={isManualMode} />

          {/* User location marker and radius circle */}
          {userLocation && (
            <>
              <Marker 
                position={[userLocation.lat, userLocation.lng]} 
                icon={userIcon}
              >
                <Popup>
                  <div className="user-popup">
                    <strong>📍 Your Location</strong>
                  </div>
                </Popup>
              </Marker>

              {showRadius && radiusInMeters && (
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={radiusInMeters}
                  pathOptions={{ 
                    color: '#007bff', 
                    fillColor: '#007bff', 
                    fillOpacity: 0.1,
                    weight: 2
                  }}
                />
              )}
            </>
          )}

          {/* Service markers */}
          {servicesWithCoords.map((service) => {
            const [lng, lat] = service.location.coordinates.coordinates; // GeoJSON is [lng, lat]
            return (
              <Marker
                key={service._id}
                position={[lat, lng]}
                icon={serviceIcon}
              >
                <Popup>
                  <div className="service-popup">
                    {service.images && service.images[0] && (
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className="popup-image"
                      />
                    )}
                    <h3 className="popup-title">{service.title}</h3>
                    {service.category && (
                      <span className="popup-category">{service.category.name}</span>
                    )}
                    <p className="popup-price">৳{service.pricing}</p>
                    <div className="popup-rating">
                      ⭐ {service.averageRating?.toFixed(1) || 'N/A'}
                      <span className="popup-reviews">({service.totalReviews || 0} reviews)</span>
                    </div>
                    <p className="popup-location">
                      📍 {service.location.area}, {service.location.city}
                    </p>
                    <Link to={`/services/${service._id}`} className="popup-link">
                      View Details →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Info about services and location accuracy */}
      <div className="map-info">
        <span className="services-on-map">
          🗺️ {servicesWithCoords.length} service{servicesWithCoords.length !== 1 ? 's' : ''} shown on map
        </span>
        {servicesWithoutCoords > 0 && (
          <span className="services-not-on-map">
            ℹ️ {servicesWithoutCoords} service{servicesWithoutCoords !== 1 ? 's' : ''} without location data
          </span>
        )}
        {locationAccuracy && (
          <span className={`location-accuracy ${locationAccuracy > 1000 ? 'low-accuracy' : 'good-accuracy'}`}>
            📍 Location accuracy: ~{locationAccuracy > 1000 ? `${(locationAccuracy/1000).toFixed(1)}km` : `${Math.round(locationAccuracy)}m`}
          </span>
        )}
      </div>
    </div>
  );
};

export default ServiceMap;
