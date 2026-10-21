<script setup lang="ts">
const props = defineProps<{ href?: string, target?: string }>()

// 站外連結開新分頁（沿用 Hexo 的 external_link 設定）
const isExternal = computed(() => /^https?:\/\//.test(props.href ?? ''))
</script>

<template>
  <a
    v-if="isExternal"
    :href="href"
    target="_blank"
    rel="noopener"
  ><slot /><AppIcon
    name="external"
    :size="14"
    class="external-icon"
  /></a>
  <NuxtLink
    v-else
    :to="href"
    :target="target"
  >
    <slot />
  </NuxtLink>
</template>

<style scoped>
.external-icon {
  margin-left: 0.15em;
  vertical-align: 0.05em;
  opacity: 0.7;
}
</style>
