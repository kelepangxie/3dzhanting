import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import useExhibitStore from '@/store/useExhibitStore'
import { clampToHall, HALL } from '@/theme'

const MOVE_SPEED = 4
const DAMPING = 8

export default function PlayerControls() {
  const controlsRef = useRef<any>(null)
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const keys = useRef<Record<string, boolean>>({})
  const { setLocked, selectedExhibit } = useExhibitStore()
  const isLocked = useExhibitStore((s) => s.isLocked)

  const handleLock = useCallback(() => setLocked(true), [setLocked])
  const handleUnlock = useCallback(() => setLocked(false), [setLocked])

  // 打开展品详情时真正退出浏览器指针锁定（仅改 store 状态不会释放光标，鼠标会“卡死”）
  useEffect(() => {
    if (selectedExhibit && document.pointerLockElement) {
      document.exitPointerLock()
      controlsRef.current?.unlock?.()
    }
  }, [selectedExhibit])

  // 通过自定义事件触发锁定，而不是 drei 默认的「任意点击 document 即锁定」——
  // 默认行为会把点击顶栏按钮也变成指针锁定，导致整个 UI 无法再点击。
  useEffect(() => {
    const enter = () => controlsRef.current?.lock?.()
    window.addEventListener('gallery:enter', enter)
    return () => window.removeEventListener('gallery:enter', enter)
  }, [])

  // ESC 显式解锁兜底：常规浏览器会自行处理，但部分内嵌 webview 需要手动调用
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') controlsRef.current?.unlock?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (!controlsRef.current?.getObject()) return

    // 未锁定（详情面板打开 / 未进入展厅）时不响应移动键，避免面板内切换展品时相机漂移
    if (!isLocked) {
      velocity.current.multiplyScalar(Math.max(0, 1 - DAMPING * delta))
      return
    }

    const camera = controlsRef.current.getObject()
    const k = keys.current

    direction.current.set(0, 0, 0)
    if (k['KeyW'] || k['ArrowUp']) direction.current.z -= 1
    if (k['KeyS'] || k['ArrowDown']) direction.current.z += 1
    if (k['KeyA'] || k['ArrowLeft']) direction.current.x -= 1
    if (k['KeyD'] || k['ArrowRight']) direction.current.x += 1

    direction.current.normalize()

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    const moveDir = new THREE.Vector3()
    moveDir.addScaledVector(forward, -direction.current.z)
    moveDir.addScaledVector(right, direction.current.x)
    moveDir.normalize()

    const targetVel = moveDir.multiplyScalar(MOVE_SPEED)
    velocity.current.lerp(targetVel, 1 - Math.exp(-DAMPING * delta))

    const newPos = camera.position.clone()
    newPos.add(velocity.current.clone().multiplyScalar(delta))
    newPos.y = HALL.EYE_HEIGHT

    // 椭圆展厅行走边界（离墙安全距离）
    const [cx, cz] = clampToHall(newPos.x, newPos.z)
    newPos.x = cx
    newPos.z = cz

    camera.position.copy(newPos)
  })

  return (
    <PointerLockControls
      ref={controlsRef}
      selector="#gallery-lock-trigger-none"
      onLock={handleLock}
      onUnlock={handleUnlock}
    />
  )
}
