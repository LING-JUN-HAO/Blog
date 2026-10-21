import { defineCollection, defineContentConfig } from '@nuxt/content'
import { defineOgImageSchema, defineRobotsSchema, defineSchemaOrgSchema, defineSitemapSchema } from '@nuxtjs/seo/content'
import { z } from 'zod'

const showDrafts = process.env.BLOG_DRAFTS === '1'

// Hexo 舊文的 tags / categories 可能是 `- [X]` 巢狀寫法，統一攤平成字串陣列
const stringList = z.preprocess(
  value => (value == null ? [] : [value].flat(Infinity).filter(Boolean).map(String)),
  z.array(z.string()),
)

const seoFields = {
  robots: defineRobotsSchema(),
  sitemap: defineSitemapSchema(),
  ogImage: defineOgImageSchema(),
  schemaOrg: defineSchemaOrgSchema(),
}

const postSchema = z.object({
  ...seoFields,
  date: z.string().optional(),
  updated: z.string().optional(),
  tags: stringList.default([]),
  categories: stringList.default([]),
  slug: z.string().optional(),
  // 轉載文章的原文網址（例如 iThome 鐵人賽），會成為 canonical
  canonical: z.string().url().optional(),
  // 系列文章，例如 { name: '2024 iThome 鐵人賽：…', url: '…', day: 1 }
  series: z.object({ name: z.string(), url: z.string().url().optional(), day: z.number().optional() }).optional(),
  // 原始 Markdown，給 llms-full.txt 使用（Content 會自動填入）
  rawbody: z.string().optional(),
  // 以下由 content:file:afterParse hook 計算
  draft: z.boolean().default(false),
  wordCount: z.number().default(0),
  readingTime: z.number().default(0),
})

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      source: { include: '_posts/**/*.md', prefix: '/' },
      schema: postSchema,
    }),
    ...(showDrafts && {
      drafts: defineCollection({
        type: 'page',
        source: { include: '_drafts/**/*.md', prefix: '/' },
        schema: postSchema,
      }),
    }),
    pages: defineCollection({
      type: 'page',
      source: { include: 'pages/**/*.md', prefix: '/' },
      schema: z.object({
        ...seoFields,
        date: z.string().optional(),
        comments: z.boolean().default(false),
      }),
    }),
  },
})
