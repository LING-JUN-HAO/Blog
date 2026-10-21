<script setup lang="ts">
const { blog } = useAppConfig()
const route = useRoute()
const menuOpen = ref(false)
const searchOpen = useState('search-open', () => false)
const header = useTemplateRef('header')

onClickOutside(header, () => {
  menuOpen.value = false
})
onKeyStroke('Escape', () => {
  menuOpen.value = false
})
watch(() => route.fullPath, () => {
  menuOpen.value = false
})

// 多個選單路徑互為前綴時（鐵人賽在 /categories/ 底下），只亮最長、最具體的那一個
const activeTo = computed(() => {
  const path = decodeURI(route.path)
  return blog.menu
    .map(item => item.to)
    .filter(to => path.startsWith(to))
    .sort((a, b) => b.length - a.length)[0]
})

function isActive(to: string) {
  return activeTo.value === to
}
</script>

<template>
  <header
    ref="header"
    class="sticky top-0 z-40 border-b border-(--line) bg-(--paper)/90 backdrop-blur"
  >
    <div class="mx-auto flex h-16 max-w-(--container-site) items-center gap-6 px-5 sm:px-8">
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5"
      >
        <img
          src="/images/logo.svg"
          alt=""
          width="34"
          height="30"
          class="h-7.5 w-auto dark:hidden"
        >
        <img
          src="/images/logo-dark.svg"
          alt=""
          width="34"
          height="30"
          class="hidden h-7.5 w-auto dark:block"
        >
        <span class="font-display text-xl font-bold">{{ blog.title }}</span>
        <span class="hidden text-sm text-(--ink-soft) sm:inline">{{ blog.subtitle }}</span>
      </NuxtLink>

      <nav
        class="ml-auto hidden items-center gap-6 text-[0.95rem] md:flex"
        aria-label="主選單"
      >
        <NuxtLink
          v-for="item in blog.menu"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ 'is-active': isActive(item.to) }"
        >
          <AppIcon
            :name="item.icon"
            :size="18"
            class="hidden lg:inline-flex"
          />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-1 md:ml-2">
        <button
          type="button"
          class="tool-btn"
          aria-label="搜尋文章"
          @click="searchOpen = true"
        >
          <AppIcon name="search" />
        </button>
        <ColorModeToggle class="tool-btn" />
        <button
          type="button"
          class="tool-btn menu-btn"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          aria-label="開啟選單"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon :name="menuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </div>

    <nav
      v-if="menuOpen"
      id="mobile-menu"
      class="border-t border-(--line) px-5 pb-4 md:hidden"
      aria-label="行動版選單"
    >
      <NuxtLink
        v-for="item in blog.menu"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 border-b border-(--line) py-3 last:border-b-0"
        :class="isActive(item.to) ? 'text-(--accent-ink)' : ''"
      >
        <AppIcon
          :name="item.icon"
          :size="18"
        />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <SearchDialog />
  </header>
</template>

<style scoped>
.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding-block: 0.35rem;
  color: var(--ink-soft);
  transition: color 0.15s;
}
.nav-link:hover,
.nav-link.is-active {
  color: var(--ink);
}
.nav-link.is-active {
  box-shadow: 0 2px 0 var(--accent);
}
.tool-btn {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
  color: var(--ink-soft);
  transition: color 0.15s, background 0.15s;
}
@media (min-width: 768px) {
  .menu-btn {
    display: none;
  }
}
.tool-btn:hover {
  color: var(--ink);
  background: var(--wash);
}
</style>
