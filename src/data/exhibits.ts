import { HALL, wallOutwardNormal, wallSurfacePoint, wallWobble } from '@/theme'

export interface Exhibit {
  id: string
  title: string
  description: string
  artist: string
  /** 作品门类 = 系列 · 品类 */
  category?: string
  /** 所属系列（序言/系列一~六），导览条分组用 */
  series: string
  type: 'image' | 'video'
  mediaUrl: string
  position: { x: number; y: number; z: number }
  rotationY: number
  width: number
  height: number
  placeholderColor: string
  price?: string
}

/**
 * 全量布展：序言 + 六个系列共 35 件，全部沿椭圆弧墙环形排布。
 * thetaDeg：0°=+X，90°=+Z（入口方向）。入口缺口约 76°~104°，不布展。
 *
 * 摆放算法：
 * 1. 画框按墙面「真法线」定向，数值采样展板跨度内墙面求最小离墙间距（防穿墙）；
 * 2. 沿墙按「弧长」推进布位（椭圆各角度弧长不同，等角度会导致短轴侧拥挤相撞）；
 * 3. 相邻画框深度交错（贴墙/离墙交替），密排时框角互不遮挡，形成节奏感。
 */
const FRAME_BACK = 0.075 // 画框背板凸出画面的深度（含背板+卡纸厚度）
const FRAME_GAP = 0.05 // 画框背板与墙面的最小间隙
const MAT_AND_BARS = 0.39 // 白卡纸外露 + 左右框条合计宽度（计算占位用）
const ZIGZAG = 0.55 // 锯齿交错的深度差（米）

function wallSlot(thetaDeg: number, tall: boolean, halfWidth: number, halfHeight: number, depthBias = 0) {
  const y = tall ? HALL.EYE_HEIGHT + 0.45 : HALL.EYE_HEIGHT + 0.15
  const t = (thetaDeg * Math.PI) / 180
  const [nx, nz] = wallOutwardNormal(t)
  const [cx, cz] = wallSurfacePoint(thetaDeg, y)

  // 采样展板跨度（角度）× 高度（中心/顶部）内的墙面，求相对切平面的最大内凸量
  const baseR = Math.hypot(cx, cz)
  const halfThetaDeg = ((halfWidth / baseR + 0.03) * 180) / Math.PI
  let protrusion = 0
  for (const hSign of [0, 1]) {
    const sy = y + hSign * halfHeight
    for (let i = 1; i <= 10; i++) {
      for (const sign of [-1, 1]) {
        const [px, pz] = wallSurfacePoint(thetaDeg + (sign * halfThetaDeg * i) / 10, sy)
        const d = (px - cx) * nx + (pz - cz) * nz // >0 墙在切平面外侧（安全），<0 内凸
        protrusion = Math.min(protrusion, d)
      }
    }
  }

  const offset = depthBias + FRAME_BACK + Math.max(0, -protrusion) + FRAME_GAP
  return {
    x: cx - nx * offset,
    z: cz - nz * offset,
    rotationY: Math.atan2(-nx, -nz),
  }
}

/** 参数角速度：dθ 处每弧度的墙长（米），布位按弧长推进 */
function arcSpeed(thetaDeg: number): number {
  const t = (thetaDeg * Math.PI) / 180
  const e = 0.001
  const pt = (tt: number) => {
    const w = wallWobble(tt)
    return [Math.cos(tt) * HALL.RX * w, Math.sin(tt) * HALL.RZ * w]
  }
  const [x1, z1] = pt(t - e)
  const [x2, z2] = pt(t + e)
  return Math.hypot(x2 - x1, z2 - z1) / (2 * e)
}

/* ---------------- 展品种子数据（按参观动线排序） ---------------- */

interface Seed {
  id: string
  title: string
  description: string
  artist: string
  category?: string
  series: string
  mediaUrl: string
  /** 画面宽高比（宽/高） */
  ratio: number
  /** 画面宽度基准（米），高度 = 宽度 / ratio */
  width: number
  placeholderColor: string
}

const D = '3D 黏土风渲染的八桂田园亲子采摘主题海报。'

