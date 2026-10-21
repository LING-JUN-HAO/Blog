<script setup lang="ts">
import type { PostSummary } from '~/composables/usePosts'

const props = defineProps<{ posts: PostSummary[] }>()

const years = computed(() => {
  const map = new Map<string, PostSummary[]>()
  for (const post of props.posts) {
    const year = post.date ? formatDate(post.date).slice(0, 4) : '草稿'
    map.set(year, [...(map.get(year) ?? []), post])
  }
  return [...map.entries()]
})
</script>

<template>
  <div class="space-y-12">
    <section
      v-for="[year, list] in years"
      :key="year"
      class="grid gap-x-8 md:grid-cols-[7.5rem_minmax(0,1fr)]"
    >
      <h2 class="font-display text-2xl font-bold md:sticky md:top-24 md:self-start">
        <NuxtLink
          v-if="year !== '草稿'"
          :to="`/archives/${year}/`"
          class="hover:text-(--accent-ink)"
        >{{ year }}</NuxtLink>
        <span v-else>草稿</span>
        <span class="ml-2 align-middle text-sm font-normal text-(--ink-soft)">{{ list.length }} 篇</span>
      </h2>
      <ol class="mt-3 md:mt-0">
        <li
          v-for="post in list"
          :key="post.path"
          class="border-b border-(--line)"
        >
          <NuxtLink
            :to="post.path"
            class="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 py-2.5 hover:text-(--accent-ink)"
          >
            <time
              v-if="post.date"
              :datetime="post.date"
              class="pt-0.5 text-sm text-(--ink-soft) tabular-nums"
            >{{ formatDate(post.date).slice(5) }}</time>
            <span v-else />
            <span>{{ post.title }}</span>
          </NuxtLink>
        </li>
      </ol>
    </section>
  </div>
</template>
