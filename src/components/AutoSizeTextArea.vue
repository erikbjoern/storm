<template>
  <div class="relative flex max-w-lg pr-0">
    <p
      :id="`invis-spacer-${instanceId}`"
      class="max-w-sm min-w-[8rem] break-words whitespace-pre-wrap"
    >
      <span
        :id="`invis-spacer-inner-${instanceId}`"
        class="opacity-0"
        v-text="props.textNode.title"
      />
    </p>
    <textarea
      :id="props.textNode.id"
      :value="props.modelValue"
      @input="
        e => {
          updateElementSize(e)
          $emit('update:modelValue', inputEl(e).value)
        }
      "
      :style="{
        height: '1.5rem',
        minWidth: '8rem',
        resize: 'none',
        zIndex: props.textNode.coordinates.x + props.textNode.coordinates.y + 1,
      }"
      class="absolute inline-block overflow-hidden bg-transparent"
      @keydown.enter="
        e => {
          if (e.shiftKey) {
            addRowToHeight(e)
          } else {
            e.preventDefault()
            $emit('keydownEnter')
          }
        }
      "
      @keydown.escape="cancelEditingTextNode"
      @keydown.backspace="e => updateElementSize(e, true)"
      @focus="e => $nextTick(() => updateElementSize(e))"
    />
  </div>
</template>

<script setup lang="ts">
import cuid from 'cuid'
import { watch } from 'vue'
import { getRemInPixels } from '../composables/useRemSize'
import { TextNode } from '../types/textNodes'

const props = defineProps<{
  textNode: TextNode
  modelValue: string
  isFocused: boolean
}>()

const instanceId = cuid()
const initialData = {
  title: '',
}

watch(
  () => props.isFocused,
  isFocused => (initialData.title = isFocused ? props.textNode.title : '')
)

const emit = defineEmits(['keydownEnter', 'cancel', 'update:modelValue'])

const inputEl = (e: Event) => {
  return (e.target instanceof Element ? e.target : {}) as HTMLInputElement
}

const addRowToHeight = (e: Event) => {
  const p = document.getElementById(`invis-spacer-${instanceId}`)

  if (p) {
    p.style.minHeight = `${parseFloat(getComputedStyle(p).height) + getRemInPixels(1.5)}px`
  }
}

const setInvisibleSpacerMinHeight = (p: HTMLElement) => {
  const innerText = document.getElementById(`invis-spacer-inner-${instanceId}`)

  if (p && innerText) {
    p.style.minHeight = getComputedStyle(innerText).height
  }
}

const updateElementSize = (e: Event, setWrapperMinHeight = false) => {
  const p = document.getElementById(`invis-spacer-${instanceId}`)

  if (inputEl(e).style && p) {
    requestAnimationFrame(() => {
      if (setWrapperMinHeight) {
        setInvisibleSpacerMinHeight(p)
      }

      inputEl(e).style.height = getComputedStyle(p).height
      inputEl(e).style.minHeight = getComputedStyle(p).height
      inputEl(e).style.width = getComputedStyle(p).width
      inputEl(e).style.minWidth = getComputedStyle(p).width
    })
  }
}

const cancelEditingTextNode = (e: Event) => {
  emit('update:modelValue', initialData.title)

  const allowShrinkingTextbox = true

  requestAnimationFrame(() => {
    updateElementSize(e, allowShrinkingTextbox)
  })
  emit('cancel')
}
</script>
