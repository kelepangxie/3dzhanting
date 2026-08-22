/** 展品社交数据：游客点赞基数与预置点评（星级评分 + 留言） */

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

/** 各展品的点赞基数（观众累计点赞，不含当前用户） */
export const BASE_LIKES: Record<string, number> = {
  'exhibit-1': 128,
  'exhibit-2': 86,
  'exhibit-3': 104,
  'exhibit-4': 67,
  'exhibit-5': 92,
  'exhibit-6': 75,
  'exhibit-7': 98,
  'exhibit-8': 59,
  'exhibit-9': 81,
  'exhibit-10': 113,
  'exhibit-11': 88,
  'exhibit-12': 132,
}

/** 预置游客点评：按展品组织，展示时与用户评论合并 */
export const SEEDED_REVIEWS: Record<string, ReviewItem[]> = {
  'exhibit-1': [
    { id: 's1-1', name: '罗老师', rating: 5, text: '主视觉很抓眼球！五种特产的黏土质感统一又有辨识度，作为系列首张非常称职。', time: '3 天前', likes: 24 },
    { id: 's1-2', name: '亲子家长·小蛮妈', rating: 5, text: '带孩子来看展，他一眼就认出了火龙果和杨桃，回家路上一直在念"解锁秋日采摘乐趣"～', time: '1 周前', likes: 18 },
    { id: 's1-3', name: '视传2102·阿泽', rating: 4, text: '构图饱满但不挤，配色那一手从暖橙到紫的过渡很稳。字体再推敲一下会更好。', time: '2 周前', likes: 9 },
  ],
  'exhibit-2': [
    { id: 's2-1', name: '非遗爱好者·老周', rating: 5, text: '灵山烟墩大鼓能被年轻人做成动态视觉，鼓纹转译成律动图形这个思路太妙了。', time: '5 天前', likes: 21 },
    { id: 's2-1b', name: '数媒·陈同学', rating: 4, text: '节奏感做得不错，建议鼓声的声波可以再抽象一层，和图形的呼吸感拉开层次。', time: '6 天前', likes: 7 },
  ],
  'exhibit-3': [
    { id: 's3-1', name: '观展人·青禾', rating: 5, text: '"南"得亲子乐这个谐音梗用得巧，笑脸南瓜一出来整个展位都被点亮了。', time: '2 天前', likes: 16 },
    { id: 's3-2', name: '插画·小鹿', rating: 5, text: '拟人花朵和彩虹的细节好可爱，儿童视角的表达很真诚，不套路。', time: '4 天前', likes: 12 },
    { id: 's3-3', name: '农学院新生', rating: 4, text: '第一次看设计展，原来海报还能这么讲故事，收藏了。', time: '1 周前', likes: 5 },
  ],
  'exhibit-4': [
    { id: 's4-1', name: '壮锦研究·韦老师', rating: 5, text: '万字纹参数化那段循环得很顺，纹样在算法里"活"过来的感觉，正是非遗数字化需要的示范。', time: '1 周前', likes: 19 },
    { id: 's4-2', name: '生成艺术·Kai', rating: 4, text: '规则设计得克制，没有为了炫技打碎纹样的秩序感，好评。', time: '2 周前', likes: 8 },
  ],
  'exhibit-5': [
    { id: 's5-1', name: '亲子家长·糖糖爸', rating: 5, text: '葡萄园藤架的透视很有代入感，"串串紫晶挂枝头"这句文案记下来了。', time: '3 天前', likes: 14 },
    { id: 's5-2', name: '品牌·梁设计师', rating: 4, text: '糖果色系统一，卡通造型完成度高， IP 延展应该还有空间。', time: '5 天前', likes: 11 },
  ],
  'exhibit-6': [
    { id: 's6-1', name: '百色果农·黄叔', rating: 5, text: '「芒得很」！这个口号一听就是我们百色人的口气，笑着就把品牌记住了。', time: '4 天前', likes: 27 },
    { id: 's6-2', name: '营销·苏同学', rating: 4, text: '方言梗做区域公用品牌是聪明打法，咧嘴笑的芒果 IP 辨识度强。', time: '1 周前', likes: 10 },
  ],
  'exhibit-7': [
    { id: 's7-1', name: '观展人·朱雀', rating: 5, text: '切开的红果那一抹丹霞色是全场的记忆点，和绿色果林撞得漂亮。', time: '2 天前', likes: 15 },
    { id: 's7-2', name: '插画·小鹿', rating: 5, text: '父亲提满篮的背影有生活气息，不摆拍。蝴蝶与粉花的点缀节奏刚好。', time: '1 周前', likes: 9 },
  ],
  'exhibit-8': [
    { id: 's8-1', name: '包装·岑设计师', rating: 4, text: '果箱插画讲"一颗柑橘的旅行"，叙事思路清晰，扫码连果园实景是加分项。', time: '6 天前', likes: 13 },
    { id: 's8-2', name: '电商·陆同学', rating: 5, text: '产地和消费者互相看见——这句话适合写进包装课程教案。', time: '2 周前', likes: 8 },
  ],
  'exhibit-9': [
    { id: 's9-1', name: '观展人·晨风', rating: 5, text: '晨光里提篮走向山林的一家三口，画面安静又有余味，"醉金秋"三个字点得准。', time: '3 天前', likes: 17 },
    { id: 's9-2', name: '摄影·老莫', rating: 4, text: '五棱果实的几何感和人物曲线对比得舒服，光的方向感可以再强化一点。', time: '1 周前', likes: 6 },
  ],
  'exhibit-10': [
    { id: 's10-1', name: '亲子家长·桐桐妈', rating: 5, text: '孩子看完非要周末去砍甘蔗，"巨型棒棒糖"的联想太懂小朋友了。', time: '1 天前', likes: 22 },
    { id: 's10-2', name: '文案课·何老师', rating: 5, text: '罗江凤的文案口语感和韵脚都稳，韦宣伊的排版留白也克制，组合舒服。', time: '4 天前', likes: 15 },
    { id: 's10-3', name: '观展人·青禾', rating: 4, text: '五张分海报里我最喜欢这张，亲子合力砍蔗的动态画得最生动。', time: '1 周前', likes: 7 },
  ],
  'exhibit-11': [
    { id: 's11-1', name: '动画·谭师姐', rating: 5, text: '鼓皮震颤的粒子细节经得起暂停逐帧看，红绸的飘动轨迹很讲究。', time: '5 天前', likes: 20 },
    { id: 's11-2', name: '非遗爱好者·老周', rating: 5, text: '老匠人的手部特写是全片情感锚点，传承这个主题没有喊口号，用镜头说话。', time: '2 周前', likes: 14 },
  ],
  'exhibit-12': [
    { id: 's12-1', name: '人文学院·李老师', rating: 5, text: '前言把"八桂采鲜"的策展逻辑讲清楚了：以鲜入题、以乐传情、以农立意。', time: '3 天前', likes: 26 },
    { id: 's12-2', name: '视传2201·班委', rating: 5, text: '全班一起云观展打卡！"厚德明志，勤耕笃行"放在结尾很有力量。', time: '1 周前', likes: 19 },
    { id: 's12-3', name: '观展人·老陈', rating: 4, text: '3D 展厅逛起来很顺，前言位置也合理，进门先读再环游，动线舒服。', time: '2 周前', likes: 8 },
  ],
}
