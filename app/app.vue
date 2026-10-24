<script setup lang="ts">
const { blog } = useAppConfig()

// GA 等網頁字型下載完、瀏覽器閒置時才載入：手機剛開頁的幾秒網路被字型佔滿，這時點文章要下載的資料不能再被 GA 的 177KB 擠到
useScriptGoogleAnalytics({
  scriptOptions: {
    trigger: import.meta.client
      ? new Promise<void>(resolve => onNuxtReady(() => fontsSettled().then(() => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout: 3000 }) : setTimeout(resolve, 300)))))
      : 'manual',
  },
})

// 文章清單每一頁都要用（見 usePosts），跟頁面的 payload 一起先開始下載，不必等程式跑到才抓
useHead({ link: [{ key: 'posts', rel: 'preload', as: 'fetch', href: postsURL(), crossorigin: 'anonymous', fetchpriority: 'high' }] })

useSeoMeta({
  ogLocale: 'zh_TW',
  ogSiteName: blog.title,
  // 讓 X／Twitter 分享時顯示大張 OG 圖
  twitterCard: 'summary_large_image',
  author: blog.author,
})
</script>

<template>
  <NuxtLoadingIndicator color="#f7508a" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
