import React, { useMemo } from 'react';

export default function WeatherAtmosphere({ theme }) {
  // Generate random positions for rain drops
  const rainDrops = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${0.6 + Math.random() * 0.5}s`,
      delay: `${Math.random() * 2}s`,
      height: `${12 + Math.random() * 20}px`,
      opacity: 0.2 + Math.random() * 0.4,
    }));
  }, [theme]);

  // Generate random positions for snow particles
  const snowFlakes = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 3}s`,
      size: `${4 + Math.random() * 6}px`,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [theme]);

  return (
    <div className="weather-atmosphere-layer" aria-hidden="true">
      {/* Rain Effect */}
      {(theme === 'rain' || theme === 'thunderstorm') && (
        <div className="rain-container">
          {rainDrops.map((drop) => (
            <div
              key={drop.id}
              className="rain-drop"
              style={{
                left: drop.left,
                animationDuration: drop.duration,
                animationDelay: drop.delay,
                height: drop.height,
                opacity: drop.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Thunderstorm Lightning Flash */}
      {theme === 'thunderstorm' && <div className="lightning-flash" />}

      {/* Snow Effect */}
      {theme === 'snow' && (
        <div className="snow-container">
          {snowFlakes.map((flake) => (
            <div
              key={flake.id}
              className="snow-flake"
              style={{
                left: flake.left,
                animationDuration: flake.duration,
                animationDelay: flake.delay,
                width: flake.size,
                height: flake.size,
                opacity: flake.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Cloud Silhouettes */}
      {(theme === 'cloudy' || theme === 'partly-cloudy') && (
        <div className="cloud-container">
          <div className="cloud-shape cloud-1" />
          <div className="cloud-shape cloud-2" />
        </div>
      )}

      {/* Clear Daylight Glow */}
      {theme === 'clear-day' && <div className="sun-glow-bg" />}

      {/* Clear Night Star Ambient */}
      {(theme === 'clear-night' || theme === 'night') && <div className="night-stars-bg" />}
    </div>
  );
}
