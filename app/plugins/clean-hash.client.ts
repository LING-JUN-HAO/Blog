// 網址不留 #錨點：站內錨點連結只捲動不改網址；帶 # 進來的（站內搜尋結果、外部連結）捲到段落後把 # 拿掉
export default defineNuxtPlugin((nuxtApp) => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function scrollToHash(hash: string, smooth: boolean) {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    target?.scrollIntoView({ behavior: smooth && !reducedMotion.matches ? 'smooth' : 'auto' })
    return Boolean(target)
  }

  // 捕獲階段先攔下，NuxtLink 看到 defaultPrevented 就不會再 push 帶 # 的網址
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as Element | null)?.closest('a')
    if (!link?.hash || link.target === '_blank') return
    const url = new URL(link.href)
    if (url.origin !== location.origin || url.pathname !== location.pathname) return
    if (scrollToHash(url.hash, true)) event.preventDefault()
  }, true)

  function stripHash() {
    if (!location.hash) return
    scrollToHash(location.hash, false)
    history.replaceState(history.state, '', location.pathname + location.search)
  }

  nuxtApp.hook('app:mounted', () => {
    requestAnimationFrame(stripHash)
  })
  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(stripHash)
  })
})
