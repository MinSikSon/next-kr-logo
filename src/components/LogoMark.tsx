'use client';

import { useState } from 'react';
import type { LogoEntry } from '@/types/logo';

const R2_BASE = 'https://pub-d229fba914d542a8a972e89662bc916c.r2.dev';
const EXTS = ['svg', 'png', 'jpg', 'jpeg', 'webp'] as const;

interface LogoMarkProps {
  entry: LogoEntry;
  size?: number;
}

function SvgMark({ entry, size }: Required<LogoMarkProps>) {
  const textColor = entry.initialColor ?? '#ffffff';
  const fontSize =
    entry.initial.length > 2 ? 18 : entry.initial.length === 2 ? 24 : 30;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={entry.nameKo}
      role="img"
    >
      <rect
        width="72"
        height="72"
        rx="16"
        fill={entry.brandColor}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      <text
        x="36"
        y="36"
        dominantBaseline="central"
        textAnchor="middle"
        fill={textColor}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        letterSpacing="-0.5"
      >
        {entry.initial}
      </text>
    </svg>
  );
}

export default function LogoMark({ entry, size = 72 }: LogoMarkProps) {
  const [extIdx, setExtIdx] = useState(0);
  const [useSvgFallback, setUseSvgFallback] = useState(false);

  const resolvedUrl =
    entry.imageUrl ??
    (entry.ticker ? `${R2_BASE}/logos/${entry.ticker}.${EXTS[extIdx]}` : null);

  function handleError() {
    if (entry.imageUrl) {
      setUseSvgFallback(true);
    } else if (entry.ticker && extIdx < EXTS.length - 1) {
      setExtIdx((i) => i + 1);
    } else {
      setUseSvgFallback(true);
    }
  }

  if (resolvedUrl && !useSvgFallback) {
    const rx = Math.round(size * 0.22);
    return (
      <div
        className="flex items-center justify-center bg-white dark:bg-white/5 border border-[var(--card-border)]"
        style={{ width: size, height: size, borderRadius: rx, flexShrink: 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedUrl}
          alt={entry.nameKo}
          width={Math.round(size * 0.78)}
          height={Math.round(size * 0.78)}
          className="object-contain"
          style={{ width: Math.round(size * 0.78), height: Math.round(size * 0.78) }}
          onError={handleError}
        />
      </div>
    );
  }

  return <SvgMark entry={entry} size={size} />;
}
