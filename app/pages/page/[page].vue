<script setup lang="ts">
const { blog } = useAppConfig()
const route = useRoute()
const { data: posts } = await usePosts()

const page = Number(route.params.page)
const stream = computed(() => posts.value.filter(p => !p.canonical))
const total = computed(() => Math.max(1, Math.ceil(stream.value.length / blog.perPage)))
if (!Number.isInteger(page) || page < 2 || page > total.value) {
  throw createError({ statusCode: 404, message: '找不到這一頁', fatal: true })
}
const current = computed(() => stream.value.slice((page - 1) * blog.perPage, page * blog.perPage))

useSeoMeta({ title: `第 ${page} 頁` })
defineOgImage('Post', { title: `${blog.title}・第 ${page} 頁`, description: blog.subtitle })
</script>

<template>
  <div>
    <PageHeading
      :title="`最新文章，第 ${page} 頁`"
      :note="`共 ${stream.length} 篇，鐵人賽系列在首頁與文章列表`"
    />
    <PostList :posts="current" />
    <PagerNav
      :current="page"
      :total="total"
      base="/"
    />
  </div>
</template>
