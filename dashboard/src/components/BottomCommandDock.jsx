import React from 'react';
import { useMqtt } from '../MqttContext';
import { Play, Pause, Square, Home, Map, AlertTriangle } from 'lucide-react';

const BottomCommandDock = () => {
  const { sendMode, setMovement, sendSuction, robotMode } = useMqtt();

  const isAuto = robotMode === 'AUTO';

  const handleStart = () => sendMode('AUTO');
  const handlePause = () => sendMode('MANUAL');
  const handleStop = () => {
    sendMode('MANUAL');
    setMovement('STOP');
  };
  const handleEmergency = () => {
    sendMode('MANUAL');
    setMovement('STOP');
    sendSuction(0);
  };

  return (
    <div className="bottom-dock">
      <button
        className={`dock-btn ${isAuto ? '' : 'active-start'}`}
        onClick={handleStart}
        disabled={isAuto}
      >
        <Play size={16} />
        <span className="btn-label">START</span>
      </button>

      <button
        className={`dock-btn ${isAuto ? '' : 'disabled'}`}
        onClick={handlePause}
      >
        <Pause size={16} />
        <span className="btn-label">PAUSE</span>
      </button>

      <button className="dock-btn" onClick={handleStop}>
        <Square size={16} />
        <span className="btn-label">STOP</span>
      </button>

      <button className="dock-btn hide-mobile disabled" onClick={() => {}}>
        <Home size={16} />
        <span className="btn-label">HOME</span>
      </button>

      <button className="dock-btn hide-mobile disabled" onClick={() => {}}>
        <Map size={16} />
        <span className="btn-label">MAP</span>
      </button>

      <button className="dock-btn emergency" onClick={handleEmergency}>
        <AlertTriangle size={16} />
        <span className="btn-label">SOS</span>
      </button>
    </div>
  );
};

export default BottomCommandDock;
