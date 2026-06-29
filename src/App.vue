<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { useBillsStore } from '@/store/bills'

onLaunch(() => {
  console.log('App Launch')
  // 初始化账单数据
  const billsStore = useBillsStore()
  billsStore.loadFromStorage()
})
</script>

<style>
/* 全局 Design Tokens */
page {
  --bg-primary: #0E0E10;
  --bg-surface: #161618;
  --text-primary: #F0EDE6;
  --text-secondary: #8A8A8A;
  --text-muted: #3D3D3F;
  --accent: #A8C5A0;
  --danger: #E07070;
  --divider: rgba(255, 255, 255, 0.07);

  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
