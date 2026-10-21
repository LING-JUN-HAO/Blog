<script setup lang="ts">
const { blog } = useAppConfig()
const route = useRoute()
const { data: posts } = await usePosts()

const page = Number(route.params.page)
const stream = computed(() => latestStream(posts.value))
const total = computed(() => Math.max(1, Math.ceil(stream.value.length / blog.perPage)))
if (!Number.isInteger(page) || page < 2 || page > total.value) {
  throw createError({ statusCode: 404, message: '找不到這一頁', fatal: true })
}
const current = computed(() => stream.value.slice((page - 1) * blog.perPage, page * blog.perPage))

useSeoMeta({ title: `最新文章第 ${page} 頁`, description: listDescription(`Antonio's blog 最新文章第 ${page} 頁`, current.value.map(p => p.title)) })
defineOgImage('Post', { title: `${blog.title}・第 ${page} 頁`, description: blog.subtitle })
</script>

<template>
  <div>
    <PageHeading
      :title="`最新文章，第 ${page} 頁`"
      :note="`共 ${stream.length} 篇，鐵人賽系列只列最新一篇`"
    />
    <PostList :posts="current" />
    <PagerNav
      :current="page"
      :total="total"
      base="/"
    />
  </div>
</template>
