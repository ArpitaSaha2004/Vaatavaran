/**
 * Weather utilities and data formatters for Vaatavaran
 */

import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
} from 'lucide-react';

/**
 * Maps WMO Weather Interpretation Codes to human readable descriptions, icons & themes
 * @param {number} code 
 * @param {boolean} isDay 
 * @returns {Object} { label, icon, theme }
 */
export function getWeatherCondition(code, isDay = true) {
  switch (code) {
    case 0:
      return {
        label: 'Clear Sky',
        icon: isDay ? Sun : Moon,
        theme: isDay ? 'clear-day' : 'clear-night',
      };
    case 1:
      return {
        label: 'Mainly Clear',
        icon: isDay ? CloudSun : CloudMoon,
        theme: isDay ? 'clear-day' : 'clear-night',
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        icon: isDay ? CloudSun : CloudMoon,
        theme: 'cloudy',
      };
    case 3:
      return {
        label: 'Overcast',
        icon: Cloud,
        theme: 'cloudy',
      };
    case 45:
    case 48:
      return {
        label: 'Foggy',
        icon: CloudFog,
        theme: 'fog',
      };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return {
        label: 'Drizzle',
        icon: CloudDrizzle,
        theme: 'rain',
      };
    case 61:
      return {
        label: 'Slight Rain',
        icon: CloudRain,
        theme: 'rain',
      };
    case 63:
      return {
        label: 'Moderate Rain',
        icon: CloudRain,
        theme: 'rain',
      };
    case 65:
    case 66:
    case 67:
      return {
        label: 'Heavy Rain',
        icon: CloudRain,
        theme: 'rain',
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: 'Snowfall',
        icon: CloudSnow,
        theme: 'snow',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        icon: CloudRain,
        theme: 'rain',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        icon: CloudSnow,
        theme: 'snow',
      };
    case 95:
    case 96:
    case 99:
      return {
        label: 'Thunderstorm',
        icon: CloudLightning,
        theme: 'thunderstorm',
      };
    default:
      return {
        label: 'Clear',
        icon: isDay ? Sun : Moon,
        theme: isDay ? 'clear-day' : 'clear-night',
      };
  }
}

/**
 * Format ISO string to 12-hour local time format (e.g., "11 AM", "12 PM", "1 PM")
 * @param {string} isoString e.g. "2026-09-05T14:00"
 * @returns {string} Formatted 12-hour time string
 */