const seeds: Seed[] = [
  /* —— 序言 —— */
  {
    id: 'preface',
    title: '序·八桂采鲜 亲子同欢',
    description:
      '「八桂采鲜·亲子同欢」创意海报展序言：以广西特色农产品为灵感，南瓜、葡萄、火龙果、甘蔗、杨桃五大果品串联亲子采摘之乐，以创意耕耘乡土，以设计服务三农。',
    artist: '刀马组',
    category: '序言 · 展览前言',
    series: '序言',
    mediaUrl: '/exhibits/序言展板.png',
    ratio: 1008 / 565,
    width: 2.7,
    placeholderColor: '#2F5233',
  },
  /* —— 系列一 · 刀马组（定稿组） —— */
  {
    id: 's1-1',
    title: '八桂采鲜·亲子同欢（主视觉）',
    description: `${D}一家四口怀抱丰收果实，南瓜圆、杨桃脆、甘蔗甜、火龙果红、葡萄紫，五种广西特产齐聚画面。`,
    artist: '刀马组',
    category: '系列一 · 主视觉',
    series: '系列一',
    mediaUrl: '/exhibits/系列一/bagui-poster-1.jpg',
    ratio: 0.708,
    width: 1.24,
    placeholderColor: '#4C7A4E',
  },
  {
    id: 's1-2',
    title: '八桂拾秋·“南”得亲子乐',
    description: '南瓜主题分海报。「南」谐音「难」，寓意亲子采摘之乐得来不难。一家三口置身南瓜田，孩子手捧笑脸圆南瓜。',
    artist: '刀马组 · 文案罗江凤 / 排版韦宣伊',
    category: '系列一 · 南瓜',
    series: '系列一',
    mediaUrl: '/exhibits/系列一/bagui-poster-2.jpg',
    ratio: 0.708,
    width: 1.24,
    placeholderColor: '#B5703F',
  },
  {
    id: 's1-3',
    title: '葡葡甜多汁·八桂亲子约',
    description: '葡萄主题分海报。葡萄园藤架间一家三口手牵手漫步，「串串紫晶挂枝头，牵手采摘乐无忧」。',
    artist: '刀马组',
    category: '系列一 · 葡萄',
    series: '系列一',
    mediaUrl: '/exhibits/系列一/bagui-poster-3.jpg',
    ratio: 0.708,
    width: 1.24,
    placeholderColor: '#3E6B8E',
  },
  {
    id: 's1-4',
    title: '火龙果韵·八桂亲子摘',
    description: '火龙果主题分海报。果林间孩子们高举切开的红果，父亲提着满篮收获，「剥出丹霞果肉，收获满满幸福味」。',
    artist: '刀马组',
    category: '系列一 · 火龙果',
    series: '系列一',
    mediaUrl: '/exhibits/系列一/bagui-poster-4.jpg',
    ratio: 0.708,
    width: 1.24,
    placeholderColor: '#5E8C5A',
  },
  {
    id: 's1-5',
    title: '清甜杨桃季·八桂亲子趣',
    description: '杨桃主题分海报。果园小径上一家三口提着满篮五棱果实走向山林晨光，「五棱果肉藏鲜润，牵手采摘醉金秋」。',
    artist: '刀马组',
    category: '系列一 · 杨桃',
    series: '系列一',
    mediaUrl: '/exhibits/系列一/bagui-poster-5.jpg',
    ratio: 0.708,
    width: 1.24,
    placeholderColor: '#3A7A6E',
  },
  {
    id: 's1-6',
    title: '蔗甜情深·八桂亲子行',
    description: '甘蔗主题分海报。蔗田里亲子合力砍下甜脆甘蔗，巨型棒棒糖与蔗甜呼应，「亲手砍断甜脆杆，共享田间欢乐时光」。',
    artist: '刀马组 · 文案罗江凤 / 排版韦宣伊',
    category: '系列一 · 甘蔗',
    series: '系列一',
    mediaUrl: '/exhibits/系列一/bagui-poster-6.jpg',
    ratio: 0.708,
    width: 1.24,
    placeholderColor: '#B5893C',
  },
  /* —— 系列三 · 黄艳琦 —— */
  {
    id: 's3-1',
    title: '八桂采鲜·五果聚顶（封面）',
    description: '黄艳琦系列封面：深绿底色中南瓜、杨桃、甘蔗、火龙果、葡萄五果聚拢，字体的图形化处理构成主视觉。',
    artist: '黄艳琦',
    category: '系列三 · 封面',
    series: '系列三',
    mediaUrl: '/exhibits/系列三/page-1.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#2F5233',
  },
  {
    id: 's3-2',
    title: '清甜杨桃·五棱笑声',
    description: '黄艳琦杨桃篇：果园里孩子与家长提篮采杨桃，五棱果实的几何感与人物曲线相映成趣。',
    artist: '黄艳琦',
    category: '系列三 · 杨桃',
    series: '系列三',
    mediaUrl: '/exhibits/系列三/page-2.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#3A7A6E',
  },
  {
    id: 's3-3',
    title: '蔗里蔗气·亲子同行',
    description: '黄艳琦甘蔗篇：蔗田中亲子砍蔗的欢快场景，标题谐音「遮里遮气」活泼俏皮。',
    artist: '黄艳琦',
    category: '系列三 · 甘蔗',
    series: '系列三',
    mediaUrl: '/exhibits/系列三/page-3.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#B5893C',
  },
  {
    id: 's3-4',
    title: '红焰枝头·亲子同摘',
    description: '黄艳琦火龙果篇：果林里亲子高举红果，红果与绿叶的强对比点燃画面。',
    artist: '黄艳琦',
    category: '系列三 · 火龙果',
    series: '系列三',
    mediaUrl: '/exhibits/系列三/page-4.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#C44536',
  },
  {
    id: 's3-5',
    title: '串串紫玉·亲子同乐',
    description: '黄艳琦葡萄篇：藤架下亲子采撷紫玉般的果串，紫色系渐层温润细腻。',
    artist: '黄艳琦',
    category: '系列三 · 葡萄',
    series: '系列三',
    mediaUrl: '/exhibits/系列三/page-5.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#3E6B8E',
  },
  {
    id: 's3-6',
    title: '南得遇见·亲子同欢',
    description: '黄艳琦南瓜篇：一家三口南瓜田抱瓜合影，暖橙色调包裹秋日丰收的幸福感。',
    artist: '黄艳琦',
    category: '系列三 · 南瓜',
    series: '系列三',
    mediaUrl: '/exhibits/系列三/page-6.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#E08E3C',
  },
  /* —— 系列六 · 定稿全集 —— */
  {
    id: 's6-1',
    title: '八桂采鲜·亲子同欢（全集封面）',
    description: '定稿全集封面：五果聚会主视觉与字体排印，系列整体气质的总起。',
    artist: '刀马组',
    category: '系列六 · 封面',
    series: '系列六',
    mediaUrl: '/exhibits/系列六/page-1.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#2F5233',
  },
  {
    id: 's6-2',
    title: '“南”得亲子乐（定稿）',
    description: '南瓜篇定稿版：黏土风一家三口抱南瓜，细节与光影较初稿更为饱满。',
    artist: '刀马组',
    category: '系列六 · 南瓜',
    series: '系列六',
    mediaUrl: '/exhibits/系列六/page-2.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#E08E3C',
  },
  {
    id: 's6-3',
    title: '葡葡甜多汁（定稿）',
    description: '葡萄篇定稿版：藤架下的亲子漫步，紫晶果串的质感进一步打磨。',
    artist: '刀马组',
    category: '系列六 · 葡萄',
    series: '系列六',
    mediaUrl: '/exhibits/系列六/page-3.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#3E6B8E',
  },
  {
    id: 's6-4',
    title: '火龙果韵（定稿）',
    description: '火龙果篇定稿版：高举红果的瞬间动感与蝴蝶粉花的点缀节奏更成熟。',
    artist: '刀马组',
    category: '系列六 · 火龙果',
    series: '系列六',
    mediaUrl: '/exhibits/系列六/page-4.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#5E8C5A',
  },
  {
    id: 's6-5',
    title: '清甜杨桃季（定稿）',
    description: '杨桃篇定稿版：晨光小径的暖调与五棱果实特写的构图定案。',
    artist: '刀马组',
    category: '系列六 · 杨桃',
    series: '系列六',
    mediaUrl: '/exhibits/系列六/page-5.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#3A7A6E',
  },
  {
    id: 's6-6',
    title: '蔗甜情深（定稿）',
    description: '甘蔗篇定稿版：亲子合力砍蔗的动态与巨型棒棒糖的想象力定稿。',
    artist: '刀马组',
    category: '系列六 · 甘蔗',
    series: '系列六',
    mediaUrl: '/exhibits/系列六/page-6.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#B5893C',
  },
  {
    id: 's6-7',
    title: '丹霞果肉·亲子共享（火龙果另款）',
    description: '火龙果备选方案：以切面丹霞色为主角的特写构图，与正式稿的叙事型构图形成对照。',
    artist: '刀马组',
    category: '系列六 · 方案比选',
    series: '系列六',
    mediaUrl: '/exhibits/系列六/page-7.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#C44536',
  },
  {
    id: 's6-8',
    title: '杨桃篇（另款方案）',
    description: '杨桃备选方案：另一构图视角的探索稿，呈现同一主题的不同解法。',
    artist: '刀马组',
    category: '系列六 · 方案比选',
    series: '系列六',
    mediaUrl: '/exhibits/系列六/page-8.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#7FAE7A',
  },
  {
    id: 's6-9',
    title: '满载而归·亲子同乐（尾页）',
    description: '全集尾页：一家四口满载而归，五果齐聚，为整个系列画下圆满句点。',
    artist: '刀马组',
    category: '系列六 · 尾页',
    series: '系列六',
    mediaUrl: '/exhibits/系列六/page-9.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#C9A227',
  },
  /* —— 系列五 · 隆仁豪 —— */
  {
    id: 's5-1',
    title: '芒了个果',
    description: '隆仁豪芒果篇：卡通芒果拟人形象手持采摘工具，俏皮的谐音标题让百色的甜有了性格。',
    artist: '隆仁豪',
    category: '系列五 · 芒果',
    series: '系列五',
    mediaUrl: '/exhibits/系列五/page-1.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#D19A2F',
  },
  {
    id: 's5-2',
    title: '荔质洋溢',
    description: '隆仁豪荔枝篇：荔枝一家三口的红绿对比插画，「荔质洋溢」谐音双关青春洋溢。',
    artist: '隆仁豪',
    category: '系列五 · 荔枝',
    series: '系列五',
    mediaUrl: '/exhibits/系列五/page-2.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#C44536',
  },
  {
    id: 's5-3',
    title: '柑橘正好',
    description: '隆仁豪沃柑篇：橙黄沃柑拟人形象与果园场景，「柑橘正好」呼应「赶得正好」。',
    artist: '隆仁豪',
    category: '系列五 · 沃柑',
    series: '系列五',
    mediaUrl: '/exhibits/系列五/page-3.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#E08E3C',
  },
  {
    id: 's5-4',
    title: '柿柿如意',
    description: '隆仁豪柿子篇：橙红柿子挂满枝头，孩童伸手摘果，「柿柿如意」寓意事事如意。',
    artist: '隆仁豪',
    category: '系列五 · 柿子',
    series: '系列五',
    mediaUrl: '/exhibits/系列五/page-4.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#D96C3F',
  },
  {
    id: 's5-5',
    title: '百香百味',
    description: '隆仁豪百香果篇：紫金色剖面特写搭配亲子场景，「百香百味」诉说八桂山野的丰富滋味。',
    artist: '隆仁豪',
    category: '系列五 · 百香果',
    series: '系列五',
    mediaUrl: '/exhibits/系列五/page-5.png',
    ratio: 0.707,
    width: 1.24,
    placeholderColor: '#8E4A5E',
  },
  /* —— 系列二 · 果品补充组 —— */
  {
    id: 's2-1',
    title: '荔香满园',
    description: '荔枝主题海报：一家三口在荔枝树下采撷红荔枝，红绿撞色热烈明快。',
    artist: '视觉传达设计专业',
    category: '系列二 · 荔枝',
    series: '系列二',
    mediaUrl: '/exhibits/系列二/16d64804c97e9e767be848618660e849.png',
    ratio: 0.562,
    width: 1.07,
    placeholderColor: '#C44536',
  },
  {
    id: 's2-2',
    title: '百色芒果·芒得很',
    description: '百色芒果区域品牌形象：咧嘴大笑的芒果 IP 怀抱大芒果，果农口音的「芒得很」一听上头。',
    artist: '农启航',
    category: '系列二 · 芒果',
    series: '系列二',
    mediaUrl: '/exhibits/系列二/20a84b3ff63e7cccf0d26ef7e42e0a51.png',
    ratio: 0.561,
    width: 1.07,
    placeholderColor: '#D19A2F',
  },
  {
    id: 's2-3',
    title: '柿柿如意',
    description: '柿子主题海报：一家人在柿子树下摘柿子，橙红果实与「柿柿如意」的祝福。',
    artist: '视觉传达设计专业',
    category: '系列二 · 柿子',
    series: '系列二',
    mediaUrl: '/exhibits/系列二/38f02c96b51a29fa2e54069423dc5e7c.png',
    ratio: 0.562,
    width: 1.07,
    placeholderColor: '#D96C3F',
  },
  {
    id: 's2-4',
    title: '圆圆如意（龙眼）',
    description: '龙眼主题海报：串串金黄龙眼挂枝头，「圆圆如意」寓意阖家团圆。',
    artist: '视觉传达设计专业',
    category: '系列二 · 龙眼',
    series: '系列二',
    mediaUrl: '/exhibits/系列二/4601570e87444a262d339ab4ae3c3b56.png',
    ratio: 0.562,
    width: 1.07,
    placeholderColor: '#C9A227',
  },
  {
    id: 's2-5',
    title: '沃柑的旅程',
    description: '武鸣沃柑从枝头到餐桌的品牌包装：果箱插画讲述一颗柑橘的旅行，扫码可见果园实景。',
    artist: '庞天佑',
    category: '系列二 · 沃柑',
    series: '系列二',
    mediaUrl: '/exhibits/系列二/521b5f6e74942926757d1aa68cc0347c.png',
    ratio: 0.562,
    width: 1.07,
    placeholderColor: '#E08E3C',
  },
  {
    id: 's2-6',
    title: '百香百味',
    description: '百香果主题海报：切开的紫金剖面特写，果香扑面而来。',
    artist: '视觉传达设计专业',
    category: '系列二 · 百香果',
    series: '系列二',
    mediaUrl: '/exhibits/系列二/a88d7e7ff8171e88cb518e050818fc71.png',
    ratio: 0.561,
    width: 1.07,
    placeholderColor: '#8E4A5E',
  },
  /* —— 系列四 · 刘蓝月（创作幕后） —— */
  {
    id: 's4-1',
    title: '创作幕后·葡萄/火龙果/杨桃修改对照',
    description: '刘蓝月的修改过程稿：葡萄、火龙果、杨桃三张海报的修改前后并排对照，看见一张海报背后的打磨轨迹。',
    artist: '刘蓝月',
    category: '系列四 · 创作幕后',
    series: '系列四',
    mediaUrl: '/exhibits/系列四/page-1.png',
    ratio: 1.778,
    width: 2.0,
    placeholderColor: '#7FAE7A',
  },
  {
    id: 's4-2',
    title: '创作幕后·南瓜/甘蔗修改对照',
    description: '刘蓝月的修改过程稿：南瓜、甘蔗两张海报的修改前后对照，细节的推敲正是设计的日常。',
    artist: '刘蓝月',
    category: '系列四 · 创作幕后',
    series: '系列四',
    mediaUrl: '/exhibits/系列四/page-2.png',
    ratio: 1.778,
    width: 2.0,
    placeholderColor: '#B5893C',
  },
]

