import { useMemo } from 'react'
import * as THREE from 'three'
import useExhibitStore from '@/store/useExhibitStore'
import type { FloorStyle } from '@/store/useExhibitStore'
import { PASTORAL, HALL, wallWobble, SCHOOL, CANVAS_SERIF, CANVAS_SANS } from '@/theme'

/* ---------------- 程序纹理：地面 ---------------- */

function createFloorTexture(style: FloorStyle) {
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
  texture.repeat.set(9, 6)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createWallTexture(wallColor: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = wallColor
  ctx.fillRect(0, 0, 256, 256)

  // 宣纸肌理：细微颗粒
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(107, 79, 58, ${Math.random() * 0.02})`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2)
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

/* ---------------- 穹顶（带椭圆天窗） ---------------- */

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

  const floorRoughness = decorations.floorStyle === 'wood' ? 0.55 : decorations.floorStyle === 'stone' ? 0.8 : 0.95
  const floorMetalness = 0.02

  return (
    <group>
      {/* 椭圆地面（比墙外扩一点，草坪延伸到墙外） */}
      <mesh key={`floor-${decorations.floorStyle}`} rotation={[-Math.PI / 2, 0, 0]} scale={[HALL.RX + 1.2, HALL.RZ + 1.2, 1]} receiveShadow>
        <circleGeometry args={[1, 96]} />
        <meshStandardMaterial map={floorTexture} roughness={floorRoughness} metalness={floorMetalness} />
      </mesh>

      {/* 洞穴式曲面主墙（白色哑光 + 宣纸肌理，顶部内收） */}
      <mesh key={`wall-${decorations.wallColor}`} geometry={wallGeo} receiveShadow castShadow={false}>
        <meshStandardMaterial map={wallTexture} roughness={0.92} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* 弧形草绿墙裙 */}
      <mesh geometry={wainscotGeo}>
        <meshStandardMaterial color={PASTORAL.fieldLight} roughness={0.85} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* 穹顶 + 中央椭圆天窗 */}
      <mesh geometry={domeGeo}>
        <meshStandardMaterial color={decorations.wallColor} roughness={0.95} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* 天窗：天空圆盘 + 柔光光柱 */}
      <Oculus />

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
  return (
    <group position={[0, 0, 0]}>
      {/* 天空盘（天窗里看到的天空） */}
      <mesh position={[0, HALL.HEIGHT + HALL.DOME - 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[HALL.OCULUS * 0.98, 48]} />
        <meshBasicMaterial color="#FBFDF4" />
      </mesh>
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
