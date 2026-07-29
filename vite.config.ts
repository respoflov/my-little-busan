import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"

// GitHub Pages: https://respoflov.github.io/my-little-busan/
const BASE = "/my-little-busan/"

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png", "icon-512-maskable.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: "내 손안의 작은 부산",
        short_name: "작은 부산",
        description: "나만의 속도로, 부산 한 바퀴 — 방문한 곳에 도장을 찍는 나의 부산 기록",
        lang: "ko",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        orientation: "portrait",
        background_color: "#FAF8F4",
        theme_color: "#FAF8F4",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
