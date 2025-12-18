<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'
import { getStatusUtil } from '@/services/Utils.ts'
import type { Item, StudentItemResp, StudentItemsStatusDO } from '@/types'
import ItemNode from '@/views/main/college/majors/reviews/ItemNode.vue'
import ReviewWeigthedScore from '@/views/main/college/majors/reviews/ReviewWeigthedScore.vue'
import { querycachename } from '@/vuequery/Const'
import { useQueryClient } from '@tanstack/vue-query'
import { defineAsyncComponent, ref } from 'vue'
import { useRoute } from 'vue-router'

type TagType = 'success' | 'warning' | 'danger' | 'primary' | 'info'
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

const dialogVisible = ref(true)
const props = defineProps<{
  majorid: string
  studentstatus: StudentItemsStatusDO
  close: () => void
}>()
const { data: adminR } = CommonService.getUserInfoService()

const route = useRoute()
const catid = route.params.catid as string

const { data: studentItemsAllR, suspense: su1 } = CollegeService.listStudentItemsService(
  props.studentstatus.userId!
)
const { data: itemsR, suspense: su2 } = CollegeService.listCategoryItemsService(catid)
const studentItemOfItemR = ref<StudentItemResp[]>([])
await Promise.all([su1(), su2()])

studentItemOfItemR.value = [...studentItemsAllR.value!]

const qc = useQueryClient()

const closeF = async () => {
  dialogVisible.value = false
  await qc.refetchQueries({
    queryKey: [querycachename.college.majorstudentstatuses, props.majorid]
  })
  props.close()
}

const getLevelItemId = (selectItem: Item) => {
  studentItemOfItemR.value = []
  const childItems: Item[] = []

  const rect = (item: Item) => {
    if (item.items && item.items.length > 0) {
      for (const citem of item.items) {
        rect(citem)
      }
    } else {
      childItems.push(item)
    }
  }
  rect(selectItem)

  for (const chItem of childItems) {
    const stuitems = studentItemsAllR.value!.filter(stuitem => stuitem.itemId === chItem.id)
    studentItemOfItemR.value.push(...stuitems)
  }
}

const listStudentItemsAllF = () => {
  studentItemOfItemR.value = [...studentItemsAllR.value!]
}

const downloadFileF = async (fileid: string, filename: string) => {
  await CollegeService.downloadFileService(fileid, filename)
}

const activeConfirmDialogR = ref(false)
const selectStudentItemR = ref<StudentItemResp>()
const confirmDialog = defineAsyncComponent(() => import('./ConfirmDialog.vue'))

const confirmF = (stuItem: StudentItemResp) => {
  activeConfirmDialogR.value = true
  selectStudentItemR.value = stuItem
}
const closeconfirmDialog = async () => {
  activeConfirmDialogR.value = false
  studentItemOfItemR.value = [...studentItemsAllR.value!]
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    @close="closeF"
    fullscreen
    class="review-dialog"
    :title="`学生审核 - ${props.studentstatus.userName}`"
    append-to-body>
    <div class="review-container">
      <div class="info-section">
        <h2 class="section-title">基本信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">审核人：</span>
            <span class="info-value">{{ adminR?.name || '未获取' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">学生姓名：</span>
            <span class="info-value">{{ props.studentstatus.userName }}</span>
          </div>
        </div>
      </div>

      <el-divider border-style="dashed" content-position="left">加权成绩审核</el-divider>

      <div class="score-section">
        <ReviewWeigthedScore :sid="props.studentstatus.userId!" />
      </div>

      <el-divider border-style="dashed" content-position="left">评定指标参考数据</el-divider>

      <div class="indicator-section">
        <div class="indicator-tip">
          <i class="el-icon-info" style="color: #409eff"></i>
          说明:1.评定标准以学院文件要求为准;2.学生填报数是否超过限项，需人工审核；
        </div>
        <div class="indicator-tree">
          <ItemNode
            :items="itemsR!"
            :studentitems="studentItemsAllR!"
            :get-root-id="getLevelItemId" />
        </div>
      </div>

      <el-divider border-style="dashed" content-position="left">学生提交数据</el-divider>

      <div class="submit-data-section">
        <div class="data-header">
          <el-button
            type="primary"
            @click="listStudentItemsAllF"
            icon="el-icon-refresh"
            class="refresh-btn">
            加载全部
          </el-button>
        </div>

        <el-row>
          <el-col>
            <el-table :data="studentItemOfItemR as StudentItemResp[]" style="width: 100%">
              <el-table-column type="index" width="50" />
              <el-table-column prop="itemName" label="指标点">
                <template #default="scope">
                  {{ scope.row.itemName }}
                </template>
              </el-table-column>
              <el-table-column label="内容">
                <template #default="scope">
                  {{ scope.row.name }}
                  <br />
                  {{ scope.row.comment || '无备注' }}
                </template>
              </el-table-column>
              <el-table-column label="佐证">
                <template #default="scope">
                  <div v-for="file of scope.row.files" :key="file.id" style="margin: 3px 0">
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      :content="file.filename"
                      placement="top"
                      :hide-after="0">
                      <span
                        class="tag-ellipsis"
                        style="font-weight: 700; font-size: 14px; cursor: pointer"
                        :style="{ color: getTagColor('primary') }"
                        @click="downloadFileF(file.id!, file.filename!)">
                        {{ file.filename }}
                      </span>
                    </el-tooltip>
                  </div>
                  <div v-if="!scope.row.files.length" style="color: #909399; font-size: 12px">
                    无佐证材料
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="认定" width="120">
                <template #default="scope">
                  <div
                    style="display: flex; align-items: center; justify-content: center; gap: 4px">
                    <span
                      style="font-weight: 700; font-size: 14px"
                      :style="{ color: getTagColor('success') }">
                      {{ scope.row.point ?? 0 }}
                    </span>
                    <span style="vertical-align: middle">/ {{ scope.row.maxPoints || 0 }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="80">
                <template #default="scope">
                  <span
                    style="font-weight: 700; font-size: 14px"
                    :style="{ color: getTagColor(getStatusUtil(scope.row.status ?? '')?.color) }">
                    {{ getStatusUtil(scope.row.status ?? '')?.name || '待审核' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="scope">
                  <el-button
                    type="primary"
                    size="small"
                    style="padding: 4px 8px; font-size: 12px"
                    @click="confirmF(scope.row)">
                    审核
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </div>
    </div>
  </el-dialog>

  <confirmDialog
    v-if="activeConfirmDialogR"
    :close="closeconfirmDialog"
    :stuitem="selectStudentItemR!" />
</template>

<style scoped>
.review-dialog {
  --el-dialog-content-padding: 0;
}

.review-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 20px;
  background-color: #409eff;
  margin-right: 8px;
  border-radius: 2px;
}

.info-section {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: #303133;
  font-size: 14px;
}

.score-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.indicator-section {
  margin-bottom: 20px;
}

.indicator-tip {
  padding: 12px 16px;
  background-color: #e8f4ff;
  border-left: 4px solid #409eff;
  border-radius: 4px;
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.indicator-tree {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.submit-data-section {
  margin-top: 16px;
}

.data-header {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.refresh-btn {
  padding: 8px 16px;
  border-radius: 6px;
}

.tag-ellipsis {
  padding: 5px 0;
  cursor: pointer;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

:deep(.el-divider) {
  margin: 20px 0;
}
</style>
