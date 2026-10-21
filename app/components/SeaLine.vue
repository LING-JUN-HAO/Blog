<script setup lang="ts">
// GSAP 在掛載後才動態載入，不放進每一頁都要下載的入口 chunk
let gsap: typeof import('gsap').gsap | undefined

// 首頁的海平面：載入時描線一次，之後跟著滑鼠起伏（小蝦米游過的水波）
// 手機版鯨魚浮在這條線上：線下方是一層半透明的水，蓋住鯨魚泡在水裡的半身；鯨魚激起的漣漪由 ripple() 傳進來，從牠的位置往兩側盪開
const props = defineProps<{
  /** 浮在海面上的東西（鯨魚），漣漪從它的水平中心盪開 */
  anchor?: HTMLElement | null
}>()

const WIDTH = 1200
const HEIGHT = 120
const BASE_Y = 70
const STEPS = 120

const svg = useTemplateRef('svg')
const path = useTemplateRef('path')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const water = useTemplateRef('water')
const veil = useTemplateRef('veil')
const id = useId()

const wave = { phase: 0, bumpX: WIDTH / 2, bumpAmp: 0 }

// 漣漪：以 px 計算距離，線被 preserveAspectRatio="none" 橫向拉伸時波紋才不會跟著變形
const RIPPLE_SPEED = 70
const RIPPLE_LIFE = 2.2
// 漣漪從鯨魚身體邊緣開始往外盪，水線在牠身上保持平穩，不會拱起來蓋住臉
const RIPPLE_START = 0.32
// origin / start 在漣漪真正開始（延遲結束）時才記下：之後鯨魚游走，已經盪開的波紋留在原地，不會跟著被拖走
let rings: { age: number, strength: number, origin?: number, start?: number }[] = []
const box = useElementBounding(svg)
const anchorBox = useElementBounding(() => props.anchor)

function ripple(strength: number, delay = 0) {
  if (reducedMotion.value || rings.length > 12) return
  rings.push({ age: -delay, strength })
}
defineExpose({ ripple })

/**
 * 一圈漣漪的形狀：一道平滑的波峰從鯨魚身邊往外推，前 0.2 秒慢慢浮起（不會突然冒出尖角），
 * 越往外越寬、越淡；後面只跟著很淺的一點波谷，不會變成一串細碎的鋸齒
 * x 與 origin 都是 viewBox 座標；scale 把距離換成 px
 */
function rippleAt(x: number, scale: number) {
  let lift = 0
  for (const ring of rings) {
    if (ring.age <= 0 || ring.age >= RIPPLE_LIFE || ring.origin === undefined) continue
    const width = 14 + ring.age * 16
    const offset = Math.abs(x - ring.origin) * scale - ring.start! - ring.age * RIPPLE_SPEED
    const rise = Math.min(1, ring.age / 0.2)
    const fade = (1 - ring.age / RIPPLE_LIFE) ** 1.5
    lift += ring.strength * 6 * rise * rise * (3 - 2 * rise) * fade
      * Math.exp(-(offset ** 2) / (2 * width ** 2)) * Math.cos(offset / (width * 0.8))
  }
  return lift
}

