// 앱 전역 상태(React Context): 데이터와 그 데이터를 바꾸는 함수들을 모든 화면에 제공한다
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { PLACES } from "@/data/places"
import { DISTRICTS } from "@/data/districts"
import { loadData, saveData, clearData, DATA_VERSION } from "./storage"
import { clearPhotos, deletePhoto } from "./photos"
import { searchPlace } from "./kakao"
import { t, type Dict } from "./i18n"
import type { AppData, GeoInfo, Place, Settings, Visit } from "./types"

// 화면에 제공하는 상태와 동작 목록
interface Store {
  data: AppData
  d: Dict
  places: Place[]
  /** 좌표·주소가 확인되면 district가 보정된 장소 목록 */
  placeById: (id: string) => Place | undefined
  districtOf: (place: Place) => string | null
  visitOf: (placeId: string) => Visit | undefined
  visitCount: number

  setSettings: (patch: Partial<Settings>) => void
  saveVisit: (visit: Visit) => void
  deleteVisit: (placeId: string) => void
  addCustomPlace: (place: Omit<Place, "id" | "userAdded">) => Place
  deleteCustomPlace: (id: string) => void
  setGeo: (placeId: string, geo: GeoInfo) => void
  resolveGeo: (place: Place) => Promise<GeoInfo | null>
  resetAll: () => Promise<void>
  restoreDefaults: () => void
  importAll: (raw: string) => boolean
  exportAll: () => string
}

const Ctx = createContext<Store | null>(null)

