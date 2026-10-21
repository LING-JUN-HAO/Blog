<script setup lang="ts">
import type { PostSummary } from '~/composables/usePosts'

defineProps<{ post: PostSummary }>()
</script>

<template>
  <p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--ink-soft)">
    <span
      v-if="post.draft"
      class="rounded-[3px] bg-(--accent) px-1.5 text-xs leading-5 text-white"
    >草稿</span>
    <span
      v-if="post.date"
      class="inline-flex items-center gap-1.5"
    >
      <AppIcon
        name="calendar"
        :size="16"
      />
      <time
        :datetime="post.date"
        class="tabular-nums"
      >{{ formatDate(post.date) }}</time>
    </span>
    <span v-if="post.updated">
      更新於 <time
        :datetime="post.updated"
        class="tabular-nums"
      >{{ formatDate(post.updated) }}</time>
    </span>
    <span class="inline-flex items-center gap-1.5">
      <AppIcon
        name="clock"
        :size="16"
      />
      {{ formatCount(post.wordCount) }} 字，約 {{ post.readingTime }} 分鐘
    </span>
  </p>
</template>
