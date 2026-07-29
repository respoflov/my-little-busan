import type { ReactNode } from "react"
import { CATEGORY_COLOR, type Category } from "@/lib/types"
import { Portal } from "./Portal"

/** 카테고리 색 알약 라벨 */
export function CategoryTag({ category, label }: { category: Category; label: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-md px-2 py-1 text-[11px] font-bold text-sand"
      style={{ background: CATEGORY_COLOR[category] }}
    >
      {label}
    </span>
  )
}

/** 카테고리 색 점 */
export function CategoryDot({ category, size = 8 }: { category: Category; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: CATEGORY_COLOR[category],
      }}
      aria-hidden
    />
  )
}

/** 정보 배지 (동네·교통 등) */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-line-soft bg-sand px-2.5 py-1.5 text-[11.5px] font-medium text-ink-2">
      {children}
    </span>
  )
}

/** 선택 칩 (동행·교통수단·필터) */
export function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`press shrink-0 rounded-full border px-2.5 py-1.5 text-[11.5px] font-semibold whitespace-nowrap transition-colors ${
        active ? "border-transparent text-sand" : "border-line bg-card text-ink-2"
      }`}
      style={active ? { background: color ?? "var(--ink)" } : undefined}
    >
      {children}
    </button>
  )
}

/** 설정 등에서 쓰는 세그먼트 컨트롤 */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "md",
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  size?: "sm" | "md"
}) {
  return (
    <div role="tablist" className="flex rounded-[9px] border border-line-soft bg-sand p-0.5">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`rounded-[7px] font-semibold transition-colors ${
              size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-2.5 py-1.5 text-[11.5px]"
            } ${active ? "bg-card text-ink shadow-[0_1px_3px_rgba(23,38,59,0.12)]" : "text-ink-3"}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** 화면 제목 블록 — 스탬프북·추가·기록·설정 탭에서 사용 (지도 탭은 자체 헤더) */
export function ScreenHeader({ title, sub }: { title: string; sub?: ReactNode }) {
  return (
    <header className="mb-4">
      <h1 className="text-[21px] font-bold tracking-[-0.02em]">{title}</h1>
      {sub && <div className="mt-1 text-[13px] text-ink-2">{sub}</div>}
    </header>
  )
}

/** 설정·목록에서 쓰는 카드 그룹 */
export function Group({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <section className="mt-[18px]">
      {label && (
        <div className="mb-[7px] text-[11px] font-bold tracking-[0.06em] text-ink-3">
          {label}
        </div>
      )}
      <div className="overflow-hidden rounded-[14px] border border-line bg-card">
        {children}
      </div>
    </section>
  )
}

export function Row({
  children,
  onClick,
  danger,
}: {
  children: ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  const cls = `flex w-full min-h-11 items-center gap-3 border-b border-line-soft px-4 py-3.5 text-left text-[13.5px] font-medium last:border-b-0 ${
    danger ? "text-accent" : ""
  }`
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children}
      </button>
    )
  }
  return <div className={cls}>{children}</div>
}

/** 짧게 떴다 사라지는 알림 */
export function Toast({ message }: { message: string }) {
  return (
    <Portal>
      <div
        role="status"
        className="anim-fade-up fixed inset-x-0 bottom-24 z-[60] flex justify-center px-6"
      >
        <div className="rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-sand shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]">
          {message}
        </div>
      </div>
    </Portal>
  )
}
