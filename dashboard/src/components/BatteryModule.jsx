import React from 'react';
import { useMqtt } from '../MqttContext';
import { Battery, AlertTriangle, Zap } from 'lucide-react';

const BatteryModule = () => {
  const { battery } = useMqtt();

  const getBarClass = () => {
    if (battery.percent >= 50) return 'good';
    if (battery.percent >= 25) return 'fair';
    return 'low';
  };

  return (
    <div className="module">
      <div className="module-header">
        <Battery className="module-icon" size={14} />
        <span>Power System</span>
      </div>

      <div className="battery-bar-container">
        <div className="battery-bar-row">
          <div className="battery-bar-track">
            <div
              className={`battery-bar-fill ${getBarClass()}`}
              style={{ width: `${Math.max(battery.percent, 2)}%` }}
            />
          </div>
          <span className="battery-percent" style={{
            color: battery.percent < 25 ? 'var(--danger)' : battery.percent < 50 ? 'var(--warning)' : 'var(--success)'
          }}>
            {battery.percent}%
          </span>
        </div>

        <div className="battery-details">
          <div className="battery-detail-chip">
            <span className="chip-label">Voltage</span>
            <span className="chip-value">
              <Zap size={10} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--cyan)' }} /> {battery.voltage}V
            </span>
          </div>
          <div className="battery-detail-chip">
            <span className="chip-label">Health</span>
            <span className="chip-value" style={{
              color: battery.health === 'GOOD' || battery.health === 'EXCELLENT'
                ? 'var(--success)'
                : battery.health === 'FAIR'
                  ? 'var(--warning)'
                  : 'var(--danger)'
            }}>
              {battery.health}
            </span>
          </div>
          <div className="battery-detail-chip">
            <span className="chip-label">Est.</span>
            <span className="chip-value">{Math.round(battery.percent * 0.5)}m</span>
          </div>
        </div>

        {battery.alert && (
          <div className="battery-alert-bar">
            <AlertTriangle size={12} />
            CRITICAL — RETURN TO DOCK
          </div>
        )}
      </div>
    </div>
  );
};

export default BatteryModule;
