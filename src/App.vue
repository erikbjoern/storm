<template>
  <div
    id="click-container"
    class="w-screen h-screen cursor-pointer select-none"
    @click="handlePageClick"
  >
    <h1 class="fixed w-screen mt-12 text-3xl antialiased font-semibold text-center text-[#447959]">
      Storm
    </h1>
    <div
      v-for="textNode in textNodes"
      :key="textNode.id"
      class="absolute p-2 rounded hover:bg-[#45345425]"
      :style="{
        left: `${textNode.coordinates.x}px`,
        top: `${textNode.coordinates.y}px`,
        transition: nodeIsPickedUp(textNode) ? undefined : 'all 200ms ease-out',
        transitionProperty: 'left, top',
        zIndex: textNode.coordinates.x + textNode.coordinates.y,
        backgroundColor: nodeIsFocused(textNode) ? '#44795999' : undefined,
      }"
    >
      <div class="flex" :class="nodeIsPickedUp(textNode) && 'cursor-grabbing'">
        <h4
          @mousedown="e => pickUpNode(e, textNode)"
          class="mr-2 select-none"
          :class="!nodeIsPickedUp(textNode) && !nodeIsEmpty(textNode) && 'cursor-grab'"
        >
          &bullet;
        </h4>
        <AutoTextArea
          v-model="textNode.title"
          :textNode="textNode"
          :is-focused="nodeIsFocused(textNode)"
          @keydown-enter="blurTextNode(textNode)"
          @cancel="blurTextNode(textNode)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { getCoordinateFromCursor } from './composables/useMousePosition'
import { TextNode } from './types/textNodes'
import cuid from 'cuid'
import AutoTextArea from './components/AutoSizeTextArea.vue'

export default defineComponent({
  components: { AutoTextArea },
  setup() {
    const textNodes: TextNode[] = reactive([])
    const focusedTextNodeId = ref('')
    const focusedTextNodeTitle = ref('')
    const pickedUpNodeId = ref('')
    const aNodeWasRecentlyDropped = ref(false)

    const nodeIsEmpty = (node: TextNode) => {
      return !node.title
    }

    const nodeIsFocused = (node: TextNode) => {
      return node.id == focusedTextNodeId.value
    }

    const deleteNode = (textNode: TextNode) => {
      const indexOfNode = textNodes.findIndex(n => n.id == textNode.id)

      if (indexOfNode !== -1) {
        textNodes.splice(indexOfNode, 1)
      }
    }

    const blurTextNode = (textNode: TextNode, e?: Event) => {
      const element = document.getElementById(textNode.id)

      if (document.activeElement === element) {
        element?.blur()
      }

      focusedTextNodeId.value = ''
      focusedTextNodeTitle.value = ''

      if (nodeIsEmpty(textNode)) deleteNode(textNode)
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
      const coordinates = {
        x: getCoordinateFromCursor(e, 'CLOSEST_SNAPPING_POINT', 'x'),
        y: getCoordinateFromCursor(e, 'BULLET_POINT_OFFSET', 'y'),
      }

      const newNode = {
        id: cuid(),
        title: '',
        coordinates: {
          x: coordinates.x,
          y: getCoordinateFromCursor(coordinates, 'CLOSEST_FREE_SNAPPING_POINT', 'y', textNodes),
        },
      }

      textNodes.push(newNode)

      focusTextNode(newNode)
    }

    const handlePageClick = (e: MouseEvent) => {
      if (aNodeWasRecentlyDropped.value) return

      const focusedTextNode = textNodes.find(n => nodeIsFocused(n))

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
      nodeIsEmpty,
      nodeIsFocused,
      focusedTextNodeId,
      focusedTextNodeTitle,
      pickedUpNodeId,
      aNodeWasRecentlyDropped,
      handlePageClick,
      getCoordinateFromCursor,
    }
  },
  methods: {
    pickUpNode(e: MouseEvent, node: TextNode) {
      const focusedNode = this.textNodes.find(n => this.nodeIsFocused(n))
      if (focusedNode) {
        this.blurTextNode(focusedNode)
      }

      this.pickedUpNodeId = node.id

      const updateNodePosition = (e: MouseEvent) => {
        node.coordinates = {
          x: this.getCoordinateFromCursor(e, 'BULLET_POINT_OFFSET', 'x'),
          y: this.getCoordinateFromCursor(e, 'BULLET_POINT_OFFSET', 'y'),
        }
      }

      const dropNode = (e: MouseEvent) => {
        this.pickedUpNodeId = ''

        const nodes = this.textNodes
        const coords = {
          x: this.getCoordinateFromCursor(node.coordinates, 'CLOSEST_SNAPPING_POINT', 'x'),
          y: node.coordinates.y,
        }

        node.coordinates = {
          x: coords.x,
          y: this.getCoordinateFromCursor(coords, 'CLOSEST_FREE_SNAPPING_POINT', 'y', nodes),
        }

        this.aNodeWasRecentlyDropped = true

        setTimeout(() => (this.aNodeWasRecentlyDropped = false), 100)

        document.removeEventListener('mousemove', updateNodePosition)
        document.removeEventListener('mouseup', dropNode)
      }

      document.addEventListener('mousemove', updateNodePosition)
      document.addEventListener('mouseup', dropNode)
    },
    nodeIsPickedUp(node: TextNode) {
      return this.pickedUpNodeId == node.id
    },
  },
})
</script>

<style></style>
