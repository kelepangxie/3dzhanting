import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import useExhibitStore from '@/store/useExhibitStore'
import type { Exhibit } from '@/data/exhibits'
import { PASTORAL, CANVAS_SERIF, CANVAS_SANS } from '@/theme'

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/* ---------------- 梯田展台（春耕·夏耘·秋收·冬藏） ---------------- */

interface PedestalModelConfig {
  position: [number, number, number]
  label: string
  color: string
  geometry: 'torusKnot' | 'icosahedron' | 'dodecahedron' | 'octahedron'
}

// 四座展台呼应四季策展：春耕 / 夏耘 / 秋收 / 冬藏
const PEDESTAL_MODELS: PedestalModelConfig[] = [
  { position: [-4, 0, -3], label: '春耕', color: '#7FAE7A', geometry: 'torusKnot' },
  { position: [4, 0, -3], label: '夏耘', color: '#4C7A4E', geometry: 'icosahedron' },
  { position: [-4, 0, 3], label: '秋收', color: '#C9A227', geometry: 'dodecahedron' },
  { position: [4, 0, 3], label: '冬藏', color: '#6B4F3A', geometry: 'octahedron' },
]

function createPedestalModelTexture(label: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createRadialGradient(128, 128, 20, 128, 128, 128)
  gradient.addColorStop(0, adjustColor(color, 40))
  gradient.addColorStop(1, color)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)

  ctx.strokeStyle = 'rgba(233, 217, 168, 0.4)'
  ctx.lineWidth = 3
  ctx.strokeRect(8, 8, 240, 240)

  ctx.fillStyle = 'rgba(250, 247, 238, 0.85)'
  ctx.font = `bold 64px ${CANVAS_SERIF}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 128, 120)

  ctx.fillStyle = 'rgba(250, 247, 238, 0.45)'
  ctx.font = `18px ${CANVAS_SANS}`
  ctx.fillText('四季策展 · 装置占位', 128, 168)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function PedestalWithModel({ config }: { config: PedestalModelConfig }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => createPedestalModelTexture(config.label, config.color), [config])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group position={config.position}>
      {/* 梯田层叠底座：深绿 → 主绿 → 浅绿 */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.4, 0.28, 8]} />
        <meshStandardMaterial color={PASTORAL.fieldDark} roughness={0.7} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.24, 8]} />
        <meshStandardMaterial color={PASTORAL.field} roughness={0.7} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.28, 0.16, 8]} />
        <meshStandardMaterial color={PASTORAL.fieldLight} roughness={0.7} metalness={0.02} />
      </mesh>
      {/* 原木台面 */}
      <mesh position={[0, 0.71, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.28, 0.05, 8]} />
        <meshStandardMaterial color={PASTORAL.woodLight} roughness={0.55} metalness={0.05} />
      </mesh>

      <group position={[0, 1.2, 0]}>
        <mesh ref={meshRef} castShadow>
          {config.geometry === 'torusKnot' && <torusKnotGeometry args={[0.2, 0.06, 64, 16]} />}
          {config.geometry === 'icosahedron' && <icosahedronGeometry args={[0.25, 0]} />}
          {config.geometry === 'dodecahedron' && <dodecahedronGeometry args={[0.25, 0]} />}
          {config.geometry === 'octahedron' && <octahedronGeometry args={[0.25, 0]} />}
          <meshStandardMaterial map={texture} roughness={0.35} metalness={0.25} color="#ffffff" />
        </mesh>

        <pointLight position={[0, 0.8, 0]} intensity={0.4} color="#FFF6E0" distance={3} />
      </group>
    </group>
  )
}

/* ---------------- 原木长椅 ---------------- */

function Bench({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[2.0, 0.08, 0.6]} />
        <meshStandardMaterial color="#9C7A55" roughness={0.65} metalness={0.03} />
      </mesh>
      <mesh position={[0, 0.72, -0.26]} castShadow>
        <boxGeometry args={[2.0, 0.5, 0.06]} />
        <meshStandardMaterial color="#9C7A55" roughness={0.65} metalness={0.03} />
      </mesh>
      {[
        [-0.85, 0.2],
        [0.85, 0.2],
        [-0.85, -0.2],
        [0.85, -0.2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]}>
          <boxGeometry args={[0.07, 0.44, 0.07]} />
          <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- 宣纸价签 ---------------- */

function createPriceTagTexture(exhibit: Exhibit) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = PASTORAL.riceLight
  ctx.fillRect(0, 0, 256, 128)
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.7)'
  ctx.lineWidth = 3
  ctx.strokeRect(5, 5, 246, 118)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = PASTORAL.fieldDark
  ctx.font = `bold 32px ${CANVAS_SERIF}`
  ctx.fillText(exhibit.price || '', 128, 45)

  ctx.fillStyle = PASTORAL.field
  ctx.font = `18px ${CANVAS_SANS}`
  ctx.fillText(exhibit.title, 128, 90)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function PriceTag({ exhibit }: { exhibit: Exhibit }) {
  if (!exhibit.price) return null

  const texture = useMemo(() => createPriceTagTexture(exhibit), [exhibit])

  return (
    <group
      position={[exhibit.position.x, exhibit.position.y - exhibit.height / 2 - 0.62, exhibit.position.z]}
      rotation={[0, exhibit.rotationY, 0]}
    >
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshStandardMaterial map={texture} roughness={0.85} transparent />
      </mesh>
    </group>
  )
}

/* ---------------- 麻绳护栏 ---------------- */

function RopeBarrier({ position, rotationY = 0, width = 2 }: { position: [number, number, number]; rotationY?: number; width?: number }) {
  const halfW = width / 2
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-halfW, halfW].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.0, 12]} />
            <meshStandardMaterial color={PASTORAL.wood} roughness={0.5} metalness={0.1} />
          </mesh>
          <mesh position={[0, 1.02, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color={PASTORAL.wheatLight} roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.13, 0.15, 0.04, 12]} />
            <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.5} metalness={0.1} />
          </mesh>
        </group>
      ))}
      {/* 麻绳 */}
      <mesh position={[0, 0.85, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, width, 8]} />
        <meshStandardMaterial color="#C9B08A" roughness={0.95} metalness={0} />
      </mesh>
    </group>
  )
}

/* ---------------- 绿植与竹丛 ---------------- */

function PlantPot({ position, variant = 0 }: { position: [number, number, number]; variant?: number }) {
  if (variant % 2 === 0) {
    // 陶盆绿植
    return (
      <group position={position}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.4, 8]} />
          <meshStandardMaterial color="#B5703F" roughness={0.8} metalness={0.02} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.24, 0.22, 0.04, 8]} />
          <meshStandardMaterial color="#9A5C33" roughness={0.7} metalness={0.02} />
        </mesh>
        <mesh position={[0, 0.62, 0]} castShadow>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#3A6B3A" roughness={0.85} metalness={0} />
        </mesh>
        <mesh position={[0.12, 0.78, 0.1]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#4C7A4E" roughness={0.85} metalness={0} />
        </mesh>
        <mesh position={[-0.13, 0.72, -0.08]} castShadow>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#356037" roughness={0.85} metalness={0} />
        </mesh>
      </group>
    )
  }
  // 竹丛
  return (
    <group position={position}>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.2, 0.28, 8]} />
        <meshStandardMaterial color="#B5703F" roughness={0.8} metalness={0.02} />
      </mesh>
      {[
        { x: 0, h: 1.7, tilt: 0 },
        { x: 0.12, h: 1.4, tilt: 0.1 },
        { x: -0.11, h: 1.55, tilt: -0.08 },
      ].map((stalk, i) => (
        <group key={i} position={[stalk.x, 0.28, 0]} rotation={[0, 0, stalk.tilt]}>
          <mesh position={[0, stalk.h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.03, stalk.h, 6]} />
            <meshStandardMaterial color="#6B8E4E" roughness={0.7} metalness={0} />
          </mesh>
          {[0.9, 1.2, 1.5].slice(0, i + 2).map((y, j) => (
            <mesh key={j} position={[0.09 * (j % 2 === 0 ? 1 : -1), Math.min(y, stalk.h - 0.15), 0]} rotation={[0, 0, -0.9 * (j % 2 === 0 ? 1 : -1)]}>
              <coneGeometry args={[0.05, 0.42, 5]} />
              <meshStandardMaterial color="#4C7A4E" roughness={0.8} metalness={0} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ---------------- 田园木导览牌 ---------------- */

function createInfoTexture(title: string, body: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 192
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = PASTORAL.riceLight
  ctx.fillRect(0, 0, 256, 192)
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.6)'
  ctx.lineWidth = 3
  ctx.strokeRect(5, 5, 246, 182)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = PASTORAL.fieldDark
  ctx.font = `bold 26px ${CANVAS_SERIF}`
  ctx.fillText(title, 128, 46)

  ctx.fillStyle = PASTORAL.field
  ctx.font = `17px ${CANVAS_SANS}`
  body.split('\n').forEach((line, i) => {
    ctx.fillText(line, 128, 100 + i * 30)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function InfoStand({ position, rotationY = 0, title = '展厅导览', body = '春耕 · 夏耘 · 秋收 · 冬藏\n点击展品查看详情' }: { position: [number, number, number]; rotationY?: number; title?: string; body?: string }) {
  const texture = useMemo(() => createInfoTexture(title, body), [title, body])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 1.2, 8]} />
        <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.15, 0.17, 0.04, 8]} />
        <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.55} metalness={0.05} />
      </mesh>
      <group position={[0, 1.25, 0]}>
        <mesh>
          <boxGeometry args={[0.52, 0.4, 0.025]} />
          <meshStandardMaterial color={PASTORAL.wood} roughness={0.6} metalness={0.03} />
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[0.47, 0.35]} />
          <meshStandardMaterial map={texture} roughness={0.85} transparent />
        </mesh>
      </group>
    </group>
  )
}

export default function Decorations({ exhibits }: { exhibits: Exhibit[] }) {
  const { decorations } = useExhibitStore()

  return (
    <group>
      {decorations.showPedestals && (
        <>
          {PEDESTAL_MODELS.map((config) => (
            <PedestalWithModel key={config.label} config={config} />
          ))}
        </>
      )}

      {decorations.showBenches && (
        <>
          <Bench position={[0, 0, -2]} rotationY={0} />
          <Bench position={[-8, 0, 0]} rotationY={Math.PI / 2} />
          <Bench position={[8, 0, 0]} rotationY={Math.PI / 2} />
        </>
      )}

      {decorations.showPriceTags && (
        <>
          {exhibits.filter(e => e.price).map((exhibit) => (
            <PriceTag key={`price-${exhibit.id}`} exhibit={exhibit} />
          ))}
        </>
      )}

      {decorations.showRopeBarriers && (
        <>
          <RopeBarrier position={[-4, 0, -1.5]} rotationY={0} width={2.5} />
          <RopeBarrier position={[4, 0, -1.5]} rotationY={0} width={2.5} />
          <RopeBarrier position={[-4, 0, 4.5]} rotationY={0} width={2.5} />
          <RopeBarrier position={[4, 0, 4.5]} rotationY={0} width={2.5} />
        </>
      )}

      {decorations.showPlants && (
        <>
          <PlantPot position={[-10, 0, -7]} variant={0} />
          <PlantPot position={[10, 0, -7]} variant={1} />
          <PlantPot position={[-10, 0, 7]} variant={1} />
          <PlantPot position={[10, 0, 7]} variant={0} />
          <PlantPot position={[-2.4, 0, 5.5]} variant={0} />
          <PlantPot position={[2.4, 0, 5.5]} variant={1} />
        </>
      )}

      {decorations.showInfoStands && (
        <>
          <InfoStand position={[-2.6, 0, 5]} rotationY={Math.PI} title="展厅导览" body="春耕 · 夏耘 · 秋收 · 冬藏\n点击展品查看详情" />
          <InfoStand position={[2.6, 0, 5]} rotationY={Math.PI} title="参观须知" body="请勿触摸展品\n轻声慢步 文明观展" />
        </>
      )}
    </group>
  )
}
