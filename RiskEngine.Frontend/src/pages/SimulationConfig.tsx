import React, { useRef } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { gql, useLazyQuery } from '@apollo/client';

const EXECUTE_SIMULATION = gql`
  query ExecuteSimulation($req: SimulationRequestInput!) {
    executeSimulation(request: $req) {
      var95
      cvar95
      pnlDistribution {
        bucket
        freq
      }
      expectedPnl
      maxLoss
      maxGain
      standardDeviation
      skewness
      kurtosis
    }
  }
`;

const FETCH_MARKET_DATA = gql`
  query FetchMarketData($tickers: [String!]!) {
    fetchMarketData(tickers: $tickers) {
      assets {
        id
        name
        weight
        drift
        volatility
        initialPrice
      }
      correlationMatrix
    }
  }
`;

export default function SimulationConfig() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    numberOfPaths, timeHorizonYears, timeSteps, initialPortfolioValue, 
    assets, correlationMatrix, setSimulationParam, setAssetWeight,
    setAssets, setAssetsAndMatrix, addAsset, removeAsset, updateAsset, setIsSimulating, isSimulating, setResults
  } = useSimulationStore();
  
  const [executeSim] = useLazyQuery(EXECUTE_SIMULATION);
  const [fetchMarketData, { loading: fetchingMarketData }] = useLazyQuery(FETCH_MARKET_DATA);

  const handleFetchMarketData = async () => {
    try {
      const tickers = assets.map(a => a.name).filter(n => n && n !== 'UNK');
      if (tickers.length < 2) {
        alert("Please enter at least 2 valid ticker symbols (e.g., AAPL, MSFT) in the Asset column.");
        return;
      }
      const response = await fetchMarketData({ variables: { tickers } });
      if (response.data?.fetchMarketData) {
        setAssetsAndMatrix(
          response.data.fetchMarketData.assets, 
          response.data.fetchMarketData.correlationMatrix
        );
      } else {
        console.error("Market Data Error:", response.error || response.errors);
        alert("Failed to fetch market data. See console for details.");
      }
    } catch (e) {
      console.error(e);
      alert("Error fetching market data.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(r => r.trim().length > 0);
      const newAssets = rows.slice(1).map((row, i) => {
        const [id, name, weight, drift, vol, price] = row.split(',').map(s => s.trim());
        return {
          id: id || `csv-${i}`,
          name: name || 'UNK',
          weight: parseFloat(weight) || 0,
          drift: parseFloat(drift) || 0,
          volatility: parseFloat(vol) || 0,
          initialPrice: parseFloat(price) || 0
        };
      });
      if (newAssets.length > 0) setAssets(newAssets);
    };
    reader.readAsText(file);
  };


  const totalWeight = assets.reduce((sum, a) => sum + a.weight, 0);
  const weightIsInvalid = Math.abs(totalWeight - 1.0) > 0.001;

  const handleExecute = async () => {
    setIsSimulating(true);
    try {
      const response = await executeSim({
        variables: {
          req: {
            paths: numberOfPaths,
            horizon: timeHorizonYears,
            steps: timeSteps,
            initialPortfolioValue: initialPortfolioValue,
            assets: assets.map(a => ({
              weight: a.weight,
              drift: a.drift,
              volatility: a.volatility,
              initialPrice: a.initialPrice
            })),
            correlationMatrix: correlationMatrix
          }
        }
      });

      if (response.data && response.data.executeSimulation) {
        setResults(
          response.data.executeSimulation.var95, 
          response.data.executeSimulation.cvar95, 
          response.data.executeSimulation.pnlDistribution,
          response.data.executeSimulation.expectedPnl,
          response.data.executeSimulation.maxLoss,
          response.data.executeSimulation.maxGain,
          response.data.executeSimulation.standardDeviation,
          response.data.executeSimulation.skewness,
          response.data.executeSimulation.kurtosis
        );
        setIsSimulating(false);
        navigate(`/results/LATEST`);
      } else {
        console.error("GraphQL Error:", response.error || response.errors);
        setIsSimulating(false);
      }
    } catch (e) {
      console.error(e);
      setIsSimulating(false);
    }
  };

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 500 }}>Configure Simulation</h2>
        <button 
          className="btn-primary" 
          onClick={handleExecute}
          disabled={weightIsInvalid || isSimulating}
          style={{ opacity: (weightIsInvalid || isSimulating) ? 0.5 : 1, cursor: (weightIsInvalid || isSimulating) ? 'not-allowed' : 'pointer' }}
        >
          {isSimulating ? 'Processing via gRPC Cluster...' : 'Execute Simulation [⌘ Enter]'}
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
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ 
                  fontFamily: '"IBM Plex Mono"', fontSize: '11px', 
                  color: weightIsInvalid ? 'var(--accent-danger)' : 'var(--accent-safe)' 
                }}>
                  Σ W = {totalWeight.toFixed(2)}
                </span>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => addAsset()}>
                  <Plus size={14} /> Row
                </button>
                <button 
                  className="btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-base)' }} 
                  onClick={handleFetchMarketData}
                  disabled={fetchingMarketData}
                >
                  {fetchingMarketData ? 'Fetching...' : 'Fetch Live Data'}
                </button>
                <input type="file" accept=".csv" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--bg-border)' }} onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} /> Upload CSV
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '11px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-base)', padding: '8px', borderLeft: '2px solid var(--accent-safe)' }}>
              Upload standard CSV: <code>ID, Name, Weight, Drift, Volatility, Price</code>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Weight</th>
                  <th>Drift (μ)</th>
                  <th>Vol (σ)</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <input 
                        type="text" 
                        value={asset.name} 
                        onChange={(e) => updateAsset(asset.id, { name: e.target.value })}
                        style={{ width: '80px', padding: '4px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={asset.weight} 
                        onChange={(e) => setAssetWeight(asset.id, parseFloat(e.target.value))}
                        step={0.05}
                        style={{ width: '60px', padding: '4px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={asset.drift} 
                        onChange={(e) => updateAsset(asset.id, { drift: parseFloat(e.target.value) || 0 })}
                        step={0.01}
                        style={{ width: '60px', padding: '4px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={asset.volatility} 
                        onChange={(e) => updateAsset(asset.id, { volatility: parseFloat(e.target.value) || 0 })}
                        step={0.01}
                        style={{ width: '60px', padding: '4px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={asset.initialPrice} 
                        onChange={(e) => updateAsset(asset.id, { initialPrice: parseFloat(e.target.value) || 0 })}
                        style={{ width: '70px', padding: '4px' }}
                      />
                    </td>
                    <td>
                      <button onClick={() => removeAsset(asset.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
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
