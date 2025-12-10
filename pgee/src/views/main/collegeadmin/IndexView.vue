<template>
  <div class="category-majors-page">
    <el-breadcrumb class="breadcrumb" separator=">">
      <el-breadcrumb-item @click="navigateToIndex" style="cursor: pointer; color: #1890ff">
        {{ college.name }}学院管理员中心
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="navigateToCategories" style="cursor: pointer; color: #1890ff">
        专业类别管理
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ category.name }} - 专业管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h2 class="page-title">{{ category.name }} 专业管理</h2>
      <el-button type="primary" class="add-btn" @click="showAddMajorModal">添加专业</el-button>
    </div>

    <el-card class="stats" shadow="hover">
      该类别下专业总数：
      <strong>{{ majors.length }}</strong>
    </el-card>

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

    <div v-else class="empty-state">
      <h3>该类别下暂无专业</h3>
      <p>点击"添加专业"按钮来添加</p>
    </div>

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
import { createMessageDialog } from '@/components/message'
import { CollegeService, MajorCategoryService, MajorService } from '@/services'
import { formatDate } from '@/services/FormatUtils'
import type { College, Major, MajorCategory } from '@/types'
import { getCollegeIdStrFromToken, isCollegeAdmin } from '@/utils/token'
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
import { nextTick, ref, watch } from 'vue' // 移除onMounted，改用watch
import { useRoute, useRouter } from 'vue-router'

// 错误类型定义（统一错误处理）
interface ErrorWithMessage {
  message: string
}
const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return typeof error === 'object' && error !== null && 'message' in error
}

const router = useRouter()
const route = useRoute()

// 核心：优先从Token获取学院ID，路由参数仅兜底
const collegeId = ref(getCollegeIdStrFromToken() || (route.params.collegeId as string))
const categoryId = ref(route.params.categoryId as string)

// 响应式数据
const showModal = ref(false)
const isEditing = ref(false)
const college = ref<College>({ id: '', name: '', createTime: '', updateTime: '' })
const category = ref<MajorCategory>({
  id: '',
  name: '',
  collegeId: '',
  calculationRule: {},
  createTime: '',
  updateTime: ''
})
const majors = ref<Major[]>([])
const majorForm = ref({
  id: '',
  name: ''
})

// 新增：标记是否已初始化，避免重复加载
const isInitialized = ref(false)

// 加载学院信息（完善错误处理 + 兜底显示）
const loadCollegeInfo = async () => {
  try {
    if (!collegeId.value) throw new Error('学院ID为空')
    const collegeInfo = await CollegeService.getCollegeById(collegeId.value)
    college.value = collegeInfo
  } catch (error: unknown) {
    const msg = isErrorWithMessage(error) ? error.message : '加载学院信息失败'
    console.error('加载学院信息失败：', error)
    ElMessage.error(msg)
    college.value.name = '所属学院' // 兜底显示
  }
}

// 加载类别信息（完善错误处理 + 兜底显示）
const loadCategoryInfo = async () => {
  try {
    if (!categoryId.value) throw new Error('专业类别ID为空')
    const categoryInfo = await MajorCategoryService.getCategoryById(categoryId.value)
    category.value = categoryInfo
  } catch (error: unknown) {
    const msg = isErrorWithMessage(error) ? error.message : '加载专业类别信息失败'
    console.error('加载类别信息失败：', error)
    ElMessage.error(msg)
    category.value.name = '未知类别' // 兜底显示
  }
}

// 加载该类别下的专业列表（完善错误处理）
const loadMajors = async () => {
  try {
    if (!categoryId.value) throw new Error('专业类别ID为空')
    const data = await MajorService.getMajorsByCategoryId(categoryId.value)
    majors.value = data
  } catch (error: unknown) {
    const msg = isErrorWithMessage(error) ? error.message : '加载专业列表失败'
    console.error('加载专业列表失败：', error)
    ElMessage.error(msg)
    majors.value = []
  }
}

