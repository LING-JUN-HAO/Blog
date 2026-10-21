/**
 * 產生舊網址（https://ling-jun-hao.github.io/Blog/...）的轉址站，由 GitHub Actions 發布到 GitHub Pages。
 * 依 .output/public 裡每個頁面產生同路徑的轉址頁，其他路徑交給 404.html 用 JS 轉過去。
 *
 *   pnpm build && tsx scripts/build-redirects.ts
 */
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const PUBLIC_DIR = join(ROOT, '.output/public')
const OUT_DIR = join(ROOT, '.redirects')
const SITE_URL = (process.env.NUXT_SITE_URL ?? 'https://ling-jun-hao-blog.vercel.app').replace(/\/$/, '')
const OLD_BASE = '/Blog'

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function redirectPage(target: string) {
  const href = escapeHtml(target)
  return `<!doctype html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<title>部落格搬家囉 🌸</title>
<link rel="canonical" href="${href}">
<meta http-equiv="refresh" content="0; url=${href}">
<script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script>
</head>
<body>
<p>Antonio's blog 已經搬到新家：<a href="${href}">${href}</a></p>
</body>
</html>
`
}

function* htmlPages(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      if (!name.startsWith('_')) yield* htmlPages(path)
    }
    else if (name === 'index.html') {
      yield relative(PUBLIC_DIR, dir)
    }
  }
}

rmSync(OUT_DIR, { recursive: true, force: true })
let count = 0
for (const page of htmlPages(PUBLIC_DIR)) {
  const target = page ? `${SITE_URL}/${page.split('/').map(encodeURIComponent).join('/')}/` : `${SITE_URL}/`
  mkdirSync(join(OUT_DIR, page), { recursive: true })
  writeFileSync(join(OUT_DIR, page, 'index.html'), redirectPage(target))
  count++
}

// 不在清單裡的舊網址：去掉 /Blog 前綴後轉到新站
writeFileSync(join(OUT_DIR, '404.html'), `<!doctype html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<title>部落格搬家囉 🌸</title>
<script>
  var path = location.pathname.replace(/^${OLD_BASE.replace('/', '\\/')}/, '') || '/'
  location.replace(${JSON.stringify(SITE_URL)} + path + location.search + location.hash)
</script>
</head>
<body><p>Antonio's blog 已經搬到新家：<a href="${SITE_URL}/">${SITE_URL}/</a></p></body>
</html>
`)
writeFileSync(join(OUT_DIR, '.nojekyll'), '')

console.log(`🔀 已產生 ${count} 個轉址頁 → ${SITE_URL}`)
