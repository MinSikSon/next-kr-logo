import type { LogoEntry } from '@/types/logo';

export default function LogoMark({ entry }: { entry: LogoEntry }) {
  const textColor = entry.initialColor ?? '#ffffff';
  const fontSize = entry.initial.length > 2 ? 18 : entry.initial.length === 2 ? 22 : 28;

  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={entry.nameKo}
    >
      <rect width="80" height="80" rx="16" fill={entry.brandColor} />
      <text
        x="40"
        y="40"
        dominantBaseline="central"
        textAnchor="middle"
        fill={textColor}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="'Geist', Arial, sans-serif"
        letterSpacing="-0.5"
      >
        {entry.initial}
      </text>
    </svg>
  );
}
