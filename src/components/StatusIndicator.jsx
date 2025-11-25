import { useState, useEffect } from 'react';
import { checkLMStudioConnection } from '../services/lmStudioService';

const StatusIndicator = ({ onConnectionChange }) => {
  const [status, setStatus] = useState({
    connected: false,
    checking: true,
    models: [],
    error: null,
  });

  const checkConnection = async () => {
    setStatus((prev) => ({ ...prev, checking: true }));
    const result = await checkLMStudioConnection();
    setStatus({
      connected: result.connected,
      checking: false,
      models: result.models || [],
      error: result.error || null,
    });
    onConnectionChange?.(result.connected);
  };

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={checkConnection}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface hover:bg-slate-700 transition-colors text-sm"
        title={status.error || 'Click to refresh connection status'}
      >
        <span className="text-slate-400">LM Studio:</span>
        {status.checking ? (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-yellow-500">Checking...</span>
          </span>
        ) : status.connected ? (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-success">Connected</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-500">Disconnected</span>
          </span>
        )}
      </button>

      {!status.connected && !status.checking && (
        <a
          href="https://lmstudio.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Get LM Studio
        </a>
      )}
    </div>
  );
};

export default StatusIndicator;
