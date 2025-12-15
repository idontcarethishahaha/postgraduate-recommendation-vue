<script setup lang="ts">
import { CommonService } from '@/services/CommonService'

const { data: userInfoR } = CommonService.getUserInfoService()
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <h3>hello!{{ userInfoR?.name }}</h3>
      <h3>{{ userInfoR?.collegeName }}</h3>
      <h3>
        <template v-for="(cat, index) of userInfoR?.categories" :key="index">{{ cat }};</template>
      </h3>
      <h3>{{ userInfoR?.majorName }}</h3>
    </el-col>
  </el-row>
</template>
