// 記下換頁轉場，讓頁面把不急的渲染排到動畫播完之後（見 viewTransitionFinished）
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:view-transition:start', (transition) => {
    trackViewTransition(transition)
    transition.finished.finally(() => {
      trackViewTransition(undefined)
    })
  })
})
