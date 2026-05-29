import React from 'react';
import { useMqtt } from '../MqttContext';
import { Fan } from 'lucide-react';

const VacuumControl = () => {
  const { suction, sendSuction, robotMode } = useMqtt();

  const isAuto = robotMode === 'AUTO';
  const suctionPercent = Math.round((suction / 255) * 100);

  return (
    <div className="module vacuum-control-module">
      <div className="module-header" style={{ marginBottom: '12px' }}>
        <Fan className={`module-icon ${suction > 0 ? 'spinning' : ''}`} size={14} style={{ animation: suction > 0 ? 'spin 2s linear infinite' : 'none' }} />
        <span>Suction</span>
      </div>

      {/* Slider */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Power</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--success)' }}>{suctionPercent}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="255"
          value={suction}
          onChange={(e) => sendSuction(parseInt(e.target.value))}
          disabled={isAuto}
          style={{
            width: '100%',
            height: '6px',
            cursor: isAuto ? 'not-allowed' : 'pointer',
            opacity: isAuto ? 0.5 : 1
          }}
          className="vacuum-slider"
        />
      </div>

      {/* Preset Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
        <button
          onClick={() => sendSuction(160)}
          disabled={isAuto}
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '8px 0',
            borderRadius: '6px',
            border: suction === 160 ? '1.5px solid var(--success)' : '1px solid rgba(0,255,255,0.3)',
            background: suction === 160 ? 'rgba(0,255,255,0.2)' : 'transparent',
            color: suction === 160 ? 'var(--success)' : 'var(--text-secondary)',
            cursor: isAuto ? 'not-allowed' : 'pointer',
            opacity: isAuto ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          ECO
        </button>
        <button
          onClick={() => sendSuction(200)}
          disabled={isAuto}
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '8px 0',
            borderRadius: '6px',
            border: suction === 200 ? '1.5px solid var(--success)' : '1px solid rgba(0,255,255,0.3)',
            background: suction === 200 ? 'rgba(0,255,255,0.2)' : 'transparent',
            color: suction === 200 ? 'var(--success)' : 'var(--text-secondary)',
            cursor: isAuto ? 'not-allowed' : 'pointer',
            opacity: isAuto ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          NORM
        </button>
        <button
          onClick={() => sendSuction(255)}
          disabled={isAuto}
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '8px 0',
            borderRadius: '6px',
            border: suction === 255 ? '1.5px solid var(--success)' : '1px solid rgba(0,255,255,0.3)',
            background: suction === 255 ? 'rgba(0,255,255,0.2)' : 'transparent',
            color: suction === 255 ? 'var(--success)' : 'var(--text-secondary)',
            cursor: isAuto ? 'not-allowed' : 'pointer',
            opacity: isAuto ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          MAX
        </button>
      </div>

      {isAuto && (
        <div style={{ fontSize: '10px', color: 'var(--warning)', marginTop: '8px', textAlign: 'center', padding: '6px', background: 'rgba(255,170,0,0.1)', borderRadius: '4px' }}>
          Auto-controlled
        </div>
      )}
    </div>
  );
};

export default VacuumControl;
