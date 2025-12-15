import type { Item, MajorCategory } from '@/types'
import { defineAsyncComponent, h, render, type ComponentInternalInstance } from 'vue'

export const AddItemDialog = (
  instance: ComponentInternalInstance,
  item: Item,
  category?: MajorCategory
) => {
  const node = h(
    defineAsyncComponent(
      () => import('@/views/main/college/functions/itemmanagement/ItemDialog.vue')
    ),
    { parentItem: item, category }
  )
  node.appContext = instance?.appContext || null

  render(node, document.body)
}
