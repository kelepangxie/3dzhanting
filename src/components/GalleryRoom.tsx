import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import useExhibitStore from '@/store/useExhibitStore'
import type { FloorStyle } from '@/store/useExhibitStore'
import { BigTree, MushroomCluster, Bush } from './Decorations'
import { PASTORAL, HALL, wallWobble, SCHOOL, CANVAS_SERIF, CANVAS_SANS } from '@/theme'

/* ---------------- 程序纹理：地面 ---------------- */

function createFloorTexture(style: FloorStyle, repeat: [number, number] = [9, 6]) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  if (style === 'grass') {
    // 草坪：柔和草绿底 + 放射状草叶笔触（参考案例的草地地面）
    ctx.fillStyle = PASTORAL.grass
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const len = 4 + Math.random() * 7
      const bend = (Math.random() - 0.5) * 4
      const shade = Math.random()
      ctx.strokeStyle =
        shade > 0.66
          ? `rgba(143, 179, 131, ${0.25 + Math.random() * 0.3})`
          : shade > 0.33
            ? `rgba(127, 174, 122, ${0.2 + Math.random() * 0.3})`
            : `rgba(168, 199, 155, ${0.25 + Math.random() * 0.35})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(x + bend, y - len * 0.6, x + bend * 1.6, y - len)
      ctx.stroke()
    }
    // 大块明暗色斑，模拟草地的自然光影
    for (let i = 0; i < 26; i++) {
      const gx = Math.random() * 512
      const gy = Math.random() * 512
      const r = 40 + Math.random() * 90
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, r)
      const light = Math.random() > 0.5
      grad.addColorStop(0, light ? 'rgba(213, 231, 197, 0.10)' : 'rgba(120, 155, 110, 0.10)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(gx - r, gy - r, r * 2, r * 2)
    }
  } else if (style === 'wood') {
    // 原木竹板地板：暖棕板条 + 木纹
    ctx.fillStyle = '#C9AD82'
    ctx.fillRect(0, 0, 512, 512)
    for (let y = 0; y < 512; y += 42) {
      const tint = Math.random() * 18 - 9
      ctx.fillStyle = `rgb(${201 + tint}, ${173 + tint}, ${130 + tint})`
      ctx.fillRect(0, y, 512, 40)
      for (let i = 0; i < 14; i++) {
        ctx.strokeStyle = `rgba(107, 79, 58, ${0.05 + Math.random() * 0.07})`
        ctx.lineWidth = 1
        ctx.beginPath()
        const gy = y + 4 + Math.random() * 34
        ctx.moveTo(0, gy)
        ctx.bezierCurveTo(170, gy + (Math.random() * 6 - 3), 340, gy + (Math.random() * 6 - 3), 512, gy)
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(107, 79, 58, 0.55)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(512, y)
      ctx.stroke()
    }
  } else if (style === 'stone') {
    // 青石板：冷灰绿石板 + 缝隙间一点青苔
    ctx.fillStyle = '#74806E'
    ctx.fillRect(0, 0, 512, 512)
    const tileSize = 86
    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 6; y++) {
        const tint = Math.random() * 14 - 7
        ctx.fillStyle = `rgb(${173 + tint}, ${175 + tint}, ${159 + tint})`
        ctx.fillRect(x * tileSize + 3, y * tileSize + 3, tileSize - 6, tileSize - 6)
      }
    }
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(76, 122, 78, ${Math.random() * 0.12})`
      const x = Math.random() * 512
      const y = Math.random() * 512
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3)
    }
  } else {
    // 夯土：暖土色 + 夯层肌理
    ctx.fillStyle = '#C2A382'
    ctx.fillRect(0, 0, 512, 512)
    for (let y = 0; y < 512; y += 36) {
      ctx.fillStyle = `rgba(154, 124, 92, ${0.15 + Math.random() * 0.15})`
      ctx.fillRect(0, y, 512, 3)
      ctx.fillStyle = `rgba(233, 217, 168, ${Math.random() * 0.08})`
      ctx.fillRect(0, y + 4, 512, 30)
    }
    for (let i = 0; i < 2200; i++) {
      const dark = Math.random() > 0.5
      ctx.fillStyle = dark ? `rgba(107, 79, 58, ${Math.random() * 0.12})` : `rgba(250, 247, 238, ${Math.random() * 0.1})`
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeat[0], repeat[1])
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ---------------- 程序纹理：墙面 ---------------- */

function createWallTexture(wallColor: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = wallColor
  ctx.fillRect(0, 0, 512, 512)

  // 细腻宣纸肌理颗粒（放大画布后更精细）
  for (let i = 0; i < 4200; i++) {
    ctx.fillStyle = `rgba(107, 79, 58, ${Math.random() * 0.022})`
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5)
  }
  // 柔和的灰泥晕斑：让曲面墙有手工批荡的有机质感
  for (let i = 0; i < 46; i++) {
    const gx = Math.random() * 512
    const gy = Math.random() * 512
    const r = 30 + Math.random() * 80
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, r)
    const light = Math.random() > 0.5
    grad.addColorStop(0, light ? 'rgba(255, 253, 246, 0.05)' : 'rgba(96, 84, 66, 0.035)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(gx - r, gy - r, r * 2, r * 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(20, 3)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ---------------- 程序纹理：悬挂横幅（校训 / 展讯） ---------------- */

function createBannerTexture(kind: 'motto' | 'title') {
  const canvas = document.createElement('canvas')
  canvas.width = 360
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  if (kind === 'motto') {
    ctx.fillStyle = PASTORAL.field
    ctx.fillRect(0, 0, 360, 1024)
    ctx.strokeStyle = PASTORAL.wheat
    ctx.lineWidth = 6
    ctx.strokeRect(14, 14, 332, 996)
    ctx.strokeStyle = 'rgba(233, 217, 168, 0.4)'
    ctx.lineWidth = 2
    ctx.strokeRect(28, 28, 304, 968)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = PASTORAL.riceLight
    const chars = [...SCHOOL.mottoFull.replace(' · ', '')]
    ctx.font = `bold 92px ${CANVAS_SERIF}`
    chars.forEach((ch, i) => {
      ctx.fillText(ch, 180, 150 + i * 150)
    })
    ctx.font = `26px ${CANVAS_SANS}`
    ctx.fillStyle = 'rgba(250, 247, 238, 0.72)'
    ctx.fillText(`${SCHOOL.name}`, 180, 150 + chars.length * 150 + 40)
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024)
    gradient.addColorStop(0, PASTORAL.fieldDark)
    gradient.addColorStop(1, PASTORAL.field)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 360, 1024)
    ctx.strokeStyle = PASTORAL.wheat
    ctx.lineWidth = 6
    ctx.strokeRect(14, 14, 332, 996)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = PASTORAL.riceLight
    const chars = [...'八桂采鲜']
    ctx.font = `bold 92px ${CANVAS_SERIF}`
    chars.forEach((ch, i) => {
      ctx.fillText(ch, 180, 140 + i * 140)
    })
    ctx.font = `bold 56px ${CANVAS_SERIF}`
    ctx.fillStyle = PASTORAL.wheatLight
    ctx.fillText('亲子同欢', 180, 140 + chars.length * 140 + 40)
    ctx.font = `24px ${CANVAS_SANS}`
    ctx.fillStyle = 'rgba(250, 247, 238, 0.7)'
    ctx.fillText('刀马组创意海报展', 180, 140 + chars.length * 140 + 110)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ---------------- 参数化椭圆曲面墙 ---------------- */

interface WallOptions {
  height: number
  /** 径向缩放（1=贴外墙轮廓） */
  radialScale?: number
  thetaStart?: number
  thetaLength?: number
  /** 顶部内收比例，形成洞穴收拢感 */
  lean?: number
}

function buildCurvedWallGeometry({ height, radialScale = 1, thetaStart = 0, thetaLength = Math.PI * 2, lean = 0.035 }: WallOptions) {
  const SEGMENTS = 128
  const ROWS = 10
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const cols = Math.max(2, Math.round((SEGMENTS * thetaLength) / (Math.PI * 2)) + 1)

  for (let i = 0; i < cols; i++) {
    const t = thetaStart + (thetaLength * i) / (cols - 1)
    const wobble = wallWobble(t)
    for (let j = 0; j <= ROWS; j++) {
      const v = j / ROWS
      const shrink = 1 - lean * v * v
      const rx = HALL.RX * wobble * radialScale * shrink
      const rz = HALL.RZ * wobble * radialScale * shrink
      positions.push(Math.cos(t) * rx, v * height, Math.sin(t) * rz)
      uvs.push(i / (cols - 1), v)
    }
  }
  for (let i = 0; i < cols - 1; i++) {
    for (let j = 0; j < ROWS; j++) {
      const a = i * (ROWS + 1) + j
      const b = a + ROWS + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/* ---------------- 穹顶（带椭圆天窗 + 肋木 + 金环收边） ---------------- */

function buildDomeGeometry() {
  // 旋转曲面：从墙顶（平均半径）收拢到天窗内环，按长短轴比例整体缩放成椭圆
  const avgR = (HALL.RX + HALL.RZ) / 2
  const oculusR = HALL.OCULUS
  const steps = 28
  const points: THREE.Vector2[] = []
  for (let i = 0; i <= steps; i++) {
    const v = i / steps
    const ease = 1 - Math.cos((v * Math.PI) / 2) // 先缓后陡的穹顶曲线
    const r = THREE.MathUtils.lerp(avgR, oculusR, ease)
    const y = HALL.HEIGHT + Math.sin((v * Math.PI) / 2) * HALL.DOME
    points.push(new THREE.Vector2(r, y))
  }
  const geo = new THREE.LatheGeometry(points, 96)
  geo.scale(HALL.RX / avgR, 1, HALL.RZ / avgR)
  return geo
}

/** 穹顶上一根木肋：沿穹顶剖面曲线从墙顶走到天窗内环 */
function buildDomeRibGeometry(angleDeg: number) {
  const avgR = (HALL.RX + HALL.RZ) / 2
  const sx = HALL.RX / avgR
  const sz = HALL.RZ / avgR
  const t = (angleDeg * Math.PI) / 180
  const pts: THREE.Vector3[] = []
  const steps = 14
  for (let i = 0; i <= steps; i++) {
    const v = i / steps
    const ease = 1 - Math.cos((v * Math.PI) / 2)
    const r = THREE.MathUtils.lerp(avgR, HALL.OCULUS, ease)
    const y = HALL.HEIGHT + Math.sin((v * Math.PI) / 2) * HALL.DOME
    pts.push(new THREE.Vector3(Math.cos(t) * r * sx, y, Math.sin(t) * r * sz))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.055, 8, false)
}

/** 沿椭圆周长的闭合曲线（供环形装饰条用） */
function ellipseCurve(y: number, radialScale: number, segments = 64) {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2
    const w = wallWobble(t)
    pts.push(new THREE.Vector3(Math.cos(t) * HALL.RX * w * radialScale, y, Math.sin(t) * HALL.RZ * w * radialScale))
  }
  return new THREE.CatmullRomCurve3(pts, true)
}

/* ---------------- 房间主体 ---------------- */

export default function GalleryRoom() {
  const { decorations } = useExhibitStore()
  const floorTexture = useMemo(() => createFloorTexture(decorations.floorStyle), [decorations.floorStyle])
  const wallTexture = useMemo(() => createWallTexture(decorations.wallColor), [decorations.wallColor])
  const mottoTexture = useMemo(() => createBannerTexture('motto'), [])
  const titleTexture = useMemo(() => createBannerTexture('title'), [])

  // 主墙：留出入口缺口（朝 +Z，中心 90°）
  const gapHalf = (HALL.ENTRANCE_SPAN / 2) * (Math.PI / 180)
  const center = Math.PI / 2
  const wallThetaStart = center + gapHalf
  const wallThetaLength = Math.PI * 2 - HALL.ENTRANCE_SPAN * (Math.PI / 180)
  const wallGeo = useMemo(
    () => buildCurvedWallGeometry({ height: HALL.HEIGHT, thetaStart: wallThetaStart, thetaLength: wallThetaLength }),
    [wallThetaStart, wallThetaLength],
  )

  // 草绿色弧形墙裙（贴墙矮环）
  const wainscotGeo = useMemo(
    () => buildCurvedWallGeometry({ height: 0.55, radialScale: 0.995, thetaStart: wallThetaStart, thetaLength: wallThetaLength, lean: 0 }),
    [wallThetaStart, wallThetaLength],
  )

  const domeGeo = useMemo(() => buildDomeGeometry(), [])

  // 穹顶木肋（8 根，均匀放射）与天窗金环
  const ribGeos = useMemo(
    () => Array.from({ length: 8 }, (_, i) => buildDomeRibGeometry((i / 8) * 360 + 22.5)),
    [],
  )
  const avgR = (HALL.RX + HALL.RZ) / 2
  const oculusRingGeo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < 48; i++) {
      const t = (i / 48) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(t) * HALL.OCULUS * (HALL.RX / avgR), HALL.HEIGHT + HALL.DOME - 0.03, Math.sin(t) * HALL.OCULUS * (HALL.RZ / avgR)))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 96, 0.07, 10, true)
  }, [avgR])

  // 墙裙顶部的原木压边条（勾勒 0.55m 高的弧形墙裙）
  const wainscotRailGeo = useMemo(() => new THREE.TubeGeometry(ellipseCurve(0.55, 0.995), 160, 0.045, 8, true), [])

  const floorRoughness = decorations.floorStyle === 'wood' ? 0.5 : decorations.floorStyle === 'stone' ? 0.75 : 0.95
  const floorMetalness = 0.02

  return (
    <group>
      {/* 椭圆地面（比墙外扩一点，草坪延伸到墙外）；颜色纹理兼作凹凸贴图，草叶/板缝有立体感 */}
      <mesh key={`floor-${decorations.floorStyle}`} rotation={[-Math.PI / 2, 0, 0]} scale={[HALL.RX + 1.2, HALL.RZ + 1.2, 1]} receiveShadow>
        <circleGeometry args={[1, 96]} />
        <meshStandardMaterial
          map={floorTexture}
          bumpMap={floorTexture}
          bumpScale={decorations.floorStyle === 'grass' ? 0.12 : 0.06}
          roughness={floorRoughness}
          metalness={floorMetalness}
        />
      </mesh>

      {/* 洞穴式曲面主墙（白色哑光 + 灰泥肌理 + 微凹凸，顶部内收） */}
      <mesh key={`wall-${decorations.wallColor}`} geometry={wallGeo} receiveShadow castShadow={false}>
        <meshStandardMaterial map={wallTexture} bumpMap={wallTexture} bumpScale={0.035} roughness={0.92} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* 弧形草绿墙裙 + 原木压顶条 */}
      <mesh geometry={wainscotGeo}>
        <meshStandardMaterial color={PASTORAL.fieldLight} roughness={0.8} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={wainscotRailGeo}>
        <meshStandardMaterial color={PASTORAL.wood} roughness={0.5} metalness={0.05} />
      </mesh>

      {/* 穹顶 + 8 根放射木肋 + 天窗麦穗金收边环 */}
      <mesh geometry={domeGeo}>
        <meshStandardMaterial color={decorations.wallColor} roughness={0.95} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      {ribGeos.map((geo, i) => (
        <mesh key={`rib-${i}`} geometry={geo}>
          <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.6} metalness={0.03} />
        </mesh>
      ))}
      <mesh geometry={oculusRingGeo}>
        <meshStandardMaterial color={PASTORAL.wheat} roughness={0.28} metalness={0.75} />
      </mesh>

      {/* 天窗：直接透出 Scene 里的真实天空 */}
      <Oculus />

      {/* 户外世界：草坪、土路、森林、白云（天空由 Scene 的 Sky 提供） */}
      <OutdoorWorld />

      {/* 悬挂横幅：入口内侧左右两幅，从穹顶垂下 */}
      <HangingBanner position={[-2.6, HALL.HEIGHT - 0.9, 5.6]} rotationY={Math.PI} texture={titleTexture} height={2.6} />
      <HangingBanner position={[2.6, HALL.HEIGHT - 0.9, 5.6]} rotationY={Math.PI} texture={mottoTexture} height={2.6} />

      {/* 环形灯带勾勒墙顶曲线（柔和白光，弱化直射灯） */}
      <TopRingLight />
    </group>
  )
}

