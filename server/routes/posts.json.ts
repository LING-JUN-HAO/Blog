import { queryCollection } from '@nuxt/content/server'

const SUMMARY_FIELDS = ['path', 'title', 'description', 'date', 'updated', 'tags', 'categories', 'draft', 'wordCount', 'readingTime', 'canonical', 'series'] as const

// 所有文章的摘要（由新到舊），建置時預渲染成靜態 JSON，見 usePosts
// `pnpm blog server --drafts` 時一併列出草稿
export default defineEventHandler(async (event) => {
  const { showDrafts } = useRuntimeConfig(event).public
  const posts = await queryCollection(event, 'posts').select(...SUMMARY_FIELDS).all()
  const drafts = showDrafts
    // drafts collection 只在草稿模式下存在
    ? await queryCollection(event, 'drafts' as 'posts').select(...SUMMARY_FIELDS).all()
    : []
  return [...drafts, ...posts].sort((a, b) => {
    // 草稿沒有日期，排在最前面
    if (!a.date) return -1
    if (!b.date) return 1
    return Date.parse(b.date) - Date.parse(a.date)
  })
})
