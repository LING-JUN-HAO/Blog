/** 目前閱讀到的文章標題 id，給目錄高亮用（桌機與手機目錄共用一份） */
export const useActiveHeading = createSharedComposable(() => {
  const activeId = ref('')
  const headings = ref<HTMLElement[]>([])

  onMounted(() => {
    headings.value = [...document.querySelectorAll<HTMLElement>('.prose-cute h2[id], .prose-cute h3[id], .prose-cute h4[id]')]
  })

  useIntersectionObserver(headings, (entries) => {
    const visible = entries.find(entry => entry.isIntersecting)
    if (visible) activeId.value = visible.target.id
  }, { rootMargin: '-80px 0px -70% 0px' })

  return activeId
})
