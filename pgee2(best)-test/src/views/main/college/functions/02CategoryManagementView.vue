<script setup lang="ts">
// 能用
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { Major, MajorCategory } from '@/types'
import { computed, ref } from 'vue'

const { data: categoriesMajorsR, suspense } = CollegeService.listcategoryMajorsService()
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
}
const addMajorDisC = computed(() => majorR.value.name && majorR.value.majorCategoryId)

// 添加类别
const { mutateAsync: mutateAsyncCat } = CollegeService.addCategoryService()
const addCategoryF = async () => {
  categoryR.value.weighting = { score: 85, compositeScore: 15 }
  // @ts-expect-error: JSON
  categoryR.value.weighting = JSON.stringify(categoryR.value.weighting)
  console.log('添加类别的参数：', categoryR.value)
  await mutateAsyncCat(categoryR.value)
  createElNotificationSuccess('类别添加成功')
  categoryR.value = {} // 清空输入框
}
</script>

<template>
  <div class="container" style="padding: 20px">
    <el-row class="my-row" :gutter="15">
      <el-col :span="8">
        <el-input
          style="width: 240px; margin-right: 8px"
          v-model="categoryR.name"
          placeholder="类别名称" />
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
          placeholder="专业名称" />
        <el-button type="primary" @click="addMajorActiveF" :disabled="!addMajorDisC">
          添加专业
        </el-button>
      </el-col>
    </el-row>

    <el-col>
      <div v-for="cat of categoriesMajorsR" :key="cat.majorCategory?.id" class="dashed">
        <span style="font-size: 18px; font-weight: bold">
          {{ cat.majorCategory?.name || '未知' }}
        </span>
        :
        <span v-for="major of cat.majors" :key="major.id" style="margin-right: 8px">
          {{ major.name }};
        </span>
      </div>
    </el-col>
  </div>
</template>

<style scoped>
.dashed {
  border-top: 2px dashed #dcdfe6;
  margin: 8px;
  padding: 8px;
}
</style>
