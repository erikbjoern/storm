<template>
<div id="click-container" class="w-screen h-screen" @click="handlePageClick">
  <h1 class="fixed w-screen mt-12 text-3xl antialiased font-semibold text-center text-green-800">
    Storm
  </h1>
  <div 
    v-for="textNode in textNodes" 
    :key="textNode.id" 
    class="absolute" 
    :style="{ left: `${textNode.coordinates.x}px`, top: `${textNode.coordinates.y}px` }"
  >
    <div class="flex">
      <h4 class="mr-2">&bullet;</h4>
      <input 
        :id="textNode.id"
        v-model="textNode.title" 
        @keydown.enter="blurTextNode(textNode)"
        @keydown.escape="cancelEditingTextNode(textNode)"
      />
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import cuid from 'cuid';
import composables from './composables'

type TextNode = {
  id: string,
  title: string,
  coordinates: {
    x: number,
    y: number,
  }
}

export default defineComponent({
  setup() {
    const { getRemInPixels } = composables.useRemSize
    const textNodes: TextNode[] = reactive([]);
    const focusedTextNodeId = ref('')
    const focusedTextNodeTitle = ref('')
    
    const roundNearest = (n: number, amount: number) => Math.round(n / amount) * amount

    const clearIfEmpty = (textNode: TextNode) => {
      if (!textNode.title) {
        const indexOfNode = textNodes.findIndex(n => n.id == textNode.id)

        if (indexOfNode !== -1) { 
          textNodes.splice(indexOfNode, 1)
        }
      }
    }

    const blurTextNode = (textNode: TextNode, e?: Event) => {
      const element = document.getElementById(textNode.id)

      if (document.activeElement === element) {
        element?.blur()
      }

      focusedTextNodeId.value = ''
      focusedTextNodeTitle.value = ''

      clearIfEmpty(textNode)
    }

    const targetElement = (e: Event) => {
      return (e.target instanceof Element ? e.target : {}) as HTMLElement
    }

    const focusTextNode = (textNode: TextNode) => {
      requestAnimationFrame(() => {
        document.getElementById(textNode.id)?.focus()
      })

      focusedTextNodeTitle.value = textNode.title
      focusedTextNodeId.value = textNode.id
    }
    
    const createNode = (e: MouseEvent) => {
      const newNode = {
        id: cuid(),
        title: '',
        coordinates: {
          x: Math.max(0, roundNearest(e.x - getRemInPixels(0.75), getRemInPixels(1.5))),
          y: Math.max(0, roundNearest(e.y - getRemInPixels(0.75), getRemInPixels(1.5))),
        }
      } 

      textNodes.push(newNode)

      focusTextNode(newNode)
    }

    const handlePageClick = (e: MouseEvent) => {
      const focusedTextNode = textNodes.find(n => focusedTextNodeId.value && n.id === focusedTextNodeId.value)

      if (focusedTextNode) {
        if (targetElement(e).id == focusedTextNode.id) {
          return
        }

        blurTextNode(focusedTextNode)
      } else if (targetElement(e).id !== 'click-container') {
        const targetTextNode = textNodes.find(n => n.id == targetElement(e).id)

        if (targetTextNode) {
          focusTextNode(targetTextNode)
        }
      } else {  
        createNode(e)
      }
    }

    return {
      textNodes,
      blurTextNode,
      focusedTextNodeId,
      focusedTextNodeTitle,
      handlePageClick,
    };
  },
  methods: {
    cancelEditingTextNode(textNode:TextNode) {
      textNode.title = this.focusedTextNodeTitle
      this.blurTextNode(textNode)
    },
    isFocused(textNode: TextNode) {
      return this.focusedTextNodeId == textNode.id
    }
  },
})
</script>


<style>
</style>
