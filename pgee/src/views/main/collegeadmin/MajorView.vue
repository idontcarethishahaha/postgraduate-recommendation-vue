<template>
  <div class="major-page">
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
      <el-button type="primary" class="add-btn" @click="openAddModal">添加专业</el-button>
    </div>

    <el-card class="stats-card" shadow="hover">
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
      <el-table-column label="专业名称" prop="name" min-width="200" />
      <el-table-column label="创建时间" prop="createTime">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prop="updateTime">
        <template #default="scope">
          {{ formatDate(scope.row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <div class="action-buttons">
            <el-button type="warning" text class="edit-btn" @click="openEditModal(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" text class="delete-btn" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div v-else class="empty-state">
      <el-empty description="该类别下暂无专业，请点击添加按钮创建"></el-empty>
    </div>

    <el-dialog
      v-model="modalVisible"
      :title="isEditing ? '编辑专业' : '添加专业'"
      width="400px"
      destroy-on-close
      :close-on-click-modal="false">
      <el-form
        :model="majorForm"
        label-width="80px"
        class="modal-form"
        ref="majorFormRef"
        :rules="formRules">
        <el-form-item label="专业名称 *" prop="name">
          <el-input v-model="majorForm.name" placeholder="请输入专业名称" class="form-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeModal">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { CollegeService, MajorCategoryService, MajorService } from '@/services'
import { useMajorStore } from '@/stores/MajorStore'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { College, Major, MajorCategory } from '@/types'
import { getCollegeIdStrFromToken, isCollegeAdmin } from '@/utils/token'

interface ErrorWithMessage {
  message: string
}

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return typeof error === 'object' && error !== null && 'message' in error
}

// 路由实例
const router = useRouter()
const route = useRoute()

// 优先从Token获取学院ID
const collegeId = ref(getCollegeIdStrFromToken() || (route.params.collegeId as string))
const categoryId = ref(route.params.categoryId as string)

const modalVisible = ref(false)
const isEditing = ref(false)
const submitLoading = ref(false)
const majorFormRef = ref<FormInstance>()
const college = ref<College>({ id: '', name: '', createTime: '', updateTime: '' })
const category = ref<MajorCategory>({
  id: '',
  name: '',
  collegeId: '',
  calculationRule: {},
  createTime: '',
  updateTime: ''
})

const { majors, setMajors, addMajor, updateMajor, removeMajor } = useMajorStore()

// 表单验证规则
const formRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入专业名称', trigger: 'blur' },
    { min: 2, max: 50, message: '专业名称长度需在2-50个字符之间', trigger: 'blur' }
  ]
})

// 表单数据（匹配Major接口的string类型ID）
const majorForm = ref({
  id: '',
  name: ''
})

// ========== 初始化逻辑（替代 onMounted） ==========
const initPage = async () => {
  // 验证是否为学院管理员
  if (!isCollegeAdmin()) {
    ElMessage.error('无学院管理员权限，请重新登录')
    sessionStorage.clear()
    router.push('/login')
    return
  }

  // 验证学院ID有效性
  if (!collegeId.value) {
    ElMessage.error('未获取到学院ID，请重新登录')
    sessionStorage.clear()
    router.push('/login')
    return
  }

  // 加载数据
  try {
    await loadCollegeInfo()
    await loadCategoryInfo()
    await loadMajors()
  } catch (error: unknown) {
    const msg = isErrorWithMessage(error) ? error.message : '页面初始化失败，请重试'
    ElMessage.error(msg)
  }
}

// 监听路由参数变化，实现初始化（替代onMounted）
watch(
  () => route.params,
  async () => {
    // 更新学院ID和类别ID（路由参数兜底）
    collegeId.value = getCollegeIdStrFromToken() || (route.params.collegeId as string)
    categoryId.value = route.params.categoryId as string
    // 等待DOM更新后执行初始化
    await nextTick()
    await initPage()
  },
  { immediate: true, deep: true }
)

