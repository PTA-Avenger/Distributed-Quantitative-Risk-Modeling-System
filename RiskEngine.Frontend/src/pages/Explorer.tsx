import React from 'react';

export default function Explorer() {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 500 }}>GraphQL Explorer</h2>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Directly interact with the Coordinator API via Banana Cake Pop / Altair</span>
      </div>

      <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ backgroundColor: 'var(--bg-elevated)', padding: '12px', borderBottom: '1px solid var(--bg-border)', display: 'flex', gap: '16px' }}>
          <span className="font-mono-data" style={{ color: 'var(--accent-primary)' }}>POST /graphql</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <p className="text-body" style={{ marginBottom: '16px' }}>
              The interactive GraphQL playground is normally embedded here via iframe pointing to <code style={{ color: 'var(--accent-safe)' }}>http://localhost:5001/graphql</code>.
            </p>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-base)', border: '1px solid var(--bg-border)', borderRadius: '2px', textAlign: 'left' }}>
              <pre className="font-mono-data" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
{`query SimulatePortfolio {
  executeSimulation(request: {
    paths: 100000,
    horizon: 1.0,
    steps: 252
  }) {
    var95
    cvar95
    pnlDistribution
  }
}`}
              </pre>
            </div>
            <p className="text-body" style={{ marginTop: '16px', fontSize: '11px' }}>* Ensure the .NET Coordinator service is running locally.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
