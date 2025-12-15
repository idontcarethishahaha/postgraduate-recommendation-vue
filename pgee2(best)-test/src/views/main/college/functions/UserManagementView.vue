<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { MajorCategory, RegisterUserDTO } from '@/types'
import { computed, ref, watch } from 'vue'

// 拉取类别-专业列表（参考原下拉框页面的数据源）
const {
  data: categoryMajorsR,
  suspense: categoryMajorsSuspense,
  refetch: refetchCategoryMajors
} = CollegeService.listcategoryMajorsService()
// 拉取辅导员列表
const {
  data: counselorsData,
  suspense: counselorsSuspense,
  refetch: refetchCounselors
} = CollegeService.listCounselorsService()

// 等待所有数据加载完成
await Promise.all([categoryMajorsSuspense(), counselorsSuspense()])

// 处理类别数据（去重并过滤有效类别）
const categories = ref<MajorCategory[]>([])
const initCategories = () => {
  const categoryMap = new Map<string, MajorCategory>()
  ;(categoryMajorsR.value ?? []).forEach(cm => {
    if (cm.majorCategory?.id) {
      categoryMap.set(cm.majorCategory.id, cm.majorCategory)
    }
  })
  categories.value = Array.from(categoryMap.values())
}

// 初始化类别列表
initCategories()
// 监听类别数据变化
watch(categoryMajorsR, initCategories, { immediate: true, deep: true })

// 表单数据
const userR = ref<RegisterUserDTO>({
  name: '',
  account: '',
  majorCategoryIds: []
})
// 选中的类别（下拉框单选项）
const selectedCategory = ref<MajorCategory | null>(null)

// 添加辅导员的mutation
const { mutateAsync: addAdminMutate } = CollegeService.addAdminService()

// 提交表单
const submitF = async () => {
  try {
    if (!userR.value.name || !userR.value.account || !selectedCategory.value?.id) {
      return
    }

    // 组装提交数据
    const submitData: RegisterUserDTO = {
      ...userR.value,
      majorCategoryIds: [selectedCategory.value.id] // 下拉框单选，数组只包含一个id
    }

    await addAdminMutate(submitData)
    createElNotificationSuccess('辅导员添加成功')

    // 重置表单
    userR.value = { name: '', account: '', majorCategoryIds: [] }
    selectedCategory.value = null

    // 重新拉取数据
    await Promise.all([refetchCategoryMajors(), refetchCounselors()])
  } catch (error) {
    console.error('添加辅导员失败:', error)
  }
}

// 提交按钮禁用状态计算
const submitC = computed(() => {
  return !!userR.value.name && !!userR.value.account && !!selectedCategory.value?.id
})
</script>

<template>
  <el-row class="my-row">
    <el-col>
      <el-form label-width="80px" style="width: 400px">
        <el-form-item>
          <p class="info">在此添加辅导员(默认密码为工号)</p>
          <p v-for="catUser of counselorsData" :key="catUser.majorCategory?.id">
            {{ catUser.majorCategory?.name }}:
            <span v-for="user of catUser.users" :key="user.id">{{ user.name }};</span>
          </p>
        </el-form-item>

        <el-form-item label="姓名">
          <el-input v-model="userR.name" placeholder="*姓名" size="large" />
        </el-form-item>

        <el-form-item label="工号">
          <el-input v-model="userR.account" placeholder="*工号" size="large" />
        </el-form-item>

        <el-form-item label="所属类别">
          <el-select
            v-model="selectedCategory"
            value-key="id"
            placeholder="请选择类别"
            size="large"
            style="width: 100%">
            <el-option v-for="cat of categories" :key="cat.id" :label="cat.name" :value="cat" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            @click="submitF"
            :disabled="!submitC"
            style="padding: 8px 16px; border-radius: 4px">
            添加辅导员
          </el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style scoped>
.info {
  color: #769ff1;
  font-size: 15px;
  margin-bottom: 10px;
}

:deep(.el-button) {
  color: #ffffff !important;
  border-color: #1890ff !important;
  background-color: #1890ff !important;
  border: none;
}

:deep(.el-button:disabled) {
  background-color: #a0cfff !important;
  border-color: #a0cfff !important;
  color: #ffffff !important;
  cursor: not-allowed;
}

:deep(.el-button:not(:disabled):hover) {
  background-color: #40a9ff !important;
  border-color: #40a9ff !important;
  color: #ffffff !important;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select__wrapper) {
  border-radius: 4px;
}
</style>
