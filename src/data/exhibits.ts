import { HALL, wallOutwardNormal, wallSurfacePoint } from '@/theme'

export interface Exhibit {
  id: string
  title: string
  description: string
  artist: string
  /** 作品门类，如「包装设计」「海报设计」 */
  category?: string
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
 * 椭圆曲面展厅布展：展品沿弧形白墙环形排布，画面朝向圆心。
 * thetaDeg：0°=+X，90°=+Z（入口方向）。入口缺口约 76°~104°，此区间不布展
 * （画框悬在无墙的门洞里会与拱门立柱穿插，务必避开）。
 *
 * 摆放算法：画框按墙面「真法线」定向（径向会在象限中部斜插进墙），
 * 再对展板跨度内的墙面（含顶部内收）数值采样，求出保证整幅画框
 * 完整悬浮于墙前的最小离墙间距。
 */
const FRAME_BACK = 0.062 // 画框背板凸出画面的深度
const FRAME_GAP = 0.05 // 画框背板与墙面的最小间隙

function wallSlot(thetaDeg: number, tall: boolean, halfWidth: number, halfHeight: number) {
  const y = tall ? HALL.EYE_HEIGHT + 0.58 : HALL.EYE_HEIGHT + 0.15
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

  const offset = FRAME_BACK + Math.max(0, -protrusion) + FRAME_GAP
  return {
    x: cx - nx * offset,
    z: cz - nz * offset,
    rotationY: Math.atan2(-nx, -nz),
  }
}

// 广西农业职业技术大学 · 人文与艺术学院 · 视觉传达设计
// 主题示例展品：结合广西农耕文化、非遗与乡村振兴设计课题。
// 替换真实作品：把图片/视频放到 public/placeholders/ 下同名文件即可（见 README）。

interface Seed {
  id: string
  title: string
  description: string
  artist: string
  category?: string
  type: 'image' | 'video'
  mediaUrl: string
  thetaDeg: number
  width: number
  height: number
  placeholderColor: string
  price?: string
}

const seeds: Seed[] = [
  {
    id: 'exhibit-1',
    title: '八桂采鲜·亲子同欢',
    description:
      '「八桂采摘」系列主海报。3D黏土风渲染的一家四口怀抱丰收果实，南瓜圆、杨桃脆、甘蔗甜、火龙果红、葡萄紫，五种广西特产齐聚画面，传递「解锁秋日采摘乐趣」的亲子邀约。',
    artist: '刀马组',
    category: '海报设计',
    type: 'image',
    mediaUrl: '/exhibits/bagui-poster-1.jpg',
    thetaDeg: 152,
    width: 1.7,
    height: 2.4,
    placeholderColor: '#4C7A4E',
  },
  {
    id: 'exhibit-2',
    title: '烟墩大鼓·鼓韵八桂',
    description:
      '以国家级非物质文化遗产灵山烟墩大鼓为主题的动态视觉设计，鼓纹与鼓声节奏转译为律动的图形语言，让百年鼓韵在屏幕上重新擂响。',
    artist: '覃志豪',
    category: '动态视觉',
    type: 'video',
    mediaUrl: '/placeholders/exhibit-2.mp4',
    thetaDeg: 122,
    width: 2.4,
    height: 1.6,
    placeholderColor: '#8A4A2F',
  },
  {
    id: 'exhibit-3',
    title: '八桂拾秋·“南”得亲子乐',
    description:
      '南瓜主题分海报。「南」谐音「难」，寓意亲子采摘之乐得来不难。一家三口置身南瓜田，孩子手捧笑脸圆南瓜，拟人花朵与彩虹点缀其间，把秋日童趣摘回家。',
    artist: '刀马组',
    category: '海报设计',
    type: 'image',
    mediaUrl: '/exhibits/bagui-poster-2.jpg',
    thetaDeg: 110,
    width: 1.7,
    height: 2.4,
    placeholderColor: '#2F5233',
  },
  {
    id: 'exhibit-4',
    title: '壮锦纹样·数字织造',
    description:
      '将壮族传统织锦的几何纹样参数化，用生成设计演绎万字纹、回纹与蟒龙纹的无穷变换，古老的手艺在算法中获得新的生命。',
    artist: '梁晓蝶',
    category: '数字艺术',
    type: 'video',
    mediaUrl: '/placeholders/exhibit-4.mp4',
    thetaDeg: 66,
    width: 2.4,
    height: 1.6,
    placeholderColor: '#8E4A5E',
  },
  {
    id: 'exhibit-5',
    title: '葡葡甜多汁·八桂亲子约',
    description:
      '葡萄主题分海报。葡萄园藤架间，一家三口手牵手漫步，「串串紫晶挂枝头，牵手采摘乐无忧」。萌系卡通造型与明亮糖果色，让田园采摘成为最甜蜜的亲子约定。',
    artist: '刀马组',
    category: '海报设计',
    type: 'image',
    mediaUrl: '/exhibits/bagui-poster-3.jpg',
    thetaDeg: 34,
    width: 1.7,
    height: 2.4,
    placeholderColor: '#3E6B8E',
  },
  {
    id: 'exhibit-6',
    title: '百色芒果·芒得很',
    description:
      '为百色芒果设计的区域公用品牌形象：一只咧嘴大笑的芒果IP，配上果农口音的slogan「芒得很」，让山里的甜有了性格。',
    artist: '农启航',
    category: '品牌形象',
    type: 'video',
    mediaUrl: '/placeholders/exhibit-6.mp4',
    thetaDeg: 4,
    width: 2.4,
    height: 1.6,
    placeholderColor: '#D19A2F',
  },
  {
    id: 'exhibit-7',
    title: '火龙果韵·八桂亲子摘',
    description:
      '火龙果主题分海报。仙人掌状的果林间，孩子们高举切开的红果，父亲提着满篮收获，蝴蝶与粉花环绕。「剥出丹霞果肉，收获满满幸福味」。',
    artist: '刀马组',
    category: '海报设计',
    type: 'image',
    mediaUrl: '/exhibits/bagui-poster-4.jpg',
    thetaDeg: -26,
    width: 1.7,
    height: 2.4,
    placeholderColor: '#5E8C5A',
  },
  {
    id: 'exhibit-8',
    title: '沃柑的旅程',
    description:
      '武鸣沃柑从枝头到餐桌的品牌包装全案：果箱上的插画讲述一颗柑橘的旅行，扫码可看果园实景，让消费者与产地彼此看见。',
    artist: '庞天佑',
    category: '包装设计',
    type: 'video',
    mediaUrl: '/placeholders/exhibit-8.mp4',
    thetaDeg: -56,
    width: 2.4,
    height: 1.6,
    placeholderColor: '#E08E3C',
  },
  {
    id: 'exhibit-9',
    title: '清甜杨桃季·八桂亲子趣',
    description:
      '杨桃主题分海报。果园小径上，一家三口提着满篮五棱果实走向山林晨光，「五棱果肉藏鲜润，牵手采摘醉金秋」，枝叶掩映间满是秋日清甜。',
    artist: '刀马组',
    category: '海报设计',
    type: 'image',
    mediaUrl: '/exhibits/bagui-poster-5.jpg',
    thetaDeg: -86,
    width: 1.7,
    height: 2.4,
    placeholderColor: '#3A7A6E',
  },
  {
    id: 'exhibit-10',
    title: '蔗甜情深·八桂亲子行',
    description:
      '甘蔗主题分海报。蔗田里亲子合力砍下甜脆甘蔗，巨型棒棒糖与蔗甜呼应，「亲手砍断甜脆杆，共享田间欢乐时光」。文案罗江凤，排版韦宣伊。',
    artist: '刀马组',
    category: '海报设计',
    type: 'image',
    mediaUrl: '/exhibits/bagui-poster-6.jpg',
    thetaDeg: -116,
    width: 1.7,
    height: 2.4,
    placeholderColor: '#B5893C',
  },
  {
    id: 'exhibit-11',
    title: '《鼓韵》非遗动画',
    description:
      '烟墩大鼓主题三维动画短片片段：鼓皮震颤的粒子、飞舞的红绸与老匠人布满岁月的手，讲述技艺传承的动人瞬间。',
    artist: '谭嘉玮',
    category: '动画设计',
    type: 'video',
    mediaUrl: '/placeholders/exhibit-11.mp4',
    thetaDeg: -146,
    width: 2.4,
    height: 1.6,
    placeholderColor: '#7A3A28',
  },
  {
    id: 'exhibit-12',
    title: '序·耕耘者的展厅',
    description:
      '「八桂采鲜·亲子同欢」——刀马组创意海报展。本系列以广西特色农产品为灵感，用 3D 黏土风插画呈现南瓜、葡萄、火龙果、甘蔗、杨桃五大果品的亲子采摘场景，传递自然之鲜与家庭之乐。刀马组以创意耕耘乡土，以设计服务三农，践行广西农业职业技术大学「厚德明志，勤耕笃行」的校训精神。',
    artist: '刀马组 · 视觉传达设计专业',
    category: '展厅前言',
    type: 'image',
    mediaUrl: '/placeholders/exhibit-12.jpg',
    thetaDeg: -176,
    width: 3.0,
    height: 1.8,
    placeholderColor: '#2F5233',
  },
]

const exhibits: Exhibit[] = seeds.map((seed) => {
  const tall = seed.height > 2
  const slot = wallSlot(seed.thetaDeg, tall, seed.width / 2, seed.height / 2)
  return {
    ...seed,
    position: { x: slot.x, y: tall ? HALL.EYE_HEIGHT + 0.58 : HALL.EYE_HEIGHT + 0.15, z: slot.z },
    rotationY: slot.rotationY,
  }
})

export default exhibits
