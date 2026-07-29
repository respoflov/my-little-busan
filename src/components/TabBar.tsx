import { BookOpen, Map, Plus, Settings } from "lucide-react"
import type { Dict } from "@/lib/i18n"

export type Tab = "map" | "stampbook" | "add" | "journal" | "settings"

/** 스탬프북 탭 아이콘 — 도장 테두리를 그대로 쓴다 (lucide에 없는 형태) */
function StampIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle
        cx="9"
        cy="9"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeDasharray="3 2.4"
      />
    </svg>
  )
}

const ORDER: Tab[] = ["map", "stampbook", "add", "journal", "settings"]

export function TabBar({
  tab,
  onChange,
  d,
}: {
  tab: Tab
  onChange: (t: Tab) => void
  d: Dict
}) {
  const label: Record<Tab, string> = {
    map: d.tabMap,
    stampbook: d.tabStampbook,
    add: d.tabAdd,
    journal: d.tabJournal,
    settings: d.tabSettings,
  }

  return (
    <nav className="safe-b fixed inset-x-0 bottom-0 z-30 flex border-t border-line-soft bg-card pt-2">
      {ORDER.map((id) => {
        const active = tab === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={active ? "page" : undefined}
            aria-label={label[id]}
            className={`flex min-h-11 flex-1 flex-col items-center gap-[3px] text-[10px] font-semibold transition-colors ${
              active ? "text-ink" : "text-ink-3"
            }`}
          >
            {id === "map" && <Map size={18} strokeWidth={1.7} />}
            {id === "stampbook" && <StampIcon />}
            {id === "add" && <Plus size={18} strokeWidth={1.7} />}
            {id === "journal" && <BookOpen size={18} strokeWidth={1.7} />}
            {id === "settings" && <Settings size={18} strokeWidth={1.7} />}
            {label[id]}
          </button>
        )
      })}
    </nav>
  )
}
