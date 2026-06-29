// src/store/ledger.ts - 账单 Store (管理账单数据增删改查)

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LedgerItem, MonthlySummary, CategoryStat, LedgerType } from '../types/ledger'
import { DEFAULT_CATEGORIES } from '../types/ledger'

/**
 * 生成 UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 获取当前月份 (YYYY-MM)
 */
function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const useLedgerStore = defineStore('ledger', () => {
  // ========== State ==========
  const items = ref<LedgerItem[]>([])
  
  // ========== Getters ==========
  
  /**
   * 当前月份的账单
   */
  const currentMonthItems = computed(() => {
    const currentMonth = getCurrentMonth()
    return items.value.filter(item => item.date.startsWith(currentMonth))
  })
  
  /**
   * 当前月度汇总
   */
  const monthlySummary = computed<MonthlySummary>(() => {
    const currentMonth = getCurrentMonth()
    const monthItems = items.value.filter(item => item.date.startsWith(currentMonth))
    
    const income = monthItems
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0)
    
    const expense = monthItems
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)
    
    return {
      month: currentMonth,
      income,
      expense,
      balance: income - expense,
      transactionCount: monthItems.length,
    }
  })
  
  /**
   * 按分类统计 (当前月)
   */
  const categoryStats = computed<CategoryStat[]>(() => {
    const currentMonth = getCurrentMonth()
    const monthItems = items.value.filter(item => item.date.startsWith(currentMonth))
    
    const statsMap = new Map<string, { amount: number; count: number }>()
    
    monthItems.forEach(item => {
      const existing = statsMap.get(item.category) || { amount: 0, count: 0 }
      statsMap.set(item.category, {
        amount: existing.amount + item.amount,
        count: existing.count + 1,
      })
    })
    
    const total = monthItems.reduce((sum, item) => sum + item.amount, 0)
    
    return Array.from(statsMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
      count: data.count,
    })).sort((a, b) => b.amount - a.amount)
  })
  
  /**
   * 近期账单 (按日期倒序)
   */
  const recentItems = computed(() => {
    return [...items.value].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date)
      if (dateCompare !== 0) return dateCompare
      return b.createdAt - a.createdAt
    }).slice(0, 50)
  })
  
  // ========== Actions ==========
  
  /**
   * 添加账单
   */
  const addLedger = (item: Omit<LedgerItem, 'id' | 'createdAt' | 'updatedAt'>): LedgerItem => {
    const now = Date.now()
    const newItem: LedgerItem = {
      ...item,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
    }
    items.value.unshift(newItem)
    return newItem
  }
  
  /**
   * 批量添加账单
   */
  const addLedgers = (newItems: Omit<LedgerItem, 'id' | 'createdAt' | 'updatedAt'>[]): LedgerItem[] => {
    const now = Date.now()
    const addedItems = newItems.map(item => ({
      ...item,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
    }))
    items.value.unshift(...addedItems)
    return addedItems
  }
  
  /**
   * 更新账单
   */
  const updateLedger = (id: string, updates: Partial<LedgerItem>): boolean => {
    const index = items.value.findIndex(item => item.id === id)
    if (index === -1) return false
    
    items.value[index] = {
      ...items.value[index],
      ...updates,
      updatedAt: Date.now(),
    }
    return true
  }
  
  /**
   * 删除账单
   */
  const deleteLedger = (id: string): boolean => {
    const index = items.value.findIndex(item => item.id === id)
    if (index === -1) return false
    
    items.value.splice(index, 1)
    return true
  }
  
  /**
   * 获取指定月份的账单
   */
  const getMonthItems = (month: string): LedgerItem[] => {
    return items.value.filter(item => item.date.startsWith(month))
  }
  
  /**
   * 获取指定分类的账单
   */
  const getCategoryItems = (category: string): LedgerItem[] => {
    return items.value.filter(item => item.category === category)
  }
  
  /**
   * 搜索账单 (按备注/标签)
   */
  const searchLedgers = (keyword: string): LedgerItem[] => {
    if (!keyword.trim()) return []
    const lowerKeyword = keyword.toLowerCase()
    return items.value.filter(item => 
      item.remark.toLowerCase().includes(lowerKeyword) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    )
  }
  
  /**
   * 清空所有数据
   */
  const clearAll = () => {
    items.value = []
  }
  
  /**
   * 导出数据 (CSV 格式)
   */
  const exportToCSV = (): string => {
    const headers = ['日期', '类型', '分类', '金额', '备注', '标签']
    const rows = items.value.map(item => [
      item.date,
      item.type === 'income' ? '收入' : '支出',
      item.category,
      item.amount.toFixed(2),
      item.remark,
      item.tags.join(';'),
    ])
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
  }
  
  /**
   * 导入数据 (CSV 格式)
   */
  const importFromCSV = (csvText: string): { success: boolean; count: number; error?: string } => {
    try {
      const lines = csvText.trim().split('\n')
      if (lines.length < 2) {
        return { success: false, count: 0, error: 'CSV 格式不正确' }
      }
      
      const importedItems: Omit<LedgerItem, 'id' | 'createdAt' | 'updatedAt'>[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        const matches = line.match(/"([^"]*(?:""[^"]*)*)"/g)
        if (!matches || matches.length < 6) continue
        
        const cells = matches.map(m => m.slice(1, -1).replace(/""/g, '"'))
        const type: LedgerType = cells[1] === '收入' ? 'income' : 'expense'
        
        importedItems.push({
          type,
          amount: parseFloat(cells[3]) || 0,
          category: cells[2],
          date: cells[0],
          tags: cells[5] ? cells[5].split(';').filter(Boolean) : [],
          remark: cells[4],
          isAiGenerated: false,
        })
      }
      
      if (importedItems.length === 0) {
        return { success: false, count: 0, error: '未解析到有效数据' }
      }
      
      addLedgers(importedItems)
      return { success: true, count: importedItems.length }
    } catch (error: any) {
      return { success: false, count: 0, error: error.message }
    }
  }
  
  return {
    items,
    currentMonthItems,
    monthlySummary,
    categoryStats,
    recentItems,
    addLedger,
    addLedgers,
    updateLedger,
    deleteLedger,
    getMonthItems,
    getCategoryItems,
    searchLedgers,
    clearAll,
    exportToCSV,
    importFromCSV,
  }
}, {
  persist: {
    key: 'ledger-data',
    storage: {
      getItem: (key: string) => uni.getStorageSync(key),
      setItem: (key: string, value: string) => uni.setStorageSync(key, value),
    },
    pick: ['items'],
  },
})
