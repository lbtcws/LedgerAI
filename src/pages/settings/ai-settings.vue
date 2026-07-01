<template>
  <view class="ai-settings-page">
    <!-- 语言选择 -->
    <view class="section">
      <text class="section-title">{{ t('settings.language') }}</text>
      <view class="language-list">
        <view
          class="language-item"
          :class="{ active: language === 'zh' }"
          @click="setLang('zh')"
        >
          <text>{{ t('settings.chinese') }}</text>
          <view class="check-mark" v-if="language === 'zh'">✓</view>
        </view>
        <view
          class="language-item"
          :class="{ active: language === 'en' }"
          @click="setLang('en')"
        >
          <text>{{ t('settings.english') }}</text>
          <view class="check-mark" v-if="language === 'en'">✓</view>
        </view>
      </view>
    </view>

    <!-- 主题选择 -->
    <view class="section">
      <text class="section-title">{{ t('settings.theme') }}</text>
      <view class="theme-list">
        <view
          class="theme-item"
          :class="{ active: theme === 'dark' && !useCustomBg }"
          @click="setTheme('dark')"
        >
          <text class="theme-icon">🌙</text>
          <text class="theme-name">{{ t('settings.themeDark') }}</text>
          <view class="check-mark" v-if="theme === 'dark' && !useCustomBg">✓</view>
        </view>
        <view
          class="theme-item"
          :class="{ active: theme === 'light' && !useCustomBg }"
          @click="setTheme('light')"
        >
          <text class="theme-icon">☀️</text>
          <text class="theme-name">{{ t('settings.themeLight') }}</text>
          <view class="check-mark" v-if="theme === 'light' && !useCustomBg">✓</view>
        </view>
      </view>
    </view>

    <!-- 启用开关 -->
    <view class="section">
      <view class="setting-item">
        <view class="setting-label">
          <text class="label-text">{{ t('settings.enableAi') }}</text>
          <text class="label-desc">{{ t('settings.enableAiDesc') }}</text>
        </view>
        <switch
          :checked="config.enabled"
          color="#A8C5A0"
          @change="handleEnabledChange"
        />
      </view>
    </view>

    <!-- 服务商选择 -->
    <view class="section" v-if="config.enabled">
      <text class="section-title">{{ t('settings.selectProvider') }}</text>
      <view class="provider-list">
        <view
          class="provider-item"
          :class="{ active: config.provider === key }"
          v-for="(provider, key) in providers"
          :key="key"
          @click="selectProvider(key)"
        >
          <text class="provider-name">{{ provider.name }}</text>
          <view class="provider-radio" v-if="config.provider === key">
            <text class="radio-dot"></text>
          </view>
        </view>
      </view>
    </view>

    <!-- API 配置 -->
    <view class="section" v-if="config.enabled">
      <text class="section-title">{{ t('settings.apiConfig') }}</text>
      
      <view class="form-item">
        <text class="form-label">{{ t('settings.apiBaseUrl') }}</text>
        <input
          class="form-input"
          v-model="config.baseUrl"
          :placeholder="currentProvider.baseUrlPlaceholder"
          type="text"
        />
      </view>

      <view class="form-item">
        <text class="form-label">{{ t('settings.apiKey') }}</text>
        <input
          class="form-input"
          v-model="config.apiKey"
          :placeholder="currentProvider.apiKeyPlaceholder"
          type="password"
        />
      </view>

      <view class="form-item">
        <text class="form-label">{{ t('settings.modelName') }}</text>
        <input
          class="form-input"
          v-model="config.model"
          :placeholder="t('settings.modelPlaceholder')"
          type="text"
        />
      </view>

      <!-- 预设信息展示 -->
      <view class="provider-info" v-if="showProviderInfo">
        <text class="info-label">{{ t('settings.currentProvider') }}</text>
        <text class="info-value">{{ currentProvider.name }}</text>
        <text class="info-model">{{ t('settings.currentModel') }}{{ currentProvider.model || t('settings.providerCustom') }}</text>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="actions">
      <button class="save-btn" :disabled="!canSave" @click="handleSave">
        {{ t('settings.saveConfig') }}
      </button>
      <button class="test-btn" :disabled="!canSave || testing" @click="handleTest">
        {{ testing ? t('settings.testing') : t('settings.testConnection') }}
      </button>
    </view>

    <!-- 测试结果 -->
    <view class="test-result" v-if="testMessage">
      <text :class="['result-text', testSuccess ? 'success' : 'error']">
        {{ testMessage }}
      </text>
    </view>

    <!-- 帮助说明 -->
    <view class="help-section">
      <text class="help-title">{{ t('settings.howToGetKey') }}</text>
      <view class="help-list">
        <text class="help-item">{{ t('settings.howToGetKeyDesc1') }}</text>
        <text class="help-item">{{ t('settings.howToGetKeyDesc2') }}</text>
        <text class="help-item">{{ t('settings.howToGetKeyDesc3') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getAiConfig, getProviderInfo, saveAiConfig, validateAiConfig, AI_PROVIDERS } from '@/utils/ai-config'
import { callAi } from '@/utils/ai-ledger'
import { t, setLanguage, useLanguage } from '@/i18n'
import { useConfigStore } from '@/store/config'

const configStore = useConfigStore()
const langState = useLanguage()
const config = ref({ ...getAiConfig() })
const providers = ref(AI_PROVIDERS)
const testing = ref(false)
const testMessage = ref('')
const testSuccess = ref(false)

// 使用响应式语言状态
const language = computed(() => langState.lang)

// 使用响应式主题状态
const theme = computed(() => configStore.theme)

// 动态设置导航栏标题和颜色
const updateNavigationBar = () => {
  uni.setNavigationBarTitle({
    title: t('settings.aiConfigTitle')
  })
  // 根据主题设置导航栏颜色
  const isDark = theme.value === 'dark'
  uni.setNavigationBarColor({
    frontColor: isDark ? '#ffffff' : '#000000',
    backgroundColor: isDark ? '#0E0E10' : '#F5F5F5',
    animation: {
      duration: 300,
      timingFunc: 'easeIn'
    }
  })
}

onMounted(() => {
  updateNavigationBar()
})

// 监听语言变化，动态更新导航栏标题
watch(language, () => {
  updateNavigationBar()
})

// 监听主题变化，动态更新导航栏颜色
watch(theme, () => {
  updateNavigationBar()
})

const currentProvider = computed(() => {
  return getProviderInfo(config.value.provider)
})

const showProviderInfo = computed(() => {
  return config.value.provider !== 'custom'
})

const canSave = computed(() => {
  if (!config.value.enabled) return true
  const validation = validateAiConfig(config.value)
  return validation.valid
})

function selectProvider(key) {
  const provider = getProviderInfo(key)
  config.value.provider = key
  if (key !== 'custom') {
    config.value.baseUrl = provider.baseUrl
    config.value.model = provider.model
  }
}

function handleEnabledChange(e) {
  config.value.enabled = e.detail.value
}

function setLang(lang) {
  language.value = lang
  setLanguage(lang)
  configStore.setLanguage(lang)
  uni.showToast({
    title: lang === 'zh' ? t('settings.languageSwitched') : t('settings.languageSwitchedEn'),
    icon: 'success',
    duration: 1500
  })
}

function setTheme(newTheme) {
  configStore.setTheme(newTheme)
  uni.showToast({
    title: t('settings.configSaved'),
    icon: 'success',
    duration: 1500
  })
}

async function handleSave() {
  if (!config.value.enabled) {
    saveAiConfig({ enabled: false })
    testMessage.value = t('settings.aiDisabled')
    testSuccess.value = true
    return
  }
  
  const validation = validateAiConfig(config.value)
  if (!validation.valid) {
    testMessage.value = validation.message
    testSuccess.value = false
    return
  }

  try {
    saveAiConfig(config.value)
    testMessage.value = t('settings.configSaved')
    testSuccess.value = true
  } catch (error) {
    testMessage.value = t('settings.saveFailed') + error.message
    testSuccess.value = false
  }
}

async function handleTest() {
  if (!canSave.value) return

  testing.value = true
  testMessage.value = ''
  testSuccess.value = false

  try {
    // 临时保存配置用于测试（测试成功后会提示用户保存）
    const tempConfig = { ...config.value }
    saveAiConfig(tempConfig)

    const result = await callAi('请用 1 句话回复：你好', {
      maxTokens: 50
    })

    if (result) {
      testMessage.value = t('settings.connectionSuccess') + result.slice(0, 50) + '...'
      testSuccess.value = true
      // 提示用户需要保存配置
      setTimeout(() => {
        uni.showToast({
          title: t('settings.pleaseSave'),
          icon: 'none',
          duration: 2000
        })
      }, 500)
    } else {
      testMessage.value = t('settings.connectionNoContent')
      testSuccess.value = true
    }
  } catch (error) {
    testMessage.value = t('settings.connectionFailed') + error.message
    testSuccess.value = false
    // 测试失败时，恢复旧配置
    try {
      const oldConfig = uni.getStorageSync('ledger_ai_config')
      if (oldConfig) {
        saveAiConfig(JSON.parse(oldConfig))
      }
    } catch (e) {
      console.error('恢复配置失败', e)
    }
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  config.value = { ...getAiConfig() }
})
</script>

<style scoped>
.ai-settings-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 40rpx 32rpx;
  transition: background-color 0.3s ease;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-bottom: 20rpx;
}

