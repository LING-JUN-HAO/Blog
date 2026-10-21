<script setup lang="ts">
const { src, alt } = defineProps<{ src: string, alt?: string, width?: string | number, height?: string | number }>()

const label = computed(() => alt || '文章插圖')
// 文章開頭的封面圖在首屏，用高優先序立即載入；其餘延後到捲動接近時才載（封面由文章頁 provide）
const first = inject<string | undefined>('prose-img-cover', undefined) === src
// 文內最寬 1600px（內文欄 50rem 在 2x 螢幕約 1600px）；放大時用原尺寸
const inlineSrc = computed(() => optimizeImage(src, 1600))
const fullSrc = computed(() => optimizeImage(src))
const srcset = computed(() => imageSrcset(src))
const open = ref(false)
const dialog = useTemplateRef('dialog')

// 圖片放大用原生 dialog：Esc、焦點鎖定與背景遮罩都由瀏覽器處理
watch(open, async (value) => {
  if (!value) return
  await nextTick()
  dialog.value?.showModal()
})
</script>

<template>
  <button
    type="button"
    class="block w-full cursor-zoom-in"
    :aria-label="`放大圖片：${label}`"
    @click="open = true"
  >
    <img
      :src="inlineSrc"
      :srcset="srcset"
      sizes="(min-width: 50rem) 50rem, 100vw"
      :alt="label"
      :width="width"
      :height="height"
      :loading="first ? 'eager' : 'lazy'"
      :fetchpriority="first ? 'high' : 'auto'"
      decoding="async"
    >
  </button>
  <!-- dialog 不能放在 <p> 裡（瀏覽器會提前結束段落造成 hydration 不一致），所以搬到 body -->
  <Teleport to="body">
    <dialog
      v-if="open"
      ref="dialog"
      class="image-dialog m-auto max-h-none max-w-none cursor-zoom-out bg-transparent p-0"
      :aria-label="label"
      @close="open = false"
      @click="dialog?.close()"
    >
      <img
        :src="fullSrc"
        :alt="label"
        class="max-h-[92vh] max-w-[94vw] rounded-md object-contain"
      >
    </dialog>
  </Teleport>
</template>

<style scoped>
.image-dialog::backdrop {
  background: rgb(14 22 38 / 0.8);
}
</style>
