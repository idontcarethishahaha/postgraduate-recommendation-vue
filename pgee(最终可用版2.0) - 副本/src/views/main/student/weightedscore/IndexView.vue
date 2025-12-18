<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { StudentService } from '@/services/StudentService'
import type { WeightedScore } from '@/types'
import { Check, EditPen } from '@element-plus/icons-vue'
import { computed, ref, toRaw } from 'vue'

const weightScoreR = ref<WeightedScore>({})
const { data: result, suspense } = StudentService.getWeightedScoreService()
const { mutateAsync } = StudentService.addWeightedScoreService()
await suspense()

weightScoreR.value = { ...toRaw(result.value) }

const submitF = async () => {
  const score = weightScoreR.value.score
  const ranking = weightScoreR.value.ranking
  if (!score || score > 100) {
    throw '必须提供加权成绩,且应在0-100之间'
  }
  if (!ranking || ranking <= 0) {
    throw '必须提供专业排名,且应为正整数'
  }
  if (weightScoreR?.value.verified === 1) {
    throw '已认定，无法修改'
  }
  await mutateAsync(weightScoreR.value)
  createElNotificationSuccess('修改成绩成功')
}

const submitDisC = computed(() => {
  const score = weightScoreR.value.score
  const ranking = weightScoreR.value.ranking
  return score && score <= 100 && ranking && ranking > 0
})

const isVerified = () => weightScoreR.value.verified === 1
</script>

<template>
  <div class="weight-score-container">
    <el-card class="score-card" shadow="hover" border>
      <el-row class="my-row">
        <el-col :span="24">
          <div class="header-tip">
            <el-icon color="#67c23a" v-if="isVerified()">
              <Check />
            </el-icon>
            <el-icon color="#409eff" v-else>
              <EditPen />
            </el-icon>
            <span class="tip-text">
              {{
                isVerified()
                  ? '成绩已认定，禁止修改'
                  : '请填写加权成绩和专业排名（认定后将无法修改）'
              }}
            </span>
          </div>

          <div class="verified-content" v-if="isVerified()">
            <div class="info-item">
              <span class="info-label">加权成绩：</span>
              <span class="info-value success-color">
                {{ weightScoreR.score }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">专业排名：</span>
              <span class="info-value success-color">
                {{ weightScoreR.ranking }}
              </span>
            </div>
          </div>

          <el-form
            label-width="100px"
            class="score-form"
            v-if="!isVerified()"
            :model="weightScoreR">
            <el-form-item
              label="加权成绩"
              class="form-item"
              :rules="[
                { required: true, message: '请输入加权成绩' },
                { max: 100, message: '加权成绩不能超过100分' },
                { min: 0, message: '加权成绩不能小于0分' }
              ]">
              <el-input-number
                v-model="weightScoreR.score"
                :max="100"
                :min="0"
                :precision="2"
                size="large"
                placeholder="请输入0-100之间的加权成绩"
                class="form-input"
                controls-position="right" />
            </el-form-item>

            <el-form-item
              label="专业排名"
              class="form-item"
              :rules="[
                { required: true, message: '请输入专业排名' },
                { min: 1, message: '专业排名必须为正整数' }
              ]">
              <el-input-number
                v-model="weightScoreR.ranking"
                :min="1"
                size="large"
                placeholder="请输入你的专业排名"
                class="form-input"
                controls-position="right"
                :precision="0" />
            </el-form-item>

            <el-form-item class="form-item submit-item">
              <el-button
                type="primary"
                @click="submitF"
                :disabled="!submitDisC"
                size="large"
                class="submit-btn">
                <el-icon><EditPen /></el-icon>
                保存修改
              </el-button>
              <el-button
                size="large"
                class="cancel-btn"
                @click="
                  () => {
                    weightScoreR = { ...toRaw(result) }
                  }
                ">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped>
.weight-score-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.score-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 24px;
  background-color: #fff;
  max-width: 600px;
  margin: 0 auto;
}

.header-tip {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}
.tip-text {
  font-size: 16px;
  color: #303133;
  margin-left: 8px;
  font-weight: 500;
}

.verified-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: #f0f9ff;
  border-radius: 8px;
}
.info-item {
  display: flex;
  align-items: center;
  font-size: 15px;
}
.info-label {
  color: #606266;
  width: 100px;
  text-align: right;
  margin-right: 12px;
}
.info-value {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  padding: 6px 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  min-width: 80px;
  text-align: center;
}
.success-color {
  color: #67c23a;
}

.score-form {
  margin-top: 8px;
}
.form-item {
  margin-bottom: 20px;
}
.form-input {
  width: 300px;
}
.input-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 12px;
  vertical-align: middle;
}

.submit-item {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px dashed #e4e7ed;
}
.submit-btn {
  padding: 10px 24px;
  border-radius: 6px;
  margin-right: 12px;
}
.cancel-btn {
  padding: 10px 24px;
  border-radius: 6px;
}
</style>
