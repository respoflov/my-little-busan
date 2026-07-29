import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, MapPin } from "lucide-react"
import { DISTRICTS } from "@/data/districts"
import { useStore } from "@/lib/store"
import { loadKakao, type KakaoNamespace } from "@/lib/kakao"
import { categoryLabel, districtName, transitIcon } from "@/lib/i18n"
import { CATEGORY_COLOR, CATEGORY_IDS, type Category, type Place } from "@/lib/types"
import { CategoryDot, CategoryTag, Chip } from "@/components/bits"

const UNLOCATED = "unlocated"

type KakaoMap = InstanceType<KakaoNamespace["maps"]["Map"]>

/** 마커 DOM — 방문한 곳은 카테고리색으로 채워지고 파도 도장이, 미방문은 흰 배경에 색 링 */
function markerElement(place: Place, visited: boolean, onClick: () => void) {
  const el = document.createElement("button")
  el.type = "button"
  el.setAttribute("aria-label", place.name)
  const color = CATEGORY_COLOR[place.category]
  el.style.cssText = [
    "width:26px",
    "height:26px",
    "border-radius:50%",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "box-shadow:0 2px 6px rgba(23,38,59,.25)",
    "cursor:pointer",
    "padding:0",
    visited
      ? `background:${color};border:2px solid #fff`
      : `background:#fff;border:2.5px solid ${color}`,
  ].join(";")
  if (visited) {
    el.innerHTML = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 8c1.6-2 3.4-2 5 0s3.4 2 5 0" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="7" cy="3.4" r="1.4" fill="#fff"/></svg>`
  }
  el.addEventListener("click", (e) => {
    e.stopPropagation()
    onClick()
  })
  return el
}