/* ---------------- 天窗 ---------------- */

function Oculus() {
  // 天窗里直接看到真实天空（Scene 中的 Sky），不再放假的天空盘
  return (
    <group position={[0, 0, 0]}>
      {/* 柔光光柱：从天窗洒向地面 */}
      <mesh position={[0, HALL.HEIGHT * 0.52, 0]}>
        <cylinderGeometry args={[HALL.OCULUS * 0.55, HALL.OCULUS * 1.05, HALL.HEIGHT * 0.96, 40, 1, true]} />
        <meshBasicMaterial
          color="#FFF9E6"
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* 天窗主灯：柔和聚光洒向地面中心 */}
      <spotLight
        position={[0, HALL.HEIGHT + HALL.DOME - 0.4, 0]}
        angle={0.95}
        penumbra={0.9}
        intensity={2.4}
        distance={22}
        decay={1.4}
        color="#FFFDF0"
        target-position={[0, 0, 0]}
      />
    </group>
  )
}

/* ---------------- 卡通白云（蓝天白云的低多边形团云，缓慢漂移） ---------------- */

function PuffCloud({
  position,
  scale = 1,
  seed = 0,
}: {
  position: [number, number, number]
  scale?: number
  seed?: number
}) {
  // 确定性伪随机：每朵云形态稳定
  const rand = (n: number) => {
    const x = Math.sin(seed * 91.7 + n * 47.3) * 43758.5453
    return x - Math.floor(x)
  }
  const puffs = useMemo(() => {
    const list: { pos: [number, number, number]; r: number }[] = [
      { pos: [0, 0, 0], r: 1 },
      { pos: [1.15, -0.08, 0.12], r: 0.72 },
      { pos: [-1.1, -0.05, -0.1], r: 0.78 },
      { pos: [0.45, 0.34, -0.2], r: 0.62 },
      { pos: [-0.5, 0.3, 0.18], r: 0.55 },
    ]
    return list.map((p, i) => ({
      pos: [p.pos[0] + (rand(i) - 0.5) * 0.3, p.pos[1] + (rand(i + 7) - 0.5) * 0.12, p.pos[2] + (rand(i + 13) - 0.5) * 0.3] as [number, number, number],
      r: p.r * (0.88 + rand(i + 21) * 0.24),
    }))
  }, [rand])

  return (
    <group position={position} scale={[scale, scale * 0.72, scale]}>
      {puffs.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[p.r, 12, 10]} />
          <meshStandardMaterial color="#FFFFFF" roughness={1} metalness={0} emissive="#F4F8FF" emissiveIntensity={0.18} />
        </mesh>
      ))}
    </group>
  )
}

