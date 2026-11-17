import React from 'react';
import { StepMetrics } from '../../types';
import { Timer, Globe, ShieldCheck, ArrowRightLeft, DownloadCloud } from 'lucide-react';

interface MetricChipsProps {
  metrics?: StepMetrics;
}

export const MetricChips: React.FC<MetricChipsProps> = ({ metrics }) => {
  if (!metrics) return null;

  const items = [
    { key: 'dns', label: 'DNS', icon: Globe, val: metrics.dns, unit: 'ms' },
    { key: 'connect', label: 'Connect (TCP+TLS)', icon: ShieldCheck, val: metrics.connect, unit: 'ms' },
    { key: 'request', label: 'Server & DB', icon: ArrowRightLeft, val: metrics.request, unit: 'ms' },
    { key: 'download', label: 'Download', icon: DownloadCloud, val: metrics.download, unit: 'ms' },
    { key: 'total', label: 'Total Budget', icon: Timer, val: metrics.total, unit: 'ms', highlight: true }
  ];

  return (
    <div className="metric-chips-bar">
      {items.map((it) => {
        const Icon = it.icon;
        const displayVal = it.val !== null && it.val !== undefined ? `${it.val} ${it.unit}` : '–';
        return (
          <div
            key={it.key}
            className="chip-item"
            style={{
              borderColor: it.highlight ? 'var(--ink)' : 'var(--line-strong)',
              background: it.highlight ? 'var(--sheet)' : 'var(--paper)'
            }}
          >
            <Icon size={12} strokeWidth={2.2} />
            <span style={{ color: 'var(--muted)', fontSize: 10 }}>{it.label}:</span>
            <span className="chip-val" style={{ fontWeight: 800 }}>
              {displayVal}
            </span>
          </div>
        );
      })}
    </div>
  );
};

