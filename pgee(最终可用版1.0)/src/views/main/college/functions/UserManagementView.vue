<script setup lang="ts">
import { createElNotificationError, createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { CounselorDTO, MajorCategory } from '@/types'
import { computed, ref, watch } from 'vue'
import CounselorsView from './CounselorsView.vue' // 辅导员管理子组件

// 拉取类别-专业列表
const {
  data: categoryMajorsR,
  suspense: categoryMajorsSuspense,
  refetch: refetchCategoryMajors
} = CollegeService.listcategoryMajorsService()
// 拉取辅导员列表
const { suspense: counselorsSuspense, refetch: refetchCounselors } =
  CollegeService.listCounselorsService()

await Promise.all([categoryMajorsSuspense(), counselorsSuspense()])

// 处理类别数据
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
initCategories()
watch(categoryMajorsR, initCategories, { immediate: true, deep: true })

// 表单数据
const userR = ref<Omit<CounselorDTO, 'collegeId'>>({
  name: '',
  account: '',
  tel: '',
  majorCategoryId: undefined
})
const selectedCategory = ref<MajorCategory | null>(null)

watch(
  selectedCategory,
  val => {
    userR.value.majorCategoryId = val?.id ? String(val.id) : undefined
  },
  { immediate: true }
)

// 手机号校验
const validateTel = () => {
  if (!userR.value.tel) return true
  return /^1[3-9]\d{9}$/.test(userR.value.tel)
}

// 工号校验
const validateAccount = () => {
  if (!userR.value.account) return true // 空值不校验
  return userR.value.account.length === 10
}

// 添加辅导员
const { mutateAsync: addCounselorMutate } = CollegeService.addCounselorService()

// 提交表单
const submitF = async () => {
  if (!userR.value.name) {
    createElNotificationError('请输入辅导员姓名')
    return
  }
  if (!userR.value.account) {
    createElNotificationError('请输入辅导员工号')
    return
  }

  if (userR.value.account.length !== 10) {
    createElNotificationError('请输入10位工号')
    return
  }
  if (!userR.value.majorCategoryId) {
    createElNotificationError('请选择所属类别')
    return
  }
  // 手机号校验
  if (userR.value.tel && !validateTel()) {
    createElNotificationError('请输入正确的11位手机号')
    return
  }

  // 组装提交数据
  const submitData: CounselorDTO = {
    name: userR.value.name,
    account: userR.value.account,
    tel: userR.value.tel,
    majorCategoryId: userR.value.majorCategoryId,
    collegeId: undefined
  }

  console.log('提交参数:', submitData)
  await addCounselorMutate(submitData)
  createElNotificationSuccess('辅导员添加成功')

  // 重置表单
  userR.value = {
    name: '',
    account: '',
    tel: '',
    majorCategoryId: undefined
  }
  selectedCategory.value = null

  // 刷新数据
  await Promise.all([refetchCategoryMajors(), refetchCounselors()])
}

// 提交按钮禁用状态
const submitC = computed(() => {
  const telValid = !userR.value.tel || validateTel()
  const accountValid = validateAccount() // 工号有效性校验
  return (
    !!userR.value.name &&
    !!userR.value.account &&
    !!userR.value.majorCategoryId &&
    telValid &&
    accountValid
  )
})

// 管理辅导员
const activeCategory = ref<{ id: string; name: string } | null>(null) // 当前激活类别
const isCounselorsDialogOpen = ref(false) // 弹窗显隐状态

// 打开辅导员管理弹窗
const openCounselorsView = (category: MajorCategory) => {
  if (!category.id) return
  activeCategory.value = { id: category.id, name: category.name || '未知类别' }
  isCounselorsDialogOpen.value = true
}

// 关闭辅导员管理弹窗
const closeCounselorsView = () => {
  isCounselorsDialogOpen.value = false
  activeCategory.value = null
}
</script>

<template>
  <el-row class="my-row" style="padding: 20px">
    <el-col>
      <!-- 添加辅导员表单 -->
      <el-form label-width="80px" style="width: 400px; margin-bottom: 30px">
        <el-form-item>
          <p class="info">在此添加辅导员(默认密码为工号)</p>
        </el-form-item>

        <el-form-item label="姓名" required>
          <el-input
            v-model="userR.name"
            placeholder="*请输入辅导员姓名"
            size="large"
            clearable
            show-word-limit />
        </el-form-item>

        <el-form-item label="工号" required>
          <el-input
            v-model="userR.account"
            placeholder="*请输入10位工号"
            size="large"
            clearable
            show-word-limit
            :class="{ 'tel-error': userR.account && !validateAccount() }" />
          <!-- 错误样式 -->
          <!-- 工号错误提示（新增） -->
          <div v-if="userR.account && !validateAccount()" class="tel-tip">请输入10位工号</div>
        </el-form-item>

        <el-form-item label="手机号">
          <el-input
            v-model="userR.tel"
            placeholder="请输入11位手机号（选填）"
            size="large"
            clearable
            maxlength="11"
            show-word-limit
            type="tel"
            :class="{ 'tel-error': userR.tel && !validateTel() }" />
          <div v-if="userR.tel && !validateTel()" class="tel-tip">请输入正确的11位手机号</div>
        </el-form-item>

        <el-form-item label="所属类别" required>
          <el-select
            v-model="selectedCategory"
            value-key="id"
            placeholder="请选择所属类别"
            size="large"
            style="width: 100%"
            clearable>
            <el-option v-for="cat of categories" :key="cat.id" :label="cat.name" :value="cat" />
          </el-select>
          <div v-if="categories.length === 0" class="empty-tip">暂无可选类别</div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="submitF"
            :disabled="!submitC"
            style="padding: 8px 16px; border-radius: 4px">
            添加辅导员
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 类别表格 -->
      <div class="category-table-container" style="width: 100%; max-width: 600px">
        <h3 style="margin-bottom: 16px; color: #303133">类别管理</h3>
        <el-table
          :data="categories"
          border
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa' }">
          <el-table-column label="类别名称" align="center" min-width="200">
            <template #default="scope">
              <span style="font-size: 14px; color: #303133">
                {{ scope.row.name || '未知类别' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="180">
            <template #default="scope">
              <el-button
                type="success"
                text
                class="manage-btn"
                @click="openCounselorsView(scope.row)"
                :disabled="!scope.row.id">
                管理辅导员
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="categories.length === 0" class="empty-tip" style="margin-top: 16px">
          暂无类别数据，请先添加类别
        </div>
      </div>
    </el-col>
  </el-row>

  <!-- 辅导员管理弹窗 -->
  <el-dialog v-model="isCounselorsDialogOpen" width="600px" @close="closeCounselorsView">
    <CounselorsView
      v-if="activeCategory"
      :category-id="activeCategory.id"
      :category-name="activeCategory.name"
      @close="closeCounselorsView" />
  </el-dialog>
</template>

<style scoped>
.info {
  color: #769ff1;
  font-size: 15px;
  margin-bottom: 10px;
}

.empty-tip {
  color: #909399;
  font-size: 14px;
  margin: 8px 0;
  text-align: center;
}

.tel-error {
  :deep(.el-input__wrapper) {
    border-color: #ff4d4f !important;
    box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
  }
}

.tel-tip {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1;
}

.manage-btn {
  color: #52c41a;
}

:deep(.el-button--primary) {
  color: #ffffff !important;
  border-color: #1890ff !important;
  background-color: #1890ff !important;
  border: none;
}

:deep(.el-button--primary:disabled) {
  background-color: #a0cfff !important;
  border-color: #a0cfff !important;
  color: #ffffff !important;
  cursor: not-allowed;
}

:deep(.el-button--primary:not(:disabled):hover) {
  background-color: #40a9ff !important;
  border-color: #40a9ff !important;
  color: #ffffff !important;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select__wrapper),
:deep(.el-input__wrapper) {
  border-radius: 4px;
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

.category-table-container {
  border-top: 1px solid #e8e8e8;
  padding-top: 20px;
}
</style>
