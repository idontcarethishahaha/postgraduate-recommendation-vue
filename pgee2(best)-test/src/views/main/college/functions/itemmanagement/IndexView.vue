<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { MajorCategory } from '@/types'
import ItemListView from '@/views/main/college/functions/itemmanagement/ItemListView.vue'
import { ref } from 'vue'

const { data: categoryMajorsR, suspense } = CollegeService.listcategoryMajorsService()
await suspense()
const categories = (categoryMajorsR.value ?? []).map(cm => cm.majorCategory)
const categoryR = ref<MajorCategory>()
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-select
        value-key="id"
        v-model="categoryR"
        placeholder="类别"
        size="large"
        style="width: 200px; margin-right: 10px">
        <el-option v-for="cat of categories" :key="cat?.id" :label="cat?.name" :value="cat" />
      </el-select>

      <div v-if="categoryR">
        <ItemListView v-if="categoryR" :category="categoryR" :key="categoryR.id" />
      </div>
    </el-col>
  </el-row>
</template>
