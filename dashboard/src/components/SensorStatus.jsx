import React from 'react';
import { useMqtt } from '../MqttContext';
import { Radar } from 'lucide-react';

const SensorStatus = () => {
  const { sonars, navigation } = useMqtt();

  const safeDirections = navigation?.safe_directions?.split(',') || [];

  const getSensorState = (name, value) => {
    // Determine status based on distance thresholds
    if (name === 'FRONT') {
      if (value < 15) return { status: 'BLOCKED', cls: 'danger' };
      if (value < 50) return { status: 'CAUTION', cls: 'caution' };
      return { status: 'CLEAR', cls: 'clear' };
    }
    // Side sensors
    if (value < 7) return { status: 'BLOCKED', cls: 'danger' };
    if (value < 30) return { status: 'CAUTION', cls: 'caution' };
    return { status: 'CLEAR', cls: 'clear' };
  };

  const sensors = [
    { name: 'FRONT', value: sonars.front, dir: 'FORWARD' },
    { name: 'LEFT', value: sonars.left, dir: 'LEFT' },
    { name: 'RIGHT', value: sonars.right, dir: 'RIGHT' },
  ];

  return (
    <div className="module">
      <div className="module-header">
        <Radar className="module-icon" size={14} />
        <span>Sensor Status</span>
      </div>

      <div className="sensor-grid">
        {sensors.map((s) => {
          const state = getSensorState(s.name, s.value);
          return (
            <div className="sensor-row" key={s.name}>
              <span className="sensor-name">{s.name}</span>
              <div className="sensor-right">
                <span className="sensor-dist">
                  {s.value < 999 ? `${s.value}cm` : '—'}
                </span>
                <span className={`sensor-dot ${state.cls}`}></span>
                <span className={`sensor-label ${state.cls}`}>
                  {state.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SensorStatus;
