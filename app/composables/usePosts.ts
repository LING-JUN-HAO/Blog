import type { PostsCollectionItem } from '@nuxt/content'

export type PostSummary = Pick<
  PostsCollectionItem,
  'path' | 'title' | 'description' | 'date' | 'updated' | 'tags' | 'categories' | 'draft' | 'wordCount' | 'readingTime' | 'canonical' | 'series'
>

/**
 * 所有文章（由新到舊），來自預渲染的 /posts.json（server/routes/posts.json.ts）
 * 每一頁都用得到，如果放在 useAsyncData，每頁的 _payload.json 都會重複帶一份（約佔一半大小），
 * 換頁、預載文章都要重抓；獨立成一個檔案後，瀏覽器只下載一次（app.vue 在 head 預先載入）
 * 回傳值跟 useAsyncData 一樣可以 await 或直接取 data
 */
const posts = shallowRef<PostSummary[]>([])
let loading: Promise<void> | undefined

export function postsURL() {
  return `/posts.json?_b=${useRuntimeConfig().app.buildId}`
}

export function usePosts() {
  const data = import.meta.server ? shallowRef<PostSummary[]>([]) : posts
  let promise: Promise<void>
  if (import.meta.server) {
    // 伺服器端每次渲染各自取（建置時是內部呼叫，不走網路），不寫進 payload
    const nuxtApp = useNuxtApp() as ReturnType<typeof useNuxtApp> & { _posts?: Promise<PostSummary[]> }
    nuxtApp._posts ??= $fetch<PostSummary[]>('/posts.json')
    promise = nuxtApp._posts.then((list) => {
      data.value = list
    })
  }
  else {
    loading ??= fetch(postsURL(), { cache: 'force-cache' })
      .then(res => res.json() as Promise<PostSummary[]>)
      .then((list) => { posts.value = list })
      .catch((error) => {
        loading = undefined
        throw error
      })
    promise = loading
  }
  return Object.assign(promise.then(() => ({ data })), { data })
}

/**
 * 首頁與 /page/N 的「最新文章」：一般文章加上每個系列最新的一篇，依日期由新到舊
 * （系列的其他篇在系列頁，不讓 30 篇 Day N 洗掉一般文章）
 */
export function latestStream(posts: PostSummary[]) {
  const seen = new Set<string>()
  return posts.filter((post) => {
    if (!post.series) return true
    if (seen.has(post.series.name)) return false
    seen.add(post.series.name)
    return true
  })
}

export interface SeriesInfo {
  /** front-matter 的 series.name，例如「2026 iThome 鐵人賽：Angular 22 Signal 進化論」 */
  name: string
  /** 去掉「YYYY iThome 鐵人賽：」的系列標題 */
  title: string
  year: string
  url?: string
  path?: string
  /** 依 Day 由小到大 */
  posts: PostSummary[]
}

/** 依 series.name 分組，系列由新到舊、文章依 Day 排序（不用字串排序，Day 10 才不會排在 Day 2 前面） */
export function groupSeries(posts: PostSummary[]): SeriesInfo[] {
  const map = new Map<string, SeriesInfo>()
  for (const post of posts) {
    if (!post.series || post.draft) continue
    const { name, url } = post.series
    const entry = map.get(name) ?? {
      name,
      title: name.replace(/^\d{4} iThome 鐵人賽：/, ''),
      year: name.match(/^\d{4}/)?.[0] ?? '',
      url,
      path: seriesPath(post),
      posts: [],
    }
    entry.posts.push(post)
    map.set(name, entry)
  }
  for (const entry of map.values()) {
    entry.posts.sort((a, b) => (a.series?.day ?? Infinity) - (b.series?.day ?? Infinity) || Date.parse(a.date ?? '') - Date.parse(b.date ?? ''))
  }
  return [...map.values()].sort((a, b) => b.year.localeCompare(a.year, 'en'))
}

/** 系列文章標題去掉「… Day N：」前綴，給系列目錄用 */
export function seriesEntryTitle(title: string) {
  return title.replace(/^.*?Day\s*\d+\s*[：:]\s*/, '')
}

// 每篇鐵人賽文章都有的標籤／分類，沒有區辨力，不拿來算相關度
const GENERIC_TERM = /鐵人賽$/

/**
 * 相關文章，依序取：同系列（Day 最接近、排除上一篇與下一篇）→ 共同技術標籤 → 同分類 → 最新的一般文章補滿
 * 同一層內越相關、越新的排越前面
 */
export function relatedPosts(current: PostSummary, posts: PostSummary[], exclude: string[] = [], limit = 4) {
  const skip = new Set([current.path, ...exclude])
  const candidates = posts.filter(p => !p.draft && !skip.has(p.path))
  const picked: PostSummary[] = []
  const take = (list: PostSummary[], max = limit) => {
    for (const post of list) {
      if (picked.length >= limit || max <= 0) return
      if (picked.includes(post)) continue
      picked.push(post)
      max--
    }
  }
  const byDate = (a: PostSummary, b: PostSummary) => Date.parse(b.date ?? '') - Date.parse(a.date ?? '')

  const day = current.series?.day
  if (current.series) {
    take(candidates
      .filter(p => p.series?.name === current.series!.name)
      .sort((a, b) => Math.abs((a.series?.day ?? 0) - (day ?? 0)) - Math.abs((b.series?.day ?? 0) - (day ?? 0))), 2)
  }

  const tags = current.tags.filter(t => !GENERIC_TERM.test(t))
  const categories = current.categories.filter(c => !GENERIC_TERM.test(c))
  const scored = candidates
    .map(post => ({
      post,
      tags: post.tags.filter(t => tags.includes(t)).length,
      categories: post.categories.filter(c => categories.includes(c)).length,
    }))
  take(scored.filter(s => s.tags > 0)
    .sort((a, b) => b.tags * 2 + b.categories - (a.tags * 2 + a.categories) || byDate(a.post, b.post))
    .map(s => s.post))
  take(scored.filter(s => s.categories > 0).sort((a, b) => b.categories - a.categories || byDate(a.post, b.post)).map(s => s.post))
  take(candidates.filter(p => !p.series).sort(byDate))
  return picked
}

/** 系列文章的入口（「YYYY 鐵人賽」標籤頁） */
export function seriesPath(post: Pick<PostSummary, 'tags'>) {
  const tag = post.tags.find(t => /^\d{4} 鐵人賽$/.test(t))
  return tag ? `/tags/${slugize(tag)}/` : undefined
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
  // 排序指定語系：不指定時跟著執行環境，建置時的 Node 與讀者的中文瀏覽器排出來不同，hydration 會對不上
  return [...groups.values()].sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name, 'en'))
}
