// IndexedDB에 저장된 사진을 불러와 보여 주는 이미지 컴포넌트
import { useEffect, useState } from "react"
import { getPhotoURL } from "@/lib/photos"

/** IndexedDB에 저장된 사진을 키로 불러와 보여준다. */
export function PhotoImg({
  photoKey,
  className = "",
  alt = "",
}: {
  photoKey: string
  className?: string
  alt?: string
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getPhotoURL(photoKey).then((u) => {
      if (alive) setUrl(u)
    })
    return () => {
      alive = false
    }
  }, [photoKey])

  if (!url) return <div className={`bg-line-soft ${className}`} aria-hidden />
  return <img src={url} alt={alt} loading="lazy" className={className} />
}
