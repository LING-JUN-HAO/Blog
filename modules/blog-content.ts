import { defineNuxtModule } from 'nuxt/kit'

// 沿用 hexo-symbols-count-time 的設定：awl 4、wpm 275
const SYMBOLS_PER_MINUTE = 4 * 275

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/

/** Hexo 的日期沒有時區，一律視為台灣時間 */
function toIsoDate(value: unknown): string | undefined {
  if (value == null || value === '') return undefined
  if (value instanceof Date) {
    // YAML 會把無時區的時間當成 UTC 解析，這裡把它還原成台灣時間
    return `${value.toISOString().slice(0, 19)}+08:00`
  }
  const text = String(value).trim()
  const match = text.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2})?))?$/)
  if (!match) return text
  const time = match[2] ? (match[2].length === 5 ? `${match[2]}:00` : match[2]) : '00:00:00'
  return `${match[1]}T${time}+08:00`
}

function countSymbols(markdown: string): number {
  return markdown
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[#>*_`~|-]/g, '')
    .replace(/\s+/g, '')
    .length
}

export default defineNuxtModule({
  meta: { name: 'blog-content' },
  setup(_, nuxt) {
    nuxt.hook('content:file:afterParse', (ctx) => {
      const { collection, content, file } = ctx
      if (collection.name !== 'posts' && collection.name !== 'drafts') return

      const stem = String(content.stem ?? '').split('/').pop() ?? ''
      const slug = (content.slug as string | undefined) || stem.replace(DATE_PREFIX, '')
      content.slug = slug
      content.path = `/${slug}`
      content.draft = collection.name === 'drafts'
      content.date = toIsoDate(content.date)
      content.updated = toIsoDate(content.updated)

      // 系列的第幾天：沒寫 series.day 時從檔名（ithome-2026-day-05）推出來
      const series = content.series as { day?: number } | undefined
      const day = slug.match(/-day-(\d+)$/i)?.[1]
      if (series && series.day == null && day) series.day = Number(day)

      // sitemap 的 lastmod（轉載文章由 nuxt.config 的 sitemap.exclude 排除）
      content.sitemap = { ...(content.sitemap as object | undefined), lastmod: content.updated ?? content.date }

      const symbols = countSymbols(String(file.body ?? ''))
      content.wordCount = symbols
      content.readingTime = Math.max(1, Math.ceil(symbols / SYMBOLS_PER_MINUTE))
    })
  },
})
