<template>
  <view class="bills-page">
    <!-- 月份切换器 -->
    <view class="month-selector">
      <text class="nav-btn" @click="prevMonth">‹</text>
      <text class="month-label">{{ currentMonthLabel }}</text>
      <text class="nav-btn" @click="nextMonth">›</text>
    </view>

    <!-- 月度概览 -->
    <view class="summary-section">
      <view class="summary-item">
        <text class="summary-label">{{ t('bills.expense') }}</text>
        <text class="summary-value expense">¥{{ formatAmount(summary.totalExpense) }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">{{ t('bills.income') }}</text>
        <text class="summary-value income">¥{{ formatAmount(summary.totalIncome) }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">{{ t('bills.balance') }}</text>
        <text :class="['summary-value', summary.balance >= 0 ? 'balance-positive' : 'balance-negative']">
          {{ summary.balance >= 0 ? '+' : '' }}¥{{ formatAmount(summary.balance) }}
        </text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-section">
      <text
        class="filter-chip"
        :class="{ active: filter === 'all' }"
        @click="filter = 'all'"
      >
        {{ t('bills.all') }}
      </text>
      <text
        class="filter-chip"
        :class="{ active: filter === 'EXPENSE' }"
        @click="filter = 'EXPENSE'"
      >
        {{ t('bills.expense') }}
      </text>
      <text
        class="filter-chip"
        :class="{ active: filter === 'INCOME' }"
        @click="filter = 'INCOME'"
      >
        {{ t('bills.income') }}
      </text>
    </view>

    <!-- 账单列表 -->
    <view class="bills-list">
      <view
        class="date-group"
        v-for="group in groupedBills"
        :key="group.date"
      >
        <view class="date-header">
          <text class="date-text">{{ group.dateLabel }}</text>
        </view>
        <BillItem
          v-for="bill in group.items"
          :key="bill.id"
          :bill="bill"
          @edit="handleEditBill"
        />
      </view>
      <view class="empty-state" v-if="groupedBills.length === 0">
        <text class="empty-text">{{ t('bills.noBills') }}</text>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view class="edit-modal" v-if="showEditModal" @touchmove.stop.prevent>
      <view class="modal-overlay" @click="closeEditModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">{{ t('bills.editBill') }}</text>
          <text class="modal-close" @click="closeEditModal">✕</text>
        </view>
        <view class="modal-body">
          <view class="form-row">
            <text class="form-label">{{ t('bills.amount') }}</text>
            <input
              class="form-input"
              type="digit"
              v-model="editForm.amount"
              placeholder="0.00"
              @blur="handleAutoSave"
            />
          </view>
          <view class="form-row">
            <text class="form-label">{{ t('bills.date') }}</text>
            <input
              class="form-input"
              type="date"
              v-model="editForm.date"
              @blur="handleAutoSave"
            />
          </view>
          <view class="form-row">
            <text class="form-label">{{ t('bills.note') }}</text>
            <input
              class="form-input"
              type="text"
              v-model="editForm.note"
              :placeholder="t('common.optional')"
              @blur="handleAutoSave"
            />
          </view>
          <view class="form-row">
            <text class="form-label">{{ t('bills.type') }}</text>
            <view class="type-switcher">
              <text
                class="type-btn"
                :class="{ active: editForm.type === 'EXPENSE' }"
                @click="handleTypeChange"
              >{{ t('bills.expense') }}</text>
              <text
                class="type-btn"
                :class="{ active: editForm.type === 'INCOME' }"
                @click="handleTypeChange"
              >{{ t('bills.income') }}</text>
            </view>
          </view>
          <view class="form-row">
            <text class="form-label">{{ t('bills.category') }}</text>
            <view class="category-grid">
              <text
                v-for="cat in categories"
                :key="cat"
                class="category-tag"
                :class="{ active: editForm.category === cat }"
                @click="handleCategoryChange(cat)"
              >{{ tCategory(cat) }}</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-delete" @click="handleDeleteBill">{{ t('bills.delete') }}</button>
        </view>
        <!-- 保存状态提示 -->
        <view class="save-status" v-if="showSaveStatus">
          <text>{{ t('bills.saved') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBillsStore } from '@/store/bills'
import { formatAmount, formatDate, getYearMonth, navigateMonth, getRecentMonths } from '@/utils/format'
import { getExpenseCategories, getIncomeCategories, tCategory } from '@/utils/categories'
import { t, useLanguage } from '@/i18n'
import BillItem from '@/components/BillItem.vue'

const billsStore = useBillsStore()
const langState = useLanguage()

// 统一分类体系（支出 + 收入）
const ALL_CATEGORIES = [...getExpenseCategories(), ...getIncomeCategories().filter(c => !getExpenseCategories().includes(c))]

// 状态
const currentMonth = ref(getYearMonth())
const filter = ref('all')
const showEditModal = ref(false)
const showSaveStatus = ref(false)
const editForm = ref({
  id: null,
  amount: '',
  date: '',
  note: '',
  type: 'EXPENSE',
  category: '餐饮'
})

// 防抖定时器
let saveTimer = null

// 自动保存（带防抖）
function handleAutoSave() {
  if (saveTimer) clearTimeout(saveTimer)
  
  saveTimer = setTimeout(() => {
    const amount = parseFloat(editForm.value.amount)
    if (isNaN(amount) || amount <= 0) return
    
    billsStore.update(editForm.value.id, {
      amount,
      date: editForm.value.date,
      note: editForm.value.note,
      type: editForm.value.type,
      category: editForm.value.category
    })
    
    // 显示保存成功提示
    showSaveStatus.value = true
    setTimeout(() => {
      showSaveStatus.value = false
    }, 1500)
  }, 500)
}

// 日期选择处理
// 类型切换时自动保存
function handleTypeChange() {
  editForm.value.type = editForm.value.type === 'EXPENSE' ? 'INCOME' : 'EXPENSE'
  handleAutoSave()
}

// 分类切换时自动保存
function handleCategoryChange(cat) {
  editForm.value.category = cat
  handleAutoSave()
}

// 统一分类体系（不再根据类型动态切换）
const categories = ALL_CATEGORIES

// 计算属性
const currentMonthLabel = computed(() => {
  const [year, month] = currentMonth.value.split('-')
  return t('date.yearMonth', { year, month: parseInt(month) })
})

const monthBills = computed(() => {
  return billsStore.bills.filter(b => b.date.startsWith(currentMonth.value))
})

const summary = computed(() => {
  const bills = monthBills.value
  const totalExpense = bills
    .filter(b => b.type === 'EXPENSE')
    .reduce((sum, b) => sum + b.amount, 0)
  const totalIncome = bills
    .filter(b => b.type === 'INCOME')
    .reduce((sum, b) => sum + b.amount, 0)
  return {
    totalExpense,
    totalIncome,
    balance: totalIncome - totalExpense
  }
})

const filteredBills = computed(() => {
  let bills = monthBills.value
  if (filter.value !== 'all') {
    bills = bills.filter(b => b.type === filter.value)
  }
  return bills.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const groupedBills = computed(() => {
  const groups = {}
  filteredBills.value.forEach(bill => {
    const dateKey = bill.date
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        dateLabel: formatDate(dateKey, 'full'),
        items: []
      }
    }
    groups[dateKey].items.push(bill)
  })
  return Object.values(groups)
})

// 方法
function prevMonth() {
  currentMonth.value = navigateMonth(currentMonth.value, -1)
}

function nextMonth() {
  currentMonth.value = navigateMonth(currentMonth.value, 1)
}

function handleEditBill(bill) {
  editForm.value = {
    id: bill.id,
    amount: String(bill.amount),
    date: bill.date,
    note: bill.note || '',
    type: bill.type,
    category: bill.category
  }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
}

function handleDeleteBill() {
  // 先关闭编辑弹窗，让确认弹窗可见
  closeEditModal()
  
  uni.showModal({
    title: t('bills.confirmDelete'),
    content: t('bills.deleteConfirmMsg'),
    success: (res) => {
      if (res.confirm) {
        billsStore.deleteBill(editForm.value.id)
        uni.showToast({
          title: t('bills.deleted'),
          icon: 'success'
        })
      }
    }
  })
}

onMounted(() => {
  billsStore.loadFromStorage()
})
</script>

<style scoped>
.bills-page {
  min-height: 100vh;
  background-color: #0E0E10;
  padding: 32rpx;
}

.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48rpx;
  margin-bottom: 40rpx;
}

.nav-btn {
  font-size: 40rpx;
  color: #8A8A8A;
  padding: 16rpx 24rpx;
}

.nav-btn:active {
  color: #F0EDE6;
}

.month-label {
  font-size: 40rpx;
  color: #F0EDE6;
  font-family: 'DM Serif Display', serif;
  font-weight: 600;
}

.summary-section {
  display: flex;
  justify-content: space-between;
  background-color: #161618;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  margin-bottom: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.summary-item {
  text-align: center;
  flex: 1;
}

.summary-label {
  display: block;
  font-size: 22rpx;
  color: #8A8A8A;
  margin-bottom: 12rpx;
}

.summary-value {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  font-family: 'Space Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.summary-value.expense {
  color: #E07070;
}

.summary-value.income {
  color: #A8C5A0;
}

.summary-value.balance-positive {
  color: #A8C5A0;
}

.summary-value.balance-negative {
  color: #E07070;
}

.filter-section {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.filter-chip {
  padding: 12rpx 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #8A8A8A;
}

.filter-chip.active {
  background-color: #A8C5A0;
  border-color: #A8C5A0;
  color: #0E0E10;
  font-weight: 600;
}

.bills-list {
  padding-bottom: 40rpx;
}

.date-group {
  margin-bottom: 32rpx;
}

.date-header {
  padding: 16rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
  margin-bottom: 8rpx;
}

.date-text {
  font-size: 24rpx;
  color: #8A8A8A;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 26rpx;
  color: #3D3D3F;
}

/* 编辑弹窗 */
.edit-modal {
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
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  background-color: #161618;
  border-radius: 20rpx;
  padding: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-body {
  margin-bottom: 32rpx;
  overflow-y: auto;
  flex: 1;
}

@keyframes slideUp {
  from {
    transform: translateY(100rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}

.modal-title {
  font-size: 32rpx;
  color: #F0EDE6;
  font-weight: 600;
}

.modal-close {
  font-size: 32rpx;
  color: #8A8A8A;
  padding: 8rpx 16rpx;
}

.modal-close:active {
  color: #F0EDE6;
}

.form-row {
  margin-bottom: 20rpx;
}

.form-label {
  display: block;
  font-size: 24rpx;
  color: #8A8A8A;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #F0EDE6;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: #3D3D3F;
}

.picker-value {
  font-size: 28rpx;
  color: #F0EDE6;
  line-height: 80rpx;
  height: 100%;
  display: flex;
  align-items: center;
}

.type-switcher {
  display: flex;
  gap: 16rpx;
}

.type-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #8A8A8A;
}

.type-btn.active {
  background-color: #A8C5A0;
  border-color: #A8C5A0;
  color: #0E0E10;
  font-weight: 600;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  max-height: 400rpx;
  overflow-y: auto;
  padding: 8rpx;
}

.category-tag {
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #8A8A8A;
}

.category-tag.active {
  background-color: #A8C5A0;
  border-color: #A8C5A0;
  color: #0E0E10;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
}

.btn-delete,
.btn-save {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete {
  background-color: rgba(224, 112, 112, 0.15);
  color: #E07070;
  border: 1rpx solid rgba(224, 112, 112, 0.3);
}

.btn-delete:active {
  background-color: rgba(224, 112, 112, 0.25);
}

.btn-save {
  background-color: #A8C5A0;
  color: #0E0E10;
  font-weight: 600;
}

.btn-save:active {
  background-color: #7A9B76;
}

/* 保存状态提示 */
.save-status {
  position: fixed;
  bottom: 40%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(168, 197, 160, 0.95);
  color: #0E0E10;
  padding: 16rpx 32rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 600;
  white-space: nowrap;
  z-index: 1001;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
  animation: saveStatusFade 1.5s ease forwards;
}

@keyframes saveStatusFade {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.9);
  }
  20% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  80% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) scale(0.9);
  }
}
</style>
