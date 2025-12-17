<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { Item, MajorCategory } from '@/types'
import { EditPen } from '@element-plus/icons-vue'
import { computed, ref, render } from 'vue'

const dialogVisible = ref(true)
const props = defineProps<{ parentItem: Item; category?: MajorCategory }>()

const isTopItem = !!props.category

const itemR = ref<Item>({})

const wWidth = ref(window.innerWidth)
const widthC = computed(() => {
  return wWidth.value < 768 ? '80%' : '50%'
})
//=============================
// 添加指标项
const { mutateAsync } = CollegeService.addItemService(props.parentItem.majorCategoryId!)

const submitF = async () => {
  const item: Item = {
    name: itemR.value.name,
    comment: itemR.value.comment,
    maxPoints: itemR.value.maxPoints,
    majorCategoryId: props.parentItem?.majorCategoryId ?? props.category?.id
  }
  if (itemR.value.maxItems) {
    item.maxItems = itemR.value.maxItems
  }
  if (!isTopItem) {
    item.parentId = props.parentItem.id
  }
  await mutateAsync(item)
  createElNotificationSuccess('项添加成功')
  render(null, document.body)
  itemR.value = {}
}

const closeF = () => {
  render(null, document.body)
  itemR.value = {}
}
</script>
<template>
  <el-dialog v-model="dialogVisible" title="添加指标项" :width="widthC" @close="closeF">
    <el-row :gutter="10" class="row">
      <el-col :span="2" class="col-title">父节点</el-col>
      <el-col :span="18">
        <el-text type="primary" size="large" v-if="!isTopItem">
          {{ props.parentItem.name }} - {{ props.parentItem.maxPoints }}分
        </el-text>
        <el-text type="primary" size="large" v-if="isTopItem">
          {{ props.category?.name }}
        </el-text>
      </el-col>
    </el-row>

    <el-row :gutter="10" class="row">
      <el-col :span="2" class="col-title">指标点</el-col>
      <el-col :span="10">
        <el-input-number
          placeholder="指标点"
          :precision="2"
          :max="props.parentItem?.maxPoints ?? 100"
          v-model="itemR.maxPoints" />
      </el-col>
    </el-row>

    <el-row :gutter="10" class="row">
      <el-col :span="2" class="col-title">名称</el-col>
      <el-col :span="10">
        <el-input v-model="itemR.name" />
      </el-col>
    </el-row>

    <el-row :gutter="10" class="row">
      <el-col :span="2" class="col-title">限项</el-col>
      <el-col :span="18">
        <el-input-number placeholder="限项" v-model="itemR.maxItems" :min="1" />
        *仅有点数限制，没有指标项限制，不要填写
      </el-col>
    </el-row>

    <el-row :gutter="10" class="row">
      <el-col :span="2" class="col-title">备注</el-col>
      <el-col :span="10">
        <el-input v-model="itemR.comment" type="textarea" autosize />
      </el-col>
    </el-row>

    <el-row :gutter="10" class="row">
      <el-col :span="2"></el-col>
      <el-col :span="12">
        <el-button type="primary" @click="submitF">
          <el-icon><EditPen /></el-icon>
        </el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<style scoped>
.row {
  margin-bottom: 5px;
  align-items: center;
}
.col-title {
  text-align: right;
}
</style>
