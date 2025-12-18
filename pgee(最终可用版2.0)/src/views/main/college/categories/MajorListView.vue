<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import { ref, toValue, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const selectMajorIdR = ref('')
const catIdR = ref('')

watch(
  () => route.params,
  () => {
    const catid = route.params.catid as string
    const majid = route.params.majorid as string
    if (catid) {
      catIdR.value = catid
    }
    if (majid) {
      selectMajorIdR.value = majid
    }
  },
  { immediate: true }
)

const selectMajorF = () => {
  router.push(`/college/categories/${toValue(catIdR)}/marjors/${toValue(selectMajorIdR)}`)
}
const { data: majorsR } = CollegeService.listMajorsService(catIdR)
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-radio-group size="large" v-model="selectMajorIdR" @change="selectMajorF">
        <el-radio-button
          v-for="major of majorsR"
          :key="major.id"
          :label="major.name"
          :value="major.id" />
      </el-radio-group>
    </el-col>
  </el-row>
</template>
