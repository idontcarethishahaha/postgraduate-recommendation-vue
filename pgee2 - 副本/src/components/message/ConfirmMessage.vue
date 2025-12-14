<!-- <script setup lang="ts">
import { ElDialog } from 'element-plus'
import { ref, render } from 'vue'

const dialogVisible = ref(true)

const props = defineProps<{ message: string; close?: () => void }>()

const close = () => {
  if (props.close) {
    props.close()
  }
  render(null, document.body)
}
</script> -->

<!-- <template>
  <el-dialog v-model="dialogVisible" title="消息" width="30%" @close="close">
    <span>{{ props.message }}</span>
  </el-dialog>
</template> -->

<script setup lang="ts">
import { ElDialog } from 'element-plus'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    message: string
    close?: () => void
  }>(),
  {
    message: '',
    close: () => {}
  }
)

const dialogVisible = ref(true)

// 声明的handleClose函数
const handleClose = () => {
  props.close()
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog v-model="dialogVisible" title="消息" width="30%" @close="handleClose" destroy-on-close>
    <span>{{ message }}</span>
  </el-dialog>
</template>
