import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Mock 数据 - 首次启动时预置
const MOCK_BILLS = [
  { id: '1', amount: 38.5, type: 'EXPENSE', category: '餐饮', note: '午饭牛肉面', date: '2026-06-01' },
  { id: '2', amount: 15000, type: 'INCOME', category: '工资', note: '6 月工资', date: '2026-06-01' },
  { id: '3', amount: 188, type: 'EXPENSE', category: '餐饮', note: '昨晚火锅', date: '2026-06-01' },
  { id: '4', amount: 35, type: 'EXPENSE', category: '交通', note: '滴滴上班', date: '2026-06-02' },
  { id: '5', amount: 599, type: 'EXPENSE', category: '购物', note: '买衣服', date: '2026-05-28' },
  { id: '6', amount: 2000, type: 'INCOME', category: '其他', note: '兼职收入', date: '2026-05-25' },
  { id: '7', amount: 68, type: 'EXPENSE', category: '娱乐', note: '电影票', date: '2026-05-24' },
  { id: '8', amount: 3200, type: 'EXPENSE', category: '居住', note: '房租', date: '2026-05-20' },
  { id: '9', amount: 156, type: 'EXPENSE', category: '医疗', note: '买药', date: '2026-05-18' },
  { id: '10', amount: 89, type: 'EXPENSE', category: '餐饮', note: '咖啡', date: '2026-05-15' },
  { id: '11', amount: 260, type: 'EXPENSE', category: '购物', note: ' books', date: '2026-05-12' },
  { id: '12', amount: 45, type: 'EXPENSE', category: '交通', note: '地铁充值', date: '2026-05-10' },
  { id: '13', amount: 320, type: 'EXPENSE', category: '餐饮', note: '聚餐', date: '2026-05-08' },
  { id: '14', amount: 5000, type: 'INCOME', category: '其他', note: '奖金', date: '2026-05-05' },
  { id: '15', amount: 199, type: 'EXPENSE', category: '娱乐', note: '游戏', date: '2026-05-02' }
]

export const useBillsStore = defineStore('bills', () => {
  // state
  const bills = ref([])

  // getters
  const currentMonthBills = computed(() => {
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return bills.value.filter(b => b.date.startsWith(yearMonth))
  })

  const currentMonthSummary = computed(() => {
    const monthBills = currentMonthBills.value
    const totalExpense = monthBills
      .filter(b => b.type === 'EXPENSE')
      .reduce((sum, b) => sum + b.amount, 0)
    const totalIncome = monthBills
      .filter(b => b.type === 'INCOME')
      .reduce((sum, b) => sum + b.amount, 0)
    return {
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense
    }
  })

  const categoryBreakdown = computed(() => {
    const monthBills = currentMonthBills.value.filter(b => b.type === 'EXPENSE')
    const total = monthBills.reduce((sum, b) => sum + b.amount, 0)
    const byCategory = {}
    monthBills.forEach(b => {
      byCategory[b.category] = (byCategory[b.category] || 0) + b.amount
    })
    return Object.entries(byCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: total > 0 ? Math.round((amount / total) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
  })

  const dailyTrend = computed(() => {
    const days = 30
    const trend = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const total = bills.value
        .filter(b => b.date === dateStr && b.type === 'EXPENSE')
        .reduce((sum, b) => sum + b.amount, 0)
      trend.push({ date: dateStr.slice(5), total })
    }
    return trend
  })

  const recentBills = computed(() => {
    return [...bills.value].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
  })

  // actions
  function add(bill) {
    const newBill = {
      ...bill,
      id: Date.now().toString()
    }
    bills.value.unshift(newBill)
    persistToStorage()
    return newBill
  }

  function update(id, updates) {
    const index = bills.value.findIndex(b => b.id === id)
    if (index !== -1) {
      bills.value.splice(index, 1, {
        ...bills.value[index],
        ...updates
      })
      persistToStorage()
      return true
    }
    return false
  }

  function remove(id) {
    bills.value = bills.value.filter(b => b.id !== id)
    persistToStorage()
  }

  function deleteBill(id) {
    remove(id)
  }

  function loadFromStorage() {
    try {
      const stored = uni.getStorageSync('ledger_bills')
      if (stored) {
        bills.value = JSON.parse(stored)
      } else {
        // 首次启动，加载 mock 数据
        bills.value = [...MOCK_BILLS]
        persistToStorage()
      }
    } catch (e) {
      console.error('加载账单数据失败', e)
      bills.value = [...MOCK_BILLS]
    }
  }

  function persistToStorage() {
    try {
      uni.setStorageSync('ledger_bills', JSON.stringify(bills.value))
    } catch (e) {
      console.error('保存账单数据失败', e)
    }
  }

  function clearAll() {
    bills.value = []
    persistToStorage()
  }

  return {
    bills,
    currentMonthBills,
    currentMonthSummary,
    categoryBreakdown,
    dailyTrend,
    recentBills,
    add,
    update,
    remove,
    deleteBill,
    loadFromStorage,
    clearAll
  }
})
