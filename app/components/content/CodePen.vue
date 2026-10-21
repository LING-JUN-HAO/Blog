<script setup lang="ts">
const { user, id, tab = 'html,result', height = 400 } = defineProps<{
  user: string
  id: string
  tab?: string
  height?: number | string
}>()

const src = computed(() => `https://codepen.io/${user}/embed/${id}?default-tab=${encodeURIComponent(tab)}`)
</script>

<template>
  <figure class="overflow-hidden rounded-md border border-(--line)">
    <iframe
      :src="src"
      :height="height"
      class="block w-full"
      :title="`CodePen 範例 ${id}`"
      loading="lazy"
      allowfullscreen
    />
    <figcaption class="border-t border-(--line) px-4 py-2 text-right text-sm">
      <a
        :href="`https://codepen.io/${user}/pen/${id}`"
        target="_blank"
        rel="noopener"
        class="text-link"
      >在 CodePen 開啟</a>
    </figcaption>
  </figure>
</template>
