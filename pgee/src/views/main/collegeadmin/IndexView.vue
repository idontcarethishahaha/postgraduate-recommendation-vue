<!-- src/views/main/collegeadmin/CategoryMajorsView.vue -->
<template>
  <div class="category-majors-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator=">">
      <el-breadcrumb-item @click="navigateToIndex" style="cursor: pointer; color: #1890ff">
        {{ college.name }}学院管理员中心
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="navigateToCategories" style="cursor: pointer; color: #1890ff">
        专业类别管理
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ category.name }} - 专业管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">{{ category.name }} 专业管理</h2>
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

    <!-- 添加/修改专业模态框 -->
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
import {
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessageBox,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 路由参数
const collegeId = ref(route.params.collegeId as string)
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

// 加载学院信息
const loadCollegeInfo = async () => {
  const collegeInfo = await CollegeService.getCollegeById(collegeId.value)
  college.value = collegeInfo
}

// 加载类别信息
const loadCategoryInfo = async () => {
  const categoryInfo = await MajorCategoryService.getCategoryById(categoryId.value)
  category.value = categoryInfo
}

// 加载该类别下的专业列表
const loadMajors = async () => {
  const data = await MajorService.getMajorsByCategoryId(categoryId.value)
  majors.value = data
}

// 显示添加专业弹窗
const showAddMajorModal = () => {
  isEditing.value = false
  majorForm.value = {
    id: '',
    name: ''
  }
  showModal.value = true
}

// 显示编辑专业弹窗
const editMajor = (major: Major) => {
  isEditing.value = true
  majorForm.value = {
    id: major.id,
    name: major.name
  }
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
}

// 保存专业
const saveMajor = async () => {
  if (!majorForm.value.name.trim()) {
    createMessageDialog('请输入专业名称')
    return
  }

  if (isEditing.value) {
    const updateData = {
      name: majorForm.value.name.trim()
    }
    await MajorService.updateMajor(majorForm.value.id, updateData)
    createMessageDialog('更新成功')
  } else {
    const addData: Omit<Major, 'id' | 'createTime' | 'updateTime'> = {
      name: majorForm.value.name.trim(),
      majorCategoryId: categoryId.value
    }
    await MajorService.addMajor(addData)
    createMessageDialog('添加成功')
  }

  closeModal()
  loadMajors()
}

// 删除专业
const removeMajor = async (major: Major) => {
  await ElMessageBox.confirm(`确定要删除专业"${major.name}"吗？此操作不可恢复！`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  await MajorService.deleteMajor(major.id)
  createMessageDialog('删除成功')
  loadMajors()
}

// 导航回管理员首页
const navigateToIndex = () => {
  router.push('/collegeadmin')
}

// 导航回类别管理页
const navigateToCategories = () => {
  router.push(`/collegeadmin/major-categories/${collegeId.value}`)
}

// 初始化加载
onMounted(() => {
  loadCollegeInfo()
  loadCategoryInfo()
  loadMajors()
})
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
  padding: 3rem;
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
</style>
