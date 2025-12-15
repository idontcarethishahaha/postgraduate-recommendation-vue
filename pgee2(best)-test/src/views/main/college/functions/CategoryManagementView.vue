<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { MajorCategory } from '@/types'
import MajorsView from '@/views/main/college/functions/MajorsView.vue'
import { ref } from 'vue'

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

// 添加类别
const { mutateAsync: mutateAsyncCat } = CollegeService.addCategoryService()
const addCategoryF = async () => {
  categoryR.value.weighting = { score: 85, compositeScore: 15 }
  // @ts-expect-error: JSON
  categoryR.value.weighting = JSON.stringify(categoryR.value.weighting)
  await mutateAsyncCat(categoryR.value)
  createElNotificationSuccess('类别添加成功')
  categoryR.value = {}
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
        <el-button type="primary" @click="addCategoryF">添加类别</el-button>
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
</style>
