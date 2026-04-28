import React from 'react';
import { BookOpen, Cpu, ShieldAlert, GitBranch } from 'lucide-react';

export default function CrashCourse() {
  return (
    <div className="page-enter">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} color="var(--accent-primary)" />
          Crash Course: Quantitative Risk & Distributed Processing
        </h2>
        <p className="text-body" style={{ marginTop: '8px', maxWidth: '800px' }}>
          Welcome to the Risk Engine platform. This system utilizes a distributed computation model to execute 
          high-performance financial simulations. Below is a primer on the core concepts you'll be interacting with.
        </p>
      </div>

      <div className="grid-12">
        <div style={{ gridColumn: 'span 6' }}>
          <div className="panel" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Cpu size={16} color="var(--accent-primary)" />
              <h3 className="text-section-header">Monte Carlo Simulations</h3>
            </div>
            <p className="text-body" style={{ lineHeight: '1.6' }}>
              A Monte Carlo simulation uses repeated random sampling to compute the probability of different outcomes. 
              Instead of providing a single deterministic final portfolio value, we generate tens of thousands of potential 
              "paths" the assets could take over your time horizon.
            </p>
            <div style={{ backgroundColor: 'var(--bg-elevated)', padding: '12px', marginTop: '16px', borderLeft: '2px solid var(--accent-primary)' }}>
              <span className="font-mono-data" style={{ fontSize: '11px' }}>
                Returns ~ N(µ, σ²)<br/>
                S_t = S_0 * exp((µ - σ²/2)*t + σ*W_t)
              </span>
            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <div className="panel" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldAlert size={16} color="var(--accent-danger)" />
              <h3 className="text-section-header">VaR & CVaR (Expected Shortfall)</h3>
            </div>
            <p className="text-body" style={{ lineHeight: '1.6' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Value at Risk (VaR):</strong> The maximum expected loss over a specific time horizon at a given confidence level. If a 95% VaR is -$1M, there is a 5% chance the portfolio will lose more than $1M.
            </p>
            <p className="text-body" style={{ lineHeight: '1.6', marginTop: '12px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Conditional VaR (CVaR):</strong> Also known as Expected Shortfall. It averages the losses that occur beyond the VaR threshold. It answers: <em>"If things go bad, exactly how bad will it get?"</em>
            </p>
          </div>
        </div>

        <div style={{ gridColumn: 'span 12' }}>
          <div className="panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <GitBranch size={16} color="var(--accent-safe)" />
              <h3 className="text-section-header">Distributed Architecture</h3>
            </div>
            <p className="text-body" style={{ lineHeight: '1.6', maxWidth: '800px' }}>
              Generating millions of correlated asset price paths requires significant compute. The Risk Engine uses a 
              <strong> Coordinator-Worker pattern</strong>.
            </p>
            <ul className="text-body" style={{ marginLeft: '24px', marginTop: '12px', lineHeight: '1.8' }}>
              <li><strong>The Coordinator</strong> receives your simulation parameters (from the React UI via GraphQL), slices the workload into batches, and orchestrates the worker nodes.</li>
              <li><strong>Cholesky Factorization:</strong> The .NET Coordinator runs an O(N³) decomposition algorithm on your provided Correlation Matrix to compute the Lower Triangular Factor. This allows the backend to securely correlate purely random variables across complex multi-asset portfolios.</li>
              <li><strong>The Workers</strong> (listening on massive gRPC sockets) take this matrix, generate the randomized price paths via Geometric Brownian Motion (GBM), and stream results back.</li>
              <li><strong>The Storage Layer:</strong> The Coordinator securely persists all historical records using PostgreSQL & EF Core for rapid retrieval across user sessions.</li>
              <li><strong>The UI</strong> caches the compressed JSON histogram array to paint the precise Bell Curve distribution securely inside your browser.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
