import { useSimulationStore } from '../store/useSimulationStore';
import { useNavigate } from 'react-router-dom';

export default function SimulationConfig() {
  const navigate = useNavigate();
  const { 
    numberOfPaths, timeHorizonYears, timeSteps, initialPortfolioValue, 
    assets, correlationMatrix, setSimulationParam, setAssetWeight 
  } = useSimulationStore();

  const totalWeight = assets.reduce((sum, a) => sum + a.weight, 0);
  const weightIsInvalid = Math.abs(totalWeight - 1.0) > 0.001;

  const handleExecute = () => {
    // In a real app, we'd fire the GraphQL mutation and get the ID.
    const newSimId = 'SIM-' + Math.floor(Math.random() * 10000);
    navigate(`/simulate/${newSimId}`);
  };

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 500 }}>Configure Simulation</h2>
        <button 
          className="btn-primary" 
          onClick={handleExecute}
          disabled={weightIsInvalid}
          style={{ opacity: weightIsInvalid ? 0.5 : 1, cursor: weightIsInvalid ? 'not-allowed' : 'pointer' }}
        >
          Execute Simulation [⌘ Enter]
        </button>
      </div>

      <div className="grid-12">
        {/* LEFT COLUMN - System Params */}
        <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className="text-section-header">Simulation Parameters</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="text-body">Paths (1k - 1M)</label>
              <input 
                type="number" 
                value={numberOfPaths} 
                onChange={(e) => setSimulationParam('numberOfPaths', parseInt(e.target.value))}
                min={1000} max={1000000} step={1000}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="text-body">Time Horizon (Years)</label>
              <input 
                type="number" 
                value={timeHorizonYears} 
                onChange={(e) => setSimulationParam('timeHorizonYears', parseFloat(e.target.value))}
                step={0.1}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="text-body">Time Steps</label>
              <input 
                type="number" 
                value={timeSteps} 
                onChange={(e) => setSimulationParam('timeSteps', parseInt(e.target.value))}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="text-body">Initial Portfolio Value ($)</label>
              <input 
                type="number" 
                value={initialPortfolioValue} 
                onChange={(e) => setSimulationParam('initialPortfolioValue', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* CENTER COLUMN - Assets */}
        <div style={{ gridColumn: 'span 5' }}>
          <div className="panel" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="text-section-header">Portfolio Assets</h3>
              <span style={{ 
                fontFamily: '"IBM Plex Mono"', fontSize: '11px', 
                color: weightIsInvalid ? 'var(--accent-danger)' : 'var(--accent-safe)' 
              }}>
                Σ W = {totalWeight.toFixed(2)}
              </span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Weight</th>
                  <th>Drift (μ)</th>
                  <th>Vol (σ)</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.name}</td>
                    <td>
                      <input 
                        type="number" 
                        value={asset.weight} 
                        onChange={(e) => setAssetWeight(asset.id, parseFloat(e.target.value))}
                        step={0.05}
                        style={{ width: '60px', padding: '4px' }}
                      />
                    </td>
                    <td>{asset.drift.toFixed(2)}</td>
                    <td>{asset.volatility.toFixed(2)}</td>
                    <td>{asset.initialPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN - Matrix Preview */}
        <div style={{ gridColumn: 'span 4' }}>
          <div className="panel" style={{ height: '100%' }}>
             <h3 className="text-section-header" style={{ marginBottom: '16px' }}>Correlation Matrix (Hardcoded)</h3>
             <div style={{ padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: '2px' }}>
                <pre style={{ margin: 0, fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px', lineHeight: '1.6' }}>
                  {correlationMatrix.map((row, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px' }}>
                      {row.map((val, j) => (
                        <span key={j} style={{ 
                          color: val === 1 ? 'var(--accent-primary)' : val > 0 ? 'var(--text-mono)' : 'var(--accent-danger)',
                          width: '40px', textAlign: 'right'
                        }}>
                          {val.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  ))}
                </pre>
             </div>
             <p className="text-body" style={{ marginTop: '16px', fontSize: '11px' }}>
               Covariance uploaded via API. Editable matrix functionality planned for next iteration. Cholesky decomposition applied backend-side.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
