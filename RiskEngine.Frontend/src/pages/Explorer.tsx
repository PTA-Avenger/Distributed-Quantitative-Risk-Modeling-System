import React from 'react';

export default function Explorer() {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 500 }}>GraphQL Explorer</h2>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Directly interact with the Coordinator API via Banana Cake Pop / Altair</span>
      </div>

      <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ backgroundColor: 'var(--bg-elevated)', padding: '12px', borderBottom: '1px solid var(--bg-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="font-mono-data" style={{ color: 'var(--accent-primary)' }}>POST /graphql</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', alignItems: 'center', justifyContent: 'center' }}>
           <p className="text-body" style={{ marginBottom: '24px', textAlign: 'center', maxWidth: '500px', lineHeight: '1.6' }}>
             The backend cluster enforces strict cross-origin security protocols that prevent the IDE from being securely embedded via iframe. 
             Click the button below to launch the fully interactive <strong>Banana Cake Pop GraphQL IDE</strong> securely in a new tab.
           </p>
           <a 
             href="https://risk-engine-coordinator.onrender.com/graphql/" 
             target="_blank" 
             rel="noreferrer"
             className="btn-primary"
             style={{ padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}
           >
             Launch GraphQL Editor
           </a>
           
           <div style={{ marginTop: '48px', width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-base)', border: '1px solid var(--bg-border)', padding: '16px', borderRadius: '4px' }}>
             <h4 className="text-section-header" style={{ marginBottom: '12px' }}>Example Request Payload</h4>
             <pre className="font-mono-data" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
{`query ExecuteSimulation {
  executeSimulation(request: {
    paths: 100000,
    horizon: 1.0,
    steps: 252,
    initialPortfolioValue: 1000000,
    assets: [
      { weight: 0.5, drift: 0.08, volatility: 0.2, initialPrice: 150 },
      { weight: 0.5, drift: 0.12, volatility: 0.3, initialPrice: 200 }
    ],
    correlationMatrix: [[1.0, 0.5], [0.5, 1.0]]
  }) {
    var95
    cvar95
  }
}`}
             </pre>
           </div>
        </div>
      </div>
    </div>
  );
}
