import { HALL, wallOutwardNormal, wallSurfacePoint } from '@/theme'

/** 系列内单张素材（详情面板轮播用） */
export interface ExhibitImage {
  url: string
  title: string
  description?: string
  /** 宽高比（宽/高），轮播容器按比例适配 */
  ratio: number
}

export interface Exhibit {
  id: string
  title: string
  description: string
  artist: string
  /** 品类标签，如「系列一 · 定稿组」 */
  category?: string
  /** 所属系列名（序言/系列一~六），导览条分组用 */
  series: string
  type: 'image' | 'video'
  /** 上墙封面图（取 images[0]） */
  mediaUrl: string
  /** 整个系列的全部素材，详情面板内轮播 */
  images: ExhibitImage[]
  position: { x: number; y: number; z: number }
  rotationY: number
  width: number
  height: number
  placeholderColor: string
  price?: string
}

/**
 * 系列化布展：一个系列一个展位，墙上只挂封面，整套素材在详情里轮播。
 * thetaDeg：0°=+X，90°=+Z（入口方向）。入口缺口约 76°~104°，不布展。
 * 画框按墙面「真法线」定向，数值采样展板跨度内墙面求最小离墙间距（防穿墙）。
 */
const FRAME_BACK = 0.075 // 画框背板凸出画面的深度（含背板+卡纸厚度）
const FRAME_GAP = 0.05 // 画框背板与墙面的最小间隙

function wallSlot(thetaDeg: number, tall: boolean, halfWidth: number, halfHeight: number) {
  const y = tall ? HALL.EYE_HEIGHT + 0.45 : HALL.EYE_HEIGHT + 0.15
  const t = (thetaDeg * Math.PI) / 180
  const [nx, nz] = wallOutwardNormal(t)
  const [cx, cz] = wallSurfacePoint(thetaDeg, y)

  const baseR = Math.hypot(cx, cz)
  const halfThetaDeg = ((halfWidth / baseR + 0.03) * 180) / Math.PI
  let protrusion = 0
  for (const hSign of [0, 1]) {
    const sy = y + hSign * halfHeight
    for (let i = 1; i <= 10; i++) {
      for (const sign of [-1, 1]) {
        const [px, pz] = wallSurfacePoint(thetaDeg + (sign * halfThetaDeg * i) / 10, sy)
        const d = (px - cx) * nx + (pz - cz) * nz
        protrusion = Math.min(protrusion, d)
      }
    }
  }

  const offset = FRAME_BACK + Math.max(0, -protrusion) + FRAME_GAP
  return {
    x: cx - nx * offset,
    z: cz - nz * offset,
    rotationY: Math.atan2(-nx, -nz),
  }
}

/* ---------------- 七个展位：序言 + 六个系列（按参观动线排序） ---------------- */

interface Seed {
  id: string
  title: string
  description: string
  artist: string
  category?: string
  series: string
  thetaDeg: number
  /** 封面画面宽度（米），高度按封面图比例推算 */
  width: number
  placeholderColor: string
  images: ExhibitImage[]
}

