<script setup lang="ts">
const { progress } = useScrollProgress()
</script>

<template>
  <div
    class="fixed inset-x-0 top-0 z-50 h-0.5"
    aria-hidden="true"
  >
    <div
      class="h-full bg-(--accent)"
      :style="{ width: `${progress}%` }"
    />
  </div>
</template>
