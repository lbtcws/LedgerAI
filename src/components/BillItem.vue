<template>
  <view class="bill-item" :class="{ 'income': bill.type === 'INCOME' }" @click="handleEdit">
    <view class="bill-category">
      <text class="category-text">{{ tCategory(bill.category) }}</text>
    </view>
    <view class="bill-info">
      <text class="bill-note">{{ bill.note || '无备注' }}</text>
      <text class="bill-date">{{ formatDate(bill.date, 'relative') }}</text>
    </view>
    <view class="bill-amount">
      <text :class="['amount-text', bill.type === 'INCOME' ? 'positive' : 'negative']">
        {{ bill.type === 'INCOME' ? '+' : '-' }}¥{{ formatAmount(bill.amount) }}
      </text>
    </view>
  </view>
</template>

<script setup>
import { formatAmount, formatDate } from '@/utils/format'
import { tCategory } from '@/utils/categories'

const props = defineProps({
  bill: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit'])

function handleEdit() {
  emit('edit', props.bill)
}
</script>

<style scoped>
.bill-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.07);
}

.bill-item:last-child {
  border-bottom: none;
}

.bill-category {
  width: 100rpx;
  flex-shrink: 0;
}

.category-text {
  font-size: 26rpx;
  color: var(--text-primary);
  font-weight: 500;
}

.bill-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
  overflow: hidden;
}

.bill-note {
  font-size: 28rpx;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bill-date {
  font-size: 22rpx;
  color: #8A8A8A;
  margin-top: 6rpx;
}

.bill-amount {
  flex-shrink: 0;
  text-align: right;
}

.amount-text {
  font-size: 30rpx;
  font-weight: 600;
  font-family: 'Space Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.amount-text.positive {
  color: #A8C5A0;
}

.amount-text.negative {
  color: #E07070;
}
</style>
