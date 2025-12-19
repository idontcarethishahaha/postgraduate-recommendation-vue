<template>
  <div class="student-score-container">
    <el-card class="score-card" shadow="hover" border>
      <el-row class="my-row">
        <el-col>
          <div class="section-wrapper">
            <p class="title">基本信息</p>
            <div class="base-info-content">
              {{ userInfo?.name }}
              <span class="separator">|</span>
              {{ userInfo?.collegeName }}
              <template v-for="(cat, index) of userInfo?.categories || []" :key="index">
                <span class="separator">|</span>
                {{ cat }}
              </template>
              <span v-if="userInfo?.majorName" class="separator">|</span>
              {{ userInfo?.majorName }}
            </div>
          </div>

          <div class="section-wrapper">
            <p class="title">加权成绩数据</p>
            <el-row :gutter="12" class="data-row">
              <el-col :span="colspan" class="col-title">加权成绩：</el-col>
              <el-col :span="12">
                <span class="score-text" :style="{ color: getTagColor(scoreStatus?.color) }">
                  {{ statusR?.score ?? 0 }}
                </span>
              </el-col>
            </el-row>

            <el-row :gutter="12" class="data-row">
              <el-col :span="colspan" class="col-title">专业排名：</el-col>
              <el-col :span="12">
                <span
                  class="score-text"
                  :style="{ color: statusR?.verified ? '#67c23a' : '#909399' }">
                  {{ statusR?.ranking ?? '未排名' }}
                </span>
              </el-col>
            </el-row>
          </div>

          <div class="section-wrapper">
            <p class="title">全面发展成绩评定</p>
            <div class="composite-score-grid">
              <el-row :gutter="12" class="data-row">
                <el-col :span="colspan" class="col-title">已认定成绩：</el-col>
                <el-col :span="12">
                  <span class="score-text" :style="{ color: getTagColor(confirmedStatus?.color) }">
                    {{ statusR?.totalPoint ?? 0 }}
                  </span>
                </el-col>
              </el-row>

              <el-row :gutter="12" class="data-row">
                <el-col :span="colspan" class="col-title">已认定项：</el-col>
                <el-col :span="12">
                  <span class="score-text" :style="{ color: getTagColor(confirmedStatus?.color) }">
                    {{ statusR?.confirmedCount ?? 0 }}
                  </span>
                </el-col>
              </el-row>

              <el-row :gutter="12" class="data-row">
                <el-col :span="colspan" class="col-title">待审核项：</el-col>
                <el-col :span="12">
                  <span class="score-text" :style="{ color: getTagColor(pendingStatus?.color) }">
                    {{ statusR?.pendingReviewCount ?? 0 }}
                  </span>
                </el-col>
              </el-row>

              <el-row :gutter="12" class="data-row">
                <el-col :span="colspan" class="col-title">待修改项：</el-col>
                <el-col :span="12">
                  <span class="score-text" :style="{ color: getTagColor(pendingStatus?.color) }">
                    {{ statusR?.pendingModificationCount ?? 0 }}
                  </span>
                </el-col>
              </el-row>

              <el-row :gutter="12" class="data-row">
                <el-col :span="colspan" class="col-title">已驳回项：</el-col>
                <el-col :span="12">
                  <span class="score-text" :style="{ color: getTagColor(rejectedStatus?.color) }">
                    {{ statusR?.rejectedCount ?? 0 }}
                  </span>
                </el-col>
              </el-row>

              <el-row :gutter="12" class="data-row">
                <el-col :span="colspan" class="col-title">总提交项：</el-col>
                <el-col :span="12">
                  <span class="score-text default-color">
                    <!--  {{ statusR?.totalCount ?? 0 }} 后端出错 -->
                    {{
                      (statusR?.confirmedCount ?? 0) +
                      (statusR?.pendingReviewCount ?? 0) +
                      (statusR?.pendingModificationCount ?? 0) +
                      (statusR?.rejectedCount ?? 0)
                    }}
                  </span>
                </el-col>
              </el-row>
            </div>
          </div>

          <div class="section-wrapper final-score-wrapper">
            <p class="title">最终成绩</p>
            <el-row :gutter="12" class="data-row final-score-row">
              <el-col :span="colspan" class="col-title">
                <el-icon style="vertical-align: middle" color="#F56C6C"></el-icon>
                总成绩 :
              </el-col>
              <el-col :span="12">
                <div class="final-score-content">
                  <span class="final-score-text">{{ finalScore }}</span>
                  <span class="final-score-formula">
                    = 加权成绩({{ statusR?.score ?? 0 }}) × {{ weightingScore }}% + 全面发展成绩({{
                      statusR?.totalPoint ?? 0
                    }}) × {{ weightingCompositeScore }}%
                  </span>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { CommonService } from '@/services/CommonService'
