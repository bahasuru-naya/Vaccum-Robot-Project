import React from 'react';
import { useMqtt } from '../MqttContext';
import { Wifi, WifiOff, Zap, Thermometer, Activity } from 'lucide-react';

const TopStatusBar = () => {
  const { isConnected, mqttConnected, battery, robotMode, sendMode } = useMqtt();

  const modes = [
    { id: 'MANUAL', label: 'MANUAL' },
    { id: 'AUTO', label: 'AUTO' },
    { id: 'MAPPING', label: 'MAPPING', disabled: true },
  ];

  return (
    <div className="top-bar">
      {/* Left — Brand + Connection */}
      <div className="top-bar-left">
        <span className="robot-name">VacBot XR-01</span>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
          {isConnected ? (
            <Wifi size={12} style={{ color: 'var(--success)' }} />
          ) : (
            <WifiOff size={12} style={{ color: 'var(--danger)' }} />
          )}
          <span style={{ color: isConnected ? 'var(--success)' : 'var(--danger)' }}>
            {isConnected ? 'ONLINE' : mqttConnected ? 'ROBOT OFFLINE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* Center — Mode Tabs */}
      <div className="top-bar-center">
        {modes.map((m) => (
          <button
            key={m.id}
            className={`mode-tab ${robotMode === m.id ? (m.id === 'AUTO' ? 'active-auto' : 'active') : ''}`}
            onClick={() => sendMode(m.id)}
            disabled={m.disabled}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Right — Quick Metrics */}
      <div className="top-bar-right">
        <div className="top-metric">
          <span className="top-metric-value" style={{
            color: battery.percent < 25 ? 'var(--danger)' : battery.percent < 50 ? 'var(--warning)' : 'var(--success)'
          }}>
            <Zap size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {battery.percent}%
          </span>
          <span className="top-metric-label">Battery</span>
        </div>
        <div className="top-metric">
          <span className="top-metric-value">{battery.voltage}V</span>
          <span className="top-metric-label">Voltage</span>
        </div>
        <div className="top-metric">
          <span className="top-metric-value">
            <Thermometer size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 32°C
          </span>
          <span className="top-metric-label">CPU</span>
        </div>
        <div className="top-metric">
          <span className="top-metric-value">
            <Activity size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 24ms
          </span>
          <span className="top-metric-label">Ping</span>
        </div>
      </div>
    </div>
  );
};

export default TopStatusBar;
