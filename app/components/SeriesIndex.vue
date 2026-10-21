<script setup lang="ts">
import type { SeriesInfo } from '~/composables/usePosts'

const props = defineProps<{ series: SeriesInfo }>()

const { read, bookmarks } = useSeriesReading()

const first = computed(() => props.series.posts[0])
const bookmark = computed(() => bookmarks.value[props.series.name])
const readCount = computed(() => props.series.posts.filter(p => read.value[p.path]).length)
</script>

<template>
  <div>
    <section class="max-w-(--container-prose)">
      <p
        v-if="first?.description"
        class="text-(--ink-soft)"
      >
        {{ first.description }}
      </p>
      <p class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <NuxtLink
          v-if="bookmark"
          :to="{ path: `${bookmark.path}/`, query: { resume: null } }"
          class="series-action"
        >
          <AppIcon
            name="posts"
            :size="18"
          />
          繼續閱讀：{{ seriesEntryTitle(bookmark.title) }}
        </NuxtLink>
        <NuxtLink
          v-else-if="first"
          :to="first.path"
          class="series-action"
        >
          <AppIcon
            name="posts"
            :size="18"
          />
          從 Day 1 開始讀
        </NuxtLink>
        <a
          v-if="series.url"
          :href="series.url"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 text-sm text-(--ink-soft) hover:text-(--ink)"
        >
          iThome 系列頁
          <AppIcon
            name="external"
            :size="14"
          />
        </a>
        <span
          v-if="readCount"
          class="text-sm text-(--ink-soft) tabular-nums"
        >已讀 {{ readCount }} / {{ series.posts.length }}</span>
      </p>
    </section>

    <ol class="mt-10 grid border-t border-(--line) md:grid-cols-2 md:gap-x-10">
      <li
        v-for="(post, i) in series.posts"
        :key="post.path"
        class="border-b border-(--line)"
      >
        <NuxtLink
          :to="post.path"
          class="group flex items-baseline gap-4 py-3.5"
        >
          <span class="w-8 shrink-0 font-display text-lg font-bold text-(--accent-ink) tabular-nums">{{ String(post.series?.day ?? i + 1).padStart(2, '0') }}</span>
          <span
            class="min-w-0 flex-1 group-hover:underline group-hover:decoration-(--accent) group-hover:underline-offset-4"
            :style="{ viewTransitionName: titleTransitionName(post.path) }"
          >{{ seriesEntryTitle(post.title) }}</span>
          <AppIcon
            v-if="read[post.path]"
            name="check"
            :size="16"
            class="self-center text-(--accent-ink)"
          />
          <span
            v-if="read[post.path]"
            class="sr-only"
          >已讀</span>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.series-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 0.15rem;
  font-weight: 700;
  transition: color 0.15s;
}
.series-action:hover {
  color: var(--accent-ink);
}
</style>
