import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Droplets,
  Wind,
  Eye,
  Sun,
  Sunrise,
  Sunset,
  Gauge,
  Umbrella,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Activity,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';
import { fetchWeatherData, fetchAirQuality, searchCity, reverseGeocode } from '../services/weatherApi';
import { useUnit } from '../context/UnitContext';
import {
  getWeatherCondition,
  processHourlyForecast,
  formatTimeWithMinutes,
  formatDayName,
  getAqiCategory,
  getSmartPlannerAdvice,
} from '../utils/weatherUtils';
import WeatherAtmosphere from '../components/WeatherAtmosphere';

export default function WeatherPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatTemp, formatWind, unit } = useUnit();

  const queryParam = searchParams.get('q');
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');

  const [verifiedLocation, setVerifiedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVerifiedWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      let lat = null;
      let lon = null;
      let locationMeta = null;

      if (queryParam && queryParam.trim()) {
        const results = await searchCity(queryParam.trim());
        if (!results || results.length === 0) {
          throw new Error(`Location "${queryParam}" could not be verified.`);
        }
        const topResult = results[0];
        lat = topResult.latitude;
        lon = topResult.longitude;
        locationMeta = {
          name: topResult.name,
          country: topResult.country,
          region: topResult.region,
        };
      } else if (latParam && lonParam) {
        lat = parseFloat(latParam);
        lon = parseFloat(lonParam);

        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          throw new Error('Invalid or corrupted location coordinates in URL.');
        }

        const revMeta = await reverseGeocode(lat, lon);
        locationMeta = {
          name: revMeta.name,
          country: revMeta.country,
          region: revMeta.region,
        };
      } else {
        throw new Error('No location specified in URL. Please search for a city.');
      }

      const [wData, aqData] = await Promise.all([
        fetchWeatherData(lat, lon),
        fetchAirQuality(lat, lon),
      ]);

      setVerifiedLocation(locationMeta);
      setWeatherData(wData);
      setAirQualityData(aqData);
    } catch (err) {
      setError(err.message || 'Failed to verify and load weather data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerifiedWeather();
  }, [queryParam, latParam, lonParam]);

  let activeTheme = 'clear-day';
  if (weatherData && weatherData.current) {
    const currentCode = weatherData.current.weather_code;
    const currentIsoTime = weatherData.current.time;
    const currentHour = parseInt(currentIsoTime.split('T')[1].split(':')[0], 10);
    const isDay = currentHour >= 6 && currentHour < 20;
    const condition = getWeatherCondition(currentCode, isDay);
    activeTheme = condition.theme;
  }

  useEffect(() => {
    if (activeTheme) {
      document.body.setAttribute('data-theme', activeTheme);
    }
    return () => {
      document.body.removeAttribute('data-theme');
    };
  }, [activeTheme]);

  if (loading) {
    return (
      <div className="weather-page-container">
        <div className="loading-state">
          <RefreshCw className="spin-anim loading-spinner" size={36} />
          <p className="loading-text">Verifying location and fetching weather data...</p>
        </div>
      </div>
    );
  }

  if (error || !weatherData || !verifiedLocation) {
    return (
      <div className="weather-page-container">
        <div className="error-state-card">
          <AlertTriangle size={40} className="error-state-icon" />
          <h2 className="error-state-title">Location Verification Failed</h2>
          <p className="error-state-message">{error || 'Weather data unavailable.'}</p>
          <div className="error-state-actions">
            <button onClick={loadVerifiedWeather} className="btn-retry">
              <RefreshCw size={16} /> Retry
            </button>
            <Link to="/" className="btn-back-home">
              <ArrowLeft size={16} /> Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const current = weatherData.current;
  const daily = weatherData.daily;
  const hourly = weatherData.hourly;

  const currentCode = current.weather_code;
  const currentIsoTime = current.time;
  const currentHour = parseInt(currentIsoTime.split('T')[1].split(':')[0], 10);
  const isDay = currentHour >= 6 && currentHour < 20;
  const condition = getWeatherCondition(currentCode, isDay);
  const WeatherIconComponent = condition.icon;

  const hourlyList = processHourlyForecast(hourly, current.time, weatherData.timezone);

  const currentHumidity = current.relative_humidity_2m;
  const currentWindSpeed = current.wind_speed_10m;
  const currentPressure = current.surface_pressure;

  const currentHourlyIndex = hourlyList.length > 0 ? hourlyList[0].index : 0;
  const rawVisibility = hourly.visibility ? hourly.visibility[currentHourlyIndex] : 10000;
  const visibilityKm = (rawVisibility / 1000).toFixed(1);
  const visibilityMiles = (visibilityKm * 0.621371).toFixed(1);
  const formattedVisibility = unit === 'F' ? `${visibilityMiles} mi` : `${visibilityKm} km`;

  const currentUv = daily.uv_index_max ? Math.round(daily.uv_index_max[0]) : 0;

  const sunriseIso = daily.sunrise ? daily.sunrise[0] : '';
  const sunsetIso = daily.sunset ? daily.sunset[0] : '';
  const formattedSunrise = formatTimeWithMinutes(sunriseIso);
  const formattedSunset = formatTimeWithMinutes(sunsetIso);

  // Air Quality Data
  const usAqi = airQualityData && airQualityData.current ? airQualityData.current.us_aqi : null;
  const aqiInfo = usAqi !== null ? getAqiCategory(usAqi) : null;
  const pm2_5 = airQualityData && airQualityData.current ? airQualityData.current.pm2_5 : null;
  const pm10 = airQualityData && airQualityData.current ? airQualityData.current.pm10 : null;
  const no2 = airQualityData && airQualityData.current ? airQualityData.current.nitrogen_dioxide : null;
  const o3 = airQualityData && airQualityData.current ? airQualityData.current.ozone : null;

  // Smart Outdoor Insights
  const maxPrecipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
  const plannerAdvice = getSmartPlannerAdvice(
    current.temperature_2m,
    currentUv,
    maxPrecipProb,
    currentWindSpeed
  );

  return (
    <div className={`weather-page-container theme-${activeTheme}`}>
      <WeatherAtmosphere theme={activeTheme} />

      <div className="nav-back-row">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Search Another City
        </Link>
        <span className="timezone-badge">
          Verified Location ({weatherData.timezone})
        </span>
      </div>

      <div className="weather-grid">
        <div className="weather-column-main">
          {/* Current Weather Section */}
          <section className="current-weather-section">
            <div className="location-meta">
              <h1 className="location-title">{verifiedLocation.name}</h1>
              {verifiedLocation.country && (
                <p className="location-subtitle">
                  {verifiedLocation.region && verifiedLocation.region !== verifiedLocation.country
                    ? `${verifiedLocation.region}, `
                    : ''}
                  {verifiedLocation.country}
                </p>
              )}
            </div>

            <div className="current-weather-body">
              <div className="temp-badge-group">
                <span className="big-temp-value">{formatTemp(current.temperature_2m)}</span>
                <div className="condition-meta">
                  <div className="condition-text-row">
                    <WeatherIconComponent size={28} className="condition-icon" />
                    <span className="condition-label">{condition.label}</span>
                  </div>
                  <span className="feels-like-text">
                    Feels like {formatTemp(current.apparent_temperature)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Smart Outdoor Insights */}
          {plannerAdvice.length > 0 && (
            <section className="planner-section">
              <div className="planner-header">
                <Sparkles size={18} className="metric-icon" />
                <h2 className="section-title" style={{ margin: 0 }}>Smart Outdoor Insights</h2>
              </div>

              <div className="planner-grid">
                {plannerAdvice.map((item, idx) => (
                  <div key={idx} className="planner-card">
                    <span className="planner-card-emoji">{item.icon}</span>
                    <div className="planner-card-content">
                      <span className="planner-card-title">{item.title}</span>
                      <p className="planner-card-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hourly Forecast Section */}
          <section className="hourly-forecast-section">
            <h2 className="section-title">Hourly Forecast</h2>
            <div className="hourly-scroll-container">
              {hourlyList.map((item, idx) => {
                const ItemIcon = getWeatherCondition(item.weatherCode, item.isDay).icon;
                return (
                  <div key={idx} className={`hourly-card ${idx === 0 ? 'now-card' : ''}`}>
                    <span className="hourly-time">{item.timeLabel}</span>
                    <ItemIcon size={22} className="hourly-icon" />
                    <span className="hourly-temp">{formatTemp(item.tempC)}</span>
                    <div className="hourly-precip">
                      <Umbrella size={12} className="precip-icon" />
                      <span>{item.precipitationProb}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7-Day Forecast Section */}
          <section className="daily-forecast-section">
            <h2 className="section-title">7-Day Forecast</h2>
            <div className="daily-table">
              {daily.time.slice(0, 7).map((dateStr, idx) => {
                const dayCode = daily.weather_code[idx];
                const dayCondition = getWeatherCondition(dayCode, true);
                const DayIcon = dayCondition.icon;
                const maxTemp = daily.temperature_2m_max[idx];
                const minTemp = daily.temperature_2m_min[idx];
                const precipProb = daily.precipitation_probability_max
                  ? daily.precipitation_probability_max[idx]
                  : 0;

                return (
                  <div key={dateStr} className="daily-row">
                    <div className="daily-day-col">
                      <span className="daily-day-name">{formatDayName(dateStr, idx)}</span>
                    </div>
                    <div className="daily-condition-col">
                      <DayIcon size={20} className="daily-icon" />
                      <span className="daily-condition-text">{dayCondition.label}</span>
                    </div>
                    <div className="daily-precip-col">
                      {precipProb > 0 ? (
                        <>
                          <Umbrella size={12} />
                          <span>{precipProb}%</span>
                        </>
                      ) : (
                        <span className="precip-none">--</span>
                      )}
                    </div>
                    <div className="daily-temp-col">
                      <span className="temp-max">{formatTemp(maxTemp)}</span>
                      <span className="temp-divider">/</span>
                      <span className="temp-min">{formatTemp(minTemp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="weather-column-side">
          {/* Air Quality Index Panel */}
          {aqiInfo && (
            <section className="aqi-panel">
              <div className="aqi-header">
                <Activity size={18} className="metric-icon" />
                <h2 className="section-title" style={{ margin: 0 }}>Air Quality Index</h2>
              </div>

              <div className="aqi-main-row">
                <div className="aqi-score-box">
                  <span className="aqi-score-number" style={{ color: aqiInfo.color }}>
                    {aqiInfo.val}
                  </span>
                  <span className="aqi-score-label">US AQI</span>
                </div>
                <div className="aqi-status-box">
                  <span className="aqi-badge" style={{ backgroundColor: `${aqiInfo.color}20`, color: aqiInfo.color, borderColor: `${aqiInfo.color}40` }}>
                    {aqiInfo.level}
                  </span>
                </div>
              </div>

              <div className="aqi-bar-wrapper">
                <div className="aqi-bar-gradient">
                  <div
                    className="aqi-bar-pointer"
                    style={{ left: `${aqiInfo.percent}%`, backgroundColor: aqiInfo.color }}
                  />
                </div>
              </div>

              <div className="pollutants-grid">
                <div className="pollutant-item">
                  <span className="pollutant-name">PM2.5</span>
                  <span className="pollutant-value">{pm2_5 ? Math.round(pm2_5) : '--'} µg/m³</span>
                </div>
                <div className="pollutant-item">
                  <span className="pollutant-name">PM10</span>
                  <span className="pollutant-value">{pm10 ? Math.round(pm10) : '--'} µg/m³</span>
                </div>
                <div className="pollutant-item">
                  <span className="pollutant-name">NO₂</span>
                  <span className="pollutant-value">{no2 ? Math.round(no2) : '--'} µg/m³</span>
                </div>
                <div className="pollutant-item">
                  <span className="pollutant-name">O₃</span>
                  <span className="pollutant-value">{o3 ? Math.round(o3) : '--'} µg/m³</span>
                </div>
              </div>

              <div className="aqi-advice-box">
                <HeartHandshake size={16} className="aqi-advice-icon" style={{ color: aqiInfo.color }} />
                <p className="aqi-advice-text">{aqiInfo.advice}</p>
              </div>
            </section>
          )}

          {/* Weather Details Panel */}
          <section className="details-panel">
            <h2 className="section-title">Weather Details</h2>

            <div className="metrics-list">
              <div className="metric-row">
                <div className="metric-header">
                  <Droplets size={18} className="metric-icon" />
                  <span className="metric-label">Humidity</span>
                </div>
                <span className="metric-value">{Math.round(currentHumidity)}%</span>
              </div>

              <div className="metric-row">
                <div className="metric-header">
                  <Wind size={18} className="metric-icon" />
                  <span className="metric-label">Wind Speed</span>
                </div>
                <span className="metric-value">{formatWind(currentWindSpeed)}</span>
              </div>

              <div className="metric-row">
                <div className="metric-header">
                  <Eye size={18} className="metric-icon" />
                  <span className="metric-label">Visibility</span>
                </div>
                <span className="metric-value">{formattedVisibility}</span>
              </div>

              <div className="metric-row">
                <div className="metric-header">
                  <Sun size={18} className="metric-icon" />
                  <span className="metric-label">UV Index</span>
                </div>
                <span className="metric-value">{currentUv}</span>
              </div>

              <div className="metric-row">
                <div className="metric-header">
                  <Gauge size={18} className="metric-icon" />
                  <span className="metric-label">Pressure</span>
                </div>
                <span className="metric-value">{Math.round(currentPressure)} hPa</span>
              </div>
            </div>
          </section>

          {/* Sunrise and Sunset Panel */}
          <section className="sun-panel">
            <h2 className="section-title">Sunrise & Sunset</h2>
            <div className="sun-times-container">
              <div className="sun-item">
                <div className="sun-icon-box sunrise-box">
                  <Sunrise size={22} className="sun-icon" />
                </div>
                <div className="sun-meta">
                  <span className="sun-label">Sunrise</span>
                  <span className="sun-time">{formattedSunrise}</span>
                </div>
              </div>

              <div className="sun-divider" />

              <div className="sun-item">
                <div className="sun-icon-box sunset-box">
                  <Sunset size={22} className="sun-icon" />
                </div>
                <div className="sun-meta">
                  <span className="sun-label">Sunset</span>
                  <span className="sun-time">{formattedSunset}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
