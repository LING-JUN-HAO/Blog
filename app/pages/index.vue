<script setup lang="ts">
const { blog } = useAppConfig()
const { data: posts } = await usePosts()

const published = computed(() => posts.value.filter(p => !p.draft))
// 鐵人賽文章另有系列區塊，最新文章只列一般文章
const stream = computed(() => posts.value.filter(p => !p.canonical))
const total = computed(() => Math.max(1, Math.ceil(stream.value.length / blog.perPage)))
const current = computed(() => stream.value.slice(0, blog.perPage))

// 三屆鐵人賽：依年份由新到舊
const series = computed(() => {
  const map = new Map<string, { year: string, name: string, count: number }>()
  for (const post of published.value) {
    const tag = post.tags.find(t => /^\d{4} 鐵人賽$/.test(t))
    if (!tag) continue
    const year = tag.slice(0, 4)
    const entry = map.get(year) ?? { year, name: '', count: 0 }
    entry.count++
    map.set(year, entry)
  }
  return [...map.values()].sort((a, b) => b.year.localeCompare(a.year))
})
const SERIES_NAMES: Record<string, string> = {
  2026: 'Angular 22 Signal 進化論',
  2025: 'Line Bot × NestJS：30 天開發日記',
  2024: 'Vue 3 初學者：用實作帶你看過核心概念',
}

useSeoMeta({
  title: blog.title,
  titleTemplate: '%s',
  description: blog.description,
})
defineOgImage('Post', { title: blog.title, description: blog.description })
useSchemaOrg([defineWebPage({ '@type': 'CollectionPage' })])
</script>

<template>
  <div>
    <section class="mb-14">
      <h1 class="sr-only">
        {{ blog.title }}
      </h1>
      <div class="flex items-end justify-between gap-4">
        <p class="font-display text-[2rem] leading-[1.35] font-bold sm:text-[2.75rem] lg:text-[3.25rem]">
          我是一隻前端小蝦米，<br>努力夢想有一天變成大鯨魚。
        </p>
        <ClientOnly>
          <WhaleModel class="-mb-4 hidden w-40 shrink-0 sm:block lg:w-60" />
          <template #fallback>
            <div class="-mb-4 hidden aspect-square w-40 shrink-0 sm:block lg:w-60" />
          </template>
        </ClientOnly>
      </div>
      <SeaLine class="mt-2" />
      <p class="max-w-(--container-prose) text-(--ink-soft)">
        這裡有 {{ published.length }} 篇前端、後端與開發工具的學習筆記，從 JavaScript 基礎、TypeScript 踩坑到資料庫設計，也收錄了三屆 iThome 鐵人賽的完整系列。
      </p>
    </section>

    <section
      v-if="series.length"
      class="mb-16"
      aria-labelledby="series-title"
    >
      <h2
        id="series-title"
        class="mb-5 flex items-center gap-2 font-display text-xl font-bold"
      >
        <AppIcon
          name="ironman"
          :size="22"
          class="text-(--accent)"
        />
        iThome 鐵人賽
      </h2>
      <ol class="grid border-t border-(--line) md:grid-cols-3 md:border-t-0">
        <li
          v-for="item in series"
          :key="item.year"
          class="border-b border-(--line) md:border-t md:border-b-0 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0"
        >
          <NuxtLink
            :to="`/tags/${item.year}-鐵人賽/`"
            class="group block py-5"
          >
            <span class="font-display text-3xl font-bold text-(--accent-ink) tabular-nums">{{ item.year }}</span>
            <span class="mt-2 block font-bold group-hover:underline group-hover:decoration-(--accent) group-hover:underline-offset-4">{{ SERIES_NAMES[item.year] }}</span>
            <span class="mt-1 block text-sm text-(--ink-soft)">{{ item.count }} 篇</span>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <section aria-labelledby="latest-title">
      <h2
        id="latest-title"
        class="mb-6 font-display text-xl font-bold"
      >
        最新文章
      </h2>
      <PostList :posts="current" />
      <PagerNav
        :current="1"
        :total="total"
        base="/"
      />
    </section>
  </div>
</template>
