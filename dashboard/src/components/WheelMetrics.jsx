import React from 'react';
import { useMqtt } from '../MqttContext';
import { Gauge } from 'lucide-react';

const WheelMetrics = () => {
  const { autoState } = useMqtt();

  const leftDist = (autoState.left_dist_cm / 100).toFixed(2);
  const rightDist = (autoState.right_dist_cm / 100).toFixed(2);

  return (
    <div className="module">
      <div className="module-header">
        <Gauge className="module-icon" size={14} />
        <span>Wheel Metrics</span>
      </div>

      <div className="wheel-grid">
        <div className="wheel-card">
          <span className="wheel-label">L-Wheel</span>
          <span className="wheel-value">{leftDist}</span>
          <span className="wheel-unit">meters</span>
        </div>
        <div className="wheel-card">
          <span className="wheel-label">R-Wheel</span>
          <span className="wheel-value">{rightDist}</span>
          <span className="wheel-unit">meters</span>
        </div>
        <div className="wheel-card">
          <span className="wheel-label">Heading</span>
          <span className="wheel-value">{autoState.yaw}°</span>
          <span className="wheel-unit">yaw</span>
        </div>
        <div className="wheel-card">
          <span className="wheel-label">Row</span>
          <span className="wheel-value">{autoState.row}</span>
          <span className="wheel-unit">current</span>
        </div>
      </div>
    </div>
  );
};

export default WheelMetrics;
