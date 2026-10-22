<script setup lang="ts">
const { blog } = useAppConfig()
const route = useRoute()
const menuOpen = ref(false)
const searchOpen = useState('search-open', () => false)
const searchWarm = useState('search-warm', () => false)
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

// 點選單項目換頁時選單直接收起、不跑淡出：換頁轉場會在點下去的瞬間截下舊畫面，
// 淡到一半的選單會被截進去，等新頁面準備好的那段時間就一直停在半透明的選單上
const closingForNav = ref(false)
function closeForNav() {
  closingForNav.value = true
  menuOpen.value = false
}

// 行動版選單蓋在內容上：打開時鎖住背景捲動，內容不會被推動也不會在後面捲走
const scrollLock = useScrollLock(import.meta.client ? document.body : null)
watch(menuOpen, (open) => {
  scrollLock.value = open
  if (open) {
    closingForNav.value = false
    preloadMenu()
  }
})

// 手機沒有滑過連結的預載，點下去才抓的話要等下載完才換頁；打開選單時就先把各頁的程式與資料載好
let menuPreloaded = false
function preloadMenu() {
  if (menuPreloaded) return
  menuPreloaded = true
  for (const item of blog.menu) {
    preloadRouteComponents(item.to)
    preloadPayload(item.to)
  }
}

// 桌機的選單一直顯示著，載入完、瀏覽器閒置時就把各頁先載好，點選單不用等下載；手機等打開選單時才載，省流量
onNuxtReady(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 500))
  idle(preloadMenu)
})

// 多個選單路徑互為前綴時（鐵人賽在 /categories/ 底下），只亮最長、最具體的那一個
const activeTo = computed(() => {
  // 鐵人賽各系列的入口在「YYYY 鐵人賽」標籤頁，選單亮「鐵人賽」
  const path = decodeURI(route.path).replace(/^\/tags\/\d{4}-鐵人賽\//, '/categories/iThome-鐵人賽/')
  return blog.menu
    .map(item => item.to)
    .filter(to => path.startsWith(to))
    .sort((a, b) => b.length - a.length)[0]
})

function isActive(to: string) {
  return activeTo.value === to
}

// 平板寬度放不下全部選單時只留這幾個，其餘（鐵人賽、標籤）收進右上角的選單按鈕
const essential = new Set(['/archives/', '/categories/', '/about/'])
</script>

<template>
  <header
    ref="header"
    class="sticky top-0 z-40 border-b border-(--line) bg-(--paper)/90 backdrop-blur [view-transition-name:site-header]"
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
        <span class="font-display text-xl font-bold whitespace-nowrap">{{ blog.title }}</span>
        <span class="hidden text-sm whitespace-nowrap text-(--ink-soft) sm:inline">{{ blog.subtitle }}</span>
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
          :class="{ 'is-active': isActive(item.to), 'is-extra': !essential.has(item.to) }"
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
          @pointerenter="searchWarm = true"
          @focus="searchWarm = true"
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
          :aria-label="menuOpen ? '關閉選單' : '開啟選單'"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon :name="menuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </div>

    <Transition
      name="menu"
      :css="!closingForNav"
    >
      <div
        v-if="menuOpen"
        class="absolute inset-x-0 top-full lg:hidden"
      >
        <nav
          id="mobile-menu"
          class="relative z-10 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-(--line) bg-(--paper) px-5 pb-4 shadow-sm"
          aria-label="行動版選單"
        >
          <NuxtLink
            v-for="item in blog.menu"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 border-b border-(--line) py-3 last:border-b-0"
            :class="isActive(item.to) ? 'text-(--accent-ink)' : ''"
            @click="closeForNav"
          >
            <AppIcon
              :name="item.icon"
              :size="18"
            />
            {{ item.label }}
          </NuxtLink>
        </nav>
        <!-- header 有 backdrop-filter，裡面的 fixed 會以 header 為基準，所以遮罩用 absolute＋整個視窗高 -->
        <div
          class="menu-scrim absolute inset-x-0 top-0 h-dvh"
          aria-hidden="true"
          @click="menuOpen = false"
        />
      </div>
    </Transition>

    <SearchDialog />
  </header>
</template>

<style scoped>
.menu-scrim {
  background: rgb(8 12 22 / 0.35);
}
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.18s ease;
}
.menu-enter-active nav,
.menu-leave-active nav {
  transition: transform 0.18s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
.menu-enter-from nav,
.menu-leave-to nav {
  transform: translateY(-0.5rem);
}
.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding-block: 0.35rem;
  color: var(--ink-soft);
  white-space: nowrap;
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
/* 平板只顯示必要的選單項目，選單按鈕留著讓其他項目也找得到；桌機全部顯示 */
.nav-link.is-extra {
  display: none;
}
@media (min-width: 1024px) {
  .nav-link.is-extra {
    display: inline-flex;
  }
  .menu-btn {
    display: none;
  }
}
.tool-btn:hover {
  color: var(--ink);
  background: var(--wash);
}
</style>
