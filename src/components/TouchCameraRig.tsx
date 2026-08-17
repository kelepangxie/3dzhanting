import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import useExhibitStore from '@/store/useExhibitStore'
import { playerInput, resetPlayerInput } from '@/lib/playerInput'
import { clampToHall, HALL } from '@/theme'

const MOVE_SPEED = 3.6
const DAMPING = 10
const PITCH_LIMIT = Math.PI / 2 - 0.15

/**
 * 触屏漫游相机：读取 playerInput 单例（摇杆 + 拖动视角），
 * 每帧移动相机并限制在展厅范围内。仅挂载时激活 isLocked（触屏无指针锁定）。
 */
export default function TouchCameraRig() {
  const { camera } = useThree()
  const velocity = useRef(new THREE.Vector3())

  useEffect(() => {
    useExhibitStore.getState().setLocked(true)
    camera.rotation.order = 'YXZ'
    resetPlayerInput()
    return () => {
      useExhibitStore.getState().setLocked(false)
      resetPlayerInput()
    }
  }, [camera])

  useFrame((_, delta) => {
    // 视角（拖动增量）
    camera.rotation.y += playerInput.yawDelta
    camera.rotation.x += playerInput.pitchDelta
    camera.rotation.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, camera.rotation.x))
    playerInput.yawDelta = 0
    playerInput.pitchDelta = 0

    // 移动（摇杆，相对相机水平朝向）
    const yaw = camera.rotation.y
    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw))
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw))
    const moveDir = new THREE.Vector3()
    moveDir.addScaledVector(forward, playerInput.moveY)
    moveDir.addScaledVector(right, playerInput.moveX)
    if (moveDir.lengthSq() > 1) moveDir.normalize()

    const targetVel = moveDir.multiplyScalar(MOVE_SPEED)
    velocity.current.lerp(targetVel, 1 - Math.exp(-DAMPING * delta))

    const newPos = camera.position.clone().addScaledVector(velocity.current, delta)
    newPos.y = HALL.EYE_HEIGHT

    // 椭圆展厅行走边界（离墙安全距离）
    const [cx, cz] = clampToHall(newPos.x, newPos.z)
    newPos.x = cx
    newPos.z = cz

    camera.position.copy(newPos)
  })

  return null
}
