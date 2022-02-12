import { Component, ComponentPublicInstance } from 'vue'

export type TextNode = {
  id: string
  title: string
  coordinates: {
    x: number
    y: number
  }
}

export interface IAutoSizeTextArea extends ComponentPublicInstance {
  updateElementSize: Function
  $refs: {
    textarea: HTMLInputElement
  }
}