/** 云层：绕展厅缓慢漂移的白云（useFrame 里整组旋转，开销极低） */
function CloudLayer() {
  const ref = useRef<THREE.Group>(null)
  const skyDriftRef = useRef<THREE.Group>(null)
  const clouds = useMemo(() => {
    const rand = (n: number) => {
      const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
      return x - Math.floor(x)
    }
    return Array.from({ length: 9 }, (_, i) => {
      const a = rand(i * 3 + 1) * Math.PI * 2
      const r = 26 + rand(i * 3 + 2) * 40
      return {
        pos: [Math.cos(a) * r, 15 + rand(i * 3 + 3) * 22, Math.sin(a) * r] as [number, number, number],
        scale: 3.2 + rand(i * 3 + 4) * 3.4,
        seed: i,
      }
    })
  }, [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    if (ref.current) ref.current.rotation.y += delta * 0.0045
    // 天窗上空的低空云：沿 X 往返漂移，保证抬头常见白云
    if (skyDriftRef.current) {
      skyDriftRef.current.position.x = Math.sin(t * 0.028) * 14
      skyDriftRef.current.position.z = Math.cos(t * 0.021) * 8
    }
  })

  return (
    <group>
      <group ref={ref}>
        {clouds.map((c, i) => (
          <PuffCloud key={i} position={c.pos} scale={c.scale} seed={c.seed} />
        ))}
      </group>
      {/* 天窗常客：低空大朵白云，缓慢横越天窗上空 */}
      <group ref={skyDriftRef}>
        <PuffCloud position={[0, 30, 0]} scale={6} seed={11} />
        <PuffCloud position={[9, 34, 4]} scale={3.6} seed={12} />
      </group>
    </group>
  )
}

