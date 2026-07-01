<template>
  <view class="stats-page">
    <!-- 顶部操作栏：月份切换 + AI 账单分析 -->
    <view class="top-bar">
      <!-- 月份切换器 -->
      <view class="month-selector">
        <text class="nav-btn" @click="prevMonth">‹</text>
        <text class="month-label">{{ currentMonthLabel }}</text>
        <text class="nav-btn" @click="nextMonth">›</text>
      </view>
      <!-- AI 账单分析按钮 -->
      <view class="deep-analysis-btn" @click="openAnalysisModal">
        <text class="btn-text">{{ t('stats.aiAnalysis') }}</text>
        <text class="btn-arrow">→</text>
      </view>
    </view>

    <!-- 消费分布环形图 -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">{{ t('stats.expenseDistribution') }}</text>
        <text class="section-subtitle">{{ currentMonthLabel }}</text>
      </view>
      <view class="chart-container">
        <!-- 简易环形图 - 用 CSS 实现 -->
        <view class="ring-chart" v-if="categoryBreakdown.length > 0">
          <view
            class="ring-segment"
            v-for="(item, index) in categoryBreakdown"
            :key="item.category"
            :style="getSegmentStyle(item, index)"
          >
          </view>
        </view>
        <view class="empty-chart" v-else>
          <text class="empty-text">{{ t('stats.noExpenseData') }}</text>
        </view>
      </view>
      <!-- 图例 -->
      <view class="legend-list">
        <view
          class="legend-item"
          v-for="(item, index) in categoryBreakdownWithI18n"
          :key="item.category"
        >
          <view class="legend-dot" :style="{ backgroundColor: getSegmentColor(index) }"></view>
          <text class="legend-label">{{ item.categoryName }}</text>
          <text class="legend-amount">¥{{ formatAmount(item.amount) }}</text>
          <text class="legend-percent">{{ item.percent }}%</text>
        </view>
      </view>
    </view>

    <!-- 月度收支趋势 -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">{{ t('stats.spendingTrend') }}</text>
      </view>
      
      <!-- 原生分组柱状图 -->
      <view class="trend-chart-native">
        <!-- Y 轴标签 -->
        <view class="y-axis-labels">
          <text class="y-label">{{ formatYAxis(maxAmount, isEnglish) }}</text>
          <text class="y-label">{{ formatYAxis(maxAmount * 0.75, isEnglish) }}</text>
          <text class="y-label">{{ formatYAxis(maxAmount * 0.5, isEnglish) }}</text>
          <text class="y-label">{{ formatYAxis(maxAmount * 0.25, isEnglish) }}</text>
          <text class="y-label">0</text>
        </view>
        
        <!-- 图表区域 -->
        <view class="chart-area">
          <!-- 网格线 -->
          <view class="grid-lines">
            <view class="grid-line" v-for="i in 5" :key="i"></view>
          </view>
          
          <!-- 柱状图 -->
          <view class="bars-container">
            <view
              class="bar-group"
              v-for="(item, index) in dailyTrendWithIncome"
              :key="item.date"
            >
              <!-- 柱子容器 -->
              <view class="bar-wrapper">
                <!-- 支出柱 -->
                <view
                  class="bar expense-bar"
                  :style="{
                    height: getBarHeight(item.expense, maxAmount) + 'rpx',
                    opacity: item.expense > 0 ? 1 : 0.2
                  }"
                ></view>
                <!-- 收入柱 -->
                <view
                  class="bar income-bar"
                  :style="{
                    height: getBarHeight(item.income, maxAmount) + 'rpx',
                    opacity: item.income > 0 ? 1 : 0.2
                  }"
                ></view>
              </view>
              <!-- 日期标签 -->
              <text class="date-label">{{ item.day }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 图例 -->
      <view class="legend-inline">
        <view class="legend-item">
          <view class="legend-dot expense-dot"></view>
          <text class="legend-text">{{ t('bills.expense') }}</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot income-dot"></view>
          <text class="legend-text">{{ t('bills.income') }}</text>
        </view>
      </view>
      
      <!-- Tooltip -->
      <view class="tooltip" v-if="tooltip.visible" :style="{ left: tooltip.left + 'rpx', top: tooltip.top + 'rpx' }">
        <text class="tooltip-date">{{ tooltip.date }}{{ isEnglish ? t('date.daySuffix') : t('date.daySuffixZh') }}</text>
        <view class="tooltip-row" v-if="tooltip.expense !== null">
          <view class="tooltip-dot expense-dot"></view>
          <text class="tooltip-label">{{ t('bills.expense') }}:</text>
          <text class="tooltip-value">¥{{ formatAmount(tooltip.expense) }}</text>
        </view>
        <view class="tooltip-row" v-if="tooltip.income !== null">
          <view class="tooltip-dot income-dot"></view>
          <text class="tooltip-label">{{ t('bills.income') }}:</text>
          <text class="tooltip-value">¥{{ formatAmount(tooltip.income) }}</text>
        </view>
      </view>
    </view>

    <!-- 深挖分析弹框 -->
    <view class="analysis-modal" v-if="showDeepAnalysisModal" @touchmove.stop.prevent>
      <view class="modal-overlay" @click="closeAnalysisModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">{{ t('stats.aiAnalysis') }}</text>
          <text class="modal-close" @click="closeAnalysisModal">✕</text>
        </view>
        
        <!-- 分析过程展示 -->
        <view class="analysis-process" v-if="aiLoading">
          <view 
            class="process-step" 
            v-for="(step, index) in analysisSteps" 
            :key="index"
            :class="{ completed: step.completed, current: step.current }"
          >
            <text class="step-icon">{{ step.completed ? '✓' : step.current ? '···' : '○' }}</text>
            <text class="step-text">{{ step.text }}</text>
          </view>
        </view>

        <!-- AI 报告结果 -->
        <view class="ai-report" v-if="aiReport.length > 0">
          <view
            class="report-section"
            v-for="(section, index) in aiReport"
            :key="section.tag"
            :style="{ animationDelay: index * 0.3 + 's' }"
          >
            <view class="report-tag">
              <text class="tag-icon">{{ getSectionIcon(section.tag) }}</text>
              <text class="tag-label">{{ section.tag }}</text>
            </view>
            <text class="report-content">{{ section.content }}</text>
          </view>
        </view>

        <view class="ai-disclaimer" v-if="aiReport.length > 0">
          <text>{{ t('stats.aiDisclaimer') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBillsStore } from '@/store/bills'
import { formatAmount, getYearMonth, navigateMonth } from '@/utils/format'
import { getDeepAnalysisStream, parseAiReport } from '@/utils/ai-ledger'
import { getAiConfig } from '@/utils/ai-config'
import { t, useLanguage } from '@/i18n'

const billsStore = useBillsStore()

// 状态
const aiLoading = ref(false)
const aiReport = ref([])
const analysisSteps = ref([])
const currentText = ref('')
const showDeepAnalysisModal = ref(false)

// Tooltip 状态
const tooltip = ref({
  visible: false,
  left: 0,
  top: 0,
  date: '',
  expense: null,
  income: null
})

// 判断当前语言（使用 i18n 响应式状态）
const langState = useLanguage()
const isEnglish = computed(() => langState.lang === 'en')

// 监听弹框状态，控制背景页面滚动
watch(showDeepAnalysisModal, (newVal) => {
  if (newVal) {
    // 弹框打开，禁止背景滚动
    document.body.style.overflow = 'hidden'
  } else {
    // 弹框关闭，恢复滚动
    document.body.style.overflow = ''
  }
})

// 关闭弹框
function closeAnalysisModal() {
  if (!aiLoading.value) {
    showDeepAnalysisModal.value = false
  }
}

// 月份切换 - 使用与账单页面一致的格式
const currentMonthLabel = computed(() => {
  const yearMonth = billsStore.selectedMonth || getYearMonth()
  const [year, month] = yearMonth.split('-')
  return t('date.yearMonth', { year, month: parseInt(month) })
})

function prevMonth() {
  const current = billsStore.selectedMonth || getYearMonth()
  billsStore.setSelectedMonth(navigateMonth(current, -1))
}

function nextMonth() {
  const current = billsStore.selectedMonth || getYearMonth()
  billsStore.setSelectedMonth(navigateMonth(current, 1))
}

const categoryBreakdown = computed(() => billsStore.categoryBreakdown)
const dailyTrend = computed(() => billsStore.dailyTrend)

// 包含收入和支出的每日趋势
const dailyTrendWithIncome = computed(() => billsStore.dailyTrendWithIncome)

// 分类翻译映射（使用中文作为 key，与账单存储一致）
const categoryI18nKeys = {
  // 支出分类
  '餐饮': 'categories.dining',
  '咖啡茶饮': 'categories.coffeeTea',
  '零食': 'categories.snacks',
  '食材': 'categories.groceries',
  '房租': 'categories.rent',
  '房贷': 'categories.mortgage',
  '物业': 'categories.property',
  '水电燃气': 'categories.utilities',
  '维修': 'categories.maintenance',
  '交通': 'categories.transport',
  '打车': 'categories.rideHailing',
  '公共交通': 'categories.publicTransport',
  '加油': 'categories.fuel',
  '停车': 'categories.parking',
  '车辆保养': 'categories.carMaintenance',
  '购物': 'categories.shopping',
  '服饰': 'categories.clothing',
  '数码': 'categories.electronics',
  '家居': 'categories.home',
  '美妆': 'categories.beauty',
  '书籍': 'categories.books',
  '娱乐': 'categories.entertainment',
  '电影': 'categories.movies',
  '游戏': 'categories.games',
  '旅行': 'categories.travel',
  '健身': 'categories.fitness',
  '学习': 'categories.learning',
  '培训': 'categories.training',
  '会员订阅': 'categories.subscriptions',
  '医疗': 'categories.medical',
  '药品': 'categories.medicine',
  '保健品': 'categories.healthProducts',
  '通讯': 'categories.communication',
  '话费': 'categories.phoneBill',
  '网费': 'categories.internet',
  '贷款': 'categories.loan',
  '保险': 'categories.insurance',
  '手续费': 'categories.fees',
  '红包': 'categories.redEnvelope',
  '礼物': 'categories.gifts',
  '聚餐': 'categories.diningOut',
  // 收入分类
  '工资': 'categories.salary',
  '奖金': 'categories.bonus',
  '兼职': 'categories.parttime',
  '理财': 'categories.investment',
  '租金': 'categories.rentalIncome',
  '报销': 'categories.reimbursement',
  '礼金': 'categories.cashGifts',
  // 默认
  '其他': 'categories.other'
}

// 带翻译的分类统计
const categoryBreakdownWithI18n = computed(() => {
  return categoryBreakdown.value.map(item => ({
    ...item,
    categoryName: t(categoryI18nKeys[item.category] || 'categories.other')
  }))
})

// 计算 Y 轴最大值
const maxAmount = computed(() => {
  const trend = dailyTrendWithIncome.value
  if (trend.length === 0) return 1000
  
  const max = Math.max(
    ...trend.map(item => Math.max(item.expense, item.income)),
    1
  )
  // 向上取整到百位
  return Math.ceil(max * 1.1 / 100) * 100
})

// 格式化 Y 轴标签
const formatYAxis = (value, isEn) => {
  const val = Math.round(value)
  if (val >= 10000) {
    return isEn ? `${(val / 1000).toFixed(0)}k` : `${(val / 10000).toFixed(0)}万`
  }
  if (val >= 1000) {
    return isEn ? `${(val / 1000).toFixed(0)}k` : `${(val / 1000).toFixed(0)}千`
  }
  return val.toString()
}

// 计算柱子高度（rpx）- 图表高度约 240rpx
const getBarHeight = (amount, max) => {
  if (max === 0 || amount === 0) return 4 // 最小高度
  const chartHeight = 240 // 图表区域高度 rpx
  const height = (amount / max) * chartHeight
  return Math.max(height, 4) // 至少 4rpx 可见
}

// 显示 Tooltip
const showTooltip = (item, type) => {
  // 获取点击位置信息（简化版本，显示在柱子附近）
  const dayIndex = dailyTrendWithIncome.value.findIndex(i => i.date === item.date)
  const barWidth = 24 // 每组柱子宽度约 24rpx
  const gap = 8 // 间距 8rpx
  const totalBars = dailyTrendWithIncome.value.length
  
  // 计算水平位置（简化，实际可根据屏幕宽度调整）
  const left = 80 + dayIndex * (barWidth + gap)
  const top = 100
  
  tooltip.value = {
    visible: true,
    left,
    top,
    date: item.day,
    expense: item.expense,
    income: item.income
  }
  
  // 3 秒后自动隐藏
  setTimeout(() => {
    tooltip.value.visible = false
  }, 3000)
}

// 点击图表区域隐藏 tooltip
const hideTooltip = () => {
  tooltip.value.visible = false
}

// 方法
function getSegmentStyle(item, index) {
  const totalPercent = categoryBreakdown.value
    .slice(0, index + 1)
    .reduce((sum, i) => sum + i.percent, 0)
  const startPercent = totalPercent - item.percent
  return {
    background: `conic-gradient(${getSegmentColor(index)} 0% ${item.percent}%, transparent ${item.percent}% 100%)`,
    transform: `rotate(${startPercent * 3.6}deg)`
  }
}

function getSegmentColor(index) {
  const colors = ['var(--accent)', 'var(--success)', '#5C7A5A', '#445C44', '#3D3D3F', '#5C5C5C', '#7A7A7A', '#9A9A9A']
  return colors[index % colors.length]
}

function getSectionIcon(tag) {
  const icons = { '异常': '⚠️', '习惯': '📊', '建议': '💡', '总结': '📝' }
  return icons[tag] || '•'
}

// 打开弹框并开始分析
function openAnalysisModal() {
  showDeepAnalysisModal.value = true
  handleDeepAnalysis()
}

async function handleDeepAnalysis() {
  if (aiLoading.value) return
  
  // 第一步：检查 AI 配置
  const config = getAiConfig()
  if (!config.enabled || !config.baseUrl || !config.apiKey) {
    showDeepAnalysisModal.value = false
    uni.showModal({
      title: t('stats.aiNotConfiguredTitle'),
      content: t('stats.aiNeedConfigMsg'),
      confirmText: t('stats.aiConfirmGoSettings'),
      cancelText: t('stats.aiCancel'),
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/settings/ai-settings'
          })
        }
      }
    })
    return
  }
  
  aiLoading.value = true
  aiReport.value = []
  currentText.value = ''
  analysisSteps.value = [
    { text: t('stats.analysisSteps.readData'), completed: false, current: true },
    { text: t('stats.analysisSteps.analyzeAnomalies'), completed: false, current: false },
    { text: t('stats.analysisSteps.identifyPatterns'), completed: false, current: false },
    { text: t('stats.analysisSteps.generateAdvice'), completed: false, current: false },
    { text: t('stats.analysisSteps.writeSummary'), completed: false, current: false }
  ]

  try {
    const monthBills = billsStore.currentMonthBills
    if (monthBills.length === 0) {
      aiReport.value = [{ tag: '总结', content: '本月还没有账单数据，先记几笔吧~' }]
      aiLoading.value = false
      uni.showToast({
        title: '暂无账单数据',
        icon: 'none'
      })
      return
    }
    let stepIndex = 0
    
    await new Promise(resolve => setTimeout(resolve, 800))
    analysisSteps.value[0].completed = true
    analysisSteps.value[0].current = false
    analysisSteps.value[1].current = true
    
    await new Promise(resolve => setTimeout(resolve, 600))
    analysisSteps.value[1].completed = true
    analysisSteps.value[1].current = false
    analysisSteps.value[2].current = true
    
    await new Promise(resolve => setTimeout(resolve, 600))
    analysisSteps.value[2].completed = true
    analysisSteps.value[2].current = false
    analysisSteps.value[3].current = true
    
    await new Promise(resolve => setTimeout(resolve, 600))
    analysisSteps.value[3].completed = true
    analysisSteps.value[3].current = false
    analysisSteps.value[4].current = true

    // 流式获取 AI 报告
    const reportText = await getDeepAnalysisStream(monthBills, (chunk) => {
      currentText.value += chunk
      // 实时解析并更新报告
      const parsed = parseAiReport(currentText.value)
      if (parsed.length > 0) {
        aiReport.value = parsed.filter(s => s.content.trim().length > 0)
      }
    })

    analysisSteps.value[4].completed = true
    analysisSteps.value[4].current = false
    
    // 确保最终结果完整
    aiReport.value = parseAiReport(reportText)
    
    // 成功提示
    uni.showToast({
      title: t('stats.aiComplete'),
      icon: 'success'
    })
  } catch (error) {
    console.error('AI 分析错误:', error)
    let errorMessage = error.message || '未知错误'
    
    // 根据错误类型给出更友好的提示
    if (errorMessage.includes('未启用') || errorMessage.includes('配置')) {
      aiReport.value = [{ 
        tag: t('stats.aiNeedConfig'), 
        content: t('stats.aiNeedConfigMsg')
      }]
      // 显示确认对话框，可跳转到设置页面
      uni.showModal({
        title: t('stats.aiNotConfiguredTitle'),
        content: t('stats.aiNotConfiguredMsg'),
        confirmText: t('stats.aiConfirmGoSettings'),
        cancelText: t('stats.aiCancel'),
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/settings/ai-settings'
            })
          }
        }
      })
    } else if (errorMessage.includes('API Key 无效') || errorMessage.includes('401')) {
      aiReport.value = [{ 
        tag: t('stats.aiInvalidKey'), 
        content: t('stats.aiInvalidKeyMsg')
      }]
      // 显示确认对话框，可跳转到设置页面
      uni.showModal({
        title: t('stats.aiInvalidKeyTitle'),
        content: t('stats.aiInvalidKeyMsgDialog'),
        confirmText: t('stats.aiConfirmGoSettings'),
        cancelText: t('stats.aiCancel'),
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/settings/ai-settings'
            })
          }
        }
      })
    } else if (errorMessage.includes('超时')) {
      aiReport.value = [{ 
        tag: t('stats.aiTimeout'), 
        content: t('stats.aiTimeoutMsg')
      }]
      uni.showToast({
        title: t('stats.aiRequestTimeout'),
        icon: 'none'
      })
    } else {
      aiReport.value = [{ 
        tag: t('stats.aiError'), 
        content: t('stats.aiAnalysisFailedDetail') + errorMessage 
      }]
      uni.showToast({
        title: t('stats.aiAnalysisFailed'),
        icon: 'none'
      })
    }
  } finally {
    aiLoading.value = false
  }
}

