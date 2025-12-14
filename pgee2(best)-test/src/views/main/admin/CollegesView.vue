<template>
  <div class="college-page">
    <div class="toolbar">
      <el-button type="primary" @click="showAddCollegeModal" class="add-btn">添加学院</el-button>
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

    <el-dialog v-model="showModal" title="添加学院" width="400px" destroy-on-close>
      <el-form :model="collegeForm" label-width="0px" class="modal-form">
        <el-form-item>
          <el-input
            v-model="collegeForm.name"
            type="text"
            placeholder="请输入学院名称"
            class="form-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeModal" class="cancel-btn">取消</el-button>
        <el-button type="primary" @click="saveCollegeService" class="save-btn">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { College } from '@/types'
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 获取学院列表
const { data: collegesR } = CollegeService.listCollegeService()

// 模态框状态
const showModal = ref(false)
const collegeForm = ref({ id: '', name: '' })

// 添加学院相关
const addMutation = CollegeService.addCollegeService()

// 显示添加学院模态框
const showAddCollegeModal = () => {
  collegeForm.value = { id: '', name: '' }
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
}

// 保存学院
const saveCollegeService = async () => {
  const name = collegeForm.value.name.trim()
  if (!name) {
    createMessageDialog('请输入学院名称')
    return
  }

  await addMutation.mutateAsync({ name } as College)
  createMessageDialog('添加成功')
  closeModal()
  collegeForm.value.name = ''
}

// 删除学院
const removeMutation = CollegeService.removeCollegeService()
const handleRemove = async (id: string) => {
  if (!confirm('确定删除该学院吗？')) return
  await removeMutation.mutateAsync(id)
  createMessageDialog('删除成功')
}

// 跳转到管理员管理页面
const manageAdmins = (college: College) => {
  router.push(`/admin/college-admins/${college.id}`)
}
</script>

<style scoped>
.toolbar {
  margin-bottom: 1rem;
}
.add-btn {
  padding: 0.5rem 1rem;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button {
  margin-right: 0.5rem;
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.manage-btn {
  color: #52c41a;
}
.delete-btn {
  color: #ff4d4f;
}
.modal-form {
  width: 100%;
}
.form-input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
.cancel-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e8e8e8;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
}
.save-btn {
  padding: 0.5rem 1rem;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
