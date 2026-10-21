// 站內搜尋的索引與查詢都在 Worker 裡跑：1000 多個段落的中文分詞建索引在手機上要好幾秒，放在主執行緒會讓整頁卡住
import MiniSearch from 'minisearch'

export interface Section { id: string, title: string, titles: string[], content: string }

export type SearchRequest
  = | { type: 'init', url: string }
    | { type: 'search', query: string, seq: number }

export type SearchResponse
  = | { type: 'ready' }
    | { type: 'error' }
    | { type: 'result', seq: number, hits: Section[] }

// 中文沒有空白分詞，用單字＋雙字切分，英文則照單字切
function tokenize(text: string) {
  const tokens: string[] = []
  for (const word of text.toLowerCase().match(/[a-z0-9_.$-]+|[㐀-鿿]+/g) ?? []) {
    if (/^[a-z0-9_.$-]+$/.test(word)) {
      tokens.push(word)
      continue
    }
    for (let i = 0; i < word.length; i++) {
      tokens.push(word[i]!)
      if (i + 1 < word.length) tokens.push(word.slice(i, i + 2))
    }
  }
  return tokens
}

let engine: MiniSearch<Section> | undefined
const reply = (message: SearchResponse) => postMessage(message)

onmessage = async ({ data }: MessageEvent<SearchRequest>) => {
  if (data.type === 'init') {
    try {
      const sections: Section[] = await (await fetch(data.url)).json()
      engine = new MiniSearch<Section>({
        fields: ['title', 'titles', 'content'],
        storeFields: ['title', 'titles', 'content'],
        tokenize,
        searchOptions: { boost: { title: 3, titles: 2 }, tokenize },
      })
      engine.addAll(sections)
      reply({ type: 'ready' })
    }
    catch {
      reply({ type: 'error' })
    }
    return
  }
  if (!engine) return
  // 依分數排序；頁面會再收成一篇一筆，留 300 筆就夠
  const hits = engine.search(data.query, { prefix: true, combineWith: 'AND' }).slice(0, 300).map(hit => ({
    id: hit.id as string,
    title: hit.title as string,
    titles: hit.titles as string[],
    content: hit.content as string,
  }))
  reply({ type: 'result', seq: data.seq, hits })
}
