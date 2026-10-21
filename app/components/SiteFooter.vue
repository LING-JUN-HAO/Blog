<script setup lang="ts">
const { blog } = useAppConfig()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-(--line) text-sm text-(--ink-soft)">
    <div class="mx-auto max-w-(--container-site) px-5 sm:px-8">
      <div class="flex items-start gap-4 py-10">
        <img
          :src="blog.avatar"
          :alt="blog.author"
          width="56"
          height="56"
          loading="lazy"
          class="size-14 shrink-0 rounded-full object-cover"
        >
        <div>
          <p class="font-display text-base font-bold text-(--ink)">
            {{ blog.author }}
          </p>
          <p class="mt-1 max-w-md">
            {{ blog.description }}。在這裡記錄前端、後端與工具的學習筆記，也收錄三屆 iThome 鐵人賽的系列文。
          </p>
          <p class="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            <a
              v-for="item in blog.social"
              :key="item.href"
              :href="item.href"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1.5 hover:text-(--ink)"
            >
              <AppIcon
                :name="item.icon"
                :size="16"
              />
              {{ item.label }}
            </a>
          </p>
        </div>
      </div>
    </div>
    <!-- 分隔線和上方的 border-t 一樣橫跨整個寬度，內容才收進版心 -->
    <div class="border-t border-(--line)">
      <div class="mx-auto flex max-w-(--container-site) flex-col-reverse gap-2 px-5 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:px-8">
        <p>
          © 2023–{{ year }} {{ blog.author }}
        </p>
        <a
          href="/rss.xml"
          class="inline-flex items-center gap-1.5 hover:text-(--ink)"
        >
          <AppIcon
            name="rss"
            :size="16"
          />
          RSS 訂閱
        </a>
      </div>
    </div>
  </footer>
</template>
