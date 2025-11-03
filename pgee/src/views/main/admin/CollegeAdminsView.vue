<template>
  <div class="college-admins-container">
    <el-page-header content="学院管理员管理" />
    <div class="operate-bar">
      <el-button type="primary" @click="showAddModal = true">添加管理员</el-button>
    </div>
    <el-table :data="admins" border stripe>
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="姓名" prop="name" />
      <el-table-column label="账号" prop="account" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" danger @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="showAddModal"
      :title="isEditing ? '编辑管理员' : '添加管理员'"
      width="500px">
      <el-form :model="adminForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="adminForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="adminForm.account" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" v-if="!isEditing">
          <el-input v-model="adminForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="isEditing ? handleUpdate() : addAdmin()">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { CollegeAdminService } from '@/services'
import type { CollegeAdmin, CollegeAdminForm } from '@/types'
import { createMessageDialog } from '@/utils/message'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentCollegeId = ref<string>(route.query.collegeId as string)
const admins = ref<CollegeAdmin[]>([])
const showAddModal = ref(false)
const isEditing = ref(false)
const adminForm = ref<CollegeAdminForm>({
  id: '',
  name: '',
  account: '',
  password: '',
  collegeId: currentCollegeId.value
})

// 组件内表单验证（原在 CollegeAdminService 中，移到组件内）
const validateAdminForm = (form: typeof adminForm.value): boolean => {
  if (!form.name.trim()) {
    createMessageDialog('请输入姓名')
    return false
  }
  if (!form.account.trim()) {
    createMessageDialog('请输入账号')
    return false
  }
  if (!isEditing.value && !form.password.trim()) {
    createMessageDialog('请输入密码')
    return false
  }
  return true
}

// 加载管理员列表：移除 try/catch
const loadAdmins = async () => {
  const adminsData = await CollegeAdminService.getCollegeAdmins(currentCollegeId.value)
  admins.value = adminsData
}

// 监听学院ID变化，重新加载数据
watch(
  currentCollegeId,
  () => {
    adminForm.value.collegeId = currentCollegeId.value
    loadAdmins()
  },
  { immediate: true }
)

// 添加管理员
const addAdmin = async () => {
  if (!validateAdminForm(adminForm.value)) return

  await CollegeAdminService.addCollegeAdmin(adminForm.value)
  showAddModal.value = false
  createMessageDialog('添加成功', 'success')
  // 重置表单
  adminForm.value = {
    id: '',
    name: '',
    account: '',
    password: '',
    collegeId: currentCollegeId.value
  }
  loadAdmins()
}

// 编辑管理员
const handleEdit = (row: CollegeAdmin) => {
  isEditing.value = true
  adminForm.value = { ...row, collegeId: currentCollegeId.value }
  showAddModal.value = true
}

// 更新管理员
const handleUpdate = async () => {
  if (!validateAdminForm(adminForm.value)) return

  await CollegeAdminService.updateCollegeAdmin(adminForm.value)
  showAddModal.value = false
  createMessageDialog('编辑成功', 'success')
  loadAdmins()
}

// 删除管理员
const handleDelete = async (id: string) => {
  await CollegeAdminService.deleteCollegeAdmin(id)
  createMessageDialog('删除成功', 'success')
  loadAdmins()
}
</script>

<style scoped>
.college-admins-container {
  padding: 20px;
}

.operate-bar {
  margin-bottom: 16px;
}
</style>
