// 預載畫面上看得到的文章資料（payload），手機點文章時不必等下載才開始換頁
// - 連結在畫面上停留 0.3 秒以上才排隊（快速滑過去的不抓），依畫面由上到下的順序：列表是新到舊排，較新、較上面的先讀
// - 一次一篇、瀏覽器閒置時才開始；用 rel=prefetch，瀏覽器以最低優先序下載，不會搶圖片與字型
// - 每一頁最多 6 篇；省流量模式或 2G 網路不預載
// - 游標移到文章上、focus 或手指碰到時，那一篇直接以一般優先序下載、不用排隊；點下去換頁時會接續這次下載，不會重抓
const PER_PAGE = 6
const DWELL = 300
// 只有一段路徑、而且不是這些頁面的連結才是文章（/JS-1/、/ithome-2026-day-30/）
const NOT_POSTS = new Set(['/about/', '/archives/', '/categories/', '/tags/', '/page/'])

export default defineNuxtPlugin((nuxtApp) => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean, effectiveType?: string } }).connection
  if (connection?.saveData || /2g/.test(connection?.effectiveType ?? '')) return

  const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200))
  // requested：已排隊或已開始下載；loaded：已經下載完（含指標碰到時的優先下載）
  const requested = new Set<string>()
  const loaded = new Set<string>()
  const queue: string[] = []
  const dwell = new Map<Element, ReturnType<typeof setTimeout>>()
  let budget = PER_PAGE
  let busy = false
  let observer: IntersectionObserver | undefined

  const isPost = (href: string | null): href is string =>
    !!href && /^\/[^/]+\/$/.test(href) && !NOT_POSTS.has(href) && href !== window.location.pathname

  function pump() {
    if (busy || !queue.length || budget <= 0) return
    busy = true
    budget--
    const path = queue.shift()!
    idle(() => {
      preloadPayload(path).then(() => loaded.add(path), () => {}).finally(() => {
        busy = false
        pump()
      })
    })
  }

  function scan() {
    observer?.disconnect()
    dwell.forEach(clearTimeout)
    dwell.clear()
    queue.length = 0
    budget = PER_PAGE
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          clearTimeout(dwell.get(entry.target))
          dwell.delete(entry.target)
          continue
        }
        const path = entry.target.getAttribute('href')
        if (!isPost(path) || requested.has(path) || dwell.has(entry.target)) continue
        dwell.set(entry.target, setTimeout(() => {
          dwell.delete(entry.target)
          if (requested.has(path)) return
          requested.add(path)
          queue.push(path)
          pump()
        }, DWELL))
      }
    })
    for (const link of document.querySelectorAll('main a[href]')) {
      if (isPost(link.getAttribute('href'))) observer.observe(link)
    }
  }

  // 指標碰到的那一篇優先：loadPayload 是正常優先序的 fetch，換頁時 Nuxt 會接續同一個下載
  function prioritize(event: Event) {
    const path = (event.target as Element | null)?.closest?.('a[href]')?.getAttribute('href') ?? null
    if (!isPost(path)) return
    // 已經下載完就不用再抓；還在排隊或背景低優先序下載中的，改成直接以一般優先序抓
    if (loaded.has(path)) return
    const queued = queue.indexOf(path)
    if (queued >= 0) queue.splice(queued, 1)
    requested.add(path)
    loaded.add(path)
    loadPayload(path).catch(() => loaded.delete(path))
  }
  for (const type of ['pointerover', 'focusin', 'touchstart']) {
    document.addEventListener(type, prioritize, { capture: true, passive: true })
  }

  // 換頁後等新頁面畫好再找連結
  nuxtApp.hook('page:finish', () => {
    setTimeout(scan, 300)
  })
  onNuxtReady(scan)
})
