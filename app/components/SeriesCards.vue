<script setup lang="ts">
import type { SeriesInfo } from '~/composables/usePosts'

// flush：接在已經有底線的標題下方時（如分類頁的 PageHeading），不再畫上緣框線，避免兩條線疊在一起
defineProps<{ series: SeriesInfo[], flush?: boolean }>()

const { bookmarks } = useSeriesReading()
</script>

<template>
  <ol
    class="grid border-(--line) md:grid-cols-3"
    :class="{ 'border-t md:border-t-0': !flush }"
  >
    <li
      v-for="item in series"
      :key="item.name"
      class="border-b border-(--line) md:border-b-0 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0"
      :class="{ 'md:border-t': !flush }"
    >
      <NuxtLink
        :to="item.path"
        class="group block pt-5"
      >
        <span class="font-display text-3xl font-bold text-(--accent-ink) tabular-nums">{{ item.year }}</span>
        <span class="mt-2 block font-bold group-hover:underline group-hover:decoration-(--accent) group-hover:underline-offset-4">{{ item.title }}</span>
        <span class="mt-1 block text-sm text-(--ink-soft)">{{ item.posts.length }} 篇</span>
      </NuxtLink>
      <p class="min-h-5 pt-2 pb-5 text-sm">
        <NuxtLink
          v-if="bookmarks[item.name]"
          :to="{ path: bookmarks[item.name]!.path + '/', query: { resume: null } }"
          class="inline-flex items-center gap-1.5 text-(--ink-soft) hover:text-(--accent-ink)"
        >
          <AppIcon
            name="posts"
            :size="16"
          />
          繼續閱讀：{{ seriesEntryTitle(bookmarks[item.name]!.title) }}
        </NuxtLink>
      </p>
    </li>
  </ol>
</template>
