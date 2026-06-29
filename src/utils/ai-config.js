/**
 * AI 服务配置管理
 * 配置存储于本地，用户可自定义 AI 服务商
 */

const STORAGE_KEY = 'ledger_ai_config'

/**
 * 预设 AI 服务商模板
 */
export const AI_PROVIDERS = {
  qwen: {
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus',
    placeholder: 'sk-xxx...xxxx'
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    placeholder: 'sk-xxx...xxxx'
  },
  custom: {
    name: '自定义',
    baseUrl: '',
    model: '',
    placeholder: '输入 API Base URL'
  }
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  provider: 'qwen',
  baseUrl: AI_PROVIDERS.qwen.baseUrl,
  apiKey: '',
  model: AI_PROVIDERS.qwen.model,
  enabled: true
}

/**
 * 获取 AI 配置
 */
export function getAiConfig() {
  try {
    const stored = uni.getStorageSync(STORAGE_KEY)
    if (stored) {
      const config = JSON.parse(stored)
      return { ...DEFAULT_CONFIG, ...config }
    }
  } catch (e) {
    console.error('读取 AI 配置失败', e)
  }
  return { ...DEFAULT_CONFIG }
}

/**
 * 保存 AI 配置
 */
export function saveAiConfig(config) {
  try {
    const provider = AI_PROVIDERS[config.provider]
    const savedConfig = {
      provider: config.provider,
      baseUrl: config.baseUrl || provider?.baseUrl || '',
      apiKey: config.apiKey || '',
      model: config.model || provider?.model || '',
      enabled: config.enabled !== false
    }
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(savedConfig))
    return savedConfig
  } catch (e) {
    console.error('保存 AI 配置失败', e)
    throw e
  }
}

/**
 * 验证配置是否完整
 */
export function validateAiConfig(config) {
  if (!config.enabled) return true
  if (!config.baseUrl || !config.baseUrl.trim()) {
    return { valid: false, message: 'API Base URL 不能为空' }
  }
  if (!config.apiKey || !config.apiKey.trim()) {
    return { valid: false, message: 'API Key 不能为空' }
  }
  return { valid: true }
}

/**
 * 清除 AI 配置
 */
export function clearAiConfig() {
  try {
    uni.removeStorageSync(STORAGE_KEY)
  } catch (e) {
    console.error('清除 AI 配置失败', e)
  }
}

/**
 * 根据 provider 获取预设信息
 */
export function getProviderInfo(providerKey) {
  return AI_PROVIDERS[providerKey] || AI_PROVIDERS.custom
}