export function format12HourTime(isoString) {
  if (!isoString) return '';
  const timePart = isoString.split('T')[1];
  if (!timePart) return '';
  const hour = parseInt(timePart.split(':')[0], 10);
  
  if (isNaN(hour)) return '';
  
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour} ${ampm}`;
}

/**
 * Format ISO datetime string to 12-hour clock format with minutes (e.g. "6:15 AM")
 * @param {string} isoString 
 * @returns {string}
 */
export function formatTimeWithMinutes(isoString) {
  if (!isoString) return '--:--';
  const timePart = isoString.split('T')[1];
  if (!timePart) return '--:--';
  const [hStr, mStr] = timePart.split(':');
  const hour = parseInt(hStr, 10);
  const minutes = mStr || '00';
  
  if (isNaN(hour)) return '--:--';
  
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

/**
 * Format date to short day of week (e.g. "Today", "Mon", "Tue")
 * @param {string} dateString e.g. "2026-09-05"
 * @param {number} index 0 for today
 * @returns {string}
 */
export function formatDayName(dateString, index) {
  if (index === 0) return 'Today';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius 
 * @returns {number}
 */
export function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

/**
 * Categorize US AQI value into health levels, colors, and advice
 * @param {number} aqi 
 * @returns {Object}
 */
export function getAqiCategory(aqi) {
  const val = Math.round(aqi || 0);
  const percent = Math.min(100, Math.round((val / 300) * 100));

  if (val <= 50) {
    return {
      val,
      level: 'Good',
      color: '#22c55e',
      advice: 'Air quality is satisfactory and poses little to no risk. Ideal for outdoor activities.',
      percent,
    };
  }
  if (val <= 100) {
    return {
      val,
      level: 'Moderate',
      color: '#eab308',
      advice: 'Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion.',
      percent,
    };
  }
  if (val <= 150) {
    return {
      val,
      level: 'Unhealthy for Sensitive Groups',
      color: '#f97316',
      advice: 'Members of sensitive groups (asthma, elderly) should reduce outdoor exertion.',
      percent,
    };
  }
  if (val <= 200) {
    return {
      val,
      level: 'Unhealthy',
      color: '#ef4444',
      advice: 'Everyone may experience health effects. Wear a protective mask outdoors and close windows.',
      percent,
    };
  }
  if (val <= 300) {
    return {
      val,
      level: 'Very Unhealthy',
      color: '#a855f7',
      advice: 'Health alert: Limit all outdoor physical exertion and use air purifiers indoors.',
      percent,
    };
  }
  return {
    val,
    level: 'Hazardous',
    color: '#881337',
    advice: 'Health warning of emergency conditions. Stay indoors and avoid all outdoor physical activity.',
    percent: 100,
  };
}

/**
 * Smart Travel Planner Helper
 * Computes rain alerts, sun protection & wind advisories based on live metrics
 * @param {number} tempC 
 * @param {number} uvIndex 
 * @param {number} maxPrecipProb 
 * @param {number} windKmh 
 * @returns {Array<Object>} List of recommendation cards
 */
export function getSmartPlannerAdvice(tempC, uvIndex, maxPrecipProb, windKmh) {
  const adviceList = [];

  // Rain / Umbrella advice
  if (maxPrecipProb >= 40) {
    adviceList.push({
      icon: '☔',
      title: 'Rain Alert',
      desc: `High chance of rain (${maxPrecipProb}%). Remember to pack an umbrella!`,
    });
  } else {
    adviceList.push({
      icon: '🌤️',
      title: 'Dry Skies',
      desc: 'Low chance of rain. No umbrella needed today.',
    });
  }

  // Sun Protection
  if (uvIndex >= 6) {
    adviceList.push({
      icon: '🧴',
      title: 'Sun Protection',
      desc: `High UV Index (${uvIndex}). Apply SPF 30+ sunscreen outdoors.`,
    });
  } else if (uvIndex >= 3) {
    adviceList.push({
      icon: '🕶️',
      title: 'Moderate UV',
      desc: `Moderate UV (${uvIndex}). Sunglasses & cap recommended for midday sun.`,
    });
  }

  // Wind advice
  if (windKmh >= 25) {
    adviceList.push({
      icon: '🌬️',
      title: 'Windy Conditions',
      desc: `Breezy winds (${Math.round(windKmh)} km/h). Secure loose outdoor items.`,
    });
  }

  return adviceList;
}

/**
 * Compute current local hour ISO string ("YYYY-MM-DDTHH:00") for target timezone
 * @param {string} timezone e.g. "Asia/Kolkata" or "Europe/London"
 * @returns {string|null}
 */
function getCurrentLocalHourISO(timezone) {
  if (!timezone) return null;
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const year = parts.find((p) => p.type === 'year').value;
    const month = parts.find((p) => p.type === 'month').value;
    const day = parts.find((p) => p.type === 'day').value;
    let hour = parts.find((p) => p.type === 'hour').value;
    if (hour === '24') hour = '00';
    return `${year}-${month}-${day}T${hour.padStart(2, '0')}:00`;
  } catch (e) {
    return null;
  }
}

/**
 * Process hourly forecast array for Current hour ("Now") + next 7 hours
 * @param {Object} hourlyData Open-Meteo hourly object
 * @param {string} currentTime ISO string of current time from API
 * @param {string} timezone Target location timezone e.g. "Asia/Kolkata"
 * @returns {Array} List of 8 hourly items
 */
export function processHourlyForecast(hourlyData, currentTime, timezone) {
  if (!hourlyData || !hourlyData.time || !hourlyData.time.length) {
    return [];
  }

  let startIndex = -1;

  const targetLocalHourISO = getCurrentLocalHourISO(timezone);
  if (targetLocalHourISO) {
    const foundIdx = hourlyData.time.findIndex((t) => t === targetLocalHourISO);
    if (foundIdx !== -1) {
      startIndex = foundIdx;
    }
  }

  if (startIndex === -1 && currentTime) {
    const currentHourStr = currentTime.slice(0, 13);
    const foundIdx = hourlyData.time.findIndex((t) => t.startsWith(currentHourStr));
    if (foundIdx !== -1) {
      startIndex = foundIdx;
    }
  }

  if (startIndex === -1) {
    startIndex = 0;
  }

  const result = [];
  const totalCount = Math.min(8, hourlyData.time.length - startIndex);

  for (let i = 0; i < totalCount; i++) {
    const idx = startIndex + i;
    const isFirst = i === 0;
    const isoTime = hourlyData.time[idx];
    const timeLabel = isFirst ? 'Now' : format12HourTime(isoTime);
    
    const hour = parseInt(isoTime.split('T')[1].split(':')[0], 10);
    const isDay = hour >= 6 && hour < 20;

    result.push({
      index: idx,
      isoTime,
      timeLabel,
      tempC: Math.round(hourlyData.temperature_2m[idx]),
      weatherCode: hourlyData.weather_code[idx],
      isDay,
      precipitationProb: hourlyData.precipitation_probability ? hourlyData.precipitation_probability[idx] ?? 0 : 0,
      visibility: hourlyData.visibility ? (hourlyData.visibility[idx] / 1000).toFixed(1) : '10',
      uvIndex: hourlyData.uv_index ? hourlyData.uv_index[idx] : 0,
    });
  }

  return result;
}
