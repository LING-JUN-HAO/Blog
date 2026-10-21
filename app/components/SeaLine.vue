<script setup lang="ts">
import { gsap } from 'gsap'

// 首頁的海平面：載入時描線一次，之後跟著滑鼠起伏（小蝦米游過的水波）
const WIDTH = 1200
const HEIGHT = 120
const BASE_Y = 70
const STEPS = 120

const svg = useTemplateRef('svg')
const path = useTemplateRef('path')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const wave = { phase: 0, bumpX: WIDTH / 2, bumpAmp: 0 }

function buildPath() {
  let d = ''
  for (let i = 0; i <= STEPS; i++) {
    const x = (WIDTH / STEPS) * i
    const swell = Math.sin(x / 95 + wave.phase) * 4 + Math.sin(x / 41 + wave.phase * 1.7) * 1.5
    const bump = wave.bumpAmp * Math.exp(-((x - wave.bumpX) ** 2) / (2 * 70 ** 2))
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${(BASE_Y + swell - bump).toFixed(1)}`
  }
  return d
}

function render() {
  path.value?.setAttribute('d', buildPath())
}

let lastY = 0
let moveX: gsap.QuickToFunc | undefined

function onPointerMove(event: PointerEvent) {
  if (reducedMotion.value || !svg.value) return
  const rect = svg.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * WIDTH
  const speed = Math.min(36, Math.abs(event.clientY - lastY) + Math.abs(event.movementX) * 0.4)
  lastY = event.clientY
  moveX?.(x)
  gsap.to(wave, { bumpAmp: Math.max(wave.bumpAmp, speed), duration: 0.25, ease: 'power2.out', overwrite: 'auto', onComplete: settle })
}

function settle() {
  gsap.to(wave, { bumpAmp: 0, duration: 1.6, ease: 'elastic.out(1, 0.3)' })
}

onMounted(() => {
  render()
  if (reducedMotion.value || !path.value) return

  const length = path.value.getTotalLength()
  gsap.fromTo(path.value, { strokeDasharray: length, strokeDashoffset: length }, {
    strokeDashoffset: 0,
    duration: 1.8,
    ease: 'power2.inOut',
    onComplete: () => path.value?.removeAttribute('style'),
  })
  moveX = gsap.quickTo(wave, 'bumpX', { duration: 0.5, ease: 'power3.out' })
  gsap.ticker.add(tick)
})

function tick() {
  wave.phase += 0.012
  render()
}

onBeforeUnmount(() => {
  gsap.ticker.remove(tick)
  gsap.killTweensOf(wave)
})
</script>

<template>
  <svg
    ref="svg"
    :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
    preserveAspectRatio="none"
    class="block h-20 w-full touch-pan-y sm:h-24"
    aria-hidden="true"
    @pointermove="onPointerMove"
  >
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
