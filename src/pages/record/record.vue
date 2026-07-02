<template>
  <view class="record-page">
    <!-- 顶部：支出/收入切换 -->
    <view class="type-toggle">
      <view 
        class="type-option" 
        :class="{ active: type === 'EXPENSE' }"
        @click="type = 'EXPENSE'"
      >
        <text class="type-text">{{ t('record.expense') }}</text>
      </view>
      <view 
        class="type-option" 
        :class="{ active: type === 'INCOME' }"
        @click="type = 'INCOME'"
      >
        <text class="type-text">{{ t('record.income') }}</text>
      </view>
    </view>

    <!-- 核心：金额输入 -->
    <view class="amount-section">
      <text class="currency">¥</text>
      <input
        class="amount-input"
        type="digit"
        v-model="amountStr"
        placeholder="0"
        placeholder-class="amount-placeholder"
        :focus="true"
      />
    </view>

    <!-- 备注输入（可选） -->
    <view class="note-section">
      <input
        class="note-input"
        v-model="note"
        :placeholder="t('record.notePlaceholder')"
        placeholder-class="note-placeholder"
      />
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button
        class="submit-btn"
        :class="{ 'can-submit': amount > 0 }"
        hover-class="submit-btn-active"
        :hover-stay-time="150"
        @click="handleSubmit"
      >
        <text>{{ t('record.submitBtn') }}</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBillsStore } from '@/store/bills'
import { quickCategorize } from '@/utils/categories'
import { t, useLanguage } from '@/i18n'

const billsStore = useBillsStore()
const langState = useLanguage()

// 状态
const amountStr = ref('')
const type = ref('EXPENSE')
const category = ref('')
const note = ref('')

// 计算属性
const amount = computed(() => {
  const num = parseFloat(amountStr.value)
  return isNaN(num) ? 0 : num
})

// 监听备注变化，自动分类
function autoCategorize() {
  if (note.value && !category.value) {
    category.value = quickCategorize(note.value, type.value)
  }
}

// 提交记账
async function handleSubmit() {
  if (amount.value <= 0) return

  // 如果用户没有手动选择分类，使用自动分类或默认
  if (!category.value) {
    category.value = quickCategorize(note.value, type.value) || '其他'
  }

  // 创建账单对象
  const bill = {
    amount: amount.value,
    type: type.value,
    category: category.value,
    note: note.value,
    date: new Date().toISOString().split('T')[0]
  }

  // 存储
  billsStore.add(bill)

  // 友好提示
  uni.showToast({
    title: t('record.success'),
    icon: 'success',
    duration: 1500
  })

  // 清空输入
  amountStr.value = ''
  note.value = ''
  category.value = ''
  type.value = 'EXPENSE'
}

onMounted(() => {
  billsStore.loadFromStorage()
})
</script>

<style scoped>
.record-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 40rpx 32rpx calc(80rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 支出/收入切换 */
.type-toggle {
  display: flex;
  gap: 48rpx;
  margin-bottom: 80rpx;
  padding-top: 40rpx;
}

.type-option {
  padding: 16rpx 48rpx;
  border-radius: 32rpx;
  background-color: var(--accent-soft);
  transition: all 0.2s;
}

.type-option.active {
  background-color: rgba(168, 197, 160, 0.2);
}

.type-text {
  font-size: 32rpx;
  color: var(--text-secondary);
  font-weight: 500;
}

.type-option.active .type-text {
  color: var(--accent);
}

/* 金额输入 */
.amount-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
}

.currency {
  font-size: 48rpx;
  color: var(--text-primary);
  font-weight: 300;
  margin-right: 8rpx;
}

.amount-input {
  font-size: 120rpx;
  color: var(--text-primary);
  font-family: 'Space Mono', monospace;
  font-weight: 600;
  text-align: center;
  width: 500rpx;
  caret-color: var(--accent);
}

.amount-placeholder {
  color: var(--text-muted);
}

/* 备注输入 */
.note-section {
  width: 100%;
  margin-bottom: 32rpx;
}

.note-input {
  width: 100%;
  height: 88rpx;
  background-color: transparent;
  border: 1rpx solid var(--divider);
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: var(--text-primary);
  text-align: center;
}

.note-placeholder {
  color: var(--text-muted);
}

/* 提交按钮 */
.submit-section {
  width: 100%;
  margin-top: 48rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  background-color: transparent;
  border: 1rpx solid var(--accent-border);
  border-radius: 16rpx;
  font-size: 32rpx;
  color: var(--accent);
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn.can-submit {
  border-color: var(--accent);
  color: var(--accent);
  background-color: var(--accent-soft);
}

.submit-btn-active {
  background-color: var(--accent-soft);
  transform: scale(0.98);
}

.submit-btn.can-submit:active {
  background-color: var(--accent);
  color: var(--text-inverse);
}
</style>
