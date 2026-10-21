<script setup lang="ts">
const { blog } = useAppConfig()

useScriptGoogleAnalytics()

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
