/**
 * 金额格式化
 * @param {number} amount - 金额数字
 * @param {boolean} showSign - 是否显示正负号
 * @param {boolean} useWanUnit - 是否使用"万"单位（金额>=10000 时）
 * @returns {string} 格式化后的金额字符串
 */
export function formatAmount(amount, showSign = false, useWanUnit = true) {
  // 自动获取当前语言
  let lang = 'zh'
  try {
    const { useConfigStore } = require('@/store/config')
    const store = useConfigStore()
    lang = store.language || 'zh'
  } catch {
    lang = 'zh'
  }
  
  const num = Number(amount) || 0
  const absNum = Math.abs(num)
  
  let formatted
  // 金额超过 1 万，使用"万"为单位显示
  if (useWanUnit && absNum >= 10000) {
    const unit = lang === 'en' ? 'K' : '万'
    // 英文环境下显示为 10K 格式（1 万=10K）
    if (lang === 'en') {
      const kAmount = num / 1000
      formatted = kAmount.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      }) + unit
    } else {
      const wanAmount = num / 10000
      formatted = wanAmount.toLocaleString('zh-CN', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      }) + unit
    }
  } else {
    formatted = num.toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  
  if (showSign) {
    return num >= 0 ? `+${formatted}` : formatted
  }
  return formatted
}

/**
 * 日期格式化
 * @param {string|Date} date - 日期
 * @param {string} format - 格式：'short' | 'full' | 'relative'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'short') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]

  if (format === 'full') {
    return `${year}年${month}月${day}日 ${weekday}`
  }

  if (format === 'relative') {
    const today = new Date()
    const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24))
    if (diff === 0) return '今天'
    if (diff === 1) return '昨天'
    if (diff === 2) return '前天'
    if (diff < 7) return `${diff}天前`
    return `${month}月${day}日`
  }

  return `${month}月${day}日`
}

/**
 * 解析 AI 报告文本为结构化段落
 * @param {string} text - AI 返回的报告文本
 * @returns {Array} 分段后的数组 [{tag, content}]
 */
export function parseAiReport(text) {
  const sections = ['异常', '习惯', '建议', '总结']
  return sections.map(tag => {
    const regex = new RegExp(`【${tag}】([\\s\\S]*?)(?=【|$)`)
    const match = text.match(regex)
    return {
      tag,
      content: match?.[1]?.trim() || ''
    }
  })
}

/**
 * 获取年份月份字符串
 * @param {Date} date - 日期对象
 * @returns {string} YYYY-MM 格式
 */
export function getYearMonth(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * 月份导航
 * @param {string} yearMonth - 当前年月 YYYY-MM
 * @param {number} delta - 偏移月数（-1 上月，1 下月）
 * @returns {string} 新的年月
 */
export function navigateMonth(yearMonth, delta) {
  const [year, month] = yearMonth.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return getYearMonth(date)
}

/**
 * 获取近 N 个月份列表
 * @param {number} count - 月数
 * @returns {Array} 月份列表 [{label, value}]
 */
export function getRecentMonths(count = 6) {
  const months = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = getYearMonth(date)
    const label = `${date.getFullYear()}年${date.getMonth() + 1}月`
    months.push({ label, value })
  }
  return months
}
