# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Antonio 的繁體中文技術部落格。原本是 Hexo，已改寫成 Nuxt 4 + Nuxt Content v3 的全靜態網站（`nuxt generate`），部署在 Vercel（`https://ling-jun-hao-blog.vercel.app`）。

## 環境與指令

- Node 版本看 `.nvmrc`（24.21）。`@nuxtjs/seo` v6 要求 Node `^22.22.3 || ^24.15.0`，太舊的 Node 會建置失敗；套件管理用 pnpm。
- 寫文章用類 Hexo 的 CLI（`scripts/blog.ts`）：
  - `pnpm blog new "標題" [--slug x]`：新增到 `content/_posts/YYYY-MM-DD-<slug>.md`
  - `pnpm blog new draft "標題" [--slug x]`：新增到 `content/_drafts/<slug>.md`
  - `pnpm blog publish <slug>`：草稿搬到 `_posts`，檔名補日期、front-matter 寫入 `date`
  - `pnpm blog server [--drafts]`：`nuxt dev`；`--drafts` 才會顯示草稿
  - `pnpm blog generate` / `pnpm blog preview`（預覽 `.output/public`，port 4173）/ `pnpm blog clean`
- 檢查：`pnpm lint`（`lint:fix` 自動修）、`pnpm typecheck`、`pnpm build`。沒有單元測試；建置時 `nuxt-link-checker` 會檢查所有連結，`failOnError: true`，壞連結或預渲染錯誤會讓建置失敗。
- 本機 `nuxt generate` 可能因防毒軟體（WithSecure）掃描上千個輸出檔而極慢甚至逾時；完整驗證改用 `vercel deploy`（preview，Vercel 遠端建置）。preview 有登入保護，用 `vercel curl <path> --deployment <url>` 檢查。
- 作者常自己開著 `nuxt dev`（:3000）；要另開測試用 `NUXT_IGNORE_LOCK=1 pnpm exec nuxt dev --port 3123`，不要停掉他的程序。
- `.vercelignore` 排除 `.output`、`.nuxt` 等本機產物：少了它，`vercel deploy` 會把本機舊的 `.output/public/llms.txt` 一起上傳並蓋掉新產生的檔案。
- Commit 由 Husky 檢查：pre-commit 跑 lint-staged（ESLint），commit-msg 跑 commitlint（`commitlint.config.mjs`：conventional 類型清單、禁止訊息出現 AI 相關字詞）。

## 架構重點

