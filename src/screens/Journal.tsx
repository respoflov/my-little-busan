// 기록 탭: 방문 일기 피드
import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { PhotoImg } from "@/components/PhotoImg"
import { CategoryDot, ScreenHeader, Segmented } from "@/components/bits"
import { useStore } from "@/lib/store"
import { categoryLabel, formatDateShort, formatMonth, transitIcon } from "@/lib/i18n"
import { CATEGORY_IDS, type Category, type Place, type Visit } from "@/lib/types"

// 묶는 기준 (월별·카테고리별)과 피드 한 줄의 데이터
type GroupBy = "month" | "category"
interface Entry {
  place: Place
  visit: Visit
}

/** 기록 — 방문 일기 피드. 월별/카테고리별로 묶고 섹션을 접을 수 있다. */
export function Journal({ onOpen }: { onOpen: (placeId: string) => void }) {
  const { places, data, d } = useStore()
  const lang = data.settings.lang
  const [groupBy, setGroupBy] = useState<GroupBy>("month")
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const entries = useMemo<Entry[]>(() => {
    const byId = new Map(places.map((p) => [p.id, p]))
    return Object.values(data.visits)
      .map((visit) => {
        const place = byId.get(visit.placeId)
        return place ? { place, visit } : null
      })
      .filter((e): e is Entry => e !== null)
      .sort((a, b) => b.visit.date.localeCompare(a.visit.date))
  }, [places, data.visits])

  const summary = useMemo(() => {
    const photos = entries.reduce((n, e) => n + e.visit.photos.length, 0)
    const memos = entries.filter((e) => e.visit.memo?.trim()).length
    return { photos, memos }
  }, [entries])

  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>()
    if (groupBy === "month") {
      for (const e of entries) {
        const key = e.visit.date.slice(0, 7)
        map.set(key, [...(map.get(key) ?? []), e])
      }
      return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
    }
    for (const c of CATEGORY_IDS) map.set(c, [])
    for (const e of entries) map.get(e.place.category)?.push(e)
    return [...map.entries()].filter(([, list]) => list.length > 0)
  }, [entries, groupBy])

  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const groupLabel = (key: string) =>
    groupBy === "month" ? formatMonth(key, lang) : categoryLabel(key as Category, d)

  return (
    <div className="safe-t px-5 pb-[92px]">
      <div className="mb-4 flex items-end justify-between gap-3">
        <ScreenHeader
          title={d.journal}
          sub={d.journalSummary(entries.length, summary.photos, summary.memos)}
        />
        <div className="mb-1 shrink-0">
          <Segmented<GroupBy>
            value={groupBy}
            size="sm"
            onChange={setGroupBy}
            options={[
              { value: "month", label: d.byMonth },
              { value: "category", label: d.byCategory },
            ]}
          />
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-[15px] font-bold">{d.journalEmpty}</p>
          <p className="mt-1.5 text-[12.5px] text-ink-2">{d.journalEmptyDesc}</p>
        </div>
      ) : (
        groups.map(([key, list]) => {
          const isOpen = !collapsed.has(key)
          return (
            <section key={key}>
              <button
                onClick={() => toggle(key)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-1.5 py-2.5 text-left"
              >
                <span className="text-[12px] font-bold tracking-[0.02em] text-ink-2">
                  {groupLabel(key)}
                </span>
                <span className="tnum text-[12px] font-semibold text-ink-3">{list.length}</span>
                {isOpen ? (
                  <ChevronDown size={14} className="ml-auto text-ink-3" />
                ) : (
                  <ChevronRight size={14} className="ml-auto text-ink-3" />
                )}
              </button>

              {isOpen && (
                <ul className="flex flex-col gap-2.5">
                  {list.map(({ place, visit }) => (
                    <li key={place.id}>
                      <button
                        onClick={() => onOpen(place.id)}
                        className="press flex w-full items-start gap-3 rounded-[14px] border border-line bg-card p-3 text-left"
                      >
                        <div className="relative h-16 w-16 shrink-0">
                          {visit.photos.length > 0 ? (
                            <>
                              <PhotoImg
                                photoKey={visit.photos[0]}
                                alt={place.name}
                                className="h-16 w-16 rounded-[10px] object-cover"
                              />
                              {visit.photos.length > 1 && (
                                <span className="tnum absolute right-1 bottom-1 rounded-md bg-[rgba(23,38,59,0.72)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                                  +{visit.photos.length - 1}
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="h-16 w-16 rounded-[10px] border border-dashed border-line bg-sand" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <CategoryDot category={place.category} />
                            <span className="truncate text-[14.5px] font-bold">
                              {place.name}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11.5px] text-ink-2">
                            {formatDateShort(visit.date, lang)}
                            {visit.companions.length > 0 && ` · ${visit.companions.join(", ")}`}
                            {visit.transport && ` · ${transitIcon(visit.transport)}`}
                          </div>
                          {visit.memo?.trim() && (
                            <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.5] text-ink-2">
                              &ldquo;{visit.memo.trim()}&rdquo;
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })
      )}
    </div>
  )
}
