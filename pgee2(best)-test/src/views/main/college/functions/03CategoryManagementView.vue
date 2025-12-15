<script setup lang="ts">
// 能用
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { Major, MajorCategory } from '@/types'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
//import { useQueryClient } from '@tanstack/vue-query'

const router = useRouter()
//const qc = useQueryClient()

// 获取类别-专业列表
const {
  data: categoriesMajorsR,
  suspense,
  refetch: refetchCategoriesMajors
} = CollegeService.listcategoryMajorsService()
// 获取类别列表
const { data: categoriesR, suspense: categoriesRsup } = CollegeService.listCategoriesService()
await Promise.all([suspense(), categoriesRsup()])

const majorR = ref<Major>({})
const categoryR = ref<MajorCategory>({})

// 添加专业
const { mutateAsync } = CollegeService.addMajorService()
const addMajorActiveF = async () => {
  await mutateAsync(majorR.value)
  createElNotificationSuccess('专业添加成功')
  majorR.value = {}
  // 添加专业后刷新列表
  refetchCategoriesMajors()
}
const addMajorDisC = computed(() => majorR.value.name && majorR.value.majorCategoryId)

// 添加类别
const { mutateAsync: mutateAsyncCat } = CollegeService.addCategoryService()
const addCategoryF = async () => {
  // ===================暂时写死======================
  categoryR.value.weighting = { score: 85, compositeScore: 15 }
  // @ts-expect-error: JSON
  categoryR.value.weighting = JSON.stringify(categoryR.value.weighting)
  console.log('添加类别的参数：', categoryR.value)
  await mutateAsyncCat(categoryR.value)
  createElNotificationSuccess('类别添加成功')
  categoryR.value = {} // 清空输入框
}

// 移除类别
const { mutateAsync: removeCategoryMutate } = CollegeService.removeCategoryService()
const handleRemoveCategory = async (mcid: string) => {
  if (!confirm('确定移除该类别吗？')) return
  await removeCategoryMutate(mcid)
  createElNotificationSuccess('类别移除成功')
  // 刷新列表
  refetchCategoriesMajors()
}

// 跳转到专业管理页面
const manageMajors = (majorCategory: MajorCategory) => {
  router.push(`/college/categoryies/majors/${majorCategory.id}`)
}
</script>

<template>
  <div class="container" style="padding: 20px">
    <!-- 横向添加 -->
    <el-row class="my-row" :gutter="15" style="margin-bottom: 20px">
      <el-col :span="8">
        <el-input
          style="width: 240px; margin-right: 8px"
          v-model="categoryR.name"
          placeholder="类别名称"
          clearable />
        <el-button type="primary" @click="addCategoryF">添加类别</el-button>
      </el-col>

      <el-col :span="16">
        <el-select
          value-key="id"
          v-model="majorR.majorCategoryId"
          placeholder="类别"
          size="large"
          style="width: 200px; margin-right: 10px">
          <el-option
            v-for="(cat, index) of categoriesR"
            :key="index"
            :label="cat?.name"
            :value="cat?.id" />
        </el-select>
        <el-input
          style="width: 240px; margin-right: 8px"
          v-model="majorR.name"
          placeholder="专业名称"
          clearable />
        <el-button type="primary" @click="addMajorActiveF" :disabled="!addMajorDisC">
          添加专业
        </el-button>
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

.dashed {
  border-top: 2px dashed #dcdfe6;
  margin: 8px;
  padding: 8px;
}
</style>
