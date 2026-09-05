import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CloudSun, Search, MapPin } from 'lucide-react';
import { useUnit } from '../context/UnitContext';
import { searchCity } from '../services/weatherApi';

export default function Header() {
  const navigate = useNavigate();
  const { unit, toggleUnit } = useUnit();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const results = await searchCity(searchQuery.trim());
      if (results && results.length > 0) {
        const query = searchQuery.trim();
        setSearchQuery('');
        // Clean, secure URL query
        navigate(`/weather?q=${encodeURIComponent(query)}`);
      }
    } catch (err) {
      setSearchError(err.message || 'City not found');
      setTimeout(() => setSearchError(''), 4000);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);
        navigate(`/weather?lat=${lat}&lon=${lon}`);
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert('Location permission was denied. Please search for your city manually.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert('Location information is unavailable.');
        } else {
          alert('Failed to get current location.');
        }
      },
      { timeout: 10000 }
    );
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="brand-logo">
          <div className="brand-icon-wrapper">
            <CloudSun className="brand-icon" size={24} />
          </div>
          <span className="brand-name">Vaatavaran</span>
        </Link>

        <div className="header-actions">
          <form onSubmit={handleSearchSubmit} className="header-search-form">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header-search-input"
              disabled={isSearching}
            />
          </form>

          <button
            type="button"
            onClick={handleUseLocation}
            className="btn-location-icon"
            title="Use my current location"
            disabled={geoLoading}
          >
            <MapPin size={18} className={geoLoading ? 'spin-anim' : ''} />
          </button>

          <div className="unit-toggle-group">
            <button
              type="button"
              className={`unit-btn ${unit === 'C' ? 'active' : ''}`}
              onClick={() => unit !== 'C' && toggleUnit()}
            >
              °C
            </button>
            <button
              type="button"
              className={`unit-btn ${unit === 'F' ? 'active' : ''}`}
              onClick={() => unit !== 'F' && toggleUnit()}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      {searchError && (
        <div className="header-error-banner">
          <span>{searchError}</span>
        </div>
      )}
    </header>
  );
}
