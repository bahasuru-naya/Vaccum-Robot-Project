import React, { useRef, useState, useEffect } from 'react';
import { useMqtt } from '../MqttContext';
import { Crosshair } from 'lucide-react';

const JoystickPanel = () => {
  const { setMovement, robotMode } = useMqtt();
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

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = padRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxRadius) {
      const ratio = maxRadius / dist;
      dx *= ratio;
      dy *= ratio;
    }

    setKnobPos({ x: dx, y: dy });

    const threshold = maxRadius * 0.3;
    let newCmd = 'STOP';

    if (dist > threshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        newCmd = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        newCmd = dy > 0 ? 'BACKWARD' : 'FORWARD';
      }
    }

    if (newCmd !== activeCmd) {
      setActiveCmd(newCmd);
      setMovement(newCmd);
      if (navigator.vibrate && newCmd !== 'STOP') navigator.vibrate(20);
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
    <div className="module joystick-module">
      <div className="module-header" style={{ marginBottom: '8px' }}>
        <Crosshair className="module-icon" size={14} />
        <span>Control</span>
      </div>

      <div
        className={`joystick-base ${!isManual ? 'disabled' : ''}`}
        ref={padRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        <div className="joystick-ring" />
        <div className="joystick-crosshair h" />
        <div className="joystick-crosshair v" />
        <div
          className="joystick-knob"
          style={{
            transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px))`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <div className="joystick-knob-inner" />
        </div>
      </div>

      <div className="joystick-cmd">{activeCmd}</div>
    </div>
  );
};

export default JoystickPanel;
