// src/store/config.ts - 配置 Store (管理 AI API 配置等)

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { AiConfig, ApiTestResult } from '../types/config'
import { DEFAULT_APP_CONFIG } from '../types/config'
import { getLanguage, setLanguage as i18nSetLanguage } from '../i18n'

export const useConfigStore = defineStore('config', () => {
  // ========== State ==========
  const aiConfig = ref<AiConfig>({ ...DEFAULT_APP_CONFIG.ai })
  const currency = ref<string>(DEFAULT_APP_CONFIG.currency)
  const weekStart = ref<'monday' | 'sunday'>(DEFAULT_APP_CONFIG.weekStart)
  const language = ref<string>(getLanguage())
  const theme = ref<'dark' | 'light'>('dark')
  const customBgColor = ref<string>('#0E0E10')
  const useCustomBg = ref<boolean>(false)
  
  // ========== 主题应用函数 ==========
  const applyTheme = (themeMode: 'dark' | 'light') => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.setAttribute('data-theme', themeMode)
      root.style.removeProperty('background-color')
    }
  }
  
  const applyCustomBg = (color: string) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('background-color', color, 'important')
    }
  }
  
  const applyCurrentTheme = () => {
    if (useCustomBg.value && customBgColor.value) {
      applyCustomBg(customBgColor.value)
    } else {
      applyTheme(theme.value)
    }
  }
  
  // ========== 监听主题变化并自动应用 ==========
  watch([theme, useCustomBg, customBgColor], () => {
    applyCurrentTheme()
  }, { deep: true })
  
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
  
  const setTheme = (newTheme: 'dark' | 'light') => {
    theme.value = newTheme
    useCustomBg.value = false
    applyTheme(newTheme)
  }
  
  const setCustomBgColor = (color: string) => {
    customBgColor.value = color
    if (useCustomBg.value) {
      applyCustomBg(color)
    }
  }
  
  const enableCustomBg = () => {
    useCustomBg.value = true
    applyCustomBg(customBgColor.value)
  }
  
  const disableCustomBg = () => {
    useCustomBg.value = false
    applyTheme(theme.value)
  }
  
  return {
    aiConfig, currency, weekStart, language, theme, customBgColor, useCustomBg,
    isAiEnabled, aiApiUrl, aiApiKey, aiModel, aiSystemPrompt,
    updateAiConfig, testAiConnection, resetConfig, setLanguage, setTheme,
    setCustomBgColor, enableCustomBg, disableCustomBg, applyTheme, applyCustomBg,
  }
}, {
  persist: {
    key: 'ledger-config',
    storage: {
      getItem: (key: string) => {
        if (typeof uni !== 'undefined') {
          return uni.getStorageSync(key)
        }
        return null
      },
      setItem: (key: string, value: string) => {
        if (typeof uni !== 'undefined') {
          uni.setStorageSync(key, value)
        }
      },
    },
    pick: ['aiConfig', 'currency', 'weekStart', 'language', 'theme', 'customBgColor', 'useCustomBg'],
  },
})
