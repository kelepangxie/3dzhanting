import { useEffect, useRef, useState } from 'react'
import useExhibitStore from '@/store/useExhibitStore'
import exhibits from '@/data/exhibits'
import type { Exhibit } from '@/data/exhibits'
import ReviewsSection from './ReviewsSection'
import { X, User, Image as ImageIcon, FileText, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

const AUTOPLAY_MS = 3800

/** 轮播媒体区：当前系列素材自动轮播，悬停暂停，左右切换 */
function Carousel({ exhibit }: { exhibit: Exhibit }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [failed, setFailed] = useState<Record<string, boolean>>({})
  const timerRef = useRef<number | null>(null)
  const total = exhibit.images.length

  // 打开不同展品时重置轮播并预加载整套素材
  useEffect(() => {
    setIndex(0)
    setPlaying(true)
    setFailed({})
    exhibit.images.forEach((img) => {
      const pre = new Image()
      pre.src = img.url
    })
  }, [exhibit])

  const go = (next: number) => setIndex(((next % total) + total) % total)

  // 自动播放（悬停/手动暂停时停表；切图重置计时）
  useEffect(() => {
    if (!playing || total <= 1) return
    timerRef.current = window.setTimeout(() => go(index + 1), AUTOPLAY_MS)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [index, playing, total])

  // 键盘左右切图
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(index - 1)
      if (e.key === 'ArrowRight') go(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, total])

  if (total <= 1) {
    const img = exhibit.images[0]
    return failed[img.url] ? <CoverFallback exhibit={exhibit} /> : (
      <img src={img.url} alt={img.title} onError={() => setFailed({ ...failed, [img.url]: true })} className="w-full h-full object-contain bg-field-dark/90" />
    )
  }

  const current = exhibit.images[index]

  return (
    <div
      className="relative w-full h-full bg-field-dark/90"
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
    >
      {/* 轮播画面（淡入切换） */}
      {exhibit.images.map((img, i) => (
        <img
          key={img.url}
          src={img.url}
          alt={img.title}
          onError={() => setFailed((f) => ({ ...f, [img.url]: true }))}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${i === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      {/* 当前图标题浮层 */}
      <div className="absolute bottom-12 left-3 right-3 flex items-end justify-between gap-3 pointer-events-none">
        <div className="bg-rice-light/92 backdrop-blur-sm rounded-xl px-3.5 py-2 max-w-[78%] shadow-sm">
          <p className="text-field-dark text-sm font-serif leading-snug">{current.title}</p>
          {current.description && <p className="text-field/60 text-xs mt-0.5">{current.description}</p>}
        </div>
        <span className="bg-rice-light/92 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-serif text-field-dark/80 shadow-sm shrink-0">
          {index + 1} / {total}
        </span>
      </div>

      {/* 上一张 / 下一张 */}
      <button
        onClick={() => go(index - 1)}
        className="absolute left-3 bottom-3 z-10 w-9 h-9 rounded-full bg-rice/90 backdrop-blur-sm border border-field/20 flex items-center justify-center text-field/70 hover:text-field-dark hover:border-wheat transition-colors"
        title="上一张（←）"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setPlaying(!playing)}
        className="absolute left-1/2 -translate-x-1/2 bottom-3 z-10 w-9 h-9 rounded-full bg-rice/90 backdrop-blur-sm border border-field/20 flex items-center justify-center text-field/70 hover:text-field-dark hover:border-wheat transition-colors"
        title={playing ? '暂停轮播' : '播放轮播'}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <button
        onClick={() => go(index + 1)}
        className="absolute right-3 bottom-3 z-10 w-9 h-9 rounded-full bg-rice/90 backdrop-blur-sm border border-field/20 flex items-center justify-center text-field/70 hover:text-field-dark hover:border-wheat transition-colors"
        title="下一张（→）"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* 圆点指示器 */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-rice/80 backdrop-blur-sm rounded-full px-2.5 py-1.5">
        {exhibit.images.map((img, i) => (
          <button
            key={img.url}
            onClick={() => go(i)}
            className={`rounded-full transition-all ${i === index ? 'w-4 h-1.5 bg-wheat' : 'w-1.5 h-1.5 bg-field/30 hover:bg-field/50'}`}
            title={img.title}
          />
        ))}
      </div>
    </div>
  )
}

/** 图片加载失败时的占位底图 */
function CoverFallback({ exhibit }: { exhibit: Exhibit }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${exhibit.placeholderColor}, ${exhibit.placeholderColor}99)` }}
    >
      <div className="text-center px-8">
        <ImageIcon className="w-16 h-16 text-rice-light/60 mx-auto mb-3" />
        <p className="text-rice-light/85 text-lg font-serif">{exhibit.title}</p>
      </div>
    </div>
  )
}

export default function InfoPanel() {
  const { selectedExhibit, selectExhibit } = useExhibitStore()

  // 详情打开时释放浏览器指针锁定，让光标回来可点击面板按钮
  useEffect(() => {
    if (selectedExhibit && document.pointerLockElement) {
      document.exitPointerLock()
    }
  }, [selectedExhibit])

  useEffect(() => {
    if (!selectedExhibit) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectExhibit(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedExhibit, selectExhibit])

  if (!selectedExhibit) return null

  const handleClose = () => selectExhibit(null)

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-field-dark/45 backdrop-blur-sm animate-fade-in" onClick={handleClose} />

      <div className="relative z-10 w-full sm:max-w-3xl sm:mx-4 max-h-[92dvh] sm:max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl border border-wheat/45 bg-rice-light shadow-2xl animate-scale-in flex flex-col">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-rice/90 backdrop-blur-sm border border-field/25 flex items-center justify-center text-field/70 hover:text-field-dark hover:border-field/50 hover:bg-wheat/15 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row overflow-y-auto md:overflow-hidden max-h-[92dvh] md:max-h-[90vh]">
          {/* 媒体区：整套素材轮播 */}
          <div className="md:w-3/5 aspect-[4/3] md:aspect-auto md:min-h-[400px] relative flex-shrink-0">
            <Carousel exhibit={selectedExhibit} />
          </div>

          {/* 信息区 */}
          <div className="md:w-2/5 p-5 md:p-7 md:overflow-y-auto space-y-4 bg-rice-light">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-wheat" />
                <span className="text-field/70 text-xs tracking-wider">
                  {selectedExhibit.category}
                  {selectedExhibit.images.length > 1 ? ` · ${selectedExhibit.images.length} 件轮播` : ''}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-field-dark leading-tight font-serif">{selectedExhibit.title}</h2>
            </div>

            <div className="flex items-center gap-2 text-field/85">
              <User className="w-4 h-4" />
              <span className="text-sm font-serif">{selectedExhibit.artist}</span>
            </div>

            <div className="w-14 h-px bg-gradient-to-r from-wheat/70 to-transparent" />

            <p className="text-field-dark/70 leading-relaxed text-sm">{selectedExhibit.description}</p>

            {/* 点赞 + 游客点评 */}
            <ReviewsSection exhibitId={selectedExhibit.id} />

            <div className="bg-rice rounded-xl p-4 border border-field/10 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-wheat" />
                <span className="text-field/60 text-xs tracking-wider">展位信息</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-field/45">编号</span>
                  <span className="text-field-dark/70">{selectedExhibit.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-field/45">素材</span>
                  <span className="text-field-dark/70">{selectedExhibit.images.length} 件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-field/45">门类</span>
                  <span className="text-field-dark/70">{selectedExhibit.series}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-field/45">展板</span>
                  <span className="text-field-dark/70">{selectedExhibit.width.toFixed(1)}×{selectedExhibit.height.toFixed(1)}m</span>
                </div>
              </div>
            </div>

            <p className="text-field/35 text-xs pt-1">
              点击背景或按 ESC 关闭 · 左右箭头切换素材
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
