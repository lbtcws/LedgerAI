<template>
  <view class="container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">AI 智能记账</text>
      <text class="subtitle">说出你的消费，AI 自动记录</text>
    </view>

    <!-- 输入区域 -->
    <view class="input-section">
      <textarea
        class="ledger-input"
        v-model="inputText"
        placeholder="例如：昨天中午吃火锅花了 188 元"
        placeholder-class="placeholder"
        maxlength="200"
        auto-height
      />
      <button class="submit-btn" :loading="loading" :disabled="!inputText.trim()" @click="handleSubmit">
        {{ loading ? 'AI 解析中...' : '智能记账' }}
      </button>
    </view>

    <!-- 解析结果 -->
    <view class="result-section" v-if="result">
      <view class="result-card">
        <view class="result-header">
          <text class="result-title">解析结果</text>
          <text :class="['result-type', result.type === 'EXPENSE' ? 'expense' : 'income']">
            {{ result.type === 'EXPENSE' ? '支出' : '收入' }}
          </text>
        </view>
        
        <view class="result-body">
          <view class="result-row">
            <text class="label">金额</text>
            <text class="value amount">¥ {{ result.amount.toFixed(2) }}</text>
          </view>
          <view class="result-row">
            <text class="label">分类</text>
            <text class="value">{{ result.category }}</text>
          </view>
          <view class="result-row">
            <text class="label">日期</text>
            <text class="value">{{ result.date }}</text>
          </view>
          <view class="result-row">
            <text class="label">备注</text>
            <text class="value remark">{{ result.remark || '-' }}</text>
          </view>
        </view>

        <button class="confirm-btn" @click="handleConfirm">确认记账</button>
      </view>
    </view>

    <!-- 错误提示 -->
    <view class="error-section" v-if="error">
      <text class="error-text">{{ error }}</text>
      <button class="retry-btn" @click="handleRetry">重试</button>
    </view>

    <!-- 示例提示 -->
    <view class="examples-section">
      <text class="examples-title">试试这样说：</text>
      <view class="examples-list">
        <view class="example-item" v-for="(example, index) in examples" :key="index" @click="useExample(example)">
          <text class="example-text">{{ example }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { parseLedgerText } from '@/utils/ai-ledger.js'

export default {
  data() {
    return {
      inputText: '',
      loading: false,
      result: null,
      error: null,
      examples: [
        '昨天中午吃火锅花了 188 元',
        '收到本月工资 15000',
        '今天打车上班 35 元',
        '上周六买衣服花了 599',
        '发了奖金 5000 元'
      ]
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.inputText.trim()) return

      this.loading = true
      this.error = null
      this.result = null

      try {
        const parsed = await parseLedgerText(this.inputText.trim())
        this.result = parsed
      } catch (err) {
        this.error = err.message || '解析失败，请重试'
      } finally {
        this.loading = false
      }
    },

    handleConfirm() {
      if (!this.result) return

      // TODO: 调用记账 API 保存到本地存储
      uni.showToast({
        title: '记账成功！',
        icon: 'success'
      })

      // 清空输入和结果
      this.inputText = ''
      this.result = null
    },

    handleRetry() {
      this.error = null
      this.handleSubmit()
    },

    useExample(example) {
      this.inputText = example
      this.result = null
      this.error = null
    }
  }
}
</script>

<style scoped>
.container {
  padding: 40rpx;
  min-height: 100vh;
  background-color: #f5f5f7;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  font-size: 48rpx;
  font-weight: 600;
  color: #1d1d1f;
  display: block;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #86868b;
}

.input-section {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.ledger-input {
  width: 100%;
  min-height: 160rpx;
  font-size: 32rpx;
  line-height: 1.6;
  color: #1d1d1f;
  box-sizing: border-box;
}

.placeholder {
  color: #c7c7cc;
}

.submit-btn {
  margin-top: 24rpx;
  background: linear-gradient(135deg, #007aff, #0056b3);
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
  padding: 24rpx;
}

.submit-btn[disabled] {
  background: #d1d1d6;
}

.result-section {
  margin-bottom: 40rpx;
}

.result-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #e5e5e7;
}

.result-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1d1d1f;
}

.result-type {
  font-size: 28rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

.result-type.expense {
  background-color: #fff2f2;
  color: #ff3b30;
}

.result-type.income {
  background-color: #f2fff5;
  color: #34c759;
}

.result-body {
  margin-bottom: 32rpx;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.label {
  font-size: 28rpx;
  color: #86868b;
}

.value {
  font-size: 30rpx;
  color: #1d1d1f;
  font-weight: 500;
}

.value.amount {
  font-size: 40rpx;
  color: #ff3b30;
  font-weight: 600;
}

.value.remark {
  text-align: right;
  max-width: 400rpx;
}

.confirm-btn {
  background: linear-gradient(135deg, #34c759, #28a745);
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
  padding: 24rpx;
}

.error-section {
  background-color: #fff2f2;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
  text-align: center;
}

.error-text {
  display: block;
  font-size: 28rpx;
  color: #ff3b30;
  margin-bottom: 20rpx;
}

.retry-btn {
  background-color: #ff3b30;
  color: #ffffff;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  padding: 16rpx 40rpx;
}

.examples-section {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.examples-title {
  font-size: 28rpx;
  color: #86868b;
  display: block;
  margin-bottom: 20rpx;
}

.example-item {
  padding: 20rpx;
  background-color: #f5f5f7;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.example-item:last-child {
  margin-bottom: 0;
}

.example-text {
  font-size: 26rpx;
  color: #007aff;
}
</style>
