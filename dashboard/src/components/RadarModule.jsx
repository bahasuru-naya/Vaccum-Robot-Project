import React, { useMemo } from 'react';
import { useMqtt } from '../MqttContext';
import { Radar } from 'lucide-react';

const RadarModule = () => {
  const { sonars, navigation, robotMode } = useMqtt();

  const canvasSize = 280;
  const radius = 110;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;

  const front = sonars?.front || 999;
  const left = sonars?.left || 999;
  const right = sonars?.right || 999;
  const safeDirections = navigation?.safe_directions?.split(',') || [];
  const isApproaching = navigation?.approaching || false;

  const getCoord = (distCm, angleDeg) => {
    const maxDist = 150;
    const r = (Math.min(distCm, maxDist) / maxDist) * radius;
    const angle = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.sin(angle),
      y: cy - r * Math.cos(angle),
    };
  };

  const getColor = (distCm) => {
    if (distCm < 30) return '#ff4444';
    if (distCm < 70) return '#ffaa00';
    return '#00ff88';
  };

  const radarSVG = useMemo(() => (
    <svg width={canvasSize} height={canvasSize} viewBox={`0 0 ${canvasSize} ${canvasSize}`} className="radar-svg">
      {/* Background */}
      <circle cx={cx} cy={cy} r={radius + 8} fill="#080c18" stroke="rgba(0,255,255,0.08)" strokeWidth="1" />

      {/* Distance rings */}
      <circle cx={cx} cy={cy} r={(50 / 150) * radius} fill="none" stroke="rgba(0,255,255,0.06)" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={(100 / 150) * radius} fill="none" stroke="rgba(0,255,255,0.06)" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(0,255,255,0.1)" strokeWidth="1" />

      {/* Distance labels */}
      <text x={cx + 4} y={cy - (50 / 150) * radius - 3} className="radar-label-text">50</text>
      <text x={cx + 4} y={cy - (100 / 150) * radius - 3} className="radar-label-text">100</text>
      <text x={cx + 4} y={cy - radius - 5} className="radar-label-text">150cm</text>

      {/* Direction lines */}
      <line x1={cx} y1={cy} x2={cx} y2={cy - radius} stroke="rgba(0,255,255,0.06)" strokeWidth="0.5" />
      <line x1={cx} y1={cy} x2={cx + radius} y2={cy} stroke="rgba(0,255,255,0.06)" strokeWidth="0.5" />
      <line x1={cx} y1={cy} x2={cx - radius} y2={cy} stroke="rgba(0,255,255,0.06)" strokeWidth="0.5" />

      {/* Robot center */}
      <circle cx={cx} cy={cy} r="5" fill="rgba(0,255,255,0.8)" stroke="rgba(0,255,255,0.4)" strokeWidth="2" />

      {/* Direction labels */}
      <text x={cx} y={cy - radius - 12} textAnchor="middle" className="radar-direction-text"
        fill={safeDirections.includes('FORWARD') ? '#00ff88' : '#ff4444'}>
        F
      </text>
      <text x={cx + radius + 12} y={cy + 4} textAnchor="start" className="radar-direction-text"
        fill={safeDirections.includes('LEFT') ? '#00ff88' : '#ff4444'}>
        L
      </text>
      <text x={cx - radius - 12} y={cy + 4} textAnchor="end" className="radar-direction-text"
        fill={safeDirections.includes('RIGHT') ? '#00ff88' : '#ff4444'}>
        R
      </text>

      {/* Obstacle dots */}
      {front < 150 && (
        <circle cx={getCoord(front, 0).x} cy={getCoord(front, 0).y}
          r="4" fill={getColor(front)} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      )}
      {left < 150 && (
        <circle cx={getCoord(left, 90).x} cy={getCoord(left, 90).y}
          r="4" fill={getColor(left)} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      )}
      {right < 150 && (
        <circle cx={getCoord(right, -90).x} cy={getCoord(right, -90).y}
          r="4" fill={getColor(right)} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      )}

      {/* Approaching pulse */}
      {isApproaching && robotMode === 'AUTO' && (
        <circle cx={cx} cy={cy} r="15" fill="none" stroke="#ffaa00"
          strokeWidth="2" opacity="0.7" className="radar-approaching-pulse" />
      )}
    </svg>
  ), [front, left, right, safeDirections, isApproaching, robotMode]);

  return (
    <div className="module radar-module">
      <div className="module-header">
        <Radar className="module-icon" size={14} />
        <span>Obstacle Radar</span>
      </div>

      <div className="radar-svg-container">
        {radarSVG}
        <div className="radar-sweep-line" />
      </div>
    </div>
  );
};

export default RadarModule;
