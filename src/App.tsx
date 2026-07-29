import { useCallback, useRef, useState } from "react"
import { Splash } from "@/components/Splash"
import { Onboarding } from "@/components/Onboarding"
import { TabBar, type Tab } from "@/components/TabBar"
import { MapOverview } from "@/screens/MapOverview"
import { DistrictMap } from "@/screens/DistrictMap"
import { PlaceSheet } from "@/screens/PlaceSheet"
import { Stampbook } from "@/screens/Stampbook"
import { Journal } from "@/screens/Journal"
import { JournalDetail } from "@/screens/JournalDetail"
import { AddPlace } from "@/screens/AddPlace"
import { SettingsScreen } from "@/screens/Settings"
import { useStore } from "@/lib/store"
import { todayISO } from "@/lib/utils"
import type { Place } from "@/lib/types"

export default function App() {
  const { d, data, setSettings, districtOf, placeById } = useStore()
  const [splashDone, setSplashDone] = useState(false)
  const [tab, setTab] = useState<Tab>("map")
  const [district, setDistrict] = useState<string | null>(null)
  const [sheetPlace, setSheetPlace] = useState<Place | null>(null)
  const [journalId, setJournalId] = useState<string | null>(null)
  const startDateRef = useRef<HTMLInputElement | null>(null)

  const showOnboarding = splashDone && !data.settings.onboarded

  const goTab = useCallback((next: Tab) => {
    setTab(next)
    setJournalId(null)
    if (next !== "map") setDistrict(null)
  }, [])

  /** 스탬프북에서 시작일을 고치려 할 때 — 설정으로 보내고 날짜 입력을 바로 연다 */
  const editStartDate = useCallback(() => {
    setTab("settings")
    window.setTimeout(() => {
      const el = startDateRef.current
      if (!el) return
      el.scrollIntoView({ block: "center", behavior: "smooth" })
      el.focus()
      ;(el as HTMLInputElement & { showPicker?: () => void }).showPicker?.()
    }, 120)
  }, [])

  /** 기록 상세 → 지도에서 보기 */
  const showOnMap = useCallback(
    (placeId: string) => {
      const place = placeById(placeId)
      setJournalId(null)
      setTab("map")
      setDistrict(place ? (districtOf(place) ?? "unlocated") : null)
    },
    [placeById, districtOf],
  )

  return (
    <div className="min-h-svh bg-sand">
      {/* 탭이 바뀔 때마다 새로 마운트되며 부드럽게 떠오른다 */}
      <div key={tab} className="anim-fade-up">
        {tab === "map" &&
          (district ? (
            <DistrictMap
              districtId={district}
              onBack={() => setDistrict(null)}
              onSelectPlace={setSheetPlace}
            />
          ) : (
            <MapOverview
              onSelectDistrict={setDistrict}
              onSelectUnlocated={() => setDistrict("unlocated")}
            />
          ))}

        {tab === "stampbook" && (
          <Stampbook onSelectPlace={setSheetPlace} onEditStartDate={editStartDate} />
        )}

        {tab === "add" && <AddPlace />}

        {tab === "journal" &&
          (journalId ? (
            <JournalDetail
              placeId={journalId}
              onBack={() => setJournalId(null)}
              onEdit={() => {
                const place = placeById(journalId)
                if (place) setSheetPlace(place)
              }}
              onShowOnMap={() => showOnMap(journalId)}
            />
          ) : (
            <Journal onOpen={setJournalId} />
          ))}

        {tab === "settings" && <SettingsScreen startDateRef={startDateRef} />}
      </div>

      <TabBar tab={tab} onChange={goTab} d={d} />

      <PlaceSheet place={sheetPlace} onClose={() => setSheetPlace(null)} />

      {showOnboarding && (
        <Onboarding
          d={d}
          onConfirm={(date) => setSettings({ startDate: date, onboarded: true })}
          onSkip={() =>
            setSettings({
              onboarded: true,
              startDate: data.settings.startDate ?? todayISO(),
            })
          }
        />
      )}

      {/* 스플래시는 앱 위에 덮여 있다가 서서히 걷히며 메인을 드러낸다 */}
      {!splashDone && <Splash d={d} onDone={() => setSplashDone(true)} />}
    </div>
  )
}
