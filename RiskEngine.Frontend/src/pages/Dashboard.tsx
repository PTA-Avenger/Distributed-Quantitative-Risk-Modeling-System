import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const MetricCard = ({ label, value, delta, isBad = false }: { label: string, value: string, delta: string, isBad?: boolean }) => {
  return (
    <div className={`panel ${isBad ? 'error' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <span className="text-section-header">{label}</span>
      <span className="text-metric" style={{ color: isBad ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>
        {value}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{delta}</span>
    </div>
  );
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`page-enter ${mounted ? '' : 'loading'}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 500 }}>System Dashboard</h2>
        <Link to="/simulate">
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Play size={14} fill="currentColor" /> Execute Simulation
          </button>
        </Link>
      </div>

      {/* KPI Strip */}
      <div className="grid-12" style={{ marginBottom: '32px' }}>
        <div style={{ gridColumn: 'span 3' }}>
          <MetricCard label="Portfolio Value" value="$1,000,000" delta="↑ 0.5% from yesterday" />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <MetricCard label="Last VAR (95%)" value="-$142,300" delta="↓ 3.2% from yesterday" isBad={true} />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <MetricCard label="Last CVAR (95%)" value="-$198,450" delta="↓ 2.1% from yesterday" isBad={true} />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <MetricCard label="Simulation Count" value="1,248" delta="42 today" />
        </div>
      </div>

      <div className="grid-12">
        <div style={{ gridColumn: 'span 8' }}>
          <div className="panel">
            <h3 className="text-section-header" style={{ marginBottom: '16px' }}>Recent Simulations</h3>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>ID</th>
                  <th>Paths</th>
                  <th>Elapsed</th>
                  <th>VaR Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span style={{ color: 'var(--accent-safe)' }}>● DONE</span></td>
                  <td>SIM-8492</td>
                  <td>100,000</td>
                  <td>4.2s</td>
                  <td><span style={{ color: 'var(--accent-danger)' }}>-$142,300</span></td>
                </tr>
                <tr>
                  <td><span style={{ color: 'var(--accent-safe)' }}>● DONE</span></td>
                  <td>SIM-8491</td>
                  <td>10,000</td>
                  <td>0.8s</td>
                  <td><span style={{ color: 'var(--accent-danger)' }}>-$138,400</span></td>
                </tr>
                <tr>
                  <td><span style={{ color: 'var(--accent-safe)' }}>● DONE</span></td>
                  <td>SIM-8490</td>
                  <td>500,000</td>
                  <td>18.4s</td>
                  <td><span style={{ color: 'var(--accent-danger)' }}>-$143,150</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div style={{ gridColumn: 'span 4' }}>
          <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 className="text-section-header" style={{ marginBottom: '16px' }}>Last Distribution</h3>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '11px', borderRadius: '2px' }}>
               Histogram Preview
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
