import { useMemo } from 'react'
import * as THREE from 'three'
import useExhibitStore from '@/store/useExhibitStore'
import type { FloorStyle } from '@/store/useExhibitStore'
import { PASTORAL, ROOM, SCHOOL, CANVAS_SERIF, CANVAS_SANS } from '@/theme'

/* ---------------- 程序纹理：田园地板 ---------------- */

function createFloorTexture(style: FloorStyle) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  if (style === 'wood') {
    // 原木竹板地板：暖棕板条 + 木纹
    ctx.fillStyle = '#C9AD82'
    ctx.fillRect(0, 0, 512, 512)
    for (let y = 0; y < 512; y += 42) {
      const tint = Math.random() * 18 - 9
      ctx.fillStyle = `rgb(${201 + tint}, ${173 + tint}, ${130 + tint})`
      ctx.fillRect(0, y, 512, 40)
      // 木纹丝
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
  texture.repeat.set(6, 4)
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
  texture.repeat.set(3, 1)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ---------------- 程序纹理：校训横幅 / 梯田装饰画 ---------------- */

function createBannerTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 160
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = PASTORAL.riceLight
  ctx.fillRect(0, 0, 1024, 160)
  ctx.strokeStyle = PASTORAL.wheat
  ctx.lineWidth = 4
  ctx.strokeRect(10, 10, 1004, 140)
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.35)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(18, 18, 988, 124)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = PASTORAL.fieldDark
  ctx.font = `bold 52px ${CANVAS_SERIF}`
  ctx.fillText(SCHOOL.mottoFull, 512, 58)
  ctx.font = `22px ${CANVAS_SERIF}`
  ctx.fillStyle = PASTORAL.field
  ctx.fillText(`${SCHOOL.name} · ${SCHOOL.college}`, 512, 108)
  ctx.font = `20px ${CANVAS_SANS}`
  ctx.fillStyle = PASTORAL.ink
  ctx.fillText(SCHOOL.principles.join(' · '), 512, 138)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createTerraceTexture(seed: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 288
  const ctx = canvas.getContext('2d')!

  // 宣纸底
  ctx.fillStyle = PASTORAL.rice
  ctx.fillRect(0, 0, 512, 288)

  // 一轮麦色暖阳
  ctx.fillStyle = 'rgba(201, 162, 39, 0.55)'
  ctx.beginPath()
  ctx.arc(400 - seed * 60, 62, 26, 0, Math.PI * 2)
  ctx.fill()

  // 层层梯田曲线
  const layers = [
    { color: 'rgba(127, 174, 122, 0.5)', base: 130, amp: 16 },
    { color: 'rgba(76, 122, 78, 0.62)', base: 168, amp: 20 },
    { color: 'rgba(47, 82, 51, 0.72)', base: 210, amp: 22 },
    { color: 'rgba(36, 64, 42, 0.85)', base: 254, amp: 18 },
  ]
  layers.forEach((layer, i) => {
    ctx.fillStyle = layer.color
    ctx.beginPath()
    ctx.moveTo(0, 288)
    ctx.lineTo(0, layer.base)
    for (let x = 0; x <= 512; x += 16) {
      const y = layer.base + Math.sin((x / 512) * Math.PI * (2 + i + seed) + i * 1.7) * layer.amp
      ctx.lineTo(x, y)
    }
    ctx.lineTo(512, 288)
    ctx.closePath()
    ctx.fill()
    // 田埂高光
    ctx.strokeStyle = 'rgba(250, 247, 238, 0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let x = 0; x <= 512; x += 16) {
      const y = layer.base + Math.sin((x / 512) * Math.PI * (2 + i + seed) + i * 1.7) * layer.amp
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  })

  // 落款
  ctx.fillStyle = PASTORAL.fieldDark
  ctx.font = `bold 22px ${CANVAS_SERIF}`
  ctx.textAlign = 'left'
  ctx.fillText(seed === 0 ? '龙脊层浪' : '田畴叠翠', 22, 34)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ---------------- 房间主体 ---------------- */

export default function GalleryRoom() {
  const { decorations } = useExhibitStore()
  const floorTexture = useMemo(() => createFloorTexture(decorations.floorStyle), [decorations.floorStyle])
  const wallTexture = useMemo(() => createWallTexture(decorations.wallColor), [decorations.wallColor])
  const bannerTexture = useMemo(() => createBannerTexture(), [])
  const terraceTextureA = useMemo(() => createTerraceTexture(0), [])
  const terraceTextureB = useMemo(() => createTerraceTexture(1), [])

  const floorRoughness = decorations.floorStyle === 'wood' ? 0.55 : decorations.floorStyle === 'stone' ? 0.8 : 0.9
  const floorMetalness = 0.02

  return (
    <group>
      <mesh key={`floor-${decorations.floorStyle}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.WIDTH, ROOM.DEPTH]} />
        <meshStandardMaterial map={floorTexture} roughness={floorRoughness} metalness={floorMetalness} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.HEIGHT, 0]}>
        <planeGeometry args={[ROOM.WIDTH, ROOM.DEPTH]} />
        <meshStandardMaterial color={PASTORAL.riceLight} roughness={0.95} />
      </mesh>

      <mesh key={`wall-back-${decorations.wallColor}`} position={[0, ROOM.HEIGHT / 2, -ROOM.DEPTH / 2]} receiveShadow>
        <planeGeometry args={[ROOM.WIDTH, ROOM.HEIGHT]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>

      <mesh key={`wall-front-${decorations.wallColor}`} position={[0, ROOM.HEIGHT / 2, ROOM.DEPTH / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[ROOM.WIDTH, ROOM.HEIGHT]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>

      <mesh key={`wall-left-${decorations.wallColor}`} position={[-ROOM.WIDTH / 2, ROOM.HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.DEPTH, ROOM.HEIGHT]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>

      <mesh key={`wall-right-${decorations.wallColor}`} position={[ROOM.WIDTH / 2, ROOM.HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.DEPTH, ROOM.HEIGHT]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>

      {/* 踢脚线（深木）与顶角线（浅木） */}
      <Baseboard position={[0, 0.06, -ROOM.DEPTH / 2 + 0.02]} width={ROOM.WIDTH} />
      <Baseboard position={[0, 0.06, ROOM.DEPTH / 2 - 0.02]} width={ROOM.WIDTH} />
      <Baseboard position={[-ROOM.WIDTH / 2 + 0.02, 0.06, 0]} width={ROOM.DEPTH} rotationY={Math.PI / 2} />
      <Baseboard position={[ROOM.WIDTH / 2 - 0.02, 0.06, 0]} width={ROOM.DEPTH} rotationY={Math.PI / 2} />

      <CrownMolding position={[0, ROOM.HEIGHT - 0.04, -ROOM.DEPTH / 2 + 0.02]} width={ROOM.WIDTH} />
      <CrownMolding position={[0, ROOM.HEIGHT - 0.04, ROOM.DEPTH / 2 - 0.02]} width={ROOM.WIDTH} />
      <CrownMolding position={[-ROOM.WIDTH / 2 + 0.02, ROOM.HEIGHT - 0.04, 0]} width={ROOM.DEPTH} rotationY={Math.PI / 2} />
      <CrownMolding position={[ROOM.WIDTH / 2 - 0.02, ROOM.HEIGHT - 0.04, 0]} width={ROOM.DEPTH} rotationY={Math.PI / 2} />

      {/* 淡竹绿墙裙 + 稻田绿墙裙压线 */}
      <Wainscot position={[0, 0.55, -ROOM.DEPTH / 2 + 0.03]} width={ROOM.WIDTH} />
      <Wainscot position={[0, 0.55, ROOM.DEPTH / 2 - 0.03]} width={ROOM.WIDTH} />
      <Wainscot position={[-ROOM.WIDTH / 2 + 0.03, 0.55, 0]} width={ROOM.DEPTH} rotationY={Math.PI / 2} />
      <Wainscot position={[ROOM.WIDTH / 2 - 0.03, 0.55, 0]} width={ROOM.DEPTH} rotationY={Math.PI / 2} />

      {/* 天花板原木梁 */}
      {[-6, -3, 0, 3, 6].map((z) => (
        <mesh key={`beam-${z}`} position={[0, ROOM.HEIGHT - 0.12, z]} castShadow>
          <boxGeometry args={[ROOM.WIDTH, 0.22, 0.3]} />
          <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.75} metalness={0.02} />
        </mesh>
      ))}

      {/* 后墙校训横幅（展品上方） */}
      <mesh position={[0, 4.05, -ROOM.DEPTH / 2 + 0.04]}>
        <planeGeometry args={[11, 1.6]} />
        <meshStandardMaterial map={bannerTexture} roughness={0.85} />
      </mesh>

      {/* 前墙两侧梯田装饰画（原木细框） */}
      <TerraceArt position={[-8.5, 2.6, ROOM.DEPTH / 2 - 0.04]} texture={terraceTextureA} />
      <TerraceArt position={[8.5, 2.6, ROOM.DEPTH / 2 - 0.04]} texture={terraceTextureB} />

      {/* 竹编吊灯 3×3 */}
      <CeilingLight position={[-6, ROOM.HEIGHT - 0.28, -4]} />
      <CeilingLight position={[0, ROOM.HEIGHT - 0.28, -4]} />
      <CeilingLight position={[6, ROOM.HEIGHT - 0.28, -4]} />
      <CeilingLight position={[-6, ROOM.HEIGHT - 0.28, 0]} />
      <CeilingLight position={[0, ROOM.HEIGHT - 0.28, 0]} />
      <CeilingLight position={[6, ROOM.HEIGHT - 0.28, 0]} />
      <CeilingLight position={[-6, ROOM.HEIGHT - 0.28, 4]} />
      <CeilingLight position={[0, ROOM.HEIGHT - 0.28, 4]} />
      <CeilingLight position={[6, ROOM.HEIGHT - 0.28, 4]} />
    </group>
  )
}

function Baseboard({ position, width, rotationY = 0 }: { position: [number, number, number]; width: number; rotationY?: number }) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <boxGeometry args={[width, 0.12, 0.04]} />
      <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.5} metalness={0.05} />
    </mesh>
  )
}

function CrownMolding({ position, width, rotationY = 0 }: { position: [number, number, number]; width: number; rotationY?: number }) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <boxGeometry args={[width, 0.08, 0.06]} />
      <meshStandardMaterial color={PASTORAL.woodLight} roughness={0.6} metalness={0.05} />
    </mesh>
  )
}

function Wainscot({ position, width, rotationY = 0 }: { position: [number, number, number]; width: number; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[width, 0.95, 0.03]} />
        <meshStandardMaterial color="#DCE5D2" roughness={0.85} metalness={0} />
      </mesh>
      <mesh position={[0, 0.52, 0.01]}>
        <boxGeometry args={[width, 0.07, 0.05]} />
        <meshStandardMaterial color={PASTORAL.field} roughness={0.6} metalness={0.02} />
      </mesh>
    </group>
  )
}

function TerraceArt({ position, texture }: { position: [number, number, number]; texture: THREE.Texture }) {
  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[3.3, 2.0, 0.05]} />
        <meshStandardMaterial color={PASTORAL.wood} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh>
        <planeGeometry args={[3.1, 1.8]} />
        <meshStandardMaterial map={texture} roughness={0.85} />
      </mesh>
    </group>
  )
}

function CeilingLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 吊绳 */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 6]} />
        <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.6} />
      </mesh>
      {/* 竹编灯罩（上小下大的圆台，开口） */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.09, 0.3, 0.26, 12, 1, true]} />
        <meshStandardMaterial color="#D9C08A" roughness={0.8} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
      {/* 暖光灯芯 */}
      <mesh position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.17, 12]} />
        <meshStandardMaterial color="#FFF6E0" emissive="#FFE9BE" emissiveIntensity={1.6} side={THREE.DoubleSide} />
      </mesh>
      <pointLight
        position={[0, -0.25, 0]}
        intensity={0.8}
        color="#FFEFD2"
        distance={9}
        decay={2}
      />
    </group>
  )
}
