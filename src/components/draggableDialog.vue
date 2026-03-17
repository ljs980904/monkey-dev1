<template>
  <div
    class="draggable-dialog"
    :style="{
      transform: `translate(${position.x}px, ${position.y}px)`,
    }"
  >
    <div class="draggable-title" @mousedown="startDrag">
      <div class="avatar-name">
        {{ title }}
      </div>
      <div class="header-settings">
        <el-tooltip
          placement="bottom"
          content="请及时更新最新版、避免使用旧版本导致无法使用"
          :z-index="999999"
        >
          <img :src="tips" alt="" class="tips" srcset="" />
        </el-tooltip>
      </div>
    </div>
    <div class="main-content" v-if="!isMinimize">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ElTooltip, ElIcon } from 'element-plus';
import { Minus, FullScreen } from '@element-plus/icons-vue';
import tips from '../assets/svg/tips.svg';

const props = defineProps({
  title: {
    type: String,
    default: '网课助手',
  },
  width: {
    type: Number,
    default: 400,
  },
  height: {
    type: Number,
    default: 523,
  },
  boundary: {
    type: Boolean,
    default: true,
  },
  axis: {
    type: String,
    default: 'both', // 限制拖拽方向：both | x | y | none
    validator: (value) => ['both', 'x', 'y', 'none'].includes(value),
  },
});
// const showIcon = ref(1);
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const startPos = ref({ x: 0, y: 0 });
const dragStartOffset = ref({ x: 0, y: 0 });
const windowSize = ref({ width: 0, height: 0 });
const isMinimize = ref(false);
// const isExpand = computed(() => showIcon.value === 1);

const updateWindowSize = () => {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  // 窗口尺寸更新时保持居中（可选）
  const dialogWidth = parseInt(props.width);
  const dialogHeight = parseInt(props.height);
  position.value.x = Math.max(0, (windowSize.value.width - dialogWidth) / 2);
  position.value.y = Math.max(0, (windowSize.value.height - dialogHeight) / 2);
};

const startDrag = (e) => {
  if (props.axis === 'none') return;

  // 防止事件冒泡和默认行为
  e.preventDefault();
  e.stopPropagation();

  isDragging.value = true;
  startPos.value = { x: e.clientX, y: e.clientY };
  dragStartOffset.value = { x: position.value.x, y: position.value.y };

  // 添加事件监听器，使用 passive: false 确保可以调用 preventDefault
  document.addEventListener('mousemove', onDrag, { passive: false });
  document.addEventListener('mouseup', stopDrag, { passive: false });

  // 添加选择禁用，防止拖拽时选中文本
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'grabbing';
};

const onDrag = (e) => {
  if (!isDragging.value) return;

  // 防止默认行为
  e.preventDefault();

  let dx = e.clientX - startPos.value.x;
  let dy = e.clientY - startPos.value.y;

  // 应用方向限制
  if (props.axis === 'x') dy = 0;
  if (props.axis === 'y') dx = 0;

  let newX = dragStartOffset.value.x + dx;
  let newY = dragStartOffset.value.y + dy;

  // 边界限制
  if (props.boundary) {
    const dialogWidth = parseInt(props.width);
    const dialogHeight = parseInt(props.height);
    newX = Math.max(0, Math.min(newX, windowSize.value.width - dialogWidth));
    newY = Math.max(0, Math.min(newY, windowSize.value.height - dialogHeight));
  }

  position.value = { x: newX, y: newY };
};

const stopDrag = (e) => {
  if (!isDragging.value) return;

  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);

  // 恢复样式
  document.body.style.userSelect = '';
  document.body.style.cursor = '';

  // 防止事件冒泡
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
};

const minimize = () => {
  isMinimize.value = !isMinimize.value;
};

onMounted(() => {
  updateWindowSize();
  window.addEventListener('resize', updateWindowSize);
  // 初始化居中计算
  const dialogWidth = parseInt(props.width);
  const dialogHeight = parseInt(props.height);
  position.value = {
    x: (windowSize.value.width - dialogWidth) / 2,
    y: (windowSize.value.height - dialogHeight) / 2,
  };

  // 应用边界限制
  if (props.boundary) {
    position.value.x = Math.max(
      0,
      Math.min(position.value.x, windowSize.value.width - dialogWidth),
    );
    position.value.y = Math.max(
      0,
      Math.min(position.value.y, windowSize.value.height - dialogHeight),
    );
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize);
  // 清理事件监听器，防止内存泄漏
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  // 恢复样式
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
});
</script>

<style lang="scss" scoped>
.draggable-dialog {
  width: 400px;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 99999;

  .draggable-title {
    cursor: move;
    /* 自动布局 */
    display: flex;
    height: 56px;
    line-height: 56px;
    background: #4a90e2;
    .avatar-name {
      font-size: 18px;
      font-weight: bold;
      font-family: Roboto;
      font-weight: 600;
      letter-spacing: 0px;
      font-feature-settings: 'kern' on;
      color: #ffffff;
      margin: 4px 4px 0 16px;
    }
    .header-settings {
      color: #ffffff;
      margin-top: 20px;
      .tips {
        width: 18px;
        height: 18px;
        cursor: pointer;
        font-size: 14px;
      }
    }
  }
  .main-content {
    background: rgba(0, 0, 0, 0);
  }
}
</style>