/* ---------------- 户外世界：天空下的草坪、土路与森林 ---------------- */

function OutdoorWorld() {
  const outerGrass = useMemo(() => createFloorTexture('grass', [96, 96]), [])
  const pathTexture = useMemo(() => createFloorTexture('rammed', [2, 9]), [])

  // 森林树环：确定性伪随机分布，避开展厅与门口观景走廊
  const trees = useMemo(() => {
    const rand = (n: number) => {
      const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
      return x - Math.floor(x)
    }
    const list: { x: number; z: number; s: number; tone: number }[] = []
    for (let i = 0; i < 70; i++) {
      const a = rand(i * 2 + 1) * Math.PI * 2
      let r = 16 + rand(i * 2 + 2) * 24
      const x0 = Math.cos(a) * r
      const z0 = Math.sin(a) * r
      // 入口（+Z）方向的观景走廊近处留空，把树推远
      if (Math.abs(x0) < 5.5 && z0 > 6 && r < 27) r = 27 + rand(i * 2 + 3) * 9
      list.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.85 + rand(i * 2 + 4) * 0.55, tone: rand(i * 2 + 5) })
    }
    return list
  }, [])

  return (
    <group>
      {/* 蓝天白云：缓慢漂移的白云层（透过天窗与门口可见） */}
      <CloudLayer />

      {/* 外圈大草坪（延伸进雾里，与天空相接） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[120, 72]} />
        <meshStandardMaterial map={outerGrass} roughness={0.95} metalness={0.02} />
      </mesh>

      {/* 门口夯土小路，通向森林 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 17.4]}>
        <planeGeometry args={[3.4, 18]} />
        <meshStandardMaterial map={pathTexture} roughness={0.9} metalness={0} />
      </mesh>

      {/* 近景大树：路两侧迎客 */}
      <BigTree position={[-4.3, 0, 10.8]} variant={4} scale={1.15} />
      <BigTree position={[4.0, 0, 12.0]} variant={5} scale={1.05} />
      <BigTree position={[-7.4, 0, 14.0]} variant={6} scale={1.25} />
      <BigTree position={[7.6, 0, 15.2]} variant={7} scale={1.1} />

      {/* 路边蘑菇与灌木 */}
      <MushroomCluster position={[1.85, 0, 11.2]} />
      <MushroomCluster position={[-2.2, 0, 13.4]} />
      <Bush position={[3.4, 0, 9.8]} />
      <Bush position={[-3.8, 0, 10.6]} scale={1.15} />

      {/* 森林树环（实例化渲染，仅几个 draw call） */}
      <Instances limit={80}>
        <cylinderGeometry args={[0.14, 0.22, 2.6, 7]} />
        <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.9} metalness={0} />
        {trees.map((t, i) => (
          <Instance key={i} position={[t.x, 1.3 * t.s, t.z]} scale={t.s} />
        ))}
      </Instances>
      <Instances limit={220}>
        <sphereGeometry args={[1.15, 10, 10]} />
        <meshStandardMaterial roughness={0.95} metalness={0} />
        {trees.flatMap((t, i) =>
          [0, 1, 2].map((k) => {
            const s = t.s * (1.25 - k * 0.22)
            const color =
              k === 0 ? PASTORAL.fieldDark : k === 1 ? (t.tone > 0.5 ? PASTORAL.field : PASTORAL.grassDark) : PASTORAL.fieldLight
            return (
              <Instance
                key={`${i}-${k}`}
                position={[t.x + (k - 1) * 0.75 * t.s, (3.1 + k * 0.85) * t.s, t.z + ((k % 2) - 0.5) * 0.8 * t.s]}
                scale={[s, s * 0.92, s]}
                color={color}
              />
            )
          }),
        )}
      </Instances>
    </group>
  )
}

