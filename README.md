<p align="center">
  <img src="public/images/logo.svg" alt="Antonio 的商標" width="96">
</p>

<h1 align="center">Antonio's blog</h1>

<p align="center">
  我是一隻前端小蝦米，努力夢想有一天變成大鯨魚。<br>
  <a href="https://antonio-ling.com">antonio-ling.com</a>
</p>

這是凌俊豪（Antonio）的繁體中文技術部落格，記錄前端、後端與開發工具的學習筆記，也收錄三屆 iThome 鐵人賽的完整系列：

- 2026：[Angular 22 Signal 進化論](https://ithelp.ithome.com.tw/users/20116554/ironman/9939)
- 2025：[Line Bot × NestJS：30 天開發日記](https://ithelp.ithome.com.tw/users/20116554/ironman/8779)
- 2024：[Vue 3 初學者：用實作帶你看過核心概念](https://ithelp.ithome.com.tw/users/20116554/ironman/7800)

對文章有任何想法，歡迎在文章下方用 GitHub 帳號留言，或到 [Discussions](https://github.com/LING-JUN-HAO/Blog/discussions) 交流。

## 技術

- **框架**：Nuxt 4、Nuxt Content v3（Markdown 文章，全站靜態輸出）
- **樣式**：Tailwind CSS v4、LXGW WenKai TC／Noto Sans TC
- **互動**：VueUse、GSAP、Three.js、View Transitions API
- **SEO**：@nuxtjs/seo（sitemap、robots、schema.org、OG 分享圖）、RSS、llms.txt
- **留言**：Giscus（GitHub Discussions）
- **部署**：Vercel，網域 `antonio-ling.com`；舊網址 `ling-jun-hao.github.io/Blog/` 與 `ling-jun-hao-blog.vercel.app` 都轉址到新網域

## 開始開發

需要 Node.js 24（版本見 `.nvmrc`）與 pnpm。

```bash
nvm use
pnpm install
pnpm blog server
```

打開 <http://localhost:3000>。

## 寫文章

指令沿用 Hexo 的習慣：

| 指令 | 說明 |
|---|---|
| `pnpm blog new "標題" [--slug my-post]` | 新增文章到 `content/_posts/YYYY-MM-DD-<slug>.md` |
| `pnpm blog new draft "標題" [--slug my-post]` | 新增草稿到 `content/_drafts/<slug>.md` |
| `pnpm blog publish <slug>` | 草稿移到 `_posts`，檔名補上日期並寫入發布時間 |
| `pnpm blog server [--drafts]` | 本機預覽；加 `--drafts` 才會顯示草稿 |
| `pnpm blog generate` | 產生靜態網站到 `.output/public` |
| `pnpm blog preview` | 預覽產生好的網站（<http://localhost:4173>） |
| `pnpm blog clean` | 清除建置快取 |

文章網址是 `/<slug>/`，slug 預設取自檔名（去掉日期）。front-matter 範例：

```yaml
---
title: 文章標題
date: 2026-10-21 10:00:00
tags:
  - TypeScript
categories:
  - 前端開發
description: 一兩句摘要，會用在列表、搜尋結果與分享圖
---
```

草稿只在 `--drafts` 模式下存在，正式建置不會輸出。

## 檢查與部署

| 指令 | 說明 |
|---|---|
| `pnpm lint` / `pnpm lint:fix` | ESLint 檢查／自動修正 |
| `pnpm typecheck` | 型別檢查 |
| `pnpm build` | 產生靜態網站，同時檢查所有連結 |
| `pnpm commit` | 用 Commitizen 撰寫 commit 訊息 |

- Commit 時 Husky 會自動跑 ESLint 與 commitlint（conventional commits 格式）。
- 推到 `master` 後：Vercel 自動部署正式網站，GitHub Actions 執行檢查並更新舊網址的轉址站。
