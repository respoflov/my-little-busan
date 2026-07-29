import type { AppData, Settings } from "./types"

const KEY = "my-little-busan/v1"
export const DATA_VERSION = 1

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  lang: "ko",
  stampSort: "registered",
  startDate: null,
  onboarded: false,
  defaultsCleared: false,
}

export function emptyData(): AppData {
  return {
    version: DATA_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    visits: {},
    customPlaces: [],
    geo: {},
  }
}

/** 저장된 데이터를 읽는다. 형태가 깨졌으면 조용히 기본값으로 되돌린다(앱이 죽지 않게). */
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as Partial<AppData>
    return {
      version: DATA_VERSION,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      visits: parsed.visits ?? {},
      customPlaces: parsed.customPlaces ?? [],
      geo: parsed.geo ?? {},
    }
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
    return true
  } catch {
    // 용량 초과 등 — 저장에 실패했음을 호출부가 알 수 있게 false 반환
    return false
  }
}

export function clearData() {
  localStorage.removeItem(KEY)
}
