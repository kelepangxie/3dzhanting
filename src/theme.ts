// 田园色板 —— 源自「清新稻田」设计语言（宣纸底 × 稻田绿 × 麦穗金）
export const PASTORAL = {
  rice: '#F6F2E7', // 宣纸米白（底色）
  riceLight: '#FAF7EE', // 浅宣纸
  riceDark: '#EFE7D4', // 深宣纸
  field: '#4C7A4E', // 稻田绿（主色）
  fieldDark: '#2F5233', // 深绿
  fieldLight: '#7FAE7A', // 浅绿
  wheat: '#C9A227', // 麦穗金（点缀）
  wheatLight: '#E9D9A8', // 浅金
  wood: '#8A6A4F', // 原木棕
  woodDark: '#6B4F3A', // 深木
  woodLight: '#A98963', // 浅木
  sky: '#B9D7F2', // 展厅雾色/环境（天蓝，与湛蓝天空衔接）
  sunlight: '#FFF6E0', // 暖阳光
  ink: '#3B4A3C', // 墨绿字色
  grass: '#A9C79A', // 草坪绿（地面）
  grassDark: '#8FB383', // 草坪深绿
} as const

/**
 * 椭圆曲面展厅 —— 参考大鱼云展「奇幻森林」洞穴式曲面空间：
 * 连续弧形白墙 + 穹顶天窗 + 草绿地面，无一处直角。
 */
export const HALL = {
  RX: 12.6, // 半长轴（X 方向，米）
  RZ: 8.8, // 半短轴（Z 方向，米）
  HEIGHT: 5.2, // 墙高
  DOME: 1.7, // 穹顶拱起高度
  OCULUS: 3.1, // 天窗半径（近似圆，按长短轴比例缩放）
  ENTRANCE_SPAN: 28, // 入口缺口张角（度，朝 +Z 即 90°）
  WALL_MARGIN: 0.95, // 行走离墙安全距离（径向）
  EYE_HEIGHT: 1.7,
} as const

// 兼容旧矩形定义（TourBar 等处仍引用尺寸概念）
export const ROOM = {
  WIDTH: HALL.RX * 2,
  DEPTH: HALL.RZ * 2,
  HEIGHT: HALL.HEIGHT,
  WALL_MARGIN: HALL.WALL_MARGIN,
  EYE_HEIGHT: HALL.EYE_HEIGHT,
} as const

/** 墙面有机起伏：叠加两个低频正弦，让椭圆像自然洞穴一样微微波浪 */
export function wallWobble(theta: number): number {
  return 1 + 0.028 * Math.sin(2 * theta + 1.2) + 0.016 * Math.sin(5 * theta + 0.4)
}

/**
 * 椭圆墙上任意角度的点。thetaDeg：0°=+X，90°=+Z（入口朝向）；
 * radialFactor 1≈贴墙，<1 向圆心收。
 */
export function hallPoint(thetaDeg: number, radialFactor = 1, y = 0): [number, number, number] {
  const t = (thetaDeg * Math.PI) / 180
  const w = wallWobble(t)
  return [Math.cos(t) * HALL.RX * w * radialFactor, y, Math.sin(t) * HALL.RZ * w * radialFactor]
}

/** 墙面起伏的一阶导数（供法线计算） */
function wallWobbleDeriv(t: number): number {
  return 0.056 * Math.cos(2 * t + 1.2) + 0.08 * Math.cos(5 * t + 0.4)
}

/**
 * 洞穴墙在角度 t 处的外法线（含起伏的一阶修正）。
 * 注意：椭圆墙面真法线 ≠ 径向方向，象限中部两者可差近 20°，
 * 按径向摆放的画框会一侧斜插进墙体。
 */
export function wallOutwardNormal(t: number): [number, number] {
  const w = wallWobble(t)
  const dw = wallWobbleDeriv(t)
  const dx = HALL.RX * (-Math.sin(t) * w + Math.cos(t) * dw)
  const dz = HALL.RZ * (Math.cos(t) * w + Math.sin(t) * dw)
  const len = Math.hypot(dx, dz) || 1
  return [dz / len, -dx / len]
}

/** 墙面在角度 thetaDeg、高度 y 处的表面点 (x, z)，与 GalleryRoom 墙体几何一致（含顶部内收 lean） */
export function wallSurfacePoint(thetaDeg: number, y: number): [number, number] {
  const t = (thetaDeg * Math.PI) / 180
  const w = wallWobble(t)
  const shrink = 1 - 0.035 * (y / HALL.HEIGHT) ** 2
  return [Math.cos(t) * HALL.RX * w * shrink, Math.sin(t) * HALL.RZ * w * shrink]
}

/** 贴墙平面朝向圆心所需的 rotationY（按椭圆真法线，而非径向） */
export function hallFacing(thetaDeg: number): number {
  const t = (thetaDeg * Math.PI) / 180
  const [nx, nz] = wallOutwardNormal(t)
  return Math.atan2(-nx, -nz)
}

/** 把行走位置钳制在椭圆展厅内（含离墙安全距离） */
export function clampToHall(x: number, z: number): [number, number] {
  const maxX = HALL.RX - HALL.WALL_MARGIN
  const maxZ = HALL.RZ - HALL.WALL_MARGIN
  const k = (x / maxX) ** 2 + (z / maxZ) ** 2
  if (k <= 1) return [x, z]
  const s = 1 / Math.sqrt(k)
  return [x * s, z * s]
}

// 展览信息
export const EXHIBITION = {
  title: '八桂采鲜·亲子同欢',
  subtitle: '广西特色农产品亲子采摘系列创意海报展',
  team: '刀马组',
  teamMembers: '文案：罗江凤 | 排版：韦宣伊',
  tagline: '以创意采摘广西之鲜，以设计传递亲子之乐',
  school: '广西农业职业技术大学 · 人文与艺术学院 · 美术专业',
} as const

// 广西农业职业技术大学 办学方针文案（表述取自学校官网公开信息）
export const SCHOOL = {
  name: '广西农业职业技术大学',
  college: '人文与艺术学院 · 视觉传达设计',
  mottoTop: '厚德明志',
  mottoBottom: '勤耕笃行',
  mottoFull: '厚德明志 · 勤耕笃行',
  tagline: '以美育人，以设计耕耘乡土',
  principles: ['立德树人', '强农兴农', '德技并修', '耕读传家', '服务"三农"', '乡村振兴'],
  seasons: ['春耕', '夏耘', '秋收', '冬藏'],
} as const

// 画布纹理统一字体（canvas 2D 里用）
export const CANVAS_SERIF = '"Noto Serif SC", "Songti SC", "STSong", "SimSun", Georgia, serif'
export const CANVAS_SANS = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
