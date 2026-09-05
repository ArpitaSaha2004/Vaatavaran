import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CloudSun, AlertCircle, ArrowRight } from 'lucide-react';
import { searchCity } from '../services/weatherApi';

const POPULAR_CITIES = [
  { name: 'Jaipur', country: 'India' },
  { name: 'Kolkata', country: 'India' },
  { name: 'London', country: 'United Kingdom' },
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Zurich', country: 'Switzerland' },
  { name: 'New York', country: 'United States' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [cityInput, setCityInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a city name to search.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const results = await searchCity(trimmed);
      if (results && results.length > 0) {
        navigate(`/weather?q=${encodeURIComponent(trimmed)}`);
      } else {
        setErrorMessage(`No location found matching "${trimmed}".`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while searching for the city.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch(cityInput);
  };

  const handleUseLocation = () => {
    setErrorMessage('');
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
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
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location permission was denied. Please search for a city above.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location information is currently unavailable.');
            break;
          case error.TIMEOUT:
            setErrorMessage('Location request timed out. Please try again.');
            break;
          default:
            setErrorMessage('An error occurred while detecting your location.');
            break;
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCityClick = (city) => {
    navigate(`/weather?q=${encodeURIComponent(city.name)}`);
  };

  return (
    <main className="home-container">
      <section className="hero-section">
        <div className="hero-brand">
          <div className="hero-logo-box">
            <CloudSun size={48} className="hero-logo-icon" />
          </div>
          <h1 className="hero-title">Vaatavaran</h1>
          <p className="hero-subtitle">
            Where are you heading? Check the weather.
          </p>
        </div>

        <div className="search-card">
          <form onSubmit={handleFormSubmit} className="main-search-form">
            <div className="search-input-wrapper">
              <Search className="search-input-icon" size={20} />
              <input
                type="text"
                className="main-search-input"
                placeholder="Enter city name (e.g. Kolkata, London, Tokyo)"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                disabled={loading || geoLoading}
              />
              <button
                type="submit"
                className="btn-primary-search"
                disabled={loading || geoLoading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          <div className="location-action-row">
            <button
              type="button"
              onClick={handleUseLocation}
              className="btn-use-location"
              disabled={loading || geoLoading}
            >
              <MapPin size={18} className={geoLoading ? 'spin-anim' : ''} />
              <span>{geoLoading ? 'Detecting Location...' : 'Use my location'}</span>
            </button>
          </div>

          {errorMessage && (
            <div className="error-alert">
              <AlertCircle size={18} className="error-alert-icon" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <section className="popular-cities-section">
          <h2 className="popular-title">Popular Cities</h2>
          <div className="popular-cities-grid">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                className="city-chip"
                onClick={() => handleCityClick(city)}
              >
                <div className="city-chip-info">
                  <span className="city-chip-name">{city.name}</span>
                  <span className="city-chip-region">{city.country}</span>
                </div>
                <ArrowRight size={16} className="city-chip-arrow" />
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
