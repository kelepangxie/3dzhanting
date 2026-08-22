import { useMemo, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import useExhibitStore from '@/store/useExhibitStore'
import type { Exhibit } from '@/data/exhibits'
import { PASTORAL, hallPoint, hallFacing, CANVAS_SERIF, CANVAS_SANS } from '@/theme'

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

// 四座展台呼应四季策展：春耕 / 夏耘 / 秋收 / 冬藏（沿椭圆内圈环形布置）
const PEDESTAL_MODELS: PedestalModelConfig[] = [
  { position: hallPoint(160, 0.52, 0), label: '春耕', color: '#7FAE7A', geometry: 'torusKnot' },
  { position: hallPoint(20, 0.52, 0), label: '夏耘', color: '#4C7A4E', geometry: 'icosahedron' },
  { position: hallPoint(-55, 0.52, 0), label: '秋收', color: '#C9A227', geometry: 'dodecahedron' },
  { position: hallPoint(-125, 0.52, 0), label: '冬藏', color: '#6B4F3A', geometry: 'octahedron' },
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
      {/* 梯田层叠底座：深绿 → 主绿 → 浅绿（高分段圆柱 + 原木夹层压边） */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.4, 0.28, 24]} />
        <meshStandardMaterial color={PASTORAL.fieldDark} roughness={0.65} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.285, 0]}>
        <torusGeometry args={[0.35, 0.018, 8, 32]} />
        <meshStandardMaterial color={PASTORAL.wood} roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.24, 24]} />
        <meshStandardMaterial color={PASTORAL.field} roughness={0.65} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.525, 0]}>
        <torusGeometry args={[0.295, 0.016, 8, 32]} />
        <meshStandardMaterial color={PASTORAL.wood} roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.28, 0.16, 24]} />
        <meshStandardMaterial color={PASTORAL.fieldLight} roughness={0.65} metalness={0.02} />
      </mesh>
      {/* 原木台面（带微倒角感的高分圆柱） */}
      <mesh position={[0, 0.71, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.285, 0.05, 24]} />
        <meshStandardMaterial color={PASTORAL.woodLight} roughness={0.5} metalness={0.05} />
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

/* ---------------- 原木长椅（板条椅面 + 板条靠背） ---------------- */

