import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { DISTRICTS } from "@/data/districts"
import { CategoryDot, CategoryTag, Chip, ScreenHeader, Toast } from "@/components/bits"
import { useStore } from "@/lib/store"
import { categoryLabel, districtName } from "@/lib/i18n"
import { CATEGORY_COLOR, CATEGORY_IDS, type Category } from "@/lib/types"

/** 추가 — 사용자가 직접 장소를 등록한다. 카테고리는 기존 4종을 그대로 쓴다. */
export function AddPlace() {
  const { d, data, addCustomPlace, deleteCustomPlace } = useStore()
  const lang = data.settings.lang
  const [name, setName] = useState("")
  const [category, setCategory] = useState<Category>("cafe")
  const [desc, setDesc] = useState("")
  const [district, setDistrict] = useState<string>("")
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(t)
  }, [toast])

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setToast(d.nameRequired)
      return
    }
    addCustomPlace({
      name: trimmed,
      category,
      desc: desc.trim(),
      district: district || null,
      transit: "unknown",
      transitNote: "",
    })
    setName("")
    setDesc("")
    setDistrict("")
    setToast(d.added)
  }

  return (
    <div className="safe-t px-5 pb-[92px]">
      <ScreenHeader title={d.addPlace} sub={d.addPlaceDesc} />

      <label className="block">
        <span className="text-[11.5px] font-semibold text-ink-3">{d.placeName}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={d.placeNamePh}
          className="mt-1.5 w-full rounded-[10px] border border-line bg-card px-3.5 py-3 text-[14px] placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      </label>

      <div className="mt-3.5">
        <span className="text-[11.5px] font-semibold text-ink-3">{d.placeCategory}</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CATEGORY_IDS.map((c) => (
            <Chip
              key={c}
              active={category === c}
              color={CATEGORY_COLOR[c]}
              onClick={() => setCategory(c)}
            >
              <span className="flex items-center gap-1.5">
                {category !== c && <CategoryDot category={c} size={7} />}
                {categoryLabel(c, d)}
              </span>
            </Chip>
          ))}
        </div>
      </div>

      <label className="mt-3.5 block">
        <span className="text-[11.5px] font-semibold text-ink-3">{d.placeDesc}</span>
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={d.placeDescPh}
          className="mt-1.5 w-full rounded-[10px] border border-line bg-card px-3.5 py-3 text-[13.5px] placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      </label>

      <label className="mt-3.5 block">
        <span className="text-[11.5px] font-semibold text-ink-3">{d.placeDistrict}</span>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="mt-1.5 w-full appearance-none rounded-[10px] border border-line bg-card px-3.5 py-3 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-accent-soft"
        >
          <option value="">{d.autoDetect}</option>
          {DISTRICTS.map((x) => (
            <option key={x.id} value={x.id}>
              {districtName(x, lang)}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={submit}
        className="press mt-5 w-full rounded-xl bg-accent py-3.5 text-[15px] font-bold text-sand shadow-[0_6px_16px_-6px_var(--accent-shadow)]"
      >
        {d.addSubmit}
      </button>

      <section className="mt-8">
        <h2 className="text-[11px] font-bold tracking-[0.06em] text-ink-3">{d.myPlaces}</h2>
        {data.customPlaces.length === 0 ? (
          <p className="mt-2.5 text-[12.5px] text-ink-3">{d.noMyPlaces}</p>
        ) : (
          <ul className="mt-2.5 overflow-hidden rounded-[14px] border border-line bg-card">
            {data.customPlaces.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2.5 border-b border-line-soft px-4 py-3 last:border-b-0"
              >
                <CategoryTag category={p.category} label={categoryLabel(p.category, d)} />
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">
                  {p.name}
                </span>
                <button
                  onClick={() => deleteCustomPlace(p.id)}
                  aria-label={`${p.name} ${d.delete}`}
                  className="press p-1 text-ink-3"
                >
                  <Trash2 size={15} strokeWidth={1.7} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {toast && <Toast message={toast} />}
    </div>
  )
}
