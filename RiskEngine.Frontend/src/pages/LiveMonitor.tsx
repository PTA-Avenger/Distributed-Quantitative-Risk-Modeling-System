import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function LiveMonitor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    // Simulate incoming data over 5 seconds
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate(`/results/${id}`), 500); // Auto navigate to results when done
          return 100;
        }
        setLogs(prev => [`[WORKER] Processed ${Math.round(p * 1000)} paths...`, ...prev].slice(0, 50));
        return p + Math.random() * 5;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [id, navigate]);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 500 }}>Live Execution: {id}</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Gathering Monte Carlo Paths</span>
        </div>
        <button className="btn-destructive" onClick={() => navigate('/simulate')}>CANCEL SIMULATION</button>
      </div>

      <div className="panel" style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-section-header">Progress</span>
          <span className="font-mono-data">{Math.min(100, progress).toFixed(1)}%</span>
        </div>
        <div style={{ width: '100%', height: '3px', backgroundColor: 'var(--bg-elevated)' }}>
          <div style={{ 
            height: '100%', 
            width: `${progress}%`, 
            backgroundColor: 'var(--accent-primary)',
            transition: 'width 100ms linear'
          }} />
        </div>
      </div>

      <div className="grid-12" style={{ flex: 1, minHeight: 0 }}>
        {/* Realtime Histogram Mock */}
        <div style={{ gridColumn: 'span 8', minHeight: 0 }}>
          <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 className="text-section-header" style={{ marginBottom: '16px' }}>Live P&L Distribution</h3>
            <div style={{ flex: 1, border: '1px solid var(--bg-border)', display: 'flex', alignItems: 'flex-end', gap: '2px', padding: '16px' }}>
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1,
                  backgroundColor: 'var(--accent-primary)',
                  height: `${Math.min(100, Math.max(5, Math.pow(Math.E, -Math.pow((i-20)/6, 2)) * progress))}px`,
                  transition: 'height 80ms linear'
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Worker Logs */}
        <div style={{ gridColumn: 'span 4', minHeight: 0 }}>
          <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 className="text-section-header" style={{ marginBottom: '16px' }}>gRPC Log Stream</h3>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-base)', padding: '12px', overflowY: 'auto', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-mono)' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '4px', opacity: 1 - (i * 0.05) }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
