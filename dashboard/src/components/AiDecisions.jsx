import React from 'react';
import { useMqtt } from '../MqttContext';
import { Brain } from 'lucide-react';

const AiDecisions = () => {
  const { sonars, navigation, battery, autoState } = useMqtt();

  const front = sonars?.front || 999;
  const left = sonars?.left || 999;
  const right = sonars?.right || 999;
  const safeDirections = navigation?.safe_directions?.split(',') || [];
  const isApproaching = navigation?.approaching || false;

  const decisions = [];

  // Path optimization
  if (autoState.state === 'MOVING_FORWARD' || autoState.state === 'MANUAL_ACTIVE') {
    decisions.push({ icon: '✓', text: 'Path optimized', cls: 'good' });
  } else if (autoState.state === 'TURNING') {
    decisions.push({ icon: '↻', text: 'Recalculating route', cls: 'warn' });
  } else if (autoState.state === 'OBSTACLE_AVOID') {
    decisions.push({ icon: '⚠', text: 'Avoidance maneuver', cls: 'warn' });
  } else {
    decisions.push({ icon: '○', text: 'Awaiting mission', cls: '' });
  }

  // Obstacle density
  const nearObstacles = [front, left, right].filter(d => d < 50).length;
  if (nearObstacles === 0) {
    decisions.push({ icon: '✓', text: 'Low obstacle density', cls: 'good' });
  } else if (nearObstacles === 1) {
    decisions.push({ icon: '⚠', text: 'Obstacle detected nearby', cls: 'warn' });
  } else {
    decisions.push({ icon: '✗', text: 'High obstacle density', cls: 'bad' });
  }

  // Battery assessment
  if (battery.percent >= 50) {
    decisions.push({ icon: '✓', text: 'Battery sufficient', cls: 'good' });
  } else if (battery.percent >= 25) {
    decisions.push({ icon: '⚠', text: 'Battery moderate', cls: 'warn' });
  } else {
    decisions.push({ icon: '✗', text: 'Battery critical — dock soon', cls: 'bad' });
  }

  // Approaching obstacle
  if (isApproaching) {
    decisions.push({ icon: '⚠', text: 'Obstacle approaching', cls: 'warn' });
  }

  // Path blocked check
  if (safeDirections.length === 0) {
    decisions.push({ icon: '✗', text: 'All paths blocked', cls: 'bad' });
  } else if (safeDirections.length < 3) {
    decisions.push({ icon: '⚠', text: `${safeDirections.length}/3 paths clear`, cls: 'warn' });
  } else {
    decisions.push({ icon: '✓', text: 'All paths clear', cls: 'good' });
  }

  // Coverage
  if (autoState.coverage_pct >= 80) {
    decisions.push({ icon: '✓', text: 'Near completion', cls: 'good' });
  }

  return (
    <div className="module">
      <div className="module-header">
        <Brain className="module-icon" size={14} style={{ color: 'var(--purple)' }} />
        <span>AI Analysis</span>
      </div>

      <div className="ai-list">
        {decisions.map((d, i) => (
          <div className="ai-item" key={i}>
            <span className="ai-icon">{d.icon}</span>
            <span className={`ai-text ${d.cls}`}>{d.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiDecisions;
