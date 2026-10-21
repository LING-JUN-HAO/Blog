<script setup lang="ts">
const { progress, y } = useScrollProgress()
</script>

<template>
  <button
    v-show="progress > 8"
    type="button"
    class="fixed right-4 bottom-4 z-40 grid size-11 place-items-center rounded-full border border-(--line) bg-(--paper) text-(--ink-soft) shadow-sm transition-colors hover:text-(--ink) sm:right-6 sm:bottom-6"
    aria-label="回到頂端"
    @click="y = 0"
  >
    <AppIcon name="arrow-up" />
  </button>
</template>
