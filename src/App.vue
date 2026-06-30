<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { useBillsStore } from '@/store/bills'
import { useConfigStore } from '@/store/config'

onLaunch(() => {
  console.log('App Launch')
  // 初始化账单数据
  const billsStore = useBillsStore()
  billsStore.loadFromStorage()
  
  // 初始化主题
  const configStore = useConfigStore()
  configStore.applyTheme(configStore.theme)
})
</script>

<style>
/* ========== 主题系统 - CSS Variables ========== */
/* 深色主题（默认） */
page[data-theme="dark"] {
  --bg-primary: #0E0E10;
  --bg-surface: #161618;
  --bg-elevated: #1C1C1F;
  --text-primary: #F0EDE6;
  --text-secondary: #8A8A8A;
  --text-muted: #3D3D3F;
  --text-inverse: #0E0E10;
  --accent: #A8C5A0;
  --accent-hover: #9AB892;
  --accent-soft: rgba(168, 197, 160, 0.1);
  --accent-border: rgba(168, 197, 160, 0.2);
  --danger: #E07070;
  --error: #E07070;
  --success: #A8C5A0;
  --warning: #D4B87E;
  --divider: rgba(255, 255, 255, 0.08);
  --shadow: rgba(0, 0, 0, 0.3);
  --input-bg: #161618;
  --border-color: rgba(255, 255, 255, 0.08);
}

/* 浅色主题 */
page[data-theme="light"] {
  --bg-primary: #FAFAF9;
  --bg-surface: #FFFFFF;
  --bg-elevated: #F5F5F4;
  --text-primary: #1C1917;
  --text-secondary: #78716C;
  --text-muted: #D6D3D1;
  --text-inverse: #FFFFFF;
  --accent: #4A7C3F;
  --accent-hover: #3D6633;
  --accent-soft: rgba(74, 124, 63, 0.1);
  --accent-border: rgba(74, 124, 63, 0.2);
  --danger: #C74B4B;
  --error: #C74B4B;
  --success: #4A7C3F;
  --warning: #B8984A;
  --divider: rgba(0, 0, 0, 0.08);
  --shadow: rgba(0, 0, 0, 0.1);
  --input-bg: #FFFFFF;
  --border-color: rgba(0, 0, 0, 0.08);
}

/* 默认应用深色主题 */
page {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 字体引入 - 实际使用时需要下载字体文件到 static/fonts/ */
@font-face {
  font-family: 'DM Serif Display';
  src: local('DM Serif Display'), local('DM Serif Display-Regular');
  font-display: swap;
}

@font-face {
  font-family: 'Space Mono';
  src: local('Space Mono'), local('SpaceMono-Regular');
  font-display: swap;
}

@font-face {
  font-family: 'DM Sans';
  src: local('DM Sans'), local('DMSans-Regular');
  font-display: swap;
}

/* 重置默认样式 */
view, text, scroll-view, swiper, swiper-item, cover-view, cover-image, icon, rich-text, image, video, camera, live-player, page-container, share-element, ad, ad-custom, map, web-view, official-account, open-data, navigation-bar {
  box-sizing: border-box;
}

button {
  border: none;
  background: none;
  outline: none;
  line-height: inherit;
}

button::after {
  border: none;
}

input, textarea {
  border: none;
  outline: none;
  background: none;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 4rpx;
  height: 4rpx;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2rpx;
}
</style>
