// src/store/config.ts - 配置 Store (管理 AI API 配置等)

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AiConfig, ApiTestResult } from '../types/config'
import { DEFAULT_APP_CONFIG } from '../types/config'
import { getLanguage, setLanguage as i18nSetLanguage } from '../i18n'

export const useConfigStore = defineStore('config', () => {
  // ========== State ==========
  const aiConfig = ref<AiConfig>({ ...DEFAULT_APP_CONFIG.ai })
  const currency = ref<string>(DEFAULT_APP_CONFIG.currency)
  const weekStart = ref<'monday' | 'sunday'>(DEFAULT_APP_CONFIG.weekStart)
  const language = ref<string>(getLanguage())
  
  // ========== Getters ==========
  const isAiEnabled = computed(() => aiConfig.value.isEnabled && !!aiConfig.value.apiKey)
  const aiApiUrl = computed(() => aiConfig.value.apiUrl)
  const aiApiKey = computed(() => aiConfig.value.apiKey)
  const aiModel = computed(() => aiConfig.value.model)
  const aiSystemPrompt = computed(() => aiConfig.value.systemPrompt)
  
  // ========== Actions ==========
  const updateAiConfig = (config: Partial<AiConfig>) => {
    aiConfig.value = { ...aiConfig.value, ...config }
  }
  
  const testAiConnection = async (): Promise<ApiTestResult> => {
    const { apiUrl, apiKey, model } = aiConfig.value
    
    if (!apiUrl || !apiKey) {
      return { success: false, message: '请先填写 API URL 和 API Key' }
    }
    
    try {
      const response = await uni.request({
        url: apiUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello, please respond with "OK" to confirm connection.' }
          ],
          max_tokens: 10,
        },
        timeout: 10000,
      })
      
      if (response.statusCode === 200) {
        return { success: true, message: '连接成功！', model }
      }
      return { success: false, message: `API 返回错误：${response.statusCode}` }
    } catch (error: any) {
      return { success: false, message: `连接失败：${error.message || '未知错误'}` }
    }
  }
  
  const resetConfig = () => {
    aiConfig.value = { ...DEFAULT_APP_CONFIG.ai }
    currency.value = DEFAULT_APP_CONFIG.currency
    weekStart.value = DEFAULT_APP_CONFIG.weekStart
  }
  
  const setLanguage = (lang: string) => {
    language.value = lang
    i18nSetLanguage(lang)
  }
  
  return {
    aiConfig, currency, weekStart, language,
    isAiEnabled, aiApiUrl, aiApiKey, aiModel, aiSystemPrompt,
    updateAiConfig, testAiConnection, resetConfig, setLanguage,
  }
}, {
  persist: {
    key: 'ledger-config',
    storage: {
      getItem: (key: string) => uni.getStorageSync(key),
      setItem: (key: string, value: string) => uni.setStorageSync(key, value),
    },
    pick: ['aiConfig', 'currency', 'weekStart', 'language'],
  },
})
