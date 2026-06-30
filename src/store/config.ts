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
  const theme = ref<'dark' | 'light' | 'auto'>('dark')
  
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
  
  const setTheme = (newTheme: 'dark' | 'light' | 'auto') => {
    theme.value = newTheme
    applyTheme(newTheme)
  }
  
  const applyTheme = (themeMode: 'dark' | 'light' | 'auto') => {
    // 获取系统主题偏好
    const getSystemTheme = (): 'dark' | 'light' => {
      try {
        // H5 环境
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        // uni-app 环境
        if (typeof uni !== 'undefined' && uni.getSystemInfoSync) {
          const info = uni.getSystemInfoSync()
          return info.theme === 'dark' ? 'dark' : 'light'
        }
      } catch (e) {
        console.warn('无法获取系统主题', e)
      }
      return 'dark' // 默认深色
    }
    
    // 确定最终主题
    const effectiveTheme = themeMode === 'auto' ? getSystemTheme() : themeMode
    
    // 设置 CSS 变量
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (effectiveTheme === 'dark') {
        root.setAttribute('data-theme', 'dark')
      } else {
        root.setAttribute('data-theme', 'light')
      }
    }
    
    // 监听系统主题变化（仅在 auto 模式下）
    if (themeMode === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', newTheme)
      }
      mediaQuery.addEventListener('change', handler)
    }
  }
  
  return {
    aiConfig, currency, weekStart, language, theme,
    isAiEnabled, aiApiUrl, aiApiKey, aiModel, aiSystemPrompt,
    updateAiConfig, testAiConnection, resetConfig, setLanguage, setTheme, applyTheme,
  }
}, {
  persist: {
    key: 'ledger-config',
    storage: {
      getItem: (key: string) => uni.getStorageSync(key),
      setItem: (key: string, value: string) => uni.setStorageSync(key, value),
    },
    pick: ['aiConfig', 'currency', 'weekStart', 'language', 'theme'],
  },
})
