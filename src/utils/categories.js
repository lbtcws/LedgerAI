/**
 * 账单分类工具
 * 提供丰富的分类体系和基于关键词/AI 的自动分类功能
 */

/**
 * 获取当前语言
 */
function getCurrentLang() {
  try {
    // 尝试从 localStorage 直接读取配置
    const configStr = typeof uni !== 'undefined' 
      ? uni.getStorageSync('ledger-config')
      : localStorage.getItem('ledger-config')
    
    if (configStr) {
      const config = typeof configStr === 'string' 
        ? JSON.parse(configStr)
        : configStr
      
      if (config && config.language) {
        return config.language
      }
    }
  } catch (e) {
    console.warn('Failed to get language from config, defaulting to zh', e)
  }
  
  return 'zh'
}

/**
 * 分类翻译映射
 */
const CATEGORY_TRANSLATIONS = {
  '餐饮': { en: 'Dining' },
  '咖啡茶饮': { en: 'Coffee & Tea' },
  '零食': { en: 'Snacks' },
  '食材': { en: 'Groceries' },
  '房租': { en: 'Rent' },
  '房贷': { en: 'Mortgage' },
  '物业': { en: 'Property Fee' },
  '水电燃气': { en: 'Utilities' },
  '维修': { en: 'Maintenance' },
  '交通': { en: 'Transport' },
  '打车': { en: 'Ride-hailing' },
  '公共交通': { en: 'Public Transport' },
  '加油': { en: 'Fuel' },
  '停车': { en: 'Parking' },
  '车辆保养': { en: 'Car Maintenance' },
  '购物': { en: 'Shopping' },
  '服饰': { en: 'Clothing' },
  '数码': { en: 'Electronics' },
  '家居': { en: 'Home' },
  '美妆': { en: 'Beauty' },
  '书籍': { en: 'Books' },
  '娱乐': { en: 'Entertainment' },
  '电影': { en: 'Movies' },
  '游戏': { en: 'Games' },
  '旅行': { en: 'Travel' },
  '健身': { en: 'Fitness' },
  '学习': { en: 'Learning' },
  '培训': { en: 'Training' },
  '会员订阅': { en: 'Subscriptions' },
  '医疗': { en: 'Medical' },
  '药品': { en: 'Medicine' },
  '保健品': { en: 'Health Products' },
  '通讯': { en: 'Communication' },
  '话费': { en: 'Phone Bill' },
  '网费': { en: 'Internet' },
  '贷款': { en: 'Loan' },
  '保险': { en: 'Insurance' },
  '手续费': { en: 'Fees' },
  '红包': { en: 'Red Envelope' },
  '礼物': { en: 'Gifts' },
  '聚餐': { en: 'Dining Out' },
  '其他': { en: 'Other' },
  '工资': { en: 'Salary' },
  '奖金': { en: 'Bonus' },
  '兼职': { en: 'Part-time' },
  '理财': { en: 'Investment' },
  '租金': { en: 'Rental Income' },
  '报销': { en: 'Reimbursement' },
  '礼金': { en: 'Cash Gifts' }
}

/**
 * 翻译分类名称
 * @param {string} category - 分类名
 * @returns {string} - 翻译后的分类名
 */
export function tCategory(category) {
  const lang = getCurrentLang()
  if (lang === 'en' && CATEGORY_TRANSLATIONS[category]) {
    return CATEGORY_TRANSLATIONS[category].en
  }
  return category
}

/**
 * 支出分类体系（按优先级排序）
 */
export const EXPENSE_CATEGORIES = [
  // 餐饮食品
  '餐饮', '咖啡茶饮', '零食', '食材',
  // 住房相关
  '房租', '房贷', '物业', '水电燃气', '维修',
  // 交通出行
  '交通', '打车', '公共交通', '加油', '停车', '车辆保养',
  // 购物消费
  '购物', '服饰', '数码', '家居', '美妆', '书籍',
  // 娱乐休闲
  '娱乐', '电影', '游戏', '旅行', '健身',
  // 学习教育
  '学习', '培训', '会员订阅',
  // 医疗健康
  '医疗', '药品', '保健品',
  // 通讯网络
  '通讯', '话费', '网费',
  // 金融服务
  '贷款', '保险', '手续费',
  // 人情往来
  '红包', '礼物', '聚餐',
  // 其他
  '其他'
]

/**
 * 收入分类体系
 */
