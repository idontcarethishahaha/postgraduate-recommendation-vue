<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { MajorCategory, RegisterUserDTO, User } from '@/types'
import { computed, ref, watch } from 'vue'

// 拉取辅导员列表（包含类别信息）- 参考原页面的suspense使用方式
const {
  data: counselorsData,
  suspense: counselorsSuspense,
  refetch: refetchCounselors
} = CollegeService.listCounselorsService()

// 手动触发suspense加载数据
await counselorsSuspense()

// 处理类别数据 - 过滤有效类别并去重
const categoriesR = ref<MajorCategory[]>([])
const filteredCounselors = computed(() => {
  return (counselorsData.value ?? []).filter(item => item.majorCategory?.id)
})

// 初始化类别列表
const initCategories = () => {
  const categoryMap = new Map<string, MajorCategory>()
  filteredCounselors.value.forEach(item => {
    if (item.majorCategory?.id) {
      categoryMap.set(item.majorCategory.id, item.majorCategory)
    }
  })
  categoriesR.value = Array.from(categoryMap.values())
}

// 初始化类别
initCategories()

// 监听辅导员数据变化，重新初始化类别
watch(counselorsData, initCategories, { immediate: true, deep: true })

// 表单数据
const userR = ref<RegisterUserDTO>({
  name: '',
  account: '',
  majorCategoryIds: []
})
const catidsR = ref<string[]>([])

// 添加辅导员的mutation
const { mutateAsync: addAdminMutate } = CollegeService.addAdminService()

// 提交表单
const submitF = async () => {
  try {
    // 验证表单数据
    if (!userR.value.name || !userR.value.account || catidsR.value.length === 0) {
      return
    }

    // 组装提交数据
    const submitData: RegisterUserDTO = {
      ...userR.value,
      majorCategoryIds: catidsR.value
    }

    // 调用添加接口
    await addAdminMutate(submitData)

    // 成功提示
    createElNotificationSuccess('辅导员添加成功')

    // 重置表单
    userR.value = { name: '', account: '', majorCategoryIds: [] }
    catidsR.value = []

    // 重新拉取数据
    await refetchCounselors()
  } catch (error) {
    console.error('添加辅导员失败:', error)
    // 可添加错误提示
  }
}

// 提交按钮禁用状态计算
const submitC = computed(() => {
  return !!userR.value.name && !!userR.value.account && catidsR.value.length > 0
})

// 格式化辅导员显示文本
const formatCounselorNames = (users?: User[]) => {
  if (!users || users.length === 0) return '无'
  return users.map(user => user.name).join('；')
}
</script>

<template>
  <el-row class="my-row" style="padding: 20px">
    <el-col :span="24">
      <el-form label-width="80px" style="width: 600px; max-width: 100%">
        <!-- 现有辅导员信息展示 -->
        <el-form-item label="现有辅导员">
          <div class="info">在此添加辅导员(默认密码为工号)</div>
          <div class="counselor-list">
            <div
              v-for="item in filteredCounselors"
              :key="item.majorCategory?.id"
              class="counselor-item">
              <span class="category-name">{{ item.majorCategory?.name || '未知类别' }}：</span>
              <span class="user-names">{{ formatCounselorNames(item.users) }}</span>
            </div>
            <div v-if="filteredCounselors.length === 0" class="empty-tip">暂无辅导员信息</div>
          </div>
        </el-form-item>

        <!-- 姓名输入 -->
        <el-form-item label="姓名" required>
          <el-input
            v-model="userR.name"
            placeholder="*请输入辅导员姓名"
            size="large"
            clearable
            maxlength="20"
            show-word-limit />
        </el-form-item>

        <!-- 工号输入 -->
        <el-form-item label="工号" required>
          <el-input
            v-model="userR.account"
            placeholder="*请输入辅导员工号"
            size="large"
            clearable
            maxlength="20"
            show-word-limit />
        </el-form-item>

        <!-- 所属类别选择 -->
        <el-form-item label="所属类别" required>
          <el-checkbox-group v-model="catidsR">
            <el-checkbox
              v-for="cat in categoriesR"
              :key="cat.id"
              :label="cat.id"
              :value="cat.id"
              size="large"
              border
              style="margin-right: 10px; margin-bottom: 10px">
              {{ cat.name }}
            </el-checkbox>
          </el-checkbox-group>
          <div v-if="categoriesR.length === 0" class="empty-tip">暂无可用类别</div>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            @click="submitF"
            :disabled="!submitC"
            size="large"
            style="padding: 8px 24px; border-radius: 4px">
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
  font-weight: 500;
}

.counselor-list {
  margin-top: 8px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.counselor-item {
  margin-bottom: 6px;
  line-height: 1.5;
}

.category-name {
  font-weight: 600;
  color: #303133;
}

.user-names {
  color: #606266;
  margin-left: 4px;
}

.empty-tip {
  color: #909399;
  font-size: 14px;
  padding: 8px 0;
}

:deep(.el-checkbox) {
  margin-bottom: 8px;
}

:deep(.el-button--primary) {
  &:disabled {
    background-color: #a0cfff !important;
    border-color: #a0cfff !important;
    color: #ffffff !important;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: #40a9ff !important;
    border-color: #40a9ff !important;
  }
}
</style>
