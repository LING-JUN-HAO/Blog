import type { Component } from 'vue'

// 文章頁共用的程式（[slug] 頁面、ContentRenderer 與二十幾個內文元件，各自是很小的 chunk、一層 import 一層）在瀏覽器閒置時先載好
// 手機沒有滑過連結的預載，點下去才抓的話，4G 每一層都要等一次來回，要兩秒多才開始換頁；每篇文章各自的 payload 由 prefetch-posts plugin 處理
export default defineNuxtPlugin((nuxtApp) => {
  onNuxtReady(async () => {
    // 任一篇文章的網址都對應到同一個 [slug] 頁面
    await preloadRouteComponents('/preload/')
    // MDC 內建的內文元件（ProseP、ProseH2…）是全域註冊的非同步元件，ContentRenderer 渲染到時才載入
    const components = nuxtApp.vueApp._context.components as Record<string, Component & { __asyncLoader?: () => Promise<unknown> }>
    await Promise.all([
      ...Object.entries(components)
        .filter(([name]) => name.startsWith('Prose'))
        .map(([, component]) => component.__asyncLoader?.()),
      // 自訂的內文元件不在全域清單裡，是 ContentRenderer 自己的對照表在渲染時才 import；同一個檔案在建置後是同一個 chunk
      import('~/components/content/ProseA.vue'),
      import('~/components/content/ProseImg.vue'),
      import('~/components/content/ProsePre.vue'),
      import('~/components/content/CodePen.vue'),
    ])
  })
})
