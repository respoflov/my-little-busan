import type { Category, Lang, Transit } from "./types"

/**
 * UI 문구만 번역합니다. 장소 이름·소개는 고유명사·현지 정보라 한국어 원문을 유지합니다
 * (임의 영역하면 실제와 다른 이름을 만들게 되므로).
 */
const dict = {
  ko: {
    appName: "내 손안의 작은 부산",
    tagline: "나만의 속도로, 부산 한 바퀴",

    tabMap: "지도",
    tabStampbook: "스탬프북",
    tabAdd: "추가",
    tabJournal: "기록",
    tabSettings: "설정",

    catCulture: "전시·건축",
    catCafe: "카페",
    catFood: "맛집",
    catWalk: "산책·뷰",
    catAll: "전체",

    transitSubway: "지하철",
    transitBus: "버스",
    transitCar: "자차·택시",
    transitWalk: "도보",
    transitUnknown: "확인 필요",

    // 온보딩
    obTitle: "스탬프북을 시작할까요?",
    obDesc: "모으기 시작한 날을 알려주시면 스탬프북에 표시됩니다.",
    obStart: "이 날부터 모으기",
    obSkip: "나중에 설정에서 정할게요",

    // 지도
    mapHint: "구를 탭하면 확대됩니다",
    /** 메인 헤더 — 앱 이름 자리를 대신하는 진행 표시 */
    placesCount: (a: number, b: number) => `현재까지 모은 스탬프: ${a}/${b} 개`,
    visitedOf: (a: number, b: number) => `${a} / ${b}곳`,
    unlocated: "위치 미확인",
    unlocatedN: (n: number) => `위치 미확인 ${n}곳`,
    back: "뒤로",
    noPlacesHere: "이 구에 등록된 장소가 없습니다",
    mapKeyMissing: "지도를 불러오지 못했습니다",
    mapKeyMissingDesc:
      "카카오 개발자 콘솔에서 카카오맵 활성화와 JavaScript SDK 도메인 등록을 확인해 주세요. 지도 없이도 아래 목록에서 장소를 기록할 수 있습니다.",
    mapLoading: "지도를 불러오는 중…",
    listView: "목록으로 보기",

    // 장소 상세
    visited: "방문함",
    notVisited: "미방문",
    stampIt: "방문 도장 찍기",
    stamped: "도장을 찍었어요",
    editRecord: "기록 수정",
    removeStamp: "도장 지우기",
    openKakao: "카카오맵",
    photos: "사진",
    addPhoto: "추가",
    memoPlaceholder: "한 줄로 시작해도 좋아요. 길어지면 칸이 자동으로 늘어납니다.",
    withWhom: "누구와",
    howCome: "어떻게",
    whenLabel: "시간",
    depart: "출발",
    arrive: "도착",
    duration: (m: number) => `${m}분`,
    optional: "선택 입력",
    coAlone: "혼자",
    coPartner: "연인",
    coFriend: "친구",
    coFamily: "가족",
    custom: "직접 입력",
    save: "저장",
    cancel: "취소",
    delete: "삭제",
    close: "닫기",
    visitDate: "방문일",
    needsCheckNote: "위치·상호 확인이 필요한 곳입니다",

    // 스탬프북
    stampbook: "스탬프북",
    collectingSince: (d: string) => `${d}부터 모으는 중`,
    collectingNoDate: "수집 시작일을 설정해 주세요",
    visitedCount: (n: number, t: number) => `${n} / ${t}곳 방문`,
    /** 큰 숫자 뒤에 붙는 꼬리말 */
    ofTotalVisited: (t: number) => `/ ${t}곳 방문`,
    sortLabel: "정렬",
    sortRegistered: "등록순",
    sortName: "가나다순",

    // 기록
    journal: "기록",
    journalSummary: (v: number, p: number, m: number) =>
      `방문 ${v}곳 · 사진 ${p}장 · 메모 ${m}개`,
    byMonth: "월별",
    byCategory: "카테고리",
    journalEmpty: "아직 기록이 없습니다",
    journalEmptyDesc: "지도에서 장소를 골라 첫 도장을 찍어보세요.",
    viewOnMap: "지도에서 보기",
    shareImage: "이미지로 저장",
    sharing: "이미지 만드는 중…",

    // 추가
    addPlace: "장소 추가",
    addPlaceDesc: "가고 싶은 곳을 직접 추가할 수 있어요.",
    placeName: "장소 이름",
    placeNamePh: "예: 흰여울 해안터널",
    placeCategory: "카테고리",
    placeDesc: "한 줄 소개",
    placeDescPh: "선택 입력",
    placeDistrict: "구·군",
    autoDetect: "자동 (검색으로 찾기)",
    addSubmit: "추가하기",
    added: "추가되었습니다",
    nameRequired: "장소 이름을 입력해 주세요",
    myPlaces: "내가 추가한 장소",
    noMyPlaces: "아직 추가한 장소가 없습니다",

    // 설정
    settings: "설정",
    grpDisplay: "화면",
    theme: "테마",
    themeLight: "라이트",
    themeSystem: "시스템",
    themeDark: "다크",
    language: "언어",
    grpStampbook: "스탬프북",
    startDate: "수집 시작일",
    defaultSort: "기본 정렬",
    grpData: "데이터",
    exportData: "기록 백업 내보내기",
    importData: "백업 불러오기",
    resetData: "모든 기록 초기화",
    resetTitle: "모든 기록을 지울까요?",
    resetBody: "방문 기록·사진·메모와 직접 추가한 장소가 모두 지워집니다. 되돌릴 수 없습니다.",
    resetNote: (n: number) =>
      `기본으로 들어 있던 장소 ${n}곳도 함께 사라집니다. 처음부터 내가 고른 장소로만 채우고 싶을 때 쓰세요. 설정에서 언제든 다시 불러올 수 있습니다.`,
    resetGo: "모두 지우기",
    resetDone: "초기화했습니다",
    restoreDefaults: "기본 장소 다시 불러오기",
    restoreDone: "기본 장소를 다시 불러왔습니다",
    importDone: "불러왔습니다",
    importFailed: "백업 파일을 읽지 못했습니다",
    grpInfo: "안내",
    howToInstall: "홈 화면에 추가하는 방법",
    dataSource: "장소 정보 출처",
    licenses: "오픈소스 라이선스",
    version: "버전",
    storageUsed: "저장된 사진",
    photosN: (n: number) => `${n}장`,

    installSections: [
      {
        title: "아이폰 · 아이패드 (Safari)",
        steps: [
          "Safari로 이 페이지를 엽니다 — 크롬 등 다른 브라우저에서는 추가되지 않습니다",
          "화면 아래 가운데의 공유 버튼(↑)을 누릅니다",
          "메뉴를 아래로 내려 '홈 화면에 추가'를 고릅니다",
          "오른쪽 위 '추가'를 누르면 끝납니다",
        ],
      },
      {
        title: "맥 (Safari)",
        steps: ["메뉴 막대에서 '파일 → Dock에 추가'를 고르면 앱처럼 열립니다"],
      },
      {
        title: "갤럭시 · 안드로이드",
        steps: [
          "삼성 인터넷: 아래 메뉴(≡) → '현재 페이지 추가' → '홈 화면'",
          "크롬: 오른쪽 위 메뉴(⋮) → '홈 화면에 추가' 또는 '앱 설치'",
          "이름을 확인하고 '추가'를 누르면 끝납니다",
          "설치 후에는 주소창 없이 앱처럼 전체 화면으로 열립니다",
        ],
      },
    ],
    sourceGuide:
      "기본 장소 64곳은 부산관광공사(visitbusan.net), 다이닝코드, 대한민국 구석구석, 부산일보, 트립닷컴 등 공개된 웹 정보를 모아 정리한 초안입니다. 별점·영업 여부·정확한 위치는 검증되지 않았으니 방문 전 카카오맵에서 확인해 주세요.",
    licenseGuide:
      "Pretendard (SIL OFL 1.1) · Lucide Icons (ISC) · 행정구역 경계 southkorea-maps (통계청 기반) · 지도 Kakao Maps API",
  },

  en: {
    appName: "Busan in My Pocket",
    tagline: "Around Busan, at my own pace",

    tabMap: "Map",
    tabStampbook: "Stamps",
    tabAdd: "Add",
    tabJournal: "Journal",
    tabSettings: "Settings",

    catCulture: "Art & Architecture",
    catCafe: "Cafés",
    catFood: "Restaurants",
    catWalk: "Walks & Views",
    catAll: "All",

    transitSubway: "Subway",
    transitBus: "Bus",
    transitCar: "Car / Taxi",
    transitWalk: "On foot",
    transitUnknown: "To be checked",

    obTitle: "Start your stamp book?",
    obDesc: "Tell us when you started collecting and we'll show it in your stamp book.",
    obStart: "Start from this date",
    obSkip: "I'll set it later in Settings",

    mapHint: "Tap a district to zoom in",
    placesCount: (a: number, b: number) => `Stamps collected: ${a}/${b}`,
    visitedOf: (a: number, b: number) => `${a} / ${b}`,
    unlocated: "Location unknown",
    unlocatedN: (n: number) => `${n} without location`,
    back: "Back",
    noPlacesHere: "No places registered in this district",
    mapKeyMissing: "Couldn't load the map",
    mapKeyMissingDesc:
      "Check that Kakao Map is enabled and your JavaScript SDK domain is registered in the Kakao developer console. You can still record places from the list below.",
    mapLoading: "Loading the map…",
    listView: "Show as list",

    visited: "Visited",
    notVisited: "Not yet",
    stampIt: "Stamp this visit",
    stamped: "Stamped",
    editRecord: "Edit record",
    removeStamp: "Remove stamp",
    openKakao: "KakaoMap",
    photos: "Photos",
    addPhoto: "Add",
    memoPlaceholder: "Start with one line — the box grows as you write.",
    withWhom: "With",
    howCome: "How",
    whenLabel: "Time",
    depart: "Left",
    arrive: "Arrived",
    duration: (m: number) => `${m} min`,
    optional: "Optional",
    coAlone: "Alone",
    coPartner: "Partner",
    coFriend: "Friend",
    coFamily: "Family",
    custom: "Custom",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    close: "Close",
    visitDate: "Date",
    needsCheckNote: "Name or location needs checking",

    stampbook: "Stamp book",
    collectingSince: (d: string) => `Collecting since ${d}`,
    collectingNoDate: "Set your start date",
    visitedCount: (n: number, t: number) => `${n} of ${t} visited`,
    ofTotalVisited: (t: number) => `of ${t} visited`,
    sortLabel: "Sort",
    sortRegistered: "Default",
    sortName: "A→Z",

    journal: "Journal",
    journalSummary: (v: number, p: number, m: number) =>
      `${v} visits · ${p} photos · ${m} notes`,
    byMonth: "By month",
    byCategory: "By category",
    journalEmpty: "No records yet",
    journalEmptyDesc: "Pick a place on the map and collect your first stamp.",
    viewOnMap: "Show on map",
    shareImage: "Save as image",
    sharing: "Creating image…",

    addPlace: "Add a place",
    addPlaceDesc: "Add somewhere you'd like to go.",
    placeName: "Name",
    placeNamePh: "e.g. Huinnyeoul Coastal Tunnel",
    placeCategory: "Category",
    placeDesc: "One-line note",
    placeDescPh: "Optional",
    placeDistrict: "District",
    autoDetect: "Auto (find by search)",
    addSubmit: "Add",
    added: "Added",
    nameRequired: "Please enter a name",
    myPlaces: "Places you added",
    noMyPlaces: "You haven't added any places yet",

    settings: "Settings",
    grpDisplay: "Display",
    theme: "Theme",
    themeLight: "Light",
    themeSystem: "System",
    themeDark: "Dark",
    language: "Language",
    grpStampbook: "Stamp book",
    startDate: "Start date",
    defaultSort: "Default sort",
    grpData: "Data",
    exportData: "Export backup",
    importData: "Import backup",
    resetData: "Erase all records",
    resetTitle: "Erase everything?",
    resetBody:
      "All visits, photos, notes and the places you added will be erased. This cannot be undone.",
    resetNote: (n: number) =>
      `The ${n} places that came with the app will be removed too. Use this if you'd rather start from scratch with only your own picks. You can bring them back any time from Settings.`,
    resetGo: "Erase everything",
    resetDone: "Erased",
    restoreDefaults: "Restore the built-in places",
    restoreDone: "Built-in places restored",
    importDone: "Imported",
    importFailed: "Couldn't read that backup file",
    grpInfo: "About",
    howToInstall: "How to add to Home Screen",
    dataSource: "Where place info comes from",
    licenses: "Open source licenses",
    version: "Version",
    storageUsed: "Stored photos",
    photosN: (n: number) => `${n}`,

    installSections: [
      {
        title: "iPhone · iPad (Safari)",
        steps: [
          "Open this page in Safari — other browsers can't add it",
          "Tap the Share button (↑) at the bottom of the screen",
          "Scroll down the menu and choose 'Add to Home Screen'",
          "Tap 'Add' at the top right and you're done",
        ],
      },
      {
        title: "Mac (Safari)",
        steps: ["Choose File → Add to Dock from the menu bar to use it like an app"],
      },
      {
        title: "Galaxy · Android",
        steps: [
          "Samsung Internet: bottom menu (≡) → 'Add page to' → 'Home screen'",
          "Chrome: top-right menu (⋮) → 'Add to Home screen' or 'Install app'",
          "Confirm the name and tap 'Add'",
          "Once installed it opens full screen, without the address bar",
        ],
      },
    ],
    sourceGuide:
      "The 64 default places were compiled from publicly available sources (visitbusan.net, DiningCode, VisitKorea, Busan Ilbo, Trip.com and others). Ratings, opening status and exact locations are unverified — please check on KakaoMap before you go.",
    licenseGuide:
      "Pretendard (SIL OFL 1.1) · Lucide Icons (ISC) · District boundaries from southkorea-maps (KOSTAT) · Maps by Kakao Maps API",
  },
} as const

