<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)

const copy = computed(() => is404.value
  ? {
      title: '這片海域沒有這一頁',
      body: '網址可能打錯了，或文章已經搬家。小鯨魚還在找，你可以先回首頁，或用搜尋找找看。',
    }
  : {
      title: '海面起了點風浪',
      body: '頁面載入時發生錯誤，重新整理通常就會恢復；如果一直出現，歡迎到 GitHub 告訴我。',
    })

const searchOpen = useState('search-open', () => false)
const searchWarm = useState('search-warm', () => false)

useSeoMeta({
  title: is404.value ? '找不到頁面' : '頁面載入失敗',
  robots: 'noindex',
})
</script>

<template>
  <NuxtLayout>
    <section class="grid items-center gap-8 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:py-14">
      <div class="max-w-(--container-prose)">
        <p class="text-sm text-(--ink-soft) tabular-nums">
          錯誤代碼 {{ error.statusCode }}
        </p>
        <h1 class="mt-2 font-display text-[2rem] leading-[1.35] font-bold sm:text-[2.6rem]">
          {{ copy.title }}
        </h1>
        <SeaRule class="mt-4" />
        <p class="mt-5 text-(--ink-soft)">
          {{ copy.body }}
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/"
            class="rounded-md bg-(--ink) px-4 py-2 text-(--paper) transition-opacity hover:opacity-85"
          >
            回首頁
          </NuxtLink>
          <button
            v-if="is404"
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-(--line) px-4 py-2 transition-colors hover:bg-(--wash)"
            @pointerenter="searchWarm = true"
            @focus="searchWarm = true"
            @click="searchOpen = true"
          >
            <AppIcon
              name="search"
              :size="18"
            />
            搜尋文章
          </button>
          <a
            v-else
            href="https://github.com/LING-JUN-HAO/Blog/issues"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 rounded-md border border-(--line) px-4 py-2 transition-colors hover:bg-(--wash)"
          >
            <AppIcon
              name="github"
              :size="18"
            />
            回報問題
          </a>
        </div>
      </div>
      <div class="mx-auto aspect-square w-56 md:w-full">
        <ClientOnly>
          <LazyWhaleModel class="size-full" />
        </ClientOnly>
      </div>
    </section>
  </NuxtLayout>
</template>
