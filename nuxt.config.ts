// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdirSync, readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'

const showDrafts = process.env.BLOG_DRAFTS === '1'

// Hexo 時期的 /archives/YYYY/MM/ 等網址沒有站內連結，需要手動列進 prerender
const archiveRoutes = [...new Set(
  readdirSync('content/_posts')
    .map(name => name.match(/^(\d{4})-(\d{2})-/))
    .flatMap(match => (match ? [`/archives/${match[1]}/`, `/archives/${match[1]}/${match[2]}/`] : [])),
)]

// 轉載文章（front-matter 有 canonical，例如 iThome 鐵人賽）的正本在別處，不放進 sitemap
const syndicatedRoutes = readdirSync('content/_posts')
  .filter(name => name.endsWith('.md') && /^canonical:/m.test(readFileSync(`content/_posts/${name}`, 'utf8')))
  .map(name => `/${name.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')}/`)

// 正式網址；換自訂網域時改這裡（或設定環境變數 NUXT_SITE_URL）
const SITE_URL = process.env.NUXT_SITE_URL ?? 'https://ling-jun-hao-blog.vercel.app'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxtjs/seo',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@nuxt/scripts',
    '@nuxt/eslint',
    '@vueuse/nuxt',
  ],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-TW' },
      meta: [
        // Google Search Console 網域擁有權驗證
        { name: 'google-site-verification', content: '9gyoQrUz80KH3wnZXdrwAOaHNlwOEUUW-Ef2egyP-ZI' },
        { name: 'theme-color', content: '#fbfcfd', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0e1626', media: '(prefers-color-scheme: dark)' },
      ],
      script: [
        {
          // 網頁字型延到 load 之後、瀏覽器閒置時才套用（見 main.css 的 .fonts-ready）；lazy 圖片不會擋 load，
          // 所以再等畫面內的圖片載完（最多 5 秒），首屏與 LCP 圖片畫完才開始下載字型；
          // 同一個分頁載過一次就有快取，直接套用避免閃字
          key: 'fonts-ready',
          tagPosition: 'head',
          innerHTML: `(function(){var r=document.documentElement,k='blog-fonts-ready',on=function(){r.classList.add('fonts-ready');try{sessionStorage.setItem(k,'1')}catch(e){}};try{if(sessionStorage.getItem(k)){on();return}}catch(e){}var ready=function(){var h=innerHeight,w=[].filter.call(document.images,function(i){var b=i.getBoundingClientRect();return !i.complete&&b.bottom>0&&b.top<h&&b.width>0});if(!w.length)return on();var n=w.length,t=setTimeout(on,5000),d=function(){if(--n<=0){clearTimeout(t);on()}};w.forEach(function(i){i.addEventListener('load',d,{once:true});i.addEventListener('error',d,{once:true})})},idle=function(){'requestIdleCallback' in window?requestIdleCallback(ready,{timeout:3000}):setTimeout(ready,300)};if(document.readyState==='complete')idle();else addEventListener('load',idle,{once:true})})()`,
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/images/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/images/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'Antonio\'s blog', href: '/rss.xml' },
        { rel: 'alternate', type: 'application/atom+xml', title: 'Antonio\'s blog', href: '/atom.xml' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: SITE_URL,
    name: 'Antonio\'s blog',
    description: '我是一隻前端小蝦米，努力夢想有一天變成大鯨魚',
    defaultLocale: 'zh-TW',
    trailingSlash: true,
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'blog-color-mode',
    // 切換瞬間停用所有 transition，避免各元件各自淡入、看起來有先後
    disableTransition: true,
  },

  content: {
    // 使用 Node 內建的 node:sqlite，不需要編譯 better-sqlite3（Vercel 建置環境編不起來）
    experimental: { sqliteConnector: 'native' },
    build: {
      markdown: {
        toc: { depth: 4, searchDepth: 4 },
        highlight: {
          theme: { default: 'github-light', dark: 'github-dark-dimmed' },
          langs: ['js', 'ts', 'html', 'css', 'json', 'sql', 'bash', 'vue', 'jsx', 'tsx', 'yaml', 'md'],
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      showDrafts,
      // GitHub 留言（Giscus）：repo 需開啟 Discussions 並安裝 giscus app，分類 ID 從 giscus.app 取得
      giscus: {
        repo: 'LING-JUN-HAO/Blog',
        repoId: 'R_kgDOKfES8A',
        category: 'Announcements',
        categoryId: 'DIC_kwDOKfES8M4DJN5e',
      },
    },
  },

  experimental: {
    // 頁面轉場使用 View Transitions API（不支援的瀏覽器直接切換）
    viewTransition: true,
    // 沿用 Hexo 的網址格式：/slug/
    defaults: {
      // 預設是連結一出現在畫面就預載該頁，列表頁會一次抓幾十篇；改成滑過、focus 或觸控時才預載
      nuxtLink: { trailingSlash: 'append', prefetchOn: { visibility: false, interaction: true } },
    },
  },
  compatibilityDate: '2026-10-01',

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/rss.xml', '/atom.xml', '/llms.txt', '/llms-full.txt', '/sitemap.xml', '/robots.txt', '/archives/page/2/', '/archives/page/3/', '/archives/2023/page/2/', ...archiveRoutes],
      failOnError: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  hooks: {
    // 動態載入的 chunk（Three.js、搜尋索引等）不要在頁面載入時就 prefetch，真的用到才下載
    'build:manifest': (manifest) => {
      for (const chunk of Object.values(manifest)) chunk.prefetch = false
    },
  },

  // llms.txt / llms-full.txt 由 server/routes 自己產生；AI Ready 在 vercel-static 輸出下不會寫出檔案
  aiReady: false,

  eslint: {
    config: { stylistic: true },
  },

  fonts: {
    families: [
      { name: 'LXGW WenKai TC', provider: 'google', weights: [400, 700], global: true },
      { name: 'Noto Sans TC', provider: 'google', weights: [400, 700], global: true },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 700] },
    ],
  },

  linkChecker: {
    // 舊網址本來就有大寫與中文（沿用 Hexo 時期的 slug），不視為問題
    skipInspections: ['no-uppercase-chars', 'no-non-ascii-chars'],
    // 這些檔案由模組在預渲染最後才產生，連結檢查當下還查不到
    excludeLinks: ['/sitemap.xml', '/rss.xml', '/atom.xml', '/llms.txt'],
  },

  ogImage: {
    // 全站靜態輸出，不需要執行期產圖
    zeroRuntime: true,
    // 文楷字型檔較大，預渲染時第一張圖載入字型會超過預設的 15 秒
    security: { renderTimeout: 60_000 },
  },

  schemaOrg: {
    identity: {
      type: 'Person',
      name: 'Antonio',
      alternateName: '凌俊豪',
      url: `${SITE_URL}/about/`,
      image: `${SITE_URL}/images/antonio.webp`,
      sameAs: [
        'https://github.com/LING-JUN-HAO',
        'https://www.linkedin.com/in/antonio-222984258/',
        'https://ithelp.ithome.com.tw/users/20116554/profile',
      ],
    },
  },

  scripts: {
    registry: {
      googleAnalytics: { id: 'G-XWTEE0094B' },
    },
  },

  // 舊網址有大小寫（如 /JS-1/），canonical 不能轉小寫
  seo: {
    canonicalLowercase: false,
    // 建置時壓縮預渲染 HTML 裡的 CSS，會讓 Content 內嵌的 Shiki <style> 與瀏覽器端對不上而 hydration 失敗
    minify: false,
    // X 會讀 og:*，twitter:* 已被 unhead 標為棄用（console 會跳警告）；og-image 也會跟著不輸出 twitter:image
    automaticTwitterTags: false,
  },

  sitemap: {
    // 分頁與舊版彙整分頁只是列表的重複內容
    exclude: ['/page/**', '/archives/page/**', '/archives/*/page/**', ...syndicatedRoutes],
  },

  // GitHub Pages 沒有可保存的建置快取，關掉舊版資源保留
  skewProtection: false,
})
