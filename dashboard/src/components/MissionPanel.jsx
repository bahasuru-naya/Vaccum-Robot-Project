import React from 'react';
import { useMqtt } from '../MqttContext';
import { Activity, Clock, Zap, BarChart3 } from 'lucide-react';

const MissionPanel = () => {
  const { autoState, battery } = useMqtt();

  const coverage = autoState?.coverage_pct || 0;
  const row = autoState?.row || 0;
  const maxRows = 12;
  const elapsedSec = Math.floor((Date.now() - (window.sessionStart || Date.now())) / 1000);
  const elapsedMin = Math.floor(elapsedSec / 60);
  const eta = Math.max(0, Math.ceil((maxRows - row) * (elapsedMin / Math.max(1, row))));

  const state = autoState?.state || 'IDLE';
  const stateColor = 
    state === 'MOVING_FORWARD' ? 'var(--success)' :
    state === 'OBSTACLE_AVOID' ? 'var(--warning)' :
    state === 'COMPLETE' ? 'var(--success)' :
    'var(--text-secondary)';

  return (
    <div className="module mission-panel">
      <div className="module-header">
        <Activity className="module-icon" size={14} />
        <span>Mission Control</span>
      </div>

      {/* Top: Status + Coverage */}
      <div className="mission-top">
        <div className="mission-status">
          <div className="status-label">Status</div>
          <div className="status-value" style={{ color: stateColor }}>
            {state}
          </div>
        </div>

        <div className="mission-progress">
          <div className="progress-ring">
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,255,255,0.1)" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--cyan)"
                strokeWidth="6"
                strokeDasharray={`${coverage * 2.51} 251`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.3s ease' }}
              />
            </svg>
            <div className="progress-text">
              <span className="progress-value">{Math.round(coverage)}%</span>
              <span className="progress-label">Coverage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Grid Stats */}
      <div className="mission-grid">
        <div className="mission-stat">
          <BarChart3 size={12} />
          <span className="stat-label">Rows</span>
          <span className="stat-value">{row}/{maxRows}</span>
        </div>

        <div className="mission-stat">
          <Clock size={12} />
          <span className="stat-label">Time</span>
          <span className="stat-value">{elapsedMin}m</span>
        </div>

        <div className="mission-stat">
          <Zap size={12} />
          <span className="stat-label">Battery</span>
          <span className="stat-value" style={{
            color: battery?.percent < 25 ? 'var(--danger)' : 
                   battery?.percent < 50 ? 'var(--warning)' : 
                   'var(--success)'
          }}>
            {battery?.percent}%
          </span>
        </div>

        <div className="mission-stat">
          <Clock size={12} />
          <span className="stat-label">ETA</span>
          <span className="stat-value">{eta}m</span>
        </div>
      </div>

      {/* Bottom: Row Progress */}
      <div className="row-progress">
        <div className="row-label">Row Progress</div>
        <div className="row-bar">
          <div className="row-fill" style={{ width: `${(row / maxRows) * 100}%` }} />
        </div>
        <div className="row-numbers">{row} / {maxRows}</div>
      </div>

      {/* Footer: Efficiency */}
      <div className="mission-footer">
        <span className="efficiency-label">Efficiency</span>
        <span className="efficiency-value">
          {coverage > 0 && elapsedMin > 0 
            ? `${(coverage / elapsedMin).toFixed(1)}%/min`
            : '—'}
        </span>
      </div>
    </div>
  );
};

export default MissionPanel;
