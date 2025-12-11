<template>
  <div>
    <h2>学院列表</h2>
    <div v-if="isPending">加载中...</div>
    <div v-else-if="isError">加载失败:{{ error }}</div>
    <div v-else-if="data?.length === 0">暂无数据</div>
    <div v-else>
      <div v-for="college of data" :key="college.id">
        {{ college.name }}
      </div>
    </div>
  </div>
</template>
service
<script lang="ts" setup>
import { getAllCollege } from '@/service'
import type { College } from '@/types'
import { useQuery } from '@tanstack/vue-query' //useQueryClient,

//const queryClient = useQueryClient()
const { isPending, isError, data, error } = useQuery<College[]>({
  queryKey: ['colleges'],
  queryFn: getAllCollege
})
</script>
