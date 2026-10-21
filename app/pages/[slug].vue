<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo'

const route = useRoute()
const { showDrafts } = useRuntimeConfig().public
const path = withoutTrailingSlash(route.path)

const { data: post } = await useAsyncData(`post:${path}`, async () => {
  const published = await queryCollection('posts').path(path).first()
  if (published || !showDrafts) return published
  return queryCollection('drafts' as 'posts').path(path).first()
})

if (!post.value) {
  throw createError({ statusCode: 404, message: '找不到這篇文章', fatal: true })
}

const { data: posts } = await usePosts()
const series = computed(() => post.value?.series && groupSeries(posts.value).find(s => s.name === post.value!.series!.name))
// 系列文章依 Day 前後，其他文章依發表時間
const neighbours = computed(() => {
  if (series.value) {
    const index = series.value.posts.findIndex(p => p.path === path)
    return { older: series.value.posts[index - 1], newer: series.value.posts[index + 1] }
  }
  const index = posts.value.findIndex(p => p.path === path)
  return { newer: posts.value[index - 1], older: posts.value[index + 1] }
})

// 客戶端換頁進長文時先畫前面一段，其餘等瀏覽器閒置再補：換頁那一幀不必一次渲染整篇（手機上要好幾百毫秒）
// 首次載入要跟預渲染的 HTML 一致、按上一頁回來要還原捲動位置，這兩種都整篇一次畫完
const nuxtApp = useNuxtApp()
const shownBlocks = ref(import.meta.client && !nuxtApp.isHydrating && !window.history.state?.scroll ? 12 : Infinity)
const rendered = computed(() => {
  const current = post.value!
  if (shownBlocks.value >= current.body.value.length) return current
  return { ...current, body: { ...current.body, value: current.body.value.slice(0, shownBlocks.value) } }
})
onMounted(() => {
  const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 300 }) : setTimeout(fn, 50))
  const more = () => {
    shownBlocks.value = shownBlocks.value < 40 ? 40 : Infinity
    if (shownBlocks.value !== Infinity) idle(more)
  }
  if (shownBlocks.value !== Infinity) idle(more)
})

// 回文章列表：從站內的列表頁（首頁、彙整、分類、標籤）點進來時直接回上一頁，回到原本捲到的位置；
// 從外部連結或搜尋引擎直接進來時，到文章彙整頁
const router = useRouter()
function backToList(event: MouseEvent) {
  const back = import.meta.client ? window.history.state?.back : undefined
  if (typeof back !== 'string' || !/^\/($|archives\/|categories\/|tags\/|page\/)/.test(back)) return
  event.preventDefault()
  router.back()
}

// 文章開頭的封面圖常是 LCP：在 head 預先載入（HTML 前段有大量字型宣告，等解析到 body 才發現會太晚），
// ProseImg 對它用高優先序立即載入，其餘圖片 lazy
const cover = coverImage(post.value.body)
provide('prose-img-cover', cover)
if (cover) {
  useHead({
    link: [{
      key: 'cover-image',
      rel: 'preload',
      as: 'image',
      href: optimizeImage(cover, 1600),
      imagesrcset: imageSrcset(cover),
      imagesizes: '(min-width: 50rem) 50rem, 100vw',
      fetchpriority: 'high',
    }],
  })
}

const toc = computed(() => post.value?.body?.toc?.links ?? [])

// 相關文章：上一篇與下一篇已經在上方，不重複推薦
const related = computed(() => relatedPosts(post.value!, posts.value, [neighbours.value.older?.path, neighbours.value.newer?.path].filter(p => p !== undefined)))

const mainCategory = post.value.categories[0]

// 轉載文章（如 iThome 鐵人賽）以原文為正本
if (post.value.canonical) {
  useHead({ link: [{ rel: 'canonical', href: post.value.canonical, key: 'canonical' }] })
}

useSeoMeta({
  title: post.value.title,
  description: post.value.description,
  ogType: 'article',
  articlePublishedTime: post.value.date,
  articleModifiedTime: post.value.updated ?? post.value.date,
  articleTag: post.value.tags,
  articleSection: post.value.categories[0],
  ...(post.value.draft && { robots: 'noindex, nofollow' }),
})
useSchemaOrg([
  defineArticle({
    '@type': 'BlogPosting',
    'headline': post.value.title,
    'description': post.value.description,
    'datePublished': post.value.date,
    'dateModified': post.value.updated ?? post.value.date,
    'keywords': post.value.tags,
    'articleSection': post.value.categories,
    'inLanguage': 'zh-TW',
    'wordCount': post.value.wordCount,
    'timeRequired': `PT${post.value.readingTime}M`,
    ...(post.value.canonical && { isBasedOn: post.value.canonical }),
    ...(post.value.series && { isPartOf: { '@type': 'CreativeWorkSeries', 'name': post.value.series.name, 'url': post.value.series.url } }),
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: '首頁', item: '/' },
      ...(mainCategory ? [{ name: mainCategory, item: `/categories/${slugize(mainCategory)}/` }] : []),
      { name: post.value.title },
    ],
  }),
])
defineOgImage('Post', {
  title: post.value.title,
  description: post.value.description,
  tags: post.value.tags,
})
</script>

