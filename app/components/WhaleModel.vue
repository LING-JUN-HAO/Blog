<script setup lang="ts">
import { gsap } from 'gsap'

// 首頁的 3D 可愛鯨魚（「努力夢想有一天變成大鯨魚」）；模型由 Codex 依設計規格以 Three.js 幾何組成
const container = useTemplateRef('container')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

let dispose: (() => void) | undefined

onMounted(async () => {
  const el = container.value
  if (!el) return

  const [THREE, { createWhale }] = await Promise.all([import('three'), import('~/three/createWhale')])

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  el.appendChild(renderer.domElement)

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

  const whale = createWhale(THREE, { body: '#283c94', belly: '#ece9e2', accent: '#e9728f', ink: '#121726' })
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

  const render = () => renderer.render(scene, camera)
  let stopMotion: (() => void) | undefined

  if (reducedMotion.value) {
    render()
  }
  else {
    // 跟著指標轉頭；其餘只有模型本身很輕的待機動畫
    const turnY = gsap.quickTo(pivot.rotation, 'y', { duration: 0.9, ease: 'power3.out' })
    const turnX = gsap.quickTo(pivot.rotation, 'x', { duration: 0.9, ease: 'power3.out' })
    const onPointerMove = (event: PointerEvent) => {
      turnY(baseTurn + (event.clientX / window.innerWidth - 0.5) * 1.0)
      turnX(baseTilt + (event.clientY / window.innerHeight - 0.5) * 0.5)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    // 點一下鯨魚：跳起來噴一大把水
    const onPointerDown = () => whale.splash()
    el.addEventListener('pointerdown', onPointerDown)
    el.classList.add('cursor-pointer')

    gsap.from(pivot.scale, { x: 0.7, y: 0.7, z: 0.7, duration: 1.2, ease: 'elastic.out(1, 0.5)' })
    const tick = (time: number) => {
      whale.animate(time)
      render()
    }
    gsap.ticker.add(tick)

    stopMotion = () => {
      window.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerdown', onPointerDown)
      gsap.ticker.remove(tick)
      gsap.killTweensOf(pivot.rotation)
      gsap.killTweensOf(pivot.scale)
    }
  }

  dispose = () => {
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
  <div
    ref="container"
    class="aspect-square [&>canvas]:block [&>canvas]:size-full"
    role="img"
    aria-label="3D 可愛鯨魚：努力夢想有一天變成大鯨魚"
  />
</template>
