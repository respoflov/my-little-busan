/** 오늘 날짜를 YYYY-MM-DD로 (로컬 시간 기준 — toISOString은 UTC라 날짜가 밀릴 수 있음) */
export function todayISO(): string {
  const now = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

/**
 * 도장 기울기 — 장소마다 고정, ±9~14°.
 * 손으로 찍은 도장처럼 보이도록 의도적으로 확실히 기울인다.
 */
export function stampRotation(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const mag = 9 + (h % 6) // 9~14
  return h & 1 ? mag : -mag
}
