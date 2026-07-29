import { useMemo } from "react"
import { DISTRICTS, DISTRICT_VIEWBOX } from "@/data/districts"
import { Logo } from "@/components/Logo"
import { useStore } from "@/lib/store"
import { districtName } from "@/lib/i18n"

const [, , VB_W, VB_H] = DISTRICT_VIEWBOX.split(" ").map(Number)

/**
 * 원도심(중·서·동·영도)은 실제로 좁은 지역에 몰려 있어 도형 중심에 그대로 라벨을 놓으면 겹친다.
 * 겹치는 구만 바깥쪽으로 조금씩 밀어 읽을 수 있게 한다. (단위: viewBox 좌표)
 */
const LABEL_NUDGE: Record<string, [number, number]> = {
  "dong-gu": [9, -9],
  "seo-gu": [-4, -12],
  "jung-gu": [-6, 13],
  "yeongdo-gu": [7, 9],
  "saha-gu": [-8, 4],
  "busanjin-gu": [-8, -4],
  "sasang-gu": [-7, 2],
  "dongnae-gu": [-7, -7],
  "yeonje-gu": [4, 4],
  "suyeong-gu": [13, 10],
  "nam-gu": [7, 3],
  "haeundae-gu": [7, -6],
}

/**
 * 메인 — 부산 16개 구·군 행정지도.
 * 구마다 등록 장소 수 배지를 얹고, 탭하면 해당 구로 확대(줌인)한다.
 */
export function MapOverview({
  onSelectDistrict,
  onSelectUnlocated,
}: {
  onSelectDistrict: (id: string) => void
  onSelectUnlocated: () => void
}) {
  const { places, districtOf, data, d, visitCount } = useStore()
  const lang = data.settings.lang

  const stats = useMemo(() => {
    const map = new Map<string, { total: number; visited: number }>()
    let unlocated = 0
    for (const p of places) {
      const id = districtOf(p)
      if (!id) {
        unlocated++
        continue
      }
      const s = map.get(id) ?? { total: 0, visited: 0 }
      s.total++
      if (data.visits[p.id]) s.visited++
      map.set(id, s)
    }
    return { map, unlocated }
  }, [places, districtOf, data.visits])

  return (
    <div className="relative flex min-h-svh flex-col bg-map-sea pb-[76px]">
      <header className="safe-t px-5">
        <div className="flex items-center gap-2">
          <Logo size={33} />
          <h1 className="tnum text-[15px] font-bold tracking-[-0.01em]">
            {d.placesCount(visitCount, places.length)}
          </h1>
        </div>
        <p className="mt-0.5 text-[12px] text-ink-2">{d.mapHint}</p>
      </header>

      <div className="flex flex-1 items-center px-2">
        <div className="relative w-full">
          <svg
            viewBox={DISTRICT_VIEWBOX}
            className="block w-full"
            role="img"
            aria-label={d.appName}
          >
            {DISTRICTS.map((dist) => {
              const s = stats.map.get(dist.id)
              const complete = s && s.total > 0 && s.visited === s.total
              return (
                <path
                  key={dist.id}
                  d={dist.path}
                  fill={complete ? "var(--accent-soft)" : "var(--map-land)"}
                  stroke="var(--map-stroke)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  onClick={() => onSelectDistrict(dist.id)}
                  className="cursor-pointer"
                />
              )
            })}
          </svg>

          {DISTRICTS.map((dist) => {
            const s = stats.map.get(dist.id)
            const total = s?.total ?? 0
            const complete = total > 0 && s!.visited === total
            const [nx, ny] = LABEL_NUDGE[dist.id] ?? [0, 0]
            return (
              <button
                key={dist.id}
                onClick={() => onSelectDistrict(dist.id)}
                aria-label={`${districtName(dist, lang)} ${total}`}
                className="press absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-px"
                style={{
                  left: `${((dist.labelX + nx) / VB_W) * 100}%`,
                  top: `${((dist.labelY + ny) / VB_H) * 100}%`,
                }}
              >
                {total === 0 ? (
                  <span className="block h-2.5 w-2.5 rounded-full border-[1.5px] border-dashed border-ink-4" />
                ) : (
                  <span
                    className="tnum flex h-[19px] min-w-[19px] items-center justify-center rounded-full px-[5px] text-[10.5px] font-bold text-sand shadow-[0_2px_5px_rgba(23,38,59,0.25)]"
                    style={{
                      background: complete ? "var(--accent)" : "var(--ink)",
                    }}
                  >
                    {total}
                  </span>
                )}
                <span
                  className="text-[9px] font-semibold whitespace-nowrap text-ink-2"
                  style={{ textShadow: "0 1px 2px var(--map-land)" }}
                >
                  {districtName(dist, lang)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {stats.unlocated > 0 && (
        <div className="flex justify-center px-5 pt-2">
          <button
            onClick={onSelectUnlocated}
            className="press rounded-full border border-line bg-card px-3.5 py-2 text-[12px] font-semibold text-ink-2 shadow-[0_2px_8px_rgba(23,38,59,0.06)]"
          >
            {d.unlocatedN(stats.unlocated)}
          </button>
        </div>
      )}
    </div>
  )
}
