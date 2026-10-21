<script setup lang="ts">
const { alt } = defineProps<{ src: string, alt?: string, width?: string | number, height?: string | number }>()

const label = computed(() => alt || '文章插圖')
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
      :src="src"
      :alt="label"
      :width="width"
      :height="height"
      loading="lazy"
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
        :src="src"
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
