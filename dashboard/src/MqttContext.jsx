import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';

const MqttContext = createContext(null);

export const useMqtt = () => useContext(MqttContext);

const CONFIG = {
  host: '0808028e417c4ff2957842f563dafe7b.s1.eu.hivemq.cloud',
  port: 8884,
  username: 'VaccumRobot',
  password: 'Vaccum@12345',
  topicPrefix: 'vacbot'
};

export const MqttProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // App State matching firmware payloads
  const [robotMode, setRobotMode] = useState('MANUAL');
  const [suction, setSuction] = useState(0);
  
  const [battery, setBattery] = useState({
    voltage: '0.0',
    percent: 0,
    health: 'UNKNOWN',
    alert: false
  });
  
  const [distance, setDistance] = useState({
    cm: 999,
    obstacle: false
  });
  
  const [autoState, setAutoState] = useState({
    state: 'IDLE',
    row: 0,
    yaw: 0,
    left_dist_cm: 0,
    right_dist_cm: 0,
    coverage_pct: 0
  });

  const connect = () => {
    if (client) return;

    const clientId = `vacbot-app-${Math.random().toString(16).substring(2, 8)}`;
    const mqttUrl = `wss://${CONFIG.host}:${CONFIG.port}/mqtt`;
    
    console.log("Connecting to MQTT: ", mqttUrl);
    
    const mqttClient = mqtt.connect(mqttUrl, {
      username: CONFIG.username,
      password: CONFIG.password,
      clientId: clientId,
      reconnectPeriod: 5000,
    });

    mqttClient.on('connect', () => {
      console.log("MQTT Connected");
      setIsConnected(true);
      
      const prefix = CONFIG.topicPrefix;
      mqttClient.subscribe(`${prefix}/status/battery`);
      mqttClient.subscribe(`${prefix}/status/distance`);
      mqttClient.subscribe(`${prefix}/status/mode`);
      mqttClient.subscribe(`${prefix}/status/auto`);
      mqttClient.subscribe(`${prefix}/status/online`);
    });

    mqttClient.on('message', (topic, payload) => {
      const msg = payload.toString();
      const prefix = CONFIG.topicPrefix;

      try {
        if (topic === `${prefix}/status/battery`) {
          setBattery(JSON.parse(msg));
        } else if (topic === `${prefix}/status/distance`) {
          setDistance(JSON.parse(msg));
        } else if (topic === `${prefix}/status/mode`) {
          setRobotMode(msg);
        } else if (topic === `${prefix}/status/auto`) {
          setAutoState(JSON.parse(msg));
        } else if (topic === `${prefix}/status/online`) {
          if(msg === 'offline') setIsConnected(false);
        }
      } catch (e) {
        console.error("Failed parsing MQTT msg:", msg, e);
      }
    });

    mqttClient.on('error', (err) => {
      console.error("MQTT Error:", err);
    });

    mqttClient.on('close', () => {
      setIsConnected(false);
    });

    setClient(mqttClient);
  };

  const publishCommand = (topicSuffix, payload) => {
    if (client && isConnected) {
      client.publish(`${CONFIG.topicPrefix}/${topicSuffix}`, String(payload));
    }
  };

  const setMovement = (cmd) => publishCommand('cmd/movement', cmd);
  const sendSuction = (val) => {
    setSuction(val);
    publishCommand('cmd/suction', val);
  };
  const sendMode = (mode) => {
    // Optimistic update
    setRobotMode(mode);
    publishCommand('cmd/mode', mode);
  };

  // Start connection immediately
  useEffect(() => {
    connect();
    return () => {
      if (client) client.end();
    };
  }, []);

  return (
    <MqttContext.Provider value={{
      isConnected,
      battery,
      distance,
      autoState,
      robotMode,
      suction,
      setMovement,
      sendSuction,
      sendMode
    }}>
      {children}
    </MqttContext.Provider>
  );
};
