import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, Environment } from '@react-three/drei'
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

/** 太阳方向（与主平行光一致，供 Sky 与阴影共用） */
const SUN = [30, 140, 20] as [number, number, number]

/**
 * 程序化环境贴图：把一小间「蓝天 + 草地 + 暖阳」的场景烘焙成 IBL，
 * 全部离线生成（Environment 的 children 模式，不请求任何外部资源），
 * 让墙面/木框/金属件获得柔和的反光质感。
 */
function ProceduralEnv() {
  return (
    <Environment frames={1} resolution={128} background={false}>
      {/* 天空半球：上蓝下白的柔和渐变 */}
      <mesh scale={80}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial color="#BDD9F2" side={1} />
      </mesh>
      {/* 地面（草地绿） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} scale={60}>
        <circleGeometry args={[1, 24]} />
        <meshBasicMaterial color="#9DBF8E" />
      </mesh>
      {/* 暖阳亮斑 */}
      <mesh position={SUN.map((v) => v * 0.45) as [number, number, number]}>
        <sphereGeometry args={[6, 12, 12]} />
        <meshBasicMaterial color="#FFF6DE" />
      </mesh>
    </Environment>
  )
}

export default function Scene() {
  const { selectedExhibit, controlMode, isTouch } = useExhibitStore()

  return (
    <Canvas
      shadows="soft"
      camera={{ fov: 72, near: 0.1, far: 1000, position: [0, HALL.EYE_HEIGHT, 6.2] }}
      gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.15 }}
      dpr={[1, isTouch ? 1.5 : 2]}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      {/* 蓝天白云：通透的晴天（低浊度=纯净蓝），透过天窗与门洞可见 */}
      <Sky distance={800} sunPosition={SUN} turbidity={2.6} rayleigh={1.1} mieCoefficient={0.003} mieDirectionalG={0.85} />
      <fog attach="fog" args={[PASTORAL.sky, 30, 110]} />

      {/* IBL 环境反射（离线烘焙） */}
      <ProceduralEnv />

      {/* 柔和天光：上暖下绿的环境光，营造天窗洒光的明亮氛围 */}
      <hemisphereLight args={['#FBFDF4', PASTORAL.grassDark, 0.9]} />
      <ambientLight intensity={0.28} color="#FFFDF5" />
      {/* 天窗方向的主光：从正上方柔和洒下（太阳方向与 Sky 一致） */}
      <directionalLight
        position={[3, 14, 2]}
        intensity={0.95}
        color="#FFFDF0"
        castShadow={isTouch ? false : true}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-far={45}
      />
      {/* 对侧补光：消阴影面的死黑，无阴影开销 */}
      <directionalLight position={[-8, 10, -6]} intensity={0.18} color="#EAF2FF" />

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
