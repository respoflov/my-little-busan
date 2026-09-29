// 자식 요소를 body 바로 아래에 그리는 포털 (시트·모달이 다른 요소에 가려지지 않게)
import { createPortal } from "react-dom"
import type { ReactNode } from "react"

/**
 * 오버레이를 body 아래에 그린다.
 * 화면 전환 애니메이션(transform)이 쌓임 맥락을 만들기 때문에, 그 안에서 z-index만 올리면
 * 탭바 같은 바깥 요소에 가려질 수 있다. 포털로 빼서 항상 맨 위에 오도록 한다.
 */
export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}
