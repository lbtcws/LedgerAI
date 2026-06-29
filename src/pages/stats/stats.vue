<template>
  <view class="stats-page" :class="{ 'modal-open': showDeepAnalysisModal }">
    <!-- 顶部操作栏 -->
    <view class="top-bar">
      <!-- AI 账单分析按钮 -->
      <view class="deep-analysis-btn" @click="openAnalysisModal">
        <text class="btn-text">AI 账单分析</text>
        <text class="btn-arrow">→</text>
      </view>
      <!-- 设置入口 -->
      <view class="settings-entry" @click="goToSettings">
        <text class="settings-icon">⚙️</text>
      </view>
    </view>

    <!-- 消费分布环形图 -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">消费分布</text>
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
          <text class="empty-text">暂无支出数据</text>
        </view>
      </view>
      <!-- 图例 -->
      <view class="legend-list">
        <view
          class="legend-item"
          v-for="(item, index) in categoryBreakdown"
          :key="item.category"
        >
          <view class="legend-dot" :style="{ backgroundColor: getSegmentColor(index) }"></view>
          <text class="legend-label">{{ item.category }}</text>
          <text class="legend-amount">¥{{ formatAmount(item.amount) }}</text>
          <text class="legend-percent">{{ item.percent }}%</text>
        </view>
      </view>
    </view>

    <!-- 30 日支出趋势 -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">消费节奏</text>
      </view>
      <view class="trend-chart">
        <view class="trend-bars">
          <view
            class="trend-bar"
            v-for="day in dailyTrend"
            :key="day.date"
            :style="{ height: getBarHeight(day.total) + 'rpx' }"
          >
            <text class="bar-date">{{ day.date.slice(3) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 深挖分析弹框 -->
    <view class="analysis-modal" v-if="showDeepAnalysisModal" @touchmove.stop.prevent>
      <view class="modal-overlay" @click="closeAnalysisModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">AI 账单分析</text>
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
          <text>⚡ 由通义千问 AI 生成，仅供参考</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBillsStore } from '@/store/bills'
import { formatAmount, getYearMonth } from '@/utils/format'
import { getDeepAnalysisStream, parseAiReport } from '@/utils/ai-ledger'

const billsStore = useBillsStore()

// 状态
const aiLoading = ref(false)
const aiReport = ref([])
const analysisSteps = ref([])
const currentText = ref('')
const showDeepAnalysisModal = ref(false)

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

// 计算属性
const currentMonthLabel = computed(() => {
  const now = new Date()
  return `${now.getMonth() + 1}月`
})

const categoryBreakdown = computed(() => billsStore.categoryBreakdown)
const dailyTrend = computed(() => billsStore.dailyTrend)

const maxDailyAmount = computed(() => {
  return Math.max(...dailyTrend.value.map(d => d.total), 1)
})

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
  const colors = ['#A8C5A0', '#7A9B76', '#5C7A5A', '#445C44', '#3D3D3F', '#5C5C5C', '#7A7A7A', '#9A9A9A']
  return colors[index % colors.length]
}

