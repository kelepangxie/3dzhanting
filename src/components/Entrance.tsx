import { useMemo } from 'react'
import * as THREE from 'three'
import useExhibitStore from '@/store/useExhibitStore'
import { PASTORAL, ROOM, CANVAS_SERIF } from '@/theme'

function createEntranceTextTexture(text: string) {
  const lines = text.split('\n')
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 224
  const ctx = canvas.getContext('2d')!

  // 宣纸牌匾底
  ctx.fillStyle = PASTORAL.riceLight
  ctx.fillRect(0, 0, 1024, 224)
  ctx.strokeStyle = PASTORAL.wheat
  ctx.lineWidth = 6
  ctx.strokeRect(12, 12, 1000, 200)
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.35)'
  ctx.lineWidth = 2
  ctx.strokeRect(24, 24, 976, 176)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const lineHeight = lines.length > 1 ? 78 : 112
  const startY = (224 - lineHeight * lines.length) / 2 + lineHeight / 2
  lines.forEach((line, i) => {
    ctx.fillStyle = i === 0 ? PASTORAL.fieldDark : PASTORAL.field
    ctx.font = i === 0 ? `bold 58px ${CANVAS_SERIF}` : `36px ${CANVAS_SERIF}`
    ctx.fillText(line, 512, startY + i * lineHeight)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export default function Entrance() {
  const { decorations } = useExhibitStore()
  const textTexture = useMemo(() => createEntranceTextTexture(decorations.entranceText), [decorations.entranceText])

  const doorWidth = 4
  const doorHeight = 3.8
  const pillarW = 0.3

  return (
    <group position={[0, 0, ROOM.DEPTH / 2]}>
      {/* 原木立柱（带柱础） */}
      {[-1, 1].map((side) => (
        <group key={side} position={[(side * (doorWidth + pillarW)) / 2, 0, 0]}>
          <mesh position={[0, doorHeight / 2, 0]} castShadow>
            <boxGeometry args={[pillarW, doorHeight, 0.44]} />
            <meshStandardMaterial color={PASTORAL.wood} roughness={0.65} metalness={0.03} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[pillarW + 0.12, 0.24, 0.56]} />
            <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.7} metalness={0.03} />
          </mesh>
          {/* 柱顶麦穗金球 */}
          <mesh position={[0, doorHeight + 0.16, 0]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial color={PASTORAL.wheat} roughness={0.25} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 双层原木横梁（农家门坊式） */}
      <mesh position={[0, doorHeight + 0.12, 0]} castShadow>
        <boxGeometry args={[doorWidth + pillarW * 2 + 0.5, 0.24, 0.5]} />
        <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.65} metalness={0.03} />
      </mesh>
      <mesh position={[0, doorHeight + 0.4, 0]}>
        <boxGeometry args={[doorWidth + pillarW * 2 - 0.3, 0.16, 0.4]} />
        <meshStandardMaterial color={PASTORAL.wood} roughness={0.65} metalness={0.03} />
      </mesh>

      {/* 宣纸牌匾：入口标题 */}
      <mesh position={[0, doorHeight + 0.92, 0.22]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.8, 1.05]} />
        <meshStandardMaterial map={textTexture} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* 暖光照明 */}
      <pointLight position={[0, doorHeight - 0.4, 0.4]} intensity={0.55} color="#FFF6E0" distance={6} />
      <pointLight position={[-doorWidth / 2, doorHeight, 0.4]} intensity={0.25} color="#FFEFD2" distance={4} />
      <pointLight position={[doorWidth / 2, doorHeight, 0.4]} intensity={0.25} color="#FFEFD2" distance={4} />
    </group>
  )
}
