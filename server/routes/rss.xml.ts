export default defineEventHandler(async (event) => {
  const feed = await buildFeed(event)
  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  return feed.rss2()
})
