<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="nav-item" :class="{ active: currentTab === 0 }" @click="currentTab = 0">
        <text class="nav-icon">📝</text>
        <text class="nav-text">{{ t('tabbar.record') }}</text>
      </view>
      <view class="nav-item" :class="{ active: currentTab === 1 }" @click="currentTab = 1">
        <text class="nav-icon">📋</text>
        <text class="nav-text">{{ t('tabbar.bills') }}</text>
      </view>
      <view class="nav-item" :class="{ active: currentTab === 2 }" @click="currentTab = 2">
        <text class="nav-icon">📊</text>
        <text class="nav-text">{{ t('tabbar.stats') }}</text>
      </view>
      <view class="nav-item" @click="goToSettings">
        <text class="nav-icon">⚙️</text>
        <text class="nav-text">{{ t('tabbar.settings') }}</text>
      </view>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <Record v-if="currentTab === 0" />
      <Bills v-else-if="currentTab === 1" />
      <Stats v-else-if="currentTab === 2" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Record from '@/pages/record/record.vue'
import Bills from '@/pages/bills/bills.vue'
import Stats from '@/pages/stats/stats.vue'
import { t } from '@/i18n'

const currentTab = ref(0)

function goToSettings() {
  uni.navigateTo({
    url: '/pages/settings/ai-settings'
  })
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
}

.top-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32rpx;
  height: 88rpx;
  background-color: var(--bg-primary);
  border-bottom: 1rpx solid var(--divider);
  padding-top: var(--status-bar-height, 0);
  transition: background-color 0.3s ease;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  transition: all 0.2s;
}

.nav-item:active {
  opacity: 0.7;
}

.nav-icon {
  font-size: 32rpx;
  line-height: 1;
}

.nav-text {
  font-size: 28rpx;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-item.active .nav-text {
  color: var(--accent);
  background-color: var(--accent-soft);
}

.nav-item.active .nav-icon {
  filter: brightness(1.2);
}

.page-content {
  flex: 1;
  overflow-y: auto;
}
</style>
