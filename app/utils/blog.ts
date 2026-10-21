// 與 hexo-util 的 slugize 相同規則，讓 /tags/Node-js/ 這類舊網址維持不變
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F]/g
const SPECIAL_CHARS = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/]+/g

export function slugize(value: string): string {
  return value
    .normalize('NFKC')
    .replace(CONTROL_CHARS, '')
    .replace(SPECIAL_CHARS, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** YYYY-MM-DD（台灣時間） */
export function formatDate(value?: string): string {
  if (!value) return ''
  const parts = Object.fromEntries(dateFormatter.formatToParts(new Date(value)).map(p => [p.type, p.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function formatCount(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)
}

/** 文章標題的 view-transition-name：列表與文章頁用同一個名稱，轉場時標題會 morph */
export function titleTransitionName(path: string): string {
  return `post-${path.replace(/[^a-z0-9-]/gi, c => c.charCodeAt(0).toString(36))}`
}

/** 列表頁的 meta description：說明＋前幾篇文章標題，控制在約 150 字內 */
export function listDescription(lead: string, titles: string[], max = 150): string {
  let text = lead
  for (const [index, title] of titles.entries()) {
    const next = `${text}${index === 0 ? '：' : '、'}${title}`
    if ([...next].length > max - 1) return `${text}…`
    text = next
  }
  return `${text}。`
}

const CLOUDINARY = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/

/**
 * Cloudinary 圖片加上 f_auto,q_auto：依瀏覽器回傳 AVIF / WebP 並自動壓縮品質
 * `width` 有給時再加 c_limit（只縮小不放大）。網址已帶轉換參數時改成在後面串接一段縮寬；SVG 不動
 */
export function optimizeImage(src: string, width?: number): string {
  const match = src.match(CLOUDINARY)
  if (!match || /\.svg(\?|$)/i.test(src)) return src
  const [, base, rest] = match
  const limit = width ? `c_limit,w_${width}` : ''
  // 第一段已經是轉換參數（如 f_auto,q_auto,w_1200,h_675,c_fill）：保留原轉換，再串接縮寬
  if (/^[a-z]{1,3}_[^/]*\//.test(rest!)) return limit ? `${base}${rest!.replace(/\//, `/${limit}/`)}` : src
  return `${base}${['f_auto', 'q_auto', limit].filter(Boolean).join(',')}/${rest}`
}

/** Cloudinary 圖片的 srcset（640／960／1280／1600 寬），讓手機不必下載桌機尺寸；非 Cloudinary 圖片回傳 undefined */
export function imageSrcset(src: string): string | undefined {
  if (!CLOUDINARY.test(src) || /\.svg(\?|$)/i.test(src)) return undefined
  return [640, 960, 1280, 1600].map(width => `${optimizeImage(src, width)} ${width}w`).join(', ')
}

type MinimarkNode = string | [string, Record<string, unknown>, ...MinimarkNode[]]

/** 文章一開頭的封面圖（第一個節點就是圖片，或只包一張圖的段落），沒有就回傳 undefined */
export function coverImage(body?: { value?: unknown[] }): string | undefined {
  const first = body?.value?.[0] as MinimarkNode | undefined
  if (!Array.isArray(first)) return undefined
  const node = first[0] === 'p' && first.length === 3 ? first[2] : first
  return Array.isArray(node) && node[0] === 'img' && typeof node[1].src === 'string' ? node[1].src : undefined
}
