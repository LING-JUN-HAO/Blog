/**
 * 類 Hexo 的部落格指令
 *
 *   pnpm blog new "標題" [--slug my-post]        新增文章到 content/_posts
 *   pnpm blog new draft "標題" [--slug my-post]  新增草稿到 content/_drafts
 *   pnpm blog publish <slug>                     草稿 → 文章，自動補上發布時間
 *   pnpm blog server [--drafts]                  本機預覽（--drafts 顯示草稿）
 *   pnpm blog generate                           產生靜態網站到 .output/public
 *   pnpm blog preview                            預覽產生好的網站
 *   pnpm blog clean                              清掉建置快取
 *
 * 部署：push 到 master 後由 Vercel 自動建置並發布
 */
import { spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'

const ROOT = resolve(import.meta.dirname, '..')
const POSTS_DIR = join(ROOT, 'content/_posts')
const DRAFTS_DIR = join(ROOT, 'content/_drafts')
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/
const PREVIEW_PORT = 4173

const { values: options, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    slug: { type: 'string', short: 's' },
    drafts: { type: 'boolean', short: 'd', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
})

/** 台灣時間的 YYYY-MM-DD 與 YYYY-MM-DD HH:mm:ss */
function now() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date()).map(p => [p.type, p.value]),
  )
  const day = `${parts.year}-${parts.month}-${parts.day}`
  return { day, datetime: `${day} ${parts.hour}:${parts.minute}:${parts.second}` }
}

/** 與 Hexo 相同：把標題裡的特殊符號換成 `-` */
function toSlug(title: string) {
  return title
    .normalize('NFKC')
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/，。、：；！？「」『』（）]+/g, '-')
    .replace(/^-|-$/g, '')
}

function yamlString(value: string) {
  return /^[\w㐀-鿿][^:#]*$/.test(value) ? value : JSON.stringify(value)
}

function fail(message: string): never {
  console.error(`✖ ${message}`)
  process.exit(1)
}

function run(command: string, args: string[], env: Record<string, string> = {}) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function createPost(isDraft: boolean, title: string | undefined) {
  if (!title) fail(`請給標題，例如：pnpm blog new${isDraft ? ' draft' : ''} "我的新文章"`)

  const slug = options.slug ?? toSlug(title)
  const { day, datetime } = now()
  const dir = isDraft ? DRAFTS_DIR : POSTS_DIR
  const file = join(dir, isDraft ? `${slug}.md` : `${day}-${slug}.md`)

  if (existsSync(file)) fail(`檔案已存在：${file}`)
  const duplicate = [...readdirSync(POSTS_DIR), ...readdirSync(DRAFTS_DIR)]
    .find(name => name.replace(DATE_PREFIX, '') === `${slug}.md`)
  if (duplicate) fail(`slug「${slug}」已經被 ${duplicate} 使用，請用 --slug 換一個`)

  const frontMatter = [
    '---',
    `title: ${yamlString(title)}`,
    ...(isDraft ? [] : [`date: ${datetime}`]),
    'tags: []',
    'categories: []',
    'description: ',
    '---',
    '',
    '',
  ].join('\n')

  mkdirSync(dir, { recursive: true })
  writeFileSync(file, frontMatter)
  console.log(`🌸 已建立${isDraft ? '草稿' : '文章'}：${file.replace(`${ROOT}/`, '')}`)
  console.log(`   網址：/${slug}/`)
}

function publish(name: string | undefined) {
  if (!name) fail('請指定要發布的草稿，例如：pnpm blog publish my-post')

  const fileName = name.endsWith('.md') ? name : `${name}.md`
  const from = join(DRAFTS_DIR, fileName)
  if (!existsSync(from)) {
    const drafts = readdirSync(DRAFTS_DIR).filter(n => n.endsWith('.md'))
    fail(`找不到草稿 ${fileName}\n  目前的草稿：${drafts.join('、') || '（沒有）'}`)
  }

  const { day, datetime } = now()
  const to = join(POSTS_DIR, `${day}-${fileName}`)
  if (existsSync(to)) fail(`檔案已存在：${to}`)

  const source = readFileSync(from, 'utf8')
  const match = source.match(/^---\n([\s\S]*?)\n---/)
  if (!match) fail(`${fileName} 沒有 front-matter`)

  const lines = match[1]!.split('\n').filter(line => !/^date:/.test(line))
  const titleIndex = lines.findIndex(line => /^title:/.test(line))
  lines.splice(titleIndex + 1, 0, `date: ${datetime}`)

  writeFileSync(from, source.replace(match[0], `---\n${lines.join('\n')}\n---`))
  renameSync(from, to)
  console.log(`🎉 已發布：${to.replace(`${ROOT}/`, '')}（${datetime}）`)
}

async function preview() {
  const { default: serveHandler } = await import('serve-handler')
  const publicDir = join(ROOT, '.output/public')
  if (!existsSync(publicDir)) fail('還沒有產生網站，請先執行 pnpm blog generate')

  createServer((req, res) => {
    void serveHandler(req, res, { public: publicDir, trailingSlash: true, directoryListing: false })
  }).listen(PREVIEW_PORT, () => {
    console.log(`👀 預覽：http://localhost:${PREVIEW_PORT}/`)
  })
}

function help() {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').match(/\/\*\*([\s\S]*?)\*\//)![1]!.replace(/^ \* ?/gm, ''))
}

const [command, ...rest] = positionals

if (options.help || !command) {
  help()
}
else if (command === 'new') {
  const isDraft = rest[0] === 'draft'
  createPost(isDraft, isDraft ? rest[1] : rest[0])
}
else if (command === 'publish') {
  publish(rest[0])
}
else if (command === 'server' || command === 's') {
  run('pnpm', ['exec', 'nuxt', 'dev'], options.drafts ? { BLOG_DRAFTS: '1' } : {})
}
else if (command === 'generate' || command === 'g') {
  run('pnpm', ['exec', 'nuxt', 'generate'])
}
else if (command === 'preview') {
  await preview()
}
else if (command === 'deploy' || command === 'd') {
  console.log('現在改由 Vercel 部署：把變更 push 到 master 就會自動發布 🚀')
}
else if (command === 'clean') {
  for (const dir of ['.nuxt', '.output', '.data', 'node_modules/.cache']) rmSync(join(ROOT, dir), { recursive: true, force: true })
  console.log('🧹 已清除建置快取')
}
else {
  fail(`不認得的指令：${command}，用 pnpm blog --help 看看可以做什麼`)
}
