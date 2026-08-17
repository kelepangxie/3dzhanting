import { useMemo } from 'react'
import * as THREE from 'three'
import useExhibitStore from '@/store/useExhibitStore'
import { PASTORAL, HALL, hallPoint, CANVAS_SERIF } from '@/theme'

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

/** 拱形花架门洞：立在椭圆墙的入口缺口处（朝 +Z，中心 90°） */
export default function Entrance() {
  const { decorations } = useExhibitStore()
  const textTexture = useMemo(() => createEntranceTextTexture(decorations.entranceText), [decorations.entranceText])

  // 入口缺口中心点（径向略微内收，让门洞嵌在洞口里）
  const [, , gateZ] = hallPoint(90, 0.99, 0)
  const doorWidth = 4.4
  const doorHeight = 3.6
  const pillarW = 0.28

  // 拱梁：半圆环管，扣在两柱顶端
  const archRadius = doorWidth / 2 + pillarW / 2 + 0.1

  return (
    <group position={[0, 0, gateZ]}>
      {/* 原木立柱（带柱础与攀藤） */}
      {[-1, 1].map((side) => (
        <group key={side} position={[(side * (doorWidth + pillarW)) / 2, 0, 0]}>
          <mesh position={[0, doorHeight / 2, 0]} castShadow>
            <cylinderGeometry args={[pillarW / 2, pillarW / 2 + 0.02, doorHeight, 10]} />
            <meshStandardMaterial color={PASTORAL.wood} roughness={0.65} metalness={0.03} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[pillarW + 0.12, pillarW + 0.16, 0.24, 10]} />
            <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.7} metalness={0.03} />
          </mesh>
          {/* 攀柱藤蔓（几段绿色小管 + 叶球） */}
          {[1.0, 1.7, 2.4].map((y, i) => (
            <mesh key={y} position={[side * -0.16, y, 0]} rotation={[0, 0, side * 0.5]}>
              <cylinderGeometry args={[0.025, 0.025, 0.5, 6]} />
              <meshStandardMaterial color="#5B8A54" roughness={0.8} />
            </mesh>
          ))}
          {[0.8, 1.9, 2.9].map((y) => (
            <mesh key={y} position={[side * -0.2, y, 0.08]}>
              <sphereGeometry args={[0.16 + 0.05 * Math.sin(y * 7), 8, 8]} />
              <meshStandardMaterial color={PASTORAL.field} roughness={0.85} />
            </mesh>
          ))}
          {/* 柱顶麦穗金球 */}
          <mesh position={[0, doorHeight + 0.14, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color={PASTORAL.wheat} roughness={0.25} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 拱形横梁（半圆环） */}
      <mesh position={[0, doorHeight - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[archRadius, 0.09, 10, 32, Math.PI]} />
        <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.65} metalness={0.03} />
      </mesh>
      {/* 拱梁上的藤叶球 */}
      {[0.35, 0.75, 1.15, 1.5, 1.85, 2.25, 2.65].map((a) => (
        <mesh key={a} position={[Math.cos(a) * archRadius, doorHeight - 0.02 + Math.sin(a) * archRadius, 0.06]}>
          <sphereGeometry args={[0.14 + 0.05 * Math.sin(a * 9), 8, 8]} />
          <meshStandardMaterial color={a > 1.4 ? PASTORAL.fieldDark : PASTORAL.field} roughness={0.85} />
        </mesh>
      ))}

      {/* 宣纸牌匾：悬挂在拱顶正中 */}
      <mesh position={[0, doorHeight + 0.78, 0.12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.4, 0.96]} />
        <meshStandardMaterial map={textTexture} transparent side={THREE.DoubleSide} />
      </mesh>
      {/* 牌匾吊绳 */}
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, doorHeight + 1.35, 0.12]}>
          <cylinderGeometry args={[0.01, 0.01, 0.7, 6]} />
          <meshStandardMaterial color={PASTORAL.woodDark} roughness={0.6} />
        </mesh>
      ))}

      {/* 暖光照明 */}
      <pointLight position={[0, doorHeight - 0.3, -0.6]} intensity={0.55} color="#FFF6E0" distance={6} />
      <pointLight position={[-doorWidth / 2, doorHeight, -0.4]} intensity={0.25} color="#FFEFD2" distance={4} />
      <pointLight position={[doorWidth / 2, doorHeight, -0.4]} intensity={0.25} color="#FFEFD2" distance={4} />
    </group>
  )
}
