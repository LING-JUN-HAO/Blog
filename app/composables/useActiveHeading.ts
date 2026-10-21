/** 目前閱讀到的文章標題 id，給目錄高亮用（桌機與手機目錄共用一份） */
export const useActiveHeading = createSharedComposable(() => {
  const activeId = ref('')
  const headings = ref<HTMLElement[]>([])

  const collect = () => {
    headings.value = [...document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id], .prose h4[id]')]
  }
  onMounted(collect)
  // 換頁時文章內容晚一步才渲染，內容變動後重新收集標題
  useMutationObserver(() => (import.meta.client ? document.querySelector('.prose') : null), collect, { childList: true })

  // 觀察區是頁首下方到視窗上方 30%：亮觀察區內最上面的標題；
  // 觀察區內沒有標題時維持原本的，往上捲、目前的標題掉到觀察區下方時改亮前一個
  const visible = new Set<string>()
  useIntersectionObserver(headings, (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target.id)
      else visible.delete(entry.target.id)
    }
    const first = headings.value.find(h => visible.has(h.id))
    if (first) {
      activeId.value = first.id
      return
    }
    const current = entries.find(e => e.target.id === activeId.value)
    if (current && current.boundingClientRect.top > (current.rootBounds?.bottom ?? 0)) {
      activeId.value = headings.value[headings.value.indexOf(current.target as HTMLElement) - 1]?.id ?? ''
    }
  }, { rootMargin: '-80px 0px -70% 0px' })

  return activeId
})
