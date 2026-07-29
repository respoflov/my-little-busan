import { CATEGORY_COLOR, type Category } from "@/lib/types"

interface Props {
  category: Category
  size?: number
  /** 기울기(deg) — 손으로 찍은 도장처럼 장소마다 다르게 */
  rotation?: number
  /** 미방문 = 비어 있는 점선 원 */
  empty?: boolean
  /** 방금 찍은 도장에 등장 애니메이션 */
  animate?: boolean
  className?: string
}

export function Stamp({
  category,
  size = 52,
  rotation = 0,
  empty = false,
  animate = false,
  className = "",
}: Props) {
  const color = empty ? "var(--stamp-empty)" : CATEGORY_COLOR[category]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      fill="none"
      aria-hidden
      className={`${animate ? "anim-stamp" : ""} ${className}`}
      style={
        {
          transform: `rotate(${rotation}deg)`,
          "--stamp-rot": `${rotation}deg`,
        } as React.CSSProperties
      }
    >
      <circle
        cx="44"
        cy="44"
        r="39"
        stroke={color}
        strokeWidth={empty ? 4 : 5}
        strokeDasharray="7 6"
      />
      {!empty && (
        <>
          <path
            d="M26 48c5.5-6 11.5-6 17 0s11.5 6 17 0"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="44" cy="30" r="5.5" fill={color} />
        </>
      )}
    </svg>
  )
}
