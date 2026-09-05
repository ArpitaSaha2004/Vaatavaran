/**
 * Open-Meteo Weather API, Geocoding & Air Quality Service for Vaatavaran
 */

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

/**
 * Search cities by name using Open-Meteo Geocoding API
 * @param {string} cityName 
 * @returns {Promise<Array>} List of city matches
 */
export async function searchCity(cityName) {
  if (!cityName || !cityName.trim()) {
    throw new Error('Please enter a city name.');
  }

  try {
    const response = await fetch(
      `${GEOCODING_BASE_URL}?name=${encodeURIComponent(cityName.trim())}&count=8&language=en&format=json`
    );

    if (!response.ok) {
      throw new Error('Geocoding service unavailable.');
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error(`No results found for "${cityName}". Please check the spelling.`);
    }

    return data.results.map((item) => ({
      id: `${item.latitude}-${item.longitude}-${item.name}`,
      name: item.name,
      country: item.country || '',
      region: item.admin1 || item.country || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto',
    }));
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
}

/**
 * Reverse geocode latitude and longitude to get location name
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Location metadata
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const response = await fetch(
      `${REVERSE_GEOCODE_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    if (response.ok) {
      const data = await response.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const country = data.countryName || '';
      return {
        name: city,
        country: country,
        region: data.principalSubdivision || country,
        latitude,
        longitude,
      };
    }
  } catch (err) {
    console.warn('Reverse geocode failed, using fallback:', err);
  }

  return {
    name: 'Your Location',
    country: '',
    region: '',
    latitude,
    longitude,
  };
}

/**
 * Fetch full weather data from Open-Meteo API
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Weather payload
 */
export async function fetchWeatherData(latitude, longitude) {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'weather_code',
        'surface_pressure',
        'wind_speed_10m',
      ].join(','),
      hourly: [
        'temperature_2m',
        'weather_code',
        'precipitation_probability',
        'visibility',
        'uv_index',
        'relative_humidity_2m',
        'wind_speed_10m',
        'surface_pressure',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
        'precipitation_probability_max',
        'uv_index_max',
      ].join(','),
      timezone: 'auto',
      forecast_days: '8',
    });

    const response = await fetch(`${FORECAST_BASE_URL}?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch weather data from Open-Meteo server.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network failure while loading weather data. Please check your connection.');
    }
    throw error;
  }
}

/**
 * Fetch Air Quality Index (AQI) and pollutant concentrations from Open-Meteo Air Quality API
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Air Quality payload
 */
export async function fetchAirQuality(latitude, longitude) {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        'us_aqi',
        'pm10',
        'pm2_5',
        'nitrogen_dioxide',
        'ozone',
        'sulphur_dioxide',
      ].join(','),
    });

    const response = await fetch(`${AIR_QUALITY_BASE_URL}?${params.toString()}`);

    if (!response.ok) {
      console.warn('Air quality data unavailable for coordinates');
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Failed to fetch Air Quality:', error);
    return null;
  }
}
