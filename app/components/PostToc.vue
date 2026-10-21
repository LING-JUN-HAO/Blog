<script setup lang="ts">
interface TocLink { id: string, text: string, depth: number, children?: TocLink[] }

defineProps<{ links: TocLink[] }>()

const activeId = useActiveHeading()
const reducedMotion = usePreferredReducedMotion()

// 平滑捲到標題（頁首的遮擋由 html 的 scroll-padding-top 處理），網址同步換成該標題的錨點
function jump(event: MouseEvent, id: string) {
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  target.scrollIntoView({ behavior: reducedMotion.value === 'reduce' ? 'auto' : 'smooth' })
  history.replaceState(history.state, '', `#${id}`)
  activeId.value = id
}
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
        :aria-current="activeId === link.id ? 'location' : undefined"
        @click="jump($event, link.id)"
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
