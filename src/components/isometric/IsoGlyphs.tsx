import React from 'react';

interface GlyphProps {
  x: number;
  y: number;
  size?: number;
  color?: string;
  className?: string;
}

export const ServerGlyph: React.FC<GlyphProps> = ({ x, y, size = 18, color = 'currentColor' }) => {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <rect x="-10" y="-9" width="20" height="7.5" rx="2" />
      <rect x="-10" y="1.5" width="20" height="7.5" rx="2" />
      <circle cx="-5.5" cy="-5.2" r="0.8" fill={color} />
      <circle cx="-5.5" cy="5.2" r="0.8" fill={color} />
      <line x1="0" y1="-5.2" x2="6" y2="-5.2" strokeWidth="1.5" />
      <line x1="0" y1="5.2" x2="6" y2="5.2" strokeWidth="1.5" />
    </g>
  );
};

export const BalancerGlyph: React.FC<GlyphProps> = ({ x, y, size = 18, color = 'currentColor' }) => {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="-7" cy="0" r="2.8" fill={color} />
      <path d="M-4 0h3M-1 0 C 3 0 3 -7 7 -7M-1 0 C 3 0 3 7 7 7M-1 0h8" />
      <path d="M5 -9.5l2.5 2.5-2.5 2.5M5 -2.5l2.5 2.5-2.5 2.5M5 4.5l2.5 2.5-2.5 2.5" />
    </g>
  );
};

export const DatabaseGlyph: React.FC<GlyphProps> = ({ x, y, size = 18, color = 'currentColor' }) => {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="1.8">
      <ellipse cx="0" cy="-6" rx="8" ry="3" />
      <path d="M-8 -6v5c0 1.6 3.6 3 8 3s8-1.4 8-3v-5" />
      <path d="M-8 1v5c0 1.6 3.6 3 8 3s8-1.4 8-3v-5" />
    </g>
  );
};

export const GlobeGlyph: React.FC<GlyphProps> = ({ x, y, color = 'currentColor' }) => {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="1.8">
      <circle cx="0" cy="0" r="8" />
      <ellipse cx="0" cy="0" rx="3.5" ry="8" />
      <line x1="-8" y1="0" x2="8" y2="0" />
    </g>
  );
};

export const UserGlyph: React.FC<GlyphProps> = ({ x, y, color = 'currentColor' }) => {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="1.8">
      <circle cx="0" cy="-4" r="3.5" />
      <path d="M-6 7c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </g>
  );
};

export const CacheGlyph: React.FC<GlyphProps> = ({ x, y, color = 'currentColor' }) => {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="1.8">
      <polygon points="1,-9 -7,0 0,0 -1,9 7,0 0,0" fill={color} fillOpacity="0.2" stroke={color} />
    </g>
  );
};

export const QueueGlyph: React.FC<GlyphProps> = ({ x, y, color = 'currentColor' }) => {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="1.8">
      <rect x="-8" y="-7" width="16" height="14" rx="3" />
      <line x1="-4" y1="-7" x2="-4" y2="7" />
      <line x1="0" y1="-7" x2="0" y2="7" />
      <line x1="4" y1="-7" x2="4" y2="7" />
    </g>
  );
};

export const renderGlyph = (glyph: string | undefined, x: number, y: number, color?: string) => {
  switch (glyph) {
    case 'balancer':
      return <BalancerGlyph x={x} y={y} color={color} />;
    case 'database':
    case 'db':
      return <DatabaseGlyph x={x} y={y} color={color} />;
    case 'globe':
    case 'dns':
      return <GlobeGlyph x={x} y={y} color={color} />;
    case 'user':
    case 'client':
      return <UserGlyph x={x} y={y} color={color} />;
    case 'cache':
    case 'redis':
      return <CacheGlyph x={x} y={y} color={color} />;
    case 'queue':
    case 'kafka':
      return <QueueGlyph x={x} y={y} color={color} />;
    case 'server':
    default:
      return <ServerGlyph x={x} y={y} color={color} />;
  }
};

