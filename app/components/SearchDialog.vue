<script setup lang="ts">
import MiniSearch from 'minisearch'

interface Section { id: string, title: string, titles: string[], content: string }

const open = useState('search-open', () => false)
const query = ref('')
const input = useTemplateRef('input')
const dialog = useTemplateRef('dialog')
const engine = shallowRef<MiniSearch<Section>>()

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

const { data: sections, execute } = useLazyAsyncData('search-sections', () => queryCollectionSearchSections('posts'), {
  immediate: false,
  server: false,
})

const results = computed(() => {
  if (!engine.value || query.value.trim().length === 0) return []
  return engine.value.search(query.value, { prefix: true, combineWith: 'AND' }).slice(0, 12).map(hit => ({
    id: hit.id as string,
    title: hit.title as string,
    titles: hit.titles as string[],
    excerpt: excerpt(hit.content as string, query.value),
  }))
})

function excerpt(content: string, keyword: string) {
  const index = content.toLowerCase().indexOf(keyword.toLowerCase().trim())
  const start = Math.max(0, index - 30)
  return (start > 0 ? '…' : '') + content.slice(start, start + 100) + '…'
}

watch(open, async (value) => {
  if (!value) {
    dialog.value?.close()
    return
  }
  dialog.value?.showModal()
  if (!sections.value) await execute()
  if (!engine.value && sections.value) {
    const search = new MiniSearch<Section>({
      fields: ['title', 'titles', 'content'],
      storeFields: ['title', 'titles', 'content'],
      tokenize,
      searchOptions: { boost: { title: 3, titles: 2 }, tokenize },
    })
    search.addAll(sections.value as Section[])
    engine.value = search
  }
  await nextTick()
  input.value?.focus()
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
        v-model="query"
        type="search"
        placeholder="搜尋文章標題或內容"
        class="h-14 w-full bg-transparent text-lg outline-none placeholder:text-(--ink-soft)"
        aria-label="搜尋關鍵字"
      >
      <kbd class="hidden rounded border border-(--line) px-1.5 text-xs text-(--ink-soft) sm:inline">Esc</kbd>
    </div>
    <div class="max-h-[60vh] overflow-y-auto">
      <p
        v-if="!sections"
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
      <ul v-else>
        <li
          v-for="item in results"
          :key="item.id"
          class="border-b border-(--line) last:border-b-0"
        >
          <NuxtLink
            :to="item.id"
            class="block px-5 py-3.5 hover:bg-(--wash)"
          >
            <p class="text-xs text-(--ink-soft)">
              {{ item.titles.join(' / ') }}
            </p>
            <p class="font-bold">
              {{ item.title }}
            </p>
            <p class="mt-0.5 line-clamp-2 text-sm text-(--ink-soft)">
              {{ item.excerpt }}
            </p>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </dialog>
</template>

<style scoped>
.search-dialog::backdrop {
  background: rgb(14 22 38 / 0.35);
}
</style>
