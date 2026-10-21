<script setup lang="ts">
import { withTrailingSlash } from 'ufo'
import type { SearchRequest, SearchResponse, Section } from '~/workers/search.worker'

const open = useState('search-open', () => false)
// 輸入框的即時內容；v-model 在中文輸入法組字時不會更新（手機要按確認才搜得到），所以直接聽 input 事件
const typed = ref('')
const query = ref('')
// 停止輸入 0.5 秒後才搜尋
watchDebounced(typed, (value) => {
  query.value = value
}, { debounce: 500 })
const input = useTemplateRef('input')
const dialog = useTemplateRef('dialog')

// 索引與查詢在 Worker 裡（app/workers/search.worker.ts），段落資料是建置時預渲染的靜態 JSON（server/routes/search-sections.json.ts）
const ready = ref(false)
const rawHits = shallowRef<Section[]>([])
let worker: Worker | undefined
let seq = 0
let waiting: (() => void)[] = []

function send(message: SearchRequest) {
  worker?.postMessage(message)
}

/** 用目前的 query 查詢；回傳的 Promise 在最新一次查詢的結果回來時完成 */
function runSearch() {
  if (!ready.value || query.value.trim().length === 0) {
    rawHits.value = []
    return Promise.resolve()
  }
  send({ type: 'search', query: query.value, seq: ++seq })
  return new Promise<void>(resolve => waiting.push(resolve))
}
watch(query, runSearch)

// sections 的 id 是「文章路徑#標題」，用文章路徑對回文章標題與標籤
const { data: posts } = usePosts()
const postByPath = computed(() => new Map(posts.value.map(p => [p.path, p])))
const activeTag = ref('')

// 一篇文章只留一筆（分數最高的段落），點下去從文章頂端開始讀，摘要仍取自最相關的段落
const hits = computed(() => {
  const seen = new Set<string>()
  return rawHits.value.flatMap((hit) => {
    const path = hit.id.split('#')[0]!
    if (seen.has(path)) return []
    seen.add(path)
    const post = postByPath.value.get(path)
    const title = post?.title ?? hit.titles[0] ?? hit.title
    return [{
      path,
      title,
      // 命中的是文章內的段落時，標出段落名稱
      section: hit.title === title ? '' : hit.title,
      content: hit.content,
      tags: post?.tags.filter(t => !/鐵人賽$/.test(t)) ?? [],
    }]
  })
})
// 篩選用的標籤：結果裡最常出現的前 8 個
const tagOptions = computed(() => {
  const count = new Map<string, number>()
  for (const hit of hits.value) for (const tag of hit.tags) count.set(tag, (count.get(tag) ?? 0) + 1)
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag]) => tag)
})
const results = computed(() => hits.value
  .filter(hit => !activeTag.value || hit.tags.includes(activeTag.value))
  .slice(0, 12)
  .map(hit => ({ ...hit, excerpt: excerpt(hit.content, query.value) })))
watch(query, () => {
  activeTag.value = ''
})

const terms = computed(() => query.value.toLowerCase().split(/\s+/).filter(Boolean))

function excerpt(content: string, keyword: string) {
  const first = keyword.toLowerCase().trim().split(/\s+/)[0] ?? ''
  const index = content.toLowerCase().indexOf(first)
  const start = Math.max(0, index - 30)
  return (start > 0 ? '…' : '') + content.slice(start, start + 100) + '…'
}

