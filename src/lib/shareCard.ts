import { getPhoto } from "./photos"
import { CATEGORY_COLOR, type Place, type Visit } from "./types"
import { categoryLabel, formatDate, transitLabel, type Dict } from "./i18n"
import type { Lang } from "./types"

const W = 1080
const H = 1350

const HEX: Record<string, { light: string; dark: string }> = {
  "var(--c-culture)": { light: "#2C5F8A", dark: "#5B8FBF" },
  "var(--c-cafe)": { light: "#B98336", dark: "#CFA050" },
  "var(--c-food)": { light: "#CD6A33", dark: "#E0925F" },
  "var(--c-walk)": { light: "#2E8B74", dark: "#55B098" },
}

/** 도장을 캔버스에 그린다 (앱의 SVG 도장과 같은 형태) */
function drawStamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  rotation: number,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((rotation * Math.PI) / 180)
  const k = r / 39 // 원본 좌표계(r=39) 대비 배율

  ctx.strokeStyle = color
  ctx.lineWidth = 5 * k
  ctx.setLineDash([7 * k, 6 * k])
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()

  ctx.setLineDash([])
  ctx.lineCap = "round"
  ctx.beginPath()
  ctx.moveTo(-18 * k, 4 * k)
  ctx.bezierCurveTo(-12.5 * k, -2 * k, -6.5 * k, -2 * k, -1 * k, 4 * k)
  ctx.bezierCurveTo(4.5 * k, 10 * k, 10.5 * k, 10 * k, 16 * k, 4 * k)
  ctx.stroke()

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(0, -14 * k, 5.5 * k, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/** roundRect는 비교적 최근 API — 없는 브라우저에서는 각진 사각형으로 대체한다 */
function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
}

/** 여러 줄로 접어 그리고, 마지막 y를 돌려준다 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 6,
): number {
  const words = text.split(/(\s+)/)
  let line = ""
  let lines = 0
  let cursorY = y

  const flush = (t: string) => {
    ctx.fillText(t, x, cursorY)
    cursorY += lineHeight
    lines++
  }

  for (const word of words) {
    const test = line + word
    if (ctx.measureText(test).width > maxWidth && line) {
      if (lines === maxLines - 1) {
        let cut = line
        while (ctx.measureText(cut + "…").width > maxWidth && cut.length) cut = cut.slice(0, -1)
        flush(cut + "…")
        return cursorY
      }
      flush(line.trimEnd())
      line = word.trimStart()
    } else {
      line = test
    }
  }
  if (line.trim()) flush(line.trimEnd())
  return cursorY
}

/** 방문 기록을 한 장의 이미지로 만든다 */
export async function renderShareCard(
  place: Place,
  visit: Visit,
  d: Dict,
  lang: Lang,
  dark: boolean,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  try {
    await document.fonts.ready
  } catch {
    /* 폰트 준비 실패는 무시하고 기본 폰트로 그린다 */
  }

  const bg = dark ? "#0F1726" : "#FAF8F4"
  const ink = dark ? "#E9EDF4" : "#17263B"
  const ink2 = dark ? "rgba(233,237,244,.62)" : "rgba(23,38,59,.62)"
  const ink3 = dark ? "rgba(233,237,244,.4)" : "rgba(23,38,59,.4)"
  const line = dark ? "rgba(233,237,244,.12)" : "rgba(23,38,59,.12)"
  const catColor = HEX[CATEGORY_COLOR[place.category]][dark ? "dark" : "light"]
  const font = (w: number, s: number) =>
    `${w} ${s}px "Pretendard Variable", Pretendard, -apple-system, sans-serif`

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const PAD = 84
  let y = PAD

  // 대표 사진
  const photoKey = visit.photos[0]
  if (photoKey) {
    const blob = await getPhoto(photoKey)
    if (blob) {
      try {
        const bitmap = await createImageBitmap(blob)
        const boxW = W - PAD * 2
        const boxH = 620
        const scale = Math.max(boxW / bitmap.width, boxH / bitmap.height)
        const dw = bitmap.width * scale
        const dh = bitmap.height * scale
        ctx.save()
        roundedPath(ctx, PAD, y, boxW, boxH, 28)
        ctx.clip()
        ctx.drawImage(bitmap, PAD + (boxW - dw) / 2, y + (boxH - dh) / 2, dw, dh)
        ctx.restore()
        bitmap.close()

        if (visit.photos.length > 1) {
          const label = `+${visit.photos.length - 1}`
          ctx.font = font(700, 26)
          const tw = ctx.measureText(label).width
          ctx.fillStyle = "rgba(23,38,59,.72)"
          roundedPath(ctx, PAD + boxW - tw - 62, y + boxH - 64, tw + 38, 44, 14)
          ctx.fill()
          ctx.fillStyle = "#fff"
          ctx.textAlign = "center"
          ctx.fillText(label, PAD + boxW - tw / 2 - 43, y + boxH - 33)
          ctx.textAlign = "left"
        }
        y += boxH + 56
      } catch {
        /* 이미지 디코딩 실패 — 사진 없이 계속 */
      }
    }
  }

  // 도장 + 카테고리
  const stampR = 62
  drawStamp(ctx, PAD + stampR, y + stampR, stampR, catColor, visit.rotation)

  ctx.font = font(700, 30)
  ctx.fillStyle = catColor
  ctx.fillText(categoryLabel(place.category, d), PAD + stampR * 2 + 34, y + 46)

  ctx.font = font(800, 60)
  ctx.fillStyle = ink
  ctx.fillText(place.name, PAD + stampR * 2 + 34, y + 112)
  y += stampR * 2 + 66

  // 메타 (날짜 · 동행 · 이동)
  ctx.font = font(500, 30)
  ctx.fillStyle = ink2
  const meta = [
    formatDate(visit.date, lang),
    visit.companions.join(", "),
    visit.transport ? transitLabel(visit.transport, d) : "",
  ].filter(Boolean)
  ctx.fillText(meta.join("  ·  "), PAD, y)
  y += 58

  // 메모
  if (visit.memo?.trim()) {
    ctx.strokeStyle = line
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(PAD, y)
    ctx.lineTo(W - PAD, y)
    ctx.stroke()
    y += 62

    ctx.font = font(500, 36)
    ctx.fillStyle = ink
    y = wrapText(ctx, `"${visit.memo.trim()}"`, PAD, y, W - PAD * 2, 56, 5)
  }

  // 하단 각인
  ctx.textAlign = "center"
  ctx.font = font(700, 28)
  ctx.fillStyle = ink3
  ctx.fillText(d.appName, W / 2, H - 128)
  ctx.font = font(600, 20)
  ctx.fillStyle = dark ? "rgba(233,237,244,.24)" : "rgba(23,38,59,.24)"
  ctx.letterSpacing = "6px"
  ctx.fillText("RESPOFLOV", W / 2, H - 82)
  ctx.letterSpacing = "0px"
  ctx.textAlign = "left"

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
}

/** 이미지를 공유(가능하면)하거나 내려받는다 */
export async function shareOrDownload(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: "image/png" })
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean
    share?: (data: { files: File[]; title?: string }) => Promise<void>
  }
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file] })
      return
    } catch {
      // 사용자가 공유를 취소하면 저장으로 대체하지 않고 그대로 끝낸다
      return
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