function getBarHeight(amount) {
  const max = 200
  const min = 20
  return min + (amount / maxDailyAmount.value) * (max - min)
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
  
  aiLoading.value = true
  aiReport.value = []
  currentText.value = ''
  analysisSteps.value = [
    { text: '读取本月账单数据', completed: false, current: true },
    { text: '分析消费异常点', completed: false, current: false },
    { text: '识别消费习惯模式', completed: false, current: false },
    { text: '生成个性化建议', completed: false, current: false },
    { text: '撰写财务总结', completed: false, current: false }
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

    // 模拟分析过程，流式输出
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
      title: '分析完成 ✓',
      icon: 'success'
    })
  } catch (error) {
    console.error('AI 分析错误:', error)
    let errorMessage = error.message || '未知错误'
    
    // 根据错误类型给出更友好的提示
    if (errorMessage.includes('未启用') || errorMessage.includes('配置')) {
      aiReport.value = [{ 
        tag: '⚠️ 需要配置', 
        content: 'AI 功能需要先配置 API Key。\n\n请点击页面右上角 ⚙️ 图标，选择服务商并填写 API Key 即可使用分析功能。\n\n支持：通义千问、DeepSeek 等主流 AI 服务。' 
      }]
    } else if (errorMessage.includes('API Key 无效') || errorMessage.includes('401')) {
      aiReport.value = [{ 
        tag: '⚠️ Key 无效', 
        content: '当前 API Key 可能已过期或不正确。\n\n请前往设置页面检查并更新 API Key。' 
      }]
    } else if (errorMessage.includes('超时')) {
      aiReport.value = [{ 
        tag: '⚠️ 网络超时', 
        content: 'AI 服务响应超时，可能是网络问题或服务繁忙。\n\n建议：\n1. 检查网络连接\n2. 稍后重试\n3. 确认 API Key 有效' 
      }]
    } else {
      aiReport.value = [{ 
        tag: '⚠️ 分析失败', 
        content: errorMessage 
      }]
    }
    
    // 失败提示
    uni.showToast({
      title: '分析失败',
      icon: 'none'
    })
  } finally {
    aiLoading.value = false
  }
}

function goToSettings() {
  uni.navigateTo({
    url: '/pages/settings/ai-settings'
  })
}

onMounted(() => {
  billsStore.loadFromStorage()
})
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  background-color: #0E0E10;
  padding: 24rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  position: relative;
}

/* 弹框打开时禁止背景滚动 */
.stats-page.modal-open {
  overflow: hidden;
  height: 100vh;
}

.settings-entry {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.settings-entry:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.settings-icon {
  font-size: 32rpx;
}

.chart-section {
  background-color: #161618;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  color: #F0EDE6;
  font-weight: 600;
}

.section-subtitle {
  font-size: 22rpx;
  color: #8A8A8A;
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
  color: #3D3D3F;
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
  color: #F0EDE6;
}

.legend-amount {
  font-size: 24rpx;
  color: #8A8A8A;
  font-family: 'Space Mono', monospace;
  margin-right: 12rpx;
}

.legend-percent {
  font-size: 22rpx;
  color: #3D3D3F;
  width: 60rpx;
  text-align: right;
}

.trend-chart {
  overflow-x: auto;
}

.trend-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200rpx;
  padding: 0 8rpx;
  gap: 8rpx;
}

.trend-bar {
  flex: 1;
  background: linear-gradient(to top, rgba(168, 197, 160, 0.3), rgba(168, 197, 160, 0.6));
  border-radius: 4rpx 4rpx 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8rpx;
  min-height: 20rpx;
}

.bar-date {
  font-size: 18rpx;
  color: #8A8A8A;
  transform: rotate(-45deg);
  transform-origin: center;
  white-space: nowrap;
}

/* 分析过程展示 */
.analysis-process {
  background-color: #161618;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
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
  color: #A8C5A0;
}

.process-step.current .step-icon {
  color: #A8C5A0;
  animation: pulse 1s infinite;
}

.step-icon {
  font-size: 24rpx;
  color: #3D3D3F;
  width: 32rpx;
  text-align: center;
}

.step-text {
  font-size: 24rpx;
  color: #F0EDE6;
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
  background-color: #161618;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
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
  color: #A8C5A0;
  font-weight: 600;
}

.report-content {
  font-size: 26rpx;
  color: #F0EDE6;
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
  color: #3D3D3F;
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
  background: linear-gradient(135deg, #A8C5A0 0%, #7A9B76 100%);
  padding: 20rpx 32rpx;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(168, 197, 160, 0.3);
}

.btn-text {
  font-size: 28rpx;
  color: #0E0E10;
  font-weight: 600;
}

.btn-arrow {
  font-size: 32rpx;
  color: #0E0E10;
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
  background-color: #0E0E10;
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
  color: #F0EDE6;
  font-weight: 600;
}

.modal-close {
  font-size: 40rpx;
  color: #3D3D3F;
  padding: 8rpx;
  line-height: 1;
}

.modal-close:active {
  color: #F0EDE6;
}
</style>
