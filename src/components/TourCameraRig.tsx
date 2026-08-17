import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import useExhibitStore from '@/store/useExhibitStore'

/**
 * 导览模式相机：把相机平滑飞行到 tourTarget 指定的位置与朝向。
 * 位置阻尼趋近 + 朝向四元数插值，产生「漫步到展品面前」的镜头感。
 */
export default function TourCameraRig() {
  const { camera } = useThree()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const targetPos = useMemo(() => new THREE.Vector3(), [])
  const targetQ = useMemo(() => new THREE.Quaternion(), [])

  useFrame((_, delta) => {
    const t = useExhibitStore.getState().tourTarget
    if (!t) return

    targetPos.set(t.pos[0], t.pos[1], t.pos[2])
    camera.position.lerp(targetPos, 1 - Math.exp(-3.2 * delta))

    dummy.position.copy(camera.position)
    dummy.lookAt(t.look[0], t.look[1], t.look[2])
    targetQ.copy(dummy.quaternion)
    camera.quaternion.slerp(targetQ, 1 - Math.exp(-4 * delta))
  })

  return null
}
