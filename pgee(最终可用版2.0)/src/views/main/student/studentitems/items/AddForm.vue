<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { StudentService } from '@/services/StudentService'
import type { Item, StudentItem } from '@/types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{ item: Item; close: () => void }>()
const rootitemid = useRoute().params.itemid as string
const studentItemR = ref<StudentItem>({})

const { mutateAsync } = StudentService.addStudentItemService(rootitemid)

const submitF = async () => {
  if (!studentItemR.value.name) {
    throw '必须添加标题'
  }
  studentItemR.value.rootItemId = rootitemid
  studentItemR.value.itemId = props.item.id
  await mutateAsync(studentItemR.value)
  createElNotificationSuccess('指标项添加成功')
  studentItemR.value = {}
  props.close()
}
const submitDisabledC = computed(() => !studentItemR.value.name)
</script>
<template>
  <el-row :gutter="10" class="row">
    <el-col :span="2" class="col-title">*标题</el-col>
    <el-col :span="10">
      <el-input v-model="studentItemR.name" placeholder="项名称描述,例如:16届蓝桥杯国赛一等奖" />
    </el-col>
  </el-row>
  <el-row :gutter="10" class="row">
    <el-col :span="2" class="col-title">说明</el-col>
    <el-col :span="10">
      <el-input
        v-model="studentItemR.comment"
        type="textarea"
        :autosize="{ minRows: 4 }"
        placeholder="详细描述,如:本人为作品第X作者..." />
    </el-col>
  </el-row>
  <el-row :gutter="10" class="row">
    <el-col :span="2"></el-col>
    <el-col :span="12">
      <el-button type="primary" @click="submitF" :disabled="submitDisabledC">提交</el-button>
    </el-col>
  </el-row>
</template>
