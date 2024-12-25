<template>
  <ul class="log-ul">
    <li v-for="log in logs" :key="log">
      <span> {{ log.time }}：</span>
      <span :class="{ [log.type]: true }">{{ log.value }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps({
  logs: {
    type: Array,
    default: () => { }
  },
})



</script>

<style scoped>
.log-ul {
  line-height: 20px;
  font-size: 12px;
  color: #303133;
}

.default {
  color: #909399;
}

.primary {
  color: #409eff;
}

.success {
  color: #67c23a;
}

.warning {
  color: #e6a23c;
}

.danger {
  color: #f56c6c;
}
</style>