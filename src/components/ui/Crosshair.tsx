import useExhibitStore from '@/store/useExhibitStore'

export default function Crosshair() {
  const { isLocked, selectedExhibit, controlMode, isTouch } = useExhibitStore()

  // 导览模式不需要准星
  if (selectedExhibit || controlMode === 'tour') return null
  // 电脑端需锁定后才显示；触屏漫游常显小点
  if (!isTouch && !isLocked) return null

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
      <div className="relative w-5 h-5">
        <div className="absolute top-1/2 left-0 w-full h-px bg-field-dark/35" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-field-dark/35" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-wheat/80" />
      </div>
    </div>
  )
}
