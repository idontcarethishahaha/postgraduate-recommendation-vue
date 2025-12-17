<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'
import { CONFIRMED, PENDING_MODIFICATION, REJECTED } from '@/services/Const'
import type { StudentItem, StudentItemLog, StudentItemResp } from '@/types'
import { computed, ref } from 'vue'

const dialogVisible = ref(true)
const props = defineProps<{ close: () => void; stuitem: StudentItemResp }>()
const pointR = ref(props.stuitem.point ?? 0)
const checkStatusR = ref()
const commentR = ref('')

const isConfirmC = computed(() => checkStatusR.value === 'confirm')

const disSubmitC = computed(
  () => !checkStatusR.value || (props.stuitem.maxPoints && pointR.value > props.stuitem.maxPoints)
)

const closeF = () => {
  props.close()
}

const { data: adminUserR } = CommonService.getUserInfoService()

const { mutateAsync } = CollegeService.updateStudentItemSercice(props.stuitem.userId!)

const submitF = async () => {
  const stuItem: StudentItem = { id: props.stuitem.id }
  const log: StudentItemLog = { studentItemId: props.stuitem.id }

  if (checkStatusR.value === 'confirm') {
    if (!pointR.value) {
      throw '未声明分数'
    }
    if (props.stuitem.maxPoints && pointR.value > props.stuitem.maxPoints) {
      throw '认定分数不能大于项最高分数'
    }
    stuItem.point = pointR.value
    stuItem.status = CONFIRMED
    log.comment = `${adminUserR.value?.name}，认定分数为${pointR.value}`
  }

  if (checkStatusR.value === 'reject') {
    stuItem.point = undefined
    stuItem.status = REJECTED
    log.comment = `${adminUserR.value?.name}，驳回指标项，建议移除此项。${commentR.value}`
  }
  if (checkStatusR.value === 'modif') {
    stuItem.point = undefined
    stuItem.status = PENDING_MODIFICATION
    log.comment = `${adminUserR.value?.name}，建议修改。${commentR.value}`
  }

  await mutateAsync({ sid: props.stuitem.userId!, stuItem, log })
  createElNotificationSuccess('审核成功')
  props.close()
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    destroy-on-close
    @close="closeF"
    title="审核操作"
    width="600px"
    class="review-confirm-dialog">
    <div class="dialog-content">
      <el-row :gutter="16" class="form-row" align="middle">
        <el-col :span="4" class="form-label">操作类型：</el-col>
        <el-col :span="20">
          <el-radio-group size="large" v-model="checkStatusR" class="radio-group">
            <el-radio-button label="confirm" class="custom-color-confirm">认定</el-radio-button>
            <el-radio-button label="reject" class="custom-color-reject">驳回</el-radio-button>
            <el-radio-button label="modif" class="custom-color-modif">修改</el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>

      <el-row :gutter="16" class="form-row" align="middle">
        <el-col :span="4" class="form-label">认定分数：</el-col>
        <el-col :span="10">
          <el-input-number
            :disabled="!isConfirmC"
            v-model="pointR"
            :max="props.stuitem.maxPoints"
            :min="0"
            :precision="2"
            size="large"
            placeholder="请输入认定分数"
            class="score-input" />
        </el-col>
        <el-col :span="10" class="max-score-text">
          项最高分：{{ props.stuitem.maxPoints || 0 }}
        </el-col>
      </el-row>

      <el-row :gutter="16" class="form-row" align="top" v-if="!isConfirmC">
        <el-col :span="4" class="form-label">备注说明：</el-col>
        <el-col :span="20">
          <el-input
            v-model="commentR"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 6 }"
            placeholder="请输入驳回/修改的原因（必填）"
            class="comment-input" />
        </el-col>
      </el-row>

      <el-row :gutter="16" class="form-row submit-row" align="middle">
        <el-col :span="4" class="form-label"></el-col>
        <el-col :span="20">
          <el-button
            type="primary"
            size="large"
            :disabled="disSubmitC"
            @click="submitF"
            class="submit-btn">
            提交审核
          </el-button>
          <el-button size="large" @click="closeF" style="margin-left: 12px">取消</el-button>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<style scoped>
.review-confirm-dialog {
  --el-dialog-padding-primary: 20px;
}

.dialog-content {
  padding: 10px 0;
}

.form-row {
  margin-bottom: 20px;
  width: 100%;
}

.form-label {
  text-align: right;
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.radio-group {
  width: 100%;
}

.score-input {
  width: 100%;
}

.max-score-text {
  color: #909399;
  font-size: 14px;
  line-height: 40px;
}

.comment-input {
  width: 100%;
  resize: none;
}

.submit-row {
  margin-top: 10px;
}

.submit-btn {
  padding: 12px 24px;
  font-size: 14px;
}

.custom-color-confirm.is-active {
  --el-radio-button-checked-bg-color: #67c23a;
  --el-radio-button-checked-text-color: #fff;
}

.custom-color-reject.is-active {
  --el-radio-button-checked-bg-color: #f56c6c;
  --el-radio-button-checked-text-color: #fff;
}

.custom-color-modif.is-active {
  --el-radio-button-checked-bg-color: #faaf3d;
  --el-radio-button-checked-text-color: #fff;
}
</style>