- **網址必須與 Hexo 時期相同**：文章是 `/<slug>/`（slug 是檔名去掉 `YYYY-MM-DD-`，可用 front-matter `slug` 覆寫，大小寫保留），標籤／分類是 `/tags/<slug>/`、`/categories/<slug>/`，slug 規則在 `app/utils/blog.ts` 的 `slugize`（與 hexo-util 相同）。因此 `seo.canonicalLowercase: false`、NuxtLink 一律補結尾斜線、link-checker 略過大寫與中文網址檢查。
- **內容管線**：`content.config.ts` 定義 `posts`、`pages`，以及只在 `BLOG_DRAFTS=1` 時才存在的 `drafts` collection，所以正式建置不可能輸出草稿。`modules/blog-content.ts` 在 `content:file:afterParse` 計算 `path`、`slug`、`draft`、把無時區日期轉成 `+08:00`、字數與閱讀時間、sitemap `lastmod`；新增衍生欄位時要同時加進 schema 才會存進資料庫。Hexo 舊文的巢狀 `- [X]` tags 由 schema 的 preprocess 攤平。
- **轉載文章**（iThome 鐵人賽 90 篇，`ithome-<年>-day-NN`）：front-matter 有 `canonical`（指向 iThome 原文）與 `series`。文章頁會覆寫 canonical、不顯示留言區；`nuxt.config.ts` 掃描 `content/_posts` 把有 `canonical` 的文章排除在 sitemap 外；首頁與 `/page/N` 的文章流只列一般文章（鐵人賽另有系列區塊），每頁 10 篇以對上舊的 `/page/2/`、`/page/3/`。
- **nuxt.config.ts 在建置時讀檔**：`SITE_URL`（可用 `NUXT_SITE_URL` 覆寫，換網域改這裡）、轉載文章的 sitemap 排除、舊 `/archives/YYYY/MM/` 的預渲染路由，都是直接讀 `content/_posts` 產生的。
- **SEO 由 `@nuxtjs/seo` v6 處理**（sitemap、robots、schema.org、og-image）。AI Ready 子模組關閉（`aiReady: false`）：它在 Vercel 的 `vercel-static` 輸出下不會寫出檔案，所以 `llms.txt`／`llms-full.txt` 改由 `server/routes/` 自己產生並預渲染（共用 `server/utils/llms.ts`，全文來自 schema 的 `rawbody`）。注意：`seo.minify` 必須維持 `false`，否則建置時壓縮 HTML 內的 CSS 會讓 Content 輸出的 Shiki `<style>` 與客戶端不一致而 hydration 失敗。OG 圖用 Takumi renderer 的 `app/components/OgImage/*.takumi.vue`，`zeroRuntime: true`，字型較大所以 `renderTimeout` 調到 60 秒。
- **Content 資料庫**用 Node 內建的 `node:sqlite`（`content.experimental.sqliteConnector: 'native'`）；不要裝回 `better-sqlite3`，Vercel 建置環境編譯不了它。
- **RSS**：`server/routes/rss.xml.ts`、`atom.xml.ts` 共用 `server/utils/feed.ts`（最新 20 篇）。
- **留言**：用 Giscus（GitHub Discussions，`GiscusComments.vue`，設定在 `runtimeConfig.public.giscus`），以文章 slug 對應討論串（`data-mapping: specific`），換網域不受影響；捲到留言區附近才載入。原本的 Disqus 已移除（它載入的廣告與登入腳本會在頁面上產生錯誤）。
- **品牌**：頁首與 favicon／OG 圖用作者自己的商標（`public/images/logo.svg`，深色模式用 `logo-dark.svg`），首頁與錯誤頁的 3D 可愛鯨魚是 `app/three/createWhale.ts`（Three.js 幾何組成，由 `WhaleModel.vue` 在 `<ClientOnly>` 內載入）。
- **設計系統**：簡約風，色彩／字體 token 在 `app/assets/css/main.css`（`--paper`、`--ink`、`--accent` 等，`.dark` 覆寫），標題字 LXGW WenKai TC。圖示是專案自有的線條 SVG（`app/assets/icons/`，由 Codex 依設計規格繪製），透過 `<AppIcon name>` 使用；首頁有 GSAP 海平面線 `SeaLine.vue`；頁面轉場用 View Transitions API（`experimental.viewTransition`，文章標題以 `titleTransitionName()` 在列表與文章頁 morph）。互動邏輯優先用 VueUse。
- 需要 template ref 的純前端元件不要用 `.client.vue`：放在預渲染頁面時 hydration 後 ref 會是 `null`。改成一般元件，在使用處包 `<ClientOnly>`（並給同尺寸 `#fallback` 避免版面跳動），參考 `WhaleModel.vue`。
- 新文章的 Giscus 討論串在第一則留言時才建立，之前 console 會有一則「Discussion not found」警告（不是錯誤）。
- 驗證頁面錯誤時，Playwright 無頭瀏覽器開 CodePen 會被 Cloudflare 回 403，WebGL 也會出現「GPU stall」提示，兩者都是自動化環境才有；以真實 Chrome 的 console 為準。
- 圖示、商標、favicon、OG 圖、3D 模型等視覺素材，作者要求一律請 Codex 產生（`codex exec -s workspace-write -C <暫存資料夾> --skip-git-repo-check -o <結果檔> - < brief.md`；prompt 要從 stdin 給，否則會卡在等待輸入），審稿後再整合。favicon PNG 由 `public/favicon.svg` 渲染出 32／180／192／512 四種尺寸。
- **舊網址轉址**：舊站 `ling-jun-hao.github.io/Blog/` 由 `.github/workflows/redirect.yml` 建置網站後執行 `scripts/build-redirects.ts`，把每個頁面產生成轉址頁發布到 GitHub Pages（repo 的 Pages 來源須為 GitHub Actions，即 `build_type: workflow`）；網站本體在 Vercel 專案 `ling-jun-hao-blog`（已連結 GitHub，`master` 自動部署；`vercel.json`）。

## 協作偏好

- 回覆一律用繁體中文；建置、部署等長時間工作要主動回報每個階段的進度，不要等作者提醒。
- `git push --force`、刪除分支等破壞性 git 操作會被 Claude Code 的安全機制擋下：給作者可直接貼上的 `!` 指令（`!` 前不能有空格），由作者本人執行，並說明每一步成功時會看到什麼。
- 部署後要實際打開頁面檢查錯誤（console、失敗請求、4xx／5xx），外部服務的錯誤也要列出並說明是否需要處理。
