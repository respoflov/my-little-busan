import { KAKAO_JS_KEY } from "./config"
import { DISTRICTS } from "@/data/districts"
import type { GeoInfo } from "./types"

/* 카카오 SDK는 전역(window.kakao)으로 들어온다. 쓰는 부분만 최소로 타입을 적어둔다. */
declare global {
  interface Window {
    kakao?: KakaoNamespace
  }
}

export interface KakaoLatLng {
  getLat(): number
  getLng(): number
}
interface KakaoMapInstance {
  setCenter(latlng: KakaoLatLng): void
  setLevel(level: number, opts?: { animate?: boolean }): void
  relayout(): void
}
interface KakaoMarker {
  setMap(map: KakaoMapInstance | null): void
}
interface KakaoCustomOverlay {
  setMap(map: KakaoMapInstance | null): void
}
interface KakaoPlacesResult {
  place_name: string
  address_name: string
  road_address_name: string
  x: string
  y: string
}
export interface KakaoNamespace {
  maps: {
    load(cb: () => void): void
    LatLng: new (lat: number, lng: number) => KakaoLatLng
    LatLngBounds: new () => {
      extend(ll: KakaoLatLng): void
      isEmpty(): boolean
    }
    Map: new (
      container: HTMLElement,
      opts: { center: KakaoLatLng; level: number; draggable?: boolean },
    ) => KakaoMapInstance & { setBounds(b: unknown, ...p: number[]): void }
    Marker: new (opts: { position: KakaoLatLng; map?: KakaoMapInstance }) => KakaoMarker
    CustomOverlay: new (opts: {
      position: KakaoLatLng
      content: HTMLElement | string
      yAnchor?: number
      xAnchor?: number
      clickable?: boolean
      zIndex?: number
    }) => KakaoCustomOverlay
    event: {
      addListener(target: unknown, type: string, handler: (...args: unknown[]) => void): void
    }
    services: {
      Places: new () => {
        keywordSearch(
          query: string,
          cb: (data: KakaoPlacesResult[], status: string) => void,
          opts?: { size?: number },
        ): void
      }
      Status: { OK: string; ZERO_RESULT: string; ERROR: string }
    }
  }
}

export type KakaoLoadState = "idle" | "loading" | "ready" | "error"

let loadPromise: Promise<KakaoNamespace> | null = null

/** SDK를 한 번만 로드한다. 실패 시 reject — 호출부에서 지도 없는 대체 화면을 띄운다. */
export function loadKakao(): Promise<KakaoNamespace> {
  if (loadPromise) return loadPromise

  loadPromise = new Promise<KakaoNamespace>((resolve, reject) => {
    if (window.kakao?.maps?.services) {
      resolve(window.kakao)
      return
    }
    if (!KAKAO_JS_KEY) {
      reject(new Error("KAKAO_JS_KEY_MISSING"))
      return
    }

    const script = document.createElement("script")
    script.async = true
    script.src =
      `https://dapi.kakao.com/v2/maps/sdk.js` +
      `?appkey=${encodeURIComponent(KAKAO_JS_KEY)}&libraries=services&autoload=false`

    const timer = window.setTimeout(() => reject(new Error("KAKAO_TIMEOUT")), 12000)

    script.onload = () => {
      const kakao = window.kakao
      if (!kakao?.maps) {
        window.clearTimeout(timer)
        reject(new Error("KAKAO_NOT_AVAILABLE"))
        return
      }
      kakao.maps.load(() => {
        window.clearTimeout(timer)
        if (kakao.maps.services) resolve(kakao)
        else reject(new Error("KAKAO_SERVICES_MISSING"))
      })
    }
    script.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error("KAKAO_SCRIPT_ERROR"))
    }
    document.head.appendChild(script)
  })

  // 실패한 로드는 캐시하지 않는다 — 네트워크 복구 후 재시도할 수 있게
  loadPromise.catch(() => {
    loadPromise = null
  })

  return loadPromise
}

/** 카카오 주소 문자열("부산 영도구 …")에서 구·군 id를 찾는다. */
export function districtFromAddress(address: string): string | null {
  if (!address) return null
  for (const d of DISTRICTS) {
    if (address.includes(d.name)) return d.id
  }
  return null
}

/**
 * 장소명으로 좌표를 찾는다. 부산 밖 결과가 섞이지 않도록 "부산"을 붙여 검색하고,
 * 주소에 '부산'이 포함된 결과만 채택한다.
 */
export async function searchPlace(
  name: string,
  districtName?: string,
): Promise<GeoInfo | null> {
  let kakao: KakaoNamespace
  try {
    kakao = await loadKakao()
  } catch {
    return null
  }

  const queries = districtName
    ? [`부산 ${districtName} ${name}`, `부산 ${name}`]
    : [`부산 ${name}`]

  for (const q of queries) {
    const found = await new Promise<GeoInfo | null>((resolve) => {
      const places = new kakao.maps.services.Places()
      places.keywordSearch(
        q,
        (data, status) => {
          if (status !== kakao.maps.services.Status.OK || !data.length) {
            resolve(null)
            return
          }
          const hit = data.find((r) =>
            (r.road_address_name || r.address_name || "").startsWith("부산"),
          )
          if (!hit) {
            resolve(null)
            return
          }
          const address = hit.road_address_name || hit.address_name
          resolve({
            lat: Number(hit.y),
            lng: Number(hit.x),
            address,
            district: districtFromAddress(hit.address_name || address),
            at: new Date().toISOString(),
          })
        },
        { size: 5 },
      )
    })
    if (found) return found
  }
  return null
}

/** 카카오맵 앱/웹에서 장소 검색 결과를 여는 링크 */
export function kakaoMapLink(name: string): string {
  return `https://map.kakao.com/link/search/${encodeURIComponent(name)}`
}
