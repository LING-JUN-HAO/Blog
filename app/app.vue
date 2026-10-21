<script setup lang="ts">
const { blog } = useAppConfig()

// GA 等 Nuxt 就緒後再閒置 3 秒才載入，不跟首屏的圖片與 JS 搶頻寬
useScriptGoogleAnalytics({ scriptOptions: { trigger: useScriptTriggerIdleTimeout({ timeout: 3000 }) } })

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
