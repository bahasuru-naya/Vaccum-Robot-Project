import React, { useRef, useState, useEffect } from 'react';
import { useMqtt } from '../MqttContext';
import classNames from 'classnames';
import { ShieldAlert } from 'lucide-react';

const DriveTab = () => {
  const { setMovement, distance, robotMode, sendMode } = useMqtt();
  const padRef = useRef(null);
  
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [activeCmd, setActiveCmd] = useState('STOP');
  const [isDragging, setIsDragging] = useState(false);

  const isManual = robotMode === 'MANUAL';

  const handleStart = (e) => {
    if (!isManual) return;
    setIsDragging(true);
    handleMove(e);
  };

  const handleMove = (e) => {
    if (!isDragging || !isManual || !padRef.current) return;
    
    // Support both mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = padRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    
    const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
    
    if (distanceToCenter > maxRadius) {
      const ratio = maxRadius / distanceToCenter;
      dx *= ratio;
      dy *= ratio;
    }
    
    setKnobPos({ x: dx, y: dy });

    // Determine direction command if moved far enough from center
    const threshold = maxRadius * 0.3;
    let newCmd = 'STOP';

    if (distanceToCenter > threshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        newCmd = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        newCmd = dy > 0 ? 'BACKWARD' : 'FORWARD';
      }
    }

    if (newCmd !== activeCmd) {
      setActiveCmd(newCmd);
      setMovement(newCmd);
      if(navigator.vibrate && newCmd !== 'STOP') navigator.vibrate(20);
    }
  };

  const handleEnd = () => {
    if (!isManual) return;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    if (activeCmd !== 'STOP') {
      setActiveCmd('STOP');
      setMovement('STOP');
    }
  };

  // Add mouse listeners to window for dragging outside
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, activeCmd, isManual]);

  return (
    <div className="tab-content drive-tab">
      
      <div className="drive-header glass-panel">
        <div className="mode-switcher">
          <button 
            className={classNames("btn-mode", { active: isManual })}
            onClick={() => sendMode('MANUAL')}
          >
            MANUAL
          </button>
          <button 
            className={classNames("btn-mode auto", { active: !isManual })}
            onClick={() => sendMode('AUTO')}
          >
            AUTO
          </button>
        </div>
        
        {distance.obstacle && (
          <div className="obstacle-banner">
            <ShieldAlert size={18} />
            Obstacle Detected - Path Blocked
          </div>
        )}
      </div>

      <div className="joystick-container">
        <div 
          className={classNames("joystick-base", { disabled: !isManual })}
          ref={padRef}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        >
          <div className="joystick-ring"></div>
          <div className="joystick-crosshairs horizontal"></div>
          <div className="joystick-crosshairs vertical"></div>
          
          <div 
            className="joystick-knob"
            style={{ 
              transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px))`,
              transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div className="knob-inner"></div>
          </div>
        </div>
      </div>

      <div className="drive-status glass-panel">
        <div className="cmd-badge">
          {activeCmd}
        </div>
      </div>

    </div>
  );
};

export default DriveTab;