const seeds: Seed[] = [
  {
    id: 'preface',
    title: '序·八桂采鲜 亲子同欢',
    description:
      '「八桂采鲜·亲子同欢」创意海报展：以广西特色农产品为灵感，南瓜、葡萄、火龙果、甘蔗、杨桃五大果品串联亲子采摘之乐。六个系列、四十余件作品，以创意耕耘乡土，以设计服务三农。',
    artist: '刀马组',
    category: '序言 · 展览前言',
    series: '序言',
    thetaDeg: 118,
    width: 3.4,
    placeholderColor: '#2F5233',
    images: [{ url: '/exhibits/preface.png', title: '展览前言', ratio: 1008 / 565 }],
  },
  {
    id: 'series-1',
    title: '系列一 · 定稿组',
    description:
      '刀马组定稿组：3D 黏土风渲染的五果分海报与主视觉。一家四口怀抱丰收果实，南瓜圆、杨桃脆、甘蔗甜、火龙果红、葡萄紫，传递「解锁秋日采摘乐趣」的亲子邀约。文案罗江凤，排版韦宣伊。',
    artist: '刀马组',
    category: '系列一 · 定稿组',
    series: '系列一',
    thetaDeg: 168,
    width: 1.7,
    placeholderColor: '#4C7A4E',
    images: [
      { url: '/exhibits/series1/bagui-poster-1.jpg', title: '八桂采鲜·亲子同欢（主视觉）', description: '五种广西特产齐聚画面，系列总起。', ratio: 0.708 },
      { url: '/exhibits/series1/bagui-poster-2.jpg', title: '八桂拾秋·“南”得亲子乐', description: '南瓜篇：「南」谐音「难」，亲子采摘之乐得来不难。', ratio: 0.708 },
      { url: '/exhibits/series1/bagui-poster-3.jpg', title: '葡葡甜多汁·八桂亲子约', description: '葡萄篇：藤架间一家三口手牵手漫步，串串紫晶挂枝头。', ratio: 0.708 },
      { url: '/exhibits/series1/bagui-poster-4.jpg', title: '火龙果韵·八桂亲子摘', description: '火龙果篇：剥出丹霞果肉，收获满满幸福味。', ratio: 0.708 },
      { url: '/exhibits/series1/bagui-poster-5.jpg', title: '清甜杨桃季·八桂亲子趣', description: '杨桃篇：五棱果肉藏鲜润，牵手采摘醉金秋。', ratio: 0.708 },
      { url: '/exhibits/series1/bagui-poster-6.jpg', title: '蔗甜情深·八桂亲子行', description: '甘蔗篇：亲手砍断甜脆杆，共享田间欢乐时光。', ratio: 0.708 },
    ],
  },
  {
    id: 'series-3',
    title: '系列三 · 黄艳琦组',
    description:
      '黄艳琦系列：深绿底色五果聚顶的封面统领全局，杨桃、甘蔗、火龙果、葡萄、南瓜五张分海报各带谐音标题——「蔗里蔗气」「红焰枝头」「串串紫玉」「南得遇见」，谐音梗与色彩系统一气呵成。',
    artist: '黄艳琦',
    category: '系列三 · 海报设计',
    series: '系列三',
    thetaDeg: 222,
    width: 1.7,
    placeholderColor: '#2F5233',
    images: [
      { url: '/exhibits/series3/img-01.jpeg', title: '八桂采鲜·五果聚顶（封面）', ratio: 936 / 1664 },
      { url: '/exhibits/series3/img-02.jpeg', title: '清甜杨桃·五棱笑声', ratio: 936 / 1664 },
      { url: '/exhibits/series3/img-03.jpeg', title: '蔗里蔗气·亲子同行', ratio: 936 / 1664 },
      { url: '/exhibits/series3/img-04.jpeg', title: '红焰枝头·亲子同摘', ratio: 936 / 1664 },
      { url: '/exhibits/series3/img-05.jpeg', title: '串串紫玉·亲子同乐', ratio: 936 / 1664 },
      { url: '/exhibits/series3/img-06.jpeg', title: '南得遇见·亲子同欢', ratio: 936 / 1664 },
    ],
  },
  {
    id: 'series-6',
    title: '系列六 · 定稿全集',
    description:
      '刀马组定稿全集：五果定稿版与两张方案比选稿。备选方案以特写构图讲同一主题，与正式稿的叙事型构图形成对照——看见一组海报背后的取舍。',
    artist: '刀马组',
    category: '系列六 · 定稿全集',
    series: '系列六',
    thetaDeg: 272,
    width: 1.7,
    placeholderColor: '#C9A227',
    images: [
      { url: '/exhibits/series6/img-01.jpeg', title: '“南”得亲子乐（南瓜定稿）', description: '黏土风一家三口抱南瓜，细节与光影较初稿更饱满。', ratio: 1664 / 2496 },
      { url: '/exhibits/series6/img-02.jpeg', title: '葡葡甜多汁（葡萄定稿）', ratio: 1280 / 1920 },
      { url: '/exhibits/series6/img-03.jpeg', title: '火龙果韵（火龙果定稿）', ratio: 1280 / 1920 },
      { url: '/exhibits/series6/img-04.jpeg', title: '清甜杨桃季（杨桃定稿）', ratio: 1039 / 1495 },
      { url: '/exhibits/series6/img-05.jpeg', title: '丹霞果肉·亲子共享（火龙果另款）', description: '备选方案：以切面特写为主角的构图探索。', ratio: 1039 / 1495 },
      { url: '/exhibits/series6/img-06.jpeg', title: '杨桃篇（另款方案）', description: '备选方案：同一主题的另一条路。', ratio: 1039 / 1495 },
    ],
  },
  {
    id: 'series-5',
    title: '系列五 · 隆仁豪组',
    description:
      '隆仁豪系列：卡通拟人是最大亮点——咧嘴笑的芒果、红绿撞色的荔枝一家、憨态沃柑、事事如意的柿子、紫金剖面的百香果，谐音标题一脉相承的俏皮。',
    artist: '隆仁豪',
    category: '系列五 · 海报设计',
    series: '系列五',
    thetaDeg: 326,
    width: 1.7,
    placeholderColor: '#D19A2F',
    images: [
      { url: '/exhibits/series5/img-02.jpeg', title: '芒了个果（芒果）', description: '卡通芒果拟人形象手持采摘工具，俏皮的谐音标题。', ratio: 1138 / 1517 },
      { url: '/exhibits/series5/img-03.jpeg', title: '荔质洋溢（荔枝·其一）', ratio: 1138 / 1517 },
      { url: '/exhibits/series5/img-04.jpeg', title: '荔质洋溢（荔枝·其二）', ratio: 1138 / 1517 },
      { url: '/exhibits/series5/img-05.jpeg', title: '柑橘正好（沃柑）', ratio: 1138 / 1517 },
      { url: '/exhibits/series5/img-06.jpeg', title: '柿柿如意（柿子）', ratio: 1138 / 1517 },
      { url: '/exhibits/series5/img-07.jpeg', title: '百香百味（百香果）', ratio: 1024 / 1820 },
    ],
  },
  {
    id: 'series-2',
    title: '系列二 · 果品补充组',
    description:
      '果品补充组：把八桂的甜扩到更多山野——荔枝、芒果、柿子、龙眼、沃柑、百香果。农启航的「芒得很」用果农口音给百色芒果立了个性格，庞天佑的「沃柑的旅程」让果箱插画讲一颗柑橘的旅行。',
    artist: '农启航 / 庞天佑 等',
    category: '系列二 · 果品海报',
    series: '系列二',
    thetaDeg: 20,
    width: 1.45,
    placeholderColor: '#8E4A5E',
    images: [
      { url: '/exhibits/series2/16d64804c97e9e767be848618660e849.png', title: '荔香满园', description: '荔枝篇：红绿撞色热烈明快。', ratio: 0.562 },
      { url: '/exhibits/series2/20a84b3ff63e7cccf0d26ef7e42e0a51.png', title: '百色芒果·芒得很', description: '芒果 IP：咧嘴大笑的芒果，百色人的口气。', ratio: 0.561 },
      { url: '/exhibits/series2/38f02c96b51a29fa2e54069423dc5e7c.png', title: '柿柿如意', description: '柿子篇：橙红果实与如意的祝福。', ratio: 0.562 },
      { url: '/exhibits/series2/4601570e87444a262d339ab4ae3c3b56.png', title: '圆圆如意（龙眼）', description: '龙眼篇：串串金黄，阖家团圆。', ratio: 0.562 },
      { url: '/exhibits/series2/521b5f6e74942926757d1aa68cc0347c.png', title: '沃柑的旅程', description: '武鸣沃柑从枝头到餐桌的品牌包装。', ratio: 0.562 },
      { url: '/exhibits/series2/a88d7e7ff8171e88cb518e050818fc71.png', title: '百香百味', description: '百香果篇：紫金剖面特写。', ratio: 0.561 },
    ],
  },
  {
    id: 'series-4',
    title: '系列四 · 创作幕后',
    description:
      '刘蓝月的修改对照：五组海报的修改前（灰底浮字）与修改后（场景融合）依次呈现。好设计是改出来的——这一组让观展者看见海报背后的打磨轨迹。',
    artist: '刘蓝月',
    category: '系列四 · 创作幕后',
    series: '系列四',
    thetaDeg: 62,
    width: 1.7,
    placeholderColor: '#7FAE7A',
    images: [
      { url: '/exhibits/series4/img-01.jpeg', title: '葡萄篇 · 修改前', description: '灰底浮字的初稿排版。', ratio: 1237 / 2199 },
      { url: '/exhibits/series4/img-02.jpeg', title: '葡萄篇 · 修改后', description: '葡萄园场景与文字融合。', ratio: 1249 / 2220 },
      { url: '/exhibits/series4/img-03.jpeg', title: '火龙果篇 · 修改前', ratio: 719 / 1280 },
      { url: '/exhibits/series4/img-04.jpeg', title: '火龙果篇 · 修改后', ratio: 1024 / 1820 },
      { url: '/exhibits/series4/img-05.jpeg', title: '杨桃篇 · 修改前', ratio: 1246 / 2214 },
      { url: '/exhibits/series4/img-06.jpeg', title: '杨桃篇 · 修改后', ratio: 718 / 1280 },
      { url: '/exhibits/series4/img-07.jpeg', title: '南瓜篇 · 修改前', ratio: 1275 / 2267 },
      { url: '/exhibits/series4/img-08.jpeg', title: '南瓜篇 · 修改后', ratio: 1275 / 2266 },
      { url: '/exhibits/series4/img-09.jpeg', title: '甘蔗篇 · 修改前', ratio: 1290 / 2293 },
      { url: '/exhibits/series4/img-10.jpeg', title: '甘蔗篇 · 修改后', ratio: 720 / 1280 },
      { url: '/exhibits/series4/img-11.jpeg', title: '另稿 · 修改前', description: '南瓜/甘蔗篇另一方案的修改前。', ratio: 720 / 1280 },
      { url: '/exhibits/series4/img-12.jpeg', title: '另稿 · 修改后', ratio: 719 / 1280 },
    ],
  },
]

