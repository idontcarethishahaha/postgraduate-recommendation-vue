<script setup lang="ts">
import type { Progress } from '@/types'
import { computed } from 'vue'

//接收父级传递的Progress类型progress对象
const prop = defineProps<{ progress: Progress }>()
//进度百分比
const percentageC = computed(() => Math.round(prop.progress.percentage * 100))
//传输速率
const rateC = computed(() => toFixed2(prop.progress.rate))
//文件总大小
const totalC = computed(() => toFixed2(prop.progress.total))
//已加载大小
const loadedC = computed(() => toFixed2(prop.progress.loaded))

//字节数转换为MB并保留2位小数
const toFixed2 = (n: number) => (n / 1024 / 1024).toFixed(2)
</script>
<template>
  <div>
    <!--进度条组件-->
    <el-progress :percentage="percentageC" />
    <!-- 展示传输速率、已加载/总大小（MB单位） -->
    {{ rateC }} MB {{ loadedC }} MB / {{ totalC }} MB
    <br />
    {{ prop.progress.title }}
  </div>
</template>
<style>
/*让进度条占满宽度*/
.el-notification__group {
  flex: 1;
}
</style>
