import type { H3Event } from 'h3'
import { Feed } from 'feed'
import { queryCollection } from '@nuxt/content/server'

/** RSS（/rss.xml）與 Atom（/atom.xml）共用的訂閱內容：最新 20 篇 */
export async function buildFeed(event: H3Event) {
  const site = getSiteConfig(event)
  const home = `${site.url}/`
  const posts = await queryCollection(event, 'posts').order('date', 'DESC').limit(20).all()

  const feed = new Feed({
    id: home,
    link: home,
    title: site.name,
    description: site.description,
    language: 'zh-TW',
    favicon: `${home}images/icon-192.png`,
    // RSS 2.0 的頻道圖片只接受 GIF / JPEG / PNG
    image: `${home}images/icon-192.png`,
    copyright: `© ${new Date().getFullYear()} Antonio`,
    updated: posts[0]?.date ? new Date(posts[0].date) : new Date(),
    feedLinks: { rss: `${home}rss.xml`, atom: `${home}atom.xml` },
    author: { name: 'Antonio', link: `${home}about/` },
  })

  for (const post of posts) {
    const link = `${home}${post.path.slice(1)}/`
    feed.addItem({
      id: link,
      link,
      title: post.title,
      description: post.description,
      date: new Date(post.updated ?? post.date ?? Date.now()),
      published: post.date ? new Date(post.date) : undefined,
      category: [...post.categories, ...post.tags].map(name => ({ name })),
      // RSS 的 <author> 必須是 Email，只有名字會驗證失敗；作者由整個訂閱的 author 表示
    })
  }

  return feed
}
