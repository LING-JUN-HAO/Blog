<script setup lang="ts">
const props = withDefaults(defineProps<{
  code?: string
  language?: string | null
  filename?: string | null
  highlights?: number[]
  meta?: string | null
  class?: string | null
}>(), { code: '', language: null, filename: null, highlights: () => [], meta: null, class: null })

const { copy, copied } = useClipboard({ source: () => props.code, copiedDuring: 1600, legacy: true })
</script>

<template>
  <div class="code-block">
    <div class="code-bar">
      <span class="label">{{ filename || language || 'text' }}</span>
      <button
        type="button"
        class="copy"
        :aria-label="copied ? '已複製' : '複製程式碼'"
        @click="copy()"
      >
        <AppIcon
          :name="copied ? 'check' : 'copy'"
          :size="16"
        />
        {{ copied ? '已複製' : '複製' }}
      </button>
    </div>
    <pre :class="[$props.class, { 'line-numbers': !!language }]"><slot /></pre>
  </div>
</template>

<style scoped>
.code-block {
  margin-block: 1.6rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--code-bg);
  overflow: hidden;
}
.code-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.5rem 0.35rem 1rem;
  border-bottom: 1px solid var(--line);
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.label {
  font-family: var(--font-mono);
}
.copy {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.6rem;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}
.copy:hover {
  color: var(--ink);
  background: var(--paper);
}
pre {
  margin: 0;
  padding: 1rem 1.1rem;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.86rem;
  line-height: 1.75;
  background: transparent !important;
}
pre :deep(code) {
  display: block;
  min-width: max-content;
}
/* 行號（沿用 Hexo 時期 line_number: true） */
pre.line-numbers :deep(code) {
  counter-reset: line;
}
pre.line-numbers :deep(.line)::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 1.75rem;
  margin-right: 1rem;
  text-align: right;
  color: color-mix(in srgb, var(--ink-soft) 55%, transparent);
  user-select: none;
}
</style>