export type Dict = (typeof dict)["ko"]

export function t(lang: Lang): Dict {
  return dict[lang] as Dict
}

export function categoryLabel(cat: Category, d: Dict): string {
  return cat === "culture"
    ? d.catCulture
    : cat === "cafe"
      ? d.catCafe
      : cat === "food"
        ? d.catFood
        : d.catWalk
}

export function transitLabel(tr: Transit | string, d: Dict): string {
  switch (tr) {
    case "subway":
      return d.transitSubway
    case "bus":
      return d.transitBus
    case "car":
      return d.transitCar
    case "walk":
      return d.transitWalk
    case "unknown":
      return d.transitUnknown
    default:
      return String(tr)
  }
}

export function transitIcon(tr: Transit | string): string {
  switch (tr) {
    case "subway":
      return "🚇"
    case "bus":
      return "🚌"
    case "car":
      return "🚗"
    case "walk":
      return "🚶"
    default:
      return "📍"
  }
}

/** 동행 기본 선택지 */
export function companionOptions(d: Dict): string[] {
  return [d.coAlone, d.coPartner, d.coFriend, d.coFamily]
}

export function formatDate(iso: string, lang: Lang): string {
  const [y, m, dd] = iso.split("-").map(Number)
  if (!y || !m || !dd) return iso
  const date = new Date(y, m - 1, dd)
  if (lang === "en") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  const days = ["일", "월", "화", "수", "목", "금", "토"]
  return `${y}년 ${m}월 ${dd}일 (${days[date.getDay()]})`
}

export function formatDateShort(iso: string, lang: Lang): string {
  const [y, m, dd] = iso.split("-").map(Number)
  if (!y || !m || !dd) return iso
  if (lang === "en") {
    return new Date(y, m - 1, dd).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }
  return `${m}월 ${dd}일`
}

export function formatMonth(ym: string, lang: Lang): string {
  const [y, m] = ym.split("-").map(Number)
  if (!y || !m) return ym
  if (lang === "en") {
    return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }
  return `${y}년 ${m}월`
}

export function districtName(
  d: { name: string; nameEn: string } | undefined,
  lang: Lang,
): string {
  if (!d) return ""
  return lang === "en" ? d.nameEn : d.name
}
