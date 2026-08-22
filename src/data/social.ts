/** 展品社交数据：游客点赞基数与预置点评（星级评分 + 留言），按系列展位组织 */

export interface ReviewItem {
  id: string
  name: string
  /** 1-5 星 */
  rating: number
  text: string
  /** 展示用时间文案 */
  time: string
  /** 该条点评的点赞数 */
  likes: number
}

/** 各系列展位的点赞基数（观众累计点赞，不含当前用户） */
export const BASE_LIKES: Record<string, number> = {
  preface: 132,
  'series-1': 128,
  'series-2': 96,
  'series-3': 84,
  'series-4': 71,
  'series-5': 102,
  'series-6': 88,
}

/** 预置游客点评：按展位组织，展示时与用户评论合并 */
export const SEEDED_REVIEWS: Record<string, ReviewItem[]> = {
  preface: [
    { id: 'p-1', name: '人文学院·李老师', rating: 5, text: '前言把「八桂采鲜」的策展逻辑讲清楚了：以鲜入题、以乐传情、以农立意。', time: '3 天前', likes: 26 },
    { id: 'p-2', name: '观展人·老陈', rating: 4, text: '进门先读序再环游，七个展位一路看下来很顺，轮播里能看全每个系列。', time: '1 周前', likes: 8 },
  ],
  'series-1': [
    { id: 's1-1', name: '罗老师', rating: 5, text: '主视觉很抓眼球！五种特产的黏土质感统一又有辨识度，分海报的文案也稳。', time: '3 天前', likes: 24 },
    { id: 's1-2', name: '亲子家长·小蛮妈', rating: 5, text: '孩子一眼认出火龙果和杨桃，回家路上一直在念"解锁秋日采摘乐趣"～', time: '1 周前', likes: 18 },
    { id: 's1-3', name: '文案课·何老师', rating: 5, text: '罗江凤的文案口语感和韵脚都稳，韦宣伊的排版留白也克制。', time: '4 天前', likes: 15 },
  ],
  'series-2': [
    { id: 's2-1', name: '百色果农·黄叔', rating: 5, text: '「芒得很」！这个口号一听就是我们百色人的口气，笑着就把品牌记住了。', time: '4 天前', likes: 27 },
    { id: 's2-2', name: '包装·岑设计师', rating: 5, text: '「沃柑的旅程」果箱插画叙事思路清晰，扫码连果园实景是加分项。', time: '6 天前', likes: 13 },
    { id: 's2-3', name: '灵山老乡·阿荔', rating: 4, text: '荔枝、龙眼、百香果都齐了，八桂的甜算是集齐了。', time: '1 周前', likes: 9 },
  ],
  'series-3': [
    { id: 's3-1', name: '视传2102·阿泽', rating: 5, text: '黄艳琦这套的谐音标题一脉相承——蔗里蔗气、红焰枝头、串串紫玉，读起来上口。', time: '5 天前', likes: 16 },
    { id: 's3-2', name: '插画·小鹿', rating: 4, text: '封面的字体图形化做得很完整，五果聚顶的构图有仪式感。', time: '1 周前', likes: 7 },
  ],
  'series-4': [
    { id: 's4-1', name: '设计课·助教', rating: 5, text: '把修改前后对照做成轮播太直观了，学生看到"好设计是改出来的"最有说服力。', time: '2 天前', likes: 19 },
    { id: 's4-2', name: '视传2102·阿泽', rating: 5, text: '对比着看才明白定稿的每处取舍，幕后比成品更让人安心。', time: '5 天前', likes: 12 },
  ],
  'series-5': [
    { id: 's5-1', name: '营销·苏同学', rating: 5, text: '隆仁豪的拟人 IP 一套七个都带谐音梗，芒了个果、荔质洋溢、柑橘正好，记性好的设计师。', time: '2 天前', likes: 21 },
    { id: 's5-2', name: '观展人·青禾', rating: 4, text: '红绿撞色够大胆，卡通表情管理到位，方案一二对照着轮播看很有意思。', time: '5 天前', likes: 8 },
  ],
  'series-6': [
    { id: 's6-1', name: '视传2201·班委', rating: 5, text: '定稿全集轮播里翻到方案比选那两张，备选稿的特写构图其实也很能打！', time: '3 天前', likes: 14 },
    { id: 's6-2', name: '罗老师', rating: 4, text: '定稿版比初稿的光影扎实多了，一整套看下来打磨的轨迹很清楚。', time: '1 周前', likes: 9 },
  ],
}
