// src/i18n/index.js - 多语言支持

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
    },
    // 设置
    settings: {
      title: '设置',
      aiSettings: 'AI 设置',
      language: '语言',
      theme: '主题',
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
      transport: '交通',
      shopping: '购物',
      entertainment: '娱乐',
      medical: '医疗',
      education: '教育',
      housing: '居住',
      other: '其他',
      // 收入
      salary: '工资',
      bonus: '奖金',
      investment: '投资',
      parttime: '兼职',
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
    },
    // Settings
    settings: {
      title: 'Settings',
      aiSettings: 'AI Settings',
      language: 'Language',
      theme: 'Theme',
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
      transport: 'Transport',
      shopping: 'Shopping',
      entertainment: 'Entertainment',
      medical: 'Medical',
      education: 'Education',
      housing: 'Housing',
      other: 'Other',
      // Income
      salary: 'Salary',
      bonus: 'Bonus',
      investment: 'Investment',
      parttime: 'Part-time',
    },
  },
}

// 当前语言
let currentLang = 'zh'

// 设置语言
export function setLanguage(lang) {
  if (messages[lang]) {
    currentLang = lang
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

// 获取翻译
export function t(key, params = {}) {
  const keys = key.split('.')
  let value = messages[currentLang]
  
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
  t,
  initI18n,
}
