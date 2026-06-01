'use client';

import { useState } from 'react';
import type { LogoEntry } from '@/types/logo';

const R2_BASE = 'https://pub-d229fba914d542a8a972e89662bc916c.r2.dev';
const EXTS = ['svg', 'png', 'jpg', 'jpeg', 'webp'] as const;

function SvgMark({ entry }: { entry: LogoEntry }) {
  const textColor = entry.initialColor ?? '#ffffff';
  const fontSize =
    entry.initial.length > 2 ? 18 : entry.initial.length === 2 ? 24 : 30;

  return (
    <svg
      width="72"
      height="72"
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

export default function LogoMark({ entry }: { entry: LogoEntry }) {
  // extIdx: index into EXTS[] when probing without a known extension
  const [extIdx, setExtIdx] = useState(0);
  const [useSvgFallback, setUseSvgFallback] = useState(false);

  // 1. imageUrl set by D1 (image_ext known) → use directly
  // 2. ticker only → probe EXTS in order
  const resolvedUrl = entry.imageUrl
    ?? (entry.ticker ? `${R2_BASE}/logos/${entry.ticker}.${EXTS[extIdx]}` : null);

  function handleError() {
    if (entry.imageUrl) {
      // Known URL failed — SVG fallback immediately
      setUseSvgFallback(true);
    } else if (entry.ticker && extIdx < EXTS.length - 1) {
      // Try next extension
      setExtIdx((i) => i + 1);
    } else {
      setUseSvgFallback(true);
    }
  }

  if (resolvedUrl && !useSvgFallback) {
    return (
      <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden flex items-center justify-center bg-white dark:bg-white/5 border border-[var(--card-border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedUrl}
          alt={entry.nameKo}
          width={64}
          height={64}
          className="object-contain w-16 h-16"
          onError={handleError}
        />
      </div>
    );
  }

  return <SvgMark entry={entry} />;
}
