import React from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function Results() {
  const { id } = useParams();

  // Generate some dummy distribution data resembling a normal distribution
  const data = Array.from({ length: 50 }).map((_, i) => ({
    bucket: ((i - 25) * 10000).toLocaleString(),
    freq: Math.floor(Math.pow(Math.E, -Math.pow((i-25)/8, 2)) * 1500)
  }));

  const varBucket = data[15].bucket;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 500 }}>Results: {id || 'SIM-LATEST'}</h2>
      </div>

      <div className="grid-12" style={{ flex: 1 }}>
        {/* LEFT COLUMN - Metrics */}
        <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '8px' }}>
           <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 className="text-section-header">Risk Metrics</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-border)', paddingBottom: '8px' }}>
                <span className="text-section-header">VAR (95%)</span>
                <span className="font-mono-data" style={{ color: 'var(--accent-danger)' }}>-$142,300</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-border)', paddingBottom: '8px' }}>
                <span className="text-section-header">CVAR (95%)</span>
                <span className="font-mono-data" style={{ color: 'var(--accent-danger)' }}>-$198,450</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-border)', paddingBottom: '8px' }}>
                <span className="text-section-header">EXPECTED P&L</span>
                <span className="font-mono-data" style={{ color: 'var(--accent-safe)' }}>+$24,100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-border)', paddingBottom: '8px' }}>
                <span className="text-section-header">MAX LOSS</span>
                <span className="font-mono-data" style={{ color: 'var(--accent-danger)' }}>-$410,200</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-border)', paddingBottom: '8px' }}>
                <span className="text-section-header">MAX GAIN</span>
                <span className="font-mono-data" style={{ color: 'var(--accent-safe)' }}>+$389,800</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-border)', paddingBottom: '8px' }}>
                <span className="text-section-header">STD DEVIATION</span>
                <span className="font-mono-data">$87,340</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-border)', paddingBottom: '8px' }}>
                <span className="text-section-header">SKEWNESS</span>
                <span className="font-mono-data">-0.34</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-section-header">KURTOSIS</span>
                <span className="font-mono-data">4.12</span>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN - Chart */}
        <div style={{ gridColumn: 'span 9', display: 'flex', flexDirection: 'column' }}>
          <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 className="text-section-header" style={{ marginBottom: '16px' }}>P&L Distribution (Gaussian Overlay)</h3>
            <div style={{ flex: 1, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="bucket" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: '"IBM Plex Mono"' }} axisLine={{ stroke: 'var(--bg-border)' }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: '"IBM Plex Mono"' }} axisLine={{ stroke: 'var(--bg-border)' }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--bg-elevated)' }} 
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bg-border)', fontFamily: '"IBM Plex Mono"' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="freq" fill="var(--accent-primary)" />
                  <ReferenceLine x={varBucket} stroke="var(--accent-danger)" strokeDasharray="3 3" label={{ position: 'top', value: 'VaR 95%', fill: 'var(--accent-danger)', fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
