import React from 'react';
import iconData from './iconDefs.json';

const ICONS: Record<string, Array<[string, Record<string, string>]>> = iconData as any;

export interface IconRenderOptions {
  size?: number;
  stroke?: number;
  color?: string;
  fill?: string;
  className?: string;
}

/**
 * Render an SVG icon at isometric/screen coordinates (cx, cy)
 */
export function renderIsoIcon(
  name: string | undefined,
  cx: number,
  cy: number,
  options: IconRenderOptions = {}
) {
  if (!name) return null;
  const def = ICONS[name] || ICONS['server'] || ICONS['box'];
  if (!def) return null;

  const size = options.size || 20;
  const stroke = options.stroke || 1.9;
  const color = options.color || '#1d1b19';
  const fill = options.fill || 'none';
  const scale = size / 24;

  return (
    <g
      transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${scale})`}
      fill={fill}
      stroke={color}
      strokeWidth={stroke / scale}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={options.className}
    >
      {def.map(([tag, attrs], i) => {
        return React.createElement(tag, { key: i, ...attrs });
      })}
    </g>
  );
}

/**
 * Standalone icon component for HTML/UI badges
 */
export const IsoIcon: React.FC<{ name: string; size?: number; stroke?: number; color?: string; className?: string }> = ({
  name,
  size = 16,
  stroke = 1.8,
  color = 'currentColor',
  className = ''
}) => {
  const def = ICONS[name];
  if (!def) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-icon ${className}`}
      aria-hidden="true"
    >
      {def.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
};

