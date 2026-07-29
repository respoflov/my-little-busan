import { useEffect, useState } from "react"
import { Logo } from "./Logo"
import type { Dict } from "@/lib/i18n"

/* 연출 타이밍 (ms) — 백지에서 로고가 서서히 떠올랐다가 서서히 사라진다 */
const BLANK = 1500 // 아무것도 없는 화면
const FADE = 900 // 페이드 인/아웃에 걸리는 시간
const HOLD = 2000 // 로고가 다 보인 뒤 머무는 시간

type Phase = "blank" | "in" | "out"

/**
 * 앱 진입 스플래시 — 매 실행 시 표시.
 * 최하단 정중앙에는 제작 각인(RESPOFLOV)이 옅게 들어간다.
 */
export function Splash({ d, onDone }: { d: Dict; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("blank")

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase("in"), BLANK),
      window.setTimeout(() => setPhase("out"), BLANK + FADE + HOLD),
      window.setTimeout(onDone, BLANK + FADE + HOLD + FADE),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3.5 bg-sand"
      style={{
        opacity: phase === "out" ? 0 : 1,
        transition: `opacity ${FADE}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
      aria-hidden={phase === "out"}
    >
      <div
        className="flex flex-col items-center gap-3.5"
        style={{
          opacity: phase === "blank" ? 0 : 1,
          transform: phase === "blank" ? "scale(0.96)" : "scale(1)",
          transition: `opacity ${FADE}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${FADE}ms cubic-bezier(0.23, 1, 0.32, 1)`,
        }}
      >
        <Logo size={64} />
        <div className="text-[17px] font-bold tracking-[-0.01em]">{d.appName}</div>
        <div className="text-[13px] text-ink-2">{d.tagline}</div>
      </div>

      <div
        className="absolute inset-x-0 text-center text-[9.5px] font-semibold text-ink-4"
        style={{
          bottom: "max(34px, calc(env(safe-area-inset-bottom) + 22px))",
          letterSpacing: "0.32em",
          textIndent: "0.32em",
          opacity: phase === "blank" ? 0 : 1,
          transition: `opacity ${FADE}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        RESPOFLOV
      </div>
    </div>
  )
}
