<script setup lang="ts">
const { data: posts } = await usePosts()
const groups = computed(() => groupBy(posts.value.filter(p => !p.draft), 'categories'))

useSeoMeta({ title: '文章分類', description: () => listDescription(`Antonio's blog 的 ${groups.value.length} 個文章分類，涵蓋前端、後端、資料庫與三屆 iThome 鐵人賽`, groups.value.map(g => `${g.name}（${g.posts.length}）`)) })
useSchemaOrg([defineWebPage({ '@type': 'CollectionPage' })])
defineOgImage('Post', { title: '文章分類', description: `共 ${groups.value.length} 個分類` })
</script>

<template>
  <div>
    <PageHeading
      title="文章分類"
      :note="`${groups.length} 個分類，數字是文章篇數`"
    />
    <TermCloud
      base="/categories/"
      :groups="groups"
    />
  </div>
</template>
