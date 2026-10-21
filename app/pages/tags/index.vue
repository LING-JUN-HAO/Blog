<script setup lang="ts">
const { data: posts } = await usePosts()
const groups = computed(() => groupBy(posts.value.filter(p => !p.draft), 'tags'))

useSeoMeta({ title: '標籤', description: () => listDescription(`Antonio's blog 的 ${groups.value.length} 個文章標籤，依主題找到 JavaScript、TypeScript、Vue、Angular、NestJS 等筆記`, groups.value.slice(0, 12).map(g => g.name)) })
useSchemaOrg([defineWebPage({ '@type': 'CollectionPage' })])
defineOgImage('Post', { title: '標籤', description: `共 ${groups.value.length} 個標籤` })
</script>

<template>
  <div>
    <PageHeading
      title="標籤"
      :note="`${groups.length} 個標籤，數字是文章篇數`"
    />
    <TermCloud
      base="/tags/"
      :groups="groups"
    />
  </div>
</template>
