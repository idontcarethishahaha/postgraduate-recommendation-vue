<script setup lang="ts">
//有问题，待修改
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { Major, MajorCategory } from '@/types'
import { EditPen } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'

const { data: categoriesMajorsR, suspense } = CollegeService.listcategoryMajorsService()
const { data: categoriesR, suspense: categoriesRsup } = CollegeService.listCategoriesService()
await Promise.all([suspense(), categoriesRsup()])

const majorR = ref<Major>({})

const { mutateAsync } = CollegeService.addMajorService()

const addMajorActiveF = async () => {
  await mutateAsync(majorR.value)
  createElNotificationSuccess('专业添加成功')
  majorR.value = {}
}
const addMajorDisC = computed(() => majorR.value.name && majorR.value.majorCategoryId)

const { mutateAsync: mutateAsyncCat } = CollegeService.addCategoryService()
const categoryR = ref<MajorCategory>({})
// 这里写死了，后面改模态框==================
const addCategoryF = async () => {
  categoryR.value.weighting = { score: 85, compositeScore: 15 }
  // @ts-expect-error: JSON
  categoryR.value.weighting = JSON.stringify(categoryR.value.weighting)
  //test
  console.log('添加类别的参数：', categoryR.value)
  await mutateAsyncCat(categoryR.value)
}
//=================
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-input
        style="width: 240px; margin-right: 8px"
        v-model="categoryR.name"
        placeholder="类别名称" />
      <el-button type="primary" @click="addCategoryF">
        <el-icon><EditPen /></el-icon>
      </el-button>
    </el-col>
    <el-col>
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
        <el-icon><EditPen /></el-icon>
      </el-button>
    </el-col>
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
  </el-row>
</template>
<style scoped>
.dashed {
  border-top: 2px dashed #dcdfe6;
  margin: 8px;
  padding: 8px;
}
</style>
