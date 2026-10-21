<script setup lang="ts">
// GitHub 留言（Giscus）：留言存在 repo 的 GitHub Discussions，捲到留言區附近才載入
const props = defineProps<{ term: string }>()

const { giscus } = useRuntimeConfig().public
const colorMode = useColorMode()
const root = useTemplateRef('root')
const container = useTemplateRef('container')
const loaded = ref(false)
// loading → ready（iframe 回傳訊息）或 failed（腳本載入失敗、逾時，例如被廣告阻擋外掛擋掉）
const status = ref<'idle' | 'loading' | 'ready' | 'failed'>('idle')
const discussionsUrl = `https://github.com/${giscus.repo}/discussions`

const { start: startTimeout, stop: stopTimeout } = useTimeoutFn(() => {
  if (status.value === 'loading') status.value = 'failed'
}, 20_000, { immediate: false })

useEventListener('message', (event: MessageEvent) => {
  if (event.origin !== 'https://giscus.app' || !event.data?.giscus) return
  status.value = 'ready'
  stopTimeout()
})

const theme = computed(() => (colorMode.value === 'dark' ? 'dark_dimmed' : 'light'))

function load() {
  if (loaded.value || !container.value) return
  loaded.value = true
  status.value = 'loading'
  startTimeout()
  const script = document.createElement('script')
  script.onerror = () => {
    status.value = 'failed'
  }
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  const attrs: Record<string, string> = {
    'data-repo': giscus.repo,
    'data-repo-id': giscus.repoId,
    'data-category': giscus.category,
    'data-category-id': giscus.categoryId,
    // 用文章 slug 對應討論串，換網域也不會跟丟
    'data-mapping': 'specific',
    'data-term': props.term,
    'data-strict': '1',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-theme': theme.value,
    'data-lang': 'zh-TW',
    'data-loading': 'lazy',
  }
  for (const [key, value] of Object.entries(attrs)) script.setAttribute(key, value)
  container.value.appendChild(script)
}

const { stop } = useIntersectionObserver(root, ([entry]) => {
  if (!entry?.isIntersecting) return
  stop()
  load()
}, { rootMargin: '400px' })

// 切換深淺色時通知 Giscus iframe 換主題
watch(theme, (value) => {
  const frame = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: value } } }, 'https://giscus.app')
})
</script>

<template>
  <section
    ref="root"
    class="mt-16 border-t border-(--line) pt-10"
    aria-labelledby="comments-title"
  >
    <h2
      id="comments-title"
      class="mb-6 flex items-center gap-2 font-display text-xl font-bold"
    >
      <AppIcon
        name="github"
        :size="20"
      />
      留言
    </h2>
    <p
      v-if="!giscus.categoryId"
      class="text-(--ink-soft)"
    >
      留言區準備中。
    </p>
    <template v-else>
      <p
        v-if="status !== 'failed'"
        class="mb-4 text-sm text-(--ink-soft)"
      >
        留言使用 GitHub 帳號登入（Giscus），留言會存在 GitHub Discussions。
        <span v-if="status === 'loading'">留言區載入中…</span>
      </p>
      <p
        v-else
        class="text-(--ink-soft)"
        role="status"
      >
        留言區沒有載入成功，可能是網路或瀏覽器外掛擋住了 giscus.app。也可以直接到
        <a
          :href="discussionsUrl"
          target="_blank"
          rel="noopener"
          class="text-link"
        >GitHub Discussions</a>
        留言。
      </p>
      <div ref="container" />
    </template>
    <noscript>開啟 JavaScript 才能看到 GitHub 留言。</noscript>
  </section>
</template>
