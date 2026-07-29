/** 앱 로고 — 여권 도장 모티브 (점선 테두리 · 파도 · 점) */
export function Logo({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 88 88" fill="none" aria-hidden>
      <circle
        cx="44"
        cy="44"
        r="39"
        stroke="var(--c-walk)"
        strokeWidth="4"
        strokeDasharray="7 6"
        fill="none"
      />
      <circle cx="44" cy="44" r="29" stroke="var(--ink)" strokeWidth="3.5" fill="var(--sand)" />
      <path
        d="M30 44c4-4.5 8.5-4.5 12.5 0s8.5 4.5 12.5 0"
        stroke="var(--c-culture)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="44" cy="31" r="4.5" fill="var(--accent)" />
    </svg>
  )
}
