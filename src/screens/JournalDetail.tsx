// 기록 상세 화면: 사진·메모·동행·이동수단과 공유 카드 만들기
import { useEffect, useState } from "react"
import { ChevronLeft, Map as MapIcon, Pencil, Share } from "lucide-react"
import { PhotoImg } from "@/components/PhotoImg"
import { Stamp } from "@/components/Stamp"
import { CategoryTag, Toast } from "@/components/bits"
import { useStore } from "@/lib/store"
import { stampRotation } from "@/lib/utils"
import { renderShareCard, shareOrDownload } from "@/lib/shareCard"
import { categoryLabel, formatDate, transitIcon, transitLabel } from "@/lib/i18n"

/** 기록 상세 — 사진 캐러셀 + 메타 + 메모 전문 */
export function JournalDetail({
  placeId,
  onBack,
  onEdit,
  onShowOnMap,
}: {
  placeId: string
  onBack: () => void
  onEdit: () => void
  onShowOnMap: () => void
}) {
  const { placeById, visitOf, d, data } = useStore()
  const lang = data.settings.lang
  const place = placeById(placeId)
  const visit = visitOf(placeId)
  const [index, setIndex] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(t)
  }, [toast])

  if (!place || !visit) return null

  const rotation = visit.rotation ?? stampRotation(place.id)
  const duration =
    visit.startTime && visit.endTime
      ? (() => {
          const [sh, sm] = visit.startTime.split(":").map(Number)
          const [eh, em] = visit.endTime.split(":").map(Number)
          let diff = eh * 60 + em - (sh * 60 + sm)
          if (diff < 0) diff += 24 * 60
          return diff
        })()
      : null

  const handleShare = async () => {
    setBusy(true)
    setToast(d.sharing)
    try {
      const dark = document.documentElement.classList.contains("dark")
      const blob = await renderShareCard(place, visit, d, lang, dark)
      if (blob) await shareOrDownload(blob, `${place.name}.png`)
    } catch {
      setToast(d.importFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-svh bg-sand pb-[92px]">
      <div className="relative">
        {visit.photos.length > 0 ? (
          <>
            <div
              className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
              onScroll={(e) => {
                const el = e.currentTarget
                setIndex(Math.round(el.scrollLeft / el.clientWidth))
              }}
            >
              {visit.photos.map((key, i) => (
                <PhotoImg
                  key={key}
                  photoKey={key}
                  alt={`${place.name} ${i + 1}`}
                  className="h-60 w-full shrink-0 snap-center object-cover"
                />
              ))}
            </div>
            {visit.photos.length > 1 && (
              <>
                <div className="absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5">
                  {visit.photos.map((key, i) => (
                    <span
                      key={key}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i === index ? "bg-ink" : "bg-[rgba(23,38,59,0.25)]"
                      }`}
                    />
                  ))}
                </div>
                <span className="tnum absolute right-3 bottom-2.5 rounded-md bg-[rgba(23,38,59,0.72)] px-2 py-1 text-[10px] font-bold text-white">
                  {index + 1} / {visit.photos.length}
                </span>
              </>
            )}
          </>
        ) : (
          <div className="h-28 bg-map-sea" />
        )}

        <div className="safe-t absolute inset-x-0 top-0 flex justify-between px-4 pt-3">
          <button
            onClick={onBack}
            aria-label={d.back}
            className="press flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card/90 shadow-[0_2px_8px_rgba(23,38,59,0.1)] backdrop-blur"
          >
            <ChevronLeft size={16} strokeWidth={1.8} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              aria-label={d.editRecord}
              className="press flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card/90 shadow-[0_2px_8px_rgba(23,38,59,0.1)] backdrop-blur"
            >
              <Pencil size={15} strokeWidth={1.8} />
            </button>
            <button
              onClick={() => void handleShare()}
              disabled={busy}
              aria-label={d.shareImage}
              className="press flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card/90 shadow-[0_2px_8px_rgba(23,38,59,0.1)] backdrop-blur disabled:opacity-60"
            >
              <Share size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-[22px] pt-[18px]">
        <div className="flex items-center gap-2.5">
          <CategoryTag category={place.category} label={categoryLabel(place.category, d)} />
          <h1 className="min-w-0 flex-1 truncate text-[21px] font-bold tracking-[-0.02em]">
            {place.name}
          </h1>
          <Stamp category={place.category} size={44} rotation={rotation} className="shrink-0" />
        </div>

        <dl className="mt-3.5 overflow-hidden rounded-[14px] border border-line bg-card">
          <div className="flex items-center gap-2.5 border-b border-line-soft px-4 py-3">
            <dt className="w-11 shrink-0 text-[11.5px] font-semibold text-ink-3">
              {d.visitDate}
            </dt>
            <dd className="tnum text-[13px] font-medium">{formatDate(visit.date, lang)}</dd>
          </div>
          {visit.companions.length > 0 && (
            <div className="flex items-center gap-2.5 border-b border-line-soft px-4 py-3">
              <dt className="w-11 shrink-0 text-[11.5px] font-semibold text-ink-3">
                {d.withWhom}
              </dt>
              <dd className="text-[13px] font-medium">{visit.companions.join(", ")}</dd>
            </div>
          )}
          {(visit.transport || duration != null) && (
            <div className="flex items-center gap-2.5 px-4 py-3">
              <dt className="w-11 shrink-0 text-[11.5px] font-semibold text-ink-3">
                {d.howCome}
              </dt>
              <dd className="tnum text-[13px] font-medium">
                {visit.transport &&
                  `${transitIcon(visit.transport)} ${transitLabel(visit.transport, d)}`}
                {visit.startTime && visit.endTime && (
                  <>
                    {visit.transport && " · "}
                    {visit.startTime} → {visit.endTime}
                    {duration != null && ` (${d.duration(duration)})`}
                  </>
                )}
              </dd>
            </div>
          )}
        </dl>

        {visit.memo?.trim() && (
          <p className="mt-3 rounded-[14px] border border-line bg-card px-4 py-3.5 text-[13.5px] leading-[1.6]">
            &ldquo;{visit.memo.trim()}&rdquo;
          </p>
        )}

        <button
          onClick={onShowOnMap}
          className="press mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-card py-3 text-[13.5px] font-bold"
        >
          <MapIcon size={15} strokeWidth={1.7} />
          {d.viewOnMap}
        </button>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  )
}
