<script setup lang="ts">
// 部落格專屬的線條圖示（由 Codex 依設計規格繪製，原始檔在 app/assets/icons）
const icons = import.meta.glob<string>('~/assets/icons/*.svg', { query: '?raw', import: 'default', eager: true })

const { name, size = 20 } = defineProps<{ name: string, size?: number | string }>()

const svg = computed(() => {
  const source = Object.entries(icons).find(([path]) => path.endsWith(`/${name}.svg`))?.[1] ?? ''
  return source
    .replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1')
    .replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1')
    .replace('<svg', `<svg width="${size}" height="${size}" aria-hidden="true" focusable="false"`)
})
</script>

<template>
  <!-- 內容只來自專案內的 SVG 檔，不含使用者輸入 -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span
    class="inline-flex shrink-0"
    v-html="svg"
  />
</template>
