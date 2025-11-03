<template>
  <div class="colleges-container">
    <el-page-header content="学院管理" />
    <div class="operate-bar">
      <el-button type="primary" @click="showAddModal = true">添加学院</el-button>
    </div>
    <el-table :data="colleges" border stripe>
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="学院名称" prop="name" />
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleManageAdmins(scope.row.id)">管理管理员</el-button>
          <el-button type="text" danger @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="showAddModal" :title="isEditing ? '编辑学院' : '添加学院'" width="500px">
      <el-form :model="collegeForm" label-width="100px">
        <el-form-item label="学院名称">
          <el-input v-model="collegeForm.name" placeholder="请输入学院名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="isEditing ? handleUpdate() : addCollege()">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { CollegeService } from '@/services'
import { useCollegeStore } from '@/stores/CollegeStore'
import type { College, CollegeForm } from '@/types'
import { createMessageDialog } from '@/utils/message'
import { useQuery } from '@tanstack/vue-query'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const collegeStore = useCollegeStore()
const showAddModal = ref(false)
const isEditing = ref(false)
const collegeForm = ref<CollegeForm>({
  id: '',
  name: ''
})

// 组件内表单验证（原在 CollegeService 中，移到组件内）
const validateCollegeForm = (form: typeof collegeForm.value): boolean => {
  if (!form.name.trim()) {
    createMessageDialog('请输入学院名称')
    return false
  }
  return true
}

// 使用 TanStack Query 加载学院列表（替代 onMounted + 手动缓存）
const { data: colleges = [], refetch } = useQuery({
  queryKey: ['colleges'], // 缓存键（唯一标识）
  queryFn: async () => {
    const data = await CollegeService.getColleges()
    collegeStore.setColleges(data) // 同步到 Store
    return data
  }
})

// 添加学院
const addCollege = async () => {
  if (!validateCollegeForm(collegeForm.value)) return

  await CollegeService.addCollege(collegeForm.value)
  showAddModal.value = false
  createMessageDialog('添加成功', 'success')
  // 重置表单
  collegeForm.value = { id: '', name: '' }
  refetch() // 刷新数据（TanStack Query 自动更新缓存）
}

// 编辑学院
const handleEdit = (row: College) => {
  isEditing.value = true
  collegeForm.value = { ...row }
  showAddModal.value = true
}

// 更新学院
const handleUpdate = async () => {
  if (!validateCollegeForm(collegeForm.value)) return

  await CollegeService.updateCollege(collegeForm.value)
  showAddModal.value = false
  createMessageDialog('编辑成功', 'success')
  refetch()
}

// 删除学院
const handleDelete = async (id: string) => {
  await CollegeService.deleteCollege(id)
  createMessageDialog('删除成功', 'success')
  refetch()
}

// 跳转到管理员管理页
const handleManageAdmins = (collegeId: string) => {
  router.push({
    path: '/main/admin/college-admins',
    query: { collegeId }
  })
}
</script>

<style scoped>
.colleges-container {
  padding: 20px;
}

.operate-bar {
  margin-bottom: 16px;
}
</style>