onMounted(() => {
  billsStore.loadFromStorage()
})
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 24rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  position: relative;
}

/* 弹框打开时禁止背景滚动 */
.stats-page.modal-open {
  overflow: hidden;
  height: 100vh;
}

/* 顶部操作栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 28rpx;
  margin-bottom: 24rpx;
}

/* 月份切换器 */
.month-selector {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.nav-btn {
  font-size: 36rpx;
  color: var(--text-secondary);
  padding: 8rpx 16rpx;
  transition: color 0.2s ease;
}

.nav-btn:active {
  color: var(--text-primary);
}

.month-label {
  font-size: 32rpx;
  color: var(--text-primary);
  font-family: 'DM Serif Display', serif;
  font-weight: 600;
  min-width: 120rpx;
  text-align: center;
}

.chart-section {
  background-color: var(--bg-surface);
  border: 1rpx solid var(--divider);
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

/* 原生图表容器 */
.trend-chart-native {
  position: relative;
  display: flex;
  height: 320rpx;
  margin-bottom: 16rpx;
}

/* Y 轴标签 */
.y-axis-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 70rpx;
  padding-right: 12rpx;
}

.y-label {
  font-size: 18rpx;
  color: var(--text-secondary);
  text-align: right;
  line-height: 1;
}

/* 图表区域 */
.chart-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 网格线 */
.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-line {
  height: 1rpx;
  background-color: var(--divider);
  opacity: 0.5;
}

/* 柱子容器 */
.bars-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 40rpx;
  display: flex;
  align-items: flex-end;
  padding: 0 4rpx;
}

