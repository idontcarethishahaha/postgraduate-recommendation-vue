<script setup lang="ts">
import { createElNotificationError, createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { MajorCategory } from '@/types'
import MajorsView from '@/views/main/college/functions/MajorsView.vue'
import type { FormRules } from 'element-plus'
import { reactive, ref } from 'vue'

// 获取类别-专业列表
const {
  data: categoriesMajorsR,
  suspense,
  refetch: refetchCategoriesMajors
} = CollegeService.listcategoryMajorsService()
// 获取类别列表
const { suspense: categoriesRsup } = CollegeService.listCategoriesService()
await Promise.all([suspense(), categoriesRsup()])

const categoryR = ref<MajorCategory>({})
// 当前激活类别ID+名称
const activeCategory = ref<{ id: string; name: string } | null>(null)

// 弹窗显隐
const scoreDialogVisible = ref(false)
// 分数表单
const scoreForm = reactive({
  score: 85, // 默认值
  compositeScore: 15 // 默认值
})
const scoreFormRules: FormRules<typeof scoreForm> = {
  score: [
    { required: true, message: '请输入基础分数百分占比', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '分数需在 0-100 之间', trigger: 'blur' }
  ],
  compositeScore: [
    { required: true, message: '请输入综合分数百分占比', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '分数需在 0-100 之间', trigger: 'blur' }
  ]
}

const scoreFormRef = ref<InstanceType<typeof import('element-plus').ElForm>>()

// 添加类别
const { mutateAsync: mutateAsyncCat } = CollegeService.addCategoryService()

// 弹窗
const openScoreDialog = () => {
  if (!categoryR.value.name) {
    createElNotificationError('请先输入类别名称')
    return
  }
  // 重置表单
  scoreForm.score = 85
  scoreForm.compositeScore = 15
  scoreDialogVisible.value = true
}

// 确认分数并提交
const confirmScoreAndAdd = async () => {
  // 表单校验
  if (!scoreFormRef.value) return
  await scoreFormRef.value.validate()

  // 总分校验（必须等于100）
  if (scoreForm.score + scoreForm.compositeScore !== 100) {
    createElNotificationError('基础分数百分占比 + 综合分数百分占比 必须等于 100')
    return
  }

  // 组装数据
  categoryR.value.weighting = {
    score: scoreForm.score,
    compositeScore: scoreForm.compositeScore
  }
  // @ts-expect-error: JSON
  categoryR.value.weighting = JSON.stringify(categoryR.value.weighting)

  // 提交添加
  await mutateAsyncCat(categoryR.value)
  createElNotificationSuccess('类别添加成功')
  // 重置状态
  categoryR.value = {}
  scoreDialogVisible.value = false
}

// 移除类别
const { mutateAsync: removeCategoryMutate } = CollegeService.removeCategoryService()
const handleRemoveCategory = async (mcid: string) => {
  if (!confirm('确定移除该类别吗？')) return
  await removeCategoryMutate(mcid)
  createElNotificationSuccess('类别移除成功')
  refetchCategoriesMajors()
  // 移除后关闭专业视图
  activeCategory.value = null
}

// 再次点击管理专业时，关闭专业视图
// 点击管理专业时，记录ID和名称
const manageMajors = (category: MajorCategory) => {
  if (!category.id) return
  // 判断是否是当前激活的类别，是则关闭，否则激活
  activeCategory.value =
    activeCategory.value?.id === category.id
      ? null
      : { id: category.id, name: category.name || '未知类别' }
}
</script>

<template>
  <div class="container" style="padding: 20px">
    <el-row class="my-row" :gutter="15" style="margin-bottom: 20px">
      <el-col :span="8">
        <el-input
          style="width: 240px; margin-right: 8px"
          v-model="categoryR.name"
          placeholder="类别名称"
          clearable />
        <el-button type="primary" @click="openScoreDialog">添加类别</el-button>
      </el-col>
    </el-row>

    <!-- 类别表格 -->
    <div class="category-list">
      <el-table
        :data="categoriesMajorsR"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }">
        <el-table-column label="类别名称" align="center" min-width="200">
          <template #default="scope">
            <span style="font-size: 14px; font-weight: 600; color: #303133">
              {{ scope.row.majorCategory?.name || '未知类别' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="280">
          <template #default="scope">
            <el-button
              type="success"
              text
              class="manage-btn"
              @click="manageMajors(scope.row.majorCategory)"
              :disabled="!scope.row.majorCategory?.id">
              管理专业
            </el-button>
            <el-button
              type="danger"
              text
              class="delete-btn"
              @click="handleRemoveCategory(scope.row.majorCategory?.id || '')"
              :disabled="!scope.row.majorCategory?.id">
              移除类别
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!--专业管理-->
    <div v-if="activeCategory" class="majors-view-container" style="margin-top: 20px">
      <el-card shadow="hover">
        <template #header>
          <div style="font-size: 16px; font-weight: bold; color: #1890ff">
            专业管理（当前类别：{{ activeCategory.name }}）
          </div>
        </template>
        <MajorsView :category-id="activeCategory.id" />
      </el-card>
    </div>

    <ElDialog
      v-model="scoreDialogVisible"
      title="设置类别加权分数"
      width="400px"
      :close-on-click-modal="false"
      :before-close="() => (scoreDialogVisible = false)">
      <ElForm
        ref="scoreFormRef"
        :model="scoreForm"
        :rules="scoreFormRules"
        label-width="100px"
        style="margin-top: 10px">
        <ElFormItem label="基础分数" prop="score">
          <ElInputNumber
            v-model="scoreForm.score"
            :min="0"
            :max="100"
            style="width: 100%"
            placeholder="请输入基础分数（0-100）" />
        </ElFormItem>
        <ElFormItem label="综合分数" prop="compositeScore">
          <ElInputNumber
            v-model="scoreForm.compositeScore"
            :min="0"
            :max="100"
            style="width: 100%"
            placeholder="请输入综合分数（0-100）" />
        </ElFormItem>
        <ElFormItem label="总分校验">
          <div style="color: #666; font-size: 12px">
            当前总分：
            <span
              :style="{
                color: scoreForm.score + scoreForm.compositeScore === 100 ? '#52c41a' : '#ff4d4f'
              }">
              {{ scoreForm.score + scoreForm.compositeScore }}
            </span>
            <span style="margin-left: 8px">（需等于 100）</span>
          </div>
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="scoreDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="confirmScoreAndAdd">确认添加</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.manage-btn {
  color: #52c41a;
}
.delete-btn {
  color: #ff4d4f;
}

:deep(.el-table__row) {
  height: 60px;
}

:deep(.el-button--text) {
  padding: 0 10px;
  &:hover {
    background-color: #f5f5f5;
    border-radius: 4px;
  }
}

.majors-view-container {
  border-top: 1px solid #e8e8e8;
  padding-top: 20px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-input-number) {
  --el-input-number-input-width: 100%;
}
</style>
