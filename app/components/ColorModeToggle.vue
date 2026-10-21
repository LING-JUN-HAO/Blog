<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// 用 View Transitions 讓整頁同時交叉淡入；不支援的瀏覽器直接切換
function toggle() {
  const next = isDark.value ? 'light' : 'dark'
  if (!document.startViewTransition) {
    colorMode.preference = next
    return
  }
  // 加上 theme-switching 讓 CSS 換成整頁淡入，不跑換頁的滑動動畫
  const root = document.documentElement
  root.classList.add('theme-switching')
  const transition = document.startViewTransition(async () => {
    colorMode.preference = next
    await nextTick()
  })
  transition.finished.finally(() => root.classList.remove('theme-switching'))
}
</script>

<template>
  <button
    type="button"
    :aria-label="isDark ? '切換成淺色模式' : '切換成深色模式'"
    @click="toggle"
  >
    <ClientOnly>
      <AppIcon :name="isDark ? 'sun' : 'moon'" />
      <template #fallback>
        <AppIcon name="moon" />
      </template>
    </ClientOnly>
  </button>
</template>
