<script setup lang="ts">
defineProps<{ base: string, groups: { name: string, slug: string, posts: unknown[] }[] }>()
</script>

<template>
  <ul class="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
    <li
      v-for="group in groups"
      :key="group.slug"
      class="border-b border-(--line)"
    >
      <NuxtLink
        :to="`${base}${group.slug}/`"
        class="flex items-baseline justify-between gap-4 py-3 hover:text-(--accent-ink)"
      >
        <span>{{ group.name }}</span>
        <span class="text-sm text-(--ink-soft) tabular-nums">{{ group.posts.length }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>
