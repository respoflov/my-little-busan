import { useMemo, useState } from "react"
import { Pencil } from "lucide-react"
import { Stamp } from "@/components/Stamp"
import { ScreenHeader } from "@/components/bits"
import { useStore } from "@/lib/store"
import { stampRotation } from "@/lib/utils"
import { categoryLabel, formatDate } from "@/lib/i18n"
import {
  CATEGORY_COLOR,
  CATEGORY_IDS,
  type Category,
  type Place,
  type StampSort,
} from "@/lib/types"

/**
 * 스탬프북 — 도장 수집 화면.
 * 방문/미방문을 따로 모으지 않고 장소 순서를 그대로 두어, 빈 도장 사이에 찍힌 도장이 섞여 보인다.
 */
export function Stampbook({
  onSelectPlace,
  onEditStartDate,
}: {
  onSelectPlace: (place: Place) => void
  onEditStartDate: () => void
}) {
  const { places, data, d, visitCount, setSettings } = useStore()
  const [filter, setFilter] = useState<Category | "all">("all")
  const sort = data.settings.stampSort
  const lang = data.settings.lang

  const perCategory = useMemo(() => {
    const map = new Map<Category, { total: number; visited: number }>()
    for (const c of CATEGORY_IDS) map.set(c, { total: 0, visited: 0 })
    for (const p of places) {
      const s = map.get(p.category)
      if (!s) continue
      s.total++
      if (data.visits[p.id]) s.visited++
    }
    return map
  }, [places, data.visits])

  const shown = useMemo(() => {
    const list = filter === "all" ? places : places.filter((p) => p.category === filter)
    return sort === "name" ? [...list].sort((a, b) => a.name.localeCompare(b.name, "ko")) : list
  }, [places, filter, sort])

  const progress = places.length ? (visitCount / places.length) * 100 : 0

  return (
    <div className="safe-t px-5 pb-[92px]">
      <ScreenHeader
        title={d.stampbook}
        sub={
          <button
            onClick={onEditStartDate}
            className="press inline-flex items-center gap-1.5 text-left"
          >
            {data.settings.startDate
              ? d.collectingSince(formatDate(data.settings.startDate, lang))
              : d.collectingNoDate}
            <Pencil size={12} className="text-ink-3" />
          </button>
        }
      />

      <section className="rounded-[14px] border border-line bg-card p-4">
        <div
          className="flex items-baseline gap-1.5"
          aria-label={d.visitedCount(visitCount, places.length)}
        >
          <span className="tnum text-[26px] font-bold">{visitCount}</span>
          <span className="tnum text-[13px] text-ink-3">{d.ofTotalVisited(places.length)}</span>
        </div>
        <div
          className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line-soft"
          role="progressbar"
          aria-valuenow={visitCount}
          aria-valuemin={0}
          aria-valuemax={places.length}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 카테고리 카운트 줄이 곧 필터 */}
        <div className="no-scrollbar -mx-1 mt-3 flex gap-1 overflow-x-auto px-1">
          <button
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
            className={`tnum shrink-0 rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${
              filter === "all"
                ? "border-line bg-sand text-ink"
                : "border-transparent text-ink-2"
            }`}
          >
            {d.catAll} {visitCount}/{places.length}
          </button>
          {CATEGORY_IDS.map((c) => {
            const s = perCategory.get(c)!
            const active = filter === c
            return (
              <button
                key={c}
                onClick={() => setFilter(active ? "all" : c)}
                aria-pressed={active}
                aria-label={`${categoryLabel(c, d)} ${s.visited}/${s.total}`}
                className={`tnum flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${
                  active ? "border-line bg-sand text-ink" : "border-transparent text-ink-2"
                }`}
              >
                <span
                  className="h-[7px] w-[7px] rounded-full"
                  style={{ background: CATEGORY_COLOR[c] }}
                />
                {s.visited}/{s.total}
              </button>
            )
          })}
        </div>
      </section>

      <div className="mt-3.5 flex items-center gap-2.5 text-[11.5px] font-semibold">
        <span className="text-ink-3">{d.sortLabel}</span>
        {(["registered", "name"] as StampSort[]).map((s) => (
          <button
            key={s}
            onClick={() => setSettings({ stampSort: s })}
            aria-pressed={sort === s}
            className={sort === s ? "border-b-[1.5px] border-ink pb-px text-ink" : "text-ink-3"}
          >
            {s === "registered" ? d.sortRegistered : d.sortName}
          </button>
        ))}
      </div>

      <ul className="mt-3 grid grid-cols-4 gap-x-3 gap-y-3.5">
        {shown.map((place) => {
          const visit = data.visits[place.id]
          return (
            <li key={place.id}>
              <button
                onClick={() => onSelectPlace(place)}
                className="press flex w-full flex-col items-center gap-1.5"
              >
                <Stamp
                  category={place.category}
                  size={52}
                  empty={!visit}
                  rotation={visit ? (visit.rotation ?? stampRotation(place.id)) : 0}
                />
                <span
                  className={`w-full truncate text-center text-[9.5px] font-semibold ${
                    visit ? "text-ink-2" : "text-ink-3"
                  }`}
                >
                  {place.name}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
