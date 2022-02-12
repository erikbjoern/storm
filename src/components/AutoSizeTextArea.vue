<template>
  <div class="relative flex max-w-lg pr-0">
    <p class="max-w-sm min-w-[8rem] break-words whitespace-pre-wrap" ref="invisSpacer">
      <span class="opacity-0" v-text="props.textNode.title" ref="invisSpacerInner" />
    </p>
    <textarea
      :value="props.modelValue"
      :style="{
        height: '1.5rem',
        minWidth: '8rem',
        resize: 'none',
        zIndex: props.textNode.coordinates.x + props.textNode.coordinates.y + 1,
      }"
      class="absolute inline-block overflow-hidden bg-transparent"
      @input="onInput"
      @keydown.enter="onEnter"
      @keydown.escape="cancelEditingTextNode"
      @keydown.backspace="updateElementSize(true)"
      @focus="$emit('focusChange', { focusType: 'focused', textNode: props.textNode })"
      @blur="$emit('focusChange', { focusType: 'blurred', textNode: props.textNode })"
      ref="textarea"
    />
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { getRemInPixels } from '../composables/useRemSize'
import { TextNode } from '../types/textNodes'

const props = defineProps<{
  textNode: TextNode
  modelValue: string
  isFocused: boolean
}>()

const initialData = {
  title: '',
}

const invisSpacer = ref<HTMLElement>()
const invisSpacerInner = ref<HTMLElement>()
const textarea = ref<HTMLElement>()

watch(
  () => props.isFocused,
  isFocused => (initialData.title = isFocused ? props.textNode.title : '')
)

const emit = defineEmits(['keydownEnter', 'cancel', 'update:modelValue', 'focusChange'])

const onInput = () => {
  const inputField = textarea.value as HTMLInputElement

  updateElementSize()
  emit('update:modelValue', inputField.value)
}

const onEnter = (e: KeyboardEvent) => {
  if (e.shiftKey) {
    addRowToHeight()
  } else {
    e.preventDefault()
    ;(e?.target as HTMLElement)?.blur()
  }
}

const addRowToHeight = () => {
  if (!invisSpacer.value) return

  invisSpacer.value.style.minHeight = `${
    parseFloat(getComputedStyle(invisSpacer.value).height) + getRemInPixels(1.5)
  }px`
}

const setInvisibleSpacerMinHeight = () => {
  if (invisSpacer.value && invisSpacerInner.value) {
    invisSpacer.value.style.minHeight = getComputedStyle(invisSpacerInner.value).height
  }
}

const updateElementSize = (setWrapperMinHeight = false) => {
  requestAnimationFrame(() => {
    if (setWrapperMinHeight) {
      setInvisibleSpacerMinHeight()
    }

    if (textarea.value && invisSpacer.value) {
      const { height, width } = getComputedStyle(invisSpacer.value)

      textarea.value.style.height = height
      textarea.value.style.minHeight = height
      textarea.value.style.width = width
      textarea.value.style.minWidth = width
    }
  })
}

const cancelEditingTextNode = () => {
  emit('update:modelValue', initialData.title)

  const allowShrinkingTextbox = true

  requestAnimationFrame(() => {
    updateElementSize(allowShrinkingTextbox)
  })
  emit('cancel')
}

defineExpose({
  updateElementSize,
})
</script>
