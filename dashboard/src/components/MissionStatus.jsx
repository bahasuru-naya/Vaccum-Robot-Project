import React from 'react';
import { useMqtt } from '../MqttContext';
import { Target } from 'lucide-react';

const MissionStatus = () => {
  const { autoState, robotMode } = useMqtt();

  const isAuto = robotMode === 'AUTO';
  const formatState = (s) => s.replace(/_/g, ' ');

  return (
    <div className="module">
      <div className="mission-header">
        <div className="module-header" style={{ marginBottom: 0 }}>
          <Target className="module-icon" size={14} />
          <span>Mission</span>
        </div>
        <span className={`mission-badge ${isAuto ? 'active' : 'standby'}`}>
          {isAuto ? 'ACTIVE' : 'STANDBY'}
        </span>
      </div>

      <div className="mission-state">
        {formatState(autoState.state)}
      </div>

      <div className="mission-progress-track">
        <div
          className="mission-progress-fill"
          style={{ width: `${autoState.coverage_pct}%` }}
        />
      </div>
      <div className="mission-progress-label">
        <span>Coverage</span>
        <span>{autoState.coverage_pct}%</span>
      </div>
    </div>
  );
};

export default MissionStatus;