/** 把文字切成一般與命中關鍵字的片段，給 <mark> 高亮用（不用 v-html） */
function highlight(text: string) {
  if (!terms.value.length) return [{ text, hit: false }]
  const pattern = new RegExp(`(${terms.value.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return text.split(pattern).filter(Boolean).map(part => ({ text: part, hit: terms.value.includes(part.toLowerCase()) }))
}

watch(open, async (value) => {
  if (!value) {
    dialog.value?.close()
    return
  }
  dialog.value?.showModal()
  await nextTick()
  input.value?.focus()
  await prepare()
})

// 下載文章資料並建立索引；滑過或 focus 搜尋按鈕時就先開始，打開時多半已經好了
let preparing: Promise<void> | undefined
function prepare() {
  preparing ??= new Promise<void>((resolve) => {
    worker = new Worker(new URL('../workers/search.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = ({ data }: MessageEvent<SearchResponse>) => {
      if (data.type === 'ready') {
        ready.value = true
        resolve()
        runSearch()
      }
      else if (data.type === 'result') {
        // 打字很快時只採用最新一次的結果
        if (data.seq !== seq) return
        rawHits.value = data.hits
        waiting.forEach(done => done())
        waiting = []
      }
      else {
        // 下載失敗時下次再試
        worker?.terminate()
        worker = undefined
        preparing = undefined
        resolve()
      }
    }
    send({ type: 'init', url: '/search-sections.json' })
  })
  return preparing
}

const warm = useState('search-warm', () => false)
watch(warm, (value) => {
  if (value) prepare()
})

// 搜尋框有文字時，瀏覽器預設的 Esc 只會清空文字，這裡直接關閉
onKeyStroke('Escape', () => {
  open.value = false
})

// ⌘K / Ctrl+K 開關搜尋
onKeyStroke(['k', 'K'], (event) => {
  if (!event.metaKey && !event.ctrlKey) return
  event.preventDefault()
  open.value = !open.value
})

// Enter（手機鍵盤的「搜尋」）：不等 debounce，直接開第一筆結果
async function openFirst() {
  query.value = typed.value
  await runSearch()
  const first = results.value[0]
  if (first) await navigateTo(withTrailingSlash(first.path))
}

onBeforeUnmount(() => worker?.terminate())

const route = useRoute()
watch(() => route.fullPath, () => {
  open.value = false
})
</script>

<template>
  <dialog
    ref="dialog"
    class="search-dialog mx-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] rounded-lg border border-(--line) bg-(--paper) p-0 text-(--ink) shadow-2xl"
    aria-label="搜尋文章"
    @close="open = false"
    @click.self="open = false"
  >
    <div class="flex items-center gap-3 border-b border-(--line) px-5">
      <AppIcon
        name="search"
        class="text-(--ink-soft)"
      />
      <input
        ref="input"
        :value="typed"
        type="search"
        enterkeyhint="search"
        placeholder="搜尋文章標題或內容"
        class="h-14 w-full bg-transparent text-lg outline-none placeholder:text-(--ink-soft)"
        aria-label="搜尋關鍵字"
        @input="typed = ($event.target as HTMLInputElement).value"
        @keydown.enter.prevent="openFirst"
      >
      <kbd class="hidden rounded border border-(--line) px-1.5 text-xs text-(--ink-soft) sm:inline">Esc</kbd>
    </div>
    <div class="max-h-[60vh] overflow-y-auto">
      <p
        v-if="!ready"
        class="px-5 py-6 text-(--ink-soft)"
      >
        正在載入索引…
      </p>
      <p
        v-else-if="query && results.length === 0"
        class="px-5 py-6 text-(--ink-soft)"
      >
        <AppIcon
          name="wave"
          class="mb-2 text-(--accent)"
        />
        <br>找不到「{{ query }}」，換個關鍵字試試，例如 Signal、Promise、NestJS。
      </p>
      <template v-else>
        <p
          v-if="tagOptions.length > 1"
          class="flex gap-2 overflow-x-auto border-b border-(--line) px-5 py-3 sm:flex-wrap"
          role="group"
          aria-label="依標籤篩選"
        >
          <button
            v-for="tag in ['', ...tagOptions]"
            :key="tag"
            type="button"
            class="filter-chip"
            :aria-pressed="activeTag === tag"
            @click="activeTag = tag"
          >
            {{ tag || '全部' }}
          </button>
        </p>
        <ul>
          <li
            v-for="item in results"
            :key="item.path"
            class="border-b border-(--line) last:border-b-0"
          >
            <NuxtLink
              :to="item.path"
              class="block px-5 py-3.5 hover:bg-(--wash)"
            >
              <p class="font-bold">
                <component
                  :is="part.hit ? 'mark' : 'span'"
                  v-for="(part, i) in highlight(item.title)"
                  :key="i"
                >{{ part.text }}</component>
              </p>
              <p
                v-if="item.section"
                class="mt-0.5 text-xs text-(--ink-soft)"
              >
                段落：{{ item.section }}
              </p>
              <p class="mt-0.5 line-clamp-2 text-sm text-(--ink-soft)">
                <component
                  :is="part.hit ? 'mark' : 'span'"
                  v-for="(part, i) in highlight(item.excerpt)"
                  :key="i"
                >{{ part.text }}</component>
              </p>
            </NuxtLink>
          </li>
        </ul>
      </template>
    </div>
  </dialog>
</template>

<style scoped>
mark {
  background: color-mix(in srgb, var(--accent) 22%, transparent);
  color: inherit;
  border-radius: 2px;
}
.filter-chip {
  flex-shrink: 0;
  white-space: nowrap;
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 0.1rem 0.55rem;
  font-size: 0.8rem;
  color: var(--ink-soft);
  transition: color 0.15s, border-color 0.15s;
}
.filter-chip:hover,
.filter-chip[aria-pressed='true'] {
  color: var(--ink);
  border-color: var(--accent);
}
.search-dialog::backdrop {
  background: rgb(14 22 38 / 0.35);
}
</style>
