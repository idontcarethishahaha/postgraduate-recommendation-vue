<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import { SCORE_STATUS_MAP } from '@/services/Const'
import { getFinalScoreUtil } from '@/services/Utils.ts'
import type { StudentItemsStatusDO } from '@/types'
import { defineAsyncComponent, ref, toRef } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const majorIdR = toRef(() => route.params.majorid as string)
const catid = route.params.catid as string
const weighting = CollegeService.getCategoryWeightingService(catid)

const { data: studentsR } = CollegeService.listStudentsStatusesService(majorIdR, weighting!)

const studentStatusR = ref<StudentItemsStatusDO>({})
const activeR = ref(false)
const closeF = () => {
  activeR.value = false
}
const reviewF = (student: StudentItemsStatusDO) => {
  studentStatusR.value = student
  activeR.value = true
}

const reviewdialog = defineAsyncComponent(
  () => import('@/views/main/college/majors/reviews/IndexView.vue')
)

type TagType = 'success' | 'warning' | 'danger' | 'primary' | 'info'
// 颜色
const TAG_TYPE_TO_COLOR: Record<TagType, string> = {
  success: '#67c23a',
  warning: '#e6a23c',
  danger: '#f56c6c',
  primary: '#409eff',
  info: '#909399'
}

const getTagColor = (type: string | undefined): string => {
  const safeType = (type as TagType) || 'info'
  return TAG_TYPE_TO_COLOR[safeType]
}
</script>

<template>
  <el-row class="my-row">
    <el-col>
      <el-table :data="studentsR as StudentItemsStatusDO[]" style="width: 100%">
        <el-table-column type="index" />
        <el-table-column label="姓名">
          <template #default="scope">
            <el-icon
              style="cursor: pointer; color: #409eff; font-size: 18px; vertical-align: middle"
              :title="(scope.row as StudentItemsStatusDO).tel"></el-icon>
            {{ (scope.row as StudentItemsStatusDO).userName }}
          </template>
        </el-table-column>

        <el-table-column label="待审核项数">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: 700; font-size: 14px">
              {{ (scope.row as StudentItemsStatusDO).pendingReviewCount }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="项数">
          <template #default="scope">
            <span>已认定:{{ (scope.row as StudentItemsStatusDO).confirmedCount }}</span>
            <br />
            <span>待修改:{{ (scope.row as StudentItemsStatusDO).pendingModificationCount }}</span>
            <br />
            <span>已驳回:{{ (scope.row as StudentItemsStatusDO).rejectedCount }}</span>
            <br />
            <span>总提交:{{ (scope.row as StudentItemsStatusDO).totalCount }}</span>
            <br />
          </template>
        </el-table-column>

        <el-table-column label="加权成绩">
          <template #default="scope">
            <span
              style="font-weight: 700; font-size: 14px"
              :style="{
                color: getTagColor(
                  SCORE_STATUS_MAP.get((scope.row as StudentItemsStatusDO).verified ?? 0)?.color
                )
              }">
              {{ (scope.row as StudentItemsStatusDO).score }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="已认定成绩">
          <template #default="scope">
            <span
              style="font-weight: 700; font-size: 14px"
              :style="{
                color: getTagColor(
                  SCORE_STATUS_MAP.get((scope.row as StudentItemsStatusDO).verified ?? 0)?.color
                )
              }">
              {{ (scope.row as StudentItemsStatusDO).totalPoint }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="最终成绩">
          <template #default="scope">
            <span
              style="font-weight: 700; font-size: 14px"
              :style="{
                color: getTagColor(
                  SCORE_STATUS_MAP.get((scope.row as StudentItemsStatusDO).verified ?? 0)?.color
                )
              }">
              {{
                getFinalScoreUtil(
                  (scope.row as StudentItemsStatusDO).score ?? 0,
                  (scope.row as StudentItemsStatusDO).totalPoint ?? 0,
                  weighting!
                )
              }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="" max-width="80">
          <template #default="scope">
            <el-button type="primary" @click="reviewF(scope.row as StudentItemsStatusDO)">
              审核
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>

  <reviewdialog
    v-if="activeR"
    :studentstatus="studentStatusR"
    :close="closeF"
    :majorid="majorIdR" />
</template>

<style scoped>
.my-row {
  padding: 16px;
}
</style>
