import React from 'react';
import { StepMetrics } from '../../types';
import { Timer, Globe, ShieldCheck, ArrowRightLeft, DownloadCloud, Activity } from 'lucide-react';

interface MetricChipsProps {
  metrics?: StepMetrics;
}

export const MetricChips: React.FC<MetricChipsProps> = ({ metrics }) => {
  if (!metrics || Object.keys(metrics).length === 0) return null;

  const standardKeys = ['dns', 'connect', 'request', 'download', 'total'];
  const hasStandard = standardKeys.some((k) => k in metrics);

  if (hasStandard) {
    const items = [
      { key: 'dns', label: 'DNS', icon: Globe, val: metrics.dns, unit: 'ms' },
      { key: 'connect', label: 'Connect (TCP+TLS)', icon: ShieldCheck, val: metrics.connect, unit: 'ms' },
      { key: 'request', label: 'Server & DB', icon: ArrowRightLeft, val: metrics.request, unit: 'ms' },
      { key: 'download', label: 'Download', icon: DownloadCloud, val: metrics.download, unit: 'ms' },
      { key: 'total', label: 'Total Budget', icon: Timer, val: metrics.total, unit: 'ms', highlight: true }
    ];

    const hasAnyVal = items.some((it) => it.val !== null && it.val !== undefined);
    if (!hasAnyVal) return null;

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
  }

  // Generic dynamic metrics rendering for all other lessons (e.g. joins, tx, schema, servers, load)
  const entries = Object.entries(metrics).filter(([, val]) => val !== null && val !== undefined);
  if (entries.length === 0) return null;

  return (
    <div className="metric-chips-bar">
      {entries.map(([key, val]) => {
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .toLowerCase();

        return (
          <div key={key} className="chip-item" style={{ background: 'var(--paper)' }}>
            <Activity size={12} strokeWidth={2.2} />
            <span style={{ color: 'var(--muted)', fontSize: 10, textTransform: 'capitalize' }}>
              {formattedKey}:
            </span>
            <span className="chip-val" style={{ fontWeight: 800 }}>
              {String(val)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
