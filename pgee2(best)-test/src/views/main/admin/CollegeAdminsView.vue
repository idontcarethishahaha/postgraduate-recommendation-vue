<script setup lang="ts">
import { createElNotificationSuccess, createMessageDialog } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { User } from '@/types'
import { querycachename } from '@/vuequery/Const'
import { useQueryClient } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface CollegeAdminItem {
  id: string
  name: string
  account: string
  tel: string
}

const router = useRouter()
const route = useRoute()
const qc = useQueryClient()

const showModal = ref(false)
const searchKeyword = ref('')
const adminForm = ref({ name: '', account: '', tel: '', password: '' })
const currentCollegeId = ref(String(route.params.collegeId || ''))
const currentCollegeName = ref('加载中...')
const admins = ref<CollegeAdminItem[]>([])

const {
  data: adminsR,
  suspense: adminsSup,
  refetch: refetchAdmins
} = CollegeService.listCollegeAdminsService(currentCollegeId.value)
const {
  data: collegeR,
  suspense: collegeSup,
  refetch: refetchCollege
} = CollegeService.listCollegeByIdService(currentCollegeId.value)
const { mutateAsync: addAdminMutate } = CollegeService.addCollegeAdminService()
const { mutateAsync: removeAdminMutate } = CollegeService.removeCollegeAdminService()

const filteredAdmins = computed(() => {
  if (!searchKeyword.value) return admins.value
  const keyword = searchKeyword.value.toLowerCase()
  return admins.value.filter(
    item =>
      item.name?.toLowerCase().includes(keyword) ||
      item.account?.toLowerCase().includes(keyword) ||
      item.tel?.includes(keyword)
  )
})

// 管理员列表
const loadAdmins = async () => {
  if (!currentCollegeId.value) return
  await refetchAdmins()
  admins.value = adminsR.value || []
}

// 加载学院名称
const loadCollegeName = async () => {
  if (!currentCollegeId.value) return
  await refetchCollege()
  currentCollegeName.value = collegeR.value?.name || '未知学院'
}

// 保存管理员
const saveAdminService = async () => {
  const { name, account, tel } = adminForm.value
  if (!name.trim() || !account.trim()) {
    return createMessageDialog('姓名和账号不能为空')
  }
  await addAdminMutate({
    name: name.trim(),
    account: account.trim(),
    tel: tel.trim(),
    password: account.trim(),
    collegeId: currentCollegeId.value,
    role: 'COLLEGE_ADMIN'
  } as User)
  createElNotificationSuccess('添加成功')
  showModal.value = false
  adminForm.value = { name: '', account: '', tel: '', password: '' }
  qc.refetchQueries({ queryKey: [querycachename.college.counselors, currentCollegeId.value] })
  loadAdmins()
}

// 移除管理员
const handleRemoveAdmin = async (uid: string) => {
  if (!confirm('确定移除该管理员吗？')) return
  await removeAdminMutate(uid)
  createElNotificationSuccess('移除成功')
  qc.refetchQueries({ queryKey: [querycachename.college.counselors, currentCollegeId.value] })
  loadAdmins()
}

// 添加模态框
const showAddAdminModal = () => {
  adminForm.value = { name: '', account: '', tel: '', password: '' }
  showModal.value = true
}

const navigateToColleges = () => router.push('/admin/colleges')

if (!currentCollegeId.value) {
  createMessageDialog('无效的学院信息')
  router.push('/admin/colleges')
} else {
  await Promise.all([collegeSup(), adminsSup()])
  loadCollegeName()
  loadAdmins()
}
</script>

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
      <strong>{{ filteredAdmins.length }}</strong>
    </el-card>

    <el-table
      v-if="filteredAdmins.length"
      :data="filteredAdmins"
      border
      stripe
      style="width: 100%; margin: 1rem 0"
      :header-cell-style="{ background: '#f5f7fa' }">
      <el-table-column
        label="姓名"
        prop="name"
        :formatter="(row: CollegeAdminItem) => row.name || '-'" />
      <el-table-column label="账号" prop="account" />
      <el-table-column
        label="手机号"
        prop="tel"
        :formatter="(row: CollegeAdminItem) => row.tel || '-'" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button
            type="danger"
            text
            class="action-btn remove-btn"
            @click="handleRemoveAdmin(scope.row.id)">
            移除
          </el-button>
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
      </el-form>
      <template #footer>
        <el-button @click="showModal = false">取消</el-button>
        <el-button type="primary" @click="saveAdminService">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

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
.action-btn {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
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
