/**
 * 카카오 JavaScript 앱 키 ("내 손안의 작은 부산" 키, 2026-07-29 발급).
 *
 * 이 키는 브라우저에 노출되는 것이 정상이며, 카카오 개발자 콘솔의
 * "JavaScript SDK 도메인"에 등록된 출처에서만 동작하도록 제한됩니다.
 * (REST API 키·네이티브 앱 키는 여기에 쓰지 않습니다.)
 *
 * 등록되어야 하는 도메인 — 경로는 제외하고 오리진만 등록합니다:
 *   - https://respoflov.github.io   (배포)
 *   - http://localhost:5173         (로컬 개발, 선택)
 */
export const KAKAO_JS_KEY =
  import.meta.env.VITE_KAKAO_JS_KEY ?? "83f95bdb280c5909a7cf77ec844ad78e"

export const APP_VERSION = "1.0.0"

/** 부산 전역이 담기는 중심·레벨 (지도 초기값) */
export const BUSAN_CENTER = { lat: 35.16, lng: 129.06 }
