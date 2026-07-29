/**
 * 사진 저장소 — localStorage는 용량이 작아(수 MB) 사진에 부적합하므로 IndexedDB에 Blob으로 넣는다.
 * 저장 전 긴 변이 1600px 이하가 되도록 리사이즈하고 JPEG로 다시 인코딩한다.
 */

const DB_NAME = "my-little-busan-photos"
const STORE = "photos"
const MAX_EDGE = 1600
const QUALITY = 0.82

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

function tx<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = fn(t.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
  )
}

async function shrink(file: File | Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    bitmap.close()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/jpeg", QUALITY),
  )
  return blob ?? file
}

export async function addPhoto(file: File | Blob): Promise<string> {
  const key = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const blob = await shrink(file)
  await tx("readwrite", (s) => s.put(blob, key))
  return key
}

export async function getPhoto(key: string): Promise<Blob | undefined> {
  try {
    return await tx<Blob | undefined>("readonly", (s) => s.get(key))
  } catch {
    return undefined
  }
}

export async function deletePhoto(key: string): Promise<void> {
  try {
    await tx("readwrite", (s) => s.delete(key))
  } catch {
    /* 이미 없으면 무시 */
  }
}

export async function clearPhotos(): Promise<void> {
  try {
    await tx("readwrite", (s) => s.clear())
  } catch {
    /* 무시 */
  }
}

/** 저장된 사진 개수 — 설정 화면 표시용 */
export async function countPhotos(): Promise<number> {
  try {
    return await tx<number>("readonly", (s) => s.count())
  } catch {
    return 0
  }
}

/* ── objectURL 캐시 ──────────────────────────────────────────────
   같은 사진을 여러 화면에서 반복해 열기 때문에 URL을 재사용한다. */
const urlCache = new Map<string, string>()

export async function getPhotoURL(key: string): Promise<string | null> {
  const cached = urlCache.get(key)
  if (cached) return cached
  const blob = await getPhoto(key)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  urlCache.set(key, url)
  return url
}

export function revokePhotoURL(key: string) {
  const url = urlCache.get(key)
  if (url) {
    URL.revokeObjectURL(url)
    urlCache.delete(key)
  }
}
