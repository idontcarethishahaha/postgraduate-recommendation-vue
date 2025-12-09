<template>
  <div class="admins-page">
    <el-breadcrumb class="breadcrumb" separator=">">
      <el-breadcrumb-item @click="navigateToColleges" style="cursor: pointer; color: #1890ff">
        学院管理
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <span>{{ currentCollegeName }} - 管理员管理</span>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h2 class="page-title">{{ currentCollegeName }} - 管理员管理</h2>
      <div class="actions">
        <el-input
          v-model="searchKeyword"
          class="search-box"
          placeholder="搜索管理员..."
          @keypress.enter="loadAdmins"
          style="width: 200px"
          clearable />
        <el-button class="btn" @click="loadAdmins">搜索</el-button>
        <el-button type="primary" class="btn btn-primary" @click="showAddAdminModal">
          添加管理员
        </el-button>
        <el-button class="btn" @click="loadAdmins">刷新</el-button>
      </div>
    </div>

    <el-card class="stats" shadow="hover">
      当前学院管理员总数：
      <strong>{{ adminCount }}</strong>
    </el-card>

    <el-table
      v-if="filteredAdmins.length > 0"
      :data="filteredAdmins"
      border
      stripe
      style="width: 100%; margin: 1rem 0"
      :header-cell-style="{ background: '#f5f7fa' }">
      <el-table-column label="姓名" prop="name">
        <template #default="scope">
          {{ scope.row.name || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="账号" prop="account" />
      <el-table-column label="手机号" prop="tel">
        <template #default="scope">
          {{ scope.row.tel || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <div class="action-buttons">
            <el-button
              type="warning"
              text
              class="action-btn reset-btn"
              @click="resetPassword(scope.row)">
              重置密码
            </el-button>
            <el-button
              type="danger"
              text
              class="action-btn remove-btn"
              @click="removeAdmin(scope.row)">
              移除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div v-else class="empty-state">
      <h3>暂无管理员</h3>
      <p>当前学院还没有管理员，点击"添加管理员"按钮来添加</p>
    </div>

    <el-dialog v-model="showModal" title="添加学院管理员" width="400px" destroy-on-close>
      <el-form :model="adminForm" label-width="80px" class="modal-form">
        <el-form-item label="姓名 *" required>
          <el-input v-model="adminForm.name" type="text" class="form-control" />
        </el-form-item>
        <el-form-item label="账号 *" required>
          <el-input v-model="adminForm.account" type="text" class="form-control" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="adminForm.tel" type="tel" class="form-control" />
        </el-form-item>
        <el-form-item label="初始密码">
          <el-input
            v-model="adminForm.password"
            type="text"
            class="form-control"
            placeholder="留空则使用账号作为密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="btn" @click="closeModal">取消</el-button>
        <el-button type="primary" class="btn btn-primary" @click="addAdmin">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import { CollegeAdminService } from '@/services'
import { formatDate } from '@/services/FormatUtils'
import type { User } from '@/types'
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const showModal = ref(false)
const searchKeyword = ref('')
const admins = ref<User[]>([])
const adminForm = ref({
  name: '',
  account: '',
  tel: '',
  password: ''
})

// 从路由路径参数获取学院信息,用params
const currentCollegeId = ref('')
const currentCollegeName = ref('')

const filteredAdmins = computed(() => {
  if (!searchKeyword.value) return admins.value

  const keyword = searchKeyword.value.toLowerCase()
  return admins.value.filter(
    admin =>
      (admin.name && admin.name.toLowerCase().includes(keyword)) ||
      (admin.account && admin.account.toLowerCase().includes(keyword)) ||
      (admin.tel && admin.tel.includes(keyword))
  )
})

const adminCount = computed(() => admins.value.length)

// 添加管理员
const showAddAdminModal = () => {
  adminForm.value = { name: '', account: '', tel: '', password: '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// 加载管理员列表
const loadAdmins = async () => {
  const adminsData = await CollegeAdminService.getCollegeAdmins(currentCollegeId.value)
  admins.value = adminsData
}

// 添加管理员
const addAdmin = async () => {
  const validation = CollegeAdminService.validateAdminForm(adminForm.value)
  if (!validation.isValid) {
    createMessageDialog(validation.message)
    return
  }

  await CollegeAdminService.addCollegeAdmin(currentCollegeId.value, {
    name: adminForm.value.name.trim(),
    account: adminForm.value.account.trim(),
    tel: adminForm.value.tel.trim(),
    password: adminForm.value.password.trim() || adminForm.value.account.trim()
  })
  createMessageDialog('添加成功')
  closeModal()
  await loadAdmins()
}

// 重置密码
const resetPassword = async (admin: User) => {
  if (
    !(await ElMessageBox.confirm(
      `确定要重置管理员 "${admin.name}" 的密码吗？密码将重置为默认值。`,
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ))
  ) {
    return
  }

  await CollegeAdminService.resetPassword(admin.account)
  createMessageDialog('密码重置成功')
}

// 移除管理员
const removeAdmin = async (admin: User) => {
  if (
    !(await ElMessageBox.confirm(
      `确定要移除管理员 "${admin.name}" 吗？此操作不可恢复！`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ))
  ) {
    return
  }

  await CollegeAdminService.removeCollegeAdmin(currentCollegeId.value, admin.id)
  createMessageDialog('移除成功')
  await loadAdmins()
}

// 跳转到学院管理页面
const navigateToColleges = () => {
  router.push('/admin/colleges')
}

//从route.params获取路径参数
currentCollegeId.value = route.params.collegeId as string
currentCollegeName.value = decodeURIComponent((route.params.collegeName as string) || '')

if (!currentCollegeId.value) {
  createMessageDialog('无效的学院信息')
  router.push('/admin/colleges')
} else {
  loadAdmins()
}
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
.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.search-box {
  padding: 0.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e8e8e8;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary {
  background: #1890ff;
  color: white;
  border: none;
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
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.reset-btn {
  color: #faad14;
}
.remove-btn {
  color: #ff4d4f;
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
