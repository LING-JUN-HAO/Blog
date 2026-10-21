interface SeriesBookmark { path: string, title: string, progress: number }

/**
 * 系列文章的閱讀紀錄，只存在讀者自己的瀏覽器（localStorage）
 * initOnMounted：預渲染的 HTML 一律用空紀錄，掛載後才讀取，避免 hydration 不一致
 */
export const useSeriesReading = createSharedComposable(() => {
  const options = { initOnMounted: true }
  // 讀到 90% 以上的文章
  const read = useLocalStorage<Record<string, true>>('blog-read-posts', {}, options)
  // 每個系列最後閱讀的文章與位置，給「繼續閱讀」用
  const bookmarks = useLocalStorage<Record<string, SeriesBookmark>>('blog-series-bookmarks', {}, options)
  return { read, bookmarks }
})
