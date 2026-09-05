import React, { createContext, useContext, useState, useEffect } from 'react';

const UnitContext = createContext();

export function UnitProvider({ children }) {
  const [unit, setUnit] = useState(() => {
    try {
      const saved = localStorage.getItem('vaatavaran_unit');
      return saved === 'F' ? 'F' : 'C';
    } catch {
      return 'C';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vaatavaran_unit', unit);
    } catch (e) {
      console.warn('Unable to save unit preference to localStorage', e);
    }
  }, [unit]);

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  /**
   * Convert Celsius number to current unit and format
   * @param {number} celsius 
   * @returns {number} Temperature in target unit
   */
  const convertTemp = (celsius) => {
    if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
    if (unit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  /**
   * Format temperature with degree symbol
   * @param {number} celsius 
   * @returns {string} e.g. "24°C" or "75°F"
   */
  const formatTemp = (celsius) => {
    const val = convertTemp(celsius);
    if (val === '--') return '--°';
    return `${val}°`;
  };

  /**
   * Format wind speed based on unit
   * @param {number} kmh 
   * @returns {string} e.g. "12 km/h" or "7 mph"
   */
  const formatWind = (kmh) => {
    if (kmh === undefined || kmh === null || isNaN(kmh)) return '--';
    if (unit === 'F') {
      const mph = Math.round(kmh * 0.621371);
      return `${mph} mph`;
    }
    return `${Math.round(kmh)} km/h`;
  };

  return (
    <UnitContext.Provider
      value={{
        unit,
        setUnit,
        toggleUnit,
        convertTemp,
        formatTemp,
        formatWind,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
}