/**
 * 部署基址。vite `base: './'` 时该值为 './'。
 * 展品图 /exhibits/... 原本是站点「根路径」绝对写法，本地开发可直读；
 * 但部署到 GitHub Pages 子路径 /3dzhanting/ 后，/exhibits/... 会跳到站点
 * 根目录导致 404。这里统一给展品图加基址前缀，转为相对/根相对路径。
 */
const ASSET_BASE: string = import.meta.env.BASE_URL || '/'
const toAssetURL = (p: string): string =>
  /^([a-z][a-z0-9+.-]*:)?\/\//i.test(p) || p.startsWith('data:') ? p : ASSET_BASE + p.replace(/^\//, '')

const exhibits: Exhibit[] = seeds.map((seed) => {
  const images = seed.images.map((img) => ({ ...img, url: toAssetURL(img.url) }))
  const cover = images[0]
  const height = seed.width / cover.ratio
  const tall = height > 1.7
  const slot = wallSlot(seed.thetaDeg, tall, seed.width / 2, height / 2)
  return {
    ...seed,
    images,
    type: 'image' as const,
    mediaUrl: cover.url,
    position: { x: slot.x, y: tall ? HALL.EYE_HEIGHT + 0.45 : HALL.EYE_HEIGHT + 0.15, z: slot.z },
    rotationY: slot.rotationY,
    height,
  }
})

export default exhibits
