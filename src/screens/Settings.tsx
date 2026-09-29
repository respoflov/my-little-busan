// 설정 탭: 테마·언어·데이터 백업·설치 안내·라이선스·버전
import { useEffect, useRef, useState, type RefObject } from "react"
import { ChevronRight, RotateCcw, TriangleAlert } from "lucide-react"
import { Group, Row, ScreenHeader, Segmented, Toast } from "@/components/bits"
import { Portal } from "@/components/Portal"
import { useStore } from "@/lib/store"
import { todayISO } from "@/lib/utils"
import { countPhotos } from "@/lib/photos"
import { APP_VERSION } from "@/lib/config"
import { PLACES } from "@/data/places"
import { formatDate } from "@/lib/i18n"
import type { Lang, StampSort, ThemeMode } from "@/lib/types"

// 열려 있는 안내 팝업 종류
type InfoKey = "install" | "source" | "license" | null

// 설정 화면 본체
export function SettingsScreen({
  startDateRef,
}: {
  startDateRef?: RefObject<HTMLInputElement | null>
}) {
  const { d, data, setSettings, resetAll, restoreDefaults, importAll, exportAll } = useStore()
  const lang = data.settings.lang
  const [photoCount, setPhotoCount] = useState<number | null>(null)
  const [info, setInfo] = useState<InfoKey>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    countPhotos().then(setPhotoCount)
  }, [data.visits])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2000)
    return () => window.clearTimeout(t)
  }, [toast])

  const doExport = () => {
    const blob = new Blob([exportAll()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `my-little-busan-${todayISO()}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const doImport = async (file: File | undefined) => {
    if (!file) return
    const text = await file.text()
    setToast(importAll(text) ? d.importDone : d.importFailed)
    if (fileRef.current) fileRef.current.value = ""
  }

  const doReset = async () => {
    setConfirmReset(false)
    await resetAll()
    setToast(d.resetDone)
  }

  const infoTitle =
    info === "install" ? d.howToInstall : info === "source" ? d.dataSource : d.licenses

  return (
    <div className="safe-t px-5 pb-[92px]">
      <ScreenHeader title={d.settings} />

      <Group label={d.grpDisplay}>
        <Row>
          {d.theme}
          <span className="ml-auto">
            <Segmented<ThemeMode>
              value={data.settings.theme}
              onChange={(theme) => setSettings({ theme })}
              size="sm"
              options={[
                { value: "light", label: d.themeLight },
                { value: "system", label: d.themeSystem },
                { value: "dark", label: d.themeDark },
              ]}
            />
          </span>
        </Row>
        <Row>
          {d.language}
          <span className="ml-auto">
            <Segmented<Lang>
              value={data.settings.lang}
              onChange={(l) => setSettings({ lang: l })}
              size="sm"
              options={[
                { value: "ko", label: "한국어" },
                { value: "en", label: "English" },
              ]}
            />
          </span>
        </Row>
      </Group>

      <Group label={d.grpStampbook}>
        <Row>
          {d.startDate}
          <label className="ml-auto flex items-center">
            <input
              ref={startDateRef}
              type="date"
              max={todayISO()}
              value={data.settings.startDate ?? ""}
              onChange={(e) => setSettings({ startDate: e.target.value || null })}
              aria-label={d.startDate}
              className="tnum bg-transparent text-right text-[12.5px] text-ink-3 focus:outline-none"
            />
          </label>
        </Row>
        <Row>
          {d.defaultSort}
          <span className="ml-auto">
            <Segmented<StampSort>
              value={data.settings.stampSort}
              onChange={(stampSort) => setSettings({ stampSort })}
              size="sm"
              options={[
                { value: "registered", label: d.sortRegistered },
                { value: "name", label: d.sortName },
              ]}
            />
          </span>
        </Row>
      </Group>

      <Group label={d.grpData}>
        <Row onClick={doExport}>
          {d.exportData}
          <span className="ml-auto text-[12.5px] text-ink-3">JSON</span>
          <ChevronRight size={15} className="text-ink-3" />
        </Row>
        <Row onClick={() => fileRef.current?.click()}>
          {d.importData}
          <ChevronRight size={15} className="ml-auto text-ink-3" />
        </Row>
        <Row>
          {d.storageUsed}
          <span className="tnum ml-auto text-[12.5px] text-ink-3">
            {photoCount == null ? "…" : d.photosN(photoCount)}
          </span>
        </Row>
        {data.settings.defaultsCleared && (
          <Row
            onClick={() => {
              restoreDefaults()
              setToast(d.restoreDone)
            }}
          >
            <RotateCcw size={15} className="text-ink-3" />
            {d.restoreDefaults}
            <span className="tnum ml-auto text-[12.5px] text-ink-3">{PLACES.length}</span>
            <ChevronRight size={15} className="text-ink-3" />
          </Row>
        )}
        <Row onClick={() => setConfirmReset(true)} danger>
          {d.resetData}
          <ChevronRight size={15} className="ml-auto" />
        </Row>
      </Group>

      <Group label={d.grpInfo}>
        <Row onClick={() => setInfo("install")}>
          {d.howToInstall}
          <ChevronRight size={15} className="ml-auto text-ink-3" />
        </Row>
        <Row onClick={() => setInfo("source")}>
          {d.dataSource}
          <ChevronRight size={15} className="ml-auto text-ink-3" />
        </Row>
        <Row onClick={() => setInfo("license")}>
          {d.licenses}
          <ChevronRight size={15} className="ml-auto text-ink-3" />
        </Row>
        <Row>
          {d.version}
          <span className="tnum ml-auto text-[12.5px] text-ink-3">{APP_VERSION}</span>
        </Row>
      </Group>

      <p className="mt-6 text-center text-[9.5px] font-semibold tracking-[0.32em] text-ink-4">
        RESPOFLOV
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => void doImport(e.target.files?.[0])}
      />

      {/* 안내 시트 */}
      {info && (
        <Portal>
          <div
            className="anim-dim fixed inset-0 z-50 flex items-end bg-[rgba(23,38,59,0.32)]"
            onClick={() => setInfo(null)}
          >
            <div
              className="anim-sheet max-h-[82vh] w-full overflow-y-auto rounded-t-[24px] bg-card px-[22px] pt-5 pb-[max(30px,env(safe-area-inset-bottom))]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-[16px] font-bold">{infoTitle}</h2>

              {info === "install" ? (
                <div className="mt-3 flex flex-col gap-4">
                  {d.installSections.map((section) => (
                    <section key={section.title}>
                      <h3 className="text-[13px] font-bold">{section.title}</h3>
                      <ul className="mt-1.5 flex flex-col gap-1.5">
                        {section.steps.map((step) => (
                          <li
                            key={step}
                            className="flex gap-2 text-[12.5px] leading-[1.55] text-ink-2"
                          >
                            <span aria-hidden className="text-ink-3">
                              •
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              ) : (
                <p className="mt-2.5 text-[13px] leading-[1.65] text-ink-2">
                  {info === "source" ? d.sourceGuide : d.licenseGuide}
                </p>
              )}

              {info === "source" && data.settings.startDate && (
                <p className="mt-2 text-[11.5px] text-ink-3">
                  {d.collectingSince(formatDate(data.settings.startDate, lang))}
                </p>
              )}

              <button
                onClick={() => setInfo(null)}
                className="press mt-4 w-full rounded-xl border border-line py-3 text-[14px] font-bold"
              >
                {d.close}
              </button>
            </div>
          </div>
        </Portal>
      )}

      {/* 초기화 경고 */}
      {confirmReset && (
        <Portal>
          <div
            className="anim-dim fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,38,59,0.42)] p-6"
            onClick={() => setConfirmReset(false)}
          >
            <div
              className="anim-fade-up w-full max-w-[340px] rounded-[20px] bg-card p-[24px_22px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.35)]"
              role="alertdialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-accent">
                <TriangleAlert size={18} />
                <h2 className="text-[16px] font-bold">{d.resetTitle}</h2>
              </div>
              <p className="mt-2.5 text-[13px] leading-[1.6] text-ink-2">{d.resetBody}</p>
              <p className="mt-2.5 rounded-[10px] bg-sand px-3 py-2.5 text-[11.5px] leading-[1.55] text-ink-3">
                {d.resetNote(PLACES.length)}
              </p>
              <button
                onClick={() => void doReset()}
                className="press mt-4 w-full rounded-xl bg-accent py-3.5 text-[14.5px] font-bold text-sand shadow-[0_6px_16px_-6px_var(--accent-shadow)]"
              >
                {d.resetGo}
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="press mt-2 w-full rounded-xl border border-line py-3 text-[14px] font-bold"
              >
                {d.cancel}
              </button>
            </div>
          </div>
        </Portal>
      )}

      {toast && <Toast message={toast} />}
    </div>
  )
}