// 전역 상태를 만들고 변경될 때마다 저장하는 Provider
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())

  // 변경될 때마다 저장 (동기 저장이라 별도 디바운스는 두지 않음 — 데이터가 작음)
  useEffect(() => {
    saveData(data)
  }, [data])

  // 테마 적용: system이면 OS 설정을 따라가고, 바뀌면 즉시 반영
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      const dark =
        data.settings.theme === "dark" || (data.settings.theme === "system" && mq.matches)
      document.documentElement.classList.toggle("dark", dark)
      const meta = document.querySelector('meta[name="theme-color"]:not([media])')
      if (meta) meta.setAttribute("content", dark ? "#0F1726" : "#FAF8F4")
    }
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [data.settings.theme])

  useEffect(() => {
    document.documentElement.lang = data.settings.lang
  }, [data.settings.lang])

  const d = useMemo(() => t(data.settings.lang), [data.settings.lang])

  // 초기화로 기본 장소를 비웠다면 내가 추가한 장소만 남는다
  const places = useMemo(
    () =>
      data.settings.defaultsCleared ? data.customPlaces : [...PLACES, ...data.customPlaces],
    [data.customPlaces, data.settings.defaultsCleared],
  )

  const placeById = useCallback((id: string) => places.find((p) => p.id === id), [places])

  /** 정적 힌트보다 좌표 조회로 확인된 구를 우선한다 */
  const districtOf = useCallback(
    (place: Place) => data.geo[place.id]?.district ?? place.district,
    [data.geo],
  )

  const visitOf = useCallback((placeId: string) => data.visits[placeId], [data.visits])

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }, [])

  const saveVisit = useCallback((visit: Visit) => {
    setData((prev) => ({
      ...prev,
      visits: { ...prev.visits, [visit.placeId]: visit },
    }))
  }, [])

  const deleteVisit = useCallback(
    (placeId: string) => {
      // 사진 삭제는 상태 갱신 함수 밖에서 — 업데이터는 순수하게 유지한다
      data.visits[placeId]?.photos.forEach((key) => void deletePhoto(key))
      setData((prev) => {
        const visits = { ...prev.visits }
        delete visits[placeId]
        return { ...prev, visits }
      })
    },
    [data.visits],
  )

  const addCustomPlace = useCallback((input: Omit<Place, "id" | "userAdded">) => {
    const place: Place = {
      ...input,
      id: `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      userAdded: true,
    }
    setData((prev) => ({
      ...prev,
      customPlaces: [...prev.customPlaces, place],
    }))
    return place
  }, [])

  const deleteCustomPlace = useCallback(
    (id: string) => {
      data.visits[id]?.photos.forEach((key) => void deletePhoto(key))
      setData((prev) => {
        const visits = { ...prev.visits }
        delete visits[id]
        const geo = { ...prev.geo }
        delete geo[id]
        return {
          ...prev,
          customPlaces: prev.customPlaces.filter((p) => p.id !== id),
          visits,
          geo,
        }
      })
    },
    [data.visits],
  )

  const setGeo = useCallback((placeId: string, geo: GeoInfo) => {
    setData((prev) => ({ ...prev, geo: { ...prev.geo, [placeId]: geo } }))
  }, [])

  /** 좌표를 이미 알면 그대로 쓰고, 없으면 카카오 장소검색으로 찾아 캐시한다. */
  const resolveGeo = useCallback(
    async (place: Place): Promise<GeoInfo | null> => {
      const cached = data.geo[place.id]
      if (cached) return cached

      if (place.lat != null && place.lng != null) {
        const geo: GeoInfo = {
          lat: place.lat,
          lng: place.lng,
          address: "",
          district: place.district,
          at: new Date().toISOString(),
        }
        setGeo(place.id, geo)
        return geo
      }

      const hint = DISTRICTS.find((x) => x.id === place.district)?.name
      const found = await searchPlace(place.name, hint)
      if (found) setGeo(place.id, found)
      return found
    },
    [data.geo, setGeo],
  )

  /**
   * 모든 기록 초기화 — 방문·사진·추가한 장소에 더해 기본 장소까지 비운다.
   * 수집 시작일도 지워서 다음 진입에 온보딩이 다시 뜬다.
   * 화면 설정(테마·언어)은 기록이 아니므로 유지한다.
   */
  const resetAll = useCallback(async () => {
    await clearPhotos()
    clearData()
    setData((prev) => ({
      version: DATA_VERSION,
      settings: {
        ...prev.settings,
        startDate: null,
        onboarded: false,
        defaultsCleared: true,
      },
      visits: {},
      customPlaces: [],
      geo: {},
    }))
  }, [])

  /** 비웠던 기본 장소를 다시 불러온다 (기록은 그대로) */
  const restoreDefaults = useCallback(() => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, defaultsCleared: false },
    }))
  }, [])

  const exportAll = useCallback(() => JSON.stringify(data, null, 2), [data])

  const importAll = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw) as Partial<AppData>
      if (!parsed || typeof parsed !== "object" || !parsed.visits) return false
      setData((prev) => ({
        version: DATA_VERSION,
        settings: { ...prev.settings, ...(parsed.settings ?? {}) },
        visits: parsed.visits ?? {},
        customPlaces: parsed.customPlaces ?? [],
        geo: parsed.geo ?? {},
      }))
      return true
    } catch {
      return false
    }
  }, [])

  const value = useMemo<Store>(
    () => ({
      data,
      d,
      places,
      placeById,
      districtOf,
      visitOf,
      visitCount: Object.keys(data.visits).length,
      setSettings,
      saveVisit,
      deleteVisit,
      addCustomPlace,
      deleteCustomPlace,
      setGeo,
      resolveGeo,
      resetAll,
      restoreDefaults,
      importAll,
      exportAll,
    }),
    [
      data,
      d,
      places,
      placeById,
      districtOf,
      visitOf,
      setSettings,
      saveVisit,
      deleteVisit,
      addCustomPlace,
      deleteCustomPlace,
      setGeo,
      resolveGeo,
      resetAll,
      restoreDefaults,
      importAll,
      exportAll,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// 화면에서 전역 상태를 꺼내 쓰는 훅
export function useStore(): Store {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useStore must be used inside StoreProvider")
  return ctx
}