/* ---------------- 弧长布位：从入口右侧（104°）出发绕墙一周 ---------------- */

const ARC_START = 105 // 度，入口缺口右缘
const ARC_END = 433 // 度，入口缺口左缘（=73°+360）
const SLOT_GAP = 0.07 // 相邻画框之间的墙面间隙（米）——画框深度交错，间隙可以很小

const exhibits: Exhibit[] = (() => {
  const out: Exhibit[] = []
  const RAD2DEG = 180 / Math.PI
  let theta = ARC_START

  seeds.forEach((seed, i) => {
    const height = seed.width / seed.ratio
    const tall = height > 1.7
    const frameOuter = seed.width + MAT_AND_BARS // 占位宽度：画面 + 卡纸 + 框条

    // 按当前角度的弧长速度换算角宽（arcSpeed 单位是 米/弧度，转成度再推进）
    let sp = arcSpeed(theta)
    theta += ((frameOuter / 2 / sp) * RAD2DEG)
    sp = arcSpeed(theta)
    const centerTheta = theta

    // 锯齿交错：偶数位贴墙、奇数位向内退，密排时框角互不遮挡
    const depthBias = i % 2 === 0 ? 0 : ZIGZAG
    const slot = wallSlot(centerTheta, tall, seed.width / 2, height / 2, depthBias)

    out.push({
      ...seed,
      type: 'image' as const,
      position: { x: slot.x, y: tall ? HALL.EYE_HEIGHT + 0.45 : HALL.EYE_HEIGHT + 0.15, z: slot.z },
      rotationY: slot.rotationY,
      height,
    })

    theta += ((frameOuter / 2 + SLOT_GAP) / sp) * RAD2DEG
  })

  if (theta > ARC_END) {
    // 兜底：万一放不下（素材继续增多），整体等比压缩角度间距
    const overflow = theta - ARC_END
    const span = ARC_END - ARC_START
    const k = (span - overflow / 2) / span
    let t2 = ARC_START
    return out.map((ex, i) => {
      const seed = seeds[i]
      const height = seed.width / seed.ratio
      const tall = height > 1.7
      const frameOuter = seed.width + MAT_AND_BARS
      let sp = arcSpeed(t2)
      t2 += ((frameOuter / 2 / sp) * RAD2DEG) * k
      sp = arcSpeed(t2)
      const centerTheta = t2
      const slot = wallSlot(centerTheta, tall, seed.width / 2, height / 2, i % 2 === 0 ? 0 : ZIGZAG)
      t2 += (((frameOuter / 2 + SLOT_GAP) / sp) * RAD2DEG) * k
      return { ...ex, position: { x: slot.x, y: ex.position.y, z: slot.z }, rotationY: slot.rotationY }
    })
  }
  return out
})()

export default exhibits
