<script setup lang="ts">
import { StudentService } from '@/services/StudentService'
import type { Item } from '@/types'
import { InfoFilled, Plus } from '@element-plus/icons-vue'
import { defineAsyncComponent, provide, ref, toRef } from 'vue'
import { useRoute } from 'vue-router'
import ItemNode from './ItemNode.vue'

const dialogVisible = ref(false)
const route = useRoute()
const rootItemIdR = toRef(() => route.params.itemid as string)
const fetchR = ref(false)

const { data: studentItemsR, suspense: stuItemSusp } =
  StudentService.listStudentItemsService(rootItemIdR)
const { data: rootItemR, suspense: itemsSusp } = StudentService.listItemsService(
  rootItemIdR,
  fetchR
)
const selectItemR = ref<Item>({})
const limitItemR = ref<Item>({})
const activeAddForm = ref(false)
const activeMaxItemR = ref(false)

// 第一级及以下
const activeF = async () => {
  fetchR.value = true
  await Promise.all([stuItemSusp(), itemsSusp()])
  dialogVisible.value = true
  activeMaxItemR.value = false
}

const selectItemCallback = (item: Item) => {
  activeMaxItemR.value = false
  selectItemR.value = item
  const rootItem = rootItemR.value

  // 查找从根到目标节点的路径
  function findPathToNode(item: Item[], targetId: string, path: Item[] = []): Item[] | null {
    for (const chitem of item) {
      path.push(chitem)
      if (chitem.id === targetId) return [...path]
      if (chitem.items?.length) {
        const result = findPathToNode(chitem.items, targetId, path)
        if (result) return result
      }
      path.pop()
    }
    return null
  }
  const nodePath = findPathToNode(rootItem?.items ?? [], item.id!) ?? []

  // 查找每个路径的全部叶子
  function findLeafs(item: Item[], leafItems: Item[] = []) {
    for (const path of item) {
      if (path.items && path.items.length > 0) {
        findLeafs(path.items, leafItems)
      } else {
        leafItems.push(path)
      }
    }
    return leafItems
  }

  // 路径节点为键，叶子数组为值
  const nodeMap = new Map<Item, Item[]>()
  for (const path of nodePath) {
    nodeMap.set(path, findLeafs(nodePath))
  }

  for (const node of nodeMap) {
    for (const sitem of node[1]) {
      const x = studentItemsR.value!.filter(stu => stu.itemId === sitem.id)
      if (node[0].maxItems && x.length >= node[0]?.maxItems) {
        limitItemR.value = node[0]
        activeMaxItemR.value = true
        return
      }
    }
  }

  activeAddForm.value = true
}

provide('selectItemCallback', { selectItemCallback, activeAddForm })

const closeF = () => {
  activeAddForm.value = false
  dialogVisible.value = false
  activeMaxItemR.value = false
  fetchR.value = false
}

const addForm = defineAsyncComponent(() => import('./AddForm.vue'))
</script>

<template>
  <el-button type="primary" @click="activeF" size="default" class="add-item-btn">
    <el-icon style="margin-right: 4px"><Plus /></el-icon>
    添加
  </el-button>

  <el-dialog v-model="dialogVisible" title="添加项" @close="closeF" width="700px" top="15vh">
    <div class="root-item-info">
      <h3 class="title">
        {{ rootItemR?.name }} - 最高 {{ rootItemR?.maxPoints }} 分
        <el-tag v-if="rootItemR?.maxItems" size="small" type="warning" style="margin-left: 8px">
          限项: {{ rootItemR?.maxItems }}
        </el-tag>
      </h3>
      <p class="comment" v-if="rootItemR?.comment">
        <el-icon style="color: #909399; margin-right: 4px"><InfoFilled /></el-icon>
        {{ rootItemR?.comment }}
      </p>
    </div>

    <el-form v-if="dialogVisible" style="margin-top: 16px">
      <ItemNode :items="rootItemR?.items ?? []" :key="rootItemIdR" />
    </el-form>

    <div v-if="activeMaxItemR" class="limit-tips">
      <el-tag type="danger" size="large" style="margin-top: 12px">
        {{ limitItemR.name }}：已达到限项数！
      </el-tag>
    </div>

    <addForm
      v-if="activeAddForm && !activeMaxItemR"
      :item="selectItemR"
      :close="closeF"
      style="margin-top: 16px" />
  </el-dialog>
</template>

<style scoped>
.add-item-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}
.add-item-btn:hover {
  background-color: #337ecc;
  border-color: #337ecc;
}

.root-item-info {
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}
.title {
  margin: 0 0 8px 0;
  color: #409eff;
  font-size: 16px;
  font-weight: 500;
}
.comment {
  margin: 0;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

.limit-tips {
  margin-top: 12px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
:deep(.el-dialog__footer) {
  padding: 10px 20px;
}
</style>
