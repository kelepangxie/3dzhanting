import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Exhibit } from '@/data/exhibits'
import useExhibitStore from '@/store/useExhibitStore'
import { PASTORAL, CANVAS_SERIF, CANVAS_SANS } from '@/theme'
import { playerInput } from '@/lib/playerInput'

function createPlaceholderTexture(exhibit: Exhibit) {
  const canvas = document.createElement('canvas')
  const w = 512
  const h = Math.round((exhibit.height / exhibit.width) * 512)
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // 宣纸风占位图：淡彩渐变底 + 麦穗金双线框
  const gradient = ctx.createLinearGradient(0, 0, w, h)
  gradient.addColorStop(0, adjustColor(exhibit.placeholderColor, 46))
  gradient.addColorStop(1, adjustColor(exhibit.placeholderColor, 8))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  // 宣纸颗粒
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = `rgba(250, 247, 238, ${Math.random() * 0.08})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
  }

  ctx.strokeStyle = 'rgba(233, 217, 168, 0.75)'
  ctx.lineWidth = 5
  ctx.strokeRect(18, 18, w - 36, h - 36)
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.4)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(28, 28, w - 56, h - 56)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#FAF7EE'
  ctx.font = `bold 36px ${CANVAS_SERIF}`
  ctx.fillText(exhibit.title, w / 2, h / 2 - 34)

  ctx.fillStyle = '#E9D9A8'
  ctx.font = `22px ${CANVAS_SANS}`
  ctx.fillText(exhibit.artist, w / 2, h / 2 + 16)

  if (exhibit.type === 'video') {
    ctx.fillStyle = 'rgba(250, 247, 238, 0.65)'
    ctx.beginPath()
    ctx.arc(w / 2, h / 2 + 64, 22, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = PASTORAL.fieldDark
    ctx.beginPath()
    ctx.moveTo(w / 2 - 8, h / 2 + 49)
    ctx.lineTo(w / 2 - 8, h / 2 + 79)
    ctx.lineTo(w / 2 + 14, h / 2 + 64)
    ctx.closePath()
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(250, 247, 238, 0.4)'
  ctx.font = `14px ${CANVAS_SANS}`
  ctx.fillText('示例作品 · ' + (exhibit.type === 'video' ? '视频占位' : '图片占位'), w / 2, h - 32)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createLabelTexture(exhibit: Exhibit) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = PASTORAL.riceLight
  ctx.fillRect(0, 0, 512, 128)
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.55)'
  ctx.lineWidth = 3
  ctx.strokeRect(6, 6, 500, 116)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = PASTORAL.fieldDark
  ctx.font = `bold 40px ${CANVAS_SERIF}`
  ctx.fillText(exhibit.title, 256, 46)
  ctx.fillStyle = PASTORAL.field
  ctx.font = `28px ${CANVAS_SANS}`
  ctx.fillText(exhibit.category || exhibit.artist, 256, 92)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export default function ExhibitFrame({ exhibit }: { exhibit: Exhibit }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const spotlightRef = useRef<THREE.SpotLight>(null)
  const [hovered, setHovered] = useState(false)
  const { selectExhibit, setHoveredExhibit, isLocked, controlMode, isTouch } = useExhibitStore()

  const placeholderTexture = useMemo(() => createPlaceholderTexture(exhibit), [exhibit])
  const labelTexture = useMemo(() => createLabelTexture(exhibit), [exhibit])

  // 优先加载真实作品图（public/placeholders/ 下同名文件），失败回退宣纸风占位图
  const [realTexture, setRealTexture] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    let disposed = false
    let loaded: THREE.Texture | null = null
    if (exhibit.type !== 'image') {
      setRealTexture(null)
      return
    }
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      exhibit.mediaUrl,
      (t) => {
        if (disposed) {
          t.dispose()
          return
        }
        t.colorSpace = THREE.SRGBColorSpace
        loaded = t
        setRealTexture(t)
      },
      undefined,
      () => {
        if (!disposed) setRealTexture(null)
      }
    )
    return () => {
      disposed = true
      loaded?.dispose()
    }
  }, [exhibit])

  const texture = realTexture ?? placeholderTexture

  const frameWidth = exhibit.width + 0.12
  const frameHeight = exhibit.height + 0.12
  const frameDepth = 0.06

  // 可交互：指针锁定漫游 / 导览模式 / 触屏
  const canInteract = isLocked || controlMode === 'tour' || isTouch

  const handleClick = useCallback(
    (_e: any) => {
      if (!canInteract) return
      if (playerInput.dragged) return // 触屏拖动转视角时避免误触选中
      selectExhibit(exhibit)
    },
    [canInteract, selectExhibit, exhibit]
  )

  useFrame(() => {
    if (spotlightRef.current && !spotlightRef.current.target.parent) {
      spotlightRef.current.target.position.set(0, 0, 0)
      meshRef.current?.add(spotlightRef.current.target)
    }
  })

  return (
    <group
      position={[exhibit.position.x, exhibit.position.y, exhibit.position.z]}
      rotation={[0, exhibit.rotationY, 0]}
    >
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => {
          if (canInteract) {
            setHovered(true)
            setHoveredExhibit(exhibit)
            document.body.style.cursor = 'pointer'
          }
        }}
        onPointerOut={() => {
          setHovered(false)
          setHoveredExhibit(null)
          document.body.style.cursor = 'default'
        }}
      >
        <planeGeometry args={[exhibit.width, exhibit.height]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.35}
          metalness={0.02}
          emissive={hovered ? PASTORAL.wheat : '#000000'}
          emissiveIntensity={hovered ? 0.12 : 0}
        />
      </mesh>

      {/* 原木画框（背板，整体位于画面之后，形成凸出画框边） */}
      <mesh position={[0, 0, -0.031]}>
        <boxGeometry args={[frameWidth, frameHeight, frameDepth]} />
        <meshStandardMaterial
          color={hovered ? PASTORAL.wheat : PASTORAL.wood}
          roughness={0.55}
          metalness={0.08}
        />
      </mesh>

      {/* 宣纸标签牌 */}
      <mesh position={[0, -(exhibit.height / 2) - 0.28, 0.01]}>
        <planeGeometry args={[1.3, 0.32]} />
        <meshStandardMaterial map={labelTexture} roughness={0.85} transparent />
      </mesh>

      {hovered && canInteract && (
        <Html
          position={[0, exhibit.height / 2 + 0.32, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-rice/95 text-field-dark px-3 py-1 rounded-full text-sm whitespace-nowrap backdrop-blur-sm border border-wheat/60 shadow-sm font-serif">
            点击查看详情
          </div>
        </Html>
      )}

      <spotLight
        ref={spotlightRef}
        position={[0, 2.5, 1.5]}
        angle={0.4}
        penumbra={0.6}
        intensity={hovered ? 2 : 1.1}
        color="#FFF6E0"
        castShadow={false}
      />
    </group>
  )
}
