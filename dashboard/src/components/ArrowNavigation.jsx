import React, { useState, useEffect } from 'react';
import { useMqtt } from '../MqttContext';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const ArrowNavigation = () => {
  const { setMovement, robotMode } = useMqtt();
  const [pressedKey, setPressedKey] = useState(null);

  const isManual = robotMode === 'MANUAL';

  const handleCommand = (cmd) => {
    if (!isManual) return;
    setMovement(cmd);
    setPressedKey(cmd);
  };

  const handleRelease = () => {
    if (!isManual) return;
    setMovement('STOP');
    setPressedKey(null);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isManual) return;
      
      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') {
        e.preventDefault();
        handleCommand('FORWARD');
      } else if (key === 'arrowdown' || key === 's') {
        e.preventDefault();
        handleCommand('BACKWARD');
      } else if (key === 'arrowleft' || key === 'a') {
        e.preventDefault();
        handleCommand('LEFT');
      } else if (key === 'arrowright' || key === 'd') {
        e.preventDefault();
        handleCommand('RIGHT');
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 's', 'a', 'd'].includes(key)) {
        e.preventDefault();
        handleRelease();
      }
    };

    if (isManual) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isManual, pressedKey]);

  return (
    <div className="module arrow-nav-module">
      <div className="module-header" style={{ marginBottom: '12px' }}>
        <ArrowUp className="module-icon" size={14} />
        <span>Navigation</span>
      </div>

      <div className={`arrow-nav-grid ${!isManual ? 'disabled' : ''}`}>
        {/* Up */}
        <button
          className={`arrow-btn up ${pressedKey === 'FORWARD' ? 'active' : ''}`}
          onMouseDown={() => handleCommand('FORWARD')}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={() => handleCommand('FORWARD')}
          onTouchEnd={handleRelease}
          disabled={!isManual}
          title="↑ W"
        >
          <ArrowUp size={20} />
        </button>

        {/* Left */}
        <button
          className={`arrow-btn left ${pressedKey === 'LEFT' ? 'active' : ''}`}
          onMouseDown={() => handleCommand('LEFT')}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={() => handleCommand('LEFT')}
          onTouchEnd={handleRelease}
          disabled={!isManual}
          title="← A"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Down */}
        <button
          className={`arrow-btn down ${pressedKey === 'BACKWARD' ? 'active' : ''}`}
          onMouseDown={() => handleCommand('BACKWARD')}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={() => handleCommand('BACKWARD')}
          onTouchEnd={handleRelease}
          disabled={!isManual}
          title="↓ S"
        >
          <ArrowDown size={20} />
        </button>

        {/* Right */}
        <button
          className={`arrow-btn right ${pressedKey === 'RIGHT' ? 'active' : ''}`}
          onMouseDown={() => handleCommand('RIGHT')}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={() => handleCommand('RIGHT')}
          onTouchEnd={handleRelease}
          disabled={!isManual}
          title="→ D"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="arrow-nav-info">
        {isManual ? (
          <span className="nav-hint">Use ↑ ↓ ← → or W A S D</span>
        ) : (
          <span className="nav-hint" style={{ color: 'var(--warning)' }}>AUTO mode active</span>
        )}
      </div>
    </div>
  );
};

export default ArrowNavigation;
