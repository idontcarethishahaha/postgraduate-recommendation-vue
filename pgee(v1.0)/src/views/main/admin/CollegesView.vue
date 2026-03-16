<script setup lang="ts">
import { createElNotificationSuccess, createMessageDialog } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { College } from '@/types'
import { ElButton, ElInput, ElTable, ElTableColumn } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 获取学院列表
const { data: collegesR, refetch: refetchColleges } = CollegeService.listCollegeService()

// 绑定输入框值
const collegeName = ref('')

// 添加学院相关
const addMutation = CollegeService.addCollegeService()

// 保存学院
const saveCollegeService = async () => {
  const name = collegeName.value.trim()
  if (!name) {
    createMessageDialog('请输入学院名称')
    return
  }

  await addMutation.mutateAsync({ name } as College)
  createElNotificationSuccess('添加成功')
  collegeName.value = '' // 清空输入框
  refetchColleges() // 刷新列表
}

// 删除学院
const removeMutation = CollegeService.removeCollegeService()
const handleRemove = async (id: string) => {
  if (!confirm('确定删除该学院吗？')) return
  await removeMutation.mutateAsync(id)
  createElNotificationSuccess('删除成功')
  refetchColleges() // 刷新列表
}

// 跳转到管理员管理页面
const manageAdmins = (college: College) => {
  router.push(`/admin/college-admins/${college.id}`)
}
</script>

<template>
  <div class="college-page">
    <div class="toolbar">
      <el-input
        v-model="collegeName"
        type="text"
        placeholder="请输入学院名称"
        class="add-input"
        @keypress.enter="saveCollegeService"
        clearable />
      <el-button type="primary" @click="saveCollegeService" class="add-btn">添加学院</el-button>
    </div>

    <div class="college-list">
      <el-table
        :data="collegesR"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }">
        <el-table-column label="学院名称" prop="name" />
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button type="success" text @click="manageAdmins(scope.row)" class="manage-btn">
              管理学院管理员
            </el-button>
            <el-button type="danger" text @click="handleRemove(scope.row.id)" class="delete-btn">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-input {
  width: 300px;
  padding: 0.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.manage-btn {
  color: #52c41a;
}
.delete-btn {
  color: #ff4d4f;
}
</style>
