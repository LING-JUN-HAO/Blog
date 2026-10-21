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
      <!-- 手機：鯨魚游在標語下方的海浪線裡（同一格疊在 SeaLine 後面），標語上方不留空；平板以上標語與鯨魚並排 -->
      <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] sm:gap-x-4">
        <p class="col-start-1 row-start-1 font-display text-[2rem] leading-[1.35] font-bold sm:self-end sm:text-[2.75rem] lg:text-[3.25rem]">
          我是一隻前端小蝦米，<br>努力夢想有一天變成大鯨魚。
        </p>
        <!-- 尺寸放在外層：Lazy 元件下載期間 ClientOnly 裡是空的，佔位不能跟著塌掉（會整個首屏位移） -->
        <div class="col-start-1 row-start-2 -mt-4 aspect-square w-28 shrink-0 justify-self-end sm:col-start-2 sm:row-start-1 sm:-mb-4 sm:mt-0 sm:w-40 lg:w-60">
          <ClientOnly>
            <LazyWhaleModel class="size-full" />
          </ClientOnly>
        </div>
        <!-- 手機版海浪線畫在鯨魚前面，像鯨魚半身泡在浪裡；不攔截點擊，鯨魚仍點得到 -->
        <SeaLine class="pointer-events-none relative col-start-1 row-start-2 mt-2 self-start sm:pointer-events-auto sm:col-span-2" />
      </div>
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
