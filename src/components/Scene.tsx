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
import { PASTORAL } from '@/theme'

export default function Scene() {
  const { selectedExhibit, controlMode, isTouch } = useExhibitStore()

  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.7, 6] }}
      gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.05 }}
      dpr={[1, isTouch ? 1.5 : 2]}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <color attach="background" args={[PASTORAL.sky]} />
      <fog attach="fog" args={[PASTORAL.sky, 18, 38]} />

      {/* 天光 + 暖阳，营造明亮日光的田园氛围 */}
      <hemisphereLight args={[PASTORAL.sky, '#CBBFA6', 0.75]} />
      <ambientLight intensity={0.3} color="#FFFDF5" />
      <directionalLight
        position={[10, 12, 7]}
        intensity={1.05}
        color={PASTORAL.sunlight}
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

      {!selectedExhibit && controlMode === 'walk' && (
        isTouch ? <TouchCameraRig /> : <PlayerControls />
      )}
      {!selectedExhibit && controlMode === 'tour' && <TourCameraRig />}
    </Canvas>
  )
}
