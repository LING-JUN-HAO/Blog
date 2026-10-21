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
