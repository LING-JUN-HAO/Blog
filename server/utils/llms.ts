import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/server'

/** llms.txt / llms-full.txt 共用：所有已發布文章（由新到舊）與網址 */
export async function loadLlmsPosts(event: H3Event) {
  const site = getSiteConfig(event)
  const home = `${site.url}/`
  const posts = await queryCollection(event, 'posts').order('date', 'DESC').all()
  return {
    site,
    home,
    posts: posts.map(post => ({ ...post, url: `${home}${post.path.slice(1)}/` })),
  }
}

/** 去掉 front-matter，只留 Markdown 內文 */
export function stripFrontMatter(markdown = '') {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()
}
