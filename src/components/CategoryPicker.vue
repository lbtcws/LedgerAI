<template>
  <view class="category-picker">
    <view class="category-row" v-for="(row, rowIndex) in categoryRows" :key="rowIndex">
      <view
        v-for="cat in row"
        :key="cat"
        class="category-chip"
        :class="{ active: modelValue === cat }"
        @click="handleSelect(cat)"
      >
        <text class="chip-text">{{ cat }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const CATEGORIES = ['餐饮', '交通', '购物', '娱乐', '医疗', '居住', '工资', '其他']

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// 每行 4 个分类
const categoryRows = CATEGORIES.reduce((rows, cat, index) => {
  const rowIndex = Math.floor(index / 4)
  if (!rows[rowIndex]) rows[rowIndex] = []
  rows[rowIndex].push(cat)
  return rows
}, [])

function handleSelect(category) {
  emit('update:modelValue', category)
}
</script>

<style scoped>
.category-picker {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.category-row {
  display: flex;
  gap: 16rpx;
  justify-content: space-between;
}

.category-chip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  border-radius: 8rpx;
  transition: all 0.2s;
}

.category-chip:active {
  opacity: 0.7;
}

.category-chip.active {
  background-color: #A8C5A0;
  border-color: #A8C5A0;
}

.chip-text {
  font-size: 26rpx;
  color: #F0EDE6;
}

.category-chip.active .chip-text {
  color: #0E0E10;
  font-weight: 600;
}
</style>