export const INCOME_CATEGORIES = [
  '工资', '奖金', '兼职', '理财', '租金', '报销', '礼金', '其他'
]

/**
 * 关键词到分类的映射（用于快速匹配）
 */
const KEYWORD_MAP = {
  // 餐饮
  '餐饮': ['饭', '面', '餐', '吃', '早餐', '午餐', '晚餐', '外卖', '麦当劳', '肯德基', '汉堡', '披萨'],
  '咖啡茶饮': ['咖啡', '奶茶', '茶', '星巴克', '瑞幸', '喜茶', '奈雪'],
  '零食': ['零食', '小吃', '饼干', '薯片', '糖果'],
  '食材': ['菜', '肉', '超市', '买菜', '水果', '蔬菜'],
  
  // 住房
  '房租': ['房租', '租金', '租房', '押金'],
  '房贷': ['房贷', '月供', '贷款'],
  '物业': ['物业', '管理费'],
  '水电燃气': ['水费', '电费', '燃气', '煤气', '取暖'],
  '维修': ['维修', '疏通', '安装', '师傅'],
  
  // 交通
  '交通': ['交通', '地铁', '公交', '火车', '高铁', '飞机', '轮船'],
  '打车': ['滴滴', '打车', '网约车', '出租车'],
  '加油': ['加油', '石化', '石油'],
  '停车': ['停车', '停车费'],
  '车辆保养': ['保养', '洗车', '车险', '违章'],
  
  // 购物
  '购物': ['购物', '淘宝', '京东', '拼多多', '天猫', '超市'],
  '服饰': ['衣服', '鞋', '帽', '裤子', '裙子', '内衣', '袜子'],
  '数码': ['手机', '电脑', '平板', '耳机', '数码', '电子', '充电', '数据线'],
  '家居': ['家具', '家电', '床', '沙发', '灯具', '厨具'],
  '美妆': ['化妆', '护肤', '口红', '面膜', '洗发水', '沐浴露'],
  '书籍': ['书', '图书', '文具', 'Kindle'],
  
  // 娱乐
  '娱乐': ['娱乐', 'KTV', '酒吧', '演唱会', '展览', '演出'],
  '电影': ['电影', '影院', '影城', '票务'],
  '游戏': ['游戏', '充值', '皮肤', '点卡', 'Steam', 'Switch'],
  '旅行': ['旅行', '旅游', '酒店', '民宿', '景点', '门票', '机票'],
  '健身': ['健身', '瑜伽', '游泳', '运动', '健身房'],
  
  // 学习
  '学习': ['学习', '课程', '培训', '学费', '考试', '报名'],
  '会员订阅': ['会员', '订阅', 'VIP', '会员费', '月费', '年费', '爱奇艺', '腾讯视频', '网易云', 'Spotify'],
  
  // 医疗
  '医疗': ['医院', '门诊', '住院', '检查', '体检', '治疗'],
  '药品': ['药', '药店', '买药', '处方'],
  '保健品': ['保健品', '维生素', '补品'],
  
  // 通讯
  '通讯': ['通讯', '话费', '流量', '充值', '月租'],
  '网费': ['网费', '宽带', '网络'],
  
  // 金融
  '贷款': ['贷款', '分期', '借呗', '花呗', '信用卡'],
  '保险': ['保险', '保费', '保单'],
  '手续费': ['手续费', '服务费', '佣金', '利息'],
  
  // 人情
  '红包': ['红包', '转账', '礼金', '份子钱'],
  '礼物': ['礼物', '礼品', '送人'],
  '聚餐': ['聚餐', '请客', 'AA']
}

/**
 * 根据备注和金额快速匹配分类
 * @param {string} note - 账单备注
 * @param {string} type - 账单类型 EXPENSE 或 INCOME
 * @returns {string} - 匹配的分类
 */
export function quickCategorize(note, type = 'EXPENSE') {
  if (!note || typeof note !== 'string') {
    return type === 'EXPENSE' ? '其他' : '其他'
  }
  
  const noteLower = note.toLowerCase()
  
  // 遍历关键词映射，找到最匹配的分类
  let bestMatch = null
  let bestScore = 0
  
  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (noteLower.includes(keyword.toLowerCase())) {
        // 关键词越长，优先级越高
        const score = keyword.length
        if (score > bestScore) {
          bestScore = score
          bestMatch = category
        }
      }
    }
  }
  
  if (bestMatch) {
    return bestMatch
  }
  
  // 默认分类
  return type === 'EXPENSE' ? '其他' : '其他'
}

