<script setup lang="ts">
// 支援 Hexo 時期的 /archives/、/archives/2023/、/archives/2023/10/ 與 /archives/(2023/)page/2/
// 新版不分頁，分頁網址一律顯示整份清單
const route = useRoute()
const { data: posts } = await usePosts()

const params = ([] as string[]).concat(route.params.params ?? []).filter(Boolean)
const pageIndex = params.indexOf('page')
const [year, month] = pageIndex === -1 ? params : params.slice(0, pageIndex)
const prefix = [year, month].filter(Boolean).join('-')

const list = computed(() => posts.value.filter(p => !prefix || formatDate(p.date).startsWith(prefix)))
if (prefix && list.value.length === 0) {
  throw createError({ statusCode: 404, message: '這段時間沒有文章', fatal: true })
}

const title = prefix ? `文章列表：${prefix.replace('-', ' 年 ')}${month ? ' 月' : ' 年'}` : '文章列表'
useSeoMeta({ title, description: '依時間瀏覽所有文章。' })
// 舊版彙整分頁顯示的是同一份清單，canonical 指回不分頁的網址
if (pageIndex !== -1) {
  useHead({ link: [{ rel: 'canonical', href: `${useSiteConfig().url}/archives/${[year, month].filter(Boolean).map(p => `${p}/`).join('')}`, key: 'canonical' }] })
}
useSchemaOrg([defineWebPage({ '@type': 'CollectionPage' })])
defineOgImage('Post', { title, description: `共 ${list.value.length} 篇文章` })
</script>

<template>
  <div>
    <PageHeading
      :title="title"
      :note="`共 ${list.length} 篇，持續更新中`"
    />
    <ArchiveList :posts="list" />
  </div>
</template>
