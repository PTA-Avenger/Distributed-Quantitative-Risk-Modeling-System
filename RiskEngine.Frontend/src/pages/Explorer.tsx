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
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <iframe src="https://risk-engine-coordinator.onrender.com/graphql" style={{ width: '100%', height: '100%', border: 'none' }} title="GraphQL API Explorer" />
        </div>
      </div>
    </div>
  );
}
