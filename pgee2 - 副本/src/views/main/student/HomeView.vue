<template>
  <el-row class="my-row">
    <el-col>
      <p class="title">基本信息数据</p>
      <div>
        {{ userInfo?.name }} - {{ userInfo?.collegeName }} -
        <!-- 修复：处理 categories 为 undefined 的情况 -->
        <template v-for="(cat, index) of userInfo?.categories || []" :key="index">
          {{ cat }}
          <template v-if="index !== (userInfo?.categories?.length || 0) - 1">-</template>
        </template>
        {{ userInfo?.majorName ? ' - ' + userInfo.majorName : '' }}
      </div>

      <div>
        <p class="title">加权成绩数据</p>
        <el-row :gutter="10" class="row">
          <el-col :span="colspan" class="col-title">加权成绩：</el-col>
          <el-col :span="12">
            <el-tag size="large" :type="scoreStatus?.color" class="info-tag">
              {{ statusR?.score ?? 0 }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row :gutter="10" class="row">
          <el-col :span="colspan" class="col-title">专业排名：</el-col>
          <el-col :span="12">
            <el-tag size="large" :type="statusR?.verified ? 'success' : 'info'" class="info-tag">
              {{ statusR?.ranking ?? '未排名' }}
            </el-tag>
          </el-col>
        </el-row>
      </div>

      <div>
        <p class="title">全面发展成绩评定数据</p>
        <el-row :gutter="10" class="row">
          <el-col :span="colspan" class="col-title">已认定成绩：</el-col>
          <el-col :span="12">
            <el-tag size="large" :type="confirmedStatus.color" class="info-tag">
              {{ statusR?.totalPoint ?? 0 }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row :gutter="10" class="row">
          <el-col :span="colspan" class="col-title">已认定项：</el-col>
          <el-col :span="12">
            <el-tag size="large" :type="confirmedStatus.color" class="info-tag">
              {{ statusR?.confirmedCount ?? 0 }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row :gutter="10" class="row">
          <el-col :span="colspan" class="col-title">待审核项：</el-col>
          <el-col :span="12">
            <el-tag size="large" :type="pendingStatus.color" class="info-tag">
              {{ statusR?.pendingReviewCount ?? 0 }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row :gutter="10" class="row">
          <el-col :span="colspan" class="col-title">待修改项：</el-col>
          <el-col :span="12">
            <el-tag size="large" :type="pendingStatus.color" class="info-tag">
              {{ statusR?.pendingModificationCount ?? 0 }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row :gutter="10" class="row">
          <el-col :span="colspan" class="col-title">已驳回项：</el-col>
          <el-col :span="12">
            <el-tag size="large" :type="rejectedStatus.color" class="info-tag">
              {{ statusR?.rejectedCount ?? 0 }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row :gutter="10" class="row">
          <el-col :span="colspan" class="col-title">总提交项：</el-col>
          <el-col :span="12">
            <el-tag size="large" class="info-tag">
              {{ statusR?.totalCount ?? 0 }}
            </el-tag>
          </el-col>
        </el-row>

        <div>
          <p class="title">最终成绩</p>
          <el-row :gutter="10" class="row">
            <el-col :span="colspan" class="col-title">
              <el-icon style="vertical-align: middle" color="#F56C6C">
                <Ship />
              </el-icon>
              总成绩 :
            </el-col>
            <el-col :span="12">
              <span>
                <el-tag size="large" type="success" class="info-tag">{{ finalScore }}</el-tag>
                = 加权成绩({{ statusR?.score ?? 0 }} ) * {{ weightingScore }}% + 全面发展成绩({{
                  statusR?.totalPoint ?? 0
                }}
                ) * {{ weightingCompositeScore }}%
              </span>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { CommonService } from '@/services/CommonService'
import { CONFIRMED, PENDING_REVIEW, REJECTED, SCORE_STATUS_MAP } from '@/services/Const'
import { StudentService } from '@/services/StudentService'
import { getFinalScoreUtil, getStatusUtil } from '@/services/Utils'
import { Ship } from '@element-plus/icons-vue'
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

// 基础配置
const colspan = 3

// 修复：确保 getStatusUtil 返回值符合 StatusConfig 类型
const confirmedStatus = computed<StatusConfig>(() => {
  const res = getStatusUtil(CONFIRMED)
  // 强制转换为 StatusConfig 类型（若后端返回格式不一致，需同步调整）
  return (res as StatusConfig) || { color: 'success', text: '已确认' }
})
const pendingStatus = computed<StatusConfig>(() => {
  const res = getStatusUtil(PENDING_REVIEW)
  return (res as StatusConfig) || { color: 'info', text: '待审核' }
})
const rejectedStatus = computed<StatusConfig>(() => {
  const res = getStatusUtil(REJECTED)
  return (res as StatusConfig) || { color: 'danger', text: '已驳回' }
})
const scoreStatus = computed<StatusConfig>(() => {
  const verified = statusR.value?.verified ?? 0
  const res = SCORE_STATUS_MAP.get(verified)
  return (res as StatusConfig) || { color: 'warning', text: '未知状态' }
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
.title {
  margin: 15px 0 10px;
  font-size: 18px;
  color: #409eff;
  font-weight: 500;
}
.row {
  margin-bottom: 8px;
}
.col-title {
  text-align: right;
  padding-top: 6px;
}
.info-tag {
  width: 80px;
  text-align: center;
}
</style>