function buildPath() {
  const scale = box.width.value / WIDTH || 1
  const rippling = rings.length > 0 && anchorBox.width.value > 0
  if (rippling) {
    const anchorX = (anchorBox.left.value + anchorBox.width.value / 2 - box.left.value) / scale
    for (const ring of rings) {
      if (ring.age > 0 && ring.origin === undefined) {
        ring.origin = anchorX
        ring.start = anchorBox.width.value * RIPPLE_START
      }
    }
  }
  // 大約每 3px 一個點：波紋只有約 60px 寬，桌機上點太稀會畫成折線
  const steps = Math.min(400, Math.max(STEPS, Math.ceil(box.width.value / 3)))
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const x = (WIDTH / steps) * i
    const swell = Math.sin(x / 95 + wave.phase) * 4 + Math.sin(x / 41 + wave.phase * 1.7) * 1.5
    const bump = wave.bumpAmp * Math.exp(-((x - wave.bumpX) ** 2) / (2 * 70 ** 2))
    const lift = rippling ? rippleAt(x, scale) : 0
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${(BASE_Y + swell - bump - lift).toFixed(1)}`
  }
  return d
}

function render() {
  const d = buildPath()
  path.value?.setAttribute('d', d)
  const body = `${d}L${WIDTH} ${HEIGHT}L0 ${HEIGHT}Z`
  water.value?.setAttribute('d', body)
  veil.value?.setAttribute('d', body)
}

let lastY = 0
let moveX: ((value: number) => void) | undefined

// 海浪線疊在鯨魚前面、不攔截指標（鯨魚才拖得動、點得到），改在 window 上聽，只處理經過海面的指標
function onPointerMove(event: PointerEvent) {
  if (reducedMotion.value || !svg.value || !gsap || event.pointerType !== 'mouse') return
  const rect = svg.value.getBoundingClientRect()
  if (event.clientY < rect.top || event.clientY > rect.bottom || event.clientX < rect.left || event.clientX > rect.right) return
  // 指標在鯨魚身上（點牠、拖牠）時不掀水波，不然水會在牠正下方拱起來蓋住臉
  const whale = props.anchor?.getBoundingClientRect()
  if (whale && event.clientX >= whale.left && event.clientX <= whale.right && event.clientY >= whale.top && event.clientY <= whale.bottom) return
  const x = ((event.clientX - rect.left) / rect.width) * WIDTH
  const speed = Math.min(36, Math.abs(event.clientY - lastY) + Math.abs(event.movementX) * 0.4)
  lastY = event.clientY
  moveX?.(x)
  gsap.to(wave, { bumpAmp: Math.max(wave.bumpAmp, speed), duration: 0.25, ease: 'power2.out', overwrite: 'auto', onComplete: settle })
}

function settle() {
  gsap?.to(wave, { bumpAmp: 0, duration: 1.6, ease: 'elastic.out(1, 0.3)' })
}

// 捲出畫面就停止海浪的 ticker
useEventListener(import.meta.client ? window : null, 'pointermove', onPointerMove, { passive: true })

const inView = useElementVisibility(svg)
let stopTicking: (() => void) | undefined

onMounted(async () => {
  render()
  if (reducedMotion.value || !path.value) return

  // 先同步藏起線條，等 GSAP 載入後再描出來，避免先閃一下完整的線
  const length = path.value.getTotalLength()
  path.value.style.strokeDasharray = `${length}`
  path.value.style.strokeDashoffset = `${length}`
  gsap = (await import('gsap')).gsap
  if (!path.value) return
  gsap.to(path.value, {
    strokeDashoffset: 0,
    duration: 1.8,
    ease: 'power2.inOut',
    onComplete: () => path.value?.removeAttribute('style'),
  })
  // 水面跟著描線慢慢浮現
  gsap.from([water.value, veil.value], { opacity: 0, duration: 1.2, delay: 0.8, ease: 'power1.out' })
  moveX = gsap.quickTo(wave, 'bumpX', { duration: 0.5, ease: 'power3.out' })
  // 寫在 await 之後的 watch 不會跟著元件卸載自動停止，在 onBeforeUnmount 手動停
  stopTicking = watch(inView, (visible) => {
    if (visible) gsap?.ticker.add(tick)
    else gsap?.ticker.remove(tick)
  }, { immediate: true })
})

// 觸控裝置上平靜的海面用 30fps 重畫（每幀要重設三條 SVG path，手機上重繪不便宜）；有漣漪或指標掀起水波時恢復 60fps
const coarse = import.meta.client && window.matchMedia('(pointer: coarse)').matches
let lastTime = 0
function tick(time: number) {
  const calm = !rings.length && wave.bumpAmp < 0.5
  if (coarse && calm && time - lastTime < 1 / 32) return
  const dt = Math.min(time - lastTime, 0.05)
  lastTime = time
  // 有延遲的漣漪不一定依加入順序結束，逐一過濾
  if (rings.length) rings = rings.filter(ring => (ring.age += dt) < RIPPLE_LIFE)
  // 鯨魚會游動（transform 不會觸發 useElementBounding 更新），有漣漪時每幀重新量牠的位置
  if (rings.length) anchorBox.update()
  // 相位依時間推進，降成 30fps 時海浪速度不變（原本每幀 0.012，以 60fps 計）
  wave.phase += dt * 0.72
  render()
}

onBeforeUnmount(() => {
  stopTicking?.()
  gsap?.ticker.remove(tick)
  gsap?.killTweensOf(wave)
  gsap?.killTweensOf([water.value, veil.value])
})
</script>

<template>
  <svg
    ref="svg"
    :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
    preserveAspectRatio="none"
    class="block h-28 w-full sm:h-24"
    aria-hidden="true"
  >
    <!-- 線下的水：有東西浮在線上（鯨魚）時才畫。veil 是頁面底色，讓鯨魚泡在水裡的半身變淡；water 是一抹往下淡出的海色 -->
    <g v-if="anchor !== undefined">
      <defs>
        <linearGradient
          :id="`${id}-veil`"
          gradientUnits="userSpaceOnUse"
          x1="0"
          :y1="BASE_Y - 6"
          x2="0"
          :y2="HEIGHT"
        >
          <stop
            offset="0"
            stop-color="var(--paper)"
            stop-opacity="0.5"
          />
          <stop
            offset="1"
            stop-color="var(--paper)"
            stop-opacity="0.95"
          />
        </linearGradient>
        <linearGradient
          :id="`${id}-water`"
          gradientUnits="userSpaceOnUse"
          x1="0"
          :y1="BASE_Y - 6"
          x2="0"
          :y2="HEIGHT"
        >
          <stop
            offset="0"
            stop-color="var(--accent)"
            stop-opacity="0.1"
          />
          <stop
            offset="1"
            stop-color="var(--accent)"
            stop-opacity="0"
          />
        </linearGradient>
      </defs>
      <path
        ref="veil"
        :fill="`url(#${id}-veil)`"
      />
      <path
        ref="water"
        :fill="`url(#${id}-water)`"
      />
    </g>
    <path
      ref="path"
      fill="none"
      stroke="var(--accent)"
      stroke-width="2"
      vector-effect="non-scaling-stroke"
      stroke-linecap="round"
    />
  </svg>
</template>
