<script setup lang="ts">
const route = useRoute()
const { data: posts } = await usePosts()
const group = computed(() => groupBy(posts.value, 'categories').find(g => g.slug === route.params.category))

if (!group.value) {
  throw createError({ statusCode: 404, message: '找不到這個分類', fatal: true })
}

useSeoMeta({ title: `分類：${group.value.name}`, description: listDescription(`分類「${group.value.name}」共 ${group.value.posts.length} 篇文章`, group.value.posts.map(p => p.title)) })
useSchemaOrg([defineWebPage({ '@type': 'CollectionPage' })])
// 「iThome 鐵人賽」分類頁上方列出三個系列的入口
const series = computed(() => group.value?.name === 'iThome 鐵人賽' ? groupSeries(posts.value) : [])

defineOgImage('Post', { title: group.value.name, description: `共 ${group.value.posts.length} 篇文章` })
</script>

<template>
  <div v-if="group">
    <PageHeading
      :title="group.name"
      :note="`共 ${group.posts.length} 篇文章`"
    />
    <SeriesCards
      v-if="series.length"
      :series="series"
      class="mb-14"
    />
    <ArchiveList :posts="group.posts" />
  </div>
</template>
