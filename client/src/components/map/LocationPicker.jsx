// Feature 11: Location Picker Component
// Interactive map for providers to set service coordinates
// #ifty
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

// Fix for default marker icons in Leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    }
  });
  return null;
};

// Component to recenter map
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], 15);
    }
  }, [center, map]);
  return null;
};

const LocationPicker = ({ coordinates, onCoordinatesChange, disabled = false }) => {
  // Default center: Dhaka, Bangladesh
  const defaultCenter = { lat: 23.8103, lng: 90.4125 };
  const [position, setPosition] = useState(coordinates || null);
  const [manualLat, setManualLat] = useState(coordinates?.lat?.toString() || '');
  const [manualLng, setManualLng] = useState(coordinates?.lng?.toString() || '');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Update local state when coordinates prop changes
  useEffect(() => {
    if (coordinates?.lat && coordinates?.lng) {
      setPosition(coordinates);
      setManualLat(coordinates.lat.toString());
      setManualLng(coordinates.lng.toString());
    }
  }, [coordinates]);

  const handleLocationSelect = (newPosition) => {
    if (disabled) return;
    setPosition(newPosition);
    setManualLat(newPosition.lat.toFixed(6));
    setManualLng(newPosition.lng.toFixed(6));
    onCoordinatesChange(newPosition);
    setLocationError('');
  };

  const handleUseMyLocation = () => {
    if (disabled) return;
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        handleLocationSelect(newPosition);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please allow location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An error occurred while getting location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleManualInput = () => {
    if (disabled) return;
    
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      setLocationError('Please enter valid coordinates');
      return;
    }

    if (lat < -90 || lat > 90) {
      setLocationError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setLocationError('Longitude must be between -180 and 180');
      return;
    }

    const newPosition = { lat, lng };
    setPosition(newPosition);
    onCoordinatesChange(newPosition);
    setLocationError('');
  };

  const handleClearLocation = () => {
    if (disabled) return;
    setPosition(null);
    setManualLat('');
    setManualLng('');
    onCoordinatesChange(null);
    setLocationError('');
  };

  const mapCenter = position || defaultCenter;

  return (
    <div className={`location-picker ${disabled ? 'disabled' : ''}`}>
      <div className="location-picker-header">
        <h4>📍 Set Service Location on Map</h4>
        <p className="location-help">Click on the map or use the buttons below to set your service location</p>
      </div>

      {locationError && (
        <div className="location-error">
          {locationError}
        </div>
      )}

      <div className="location-actions">
        <button
          type="button"
          className="use-location-btn"
          onClick={handleUseMyLocation}
          disabled={isLocating || disabled}
        >
          {isLocating ? '📍 Locating...' : '📍 Use My Current Location'}
        </button>
        
        {position && (
          <button
            type="button"
            className="clear-location-btn"
            onClick={handleClearLocation}
            disabled={disabled}
          >
            ✕ Clear
          </button>
        )}
      </div>

      <div className="map-container">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={position ? 15 : 12}
          className="location-picker-map"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {!disabled && <MapClickHandler onLocationSelect={handleLocationSelect} />}
          {position && <MapRecenter center={position} />}
          
          {position && (
            <Marker position={[position.lat, position.lng]} icon={markerIcon} />
          )}
        </MapContainer>
      </div>

      <div className="manual-coordinates">
        <div className="coordinates-inputs">
          <div className="coord-input-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="number"
              id="latitude"
              step="any"
              placeholder="e.g., 23.8103"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="coord-input-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="number"
              id="longitude"
              step="any"
              placeholder="e.g., 90.4125"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              disabled={disabled}
            />
          </div>
          <button
            type="button"
            className="apply-coords-btn"
            onClick={handleManualInput}
            disabled={disabled || !manualLat || !manualLng}
          >
            Apply
          </button>
        </div>
      </div>

      {position && (
        <div className="selected-coordinates">
          <span className="coord-label">Selected:</span>
          <span className="coord-value">
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
