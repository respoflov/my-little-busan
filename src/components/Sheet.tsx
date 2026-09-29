// 아래에서 올라오는 바텀시트 공용 컴포넌트
import { useEffect, type ReactNode } from "react"
import { Portal } from "./Portal"

/**
 * 하단 시트 — 배경 딤 탭/ESC로 닫히고, 열려 있는 동안 뒤 스크롤을 잠근다.
 */
export function Sheet({
  open,
  onClose,
  children,
  labelledBy,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  labelledBy?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-50">
        <div
          className="anim-dim absolute inset-0 bg-[rgba(23,38,59,0.32)]"
          onClick={onClose}
          aria-hidden
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          className="anim-sheet absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto overscroll-contain rounded-t-[24px] bg-card pb-[max(30px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_var(--sheet-shadow)]"
        >
          <div className="sticky top-0 z-10 bg-card pt-2.5 pb-3">
            <div className="mx-auto h-1 w-9 rounded-full bg-line" />
          </div>
          <div className="px-[22px]">{children}</div>
        </div>
      </div>
    </Portal>
  )
}
