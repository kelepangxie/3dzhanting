import { useEffect, useState } from 'react'
import useExhibitStore from '@/store/useExhibitStore'
import exhibits from '@/data/exhibits'
import type { Exhibit } from '@/data/exhibits'
import ReviewsSection from './ReviewsSection'
import { X, User, Image, Video, FileText, ChevronLeft, ChevronRight } from 'lucide-react'

/** 媒体区：优先加载真实图片/视频（public/placeholders/ 下同名文件），失败则显示宣纸风占位 */
function MediaArea({ exhibit }: { exhibit: Exhibit }) {
  const [failed, setFailed] = useState(false)
  const isVideo = exhibit.type === 'video'

  if (!failed) {
    return isVideo ? (
      <video
        key={exhibit.id}
        src={exhibit.mediaUrl}
        controls
        playsInline
        onError={() => setFailed(true)}
        className="w-full h-full object-contain bg-field-dark/90"
      />
    ) : (
      <img
        key={exhibit.id}
        src={exhibit.mediaUrl}
        alt={exhibit.title}
        onError={() => setFailed(true)}
        className="w-full h-full object-contain bg-field-dark/90"
      />
    )
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${exhibit.placeholderColor}, ${exhibit.placeholderColor}99)`,
      }}
    >
      <div className="text-center px-8">
        {isVideo ? <Video className="w-16 h-16 text-rice-light/60 mx-auto mb-3" /> : <Image className="w-16 h-16 text-rice-light/60 mx-auto mb-3" />}
        <p className="text-rice-light/85 text-lg font-serif">{exhibit.title}</p>
        <p className="text-rice-light/50 text-sm mt-1.5 font-serif">
          {isVideo ? '视频' : '图片'}占位展示 · 将真实作品放入 public{exhibit.mediaUrl} 后自动替换
        </p>
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

  const index = selectedExhibit ? exhibits.findIndex((e) => e.id === selectedExhibit.id) : -1

  const goPrev = () => {
    if (index < 0) return
    selectExhibit(exhibits[(index - 1 + exhibits.length) % exhibits.length])
  }
  const goNext = () => {
    if (index < 0) return
    selectExhibit(exhibits[(index + 1) % exhibits.length])
  }

  useEffect(() => {
    if (!selectedExhibit) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'Escape') selectExhibit(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!selectedExhibit) return null

  const isVideo = selectedExhibit.type === 'video'
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
          {/* 媒体区 */}
          <div className="md:w-3/5 aspect-[4/3] md:aspect-auto md:min-h-[400px] relative flex-shrink-0">
            <MediaArea exhibit={selectedExhibit} />

            <div className="absolute bottom-3 left-3 right-3 flex gap-2 z-10">
              <button
                onClick={goPrev}
                className="w-9 h-9 rounded-full bg-rice/90 backdrop-blur-sm border border-field/20 flex items-center justify-center text-field/70 hover:text-field-dark hover:border-wheat transition-colors"
                title="上一件展品"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex-1" />
              <button
                onClick={goNext}
                className="w-9 h-9 rounded-full bg-rice/90 backdrop-blur-sm border border-field/20 flex items-center justify-center text-field/70 hover:text-field-dark hover:border-wheat transition-colors"
                title="下一件展品"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 信息区 */}
          <div className="md:w-2/5 p-5 md:p-7 md:overflow-y-auto space-y-4 bg-rice-light">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {isVideo ? <Video className="w-4 h-4 text-wheat" /> : <Image className="w-4 h-4 text-wheat" />}
                <span className="text-field/70 text-xs tracking-wider">
                  {isVideo ? '视频展品' : '图片展品'}
                  {selectedExhibit.category ? ` · ${selectedExhibit.category}` : ''}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-field-dark leading-tight font-serif">
                {selectedExhibit.title}
              </h2>
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
                <span className="text-field/60 text-xs tracking-wider">展品信息</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-field/45">编号</span>
                  <span className="text-field-dark/70">{selectedExhibit.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-field/45">类型</span>
                  <span className="text-field-dark/70">{isVideo ? '视频' : '图片'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-field/45">门类</span>
                  <span className="text-field-dark/70">{selectedExhibit.category || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-field/45">尺寸</span>
                  <span className="text-field-dark/70">{selectedExhibit.width}×{selectedExhibit.height}m</span>
                </div>
              </div>
            </div>

            <p className="text-field/35 text-xs pt-1">
              点击背景或按 ESC 关闭 · 左右箭头切换展品
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
