<template>
  <div
    ref="clickContainer"
    class="w-screen h-screen cursor-pointer select-none"
    @click="handlePageClick"
  >
    <h1 class="fixed w-screen mt-12 text-3xl antialiased font-semibold text-center text-[#447959]">
      Storm
    </h1>
    <div
      v-for="(textNode, i) in textNodes"
      :key="textNode.id"
      :id="textNode.id"
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
          :isFocused="nodeIsFocused(textNode)"
          @cancel="blurTextNode(textNode)"
          @focusChange="handleTextNodeFocus"
          :ref="(el: any) => setNodeRefs(el, textNode, i)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, nextTick, reactive, ref } from 'vue'
import { getCoordinateFromCursor } from './composables/useMousePosition'
import { TextNode } from './types/textNodes'
import cuid from 'cuid'
import AutoTextArea from './components/AutoSizeTextArea.vue'
import { IAutoSizeTextArea } from './types/textNodes'

const textNodes: TextNode[] = reactive([])
const focusedTextNodeId = ref('')
const focusedTextNodeTitle = ref('')
const pickedUpNodeId = ref('')
const aNodeWasRecentlyBlurred = ref(false)

const clickContainer = ref<Element>()

const nodeRefs = ref<{ textNode: TextNode; autoSizeTextarea: IAutoSizeTextArea }[]>([])
const setNodeRefs = (el: IAutoSizeTextArea, textNode: TextNode, index: number) => {
  nodeRefs.value[index] = {
    textNode,
    autoSizeTextarea: el,
  }
}
// onBeforeUpdate(() => (nodeRefs.value = []))

const handleTextNodeFocus = (params: { focusType: 'focused' | 'blurred'; textNode: TextNode }) => {
  const { focusType, textNode } = params

  if (focusType == 'blurred' && focusedTextNodeId.value == textNode.id) {
    focusedTextNodeId.value = ''
    focusedTextNodeTitle.value = ''

    blurTextNode(textNode)
  }

  if (focusType == 'focused') {
    focusedTextNodeId.value = textNode.id
    focusedTextNodeTitle.value = textNode.title
  }
}

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

const blurTextNode = (textNode: TextNode) => {
  const targetNode = nodeRefs.value.find(n => n.textNode.id == textNode.id)
  const textarea = targetNode?.autoSizeTextarea.$refs.textarea

  if (document.activeElement === textarea) {
    textarea?.blur()
  }

  if (nodeIsEmpty(textNode)) deleteNode(textNode)

  releaseNode()
}

const focusTextNode = (textNode: TextNode) => {
  nextTick(() => {
    const targetNode = nodeRefs.value.find(e => e.textNode.id == textNode.id)

    if (!targetNode) return

    targetNode.autoSizeTextarea.updateElementSize()
    targetNode.autoSizeTextarea.$refs.textarea?.focus()
  })
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

function handlePageClick(e: MouseEvent) {
  if (e.target == clickContainer.value && !aNodeWasRecentlyBlurred.value) {
    return createNode(e)
  }

  const targetTextNode = nodeRefs.value.find(n => n.autoSizeTextarea?.$refs.textarea == e.target)

  if (targetTextNode && targetTextNode.textNode.id !== focusedTextNodeId.value) {
    focusTextNode(targetTextNode.textNode)
  }
}

function releaseNode() {
  aNodeWasRecentlyBlurred.value = true

  setTimeout(() => (aNodeWasRecentlyBlurred.value = false), 100)
}

function pickUpNode(e: MouseEvent, node: TextNode) {
  pickedUpNodeId.value = node.id

  const updateNodePosition = (e: MouseEvent) => {
    node.coordinates = {
      x: getCoordinateFromCursor(e, 'BULLET_POINT_OFFSET', 'x'),
      y: getCoordinateFromCursor(e, 'BULLET_POINT_OFFSET', 'y'),
    }
  }

  const dropNode = () => {
    pickedUpNodeId.value = ''

    const nodes = textNodes
    const coords = {
      x: getCoordinateFromCursor(node.coordinates, 'CLOSEST_SNAPPING_POINT', 'x'),
      y: node.coordinates.y,
    }

    node.coordinates = {
      x: coords.x,
      y: getCoordinateFromCursor(coords, 'CLOSEST_FREE_SNAPPING_POINT', 'y', nodes),
    }

    releaseNode()

    document.removeEventListener('mousemove', updateNodePosition)
    document.removeEventListener('mouseup', dropNode)
  }

  document.addEventListener('mousemove', updateNodePosition)
  document.addEventListener('mouseup', dropNode)
}

const nodeIsPickedUp = (node: TextNode) => {
  return pickedUpNodeId.value == node.id
}
</script>

<style></style>
