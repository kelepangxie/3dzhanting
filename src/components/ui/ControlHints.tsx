import useExhibitStore from '@/store/useExhibitStore'
import { MousePointer2, Move, Eye, Hand, Map } from 'lucide-react'

export default function ControlHints() {
  const { isLocked, selectedExhibit, controlMode, isTouch, isLoading } = useExhibitStore()

  if (selectedExhibit || isLoading) return null

  // 导览模式提示（电脑/手机通用）
  if (controlMode === 'tour') {
    return (
      <div data-ui className="fixed top-16 sm:top-[4.5rem] left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fade-in">
        <div className="bg-rice/85 backdrop-blur-sm border border-wheat/35 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
          <Map className="w-3.5 h-3.5 text-wheat shrink-0" />
          <span className="text-field-dark/75 text-xs font-serif">
            点击下方缩略图参观 · 点击展品查看详情
          </span>
        </div>
      </div>
    )
  }

  // 触屏漫游提示
  if (isTouch) {
    return (
      <div data-ui className="fixed top-16 sm:top-[4.5rem] left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fade-in">
        <div className="bg-rice/85 backdrop-blur-sm border border-wheat/35 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
          <Hand className="w-3.5 h-3.5 text-wheat shrink-0" />
          <span className="text-field-dark/75 text-xs font-serif">
            左侧摇杆移动 · 拖动屏幕转视角 · 点击展品看详情
          </span>
        </div>
      </div>
    )
  }

  // 电脑漫游：未锁定 → 点击进入；已锁定 → 键鼠提示
  if (!isLocked) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="animate-pulse-glow">
          <div
            onClick={() => window.dispatchEvent(new CustomEvent('gallery:enter'))}
            className="bg-rice-light/95 backdrop-blur-md border border-wheat/50 rounded-2xl px-8 py-6 text-center pointer-events-auto cursor-pointer shadow-lg"
          >
            <MousePointer2 className="w-8 h-8 text-wheat mx-auto mb-3" />
            <p className="text-field-dark text-lg font-serif font-medium mb-1">点击进入展厅</p>
            <p className="text-field/55 text-sm">踏进田野，漫步展厅</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 left-6 z-20 pointer-events-none">
      <div className="bg-rice/85 backdrop-blur-md border border-wheat/30 rounded-xl px-4 py-3 space-y-2 shadow-sm">
        <div className="flex items-center gap-3">
          <Move className="w-4 h-4 text-field/70" />
          <div className="flex gap-1">
            <KeyCap>W</KeyCap>
            <KeyCap>A</KeyCap>
            <KeyCap>S</KeyCap>
            <KeyCap>D</KeyCap>
          </div>
          <span className="text-field/60 text-xs">移动</span>
        </div>
        <div className="flex items-center gap-3">
          <Eye className="w-4 h-4 text-field/70" />
          <span className="text-field/60 text-xs">鼠标转动视角 · 点击展品查看详情 · ESC 退出</span>
        </div>
      </div>
    </div>
  )
}

function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-field/10 border border-field/30 text-field-dark text-xs font-mono">
      {children}
    </span>
  )
}
