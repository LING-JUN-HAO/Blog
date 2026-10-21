<script setup lang="ts">
const { blog } = useAppConfig()
const { data: page } = await useAsyncData('page:about', () => queryCollection('pages').path('/about').first())

if (!page.value) {
  throw createError({ statusCode: 404, message: '找不到頁面', fatal: true })
}

useSeoMeta({ title: page.value.title, description: page.value.description })
defineOgImage('Post', { title: page.value.title, description: page.value.description })
useSchemaOrg([defineWebPage({ '@type': 'ProfilePage' })])
</script>

<template>
  <article
    v-if="page"
    class="max-w-(--container-prose)"
  >
    <header class="mb-10 flex items-center gap-5 border-b border-(--line) pb-8">
      <img
        :src="blog.avatar"
        :alt="blog.author"
        width="96"
        height="96"
        class="size-20 shrink-0 rounded-full object-cover sm:size-24"
      >
      <div>
        <h1 class="font-display text-3xl font-bold sm:text-4xl">
          凌俊豪 Antonio
        </h1>
        <p class="mt-1 text-(--ink-soft)">
          軟體工程師，從{{ blog.subtitle }}出發
        </p>
        <ul
          class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm"
          aria-label="社群連結"
        >
          <li
            v-for="item in blog.social"
            :key="item.href"
          >
            <a
              :href="item.href"
              target="_blank"
              rel="noopener me"
              class="inline-flex items-center gap-1.5 text-(--ink-soft) hover:text-(--ink)"
            >
              <AppIcon
                :name="item.icon"
                :size="16"
              />
              {{ item.label }}
            </a>
          </li>
        </ul>
      </div>
    </header>
    <ContentRenderer
      :value="page"
      class="prose"
    />
  </article>
</template>
