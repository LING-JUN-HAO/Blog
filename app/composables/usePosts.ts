import type { PostsCollectionItem } from '@nuxt/content'

export type PostSummary = Pick<
  PostsCollectionItem,
  'path' | 'title' | 'description' | 'date' | 'updated' | 'tags' | 'categories' | 'draft' | 'wordCount' | 'readingTime' | 'canonical'
>

const SUMMARY_FIELDS = ['path', 'title', 'description', 'date', 'updated', 'tags', 'categories', 'draft', 'wordCount', 'readingTime', 'canonical'] as const

/** 所有文章（由新到舊）；`pnpm blog server --drafts` 時一併列出草稿 */
export function usePosts() {
  const { showDrafts } = useRuntimeConfig().public

  return useAsyncData('all-posts', async () => {
    const posts = await queryCollection('posts').select(...SUMMARY_FIELDS).all()
    const drafts = showDrafts
      // drafts collection 只在草稿模式下存在
      ? await queryCollection('drafts' as 'posts').select(...SUMMARY_FIELDS).all()
      : []
    return [...drafts, ...posts].sort((a, b) => {
      // 草稿沒有日期，排在最前面
      if (!a.date) return -1
      if (!b.date) return 1
      return b.date.localeCompare(a.date)
    }) as PostSummary[]
  }, { default: () => [] as PostSummary[] })
}

/** 依網址找出標籤或分類的原始名稱與文章 */
export function groupBy(posts: PostSummary[], key: 'tags' | 'categories') {
  const groups = new Map<string, { name: string, slug: string, posts: PostSummary[] }>()
  for (const post of posts) {
    for (const name of post[key] ?? []) {
      const slug = slugize(name)
      const group = groups.get(slug) ?? { name, slug, posts: [] }
      group.posts.push(post)
      groups.set(slug, group)
    }
  }
  return [...groups.values()].sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name))
}
