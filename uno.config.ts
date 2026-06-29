// uno.config.ts - Unocss 配置 (Tailwind CSS 兼容模式)
import { defineConfig, presetAttributify, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(), // Tailwind CSS 兼容预设
    presetAttributify(), // 属性化模式
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  theme: {
    colors: {
      // Apple 风格配色
      primary: '#000000',
      secondary: '#8E8E93',
      background: '#F9FAFB',
      card: '#FFFFFF',
      // 柔和状态色
      income: '#34C759', // 薄荷绿 - 收入
      expense: '#FF6B6B', // 珊瑚红 - 支出
      balance: '#007AFF', // 苹果蓝 - 结余
    },
    borderRadius: {
      'card': '16px',
      'button': '12px',
    }
  },
  shortcuts: {
    // 常用组合样式
    'card-base': 'bg-card rounded-card shadow-sm p-4',
    'btn-primary': 'bg-primary text-white rounded-button px-4 py-2 font-medium',
    'btn-secondary': 'bg-gray-100 text-primary rounded-button px-4 py-2',
    'text-amount': 'text-lg font-semibold',
  }
})