function Bench({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const seatY = 0.46
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 板条椅面：5 根圆角木条，条间留缝 */}
      {[-0.21, -0.105, 0, 0.105, 0.21].map((z) => (
        <mesh key={z} position={[0, seatY, z]} castShadow>
          <boxGeometry args={[2.0, 0.045, 0.082]} />
          <meshStandardMaterial color="#9C7A55" roughness={0.6} metalness={0.03} />
        </mesh>
      ))}
      {/* 椅面下纵向衬木 */}
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, seatY - 0.05, 0]} castShadow>
          <boxGeometry args={[0.09, 0.06, 0.56]} />
          <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.55} metalness={0.03} />
        </mesh>
      ))}
      {/* 板条靠背：3 根略后倾 */}
      {[0.06, 0.16, 0.26].map((z, i) => (
        <mesh key={z} position={[0, 0.62 + i * 0.115, -0.245 - z]} rotation={[0.16, 0, 0]} castShadow>
          <boxGeometry args={[2.0, 0.05, 0.07]} />
          <meshStandardMaterial color="#9C7A55" roughness={0.6} metalness={0.03} />
        </mesh>
      ))}
      {/* 靠背立柱（与后腿一体） */}
      {[-0.85, 0.85].map((x) => (
        <mesh key={`bp${x}`} position={[x, 0.48, -0.27]} rotation={[0.16, 0, 0]} castShadow>
          <boxGeometry args={[0.07, 0.95, 0.07]} />
          <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
      {/* 前腿（微外撇） */}
      {[
        [-0.85, 0.2],
        [0.85, 0.2],
        [-0.85, -0.2],
        [0.85, -0.2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x * 1.04, 0.22, z]} rotation={[0, 0, x > 0 ? -0.05 : 0.05]}>
          <cylinderGeometry args={[0.034, 0.042, 0.44, 10]} />
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
    // 陶盆绿植：带沿口的花盆 + 多团簇叶球
    return (
      <group position={position}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.17, 0.4, 16]} />
          <meshStandardMaterial color="#B5703F" roughness={0.75} metalness={0.02} />
        </mesh>
        {/* 盆口沿边 */}
        <mesh position={[0, 0.4, 0]}>
          <torusGeometry args={[0.215, 0.028, 8, 24]} />
          <meshStandardMaterial color="#9A5C33" roughness={0.65} metalness={0.02} />
        </mesh>
        {/* 土面 */}
        <mesh position={[0, 0.405, 0]}>
          <circleGeometry args={[0.19, 16]} />
          <meshStandardMaterial color="#5C4632" roughness={1} />
        </mesh>
        {/* 簇叶：主团 + 三侧团，色阶递进 */}
        <mesh position={[0, 0.64, 0]} castShadow>
          <sphereGeometry args={[0.3, 14, 12]} />
          <meshStandardMaterial color="#3A6B3A" roughness={0.8} metalness={0} />
        </mesh>
        <mesh position={[0.13, 0.79, 0.1]} castShadow>
          <sphereGeometry args={[0.2, 12, 10]} />
          <meshStandardMaterial color="#4C7A4E" roughness={0.8} metalness={0} />
        </mesh>
        <mesh position={[-0.14, 0.73, -0.08]} castShadow>
          <sphereGeometry args={[0.18, 12, 10]} />
          <meshStandardMaterial color="#356037" roughness={0.8} metalness={0} />
        </mesh>
        <mesh position={[0.02, 0.88, -0.14]} castShadow>
          <sphereGeometry args={[0.13, 12, 10]} />
          <meshStandardMaterial color="#7FAE7A" roughness={0.8} metalness={0} />
        </mesh>
      </group>
    )
  }
  // 竹丛
  return (
    <group position={position}>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.19, 0.28, 16]} />
        <meshStandardMaterial color="#B5703F" roughness={0.75} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <torusGeometry args={[0.235, 0.028, 8, 24]} />
        <meshStandardMaterial color="#9A5C33" roughness={0.65} metalness={0.02} />
      </mesh>
      {[
        { x: 0, h: 1.7, tilt: 0 },
        { x: 0.12, h: 1.4, tilt: 0.1 },
        { x: -0.11, h: 1.55, tilt: -0.08 },
      ].map((stalk, i) => (
        <group key={i} position={[stalk.x, 0.28, 0]} rotation={[0, 0, stalk.tilt]}>
          <mesh position={[0, stalk.h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.03, stalk.h, 8]} />
            <meshStandardMaterial color="#6B8E4E" roughness={0.65} metalness={0} />
          </mesh>
          {[0.9, 1.2, 1.5].slice(0, i + 2).map((y, j) => (
            <mesh key={j} position={[0.09 * (j % 2 === 0 ? 1 : -1), Math.min(y, stalk.h - 0.15), 0]} rotation={[0, 0, -0.9 * (j % 2 === 0 ? 1 : -1)]}>
              <coneGeometry args={[0.05, 0.42, 6]} />
              <meshStandardMaterial color="#4C7A4E" roughness={0.75} metalness={0} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ---------------- 田园大树（树干 + 团状树冠 + 果实点缀） ---------------- */

export function BigTree({
  position,
  scale = 1,
  variant = 0,
  shadow = false,
}: {
  position: [number, number, number]
  scale?: number
  variant?: number
  shadow?: boolean
}) {
  // 确定性伪随机保证每棵树形态稳定
  const rand = useCallback(
    (n: number) => {
      const x = Math.sin(variant * 127.1 + n * 311.7) * 43758.5453
      return x - Math.floor(x)
    },
    [variant],
  )
  const canopy = useMemo(() => {
    const blobs: { pos: [number, number, number]; r: number; color: string }[] = [
      { pos: [0, 3.05, 0], r: 1.05, color: PASTORAL.fieldDark },
      { pos: [0.72, 2.7, 0.28], r: 0.72, color: PASTORAL.field },
      { pos: [-0.66, 2.78, -0.3], r: 0.8, color: PASTORAL.field },
      { pos: [0.12, 3.72, -0.12], r: 0.78, color: PASTORAL.fieldLight },
      { pos: [-0.2, 3.3, 0.62], r: 0.6, color: PASTORAL.fieldLight },
    ]
    return blobs.map((b, idx) => ({
      ...b,
      pos: [b.pos[0] + (rand(idx) - 0.5) * 0.24, b.pos[1], b.pos[2] + (rand(idx + 9) - 0.5) * 0.24] as [number, number, number],
    }))
  }, [rand])

  // 树冠上的小果实（呼应农产品主题）
  const fruits = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = rand(i + 20) * Math.PI * 2
        const rr = 0.62 + rand(i + 30) * 0.5
        const y = 2.5 + rand(i + 40) * 1.1
        return [Math.cos(a) * rr, y, Math.sin(a) * rr] as [number, number, number]
      }),
    [rand],
  )

  return (
    <group position={position} scale={scale}>
      {/* 树干（下段 + 微倾上段） */}
      <mesh position={[0, 0.78, 0]} castShadow={shadow}>
        <cylinderGeometry args={[0.15, 0.23, 1.56, 9]} />
        <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.85} metalness={0} />
      </mesh>
      <mesh position={[0.05, 2.0, 0.03]} rotation={[0.04, 0, -0.06]} castShadow={shadow}>
        <cylinderGeometry args={[0.09, 0.14, 1.3, 8]} />
        <meshStandardMaterial color={PASTORAL.wood} roughness={0.85} metalness={0} />
      </mesh>
      {/* 根部隆起 */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + variant
        return (
          <mesh key={i} position={[Math.cos(a) * 0.22, 0.1, Math.sin(a) * 0.22]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[0.14, 7, 7]} />
            <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.9} />
          </mesh>
        )
      })}
      {/* 团状树冠 */}
      {canopy.map((b, i) => (
        <mesh key={i} position={b.pos} castShadow={shadow}>
          <sphereGeometry args={[b.r, 10, 10]} />
          <meshStandardMaterial color={b.color} roughness={0.9} metalness={0} />
        </mesh>
      ))}
      {/* 果实 */}
      {fruits.map((p, i) => (
        <mesh key={`f${i}`} position={p}>
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshStandardMaterial color="#E08E3C" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- 童话蘑菇丛（红伞白点 + 褐伞） ---------------- */

function Mushroom({
  position,
  scale = 1,
  red = true,
  tilt = 0,
}: {
  position: [number, number, number]
  scale?: number
  red?: boolean
  tilt?: number
}) {
  const spots: [number, number, number][] = [
    [0.34, 0.4, 0.1],
    [-0.28, 0.46, 0.22],
    [0.05, 0.5, -0.32],
    [-0.22, 0.34, -0.3],
    [0.26, 0.26, 0.3],
  ]
  return (
    <group position={position} scale={scale} rotation={[0, 0, tilt]}>
      {/* 菌柄 */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.065, 0.28, 8]} />
        <meshStandardMaterial color="#EFE3C8" roughness={0.85} />
      </mesh>
      {/* 菌盖（压扁半球） */}
      <mesh position={[0, 0.3, 0]} scale={[1, 0.62, 1]} castShadow>
        <sphereGeometry args={[0.19, 12, 12]} />
        <meshStandardMaterial color={red ? '#C44536' : '#A9713F'} roughness={0.55} />
      </mesh>
      {/* 白点（红伞专属） */}
      {red &&
        spots.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.028, 6, 6]} />
            <meshStandardMaterial color="#F6EFDD" roughness={0.7} />
          </mesh>
        ))}
    </group>
  )
}

