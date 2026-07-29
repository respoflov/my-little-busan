# 나의 작은 부산 지도 — interface-design system.md

방향·토큰·패턴의 확정 기록. 상세 서술은 ../DESIGN.md, 시각 원본은 ../design-mockup.html (v6).

## 방향
- 시그니처: "방문 = 도장 찍기" (인주색 도장, 스탬프북 수집)
- 톤: 조용한 미니멀, 지도가 주인공. 깊이는 보더 중심 + 시트 그림자만
- 지도 오버뷰는 실제 행정구역 실루엣 (busan-districts.geo.json)

## 토큰 (라이트 / 다크)
- surface: #FAF8F4 / #0F1726 (card #FFFFFF / #1A2739)
- ink: #17263B / #E9EDF4 (2차 62%, 3차 40%)
- line: rgba(23,38,59,.10) / rgba(233,237,244,.09)
- accent(인주·동백, 도장·CTA 전용): #B0433F / #CE7069
- cat-culture: #2C5F8A / #5B8FBF · cat-cafe: #B98336 / #CFA050
- cat-food: #CD6A33 / #E0925F · cat-walk: #2E8B74 / #55B098

## 타이포·스페이싱
- Pretendard Variable. 숫자 tabular-nums
- 스케일: 9~11 / 12~13 / 14~15 / 17 / 21~22 / 26~28
- 4px 그리드, 컨트롤 패딩 11~14px
- 라운드: 칩 999 / 버튼·필드 9~12 / 카드 14 / 시트 20~24

## 컴포넌트 확정값
- 탭바: 5탭, 아이콘 18px(Lucide stroke 1.7) + 10px 라벨, 패딩 8/22
- 카테고리 칩: 7px 색점 + 12px/600, 패딩 7×11, r999
- 마커: 26px 원 — 방문: 카테고리색 채움+흰 파도, 미방문: 흰 배경+2.5px 색 링
- 도장: 점선 원+파도+점, 회전 ±9~14° 랜덤(확실히 기울일 것), 미방문 회색 점선 빈 원
- CTA(도장 찍기): accent 배경, r12, 패딩 13~14, shadow 0 6 16 -6 accent 50%
- bottom sheet: r24 상단, grab 36×4
- 스플래시: 2s 페이드아웃 cubic-bezier(.23,1,.32,1), 로고 등장 0.7s scale .92→1

## 절차 메모
- 구현 전 design-mockup.html 목업으로 승인받는 프로세스 유지 (GitHub_PWA/CLAUDE.md 참조)