// 显示添加专业弹窗
const showAddMajorModal = () => {
  isEditing.value = false
  majorForm.value = { id: '', name: '' }
  showModal.value = true
}

// 显示编辑专业弹窗
const editMajor = (major: Major) => {
  isEditing.value = true
  majorForm.value = { id: major.id, name: major.name }
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
}

// 保存专业（完善错误处理 + 匹配接口类型）
const saveMajor = async () => {
  // 基础校验
  if (!majorForm.value.name.trim()) {
    createMessageDialog('请输入专业名称')
    return
  }

  try {
    if (isEditing.value) {
      // 编辑专业
      const updateData = { name: majorForm.value.name.trim() }
      await MajorService.updateMajor(majorForm.value.id, updateData)
      createMessageDialog('更新成功')
    } else {
      // 添加专业（严格匹配接口类型）
      const addData: Omit<Major, 'id' | 'createTime' | 'updateTime'> = {
        name: majorForm.value.name.trim(),
        majorCategoryId: categoryId.value // 确保是string类型
      }
      await MajorService.addMajor(addData)
      createMessageDialog('添加成功')
    }
    closeModal()
    await loadMajors() // 重新加载列表
  } catch (error: unknown) {
    const msg = isErrorWithMessage(error) ? error.message : '操作失败，请重试'
    ElMessage.error(msg)
  }
}

// 删除专业（完善错误处理 + 取消操作不报错）
const removeMajor = async (major: Major) => {
  try {
    await ElMessageBox.confirm(`确定要删除专业"${major.name}"吗？此操作不可恢复！`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await MajorService.deleteMajor(major.id)
    createMessageDialog('删除成功')
    await loadMajors() // 重新加载列表
  } catch (error: unknown) {
    // 取消操作不报错
    if (error !== 'cancel' && isErrorWithMessage(error)) {
      ElMessage.error(error.message || '删除失败，请重试')
    }
  }
}

// 导航回管理员首页（使用Token中的学院ID，避免路由参数依赖）
const navigateToIndex = () => {
  const cid = getCollegeIdStrFromToken()
  router.push(`/collegeadmin/${cid}`) // 修正：原代码缺少学院ID参数
}

// 导航回类别管理页（使用Token中的学院ID）
const navigateToCategories = () => {
  const cid = getCollegeIdStrFromToken()
  router.push(`/collegeadmin/major-categories/${cid}`)
}

// ========== 初始化逻辑（替代onMounted，避免重复触发） ==========
const initPage = async () => {
  // 避免重复初始化
  if (isInitialized.value) return

  // 1. 权限验证
  if (!isCollegeAdmin()) {
    ElMessage.error('无学院管理员权限，请重新登录')
    sessionStorage.clear()
    router.push('/login')
    return
  }

  // 2. 学院ID验证
  if (!collegeId.value) {
    ElMessage.error('未获取到学院ID，请重新登录')
    sessionStorage.clear()
    router.push('/login')
    return
  }

  // 3. 加载数据（异步执行，避免阻塞）
  await Promise.all([loadCollegeInfo(), loadCategoryInfo(), loadMajors()])

  // 标记初始化完成
  isInitialized.value = true
}

// 监听路由参数变化，实现初始化（替代onMounted）
watch(
  () => [route.params.collegeId, route.params.categoryId],
  async newParams => {
    // 仅在当前页面执行（需给路由配置name，比如name: 'CategoryMajors'）
    if (route.name !== 'CategoryMajors') return

    // 更新参数（优先Token，兜底路由参数）
    collegeId.value = getCollegeIdStrFromToken() || (newParams[0] as string)
    categoryId.value = newParams[1] as string

    // 等待DOM更新后初始化
    await nextTick()
    await initPage()
  },
  { immediate: true } // 首次加载执行
)
</script>

<style scoped>
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

/* 子路由出口样式优化 */
:deep(.router-view) {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}
</style>
