<script setup lang="ts">
const { blog } = useAppConfig()
const { data: posts } = await usePosts()

const published = computed(() => posts.value.filter(p => !p.draft))
const stream = computed(() => latestStream(posts.value))
const total = computed(() => Math.max(1, Math.ceil(stream.value.length / blog.perPage)))
const current = computed(() => stream.value.slice(0, blog.perPage))

// 三屆鐵人賽：依年份由新到舊
const series = computed(() => groupSeries(posts.value))

// 鯨魚浮在海浪線上，在整條海面上來回游、也能拖著走：激起的漣漪交給 SeaLine 從鯨魚目前的位置盪開，鯨魚自己的小片海面關掉
const whaleBox = useTemplateRef('whaleBox')
const seaLine = useTemplateRef('seaLine')
const hero = useTemplateRef('hero')
const whale = useTemplateRef('whale')
const whaleAnchor = computed(() => whale.value?.el ?? whaleBox.value)
function onWhaleRipple(strength: number, delay: number) {
  seaLine.value?.ripple(strength, delay)
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
      <!-- 鯨魚游在標語下方的海浪線裡（同一格疊在 SeaLine 後面） -->
      <div
        ref="hero"
        class="grid grid-cols-1"
      >
        <p class="col-start-1 row-start-1 font-display text-[2rem] leading-[1.35] font-bold sm:text-[2.75rem] lg:text-[3.25rem]">
          我是一隻前端小蝦米，<br>努力夢想有一天變成大鯨魚。
        </p>
        <!-- 尺寸放在外層：Lazy 元件下載期間 ClientOnly 裡是空的，佔位不能跟著塌掉（會整個首屏位移） -->
        <div
          ref="whaleBox"
          class="col-start-1 row-start-2 -mt-7 mr-5 aspect-square w-36 shrink-0 justify-self-end sm:mt-0 sm:w-56 lg:w-64"
        >
          <ClientOnly>
            <LazyWhaleModel
              ref="whale"
              class="size-full"
              :sea="false"
              :swim="hero"
              @ripple="onWhaleRipple"
            />
          </ClientOnly>
        </div>
        <!-- 海浪線就是鯨魚浮著的海面，畫在鯨魚前面、線下的水蓋住泡在水裡的半身；不攔截指標，鯨魚仍點得到、拖得動。
             海面落在鯨魚畫布約 70% 的高度（和手機版一樣）；平板以上鯨魚從這一列頂端開始，水柱才不會蓋到標語 -->
        <SeaLine
          ref="seaLine"
          :anchor="whaleAnchor"
          class="pointer-events-none relative col-start-1 row-start-2 mt-2 self-start sm:mt-[6.3rem] lg:mt-[7.7rem]"
        />
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
