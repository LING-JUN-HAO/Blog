import { queryCollectionSearchSections } from '@nuxt/content/server'

// 站內搜尋用的段落資料，建置時預渲染成靜態 JSON
// 瀏覽器端改抓這份檔案，不必下載整個內容資料庫並啟動 SQLite（WASM），手機第一次搜尋才不會卡住好幾秒
export default defineEventHandler(async (event) => {
  // 程式碼高亮會在文章裡插入 <style>，那段 CSS 不該被搜到
  const sections = await queryCollectionSearchSections(event, 'posts', { ignoredTags: ['style'] })
  return sections.map(({ id, title, titles, content }) => ({ id, title, titles, content }))
})
