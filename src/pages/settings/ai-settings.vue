<template>
  <view class="ai-settings-page">
    <view class="header">
      <text class="title">AI 服务配置</text>
      <text class="subtitle">配置你自己的 AI 服务商</text>
    </view>

    <!-- 语言选择 -->
    <view class="section">
      <text class="section-title">{{ t('settings.language') }}</text>
      <view class="language-list">
        <view
          class="language-item"
          :class="{ active: language === 'zh' }"
          @click="setLang('zh')"
        >
          <text>简体中文</text>
          <view class="check-mark" v-if="language === 'zh'">✓</view>
        </view>
        <view
          class="language-item"
          :class="{ active: language === 'en' }"
          @click="setLang('en')"
        >
          <text>English</text>
          <view class="check-mark" v-if="language === 'en'">✓</view>
        </view>
      </view>
    </view>

    <!-- 启用开关 -->
    <view class="section">
      <view class="setting-item">
        <view class="setting-label">
          <text class="label-text">启用 AI 功能</text>
          <text class="label-desc">关闭后将不使用 AI 分析</text>
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
      <text class="section-title">选择服务商</text>
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
      <text class="section-title">API 配置</text>
      
      <view class="form-item">
        <text class="form-label">API Base URL</text>
        <input
          class="form-input"
          v-model="config.baseUrl"
          :placeholder="currentProvider.placeholder"
          type="text"
        />
      </view>

      <view class="form-item">
        <text class="form-label">API Key</text>
        <input
          class="form-input"
          v-model="config.apiKey"
          :placeholder="currentProvider.placeholder"
          type="password"
        />
      </view>

      <view class="form-item">
        <text class="form-label">模型名称</text>
        <input
          class="form-input"
          v-model="config.model"
          placeholder="例如：qwen-plus"
          type="text"
        />
      </view>

      <!-- 预设信息展示 -->
      <view class="provider-info" v-if="showProviderInfo">
        <text class="info-label">当前服务商：</text>
        <text class="info-value">{{ currentProvider.name }}</text>
        <text class="info-model">模型：{{ currentProvider.model || '自定义' }}</text>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="actions">
      <button class="save-btn" :disabled="!canSave" @click="handleSave">
        保存配置
      </button>
      <button class="test-btn" :disabled="!canSave || testing" @click="handleTest">
        {{ testing ? '测试中...' : '测试连接' }}
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
      <text class="help-title">💡 如何获取 API Key</text>
      <view class="help-list">
        <text class="help-item">• 通义千问：https://dashscope.console.aliyun.com/apiKey</text>
        <text class="help-item">• DeepSeek：https://platform.deepseek.com/api_keys</text>
        <text class="help-item">• 自定义：填写任意兼容 OpenAI 格式的 API 服务</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  getAiConfig, 
  saveAiConfig, 
  validateAiConfig, 
  getProviderInfo,
  AI_PROVIDERS 
} from '@/utils/ai-config'
import { callAi } from '@/utils/ai-ledger'
import { t, setLanguage } from '@/i18n'
import { useConfigStore } from '@/store/config'

const configStore = useConfigStore()
const config = ref({ ...getAiConfig() })
const providers = ref(AI_PROVIDERS)
const testing = ref(false)
const testMessage = ref('')
const testSuccess = ref(false)
const language = ref(configStore.language)

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
    title: lang === 'zh' ? '语言已切换' : 'Language switched',
    icon: 'success',
    duration: 1500
  })
}

async function handleSave() {
  if (!config.value.enabled) {
    saveAiConfig({ enabled: false })
    testMessage.value = 'AI 功能已关闭'
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
    testMessage.value = '配置已保存'
    testSuccess.value = true
  } catch (error) {
    testMessage.value = '保存失败：' + error.message
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
      testMessage.value = '连接成功！AI 回复：' + result.slice(0, 50) + '...'
      testSuccess.value = true
      // 提示用户需要保存配置
      setTimeout(() => {
        uni.showToast({
          title: '请点击"保存配置"按钮',
          icon: 'none',
          duration: 2000
        })
      }, 500)
    } else {
      testMessage.value = '连接成功但无返回内容'
      testSuccess.value = true
    }
  } catch (error) {
    testMessage.value = '连接失败：' + error.message
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
  background-color: #0E0E10;
  padding: 40rpx 32rpx;
}

.header {
  text-align: center;
  margin-bottom: 48rpx;
}

.title {
  display: block;
  font-size: 44rpx;
  color: #F0EDE6;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.subtitle {
  font-size: 26rpx;
  color: #8A8A8A;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 26rpx;
  color: #8A8A8A;
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
  background-color: #161618;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  border-radius: 12rpx;
  padding: 28rpx 32rpx;
  transition: border-color 0.2s;
}

.language-item:active {
  background-color: rgba(255, 255, 255, 0.05);
}

.language-item.active {
  border-color: #A8C5A0;
}

.language-item text {
  font-size: 28rpx;
  color: #F0EDE6;
}

.check-mark {
  font-size: 32rpx;
  color: #A8C5A0;
  font-weight: 600;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #161618;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.label-text {
  font-size: 30rpx;
  color: #F0EDE6;
  font-weight: 500;
}

.label-desc {
  font-size: 22rpx;
  color: #3D3D3F;
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
  background-color: #161618;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  border-radius: 12rpx;
  padding: 28rpx 32rpx;
  transition: border-color 0.2s;
}

.provider-item:active {
  background-color: rgba(255, 255, 255, 0.05);
}

.provider-item.active {
  border-color: #A8C5A0;
}

.provider-name {
  font-size: 28rpx;
  color: #F0EDE6;
}

.provider-radio {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.provider-item.active .provider-radio {
  border-color: #A8C5A0;
}

.radio-dot {
  width: 18rpx;
  height: 18rpx;
  background-color: #A8C5A0;
  border-radius: 50%;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 24rpx;
  color: #8A8A8A;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background-color: #161618;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #F0EDE6;
}

.form-input:focus {
  border-color: #A8C5A0;
}

.provider-info {
  background-color: rgba(168, 197, 160, 0.1);
  border: 1rpx solid rgba(168, 197, 160, 0.2);
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-label {
  font-size: 22rpx;
  color: #8A8A8A;
}

.info-value {
  font-size: 26rpx;
  color: #A8C5A0;
  font-weight: 500;
}

.info-model {
  font-size: 22rpx;
  color: #8A8A8A;
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
  background-color: #A8C5A0;
  color: #0E0E10;
}

.save-btn[disabled] {
  opacity: 0.3;
}

.test-btn {
  background-color: transparent;
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  color: #F0EDE6;
}

.test-btn[disabled] {
  opacity: 0.3;
}

.test-result {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background-color: #161618;
  border-radius: 12rpx;
}

.result-text {
  font-size: 26rpx;
}

.result-text.success {
  color: #A8C5A0;
}

.result-text.error {
  color: #E07070;
}

.help-section {
  background-color: #161618;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
}

.help-title {
  display: block;
  font-size: 26rpx;
  color: #F0EDE6;
  margin-bottom: 16rpx;
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.help-item {
  font-size: 22rpx;
  color: #8A8A8A;
  line-height: 1.5;
}
</style>
