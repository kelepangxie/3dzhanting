import { useRef, useEffect } from 'react'
import { playerInput } from '@/lib/playerInput'

/**
 * 触屏漫游控制的 DOM 覆盖层：
 * - 左下虚拟摇杆：控制走动（写入 playerInput.moveX/moveY）
 * - 其余区域单指拖动：转视角（写入 yawDelta/pitchDelta）
 * - 拖动超过阈值时置 dragged=true，防止转视角误触发展品选中
 *
 * 带有 data-ui 属性的元素（顶栏按钮、导览条等）不参与视角拖动。
 */
export default function TouchControls() {
  const joystickId = useRef<number | null>(null)

  useEffect(() => {
    const LOOK_SENS = 0.0042
    const DRAG_THRESHOLD = 14
    let lookId: number | null = null
    let lastX = 0
    let lastY = 0
    let dist = 0

    const isUI = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null
      return !!el?.closest?.('[data-ui]')
    }

    const onDown = (e: PointerEvent) => {
      if (isUI(e)) return
      if (e.pointerId === joystickId.current) return
      if (lookId !== null) return
      lookId = e.pointerId
      lastX = e.clientX
      lastY = e.clientY
      dist = 0
      playerInput.dragged = false
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== lookId) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      dist += Math.abs(dx) + Math.abs(dy)
      if (dist > DRAG_THRESHOLD) playerInput.dragged = true
      playerInput.yawDelta -= dx * LOOK_SENS
      playerInput.pitchDelta -= dy * LOOK_SENS
    }

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== lookId) return
      lookId = null
      // 等 click（点按选中展品）派发完再清除拖动标记
      setTimeout(() => {
        playerInput.dragged = false
      }, 300)
    }

    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return <Joystick onCapture={(id) => (joystickId.current = id)} />
}

function Joystick({ onCapture }: { onCapture: (id: number | null) => void }) {
  const baseRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const center = useRef({ x: 0, y: 0 })
  const RADIUS = 44

  const handleMove = (clientX: number, clientY: number) => {
    let dx = clientX - center.current.x
    let dy = clientY - center.current.y
    const len = Math.hypot(dx, dy)
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS
      dy = (dy / len) * RADIUS
    }
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`
    playerInput.moveX = dx / RADIUS
    playerInput.moveY = -dy / RADIUS
  }

  const start = (e: React.PointerEvent) => {
    e.stopPropagation()
    onCapture(e.pointerId)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const rect = (baseRef.current as HTMLElement).getBoundingClientRect()
    center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    handleMove(e.clientX, e.clientY)
  }

  const move = (e: React.PointerEvent) => {
    e.stopPropagation()
    handleMove(e.clientX, e.clientY)
  }

  const end = (e: React.PointerEvent) => {
    e.stopPropagation()
    onCapture(null)
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)'
    playerInput.moveX = 0
    playerInput.moveY = 0
  }

  return (
    <div
      data-ui
      ref={baseRef}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      className="fixed z-20 w-28 h-28 rounded-full touch-none select-none"
      style={{ left: '1.25rem', bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="absolute inset-0 rounded-full border-2 border-field/40 bg-rice/60 backdrop-blur-sm shadow-lg" />
      {/* 上下左右方向点 */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-field/40" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-field/40" />
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-field/40" />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-field/40" />
      <div
        ref={knobRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-field/80 border border-wheat/50 shadow-md transition-transform duration-75"
      />
    </div>
  )
}
