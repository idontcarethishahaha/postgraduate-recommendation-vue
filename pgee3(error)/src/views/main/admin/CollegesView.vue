<template>
  <div class="college-page">
    <div class="toolbar">
      <el-button type="primary" @click="showAddCollegeModal" class="add-btn">添加学院</el-button>
    </div>

    <div class="college-list">
      <el-table
        :data="colleges"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
        v-loading="listQuery.isLoading"
        element-loading-text="加载中...">
        <el-table-column label="学院名称" prop="name" />
        <el-table-column label="创建时间" prop="createTime">
          <template #default="scope">
            {{ scope.row.createTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="updateTime">
          <template #default="scope">
            {{ scope.row.updateTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button
              type="warning"
              text
              @click="editCollege(scope.row)"
              class="edit-btn"
              :loading="currentUpdateMutation?.isPending">
              编辑
            </el-button>
            <el-button type="success" text @click="manageAdmins(scope.row)" class="manage-btn">
              管理管理员
            </el-button>
            <el-button
              type="danger"
              text
              @click="removeCollege(scope.row)"
              class="delete-btn"
              :loading="deleteMutation.isPending">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 修复核心：el-dialog 不支持 loading 属性，移除后用按钮 loading 控制 -->
    <el-dialog
      v-model="showModal"
      :title="isEditing ? '编辑学院' : '添加学院'"
      width="400px"
      destroy-on-close
      :close-on-click-modal="false">
      <el-form :model="collegeForm" label-width="0px" class="modal-form">
        <el-form-item>
          <el-input
            v-model="collegeForm.name"
            type="text"
            placeholder="请输入学院名称"
            class="form-input"
            :disabled="addMutation.isPending || currentUpdateMutation?.isPending" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          @click="closeModal"
          class="cancel-btn"
          :disabled="addMutation.isPending || currentUpdateMutation?.isPending">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="saveCollege"
          class="save-btn"
          :loading="addMutation.isPending || currentUpdateMutation?.isPending">
          {{ isEditing ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { College } from '@/types'
import type { AddCollegeRequest, UpdateCollegeRequest } from '@/types/index'
import { useQueryClient } from '@tanstack/vue-query'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// 1. 初始化查询客户端（确保组件上下文）
const queryClient = useQueryClient()

// 2. 获取学院列表数据（兼容未登录/数据为空的情况）
const listQuery = CollegeService.useCollegesQuery()
const colleges = computed<College[]>(() => listQuery.data.value || [])

// 3. 初始化 mutation 实例（简化类型定义，避免复杂推导）
const addMutation = CollegeService.addCollegeService()
const deleteMutation = CollegeService.deleteCollegeService()
const currentUpdateMutation = ref<ReturnType<typeof CollegeService.updateCollegeService> | null>(
  null
)

// 4. 页面状态管理
const router = useRouter()
const showModal = ref(false)
const isEditing = ref(false)
const collegeForm = ref<{ id: string; name: string }>({ id: '', name: '' })

// 5. 页面初始化：仅登录后预加载数据
onMounted(() => {
  if (CollegeService.checkAdminLogin()) {
    CollegeService.prefetchColleges(queryClient)
  } else {
    // 未登录则跳转到登录页（解决登录跳转失败核心问题）
    router.push('/login')
  }
})

// 6. 事件处理方法
const showAddCollegeModal = () => {
  collegeForm.value = { id: '', name: '' }
  isEditing.value = false
  currentUpdateMutation.value = null
  showModal.value = true
}

const editCollege = (college: College) => {
  collegeForm.value = { ...college }
  isEditing.value = true
  currentUpdateMutation.value = CollegeService.updateCollegeService(college.id)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveCollege = async () => {
  // 表单验证
  const validation = CollegeService.validateCollegeForm(collegeForm.value)
  if (!validation.isValid) {
    createMessageDialog(validation.message)
    return
  }

  try {
    const collegeName = collegeForm.value.name.trim()
    if (isEditing.value && currentUpdateMutation.value) {
      // 执行更新操作
      const updateData: UpdateCollegeRequest = { name: collegeName }
      await currentUpdateMutation.value.mutateAsync(updateData)
    } else {
      // 执行添加操作
      await addMutation.mutateAsync({ name: collegeName } as AddCollegeRequest)
    }
    closeModal()
  } catch (error) {
    // 精准错误处理
    const errorMsg = error instanceof Error ? error.message : '操作失败'
    if (errorMsg !== '取消删除') {
      createMessageDialog(errorMsg)
    }
  }
}

const removeCollege = async (college: College) => {
  try {
    await deleteMutation.mutateAsync(college)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '删除失败'
    if (errorMsg !== '取消删除') {
      createMessageDialog(errorMsg)
    }
  }
}

const manageAdmins = (college: College) => {
  const encodedName = encodeURIComponent(college.name)
  router.push(`/admin/college-admins/${college.id}/${encodedName}`)
}
</script>

<style scoped>
.toolbar {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-start;
}

.add-btn {
  padding: 0.5rem 1rem;
}

.college-list {
  background: #fff;
  border-radius: 4px;
  padding: 1rem;
}

.edit-btn,
.manage-btn,
.delete-btn {
  margin-right: 0.5rem;
}

.modal-form {
  width: 100%;
  padding-top: 1rem;
}

.form-input {
  width: 100%;
}

::v-deep .el-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
}

.cancel-btn,
.save-btn {
  padding: 0.5rem 1.5rem;
}
</style>
