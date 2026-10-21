/** 頁面捲動百分比（0–100），`y` 可寫入以捲動頁面 */
export const useScrollProgress = createSharedComposable(() => {
  const { y } = useWindowScroll({ behavior: 'smooth' })
  const { height: windowHeight } = useWindowSize()
  const { height: pageHeight } = useElementSize(() => (import.meta.client ? document.documentElement : null))

  const progress = computed(() => {
    const max = pageHeight.value - windowHeight.value
    return max > 0 ? Math.min(100, (y.value / max) * 100) : 0
  })

  return { y, progress }
})
