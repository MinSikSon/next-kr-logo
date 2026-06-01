'use client';

import { useState } from 'react';
import type { LogoEntry } from '@/types/logo';

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
  const [imgError, setImgError] = useState(false);

  if (entry.imageUrl && !imgError) {
    return (
      <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden flex items-center justify-center bg-white dark:bg-white/5 border border-[var(--card-border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.imageUrl}
          alt={entry.nameKo}
          width={64}
          height={64}
          className="object-contain w-16 h-16"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return <SvgMark entry={entry} />;
}