/* ---------------- 悬挂横幅 ---------------- */

function HangingBanner({
  position,
  rotationY,
  texture,
  height,
}: {
  position: [number, number, number]
  rotationY: number
  texture: THREE.Texture
  height: number
}) {
  const width = height * 0.36
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 吊绳 */}
      {[-width / 2 + 0.06, width / 2 - 0.06].map((x) => (
        <mesh key={x} position={[x, height / 2 + 0.3, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 6]} />
          <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.6} />
        </mesh>
      ))}
      {/* 布面横幅（双面） */}
      <mesh castShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* 底部配重杆 */}
      <mesh position={[0, -height / 2 - 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, width + 0.1, 8]} />
        <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.55} />
      </mesh>
    </group>
  )
}

/* ---------------- 墙顶环形灯带 ---------------- */

function TopRingLight() {
  const curve = useMemo(() => {
    // 沿墙顶取一圈点，生成闭合 CatmullRom 曲线作为灯带轨迹
    const pts: THREE.Vector3[] = []
    const N = 48
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2
      const w = wallWobble(t)
      const shrink = 1 - 0.035 * 0.95 // 与墙体顶部内收一致
      pts.push(new THREE.Vector3(Math.cos(t) * HALL.RX * w * shrink * 0.99, HALL.HEIGHT - 0.28, Math.sin(t) * HALL.RZ * w * shrink * 0.99))
    }
    return new THREE.CatmullRomCurve3(pts, true)
  }, [])

  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 160, 0.035, 8, true), [curve])

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#FFF6DC" />
      </mesh>
      {/* 灯带补光：四处暖点光，避免逐段 pointLight 的性能开销 */}
      <pointLight position={[HALL.RX * 0.62, HALL.HEIGHT - 0.6, 0]} intensity={0.5} color="#FFF1D6" distance={11} decay={2} />
      <pointLight position={[-HALL.RX * 0.62, HALL.HEIGHT - 0.6, 0]} intensity={0.5} color="#FFF1D6" distance={11} decay={2} />
      <pointLight position={[0, HALL.HEIGHT - 0.6, HALL.RZ * 0.6]} intensity={0.5} color="#FFF1D6" distance={11} decay={2} />
      <pointLight position={[0, HALL.HEIGHT - 0.6, -HALL.RZ * 0.6]} intensity={0.5} color="#FFF1D6" distance={11} decay={2} />
    </group>
  )
}
