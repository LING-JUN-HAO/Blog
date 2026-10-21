<script setup lang="ts">
const route = useRoute()
const { data: posts } = await usePosts()
const group = computed(() => groupBy(posts.value, 'categories').find(g => g.slug === route.params.category))

if (!group.value) {
  throw createError({ statusCode: 404, message: '找不到這個分類', fatal: true })
}

useSeoMeta({ title: `分類：${group.value.name}`, description: `分類「${group.value.name}」的所有文章。` })
useSchemaOrg([defineWebPage({ '@type': 'CollectionPage' })])
defineOgImage('Post', { title: group.value.name, description: `共 ${group.value.posts.length} 篇文章` })
</script>

<template>
  <div v-if="group">
    <PageHeading
      :title="group.name"
      :note="`共 ${group.posts.length} 篇文章`"
    />
    <ArchiveList :posts="group.posts" />
  </div>
</template>
