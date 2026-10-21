// 給 AI 工具讀的網站索引（https://llmstxt.org）
export default defineEventHandler(async (event) => {
  const { site, home, posts } = await loadLlmsPosts(event)
  const line = (post: typeof posts[number]) => `- [${post.title}](${post.url})${post.description ? `: ${post.description}` : ''}`

  const own = posts.filter(post => !post.canonical)
  const syndicated = posts.filter(post => post.canonical)

  const text = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    'Antonio（凌俊豪）的繁體中文技術部落格：前端開發（JavaScript、TypeScript、Vue、React、Angular Signal）、NestJS 後端、資料庫與開發工具筆記，以及三屆 iThome 鐵人賽系列文。所有文章全文收錄在 llms-full.txt。',
    '',
    '## 文章',
    '',
    ...own.map(line),
    '',
    '## iThome 鐵人賽',
    '',
    '以下系列文的原文發表於 iThome，這裡收錄全文；引用時請以原文網址為準。',
    '',
    ...syndicated.map(post => `${line(post)}（原文：${post.canonical}）`),
    '',
    '## 頁面',
    '',
    `- [關於我](${home}about/): 作者 Antonio 的經歷、代表作與聯絡方式`,
    `- [文章列表](${home}archives/): 依時間排列的所有文章`,
    `- [文章分類](${home}categories/): 依分類瀏覽`,
    `- [標籤](${home}tags/): 依標籤瀏覽`,
    '',
    '## 其他',
    '',
    `- [llms-full.txt](${home}llms-full.txt): 所有文章的 Markdown 全文`,
    `- [RSS](${home}rss.xml): 最新 20 篇文章`,
    `- [Sitemap](${home}sitemap.xml)`,
    '',
  ].join('\n')

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return text
})
