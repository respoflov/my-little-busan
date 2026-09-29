// 장소 카테고리 (문화·카페·맛집·산책)
export type Category = "culture" | "cafe" | "food" | "walk"

/** 주 이동수단 — 장소 데이터의 권장 교통(places), 기록의 실제 이동수단(visit)에 함께 쓰임 */
export type Transit = "subway" | "bus" | "car" | "walk" | "unknown"

// 장소 한 곳의 정보
export interface Place {
  id: string
  name: string
  category: Category
  /** 한 줄 소개 */
  desc: string
  /** 행정구역 id (districts.ts). 미확인 장소는 null — 좌표 조회 성공 시 자동 배정 */
  district: string | null
  /** 권장 교통수단 */
  transit: Transit
  /** 교통 상세 안내 */
  transitNote: string
  /** 위치·상호 확인이 특히 필요한 곳 (초안 조사분) */
  needsCheck?: boolean
  /** 사용자가 직접 추가한 장소 */
  userAdded?: boolean
  /** 사용자 추가 시 직접 입력한 좌표 */
  lat?: number
  lng?: number
}

/** 카카오 장소검색으로 확인된 좌표·주소 (조회 후 캐시) */
export interface GeoInfo {
  lat: number
  lng: number
  address: string
  district: string | null
  /** 조회 시각 (ISO) */
  at: string
}

// 방문 기록 (도장 한 개)
export interface Visit {
  placeId: string
  /** 방문일 YYYY-MM-DD */
  date: string
  /** 동행 (혼자/연인/친구/가족/직접 입력) */
  companions: string[]
  /** 실제 이동수단 */
  transport?: Transit | string
  /** HH:MM */
  startTime?: string
  endTime?: string
  memo?: string
  /** IndexedDB 사진 키 목록 */
  photos: string[]
  /** 도장 기울기(deg) — 장소마다 고정되도록 저장 */
  rotation: number
  /** 기록 생성 시각 (ISO) */
  createdAt: string
}

// 테마·언어·도장북 정렬 설정 값
export type ThemeMode = "light" | "dark" | "system"
export type Lang = "ko" | "en"
export type StampSort = "registered" | "name"

// 사용자 설정
export interface Settings {
  theme: ThemeMode
  lang: Lang
  stampSort: StampSort
  /** 스탬프북 수집 시작일 YYYY-MM-DD. null이면 온보딩 미완료 */
  startDate: string | null
  /** 온보딩을 본 적 있는지 (건너뛰기 포함) */
  onboarded: boolean
  /** 초기화로 기본 장소를 비운 상태 — 내가 고른 장소로만 채우고 싶을 때 */
  defaultsCleared: boolean
}

// localStorage에 저장하는 앱 데이터 전체
export interface AppData {
  version: number
  settings: Settings
  visits: Record<string, Visit>
  customPlaces: Place[]
  geo: Record<string, GeoInfo>
}

export const CATEGORY_IDS: Category[] = ["culture", "cafe", "food", "walk"]

export const CATEGORY_COLOR: Record<Category, string> = {
  culture: "var(--c-culture)",
  cafe: "var(--c-cafe)",
  food: "var(--c-food)",
  walk: "var(--c-walk)",
}