export function MushroomCluster({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Mushroom position={[0, 0, 0]} scale={1.15} red tilt={0.05} />
      <Mushroom position={[0.28, 0, 0.12]} scale={0.75} red={false} tilt={-0.12} />
      <Mushroom position={[-0.24, 0, 0.18]} scale={0.62} red tilt={0.16} />
      {/* 草叶衬底 */}
      {[0.42, -0.38, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 0.07, i % 2 === 0 ? -0.2 : 0.28]} rotation={[0, 0, x * 0.3]}>
          <coneGeometry args={[0.05, 0.22, 5]} />
          <meshStandardMaterial color={PASTORAL.grassDark} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- 灌木与小花 ---------------- */

export function Bush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.42, 9, 9]} />
        <meshStandardMaterial color={PASTORAL.fieldDark} roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 0.24, 0.12]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color={PASTORAL.field} roughness={0.9} />
      </mesh>
      <mesh position={[-0.28, 0.22, -0.1]}>
        <sphereGeometry args={[0.26, 8, 8]} />
        <meshStandardMaterial color={PASTORAL.grassDark} roughness={0.9} />
      </mesh>
    </group>
  )
}

function FlowerPatch({ position }: { position: [number, number, number] }) {
  const flowers = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + 0.7
        const rr = 0.12 + (i % 3) * 0.1
        const colors = ['#E8A0B4', '#F5D547', '#FAF7EE', '#E08E3C', '#D98CB3']
        return {
          pos: [Math.cos(a) * rr, 0, Math.sin(a) * rr] as [number, number, number],
          h: 0.2 + (i % 2) * 0.08,
          color: colors[i],
        }
      }),
    [],
  )
  return (
    <group position={position}>
      {flowers.map((f, i) => (
        <group key={i} position={f.pos}>
          <mesh position={[0, f.h / 2, 0]}>
            <cylinderGeometry args={[0.008, 0.01, f.h, 5]} />
            <meshStandardMaterial color={PASTORAL.grassDark} roughness={0.9} />
          </mesh>
          <mesh position={[0, f.h + 0.02, 0]}>
            <sphereGeometry args={[0.045, 7, 7]} />
            <meshStandardMaterial color={f.color} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------------- 树桩（田园小凳） ---------------- */

function TreeStump({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.31, 0.44, 10]} />
        <meshStandardMaterial color={PASTORAL.wood} roughness={0.85} />
      </mesh>
      {/* 顶面年轮 */}
      <mesh position={[0, 0.445, 0]}>
        <cylinderGeometry args={[0.245, 0.245, 0.012, 10]} />
        <meshStandardMaterial color="#D9BE93" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.452, 0]}>
        <torusGeometry args={[0.13, 0.008, 6, 20]} />
        <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.8} />
      </mesh>
      {/* 侧面小芽 */}
      <mesh position={[0.2, 0.42, 0.1]} rotation={[0.5, 0, -0.6]}>
        <coneGeometry args={[0.04, 0.2, 5]} />
        <meshStandardMaterial color={PASTORAL.field} roughness={0.85} />
      </mesh>
    </group>
  )
}