<template>
  <div
    v-if="post"
    class="grid gap-12 xl:grid-cols-[minmax(0,1fr)_15rem]"
  >
    <article class="min-w-0">
      <header class="max-w-(--container-prose)">
        <div class="mb-5 flex items-center justify-between gap-4 text-sm text-(--ink-soft)">
          <nav aria-label="麵包屑">
            <ol class="flex flex-wrap items-center gap-2">
              <li>
                <NuxtLink
                  to="/"
                  class="hover:text-(--ink)"
                >首頁</NuxtLink>
              </li>
              <template v-if="mainCategory">
                <li aria-hidden="true">
                  /
                </li>
                <li>
                  <NuxtLink
                    :to="`/categories/${slugize(mainCategory)}/`"
                    class="hover:text-(--ink)"
                  >{{ mainCategory }}</NuxtLink>
                </li>
              </template>
            </ol>
          </nav>
          <NuxtLink
            to="/archives/"
            class="back-link shrink-0"
            @click="backToList"
          >
            <AppIcon
              name="posts"
              :size="16"
            />
            回文章列表
          </NuxtLink>
        </div>
        <h1
          class="w-fit font-display text-[1.9rem] leading-[1.35] font-bold sm:text-[2.4rem]"
          :style="{ viewTransitionName: titleTransitionName(path) }"
        >
          {{ post.title }}
        </h1>
        <SeaRule class="mt-4" />
        <PostMeta
          :post="post"
          class="mt-4"
        />
        <p
          v-if="post.canonical || post.series"
          class="mt-6 border-l-[3px] border-(--accent) py-1 pl-4 text-[0.95rem] text-(--ink-soft)"
        >
          <template v-if="post.series">
            <a
              v-if="post.series.url"
              :href="post.series.url"
              target="_blank"
              rel="noopener"
              class="text-link"
            >{{ post.series.name }}</a>
            <span v-else>{{ post.series.name }}</span>。
          </template>
          <template v-if="post.canonical">
            原文發表於 <a
              :href="post.canonical"
              target="_blank"
              rel="noopener"
              class="text-link"
            >iThome</a>，也可以在下方留言。
          </template>
        </p>
        <SeriesNav
          v-if="series"
          :series="series"
          :path="path"
        />
      </header>

      <!-- 系列文章的目錄直接接在系列導覽下面，共用分隔線，不另外留白 -->
      <details
        v-if="toc.length"
        class="max-w-(--container-prose) border-(--line) py-3 xl:hidden"
        :class="series ? 'border-b' : 'mt-8 border-y'"
      >
        <summary class="cursor-pointer text-sm text-(--ink-soft)">
          文章目錄
        </summary>
        <PostToc
          :links="toc"
          class="mt-2"
        />
      </details>

      <ContentRenderer
        :value="rendered"
        class="prose mt-10 max-w-(--container-prose)"
      />

      <footer class="mt-16 max-w-(--container-prose) space-y-12">
        <p
          v-if="post.tags.length"
          class="flex flex-wrap gap-x-4 gap-y-1"
        >
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag"
            :to="`/tags/${slugize(tag)}/`"
            class="tag"
          >{{ tag }}</NuxtLink>
        </p>

        <nav
          class="grid border-y border-(--line) sm:grid-cols-2"
          aria-label="上一篇與下一篇"
        >
          <NuxtLink
            v-if="neighbours.older"
            :to="neighbours.older.path"
            class="neighbour"
          >
            <span class="text-sm text-(--ink-soft)">上一篇</span>
            <span class="line-clamp-2 font-bold">{{ neighbours.older.title }}</span>
          </NuxtLink>
          <span v-else />
          <NuxtLink
            v-if="neighbours.newer"
            :to="neighbours.newer.path"
            class="neighbour sm:border-l sm:border-(--line) sm:text-right"
          >
            <span class="text-sm text-(--ink-soft)">下一篇</span>
            <span class="line-clamp-2 font-bold">{{ neighbours.newer.title }}</span>
          </NuxtLink>
        </nav>

        <p>
          <NuxtLink
            to="/archives/"
            class="back-link"
            @click="backToList"
          >
            <AppIcon
              name="posts"
              :size="16"
            />
            回文章列表
          </NuxtLink>
        </p>

        <section
          v-if="related.length"
          aria-labelledby="related-title"
        >
          <h2
            id="related-title"
            class="mb-3 font-display text-xl font-bold"
          >
            相關文章
          </h2>
          <ul>
            <li
              v-for="item in related"
              :key="item.path"
              class="border-b border-(--line)"
            >
              <NuxtLink
                :to="item.path"
                class="block py-3 hover:text-(--accent-ink)"
              >
                {{ item.title }}
              </NuxtLink>
            </li>
          </ul>
        </section>
      </footer>

      <GiscusComments
        v-if="!post.draft"
        :term="path.slice(1)"
        class="max-w-(--container-prose)"
      />
    </article>

    <aside
      v-if="toc.length"
      class="hidden xl:block"
    >
      <div class="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto">
        <p class="mb-2 pl-3.5 text-sm font-bold">
          目錄
        </p>
        <PostToc :links="toc" />
      </div>
    </aside>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  color: var(--ink-soft);
  transition: color 0.15s;
}
.back-link:hover {
  color: var(--accent-ink);
}
.neighbour {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1rem 0;
  transition: color 0.15s;
}
.neighbour:hover {
  color: var(--accent-ink);
}
@media (min-width: 640px) {
  .neighbour {
    padding: 1.1rem 1.25rem;
  }
  .neighbour:first-child {
    padding-left: 0;
  }
  .neighbour:last-child {
    padding-right: 0;
  }
}
</style>
