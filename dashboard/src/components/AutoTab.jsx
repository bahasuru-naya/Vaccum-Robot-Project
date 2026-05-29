import React from 'react';
import { useMqtt } from '../MqttContext';
import classNames from 'classnames';
import { Play, Square, Map } from 'lucide-react';

const AutoTab = () => {
  const { autoState, robotMode, sendMode } = useMqtt();

  const isAuto = robotMode === 'AUTO';
  const MAX_ROWS = 10;

  // Pretty format state strings
  const formatStateName = (state) => {
    return state.replace(/_/g, ' ');
  };

  return (
    <div className="tab-content auto-tab">
      
      <div className="glass-panel auto-controls">
        <div className="control-header">
          <h2>Autonomous Cleaning</h2>
          <div className={classNames("mode-indicator", { active: isAuto })}>
            {isAuto ? 'ACTIVE' : 'STANDBY'}
          </div>
        </div>

        <div className="auto-actions">
          {!isAuto ? (
            <button className="btn-start" onClick={() => sendMode('AUTO')}>
              <Play fill="currentColor" size={20} /> Start Cleaning
            </button>
          ) : (
            <button className="btn-stop" onClick={() => sendMode('MANUAL')}>
              <Square fill="currentColor" size={20} /> Pause & Return Manual
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel progress-panel">
        <div className="widget-header">
          <Map className="icon" />
          <span>Cleaning Progress</span>
        </div>

        <div className="state-badge">
          {formatStateName(autoState.state)}
        </div>

        <div className="coverage-bar-container">
          <div className="coverage-labels">
            <span>Overall Coverage</span>
            <span>{autoState.coverage_pct}%</span>
          </div>
          <div className="coverage-track">
            <div 
              className="coverage-fill" 
              style={{ width: `${autoState.coverage_pct}%` }}
            ></div>
          </div>
        </div>

        <div className="telemetry-grid">
          <div className="tel-card">
            <span className="label">Current Row</span>
            <span className="value">{autoState.row} / {MAX_ROWS}</span>
          </div>
          <div className="tel-card">
            <span className="label">Heading (Yaw)</span>
            <span className="value">{autoState.yaw}°</span>
          </div>
          <div className="tel-card">
            <span className="label">L-Wheel Dist</span>
            <span className="value">{autoState.left_dist_cm} cm</span>
          </div>
          <div className="tel-card">
            <span className="label">R-Wheel Dist</span>
            <span className="value">{autoState.right_dist_cm} cm</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AutoTab;
