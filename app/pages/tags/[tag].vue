<script setup lang="ts">
const route = useRoute()
const { data: posts } = await usePosts()
const group = computed(() => groupBy(posts.value, 'tags').find(g => g.slug === route.params.tag))

if (!group.value) {
  throw createError({ statusCode: 404, message: '找不到這個標籤', fatal: true })
}

// 「YYYY 鐵人賽」標籤頁就是該系列的入口
const series = computed(() => groupSeries(posts.value).find(s => s.path === `/tags/${route.params.tag}/`))

if (series.value) {
  useSeoMeta({
    title: `${series.value.title}｜${series.value.year} iThome 鐵人賽`,
    description: listDescription(`${series.value.year} iThome 鐵人賽系列「${series.value.title}」共 ${series.value.posts.length} 篇`, series.value.posts.map(p => p.title)),
  })
}
else {
  useSeoMeta({ title: `標籤：${group.value.name}`, description: listDescription(`標籤「${group.value.name}」共 ${group.value.posts.length} 篇文章`, group.value.posts.map(p => p.title)) })
}
useSchemaOrg([defineWebPage({ '@type': 'CollectionPage' })])
defineOgImage('Post', { title: `#${group.value.name}`, description: `共 ${group.value.posts.length} 篇文章` })
</script>

<template>
  <div v-if="series">
    <PageHeading
      :title="series.title"
      :note="`${series.year} iThome 鐵人賽・共 ${series.posts.length} 篇`"
    />
    <SeriesIndex :series="series" />
  </div>
  <div v-else-if="group">
    <PageHeading
      :title="group.name"
      :note="`共 ${group.posts.length} 篇文章`"
    />
    <ArchiveList :posts="group.posts" />
  </div>
</template>
