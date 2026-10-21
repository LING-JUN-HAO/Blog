<script setup lang="ts">
// 首頁的 3D 可愛鯨魚（「努力夢想有一天變成大鯨魚」）；模型由 Codex 依設計規格以 Three.js 幾何組成
const props = withDefaults(defineProps<{
  /** 畫出鯨魚自己的一小片海面與漣漪；頁面另外畫海面（手機版的 SeaLine）時關掉 */
  sea?: boolean
}>(), { sea: true })
// 鯨魚激起漣漪時通知外面，讓頁面上的海面跟著盪開（delay 單位為秒）
const emit = defineEmits<{ ripple: [strength: number, delay: number] }>()
const container = useTemplateRef('container')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
// 捲出畫面或切到背景分頁就暫停動畫，不佔主執行緒
const inView = useElementVisibility(container)
const pageVisibility = useDocumentVisibility()
const running = computed(() => inView.value && pageVisibility.value === 'visible')
const interactive = ref(false)

let dispose: (() => void) | undefined
// 每做完一段就讓出主執行緒：初始化拆成幾個短任務，手機上才不會連續擋住捲動與點擊
const yieldToMain = () => new Promise<void>(resolve => setTimeout(resolve, 0))

onMounted(async () => {
  const el = container.value
  if (!el) return

  // 等瀏覽器閒置再載入 Three.js 與 GSAP，避開首屏載入時的主執行緒
  await new Promise<void>(resolve => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout: 2000 }) : setTimeout(resolve, 300)))
  if (!container.value) return
  const [THREE, { createWhale }, { gsap }] = await Promise.all([import('three'), import('~/three/createWhale'), import('gsap')])
  await yieldToMain()
  if (!container.value) return

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  // 觸控裝置上鯨魚只有 144px 寬，解析度上限 1.5 倍就夠清楚，GPU 每幀少畫將近一半的像素
  const coarse = window.matchMedia('(pointer: coarse)').matches
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  el.appendChild(renderer.domElement)
  await yieldToMain()

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200)
  camera.position.set(0, 2, 46)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.HemisphereLight(0xdfe4ff, 0x17213a, 1.15))
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
  keyLight.position.set(-14, 20, 26)
  scene.add(keyLight)
  // 背後一道淡紫藍輪廓光，深色模式下輪廓才不會融進背景
  const rimLight = new THREE.DirectionalLight(0xa9b4ff, 1.1)
  rimLight.position.set(18, 10, -24)
  scene.add(rimLight)

  const whale = createWhale(
    THREE,
    { body: '#283c94', belly: '#ece9e2', accent: '#e9728f', ink: '#121726' },
    { onRipple: (strength, delay) => emit('ripple', strength, delay) },
  )
  whale.setSea(props.sea)
  await yieldToMain()
  const stopSea = watch(() => props.sea, value => whale.setSea(value))
  // 模型的頭朝 +X、相機在 +Z：轉約 55° 成四分之三側面，臉朝向畫面，往上翹的尾巴也看得到
  const baseTurn = -0.95
  const baseTilt = 0.08
  const pivot = new THREE.Group()
  pivot.add(whale.group)
  pivot.rotation.set(baseTilt, baseTurn, 0)
  scene.add(pivot)

  const resize = () => {
    const { width, height } = el.getBoundingClientRect()
    renderer.setSize(width, height, false)
    camera.aspect = width / height || 1
    camera.updateProjectionMatrix()
  }
  resize()
  const observer = new ResizeObserver(resize)
  observer.observe(el)

  // 先非同步編譯 shader（瀏覽器支援 KHR_parallel_shader_compile 時不佔主執行緒），第一次繪製才不會卡住幾百毫秒
  await renderer.compileAsync(scene, camera)
  if (!container.value) {
    stopSea()
    observer.disconnect()
    whale.dispose()
    renderer.dispose()
    return
  }

  const render = () => renderer.render(scene, camera)
  let stopMotion: (() => void) | undefined

  if (reducedMotion.value) {
    render()
  }
  else {
    // 觸控裝置閒置時用 30fps 畫（待機動作很慢，看不出差別），手機上主執行緒與 GPU 的負擔減半；
    // 剛出場的彈跳和點了鯨魚之後的水花恢復 60fps
    let fullRateUntil = gsap.ticker.time + 1.5
    let lastFrame = -1
    // 跟著指標轉頭；其餘只有模型本身很輕的待機動畫
    const turnY = gsap.quickTo(pivot.rotation, 'y', { duration: 0.9, ease: 'power3.out' })
    const turnX = gsap.quickTo(pivot.rotation, 'x', { duration: 0.9, ease: 'power3.out' })
    const onPointerMove = (event: PointerEvent) => {
      turnY(baseTurn + (event.clientX / window.innerWidth - 0.5) * 1.0)
      turnX(baseTilt + (event.clientY / window.innerHeight - 0.5) * 0.5)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    // 滑鼠移上去：搖尾巴、瞇眼、臉紅；手機沒有 hover，點一下維持 1.5 秒
    const { start: endTouchHover } = useTimeoutFn(() => whale.setHover(false), 1500, { immediate: false })
    const stopEnter = useEventListener(el, 'pointerenter', (event: PointerEvent) => event.pointerType === 'mouse' && whale.setHover(true))
    const stopLeave = useEventListener(el, 'pointerleave', (event: PointerEvent) => event.pointerType === 'mouse' && whale.setHover(false))
    // 點一下鯨魚：跳起來噴出比平常更大的水柱，落水時濺起水花
    const stopDown = useEventListener(el, 'pointerdown', (event: PointerEvent) => {
      fullRateUntil = gsap.ticker.time + 3
      whale.splash(1.8)
      if (event.pointerType !== 'mouse') {
        whale.setHover(true)
        endTouchHover()
      }
    })
    const stopKey = useEventListener(el, 'keydown', (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      whale.splash(1.8)
    })
    interactive.value = true

    gsap.from(pivot.scale, { x: 0.7, y: 0.7, z: 0.7, duration: 1.2, ease: 'elastic.out(1, 0.5)' })
    const tick = (time: number) => {
      if (coarse && time > fullRateUntil && time - lastFrame < 1 / 32) return
      lastFrame = time
      whale.animate(time)
      render()
    }
    const stopRunning = watch(running, (value) => {
      if (value) gsap.ticker.add(tick)
      else gsap.ticker.remove(tick)
    }, { immediate: true })

    stopMotion = () => {
      window.removeEventListener('pointermove', onPointerMove)
      stopEnter()
      stopLeave()
      stopDown()
      stopKey()
      stopRunning()
      gsap.ticker.remove(tick)
      gsap.killTweensOf(pivot.rotation)
      gsap.killTweensOf(pivot.scale)
    }
  }

  dispose = () => {
    stopSea()
    stopMotion?.()
    observer.disconnect()
    whale.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
})

onBeforeUnmount(() => dispose?.())
</script>

<template>
  <!-- 有動畫時是可以點的按鈕；減少動態效果時只是一張圖 -->
  <div
    ref="container"
    class="aspect-square rounded-full outline-offset-4 [&>canvas]:block [&>canvas]:size-full"
    :class="{ 'cursor-pointer': interactive }"
    :role="interactive ? 'button' : 'img'"
    :tabindex="interactive ? 0 : undefined"
    :aria-label="interactive ? '3D 可愛鯨魚，點一下讓牠噴水' : '3D 可愛鯨魚：努力夢想有一天變成大鯨魚'"
  />
</template>
