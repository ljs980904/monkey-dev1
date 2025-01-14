<template>
  <!-- v-drag="'.log-header'" -->
  <div class="log-dialog" v-drag="'.log-header'">
    <div class="log-header">
      <span class="log-title">{{ title }}</span>
      <span><slot /></span>
    </div>
    <div class="log-body" ref="logBodyRef">
      <div class="log-content" id="log-content">
        <div
          v-for="item in list"
          :key="item.timestamp"
          class="log-entry"
          :class="[item.level]"
        >
          <span>{{ item.timestamp }}：</span>
          <span>{{ item.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';

// 定义 Prop 类型
interface LogItem {
  timestamp: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success' | 'default' | 'primary';
}

interface StatusInfo {
  text: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface ComponentProps {
  list: LogItem[];
  title: string;
  statusInfo: StatusInfo;
}
defineProps({
  list: {
    type: Array as () => LogItem[],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  statusInfo: {
    type: Object as () => StatusInfo,
    required: true,
  },
});

// 引用日志体元素
const logBodyRef = ref<HTMLElement | null>(null);

onMounted(() => {
  // script.js File
  // const container = document.querySelector('.log-dialog') as HTMLElement;
  // function onMouseDrag({ movementX, movementY }) {
  //   let getContainerStyle = window.getComputedStyle(container);
  //   let leftValue = parseInt(getContainerStyle.left);
  //   let topValue = parseInt(getContainerStyle.top);
  //   container.style.left = `{leftValue + movementX}px`;
  //   container.style.top = `{topValue + movementY}px`;
  // }
  // container.addEventListener('mousedown', () => {
  //   container.addEventListener('mousemove', onMouseDrag);
  // });
  // document.addEventListener('mouseup', () => {
  //   container.removeEventListener('mousemove', onMouseDrag);
  // });
});
</script>

<style lang="scss" scoped>
.log-dialog {
  position: fixed;
  top: 30%;
  left: 80%;
  width: 80%;
  max-width: 360px;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  z-index: 9999;
  cursor: pointer;
  user-select: none;
  // position: absolute;
  // left: 50%;
  // top: 50%;
  // width: 80%;
  // max-width: 360px;
  // padding: 10px;
  // background-color: rgb(218, 255, 194);
  // border-radius: 5px;
  // transform: translate(-50%, -50%);
  // cursor: move;

  .log-entry {
    padding: 5px 0;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;

    // &.info {
    //   color: white;
    // }

    &.warning {
      color: #e6a23c;
    }

    &.error {
      color: #dc3545;
    }

    &.success {
      color: #67c23a;
    }

    &.default {
      color: #909399;
    }

    &.primary {
      color: #409eff;
    }
  }

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;

    .log-title {
      font-size: 16px;
      font-weight: bold;
    }
  }

  .log-body {
    padding: 20px;
    height: 240px;
    overflow-y: auto;
    font-size: 14px;
    line-height: 1.5;
  }
}
</style>
