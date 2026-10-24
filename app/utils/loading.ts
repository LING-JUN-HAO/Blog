/**
 * 網頁字型換上並下載完（nuxt.config 的 head script 加上 .fonts-ready 之後）；最多等 15 秒
 * 中文字型一頁有十幾個切片，下載時會佔滿手機網路，不急的下載（GA）排在它後面
 */
export function fontsSettled(): Promise<void> {
  const root = document.documentElement
  const ready = root.classList.contains('fonts-ready')
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          if (!root.classList.contains('fonts-ready')) return
          observer.disconnect()
          resolve()
        })
        observer.observe(root, { attributes: true, attributeFilter: ['class'] })
      })
  const loaded = ready.then(() => new Promise(resolve => requestAnimationFrame(resolve))).then(() => document.fonts.ready)
  return Promise.race([loaded.then(() => {}), new Promise<void>(resolve => setTimeout(resolve, 15000))])
}

let transition: ViewTransition | undefined

/** 由 view-transition plugin 記下目前的換頁轉場 */
export function trackViewTransition(current: ViewTransition | undefined) {
  transition = current
}

/** 換頁轉場的動畫播完（沒有轉場時立即） */
export function viewTransitionFinished(): Promise<void> {
  return transition ? transition.finished.catch(() => {}) : Promise.resolve()
}
