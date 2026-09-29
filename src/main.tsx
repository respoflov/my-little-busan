// 앱 시작점: 전역 상태(StoreProvider)로 App을 감싸 화면에 붙인다
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import { StoreProvider } from "./lib/store"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
