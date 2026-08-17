// 触屏设备检测：优先 pointer: coarse（手机/平板），退回 ontouchstart
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  )
}