/**
 * AI 智能分类（快速模式）
 * 使用简化的 prompt 和本地缓存优化速度
 * @param {string} note - 账单备注
 * @param {number} amount - 金额
 * @param {string} type - 类型 EXPENSE 或 INCOME
 * @returns {Promise<string>} - AI 分类结果
 */
export async function aiCategorize(note, amount, type = 'EXPENSE') {
  // 先尝试快速匹配
  const quickResult = quickCategorize(note, type)
  if (quickResult !== '其他') {
    return quickResult
  }
  
  // 如果快速匹配失败，且 AI 功能启用，使用 AI 分类
  try {
    const { callAi } = await import('./ai-ledger.js')
    const { getAiConfig } = await import('./ai-config.js')
    
    const config = getAiConfig()
    if (!config.enabled || !config.apiKey) {
      return '其他'
    }
    
    // 简化的 prompt，只返回分类名
    const categories = type === 'EXPENSE' 
      ? EXPENSE_CATEGORIES.slice(0, 20).join(',') // 只取前 20 个常用分类加速
      : INCOME_CATEGORIES.join(',')
    
    const prompt = `只返回分类名，不要解释。
备注："${note}"
金额：${amount}
可选分类：${categories}
直接返回最匹配的分类名：`

    const result = await callAi(prompt, {
      temperature: 0.3, // 低温度保证稳定性
      maxTokens: 10 // 只需要分类名
    })
    
    // 清理结果
    const cleaned = result.trim().replace(/["']/g, '')
    
    // 验证是否在分类列表中
    const allCategories = type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    if (allCategories.includes(cleaned)) {
      return cleaned
    }
    
    return '其他'
  } catch (error) {
    console.warn('AI 分类失败，使用默认分类', error)
    return '其他'
  }
}

/**
 * 获取支出分类列表
 * @returns {string[]} - 分类数组
 */
export function getExpenseCategories() {
  return EXPENSE_CATEGORIES
}

/**
 * 获取收入分类列表
 * @returns {string[]} - 分类数组
 */
export function getIncomeCategories() {
  return INCOME_CATEGORIES
}

/**
 * 分类分组（用于 UI 展示）
 */
export const CATEGORY_GROUPS = {
  '餐饮食品': ['餐饮', '咖啡茶饮', '零食', '食材'],
  '住房相关': ['房租', '房贷', '物业', '水电燃气', '维修'],
  '交通出行': ['交通', '打车', '加油', '停车', '车辆保养'],
  '购物消费': ['购物', '服饰', '数码', '家居', '美妆', '书籍'],
  '娱乐休闲': ['娱乐', '电影', '游戏', '旅行', '健身'],
  '学习教育': ['学习', '会员订阅'],
  '医疗健康': ['医疗', '药品', '保健品'],
  '通讯网络': ['通讯', '网费'],
  '金融服务': ['贷款', '保险', '手续费'],
  '人情往来': ['红包', '礼物', '聚餐'],
  '其他': ['其他']
}

/**
 * 收入分类分组
 */
export const INCOME_GROUPS = {
  '工作收入': ['工资', '奖金'],
  '副业收入': ['兼职'],
  '投资收益': ['理财', '租金'],
  '其他收入': ['报销', '礼金', '其他']
}

/**
 * 分组翻译映射
 */
const GROUP_TRANSLATIONS = {
  '餐饮食品': { en: 'Food & Dining' },
  '住房相关': { en: 'Housing' },
  '交通出行': { en: 'Transportation' },
  '购物消费': { en: 'Shopping' },
  '娱乐休闲': { en: 'Entertainment' },
  '学习教育': { en: 'Education' },
  '医疗健康': { en: 'Healthcare' },
  '通讯网络': { en: 'Communication' },
  '金融服务': { en: 'Financial' },
  '人情往来': { en: 'Social' },
  '其他': { en: 'Other' },
  '工作收入': { en: 'Work Income' },
  '副业收入': { en: 'Side Hustle' },
  '投资收益': { en: 'Investment' },
  '其他收入': { en: 'Other Income' }
}

/**
 * 翻译分组名称
 * @param {string} group - 分组名
 * @returns {string} - 翻译后的分组名
 */
export function tGroup(group) {
  const lang = getCurrentLang()
  if (lang === 'en' && GROUP_TRANSLATIONS[group]) {
    return GROUP_TRANSLATIONS[group].en
  }
  return group
}