export function DistrictMap({
  districtId,
  onBack,
  onSelectPlace,
}: {
  districtId: string
  onBack: () => void
  onSelectPlace: (place: Place) => void
}) {
  const { places, districtOf, data, d, resolveGeo } = useStore()
  const lang = data.settings.lang
  const [filter, setFilter] = useState<Category | "all">("all")
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading")
  const [resolving, setResolving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const kakaoRef = useRef<KakaoNamespace | null>(null)
  const mapRef = useRef<KakaoMap | null>(null)
  const overlaysRef = useRef<{ setMap: (m: unknown) => void }[]>([])

  const district = DISTRICTS.find((x) => x.id === districtId)
  const isUnlocated = districtId === UNLOCATED

  const inDistrict = useMemo(
    () =>
      places.filter((p) =>
        isUnlocated ? districtOf(p) === null : districtOf(p) === districtId,
      ),
    [places, districtOf, districtId, isUnlocated],
  )
  const shown = useMemo(
    () => (filter === "all" ? inDistrict : inDistrict.filter((p) => p.category === filter)),
    [inDistrict, filter],
  )
  const visitedCount = inDistrict.filter((p) => data.visits[p.id]).length

  // 좌표가 없는 장소를 순차 조회 (동시 요청을 피해 카카오 쿼터를 아낀다)
  useEffect(() => {
    let alive = true
    const missing = inDistrict.filter((p) => !data.geo[p.id])
    if (!missing.length) return
    setResolving(true)
    ;(async () => {
      for (const p of missing) {
        if (!alive) return
        await resolveGeo(p)
        await new Promise((r) => setTimeout(r, 120))
      }
      if (alive) setResolving(false)
    })()
    return () => {
      alive = false
      setResolving(false)
    }
    // data.geo를 의존성에 넣으면 조회마다 재실행되므로 목록·구가 바뀔 때만 돈다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtId, inDistrict.length])

  // 지도 생성 (미확인 목록에서는 지도를 띄우지 않는다)
  useEffect(() => {
    if (isUnlocated) return
    let alive = true
    loadKakao()
      .then((kakao) => {
        if (!alive || !containerRef.current) return
        kakaoRef.current = kakao
        const center = new kakao.maps.LatLng(district?.lat ?? 35.16, district?.lng ?? 129.06)
        mapRef.current = new kakao.maps.Map(containerRef.current, {
          center,
          level: 6,
        })
        setMapState("ready")
      })
      .catch(() => {
        if (alive) setMapState("error")
      })
    return () => {
      alive = false
    }
  }, [districtId, isUnlocated, district?.lat, district?.lng])

  // 마커 갱신
  useEffect(() => {
    const kakao = kakaoRef.current
    const map = mapRef.current
    if (mapState !== "ready" || !kakao || !map) return

    overlaysRef.current.forEach((o) => o.setMap(null))
    overlaysRef.current = []

    const bounds = new kakao.maps.LatLngBounds()
    let any = false

    for (const place of shown) {
      const geo = data.geo[place.id]
      if (!geo) continue
      const pos = new kakao.maps.LatLng(geo.lat, geo.lng)
      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: markerElement(place, Boolean(data.visits[place.id]), () =>
          onSelectPlace(place),
        ),
        yAnchor: 0.5,
        clickable: true,
      })
      overlay.setMap(map)
      overlaysRef.current.push(overlay as unknown as { setMap: (m: unknown) => void })
      bounds.extend(pos)
      any = true
    }

    // 마커가 모두 보이도록 범위를 맞추되, 위(헤더)·아래(목록 시트)에 여백을 준다
    if (any && !bounds.isEmpty()) map.setBounds(bounds, 90, 40, 200, 40)

    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null))
      overlaysRef.current = []
    }
  }, [mapState, shown, data.geo, data.visits, onSelectPlace])

  const title = isUnlocated ? d.unlocated : districtName(district, lang)

  return (
    <div className="relative flex h-svh flex-col bg-map-land">
      {/* 지도 영역 */}
      {!isUnlocated && (
        <div className="absolute inset-0">
          <div ref={containerRef} className="h-full w-full" />
          {mapState !== "ready" && (
            /* 아래 목록 시트에 가리지 않도록 위쪽 영역에서 가운데 맞춤 */
            <div className="absolute inset-0 flex items-center justify-center bg-map-land px-8 pb-[42vh] text-center">
              {mapState === "loading" ? (
                <p className="text-[13px] text-ink-3">{d.mapLoading}</p>
              ) : (
                <div>
                  <p className="text-[15px] font-bold">{d.mapKeyMissing}</p>
                  <p className="mt-2 text-[12.5px] leading-[1.6] text-ink-2">
                    {d.mapKeyMissingDesc}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 상단 바 */}
      <div className="safe-t relative z-10 flex flex-col gap-2.5 px-4">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2.5 shadow-[0_2px_8px_rgba(23,38,59,0.06)]">
          <button onClick={onBack} aria-label={d.back} className="press -ml-1 p-1">
            <ChevronLeft size={17} strokeWidth={1.8} />
          </button>
          <b className="text-[14px] font-bold">{title}</b>
          <span className="tnum ml-auto rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-bold text-accent">
            {visitedCount} / {inDistrict.length}
          </span>
        </div>

        {inDistrict.length > 0 && (
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>
              {d.catAll}
            </Chip>
            {CATEGORY_IDS.map((c) => (
              <Chip
                key={c}
                active={filter === c}
                color={CATEGORY_COLOR[c]}
                onClick={() => setFilter(c)}
              >
                <span className="flex items-center gap-1.5">
                  {filter !== c && <CategoryDot category={c} size={7} />}
                  {categoryLabel(c, d)}
                </span>
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* 목록 — 지도가 없거나(미확인/오류) 좌표를 못 찾은 장소를 위한 접근 경로 */}
      <div className="relative z-10 mt-auto">
        {shown.length === 0 ? (
          <p className="px-6 pb-8 text-center text-[13px] text-ink-3">{d.noPlacesHere}</p>
        ) : (
          <div className="max-h-[46vh] overflow-y-auto overscroll-contain rounded-t-[20px] border-t border-line bg-card px-4 pt-3 pb-[76px] shadow-[0_-8px_24px_var(--sheet-shadow)]">
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-line" />
            {resolving && (
              <p className="pb-2 text-center text-[11.5px] text-ink-3">{d.mapLoading}</p>
            )}
            <ul className="flex flex-col gap-1">
              {shown.map((place) => {
                const visited = Boolean(data.visits[place.id])
                const geo = data.geo[place.id]
                return (
                  <li key={place.id}>
                    <button
                      onClick={() => onSelectPlace(place)}
                      className="press flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left"
                    >
                      <CategoryTag
                        category={place.category}
                        label={categoryLabel(place.category, d)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-bold">
                          {place.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-2">
                          <span>{transitIcon(place.transit)}</span>
                          <span className="truncate">
                            {visited ? d.visited : d.notVisited}
                            {!geo && ` · ${d.unlocated}`}
                          </span>
                        </span>
                      </span>
                      {!geo && <MapPin size={14} className="shrink-0 text-ink-4" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
