<script setup lang="ts">
defineProps<{ title: string, note?: string }>()
</script>

<template>
  <header class="mb-10 border-b border-(--line) pb-6">
    <h1 class="font-display text-3xl font-bold sm:text-4xl">
      {{ title }}
    </h1>
    <p
      v-if="note"
      class="mt-2 text-(--ink-soft)"
    >
      {{ note }}
    </p>
  </header>
</template>
