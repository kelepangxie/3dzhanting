import { useEffect } from 'react'
import Scene from '@/components/Scene'
import TouchControls from '@/components/TouchControls'
import InfoPanel from '@/components/ui/InfoPanel'
import DecorPanel from '@/components/ui/DecorPanel'
import ControlHints from '@/components/ui/ControlHints'
import LoadingScreen from '@/components/ui/LoadingScreen'
import Crosshair from '@/components/ui/Crosshair'
import TourBar from '@/components/ui/TourBar'
import GuestbookPanel from '@/components/ui/GuestbookPanel'
import useExhibitStore from '@/store/useExhibitStore'
import exhibits from '@/data/exhibits'
import { isTouchDevice } from '@/lib/device'
import { Sprout, Settings, MessagesSquare, Footprints, Map } from 'lucide-react'
import { EXHIBITION } from '@/theme'

export default function Home() {
  const {
    setTotalCount,
    incrementLoaded,
    setLoading,
    isLoading,
    showDecorPanel,
    setShowDecorPanel,
    selectedExhibit,
    showGuestbook,
    setShowGuestbook,
    controlMode,
    setControlMode,
    isTouch,
    setIsTouch,
    isLocked,
  } = useExhibitStore()

  useEffect(() => {
    const touch = isTouchDevice()
    setIsTouch(touch)
    // 触屏设备默认「导览模式」，保证流畅体验；可随时切换为摇杆漫游
    if (touch) setControlMode('tour')
  }, [setIsTouch, setControlMode])

  useEffect(() => {
    setTotalCount(exhibits.length)
    const timer = setTimeout(() => {
      for (let i = 0; i < exhibits.length; i++) {
        setTimeout(() => incrementLoaded(), i * 150)
      }
      setTimeout(() => setLoading(false), exhibits.length * 150 + 300)
    }, 500)
    return () => clearTimeout(timer)
  }, [setTotalCount, incrementLoaded, setLoading])

  const switchMode = (mode: 'walk' | 'tour') => {
    if (mode === 'tour' && document.pointerLockElement) {
      document.exitPointerLock()
    }
    setControlMode(mode)
  }

  // 顶栏：加载中 / 展品详情 / 面板打开 / 电脑端指针锁定时隐藏（锁定时鼠标被捕获，
  // ESC 退出锁定后重新出现；触屏的 isLocked 是常量，不隐藏）
  const showTopBar =
    !isLoading &&
    !selectedExhibit &&
    !showDecorPanel &&
    !showGuestbook &&
    !(isLocked && !isTouch)

  return (
    <div className="w-screen h-screen overflow-hidden bg-rice relative">
      <Scene />
      <Crosshair />
      <ControlHints />
      <InfoPanel />
      <DecorPanel />
      <GuestbookPanel />
      <LoadingScreen />

      {/* 触屏摇杆（仅触屏 + 漫游模式 + 未选中展品时） */}
      {isTouch && controlMode === 'walk' && !selectedExhibit && !showDecorPanel && !showGuestbook && <TouchControls />}

      {/* 导览模式缩略条 */}
      <TourBar />

      {/* 顶部标识（窄屏靠左，避免与右侧按钮重叠） */}
      {showTopBar && (
        <div data-ui className="fixed top-3 left-3 md:left-1/2 md:-translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-rice/85 backdrop-blur-sm border border-wheat/40 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 shadow-sm">
            <span className="text-field-dark text-sm sm:text-base font-serif tracking-wide flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-wheat shrink-0" />
              {EXHIBITION.title}
              <span className="hidden md:inline text-field/50 text-xs tracking-normal">· 刀马组</span>
            </span>
          </div>
        </div>
      )}

      {/* 顶栏按钮 */}
      {showTopBar && (
        <>
          <button
            data-ui
            onClick={() => switchMode(controlMode === 'walk' ? 'tour' : 'walk')}
            className="fixed top-3 right-[7.5rem] sm:right-[8.5rem] z-30 h-10 px-3 rounded-full bg-rice/85 backdrop-blur-sm border border-wheat/40 flex items-center justify-center gap-1.5 text-field-dark/85 hover:text-field-dark hover:border-wheat hover:bg-wheat/10 transition-all shadow-sm"
            title={controlMode === 'walk' ? '切换到导览模式（点击缩略图参观）' : '切换到漫游模式（自由行走）'}
          >
            {controlMode === 'walk' ? <Map className="w-4 h-4" /> : <Footprints className="w-4 h-4" />}
            <span className="text-sm font-serif">{controlMode === 'walk' ? '导览' : '漫游'}</span>
          </button>

          <button
            data-ui
            onClick={() => setShowGuestbook(true)}
            className="fixed top-3 right-[4.75rem] sm:right-[5.25rem] z-30 w-10 h-10 rounded-full bg-rice/85 backdrop-blur-sm border border-wheat/40 flex items-center justify-center text-field-dark/85 hover:text-field-dark hover:border-wheat hover:bg-wheat/10 transition-all shadow-sm"
            title="留言板"
          >
            <MessagesSquare className="w-4 h-4" />
          </button>

          <button
            data-ui
            onClick={() => setShowDecorPanel(true)}
            className="fixed top-3 right-3 z-30 w-10 h-10 rounded-full bg-rice/85 backdrop-blur-sm border border-wheat/40 flex items-center justify-center text-field-dark/85 hover:text-field-dark hover:border-wheat hover:bg-wheat/10 transition-all shadow-sm"
            title="展厅装饰设置"
          >
            <Settings className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  )
}