/* 每组柱子 */
.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  gap: 6rpx;
}

/* 柱子容器（内部）*/
.bar-wrapper {
  display: flex;
  gap: 4rpx;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
}

/* 柱子 */
.bar {
  width: 20rpx;
  border-radius: 2rpx 2rpx 0 0;
  min-height: 4rpx;
}

.expense-bar {
  background-color: #f44336;
}

.income-bar {
  background-color: #4caf50;
}

/* 日期标签 */
.date-label {
  font-size: 20rpx;
  color: var(--text-secondary);
  transform: rotate(0deg);
  white-space: nowrap;
}

/* 图例 */
.legend-inline {
  display: flex;
  justify-content: center;
  gap: 48rpx;
  margin-top: 16rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 4rpx;
}

.expense-dot {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.9), rgba(244, 67, 54, 0.6));
}

.income-dot {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(76, 175, 80, 0.6));
}

.legend-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}

/* Tooltip */
.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  z-index: 1000;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.tooltip-date {
  display: block;
  font-weight: 600;
  margin-bottom: 8rpx;
  padding-bottom: 8rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 6rpx;
}

.tooltip-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 2rpx;
  flex-shrink: 0;
}

.tooltip-label {
  color: rgba(255, 255, 255, 0.8);
}

.tooltip-value {
  font-weight: 600;
  color: #fff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: 600;
}