.language-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.language-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-surface);
  border: 1rpx solid var(--border-color);
  border-radius: 12rpx;
  padding: 28rpx 32rpx;
  transition: all 0.2s;
}

.language-item:active {
  background-color: var(--bg-elevated);
}

.language-item.active {
  border-color: var(--accent);
}

.language-item text {
  font-size: 28rpx;
  color: var(--text-primary);
}

.check-mark {
  font-size: 32rpx;
  color: var(--accent);
  font-weight: 600;
}

/* Theme styles */
.theme-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background-color: var(--bg-surface);
  border: 1rpx solid var(--border-color);
  border-radius: 12rpx;
  padding: 28rpx 32rpx;
  transition: all 0.2s;
}

.theme-item:active {
  background-color: var(--bg-elevated);
}

.theme-item.active {
  border-color: var(--accent);
}

.theme-icon {
  font-size: 32rpx;
}

.theme-name {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-primary);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-surface);
  border: 1rpx solid var(--border-color);
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  transition: all 0.2s;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.label-text {
  font-size: 30rpx;
  color: var(--text-primary);
  font-weight: 500;
}

.label-desc {
  font-size: 22rpx;
  color: var(--text-secondary);
}

.provider-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.provider-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-surface);
  border: 1rpx solid var(--border-color);
  border-radius: 12rpx;
  padding: 28rpx 32rpx;
  transition: all 0.2s;
}