/* ---------------- 萤火虫光点（森林氛围） ---------------- */

function Fireflies({
  center,
  count = 10,
  radius = 2.2,
}: {
  center: [number, number, number]
  count?: number
  radius?: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        phase: (i / count) * Math.PI * 2 + Math.sin(i * 12.9) * 2.1,
        speed: 0.25 + Math.abs(Math.sin(i * 7.3)) * 0.4,
        r: radius * (0.45 + Math.abs(Math.sin(i * 3.7)) * 0.55),
        y: 0.7 + Math.abs(Math.sin(i * 5.1)) * 2.2,
        bob: 0.3 + Math.abs(Math.cos(i * 9.4)) * 0.5,
      })),
    [count, radius],
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const children = groupRef.current?.children
    if (!children) return
    for (let i = 0; i < children.length; i++) {
      const s = seeds[i]
      children[i].position.set(
        Math.cos(t * s.speed + s.phase) * s.r,
        s.y + Math.sin(t * s.bob + s.phase) * 0.3,
        Math.sin(t * s.speed * 0.85 + s.phase * 1.3) * s.r,
      )
    }
  })

  return (
    <group ref={groupRef} position={center}>
      {seeds.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color="#FFE9A0" transparent opacity={0.85} />
        </mesh>
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
          {/* 长椅沿椭圆内圈，弧线朝向圆心 */}
          <group position={hallPoint(60, 0.45, 0)} rotation={[0, hallFacing(60), 0]}>
            <Bench position={[0, 0, 0]} rotationY={Math.PI / 2} />
          </group>
          <group position={hallPoint(-20, 0.45, 0)} rotation={[0, hallFacing(-20), 0]}>
            <Bench position={[0, 0, 0]} rotationY={Math.PI / 2} />
          </group>
          <group position={hallPoint(-160, 0.45, 0)} rotation={[0, hallFacing(-160), 0]}>
            <Bench position={[0, 0, 0]} rotationY={Math.PI / 2} />
          </group>
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
          {/* 麻绳护栏围住四座四季展台 */}
          {PEDESTAL_MODELS.map((config) => (
            <group key={`rope-${config.label}`} position={config.position}>
              <RopeBarrier position={[0, 0, 1.0]} rotationY={0} width={2.2} />
              <RopeBarrier position={[0, 0, -1.0]} rotationY={0} width={2.2} />
            </group>
          ))}
        </>
      )}

      {decorations.showPlants && (
        <>
          {/* 绿植竹丛贴着弧墙间隙点缀 */}
          <PlantPot position={hallPoint(138, 0.93, 0)} variant={0} />
          <PlantPot position={hallPoint(48, 0.93, 0)} variant={1} />
          <PlantPot position={hallPoint(-38, 0.93, 0)} variant={0} />
          <PlantPot position={hallPoint(-70, 0.93, 0)} variant={1} />
          <PlantPot position={hallPoint(-100, 0.93, 0)} variant={0} />
          <PlantPot position={hallPoint(-131, 0.93, 0)} variant={1} />

          {/* 田园大树：嵌在展品间隙的弧墙边（167°/19°/-161° 均避开展板与长椅） */}
          <BigTree position={hallPoint(167, 0.86, 0)} variant={1} shadow />
          <BigTree position={hallPoint(19, 0.86, 0)} variant={2} shadow scale={0.92} />
          <BigTree position={hallPoint(-161, 0.86, 0)} variant={3} shadow scale={1.08} />

          {/* 童话蘑菇丛：树脚 + 门侧 + 展品间隙 */}
          <MushroomCluster position={hallPoint(172, 0.78, 0)} />
          <MushroomCluster position={hallPoint(14, 0.78, 0)} />
          <MushroomCluster position={hallPoint(-156, 0.78, 0)} />
          <MushroomCluster position={hallPoint(82, 0.8, 0)} />
          <MushroomCluster position={hallPoint(42, 0.8, 0)} />
          <MushroomCluster position={hallPoint(-78, 0.8, 0)} />

          {/* 灌木填补墙边空隙 */}
          <Bush position={hallPoint(55, 0.88, 0)} />
          <Bush position={hallPoint(-45, 0.88, 0)} scale={0.9} />
          <Bush position={hallPoint(-105, 0.88, 0)} />
          <Bush position={hallPoint(-135, 0.88, 0)} scale={1.1} />

          {/* 田园小花点缀步道两侧 */}
          <FlowerPatch position={[2.4, 0, 4.6]} />
          <FlowerPatch position={[-2.2, 0, 5.0]} />
          <FlowerPatch position={[1.4, 0, 2.2]} />
          <FlowerPatch position={[-1.6, 0, -0.8]} />
          <FlowerPatch position={[2.8, 0, -2.6]} />

          {/* 树桩小凳：长椅旁与树脚 */}
          <TreeStump position={[6.5, 0, -2.3]} />
          <TreeStump position={[9.3, 0, 3.4]} rotationY={1.2} />

          {/* 萤火虫光点：树冠与门外小径附近漂浮 */}
          <Fireflies center={hallPoint(167, 0.86, 2.2)} count={10} />
          <Fireflies center={hallPoint(-161, 0.86, 2.2)} count={10} />
          <Fireflies center={[0, 2, 12]} count={8} radius={2.6} />
        </>
      )}

      {decorations.showInfoStands && (
        <>
          <group position={hallPoint(108, 0.8, 0)} rotation={[0, hallFacing(108), 0]}>
            <InfoStand position={[0, 0, 0]} rotationY={0} title="展厅导览" body="春耕 · 夏耘 · 秋收 · 冬藏\n点击展品查看详情" />
          </group>
          <group position={hallPoint(72, 0.8, 0)} rotation={[0, hallFacing(72), 0]}>
            <InfoStand position={[0, 0, 0]} rotationY={0} title="参观须知" body="请勿触摸展品\n轻声慢步 文明观展" />
          </group>
        </>
      )}
    </group>
  )
}
