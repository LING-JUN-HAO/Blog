<script setup lang="ts">
import type { SeriesInfo } from '~/composables/usePosts'

const props = defineProps<{ series: SeriesInfo, path: string }>()

const route = useRoute()
const nuxtApp = useNuxtApp()
const { read, bookmarks } = useSeriesReading()
const { progress } = useScrollProgress()

const index = computed(() => props.series.posts.findIndex(p => p.path === props.path))
const current = computed(() => props.series.posts[index.value])
const total = computed(() => props.series.posts.length)
const readCount = computed(() => props.series.posts.filter(p => read.value[p.path]).length)

// 記錄讀到哪裡：讀到 90% 算讀完，位置給系列頁的「繼續閱讀」用
// 進度當下從 DOM 算：換頁後 useScrollProgress 的頁面高度要等 ResizeObserver 回報，剛換頁時會誤算成 100%
const saveBookmark = useThrottleFn(() => {
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (!current.value || max <= 0) return
  const value = Math.min(100, (window.scrollY / max) * 100)
  bookmarks.value = {
    ...bookmarks.value,
    [props.series.name]: { path: props.path, title: current.value.title, progress: Math.round(value) },
  }
  if (value >= 90 && !read.value[props.path]) read.value = { ...read.value, [props.path]: true }
}, 1000, true)

// 從「繼續閱讀」進來（?resume）時回到上次的位置
function resume() {
  const saved = bookmarks.value[props.series.name]
  if (route.query.resume === undefined || saved?.path !== props.path || saved.progress <= 0) return
  const max = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo({ top: (max * saved.progress) / 100, behavior: 'instant' })
}

onMounted(() => {
  resume()
  // 站內換頁時 router 會在 page:finish 後把頁面捲回頂端，要等它捲完再回到上次的位置
  nuxtApp.hooks.hookOnce('page:finish', () => {
    requestAnimationFrame(() => requestAnimationFrame(resume))
  })
  watch(progress, value => value > 0 && saveBookmark())
})
</script>

<template>
  <nav
    v-if="current"
    class="mt-6 border-y border-(--line) py-3"
    aria-label="系列文章導覽"
  >
    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
      <NuxtLink
        v-if="series.path"
        :to="series.path"
        class="font-bold hover:text-(--accent-ink)"
      >{{ series.title }}</NuxtLink>
      <span class="text-(--ink-soft) tabular-nums">
        Day {{ current.series?.day ?? index + 1 }} / {{ total }}
      </span>
    </div>
    <div
      class="mt-2 h-0.5 bg-(--line)"
      role="progressbar"
      :aria-valuenow="index + 1"
      aria-valuemin="1"
      :aria-valuemax="total"
      :aria-label="`系列第 ${index + 1} 篇，共 ${total} 篇`"
    >
      <div
        class="h-full bg-(--accent)"
        :style="{ width: `${((index + 1) / total) * 100}%` }"
      />
    </div>
    <details class="group mt-2">
      <summary class="cursor-pointer py-1 text-sm text-(--ink-soft) hover:text-(--ink)">
        系列目錄<span
          v-if="readCount"
          class="tabular-nums"
        >・已讀 {{ readCount }} / {{ total }}</span>
      </summary>
      <ol class="mt-2 grid max-h-80 gap-x-8 overflow-y-auto overscroll-contain sm:max-h-none sm:grid-cols-2">
        <li
          v-for="(item, i) in series.posts"
          :key="item.path"
        >
          <NuxtLink
            :to="item.path"
            class="series-item"
            :aria-current="item.path === path ? 'page' : undefined"
          >
            <span class="w-6 shrink-0 text-right text-(--ink-soft) tabular-nums">{{ item.series?.day ?? i + 1 }}</span>
            <span class="min-w-0 flex-1 truncate">{{ seriesEntryTitle(item.title) }}</span>
            <AppIcon
              v-if="read[item.path]"
              name="check"
              :size="14"
              class="text-(--accent-ink)"
            />
            <span
              v-if="read[item.path]"
              class="sr-only"
            >已讀</span>
          </NuxtLink>
        </li>
      </ol>
    </details>
  </nav>
</template>

<style scoped>
.series-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0;
  font-size: 0.875rem;
  color: var(--ink-soft);
  transition: color 0.15s;
}
.series-item:hover,
.series-item[aria-current='page'] {
  color: var(--ink);
}
.series-item[aria-current='page'] {
  font-weight: 700;
}
</style>