.provider-item:active {
  background-color: var(--bg-elevated);
}

.provider-item.active {
  border-color: var(--accent);
}

.provider-name {
  font-size: 28rpx;
  color: var(--text-primary);
}

.provider-radio {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}

.provider-item.active .provider-radio {
  border-color: var(--accent);
}

.radio-dot {
  width: 18rpx;
  height: 18rpx;
  background-color: var(--accent);
  border-radius: 50%;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  background-color: var(--input-bg);
  border: 1rpx solid var(--border-color);
  border-radius: 12rpx;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  color: var(--text-primary);
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--accent);
}

.form-input::placeholder {
  color: var(--text-muted);
}

/* 颜色选择器 */
.color-picker-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.color-input {
  flex: 1;
  background-color: var(--input-bg);
  border: 1rpx solid var(--border-color);
  border-radius: 12rpx;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  color: var(--text-primary);
  transition: all 0.2s;
}

.color-input:focus {
  border-color: var(--accent);
}

.color-preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  border: 2rpx solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.color-preview:active {
  opacity: 0.8;
  transform: scale(0.95);
}

.provider-info {
  background-color: var(--accent-soft);
  border: 1rpx solid var(--accent-border);
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-label {
  font-size: 22rpx;
  color: var(--text-secondary);
}

.info-value {
  font-size: 26rpx;
  color: var(--accent);
  font-weight: 500;
}

.info-model {
  font-size: 22rpx;
  color: var(--text-secondary);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.save-btn,
.test-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.save-btn {
  background-color: var(--accent);
  color: var(--text-inverse);
}

.save-btn[disabled] {
  opacity: 0.3;
}

.test-btn {
  background-color: transparent;
  border: 1rpx solid var(--border-color);
  color: var(--text-primary);
}

.test-btn[disabled] {
  opacity: 0.3;
}

.test-result {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background-color: var(--bg-surface);
  border-radius: 12rpx;
}

.result-text {
  font-size: 26rpx;
}

.result-text.success {
  color: var(--accent);
}

.result-text.error {
  color: var(--error);
}

.help-section {
  background-color: var(--bg-surface);
  border: 1rpx solid var(--border-color);
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
}

.help-title {
  display: block;
  font-size: 26rpx;
  color: var(--text-primary);
  margin-bottom: 16rpx;
}

.help-item {
  font-size: 22rpx;
  color: var(--text-secondary);
  line-height: 1.5;
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
</style>
