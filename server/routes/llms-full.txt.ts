// 所有文章的 Markdown 全文，給 AI 工具一次讀取
export default defineEventHandler(async (event) => {
  const { site, posts } = await loadLlmsPosts(event)

  const sections = posts.map(post => [
    `# ${post.title}`,
    '',
    `網址：${post.url}`,
    ...(post.canonical ? [`原文：${post.canonical}`] : []),
    ...(post.date ? [`日期：${post.date.slice(0, 10)}`] : []),
    ...(post.tags.length ? [`標籤：${post.tags.join('、')}`] : []),
    '',
    stripFrontMatter(post.rawbody),
  ].join('\n'))

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `# ${site.name}\n\n> ${site.description}\n\n---\n\n${sections.join('\n\n---\n\n')}\n`
})
