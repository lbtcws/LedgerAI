// src/i18n/index.js - 多语言支持
import { reactive, readonly } from 'vue'

const messages = {
  zh: {
    // 通用
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      confirm: '确认',
      edit: '编辑',
      close: '关闭',
      optional: '可选',
    },
    // 账单
    bills: {
      expense: '支出',
      income: '收入',
      balance: '结余',
      all: '全部',
      noBills: '本月还没有账单',
      editBill: '编辑账单',
      amount: '金额',
      date: '日期',
      note: '备注',
      type: '类型',
      category: '分类',
      confirmDelete: '确认删除',
      deleteConfirmMsg: '删除后无法恢复',
      delete: '删除',
      deleted: '已删除',
      saved: '✓ 已保存',
    },
    // 记账
    record: {
      expense: '支出',
      income: '收入',
      notePlaceholder: '备注（可选）',
      submitBtn: '确认记账',
      success: '记账成功 ✓',
    },
    // 统计
    stats: {
      title: '统计',
      expenseDistribution: '消费分布',
      spendingTrend: '消费节奏',
      noExpenseData: '暂无支出数据',
      aiAnalysis: 'AI 账单分析',
      aiLoading: '分析中...',
      aiComplete: '分析完成 ✓',
      aiNeedConfig: '⚠️ 需要配置',
      aiNeedConfigMsg: 'AI 功能需要先配置 API Key。\n\n请点击页面右上角 ⚙️ 图标，选择服务商并填写 API Key 即可使用分析功能。\n\n支持：通义千问、DeepSeek 等主流 AI 服务。',
      aiInvalidKey: '⚠️ Key 无效',
      aiInvalidKeyMsg: '当前 API Key 可能已过期或不正确。\n\n请前往设置页面检查并更新 API Key。',
      aiTimeout: '⚠️ 网络超时',
      aiTimeoutMsg: 'AI 服务响应超时，可能是网络问题或服务繁忙。\n\n建议：\n1. 检查网络连接\n2. 稍后重试\n3. 确认 API Key 有效',
      aiError: '⚠️ 分析失败',
      aiDisclaimer: '⚡ 由 AI 生成，仅供参考',
      analysisSteps: {
        readData: '读取本月账单数据',
        analyzeAnomalies: '分析消费异常点',
        identifyPatterns: '识别消费习惯模式',
        generateAdvice: '生成个性化建议',
        writeSummary: '撰写财务总结',
      },
      aiSections: {
        anomaly: '异常',
        habit: '习惯',
        advice: '建议',
        summary: '总结',
      },
    },
    // 设置
    settings: {
      title: '设置',
      aiSettings: 'AI 设置',
      language: '语言',
      theme: '主题',
      themeDark: '深色',
      themeLight: '浅色',
      themeAuto: '跟随系统',
      aiConfigTitle: 'AI 服务配置',
      aiConfigSubtitle: '配置你自己的 AI 服务商',
      enableAi: '启用 AI 功能',
      enableAiDesc: '关闭后将不使用 AI 分析',
      selectProvider: '选择服务商',
      apiConfig: 'API 配置',
      apiBaseUrl: 'API Base URL',
      apiKey: 'API Key',
      modelName: '模型名称',
      modelPlaceholder: '例如：qwen-plus',
      currentProvider: '当前服务商：',
      currentModel: '模型：',
      saveConfig: '保存配置',
      testConnection: '测试连接',
      testing: '测试中...',
      configSaved: '配置已保存',
      aiDisabled: 'AI 功能已关闭',
      saveFailed: '保存失败：',
      connectionSuccess: '连接成功！AI 回复：',
      connectionNoContent: '连接成功但无返回内容',
      connectionFailed: '连接失败：',
      pleaseSave: '请点击"保存配置"按钮',
      howToGetKey: '💡 如何获取 API Key',
      languageSwitched: '语言已切换',
      languageSwitchedEn: 'Language switched',
      chinese: '简体中文',
      english: 'English',
    },
    // 日期
    date: {
      yearMonth: '{year}年{month}月',
      today: '今天',
      yesterday: '昨天',
      daysAgo: '{days}天前',
      thisWeek: '本周',
      lastWeek: '上周',
      thisMonth: '本月',
      lastMonth: '上月',
      wanUnit: '万',
    },
    // 分类
    categories: {
      // 支出
      dining: '餐饮',
      coffeeTea: '咖啡茶饮',
      snacks: '零食',
      groceries: '食材',
      rent: '房租',
      mortgage: '房贷',
      property: '物业',
      utilities: '水电燃气',
      maintenance: '维修',
      transport: '交通',
      rideHailing: '打车',
      publicTransport: '公共交通',
      fuel: '加油',
      parking: '停车',
      carMaintenance: '车辆保养',
      shopping: '购物',
      clothing: '服饰',
      electronics: '数码',
      home: '家居',
      beauty: '美妆',
      books: '书籍',
      entertainment: '娱乐',
      movies: '电影',
      games: '游戏',
      travel: '旅行',
      fitness: '健身',
      learning: '学习',
      training: '培训',
      subscriptions: '会员订阅',
      medical: '医疗',
      medicine: '药品',
      healthProducts: '保健品',
      communication: '通讯',
      phoneBill: '话费',
      internet: '网费',
      loan: '贷款',
      insurance: '保险',
      fees: '手续费',
      redEnvelope: '红包',
      gifts: '礼物',
      diningOut: '聚餐',
      other: '其他',
      // 收入
      salary: '工资',
      bonus: '奖金',
      parttime: '兼职',
      investment: '理财',
      rentalIncome: '租金',
      reimbursement: '报销',
      cashGifts: '礼金',
    },
    // 分类分组
    categoryGroups: {
      foodDining: '餐饮食品',
      housing: '住房相关',
      transportation: '交通出行',
      shopping: '购物消费',
      entertainment: '娱乐休闲',
      education: '学习教育',
      healthcare: '医疗健康',
      communication: '通讯网络',
      financial: '金融服务',
      social: '人情往来',
      other: '其他',
      workIncome: '工作收入',
      sideHustle: '副业收入',
      investmentIncome: '投资收益',
      otherIncome: '其他收入',
    },
    // Tabbar
    tabbar: {
      record: '记账',
      bills: '账单',
      stats: '统计',
      settings: '设置',
    },
  },
  en: {
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      confirm: 'Confirm',
      edit: 'Edit',
      close: 'Close',
      optional: 'Optional',
    },
    // Bills
    bills: {
      expense: 'Expense',
      income: 'Income',
      balance: 'Balance',
      all: 'All',
      noBills: 'No bills this month',
      editBill: 'Edit Bill',
      amount: 'Amount',
      date: 'Date',
      note: 'Note',
      type: 'Type',
      category: 'Category',
      confirmDelete: 'Confirm Delete',
      deleteConfirmMsg: 'Cannot be undone',
      delete: 'Delete',
      deleted: 'Deleted',
      saved: '✓ Saved',
    },
    // Record
    record: {
      expense: 'Expense',
      income: 'Income',
      notePlaceholder: 'Note (optional)',
      submitBtn: 'Confirm',
      success: 'Saved ✓',
    },
    // Stats
    stats: {
      title: 'Stats',
      expenseDistribution: 'Expense Distribution',
      spendingTrend: 'Spending Trend',
      noExpenseData: 'No expense data',
      aiAnalysis: 'AI Analysis',
      aiLoading: 'Analyzing...',
      aiComplete: 'Analysis complete ✓',
      aiNeedConfig: '⚠️ Configuration Required',
      aiNeedConfigMsg: 'AI feature requires API Key configuration.\n\nPlease click the ⚙️ icon in the top right corner, select a provider and enter your API Key to use the analysis feature.\n\nSupported: Tongyi Qianwen, DeepSeek, and other mainstream AI services.',
      aiInvalidKey: '⚠️ Invalid Key',
      aiInvalidKeyMsg: 'The current API Key may be expired or incorrect.\n\nPlease go to Settings to check and update your API Key.',
      aiTimeout: '⚠️ Network Timeout',
      aiTimeoutMsg: 'AI service response timeout, possibly due to network issues or service busy.\n\nSuggestions:\n1. Check network connection\n2. Try again later\n3. Confirm API Key is valid',
      aiError: '⚠️ Analysis Failed',
      aiDisclaimer: '⚡ Generated by AI, for reference only',
      analysisSteps: {
        readData: 'Reading monthly bill data',
        analyzeAnomalies: 'Analyzing spending anomalies',
        identifyPatterns: 'Identifying spending patterns',
        generateAdvice: 'Generating personalized advice',
        writeSummary: 'Writing financial summary',
      },
      aiSections: {
        anomaly: 'Anomalies',
        habit: 'Habits',
        advice: 'Advice',
        summary: 'Summary',
      },
    },
    // Settings
    settings: {
      title: 'Settings',
      aiSettings: 'AI Settings',
      language: 'Language',
      theme: 'Theme',
      themeDark: 'Dark',
      themeLight: 'Light',
      themeAuto: 'Auto',
      aiConfigTitle: 'AI Service Configuration',
      aiConfigSubtitle: 'Configure your own AI provider',
      enableAi: 'Enable AI Features',
      enableAiDesc: 'Disable to stop using AI analysis',
      selectProvider: 'Select Provider',
      apiConfig: 'API Configuration',
      apiBaseUrl: 'API Base URL',
      apiKey: 'API Key',
      modelName: 'Model Name',
      modelPlaceholder: 'e.g., qwen-plus',
      currentProvider: 'Current Provider:',
      currentModel: 'Model:',
      saveConfig: 'Save Configuration',
      testConnection: 'Test Connection',
      testing: 'Testing...',
      configSaved: 'Configuration saved',
      aiDisabled: 'AI feature disabled',
      saveFailed: 'Save failed:',
      connectionSuccess: 'Connection successful! AI reply:',
      connectionNoContent: 'Connection successful but no content returned',
      connectionFailed: 'Connection failed:',
      pleaseSave: 'Please click "Save Configuration"',
      howToGetKey: '💡 How to Get API Key',
      languageSwitched: 'Language switched',
      languageSwitchedEn: 'Language switched',
      chinese: '简体中文',
      english: 'English',
    },
    // Date
    date: {
      yearMonth: '{month}/{year}',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '{days} days ago',
      thisWeek: 'This Week',
      lastWeek: 'Last Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      wanUnit: 'K',
    },
    // Categories
    categories: {
      // Expense
      dining: 'Dining',
      coffeeTea: 'Coffee & Tea',
      snacks: 'Snacks',
      groceries: 'Groceries',
      rent: 'Rent',
      mortgage: 'Mortgage',
      property: 'Property Fee',
      utilities: 'Utilities',
      maintenance: 'Maintenance',
      transport: 'Transport',
      rideHailing: 'Ride-hailing',
      publicTransport: 'Public Transport',
      fuel: 'Fuel',
      parking: 'Parking',
      carMaintenance: 'Car Maintenance',
      shopping: 'Shopping',
      clothing: 'Clothing',
      electronics: 'Electronics',
      home: 'Home',
      beauty: 'Beauty',
      books: 'Books',
      entertainment: 'Entertainment',
      movies: 'Movies',
      games: 'Games',
      travel: 'Travel',
      fitness: 'Fitness',
      learning: 'Learning',
      training: 'Training',
      subscriptions: 'Subscriptions',
      medical: 'Medical',
      medicine: 'Medicine',
      healthProducts: 'Health Products',
      communication: 'Communication',
      phoneBill: 'Phone Bill',
      internet: 'Internet',
      loan: 'Loan',
      insurance: 'Insurance',
      fees: 'Fees',
      redEnvelope: 'Red Envelope',
      gifts: 'Gifts',
      diningOut: 'Dining Out',
      other: 'Other',
      // Income
      salary: 'Salary',
      bonus: 'Bonus',
      parttime: 'Part-time',
      investment: 'Investment',
      rentalIncome: 'Rental Income',
      reimbursement: 'Reimbursement',
      cashGifts: 'Cash Gifts',
    },
    // Category Groups
    categoryGroups: {
      foodDining: 'Food & Dining',
      housing: 'Housing',
      transportation: 'Transportation',
      shopping: 'Shopping',
      entertainment: 'Entertainment',
      education: 'Education',
      healthcare: 'Healthcare',
      communication: 'Communication',
      financial: 'Financial',
      social: 'Social',
      other: 'Other',
      workIncome: 'Work Income',
      sideHustle: 'Side Hustle',
      investmentIncome: 'Investment',
      otherIncome: 'Other Income',
    },
    // Tabbar
    tabbar: {
      record: 'Record',
      bills: 'Bills',
      stats: 'Stats',
      settings: 'Settings',
    },
  },
}

// 响应式语言状态
const state = reactive({
  lang: 'zh'
})

// 设置语言
export function setLanguage(lang) {
  if (messages[lang]) {
    state.lang = lang
    uni.setStorageSync('ledger-language', lang)
  }
}

// 获取当前语言
export function getLanguage() {
  const stored = uni.getStorageSync('ledger-language')
  if (stored && messages[stored]) {
    return stored
  }
  // 尝试从系统获取
  try {
    const systemLang = uni.getSystemInfoSync().language || 'zh'
    return systemLang.startsWith('en') ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

// 获取响应式语言状态（用于组件中订阅变化）
export function useLanguage() {
  return readonly(state)
}

// 获取翻译
export function t(key, params = {}) {
  const keys = key.split('.')
  let value = messages[state.lang]
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return key
    }
  }
  
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match
    })
  }
  
  return value || key
}

// 初始化语言
export function initI18n() {
  const lang = getLanguage()
  setLanguage(lang)
  return lang
}

export default {
  messages,
  setLanguage,
  getLanguage,
  useLanguage,
  t,
  initI18n,
}
