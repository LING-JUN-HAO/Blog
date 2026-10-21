<script setup lang="ts">
interface TocLink { id: string, text: string, depth: number, children?: TocLink[] }

defineProps<{ links: TocLink[] }>()

const activeId = useActiveHeading()
</script>

<template>
  <ol class="toc">
    <li
      v-for="link in links"
      :key="link.id"
    >
      <a
        :href="`#${link.id}`"
        :class="{ active: activeId === link.id }"
      >{{ link.text }}</a>
      <PostToc
        v-if="link.children?.length"
        :links="link.children"
      />
    </li>
  </ol>
</template>

<style scoped>
.toc {
  list-style: none;
  padding: 0;
}
.toc .toc {
  padding-left: 0.85rem;
}
.toc a {
  display: block;
  padding: 0.3rem 0 0.3rem 0.75rem;
  border-left: 2px solid transparent;
  color: var(--ink-soft);
  font-size: 0.875rem;
  line-height: 1.55;
  transition: color 0.15s, border-color 0.15s;
}
.toc a:hover {
  color: var(--ink);
}
.toc a.active {
  color: var(--ink);
  border-left-color: var(--accent);
}
</style>
