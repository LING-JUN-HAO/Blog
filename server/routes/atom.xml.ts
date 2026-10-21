export default defineEventHandler(async (event) => {
  const feed = await buildFeed(event)
  setHeader(event, 'content-type', 'application/atom+xml; charset=utf-8')
  return feed.atom1()
})
