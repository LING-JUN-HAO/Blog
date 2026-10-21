<script setup lang="ts">
const props = defineProps<{ current: number, total: number, base: string }>()

function pageLink(page: number) {
  return page === 1 ? props.base : `${props.base}page/${page}/`
}

// 頁數多時只顯示首尾與目前頁附近，中間用 … 省略，手機上才不會撐破版面
const items = computed(() => {
  const pages = new Set([1, props.total, props.current - 1, props.current, props.current + 1])
  const list = [...pages].filter(p => p >= 1 && p <= props.total).sort((a, b) => a - b)
  return list.flatMap((page, index) => (index > 0 && page - list[index - 1]! > 1 ? ['…', page] : [page]))
})
</script>

<template>
  <nav
    v-if="total > 1"
    class="mt-12 flex flex-wrap items-center gap-1"
    aria-label="分頁"
  >
    <NuxtLink
      v-if="current > 1"
      :to="pageLink(current - 1)"
      class="pager"
      aria-label="上一頁"
    >
      ‹
    </NuxtLink>
    <template
      v-for="(item, index) in items"
      :key="`${item}-${index}`"
    >
      <span
        v-if="item === '…'"
        class="px-1 text-(--ink-soft)"
        aria-hidden="true"
      >…</span>
      <NuxtLink
        v-else
        :to="pageLink(item as number)"
        class="pager"
        :class="{ 'is-current': item === current }"
        :aria-current="item === current ? 'page' : undefined"
      >
        {{ item }}
      </NuxtLink>
    </template>
    <NuxtLink
      v-if="current < total"
      :to="pageLink(current + 1)"
      class="pager"
      aria-label="下一頁"
    >
      ›
    </NuxtLink>
  </nav>
</template>

<style scoped>
.pager {
  display: grid;
  place-items: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding-inline: 0.5rem;
  border-radius: 6px;
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
  transition: color 0.15s, background 0.15s;
}
.pager:hover {
  color: var(--ink);
  background: var(--wash);
}
.pager.is-current {
  position: relative;
  color: var(--ink);
  font-weight: 700;
}
.pager.is-current::after {
  content: "";
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0.3rem;
  height: 2px;
  background: var(--accent);
}
</style>
