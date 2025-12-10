<template>
  <div class="category-majors-page">
    <!-- 面包屑导航（增加双重兜底） -->
    <el-breadcrumb class="breadcrumb" separator=">">
      <el-breadcrumb-item @click="navigateToIndex" style="cursor: pointer; color: #1890ff">
        {{ college.name || '所属学院' }}学院管理员中心
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="navigateToCategories" style="cursor: pointer; color: #1890ff">
        专业类别管理
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ category.name || '未知类别' }} - 专业管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">{{ category.name || '未知类别' }} 专业管理</h2>
      <el-button type="primary" class="add-btn" @click="showAddMajorModal">添加专业</el-button>
    </div>

    <!-- 统计卡片 -->
    <el-card class="stats" shadow="hover">
      该类别下专业总数：
      <strong>{{ majors.length }}</strong>
    </el-card>

    <!-- 专业列表表格 -->
    <el-table
      v-if="majors.length > 0"
      :data="majors"
      border
      stripe
      style="width: 100%; margin: 1rem 0"
      :header-cell-style="{ background: '#f5f7fa' }">
      <el-table-column label="专业名称" prop="name" />
      <el-table-column label="创建时间" prop="createTime">
        <template #default="scope">
          {{ scope.row.createTime ? formatDate(scope.row.createTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prop="updateTime">
        <template #default="scope">
          {{ scope.row.updateTime ? formatDate(scope.row.updateTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <div class="action-buttons">
            <el-button type="warning" text class="action-btn" @click="editMajor(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" text class="action-btn" @click="removeMajor(scope.row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <h3>该类别下暂无专业</h3>
      <p>点击"添加专业"按钮来添加</p>
    </div>

    <!-- 添加/编辑专业弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="isEditing ? '编辑专业' : '添加专业'"
      width="400px"
      destroy-on-close>
      <el-form :model="majorForm" label-width="80px" class="modal-form">
        <el-form-item label="专业名称 *" required>
          <el-input v-model="majorForm.name" type="text" class="form-control" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeModal">取消</el-button>
        <el-button type="primary" @click="saveMajor">确定</el-button>
      </template>
    </el-dialog>

    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
// 组件/工具导入
import { createMessageDialog } from '@/components/message'
import { CollegeService, MajorCategoryService, MajorService } from '@/services'
import { formatDate } from '@/services/FormatUtils'
import type { College, Major, MajorCategory } from '@/types'
import { getCollegeIdStrFromToken, isCollegeAdmin } from '@/utils/token'

// Element Plus 组件导入
import {
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElTable,
  ElTableColumn
} from 'element-plus'

// Vue 核心API
import { nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 统一错误类型定义
interface ErrorWithMessage {
  message: string
}
const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return typeof error === 'object' && error !== null && 'message' in error
}

// 路由实例
const router = useRouter()
const route = useRoute()

// ========== 核心参数初始化（优先Token，兜底路由参数） ==========
// 提前解析Token中的学院ID，优先使用
const tokenCollegeId = getCollegeIdStrFromToken()
const collegeId = ref(tokenCollegeId || (route.params.collegeId as string))
const categoryId = ref(route.params.categoryId as string)

// ========== 响应式数据（初始化即兜底，避免空值） ==========
const showModal = ref(false)
const isEditing = ref(false)
const isInitialized = ref(false)

// 学院信息（初始就给兜底值）
const college = ref<College>({
  id: tokenCollegeId || '',
  name: '所属学院',
  createTime: '',
  updateTime: ''
})

// 专业类别信息（初始就给兜底值）
const category = ref<MajorCategory>({
  id: '',
  name: '未知类别',
  collegeId: tokenCollegeId || '',
  calculationRule: {},
  createTime: '',
  updateTime: ''
})

// 专业列表/表单
const majors = ref<Major[]>([])
const majorForm = ref({
  id: '',
  name: ''
})

// ========== 数据加载方法（完善错误处理+兜底） ==========
/**
 * 加载学院信息（确保始终有兜底值）
 */
const loadCollegeInfo = async () => {
  // 重置为兜底值（防止接口报错导致空值）
  college.value = {
    id: collegeId.value || '',
    name: '所属学院',
    createTime: '',
    updateTime: ''
  }

  // 学院ID为空，直接返回
  if (!collegeId.value) {
    ElMessage.warning('未获取到有效学院ID，使用默认名称')
    return
  }

  try {
    const collegeInfo = await CollegeService.getCollegeById(collegeId.value)
    // 接口返回有效数据才更新
    if (collegeInfo && collegeInfo.name) {
      college.value = collegeInfo
      console.log('学院信息加载成功：', collegeInfo)
    } else {
      ElMessage.warning('学院信息为空，使用默认名称')
    }
  } catch (error: unknown) {
    const msg = isErrorWithMessage(error) ? error.message : '加载学院信息失败'
    console.error('加载学院信息失败：', error)
    ElMessage.error(msg)
    // 强制保留兜底值
    college.value.name = '所属学院'
  }
}

/**
 * 加载专业类别信息（确保始终有兜底值）
 */
const loadCategoryInfo = async () => {
  // 重置为兜底值
  category.value = {
    id: '',
    name: '未知类别',
    collegeId: collegeId.value || '',
    calculationRule: {},
    createTime: '',
    updateTime: ''
  }

  // 类别ID为空，直接返回
  if (!categoryId.value) {
    ElMessage.warning('未获取到有效专业类别ID，使用默认名称')
    return
  }

  try {
    const categoryInfo = await MajorCategoryService.getCategoryById(categoryId.value)
    // 接口返回有效数据才更新
    if (categoryInfo && categoryInfo.name) {
      category.value = categoryInfo
      console.log('专业类别信息加载成功：', categoryInfo)
    } else {
      ElMessage.warning('专业类别信息为空，使用默认名称')
    }
  } catch (error: unknown) {
    const msg = isErrorWithMessage(error) ? error.message : '加载专业类别信息失败'
    console.error('加载类别信息失败：', error)
    ElMessage.error(msg)
    // 强制保留兜底值
    category.value.name = '未知类别'
  }
}

//加载专业列表
const loadMajors = async () => {
  majors.value = []

  if (!categoryId.value) {
    ElMessage.warning('未获取到有效专业类别ID，无法加载专业列表')
    return
  }

  const data = await MajorService.getMajorsByCategoryId(categoryId.value)
  majors.value = data || []
  console.log('专业列表加载成功：', data)
}

//显示添加专业弹窗

const showAddMajorModal = () => {
  isEditing.value = false
  majorForm.value = { id: '', name: '' }
  showModal.value = true
}

//显示编辑专业弹窗
const editMajor = (major: Major) => {
  isEditing.value = true
  majorForm.value = { id: major.id, name: major.name }
  showModal.value = true
}

//关闭弹窗
const closeModal = () => {
  showModal.value = false
}

//保存专业（添加/编辑）
const saveMajor = async () => {
  // 基础校验
  if (!majorForm.value.name.trim()) {
    createMessageDialog('请输入专业名称')
    return
  }

  if (isEditing.value) {
    // 编辑专业
    const updateData = { name: majorForm.value.name.trim() }
    await MajorService.updateMajor(majorForm.value.id, updateData)
    createMessageDialog('更新成功')
  } else {
    // 添加专业
    const addData: Omit<Major, 'id' | 'createTime' | 'updateTime'> = {
      name: majorForm.value.name.trim(),
      majorCategoryId: categoryId.value
    }
    await MajorService.addMajor(addData)
    createMessageDialog('添加成功')
  }

  // 关闭弹窗并重新加载列表
  closeModal()
  await loadMajors()
}

//删除专业
const removeMajor = async (major: Major) => {
  await ElMessageBox.confirm(`确定要删除专业"${major.name}"吗？此操作不可恢复！`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  await MajorService.deleteMajor(major.id)
  createMessageDialog('删除成功')
  await loadMajors()
}

const navigateToIndex = () => {
  const cid = getCollegeIdStrFromToken()
  router.push(`/collegeadmin/${cid}`)
}

const navigateToCategories = () => {
  const cid = getCollegeIdStrFromToken()
  router.push(`/collegeadmin/major-categories/${cid}`)
}

const initPage = async () => {
  if (isInitialized.value) return

  if (!isCollegeAdmin()) {
    ElMessage.error('无学院管理员权限，请重新登录')
    sessionStorage.clear()
    router.push('/login')
    return
  }

  if (!collegeId.value) {
    ElMessage.error('未获取到学院ID，请重新登录')
    sessionStorage.clear()
    router.push('/login')
    return
  }

  await Promise.all([loadCollegeInfo(), loadCategoryInfo(), loadMajors()])

  isInitialized.value = true
}

watch(
  () => [route.params.collegeId, route.params.categoryId],
  async newParams => {
    if (route.name !== 'CategoryMajors') return

    collegeId.value = getCollegeIdStrFromToken() || (newParams[0] as string)
    categoryId.value = newParams[1] as string

    await nextTick()
    await initPage()
  },
  { immediate: true }
)
</script>

<style scoped>
.category-majors-page {
  padding: 20px;
}

.breadcrumb {
  margin: 0 0 1rem 0;
  color: #666;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.add-btn {
  padding: 0.5rem 1rem;
}

.stats {
  margin: 1rem 0;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.3rem 0.6rem;
}

.empty-state {
  text-align: center;
  padding: 1rem;
  color: #666;
}

.modal-form {
  width: 100%;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-top: 0.3rem;
}

:deep(.router-view) {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}
</style>