.section-subtitle {
  font-size: 22rpx;
  color: var(--text-secondary);
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  margin-bottom: 24rpx;
}

.ring-chart {
  position: relative;
  width: 240rpx;
  height: 240rpx;
}

.ring-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.empty-chart {
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: var(--text-muted);
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 4rpx;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: 24rpx;
  color: var(--text-primary);
}

.legend-amount {
  font-size: 24rpx;
  color: var(--text-secondary);
  font-family: 'Space Mono', monospace;
  margin-right: 12rpx;
}

.legend-percent {
  font-size: 22rpx;
  color: var(--text-muted);
  width: 60rpx;
  text-align: right;
}

.trend-chart {
  width: 100%;
  height: 240px;
  overflow: hidden;
}

/* 分析过程展示 */
.analysis-process {
  background-color: var(--bg-surface);
  border: 1rpx solid var(--divider);
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.process-step {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 0;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.process-step.current {
  opacity: 1;
}

.process-step.completed {
  opacity: 1;
}

.process-step.completed .step-icon {
  color: var(--accent);
}

.process-step.current .step-icon {
  color: var(--accent);
  animation: pulse 1s infinite;
}

.step-icon {
  font-size: 24rpx;
  color: var(--text-muted);
  width: 32rpx;
  text-align: center;
}

.step-text {
  font-size: 24rpx;
  color: var(--text-primary);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.ai-report {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.report-section {
  background-color: var(--bg-surface);
  border: 1rpx solid var(--divider);
  border-radius: 12rpx;
  padding: 24rpx;
  opacity: 0;
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.report-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.tag-icon {
  font-size: 24rpx;
}

.tag-label {
  font-size: 22rpx;
  color: var(--accent);
  font-weight: 600;
}

.report-content {
  font-size: 26rpx;
  color: var(--text-primary);
  line-height: 1.6;
  display: block;
}

.ai-disclaimer {
  text-align: center;
  margin-top: 24rpx;
  padding: 16rpx;
}

.ai-disclaimer text {
  font-size: 20rpx;
  color: var(--text-muted);
}

/* 顶部操作栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 28rpx;
  margin-bottom: 24rpx;
}

.deep-analysis-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: linear-gradient(135deg, var(--accent) 0%, var(--success) 100%);
  padding: 20rpx 32rpx;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(168, 197, 160, 0.3);
}

.btn-text {
  font-size: 28rpx;
  color: var(--text-inverse);
  font-weight: 600;
}

.btn-arrow {
  font-size: 32rpx;
  color: var(--text-inverse);
}

/* 深挖分析弹框 */
.analysis-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  background-color: var(--bg-primary);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.6);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.modal-title {
  font-size: 32rpx;
  color: var(--text-primary);
  font-weight: 600;
}

.modal-close {
  font-size: 40rpx;
  color: var(--text-muted);
  padding: 8rpx;
  line-height: 1;
}

.modal-close:active {
  color: var(--text-primary);
}
</style>
