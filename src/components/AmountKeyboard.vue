<template>
  <view class="amount-keyboard">
    <!-- 金额显示 -->
    <view class="amount-display">
      <text class="currency">¥</text>
      <text class="amount-value">{{ displayAmount }}</text>
    </view>

    <!-- 类型切换 -->
    <view class="type-toggle">
      <text
        class="type-option"
        :class="{ active: type === 'EXPENSE' }"
        @click="handleTypeChange('EXPENSE')"
      >
        支出
        <view class="underline" v-if="type === 'EXPENSE'"></view>
      </text>
      <text
        class="type-option"
        :class="{ active: type === 'INCOME' }"
        @click="handleTypeChange('INCOME')"
      >
        收入
        <view class="underline" v-if="type === 'INCOME'"></view>
      </text>
    </view>

    <!-- 数字键盘 -->
    <view class="keypad">
      <view class="keypad-row">
        <view class="key" @click="handleKey('1')"><text class="key-text">1</text></view>
        <view class="key" @click="handleKey('2')"><text class="key-text">2</text></view>
        <view class="key" @click="handleKey('3')"><text class="key-text">3</text></view>
      </view>
      <view class="keypad-row">
        <view class="key" @click="handleKey('4')"><text class="key-text">4</text></view>
        <view class="key" @click="handleKey('5')"><text class="key-text">5</text></view>
        <view class="key" @click="handleKey('6')"><text class="key-text">6</text></view>
      </view>
      <view class="keypad-row">
        <view class="key" @click="handleKey('7')"><text class="key-text">7</text></view>
        <view class="key" @click="handleKey('8')"><text class="key-text">8</text></view>
        <view class="key" @click="handleKey('9')"><text class="key-text">9</text></view>
      </view>
      <view class="keypad-row">
        <view class="key" @click="handleKey('.')"><text class="key-text">.</text></view>
        <view class="key" @click="handleKey('0')"><text class="key-text">0</text></view>
        <view class="key delete" @click="handleDelete">
          <text class="key-text">⌫</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    default: 'EXPENSE'
  }
})

const emit = defineEmits(['update:modelValue', 'update:type'])

const amountStr = ref('')

const displayAmount = computed(() => {
  if (!amountStr.value) return '0.00'
  const num = parseFloat(amountStr.value) || 0
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})

function handleKey(key) {
  if (key === '.' && amountStr.value.includes('.')) return
  if (amountStr.value.length >= 10) return
  
  amountStr.value += key
  emit('update:modelValue', parseFloat(amountStr.value) || 0)
}

function handleDelete() {
  amountStr.value = amountStr.value.slice(0, -1)
  emit('update:modelValue', parseFloat(amountStr.value) || 0)
}

function handleTypeChange(type) {
  emit('update:type', type)
}

// 监听外部值变化
import { watch } from 'vue'
watch(() => props.modelValue, (newVal) => {
  if (newVal === 0) {
    amountStr.value = ''
  }
}, { immediate: true })
</script>

<style scoped>
.amount-keyboard {
  background-color: #161618;
  padding: 40rpx 32rpx;
  border-radius: 24rpx 24rpx 0 0;
}

.amount-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 40rpx;
}

.currency {
  font-size: 48rpx;
  color: #F0EDE6;
  margin-right: 8rpx;
}

.amount-value {
  font-size: 96rpx;
  color: #F0EDE6;
  font-family: 'Space Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.type-toggle {
  display: flex;
  justify-content: center;
  gap: 60rpx;
  margin-bottom: 40rpx;
}

.type-option {
  font-size: 32rpx;
  color: #8A8A8A;
  position: relative;
  padding-bottom: 12rpx;
}

.type-option.active {
  color: #F0EDE6;
}

.underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #A8C5A0;
  border-radius: 2rpx;
}

.keypad {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.keypad-row {
  display: flex;
  gap: 16rpx;
}

.key {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 32rpx 0;
  transition: background-color 0.15s;
}

.key:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.key.delete {
  background-color: rgba(224, 112, 112, 0.15);
}

.key.delete:active {
  background-color: rgba(224, 112, 112, 0.25);
}

.key-text {
  font-size: 44rpx;
  color: #F0EDE6;
  font-weight: 500;
}

.key.delete .key-text {
  color: #E07070;
}
</style>
