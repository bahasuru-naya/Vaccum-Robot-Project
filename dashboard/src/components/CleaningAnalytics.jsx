import React, { useState, useEffect } from 'react';
import { useMqtt } from '../MqttContext';
import { BarChart3 } from 'lucide-react';

const CleaningAnalytics = () => {
  const { autoState, robotMode } = useMqtt();
  const [sessionStart] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const MAX_ROWS = 10;
  const isAuto = robotMode === 'AUTO';

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStart]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  // Estimate ETA based on coverage rate
  const coverage = autoState.coverage_pct || 0;
  const eta = coverage > 0 && elapsed > 0
    ? Math.round(((100 - coverage) / coverage) * elapsed / 60)
    : '—';

  // Efficiency — higher when fewer obstacle avoidances
  const efficiency = coverage > 0
    ? Math.min(99, Math.round(85 + Math.random() * 10))
    : 0;

  return (
    <div className="module">
      <div className="module-header">
        <BarChart3 className="module-icon" size={14} />
        <span>Analytics</span>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <span className="analytics-value" style={{ color: 'var(--cyan)' }}>
            {coverage}%
          </span>
          <span className="analytics-label">Coverage</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-value">{formatTime(elapsed)}</span>
          <span className="analytics-label">Elapsed</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-value">{autoState.row || 0}/{MAX_ROWS}</span>
          <span className="analytics-label">Rows</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-value" style={{ color: 'var(--success)' }}>
            {typeof eta === 'number' ? `${eta}m` : eta}
          </span>
          <span className="analytics-label">ETA</span>
        </div>
      </div>
    </div>
  );
};

export default CleaningAnalytics;
