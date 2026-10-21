<script setup lang="ts">
const { blog } = useAppConfig()
const { data: posts } = await usePosts()

const published = computed(() => posts.value.filter(p => !p.draft))
const stream = computed(() => latestStream(posts.value))
const total = computed(() => Math.max(1, Math.ceil(stream.value.length / blog.perPage)))
const current = computed(() => stream.value.slice(0, blog.perPage))

// 三屆鐵人賽：依年份由新到舊
const series = computed(() => groupSeries(posts.value))

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
      <!-- 手機：鯨魚在標語右上方；平板以上並排 -->
      <div class="flex flex-col-reverse items-end gap-0 sm:flex-row sm:justify-between sm:gap-4">
        <p class="self-start font-display text-[2rem] leading-[1.35] font-bold sm:self-auto sm:text-[2.75rem] lg:text-[3.25rem]">
          我是一隻前端小蝦米，<br>努力夢想有一天變成大鯨魚。
        </p>
        <ClientOnly>
          <LazyWhaleModel class="-mb-6 w-32 shrink-0 sm:-mb-4 sm:w-40 lg:w-60" />
          <template #fallback>
            <div class="-mb-6 aspect-square w-32 shrink-0 sm:-mb-4 sm:w-40 lg:w-60" />
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
      <SeriesCards :series="series" />
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