// 加载学院信息（增加空值校验）
const loadCollegeInfo = async () => {
  try {
    if (!collegeId.value) throw new Error('学院ID为空')
    college.value = await CollegeService.getCollegeById(collegeId.value)
  } catch (error: unknown) {
    const msg = isErrorWithMessage(error) ? error.message : '加载学院信息失败'
    ElMessage.error(msg)
    college.value.name = '所属学院' // 兜底显示
  }
}

// 加载专业类别信息（空值校验 + 错误处理）
const loadCategoryInfo = async () => {
  try {
    if (!categoryId.value) throw new Error('专业类别ID为空')
    const categoryData = await MajorCategoryService.getCategoryById(categoryId.value)
    category.value = categoryData
  } catch (error: unknown) {
    const msg = isErrorWithMessage(error) ? error.message : '加载专业类别信息失败'
    ElMessage.error(msg)
    category.value.name = '未知类别' // 兜底显示
  }
}

// 加载专业列表（空值校验 + 错误处理）
const loadMajors = async () => {
  try {
    if (!categoryId.value) throw new Error('专业类别ID为空')
    const majorsData = await MajorService.getMajorsByCategoryId(categoryId.value)
    setMajors(majorsData)
  } catch (error: unknown) {
    const msg = isErrorWithMessage(error) ? error.message : '加载专业列表失败'
    ElMessage.error(msg)
  }
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 打开添加模态框
const openAddModal = () => {
  isEditing.value = false
  majorForm.value = { id: '', name: '' }
  modalVisible.value = true
}

// 打开编辑模态框
const openEditModal = (major: Major) => {
  isEditing.value = true
  majorForm.value = { ...major }
  modalVisible.value = true
}

// 关闭模态框
const closeModal = () => {
  modalVisible.value = false
  majorFormRef.value?.resetFields()
}

// 提交表单（添加/编辑 + 错误处理）
const submitForm = async () => {
  try {
    await majorFormRef.value?.validate()
    submitLoading.value = true

    if (isEditing.value) {
      // 编辑专业
      const updateData = { name: majorForm.value.name.trim() }
      await MajorService.updateMajor(majorForm.value.id, updateData)
      updateMajor(majorForm.value.id, updateData)
      ElMessage.success('专业编辑成功')
    } else {
      // 添加专业
      const addData = {
        name: majorForm.value.name.trim(),
        majorCategoryId: categoryId.value
      }
      const newMajor = await MajorService.addMajor(addData)
      addMajor(newMajor)
      ElMessage.success('专业添加成功')
    }

    closeModal()
  } catch (error: unknown) {
    const msg = isErrorWithMessage(error) ? error.message : '操作失败，请重试'
    ElMessage.error(msg)
  } finally {
    submitLoading.value = false
  }
}

// 删除专业
const handleDelete = async (major: Major) => {
  try {
    await ElMessageBox.confirm(`确定要删除「${major.name}」这个专业吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await MajorService.deleteMajor(major.id)
    removeMajor(major.id)
    ElMessage.success('专业删除成功')
  } catch (error: unknown) {
    if (error !== 'cancel' && isErrorWithMessage(error)) {
      ElMessage.error(error.message || '删除失败，请重试')
    }
  }
}

// 导航回学院管理员首页（从Token获取学院ID）
const navigateToIndex = () => {
  const cid = getCollegeIdStrFromToken()
  router.push(`/collegeadmin/${cid}`)
}

// 导航回专业类别列表（从Token获取学院ID）
const navigateToCategories = () => {
  const cid = getCollegeIdStrFromToken()
  router.push(`/collegeadmin/major-categories/${cid}`)
}
</script>

<style scoped>
.major-page {
  padding: 16px;
}

.breadcrumb {
  margin-bottom: 16px;
  font-size: 14px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.add-btn {
  padding: 8px 16px;
}

.stats-card {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn {
  color: #e6a23c;
}

.delete-btn {
  color: #f56c6c;
}

.empty-state {
  padding: 48px 0;
  text-align: center;
}

.modal-form {
  padding: 8px 0;
}

.form-input {
  width: 100%;
  margin-top: 4px;
}
</style>
