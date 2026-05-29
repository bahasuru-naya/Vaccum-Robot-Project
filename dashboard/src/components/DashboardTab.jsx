import React from 'react';
import { useMqtt } from '../MqttContext';
import { BatteryMedium, Fan, AlertTriangle } from 'lucide-react';
import classNames from 'classnames';

const DashboardTab = () => {
  const { battery, distance, suction, sendSuction, robotMode } = useMqtt();

  const isAuto = robotMode === 'AUTO';
  
  // Convert 0-255 to percentage
  const suctionPercent = Math.round((suction / 255) * 100);

  return (
    <div className="tab-content dashboard-tab">
      
      {/* Battery Gauge Widget */}
      <div className="glass-panel battery-widget">
        <div className="widget-header">
          <BatteryMedium className="icon" />
          <span>Power System</span>
        </div>
        <div className="battery-display">
          <div className="battery-circle">
            <svg viewBox="0 0 100 100">
              <circle className="bg" cx="50" cy="50" r="45" />
              <circle 
                className={classNames("fg", {
                  'critical': battery.percent < 25,
                  'low': battery.percent >= 25 && battery.percent < 50,
                  'good': battery.percent >= 50
                })}
                cx="50" 
                cy="50" 
                r="45" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * battery.percent) / 100} 
              />
            </svg>
            <div className="battery-text">
              <h2>{battery.percent}%</h2>
              <span>{battery.voltage}V</span>
            </div>
          </div>
          <div className="battery-stats">
            <div className="stat-pill">
              <span className="label">Health</span>
              <span className={classNames("value", battery.health.toLowerCase())}>{battery.health}</span>
            </div>
            {battery.alert && (
              <div className="alert-pill">
                <AlertTriangle size={14} /> Critical Low
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Status Widget */}
      <div className="glass-panel quick-status">
        <div className="status-item">
          <span className="label">Distance</span>
          <span className="value">{distance.cm} cm</span>
        </div>
        <div className="status-item">
          <span className="label">Obstacle</span>
          <span className={classNames("value", { alert: distance.obstacle })}>
            {distance.obstacle ? 'DETECTED' : 'CLEAR'}
          </span>
        </div>
      </div>

      {/* Suction Control Widget */}
      <div className="glass-panel suction-widget">
        <div className="widget-header">
          <Fan className={classNames("icon", { spinning: suction > 0 })} />
          <span>Vacuum Suction</span>
        </div>
        
        <div className={classNames("suction-controls", { disabled: isAuto })}>
          <div className="slider-container">
            <input 
              type="range" 
              min="0" 
              max="255" 
              value={suction}
              onChange={(e) => sendSuction(parseInt(e.target.value))}
              disabled={isAuto}
              className="suction-slider"
            />
            <div className="slider-value">{suctionPercent}%</div>
          </div>

          <div className="preset-buttons">
            <button 
              className={classNames("preset-btn", { active: suction === 160 })}
              onClick={() => sendSuction(160)}
              disabled={isAuto}
            >
              ECO
            </button>
            <button 
              className={classNames("preset-btn", { active: suction === 200 })}
              onClick={() => sendSuction(200)}
              disabled={isAuto}
            >
              NORM
            </button>
            <button 
              className={classNames("preset-btn", { active: suction === 255 })}
              onClick={() => sendSuction(255)}
              disabled={isAuto}
            >
              MAX
            </button>
          </div>
          
          {isAuto && (
            <div className="auto-warning">
              Suction is controlled automatically in AUTO mode.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardTab;
