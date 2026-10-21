<script setup lang="ts">
const { user, id, tab = 'html,result', height = 400 } = defineProps<{
  user: string
  id: string
  tab?: string
  height?: number | string
}>()

const src = computed(() => `https://codepen.io/${user}/embed/${id}?default-tab=${encodeURIComponent(tab)}`)

// 捲到附近（300px 內）才建立 iframe：CodePen 會載入大量腳本與第三方 cookie，不讓它拖慢首屏
// 原生 loading="lazy" 的提前距離太大（上千 px），文章前段的範例仍會在載入時一起下載
const root = useTemplateRef('root')
const show = ref(false)
const { stop, resume } = useIntersectionObserver(root, ([entry]) => {
  if (!entry?.isIntersecting) return
  show.value = true
  stop()
}, { rootMargin: '300px', immediate: false })

// 首屏內的範例也等頁面 load 完、瀏覽器閒置才開始觀察，不跟封面圖與字型搶頻寬
onMounted(() => {
  const start = () => ('requestIdleCallback' in window ? requestIdleCallback(() => resume(), { timeout: 3000 }) : setTimeout(resume, 300))
  if (document.readyState === 'complete') start()
  else useEventListener(window, 'load', start, { once: true })
})
</script>

<template>
  <figure
    ref="root"
    class="overflow-hidden rounded-md border border-(--line)"
  >
    <iframe
      v-if="show"
      :src="src"
      :height="height"
      class="block w-full"
      :title="`CodePen 範例 ${id}`"
      allowfullscreen
    />
    <!-- 同高度的佔位，iframe 出現時版面不會跳動 -->
    <div
      v-else
      class="grid place-items-center bg-(--wash) text-sm text-(--ink-soft)"
      :style="{ height: `${height}px` }"
    >
      <button
        type="button"
        class="rounded border border-(--line) px-3 py-1.5 hover:text-(--ink)"
        @click="stop(); show = true"
      >
        載入 CodePen 範例
      </button>
    </div>
    <figcaption class="border-t border-(--line) px-4 py-2 text-right text-sm">
      <a
        :href="`https://codepen.io/${user}/pen/${id}`"
        target="_blank"
        rel="noopener"
        class="text-link"
      >在 CodePen 開啟</a>
    </figcaption>
  </figure>
</template>
