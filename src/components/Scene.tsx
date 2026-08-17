import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import PlayerControls from './PlayerControls'
import TouchCameraRig from './TouchCameraRig'
import TourCameraRig from './TourCameraRig'
import GalleryRoom from './GalleryRoom'
import ExhibitFrame from './ExhibitFrame'
import Entrance from './Entrance'
import Decorations from './Decorations'
import exhibits from '@/data/exhibits'
import useExhibitStore from '@/store/useExhibitStore'
import { PASTORAL, HALL } from '@/theme'

export default function Scene() {
  const { selectedExhibit, controlMode, isTouch } = useExhibitStore()

  return (
    <Canvas
      shadows
      camera={{ fov: 72, near: 0.1, far: 120, position: [0, HALL.EYE_HEIGHT, 6.2] }}
      gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.12 }}
      dpr={[1, isTouch ? 1.5 : 2]}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <color attach="background" args={[PASTORAL.sky]} />
      <fog attach="fog" args={[PASTORAL.sky, 22, 46]} />

      {/* 柔和天光：上暖下绿的环境光，营造天窗洒光的明亮氛围 */}
      <hemisphereLight args={['#FBFDF4', PASTORAL.grassDark, 1.05]} />
      <ambientLight intensity={0.34} color="#FFFDF5" />
      {/* 天窗方向的主光：从正上方柔和洒下（天窗在穹顶中央） */}
      <directionalLight
        position={[3, 14, 2]}
        intensity={0.85}
        color="#FFFDF0"
        castShadow={isTouch ? false : true}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />

      <Suspense fallback={null}>
        <GalleryRoom />
        <Entrance />
        <Decorations exhibits={exhibits} />
        {exhibits.map((exhibit) => (
          <ExhibitFrame key={exhibit.id} exhibit={exhibit} />
        ))}
      </Suspense>

      {/* PlayerControls 常驻（不随选中展品卸载）：卸载时浏览器指针锁定不会释放，鼠标会“卡死” */}
      {controlMode === 'walk' && (isTouch ? <TouchCameraRig /> : <PlayerControls />)}
      {!selectedExhibit && controlMode === 'tour' && <TourCameraRig />}
    </Canvas>
  )
}
