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
  sky: '#EAF0E2', // 展厅雾色/环境
  sunlight: '#FFF6E0', // 暖阳光
  ink: '#3B4A3C', // 墨绿字色
} as const

// 展厅空间尺寸（米）—— 全局唯一定义，各组件从这里取
export const ROOM = {
  WIDTH: 24,
  DEPTH: 16,
  HEIGHT: 5,
  WALL_MARGIN: 0.5,
  EYE_HEIGHT: 1.7,
} as const

// 展览信息
export const EXHIBITION = {
  title: '八桂采鲜·亲子同欢',
  subtitle: '广西特色农产品亲子采摘系列创意海报展',
  team: '刀马组',
  teamMembers: '文案：罗江凤 | 排版：韦宣伊',
  tagline: '以创意采摘广西之鲜，以设计传递亲子之乐',
  school: '广西农业职业技术大学 · 人文与艺术学院 · 视觉传达设计',
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
