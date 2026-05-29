import React from 'react';
import { useMqtt } from '../MqttContext';
import { Fan } from 'lucide-react';

const VacuumPower = () => {
  const { suction, sendSuction, robotMode } = useMqtt();

  const isAuto = robotMode === 'AUTO';
  const suctionPercent = Math.round((suction / 255) * 100);

  return (
    <div className="module">
      <div className="module-header">
        <Fan className={`module-icon fan-icon ${suction > 0 ? 'spinning' : ''}`} size={14} />
        <span>Vacuum Power</span>
      </div>

      <div className={`vacuum-slider-container ${isAuto ? 'vacuum-disabled' : ''}`}>
        <div className="vacuum-slider-row">
          <input
            type="range"
            min="0"
            max="255"
            value={suction}
            onChange={(e) => sendSuction(parseInt(e.target.value))}
            disabled={isAuto}
            className="vacuum-slider"
          />
          <span className="vacuum-percent">{suctionPercent}%</span>
        </div>

        <div className="vacuum-presets">
          <button
            className={`preset-btn ${suction === 160 ? 'active' : ''}`}
            onClick={() => sendSuction(160)}
            disabled={isAuto}
          >
            ECO
          </button>
          <button
            className={`preset-btn ${suction === 200 ? 'active' : ''}`}
            onClick={() => sendSuction(200)}
            disabled={isAuto}
          >
            NORM
          </button>
          <button
            className={`preset-btn ${suction === 255 ? 'active' : ''}`}
            onClick={() => sendSuction(255)}
            disabled={isAuto}
          >
            MAX
          </button>
        </div>

        {isAuto && (
          <div className="vacuum-auto-msg">
            Vacuum auto-controlled in AUTO mode
          </div>
        )}
      </div>
    </div>
  );
};

export default VacuumPower;
