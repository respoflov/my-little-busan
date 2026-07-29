import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  Share,
  Trash2,
  X,
} from "lucide-react"
import { DISTRICTS } from "@/data/districts"
import { Sheet } from "@/components/Sheet"
import { Badge, CategoryTag, Chip, Toast } from "@/components/bits"
import { Stamp } from "@/components/Stamp"
import { PhotoImg } from "@/components/PhotoImg"
import { useStore } from "@/lib/store"
import { stampRotation, todayISO } from "@/lib/utils"
import { addPhoto, deletePhoto } from "@/lib/photos"
import { kakaoMapLink } from "@/lib/kakao"
import { renderShareCard, shareOrDownload } from "@/lib/shareCard"
import {
  categoryLabel,
  companionOptions,
  districtName,
  transitIcon,
  transitLabel,
} from "@/lib/i18n"
import type { Place, Transit, Visit } from "@/lib/types"

const TRANSPORTS: Transit[] = ["subway", "bus", "car", "walk"]

function minutesBetween(start: string, end: string): number | null {
  if (!start || !end) return null
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null
  let diff = eh * 60 + em - (sh * 60 + sm)
  if (diff < 0) diff += 24 * 60 // 자정을 넘긴 경우
  return diff
}

export function PlaceSheet({ place, onClose }: { place: Place | null; onClose: () => void }) {
  const { d, data, visitOf, saveVisit, deleteVisit, districtOf } = useStore()
  const lang = data.settings.lang
  const existing = place ? visitOf(place.id) : undefined

  const [date, setDate] = useState(todayISO())
  const [companions, setCompanions] = useState<string[]>([])
  const [transport, setTransport] = useState<string | undefined>()
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [memo, setMemo] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [customOpen, setCustomOpen] = useState<null | "who" | "how">(null)
  const [customText, setCustomText] = useState("")
  const [justStamped, setJustStamped] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  /** 이번에 새로 올렸지만 아직 저장하지 않은 사진 — 취소 시 정리 */
  const pendingPhotos = useRef<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const memoRef = useRef<HTMLTextAreaElement>(null)

  const rotation = useMemo(
    () => existing?.rotation ?? (place ? stampRotation(place.id) : 0),
    [existing, place],
  )

  // 장소가 바뀌면 기존 기록으로 초기화
  useEffect(() => {
    if (!place) return
    const v = visitOf(place.id)
    setDate(v?.date ?? todayISO())
    setCompanions(v?.companions ?? [])
    setTransport(v?.transport)
    setStartTime(v?.startTime ?? "")
    setEndTime(v?.endTime ?? "")
    setMemo(v?.memo ?? "")
    setPhotos(v?.photos ?? [])
    pendingPhotos.current = []
    setJustStamped(false)
    setCustomOpen(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.id])

  // 메모 입력칸 자동 확장 — 한 줄로 시작해 내용만큼 늘어난다
  useEffect(() => {
    const el = memoRef.current
    if (!el) return
    el.style.height = "auto"
    // border-box라 테두리 두께(1px×2)를 더해야 스크롤바가 생기지 않는다
    el.style.height = `${el.scrollHeight + 2}px`
  }, [memo, place?.id])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(t)
  }, [toast])

  if (!place) return null

  const districtId = districtOf(place)
  const district = DISTRICTS.find((x) => x.id === districtId)
  const geo = data.geo[place.id]
  const duration = minutesBetween(startTime, endTime)

  const toggleCompanion = (name: string) =>
    setCompanions((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    )

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    try {
      for (const file of Array.from(files)) {
        const key = await addPhoto(file)
        pendingPhotos.current.push(key)
        setPhotos((prev) => [...prev, key])
      }
    } catch {
      setToast(d.importFailed)
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const removePhoto = (key: string) => {
    setPhotos((prev) => prev.filter((k) => k !== key))
    // 저장 전에 올린 사진만 즉시 지운다 (저장된 사진은 저장 시점에 정리)
    if (pendingPhotos.current.includes(key)) {
      pendingPhotos.current = pendingPhotos.current.filter((k) => k !== key)
      void deletePhoto(key)
    }
  }

  const commitVisit = () => {
    const visit: Visit = {
      placeId: place.id,
      date,
      companions,
      transport,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      memo: memo.trim() || undefined,
      photos,
      rotation,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    }
    // 기록에서 빠진 사진은 저장 시점에 정리
    existing?.photos.filter((k) => !photos.includes(k)).forEach((k) => void deletePhoto(k))
    pendingPhotos.current = []
    saveVisit(visit)
    if (!existing) setJustStamped(true)
    setToast(existing ? d.save : d.stamped)
  }

  const closeAndCleanup = () => {
    // 저장하지 않고 닫으면 이번에 올린 사진은 남기지 않는다
    pendingPhotos.current.forEach((k) => void deletePhoto(k))
    pendingPhotos.current = []
    onClose()
  }

  const handleShare = async () => {
    if (!existing) return
    setBusy(true)
    setToast(d.sharing)
    try {
      const dark = document.documentElement.classList.contains("dark")
      const blob = await renderShareCard(place, existing, d, lang, dark)
      if (blob) await shareOrDownload(blob, `${place.name}.png`)
    } catch {
      setToast(d.importFailed)
    } finally {
      setBusy(false)
    }
  }

  const addCustom = () => {
    const value = customText.trim()
    if (value) {
      if (customOpen === "who") toggleCompanion(value)
      else setTransport(value)
    }
    setCustomText("")
    setCustomOpen(null)
  }

  return (
    <>
      <Sheet open={Boolean(place)} onClose={closeAndCleanup} labelledBy="place-name">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <CategoryTag category={place.category} label={categoryLabel(place.category, d)} />
            <h2 id="place-name" className="mt-2.5 text-[21px] font-bold tracking-[-0.02em]">
              {place.name}
            </h2>
            {place.desc && (
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-ink-2">{place.desc}</p>
            )}
          </div>
          {existing && (
            <Stamp
              category={place.category}
              size={52}
              rotation={rotation}
              animate={justStamped}
              className="mt-1 shrink-0"
            />
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {district && (
            <Badge>
              <MapPin size={12} /> {districtName(district, lang)}
            </Badge>
          )}
          <Badge>
            {transitIcon(place.transit)} {transitLabel(place.transit, d)}
          </Badge>
          <a
            href={kakaoMapLink(place.name)}
            target="_blank"
            rel="noreferrer"
            className="press inline-flex items-center gap-1.5 rounded-lg border border-line-soft bg-sand px-2.5 py-1.5 text-[11.5px] font-semibold text-culture"
          >
            <ExternalLink size={12} /> {d.openKakao}
          </a>
        </div>

        {place.needsCheck && (
          <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-[1.5] text-ink-3">
            <AlertTriangle size={13} className="mt-px shrink-0" />
            {d.needsCheckNote}
          </p>
        )}
        {geo?.address && <p className="mt-1.5 text-[11.5px] text-ink-3">{geo.address}</p>}

        {/* 사진 */}
        <div className="no-scrollbar mt-3.5 flex gap-2 overflow-x-auto">
          {photos.map((key, i) => (
            <div key={key} className="relative shrink-0">
              <PhotoImg
                photoKey={key}
                alt={`${place.name} ${i + 1}`}
                className={`${i === 0 ? "h-[74px] w-[110px]" : "h-[74px] w-[74px]"} rounded-[10px] object-cover`}
              />
              <button
                onClick={() => removePhoto(key)}
                aria-label={d.delete}
                className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-sand shadow-sm"
              >
                <X size={12} strokeWidth={2.4} />
              </button>
            </div>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="press flex h-[74px] w-[74px] shrink-0 flex-col items-center justify-center gap-1 rounded-[10px] border-[1.5px] border-dashed border-line text-[10px] text-ink-3 disabled:opacity-50"
          >
            <Plus size={14} />
            {d.addPhoto}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </div>

        {/* 메모 */}
        <textarea
          ref={memoRef}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder={d.memoPlaceholder}
          rows={1}
          className="mt-2.5 w-full resize-none overflow-hidden rounded-[10px] border border-line-soft bg-sand px-3.5 py-2.5 text-[12.5px] leading-[1.6] placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />

        {/* 누구와 */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="w-[38px] shrink-0 text-[11.5px] font-semibold text-ink-3">
            {d.withWhom}
          </span>
          {[
            ...companionOptions(d),
            ...companions.filter((c) => !companionOptions(d).includes(c)),
          ].map((name) => (
            <Chip
              key={name}
              active={companions.includes(name)}
              onClick={() => toggleCompanion(name)}
            >
              {name}
            </Chip>
          ))}
          <Chip onClick={() => setCustomOpen("who")}>＋</Chip>
        </div>

        {/* 어떻게 */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="w-[38px] shrink-0 text-[11.5px] font-semibold text-ink-3">
            {d.howCome}
          </span>
          {TRANSPORTS.map((tr) => (
            <Chip key={tr} active={transport === tr} onClick={() => setTransport(tr)}>
              {transitIcon(tr)} {transitLabel(tr, d)}
            </Chip>
          ))}
          {transport && !TRANSPORTS.includes(transport as Transit) && (
            <Chip active onClick={() => setTransport(undefined)}>
              {transport}
            </Chip>
          )}
          <Chip onClick={() => setCustomOpen("how")}>＋</Chip>
        </div>

        {customOpen && (
          <div className="mt-2 flex gap-2">
            <input
              autoFocus
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder={d.custom}
              className="flex-1 rounded-[9px] border border-line bg-sand px-3 py-2 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
            <button
              onClick={addCustom}
              className="press rounded-[9px] bg-ink px-3.5 text-[12.5px] font-semibold text-sand"
            >
              {d.save}
            </button>
          </div>
        )}

        {/* 날짜·시간 */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-[9px] border border-line-soft bg-sand px-3 py-2.5">
          <span className="text-[11.5px] font-semibold text-ink-3">{d.visitDate}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="tnum bg-transparent text-[12.5px] font-semibold focus:outline-none"
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-[9px] border border-line-soft bg-sand px-3 py-2.5">
          <Clock size={13} className="shrink-0 text-ink-3" />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            aria-label={d.depart}
            className="tnum bg-transparent text-[12.5px] focus:outline-none"
          />
          <span className="text-ink-3">→</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            aria-label={d.arrive}
            className="tnum bg-transparent text-[12.5px] focus:outline-none"
          />
          <span className="tnum ml-auto text-[11.5px] text-ink-3">
            {duration != null ? d.duration(duration) : d.optional}
          </span>
        </div>

        {/* CTA */}
        <div className="mt-4 flex gap-2.5">
          <button
            onClick={commitVisit}
            disabled={busy}
            className="press flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-[15px] font-bold text-sand shadow-[0_6px_16px_-6px_var(--accent-shadow)] disabled:opacity-60"
          >
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
              <circle
                cx="9"
                cy="9"
                r="7.4"
                stroke="#fff"
                strokeWidth="1.8"
                strokeDasharray="3.4 2.6"
              />
              <path
                d="M5.5 9.6c1.2-1.4 2.4-1.4 3.5 0s2.3 1.4 3.5 0"
                stroke="#fff"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            {existing ? d.save : d.stampIt}
          </button>
          {existing && (
            <>
              <button
                onClick={() => void handleShare()}
                disabled={busy}
                aria-label={d.shareImage}
                className="press flex w-[50px] items-center justify-center rounded-xl border border-line bg-card disabled:opacity-60"
              >
                <Share size={18} strokeWidth={1.7} />
              </button>
              <button
                onClick={() => {
                  deleteVisit(place.id)
                  onClose()
                }}
                aria-label={d.removeStamp}
                className="press flex w-[50px] items-center justify-center rounded-xl border border-line bg-card text-ink-3"
              >
                <Trash2 size={17} strokeWidth={1.7} />
              </button>
            </>
          )}
        </div>
      </Sheet>

      {toast && <Toast message={toast} />}
    </>
  )
}
