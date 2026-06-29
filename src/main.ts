import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import { initI18n } from './i18n'

export function createApp() {
  // 初始化多语言
  initI18n()
  
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  // 注册持久化插件
  pinia.use(piniaPluginPersistedstate)
  
  app.use(pinia)
  
  return {
    app,
    pinia,
  }
}