import { CONFIRMED, PENDING_REVIEW, REJECTED, SCORE_STATUS_MAP } from '@/services/Const'
import { StudentService } from '@/services/StudentService'
import { getFinalScoreUtil, getStatusUtil } from '@/services/Utils'
import { computed } from 'vue'

interface StatusConfig {
  color: string
  name: string
}

// 服务数据获取
const { data: userInfo } = CommonService.getUserInfoService()
const { data: categoryR } = StudentService.getCategoryService()
const { data: statusR, suspense } = StudentService.getStudentItemStatusesService()
await suspense() // 等待异步数据加载完成

const colspan = 6

// 颜色
type TagType = 'success' | 'warning' | 'danger' | 'primary' | 'info'
const TAG_TYPE_TO_COLOR: Record<TagType, string> = {
  success: '#67c23a',
  warning: '#e6a23c',
  danger: '#f56c6c',
  primary: '#409eff',
  info: '#909399'
}

const getTagColor = (type: string | undefined): string => {
  const safeType = (type as TagType) || 'info'
  return TAG_TYPE_TO_COLOR[safeType]
}

const confirmedStatus = computed<StatusConfig>(() => {
  const res = getStatusUtil(CONFIRMED)
  return (res as StatusConfig) || { color: 'success', name: '已确认' }
})
const pendingStatus = computed<StatusConfig>(() => {
  const res = getStatusUtil(PENDING_REVIEW)
  return (res as StatusConfig) || { color: 'info', name: '待审核' }
})
const rejectedStatus = computed<StatusConfig>(() => {
  const res = getStatusUtil(REJECTED)
  return (res as StatusConfig) || { color: 'danger', name: '已驳回' }
})
const scoreStatus = computed<StatusConfig>(() => {
  const verified = statusR.value?.verified ?? 0
  const res = SCORE_STATUS_MAP.get(verified)
  return (res as StatusConfig) || { color: 'warning', name: '未知状态' }
})

// 权重计算
const weightingScore = computed<number>(() => {
  return categoryR.value?.weighting?.score ?? 0
})
const weightingCompositeScore = computed<number>(() => {
  return categoryR.value?.weighting?.compositeScore ?? 0
})

// 最终成绩计算
const finalScore = computed<string>(() => {
  const score = statusR.value?.score ?? 0
  const totalPoint = statusR.value?.totalPoint ?? 0
  const weighting = {
    score: weightingScore.value,
    compositeScore: weightingCompositeScore.value
  }
  return getFinalScoreUtil(score, totalPoint, weighting).toFixed(2)
})
</script>

<style scoped>
.student-score-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.score-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 24px;
  background-color: #fff;
}

.section-wrapper {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.section-wrapper:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.title {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #1f2937;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 20px;
  background-color: #409eff;
  margin-right: 8px;
  border-radius: 2px;
}

.base-info-content {
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
}
.separator {
  margin: 0 8px;
  color: #9ca3af;
}

.data-row {
  margin-bottom: 12px;
  align-items: center;
}

.data-row:last-child {
  margin-bottom: 0;
}

.col-title {
  text-align: right;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  padding-top: 2px;
}

.score-text {
  display: inline-block;
  width: 80px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  padding: 6px 0;
  border-radius: 6px;
  background-color: #f9fafb;
}
.default-color {
  color: #4b5563;
}

.composite-score-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 8px;
}

.final-score-wrapper {
  margin-top: 8px;
}
.final-score-row {
  padding: 12px;
  background-color: #f0f9ff;
  border-radius: 8px;
}
.final-score-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.final-score-text {
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
}
.final-score-formula {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}
</style>
