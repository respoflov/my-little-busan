# 내 손안의 작은 부산 (Busan in My Pocket)

> 나만의 속도로, 부산 한 바퀴 — 방문한 곳에 도장을 찍는 개인용 기록 PWA

부산의 장소 64곳을 지도에 모아두고, 한 곳씩 방문하며 도장을 찍고 사진·메모·동행·이동수단을 기록합니다.
아이폰 홈 화면에 추가해 앱처럼 쓰는 것을 전제로 만들었습니다.

## 기술 스택

React 19 + TypeScript · Vite · Tailwind CSS v4 · vite-plugin-pwa · Kakao Maps JavaScript SDK · Pretendard · Lucide

## 실행

```bash
npm install
npm run dev      # http://localhost:5173/my-little-busan/
npm run build    # dist/ 생성
npm run preview  # 빌드 결과 확인
```

> Node는 nvm으로 설치되어 있습니다. 새 셸에서는 먼저
> `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"` 를 실행하세요.

## 카카오 지도 설정 (필수)

지도 화면이 뜨려면 [Kakao Developers 콘솔](https://developers.kakao.com/console/app)에서 두 가지가 되어 있어야 합니다.
둘 중 하나라도 빠지면 SDK 로딩이 거부되고, 앱은 지도 대신 **장소 목록**으로 자동 대체됩니다(기록 기능은 그대로 동작).

1. **카카오맵 활성화** — 좌측 [메뉴] → 카카오맵 → 사용 설정 → 상태 **ON**
2. **JavaScript SDK 도메인 등록** — 앱 설정 → 앱 → 앱 키(JavaScript 키) 영역의 "JavaScript SDK 도메인"에 아래 두 개 등록
   - `http://localhost:5173`
   - `https://respoflov.github.io`

> "제품 링크 관리 → 웹 도메인"은 카카오톡 공유 링크용이라 지도와 무관합니다.

JavaScript 키는 `src/lib/config.ts`에 있습니다. 브라우저에 노출되는 것이 정상이며 도메인 제한으로 보호됩니다.
바꾸려면 `.env`에 `VITE_KAKAO_JS_KEY=...` 를 넣으면 됩니다.

## GitHub Pages 배포

`vite.config.ts`의 `base`가 `/my-little-busan/`로 맞춰져 있습니다 (배포 주소: https://respoflov.github.io/my-little-busan/).

```bash
npm run build
# dist/ 내용을 저장소의 Pages 배포 경로(gh-pages 브랜치 등)에 올린다
```

## 데이터가 저장되는 곳

- **설정·방문 기록·추가한 장소·좌표 캐시** — `localStorage` (`my-little-busan/v1`)
- **사진** — `IndexedDB` (`my-little-busan-photos`). 저장 시 긴 변 1600px·JPEG로 줄여 넣습니다.

서버가 없는 정적 앱이라 **기기 안에만 저장됩니다.** 기기를 옮기거나 초기화하기 전에는
설정 → 데이터 → *기록 백업 내보내기*(JSON)를 이용하세요.
※ 백업 JSON에는 사진이 포함되지 않습니다(사진은 IndexedDB에만 있음).

## 장소 데이터에 대해

기본 64곳은 공개된 웹 정보(부산관광공사, 다이닝코드, 대한민국 구석구석, 부산일보, 트립닷컴 등)를 모아 정리한 **초안**입니다.
별점·영업 여부·정확한 위치는 검증되지 않았고, 확인이 특히 필요한 곳은 상세 화면에 표시됩니다.
좌표는 하드코딩하지 않고 실행 중 카카오 장소검색으로 조회해 캐시하며, 조회된 주소로 구·군이 자동 보정됩니다.

## 폴더 구조

```
src/
  data/      places.ts(64곳) · districts.ts(행정구역 SVG·중심좌표)
  lib/       store(상태) · storage(localStorage) · photos(IndexedDB)
             kakao(SDK·장소검색) · i18n(한/영) · shareCard(이미지 내보내기)
  components/ Splash · Onboarding · TabBar · Sheet · Stamp · Logo · bits
  screens/   MapOverview · DistrictMap · PlaceSheet · Stampbook
             Journal · JournalDetail · AddPlace · Settings
```

## 문서

- [DESIGN.md](DESIGN.md) — 확정 디자인(팔레트·타이포·화면 구조)
- [design-mockup.html](design-mockup.html) — 승인받은 시안 원본 (보관용, 삭제 금지)
- [places_draft.md](places_draft.md) — 장소 64곳 원본 리스트
- [히스토리.md](히스토리.md) — 제작 이력
