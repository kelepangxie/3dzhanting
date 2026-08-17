import { useState } from 'react'
import { House } from 'lucide-react'
import exhibits from '@/data/exhibits'
import useExhibitStore from '@/store/useExhibitStore'
import type { Exhibit } from '@/data/exhibits'
import { ROOM } from '@/theme'

/**
 * 导览模式底部缩略条：点击缩略图，相机平滑飞到该展品面前；
 * 再点一次当前缩略图，打开展品详情。
 */
export default function TourBar() {
  const { controlMode, setTourTarget, selectExhibit, selectedExhibit } = useExhibitStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  if (controlMode !== 'tour' || selectedExhibit) return null

  const overview = () => {
    setActiveId(null)
    setTourTarget({ pos: [0, ROOM.EYE_HEIGHT, 6], look: [0, 2.0, -ROOM.DEPTH / 2] })
  }

  const goTo = (exhibit: Exhibit) => {
    if (activeId === exhibit.id) {
      selectExhibit(exhibit) // 已在该展品面前 → 查看详情
      return
    }
    setActiveId(exhibit.id)
    // 展品法线方向（画面朝向），站到画面正前方 2.8m 处
    const nx = Math.sin(exhibit.rotationY)
    const nz = Math.cos(exhibit.rotationY)
    const margin = 0.6
    const px = Math.max(-ROOM.WIDTH / 2 + margin, Math.min(ROOM.WIDTH / 2 - margin, exhibit.position.x + nx * 2.8))
    const pz = Math.max(-ROOM.DEPTH / 2 + margin, Math.min(ROOM.DEPTH / 2 - margin, exhibit.position.z + nz * 2.8))
    setTourTarget({
      pos: [px, 1.6, pz],
      look: [exhibit.position.x, exhibit.position.y, exhibit.position.z],
    })
  }

  return (
    <div
      data-ui
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col items-center pointer-events-none px-3"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-[94vw] animate-rise-up pointer-events-auto">
        <div className="bg-rice-light/92 backdrop-blur-md border border-wheat/40 rounded-2xl shadow-lg px-3 py-2.5 overflow-x-auto pastoral-scroll">
          <div className="flex items-center gap-2">
          <button
            onClick={overview}
            className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl border transition-all shrink-0 ${
              activeId === null
                ? 'border-wheat bg-wheat/15 text-field-dark'
                : 'border-field/15 bg-rice text-field/70 hover:border-field/40'
            }`}
            title="回到全景"
          >
            <House className="w-4 h-4" />
            <span className="text-[10px] font-serif">全景</span>
          </button>

          <div className="w-px h-10 bg-field/10 shrink-0" />

          {exhibits.map((exhibit) => (
            <button
              key={exhibit.id}
              onClick={() => goTo(exhibit)}
              className={`flex flex-col items-center gap-1 w-14 shrink-0 rounded-xl border p-1 transition-all ${
                activeId === exhibit.id
                  ? 'border-wheat bg-wheat/15'
                  : 'border-field/10 bg-rice hover:border-field/40'
              }`}
              title={`${exhibit.title} · ${exhibit.artist}`}
            >
              <div
                className="w-full h-8 rounded-md flex items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${exhibit.placeholderColor}, ${exhibit.placeholderColor}bb)`,
                }}
              >
                <span className="text-rice-light text-xs font-serif truncate px-0.5">{exhibit.title.slice(0, 2)}</span>
              </div>
              <span
                className={`text-[10px] leading-none font-serif truncate w-full text-center ${
                  activeId === exhibit.id ? 'text-field-dark' : 'text-field/75'
                }`}
              >
                {exhibit.title}
              </span>
            </button>
          ))}
          </div>
        </div>
      </div>
      <p className="text-center text-field/50 text-xs mt-1.5 font-serif pointer-events-none">
        点击缩略图飞到展品面前 · 再点一次查看详情
      </p>
    </div>
  )
}
