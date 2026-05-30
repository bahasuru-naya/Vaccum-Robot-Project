import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMqtt } from '../MqttContext';

const SlamMap = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const { autoState, sonars, distance, robotMode } = useMqtt();

  // Internal state for tracking
  const posHistoryRef = useRef([{ x: 0, y: 0 }]);
  const obstaclesRef = useRef([]);
  const prevEncoderRef = useRef({ left: 0, right: 0 });
  const robotPosRef = useRef({ x: 0, y: 0, heading: 0 });
  const sweepAngleRef = useRef(0);
  const sessionStartRef = useRef(Date.now());
  const [dimensions, setDimensions] = useState({ w: 600, h: 400 });

  // Constants
  const WHEEL_BASE_CM = 15; // approximate wheel base
  const SCALE = 2.5; // pixels per cm
  const MAX_HISTORY = 500;
  const MAX_OBSTACLES = 200;

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ w: Math.floor(width), h: Math.floor(height) });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Update robot position from encoder data (dead reckoning)
  useEffect(() => {
    const leftCm = autoState.left_dist_cm || 0;
    const rightCm = autoState.right_dist_cm || 0;
    const prevLeft = prevEncoderRef.current.left;
    const prevRight = prevEncoderRef.current.right;

    const dLeft = leftCm - prevLeft;
    const dRight = rightCm - prevRight;

    if (Math.abs(dLeft) > 0.01 || Math.abs(dRight) > 0.01) {
      const dCenter = (dLeft + dRight) / 2;
      const heading = (autoState.yaw || 0) * (Math.PI / 180);

      const robot = robotPosRef.current;
      robot.x += dCenter * Math.sin(heading);
      robot.y -= dCenter * Math.cos(heading);
      robot.heading = heading;

      // Add to path history
      const history = posHistoryRef.current;
      const last = history[history.length - 1];
      const dx = robot.x - last.x;
      const dy = robot.y - last.y;
      if (Math.sqrt(dx * dx + dy * dy) > 1) { // min 1cm between points
        history.push({ x: robot.x, y: robot.y });
        if (history.length > MAX_HISTORY) history.shift();
      }
    }

    prevEncoderRef.current = { left: leftCm, right: rightCm };
  }, [autoState.left_dist_cm, autoState.right_dist_cm, autoState.yaw]);

  // Plot obstacles from sonar data
  useEffect(() => {
    const robot = robotPosRef.current;
    const heading = robot.heading;
    const obstacles = obstaclesRef.current;

    const addObstacle = (dist, angleOffset) => {
      if (dist < 150 && dist > 0) {
        const angle = heading + angleOffset;
        const ox = robot.x + dist * Math.sin(angle);
        const oy = robot.y - dist * Math.cos(angle);
        obstacles.push({ x: ox, y: oy, dist, time: Date.now() });
        if (obstacles.length > MAX_OBSTACLES) obstacles.shift();
      }
    };

    const front = sonars?.front || distance?.cm || 999;
    const left = sonars?.left || 999;
    const right = sonars?.right || 999;

    if (front < 150) addObstacle(front, 0);
    if (left < 150) addObstacle(left, -Math.PI / 2);
    if (right < 150) addObstacle(right, Math.PI / 2);
  }, [sonars, distance]);

  // Canvas rendering loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { w, h } = dimensions;
    const dpr = window.devicePixelRatio;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    const centerX = w / 2;
    const centerY = h / 2;
    const robot = robotPosRef.current;

    // ── Background ──
    ctx.fillStyle = '#080c18';
    ctx.fillRect(0, 0, w, h);

    // ── Grid ──
    const gridSpacing = 30;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
    ctx.lineWidth = 0.5;

    const offsetX = (centerX - robot.x * SCALE) % gridSpacing;
    const offsetY = (centerY - robot.y * SCALE) % gridSpacing;

    for (let x = offsetX; x < w; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = offsetY; y < h; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // World-to-screen transform
    const toScreen = (wx, wy) => ({
      sx: centerX + (wx - robot.x) * SCALE,
      sy: centerY + (wy - robot.y) * SCALE
    });

    // ── Distance Rings ──
    const ringDistances = [50, 100, 150]; // cm
    ctx.setLineDash([4, 4]);
    ringDistances.forEach((d, i) => {
      const r = d * SCALE;
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.08 - i * 0.02})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.font = '9px Rajdhani';
      ctx.fillText(`${d}cm`, centerX + r + 4, centerY - 4);
    });
    ctx.setLineDash([]);

    // ── Cleaned Zone (path fill) ──
    const history = posHistoryRef.current;
    if (history.length > 2) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.lineWidth = 12; // ~robot width
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      const first = toScreen(history[0].x, history[0].y);
      ctx.moveTo(first.sx, first.sy);
      for (let i = 1; i < history.length; i++) {
        const p = toScreen(history[i].x, history[i].y);
        ctx.lineTo(p.sx, p.sy);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Path line
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(first.sx, first.sy);
      for (let i = 1; i < history.length; i++) {
        const p = toScreen(history[i].x, history[i].y);
        ctx.lineTo(p.sx, p.sy);
      }
      ctx.stroke();
    }

    // ── Obstacles ──
    const obstacles = obstaclesRef.current;
    const now = Date.now();
    obstacles.forEach((ob) => {
      const age = (now - ob.time) / 1000;
      const alpha = Math.max(0.1, 1 - age / 30);
      const p = toScreen(ob.x, ob.y);

      // Only draw if on screen
      if (p.sx > -10 && p.sx < w + 10 && p.sy > -10 && p.sy < h + 10) {
        const color = ob.dist < 30 ? '255, 68, 68' : ob.dist < 70 ? '255, 170, 0' : '255, 100, 100';
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.shadowColor = `rgba(${color}, ${alpha * 0.5})`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // ── Sweep Line ──
    sweepAngleRef.current += 0.015;
    const sweepLen = 120;
    const sweepAngle = sweepAngleRef.current;
    const gradient = ctx.createLinearGradient(
      centerX, centerY,
      centerX + sweepLen * Math.cos(sweepAngle),
      centerY + sweepLen * Math.sin(sweepAngle)
    );
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + sweepLen * Math.cos(sweepAngle),
      centerY + sweepLen * Math.sin(sweepAngle)
    );
    ctx.stroke();

    // ── Robot Sprite (Triangle) ──
    const heading = robot.heading;
    const size = 10;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(heading);

    // Glow
    ctx.shadowColor = 'rgba(0, 255, 255, 0.6)';
    ctx.shadowBlur = 12;

    // Triangle
    ctx.fillStyle = 'rgba(0, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.5);
    ctx.lineTo(-size, size);
    ctx.lineTo(size, size);
    ctx.closePath();
    ctx.fill();

    // Center dot
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // ── Heading Arrow ──
    const arrowLen = 25;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + arrowLen * Math.sin(heading),
      centerY - arrowLen * Math.cos(heading)
    );
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Border Frame ──
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    // Corner brackets
    const bracketSize = 20;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(0, bracketSize); ctx.lineTo(0, 0); ctx.lineTo(bracketSize, 0);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - bracketSize, 0); ctx.lineTo(w, 0); ctx.lineTo(w, bracketSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(0, h - bracketSize); ctx.lineTo(0, h); ctx.lineTo(bracketSize, h);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - bracketSize, h); ctx.lineTo(w, h); ctx.lineTo(w, h - bracketSize);
    ctx.stroke();

    // ── HUD Text ──
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.font = '10px Rajdhani';
    ctx.fillText('LIVE SLAM', 8, 16);
    ctx.fillText(`HDG ${autoState.yaw || 0}°`, w - 60, 16);

    animRef.current = requestAnimationFrame(render);
  }, [dimensions, autoState]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [render]);

  // Calculate session time
  const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 60000);

  return (
    <div className="module slam-map-container" ref={containerRef}>
      <canvas ref={canvasRef} className="slam-map-canvas" />
      <div className="slam-map-overlay">
        <div className="slam-stat">
          <span className="slam-stat-value">{autoState.coverage_pct || 0}%</span>
          <span className="slam-stat-label">Coverage</span>
        </div>
        <div className="slam-stat">
          <span className="slam-stat-value">{elapsed}m</span>
          <span className="slam-stat-label">Elapsed</span>
        </div>
        <div className="slam-stat">
          <span className="slam-stat-value">{autoState.row || 0}/10</span>
          <span className="slam-stat-label">Rows</span>
        </div>
      </div>
    </div>
  );
};

export default SlamMap;
