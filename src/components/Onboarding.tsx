import { useState } from "react"
import { CalendarDays } from "lucide-react"
import { todayISO } from "@/lib/utils"
import type { Dict } from "@/lib/i18n"

/** 최초 실행 1회 — 스탬프북 수집 시작일을 사용자가 정한다. */
export function Onboarding({
  d,
  onConfirm,
  onSkip,
}: {
  d: Dict
  onConfirm: (date: string) => void
  onSkip: () => void
}) {
  const [date, setDate] = useState(todayISO())

  return (
    <div className="anim-dim fixed inset-0 z-40 flex items-center justify-center bg-[rgba(23,38,59,0.32)] p-6">
      <div className="anim-fade-up w-full max-w-[340px] rounded-[20px] bg-card p-[26px_22px] shadow-[0_24px_48px_-12px_rgba(23,38,59,0.3)]">
        <h2 className="text-[18px] font-bold tracking-[-0.01em]">{d.obTitle}</h2>
        <p className="mt-1.5 text-[12.5px] leading-[1.55] text-ink-2">{d.obDesc}</p>

        <label className="mt-4 flex items-center gap-2 rounded-[11px] border border-line bg-sand px-3.5 py-3">
          <CalendarDays size={15} className="shrink-0 text-ink-3" />
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="tnum w-full bg-transparent text-[15px] font-semibold outline-none"
          />
        </label>

        <button
          onClick={() => onConfirm(date)}
          className="press mt-3.5 w-full rounded-[11px] bg-accent py-3.5 text-[14px] font-bold text-sand shadow-[0_6px_16px_-6px_var(--accent-shadow)]"
        >
          {d.obStart}
        </button>
        <button
          onClick={onSkip}
          className="mt-2.5 w-full py-1 text-center text-[12px] text-ink-3"
        >
          {d.obSkip}
        </button>
      </div>
    </div>
  )
}
