import React, { useEffect, useRef } from 'react';
import { useMqtt } from '../MqttContext';
import { Terminal } from 'lucide-react';

const LiveLogs = () => {
  const { logMessages } = useMqtt();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logMessages]);

  const getTagClass = (tag) => {
    if (tag.includes('ERR')) return 'error';
    if (tag.includes('WARN') || tag.includes('⚠')) return 'warn';
    if (tag.includes('CMD') || tag.includes('TX')) return 'cmd';
    return 'info';
  };

  return (
    <div className="module logs-module">
      <div className="module-header" style={{ marginBottom: '6px' }}>
        <Terminal className="module-icon" size={14} />
        <span>Live Log</span>
      </div>

      <div className="logs-scroll" ref={scrollRef}>
        {(!logMessages || logMessages.length === 0) ? (
          <div className="log-entry">
            <span className="log-time">--:--</span>
            <span className="log-tag info">[SYS]</span>
            <span className="log-msg">Waiting for data...</span>
          </div>
        ) : (
          logMessages.map((log, i) => (
            <div className="log-entry" key={i}>
              <span className="log-time">{log.time}</span>
              <span className={`log-tag ${getTagClass(log.tag)}`}>[{log.tag}]</span>
              <span className="log-msg">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveLogs;
