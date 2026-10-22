<script setup lang="ts">
import type { PostSummary } from '~/composables/usePosts'

const props = defineProps<{ posts: PostSummary[] }>()

// 客戶端換頁進來時先畫前 30 篇（約兩個畫面高），其餘等瀏覽器閒置再補：一百多個連結一次建立，手機換頁那一幀會卡住
// 首次載入要跟預渲染的 HTML 一致、按上一頁回來要還原捲動位置，這兩種都整份一次畫完
const nuxtApp = useNuxtApp()
const shown = ref(import.meta.client && !nuxtApp.isHydrating && !window.history.state?.scroll ? 30 : Infinity)
onMounted(() => {
  if (shown.value === Infinity) return
  const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 300 }) : setTimeout(fn, 50))
  idle(() => {
    shown.value = Infinity
  })
})

// 篇數一律算整份清單，只有列出來的項目分段補上
const years = computed(() => {
  const map = new Map<string, { list: PostSummary[], total: number }>()
  props.posts.forEach((post, index) => {
    const year = post.date ? formatDate(post.date).slice(0, 4) : '草稿'
    const group = map.get(year) ?? { list: [], total: 0 }
    group.total++
    if (index < shown.value) group.list.push(post)
    map.set(year, group)
  })
  return [...map.entries()]
})
</script>

<template>
  <div class="space-y-12">
    <section
      v-for="[year, { list, total }] in years"
      :key="year"
      class="grid gap-x-8 md:grid-cols-[7.5rem_minmax(0,1fr)]"
    >
      <h2 class="font-display text-2xl font-bold md:sticky md:top-24 md:self-start">
        <NuxtLink
          v-if="year !== '草稿'"
          :to="`/archives/${year}/`"
          class="hover:text-(--accent-ink)"
        >{{ year }}</NuxtLink>
        <span v-else>草稿</span>
        <span class="ml-2 align-middle text-sm font-normal text-(--ink-soft)">{{ total }} 篇</span>
      </h2>
      <ol class="mt-3 md:mt-0">
        <li
          v-for="post in list"
          :key="post.path"
          class="border-b border-(--line)"
        >
          <NuxtLink
            :to="post.path"
            class="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 py-2.5 hover:text-(--accent-ink)"
          >
            <time
              v-if="post.date"
              :datetime="post.date"
              class="pt-0.5 text-sm text-(--ink-soft) tabular-nums"
            >{{ formatDate(post.date).slice(5) }}</time>
            <span v-else />
            <span>{{ post.title }}</span>
          </NuxtLink>
        </li>
      </ol>
    </section>
  </div>
</template>
