import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, BarChart2, Settings, Terminal, Play, BookOpen } from 'lucide-react';
import { useSimulationStore } from './store/useSimulationStore';
import { gql, useSubscription } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import SimulationConfig from './pages/SimulationConfig';
import LiveMonitor from './pages/LiveMonitor';
import Results from './pages/Results';
import CrashCourse from './pages/CrashCourse';
import Explorer from './pages/Explorer';

const WORKER_STATUS_SUBSCRIPTION = gql`
  subscription OnWorkerStatusChange {
    onWorkerStatusChange {
      workerId
      status
      utilization
    }
  }
`;

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
// ... existing sidebar item
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        textDecoration: 'none',
        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
        borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
        backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
        transition: 'all 0.12s ease'
      }}
    >
      <Icon size={18} style={{ marginRight: '12px' }} />
      <span style={{ fontSize: '13px', fontWeight: 500 }}>{label}</span>
    </Link>
  );
};

const WorkerStatus = ({ id, status, util }: { id: string, status: 'online' | 'busy' | 'offline', util: number }) => {
  const colors = {
    online: 'var(--accent-safe)',
    busy: 'var(--accent-primary)',
    offline: 'var(--accent-danger)'
  };
  
  return (
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ 
          width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors[status],
          boxShadow: status === 'busy' ? `0 0 8px ${colors[status]}` : 'none'
        }} />
        <span style={{ fontSize: '11px', fontFamily: '"DM Mono", monospace', color: 'var(--text-secondary)' }}>Worker {id}</span>
      </div>
      <span style={{ fontSize: '11px', fontFamily: '"IBM Plex Mono", monospace', color: 'var(--text-mono)' }}>{util}%</span>
    </div>
  );
};

interface WorkerState {
  workerId: string;
  status: 'online' | 'busy' | 'offline';
  utilization: number;
}

function App() {
  const { isSimulating } = useSimulationStore();
  const [workers, setWorkers] = useState<WorkerState[]>([
    { workerId: "01", status: "offline", utilization: 0 }
  ]);

  const { data } = useSubscription(WORKER_STATUS_SUBSCRIPTION);

  useEffect(() => {
    if (data && data.onWorkerStatusChange) {
      const { workerId, status, utilization } = data.onWorkerStatusChange;
      setWorkers(prev => {
        const existing = prev.find(w => w.workerId === workerId);
        if (existing) {
          return prev.map(w => w.workerId === workerId ? { workerId, status: isSimulating && status === 'online' ? 'busy' : status, utilization: isSimulating ? 95 : utilization } : w);
        }
        return [...prev, { workerId, status: isSimulating && status === 'online' ? 'busy' : status, utilization: isSimulating ? 95 : utilization }];
      });
    }
  }, [data, isSimulating]);

  return (
    <Router>
      <div className="layout-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div style={{ padding: '24px 16px', borderBottom: '1px solid var(--bg-border)', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} color="var(--accent-primary)" />
              Risk Engine
            </h1>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <SidebarItem to="/" icon={Activity} label="Dashboard" />
            <SidebarItem to="/simulate" icon={Play} label="New Simulation" />
            <SidebarItem to="/results/latest" icon={BarChart2} label="Results" />
            <SidebarItem to="/crash-course" icon={BookOpen} label="Crash Course" />
            <SidebarItem to="/explorer" icon={Settings} label="GraphQL Explorer" />
          </div>

          {/* Worker Status Area */}
          <div style={{ padding: '16px 0', borderTop: '1px solid var(--bg-border)' }}>
            <div style={{ padding: '0 16px 8px 16px' }}>
              <span className="text-section-header">Worker Pool</span>
            </div>
            {workers.map(w => (
              <WorkerStatus key={w.workerId} id={w.workerId} status={w.status} util={w.utilization} />
            ))}
            {workers.length === 0 && (
              <div style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                No workers configured
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/simulate" element={<SimulationConfig />} />
            <Route path="/simulate/:id" element={<LiveMonitor />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/crash-course" element={<CrashCourse />} />
            <Route path="/explorer" element={<Explorer />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
