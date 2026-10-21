<script setup lang="ts">
import type { PostSummary } from '~/composables/usePosts'

defineProps<{ posts: PostSummary[] }>()

// 列表只放有區辨力的標籤：去掉和分類同名、以及「YYYY 鐵人賽」這類系列標籤
function listTags(post: PostSummary) {
  return post.tags.filter(tag => !post.categories.includes(tag) && !/鐵人賽$/.test(tag)).slice(0, 3)
}
</script>

<template>
  <ol class="divide-y divide-(--line)">
    <li
      v-for="post in posts"
      :key="post.path"
      class="group grid gap-x-8 py-7 first:pt-0 md:grid-cols-[7.5rem_minmax(0,1fr)]"
    >
      <time
        v-if="post.date"
        :datetime="post.date"
        class="text-sm text-(--ink-soft) tabular-nums md:pt-1.5"
      >{{ formatDate(post.date) }}</time>
      <span
        v-else
        class="text-sm text-(--accent-ink) md:pt-1.5"
      >草稿</span>
      <div class="min-w-0">
        <h2 class="w-fit font-display text-[1.35rem] leading-snug font-bold">
          <NuxtLink
            :to="post.path"
            class="decoration-(--accent) decoration-2 underline-offset-[0.3em] group-hover:underline"
            @click="nameTransitionTitle(($event.currentTarget as HTMLElement).parentElement, post.path)"
          >
            {{ post.title }}
          </NuxtLink>
        </h2>
        <p
          v-if="post.description"
          class="mt-2 line-clamp-2 text-(--ink-soft)"
        >
          {{ post.description }}
        </p>
        <p class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <NuxtLink
            v-for="category in post.categories.slice(0, 1)"
            :key="category"
            :to="`/categories/${slugize(category)}/`"
            class="text-sm text-(--ink)"
          >{{ category }}</NuxtLink>
          <NuxtLink
            v-for="tag in listTags(post)"
            :key="tag"
            :to="`/tags/${slugize(tag)}/`"
            class="tag"
          >{{ tag }}</NuxtLink>
          <span class="inline-flex items-center gap-1.5 text-sm text-(--ink-soft)">
            <AppIcon
              name="clock"
              :size="16"
            />
            {{ post.readingTime }} 分鐘
          </span>
        </p>
      </div>
    </li>
  </ol>
</template>
