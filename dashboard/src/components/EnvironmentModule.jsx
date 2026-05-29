import React, { useState, useEffect } from 'react';
import { Thermometer } from 'lucide-react';

const EnvironmentModule = () => {
  const [env, setEnv] = useState({
    temp: 29,
    humidity: 72,
    dust: 'LOW'
  });

  // Gentle random walk for visual interest
  useEffect(() => {
    const interval = setInterval(() => {
      setEnv(prev => {
        const newTemp = Math.max(20, Math.min(40,
          prev.temp + (Math.random() - 0.5) * 0.4
        ));
        const newHumid = Math.max(30, Math.min(90,
          prev.humidity + (Math.random() - 0.5) * 0.8
        ));
        const dustLevels = ['LOW', 'LOW', 'LOW', 'MED', 'MED', 'HIGH'];
        const newDust = Math.random() > 0.95
          ? dustLevels[Math.floor(Math.random() * dustLevels.length)]
          : prev.dust;

        return {
          temp: Math.round(newTemp * 10) / 10,
          humidity: Math.round(newHumid),
          dust: newDust
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getDustColor = (level) => {
    if (level === 'LOW') return 'var(--success)';
    if (level === 'MED') return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="module">
      <div className="module-header">
        <Thermometer className="module-icon" size={14} />
        <span>Environment</span>
      </div>

      <div className="env-grid">
        <div className="env-row">
          <span className="env-label">Temp</span>
          <span className="env-value">{env.temp}°C</span>
        </div>
        <div className="env-row">
          <span className="env-label">Humidity</span>
          <span className="env-value">{env.humidity}%</span>
        </div>
        <div className="env-row">
          <span className="env-label">Dust Level</span>
          <span className="env-value" style={{ color: getDustColor(env.dust) }}>
            {env.dust}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentModule;
