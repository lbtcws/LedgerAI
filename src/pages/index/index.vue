<template>
  <view class="content">
    <view class="header">
      <text class="app-name">AI 记账</text>
      <text class="app-slogan">极简记账，智能生活</text>
    </view>

    <view class="menu-section">
      <view class="menu-item" @click="navigateTo('/pages/ai-ledger/ai-ledger')">
        <view class="menu-icon">🤖</view>
        <view class="menu-info">
          <text class="menu-title">AI 智能记账</text>
          <text class="menu-desc">说话就能记账</text>
        </view>
        <view class="menu-arrow">›</view>
      </view>

      <view class="menu-item disabled">
        <view class="menu-icon">📊</view>
        <view class="menu-info">
          <text class="menu-title">账单明细</text>
          <text class="menu-desc">即将上线</text>
        </view>
        <view class="menu-arrow">›</view>
      </view>

      <view class="menu-item disabled">
        <view class="menu-icon">📈</view>
        <view class="menu-info">
          <text class="menu-title">统计报表</text>
          <text class="menu-desc">即将上线</text>
        </view>
        <view class="menu-arrow">›</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const navigateTo = (url) => {
  uni.navigateTo({ url })
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f7;
  padding: 60rpx 40rpx;
}

.header {
  text-align: center;
  margin-bottom: 80rpx;
}

.app-name {
  font-size: 56rpx;
  font-weight: 600;
  color: #1d1d1f;
  display: block;
  margin-bottom: 16rpx;
}

.app-slogan {
  font-size: 28rpx;
  color: #86868b;
}

.menu-section {
  background-color: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:not(.disabled):active {
  background-color: #f5f5f7;
}

.menu-item.disabled {
  opacity: 0.5;
}

.menu-icon {
  font-size: 48rpx;
  margin-right: 24rpx;
}

.menu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 8rpx;
}

.menu-desc {
  font-size: 24rpx;
  color: #86868b;
}

.menu-arrow {
  font-size: 40rpx;
  color: #c7c7cc;
}
</style>
