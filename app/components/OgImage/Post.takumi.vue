<script setup lang="ts">
// OG 分享圖模板（由 Codex 依設計規格產生）
const { title = 'Antonio\'s blog', description = '我是一隻前端小蝦米，努力夢想有一天變成大鯨魚', tags = [] } = defineProps<{
  title?: string
  description?: string
  tags?: string[]
}>()

const titleLength = computed(() => Array.from(title).length)
const titleSize = computed(() => {
  if (titleLength.value > 36)
    return 50
  if (titleLength.value > 28)
    return 56
  if (titleLength.value > 18)
    return 62
  return 70
})

const summary = computed(() => {
  const characters = Array.from(description)
  return characters.length > 64 ? `${characters.slice(0, 64).join('')}…` : description
})
</script>

<template>
  <div
    style="display: flex; width: 1200px; height: 600px; box-sizing: border-box; flex-direction: column; justify-content: space-between; overflow: hidden; background: #FBFCFD; padding: 62px 76px 58px; color: #17213A; font-family: 'Noto Sans TC';"
  >
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <svg
          width="42"
          height="42"
          viewBox="0 0 600 530"
          role="img"
          aria-label="Antonio 標誌"
        >
          <path
            fill="#313D3E"
            d="M303 80c13 3 17 10 8 18-22 15-35 33-34 60 1 16-6 22-23 24-72 7-126 65-124 139l2 57c1 14-6 22-19 23l-55 1c-18 1-27-8-26-26l1-49c-1-121 50-211 140-243 42-15 95-12 130-4Z"
          />
          <circle
            cx="247"
            cy="265"
            r="40"
            fill="#E39F3A"
          />
          <path
            fill="#D2643F"
            d="M328 125c-15 0-23 10-23 26v49c0 28 17 38 38 28l13-6c19-9 36 0 43 18 8 21-1 50-21 60-13 7-26 10-40 3l-15-7c-11-5-18 6-18 22v61c0 18 9 27 26 27l46-1c20 0 25 9 21 26-2 11-11 21-12 36-2 21 17 34 42 34 27 0 47-14 49-34 1-16-10-28-11-45-1-14 8-20 23-20l26 1c33 0 50-16 52-47 4-66 3-139-1-194-2-24-19-37-41-39l-30-1c-22-1-32-7-29-24 3-13 12-20 12-35 0-24-21-37-46-37s-45 13-46 34c-1 15 6 26 11 39 5 14-1 23-16 24Z"
          />
        </svg>
        <div style="display: flex; flex-direction: column;">
          <span style="font-family: 'LXGW WenKai TC'; font-size: 27px; line-height: 1.15; font-weight: 700;">Antonio's blog</span>
          <span style="margin-top: 5px; color: #5D6779; font-size: 16px; line-height: 1.2; letter-spacing: 0.08em;">前端小蝦米</span>
        </div>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; width: 100%;">
      <div
        :style="{
          display: 'flex',
          maxWidth: '1010px',
          color: '#17213A',
          fontFamily: `'LXGW WenKai TC'`,
          fontSize: `${titleSize}px`,
          fontWeight: '700',
          lineHeight: '1.18',
          letterSpacing: '-0.015em',
          overflowWrap: 'anywhere',
        }"
      >
        {{ title }}
      </div>

      <svg
        width="100%"
        height="30"
        viewBox="0 0 1048 30"
        fill="none"
        aria-hidden="true"
        style="display: flex; margin-top: 18px;"
      >
        <path
          d="M2 16c82-8 142-8 224 0s142 8 224 0 142-8 224 0 142 8 224 0c42-4 75-3 98 2"
          stroke="#E0517A"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>

      <div style="display: flex; margin-top: 18px; max-width: 980px; color: #5D6779; font-size: 24px; line-height: 1.55;">
        {{ summary }}
      </div>
    </div>

    <div style="display: flex; min-height: 28px; align-items: center; justify-content: space-between; border-top: 2px solid #E3E7EE; padding-top: 18px;">
      <div style="display: flex; align-items: center; gap: 22px; color: #5D6779; font-size: 18px; line-height: 1.4;">
        <span
          v-for="tag in tags.slice(0, 4)"
          :key="tag"
        >#{{ tag }}</span>
      </div>
      <span style="color: #5D6779; font-family: 'LXGW WenKai TC'; font-size: 18px; line-height: 1.4;">ling-jun-hao-blog.vercel.app</span>
    </div>
  </div>
</template>
