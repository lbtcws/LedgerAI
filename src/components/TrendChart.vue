<template>
  <view class="echarts-container">
    <canvas
      type="2d"
      id="trendChart"
      class="trend-chart-canvas"
    ></canvas>
  </view>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useBillsStore } from '@/store/bills'

// 注册必须的组件
echarts.use([
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
])

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const billsStore = useBillsStore()

let chartInstance = null

// 获取当前语言
const getCurrentLang = () => {
  try {
    return uni.getStorageSync('ledger-language') || 'zh'
  } catch {
    return 'zh'
  }
}

// 监听语言变化
let lastLang = getCurrentLang()
const checkLangChange = () => {
  const currentLang = getCurrentLang()
  if (currentLang !== lastLang) {
    lastLang = currentLang
    return true
  }
  return false
}

// 初始化图表
const initChart = () => {
  const query = uni.createSelectorQuery()
  query
    .select('#trendChart')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res[0]) return
      
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      
      // 设置 canvas 大小
      const dpr = uni.getSystemInfoSync().pixelRatio
      canvas.width = res[0].width * dpr
      canvas.height = res[0].height * dpr
      ctx.scale(dpr, dpr)
      
      // 初始化 ECharts
      chartInstance = echarts.init(canvas, null, {
        renderer: 'canvas',
        context: ctx,
        width: res[0].width,
        height: res[0].height
      })
      
      updateChart()
    })
}

// 更新图表
const updateChart = () => {
  if (!chartInstance) return
  
  const lang = getCurrentLang()
  const isEn = lang === 'en'
  
  const dates = props.data.map(item => item.day)
  const expenses = props.data.map(item => item.expense)
  const incomes = props.data.map(item => item.income)
  
  // 计算 Y 轴最大值，留出 10% 空间
  const maxAmount = Math.max(
    ...expenses,
    ...incomes,
    1
  )
  const yAxisMax = Math.ceil(maxAmount * 1.1 / 1000) * 1000
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params) {
        let result = `${params[0].name}${isEn ? 'th' : '日'}\n`
        params.forEach(param => {
          const value = param.value !== null ? param.value : 0
          result += `${param.marker}${param.seriesName}: ¥${value.toLocaleString()}\n`
        })
        return result
      }
    },
    legend: {
      data: [isEn ? 'Expense' : '支出', isEn ? 'Income' : '收入'],
      bottom: 5,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 11
      }
    },
    grid: {
      top: 15,
      left: 45,
      right: 10,
      bottom: 55,  // 增加底部空间给日期标签
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        fontSize: 10,
        interval: 'auto',
        rotate: 0,
        margin: 8  // 增加标签边距
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      max: yAxisMax,
      axisLabel: {
        fontSize: 10,
        formatter: function (value) {
          if (value >= 10000) {
            // 中文：1 万、2 万；英文：10k、20k
            const val = isEn ? (value / 1000) : (value / 10000)
            return val.toFixed(0) + (isEn ? 'k' : '万')
          }
          if (value >= 1000) {
            // 中文：1 千、5 千；英文：1k、5k
            return (value / 1000).toFixed(0) + (isEn ? 'k' : '千')
          }
          return value
        }
      },
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: isEn ? 'Expense' : '支出',
        type: 'bar',
        barWidth: '35%',
        barGap: '20%',
        data: expenses,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(244, 67, 54, 0.8)' },
            { offset: 1, color: 'rgba(244, 67, 54, 0.3)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: isEn ? 'Income' : '收入',
        type: 'bar',
        barWidth: '35%',
        data: incomes,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(76, 175, 80, 0.8)' },
            { offset: 1, color: 'rgba(76, 175, 80, 0.3)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }
  
  chartInstance.setOption(option, true)
}

// 监听数据变化
watch(() => props.data, () => {
  nextTick(() => {
    if (chartInstance) {
      updateChart()
    }
  })
}, { deep: true, immediate: true })

// 每月切换时检查语言变化
watch(() => billsStore.selectedMonth, () => {
  nextTick(() => {
    if (chartInstance && checkLangChange()) {
      updateChart()
    }
  })
})

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      initChart()
    }, 100)
  })
})
</script>

<style scoped>
.echarts-container {
  width: 100%;
  height: 240px;
}

.trend-chart-canvas {
  width: 100%;
  height: 100%;
}
</style>
