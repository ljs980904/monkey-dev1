<template>
  <div
    class="draggable-dialog"
    :style="{
      transform: `translate(${position.x}px, ${position.y}px)`,
      width: isExpand ? width : '120px',
    }"
  >
    <div
      class="draggable-title"
      :class="{ isexpand: isExpand }"
      @mousedown="startDrag"
    >
      <div class="header-flex">
        <div class="avatar-name" v-show="isExpand">
          <img
            src="https://public.readdy.ai/ai/img_res/2d58579252345596c10002ce85d4f6f8.jpg"
            alt="Avatar"
            class="avatar"
          />
          <div class="name">{{ title }}</div>
        </div>
        <!-- <img
          :src="isExpand ? fullscreen : expand"
          @click="showIcon = showIcon === 1 ? 2 : 1"
          class="icon"
          alt=""
          srcset=""
        /> -->
      </div>
    </div>
    <div class="dialog-content" v-if="isExpand">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import fullscreen from '../assets/images/fullscreen-shrink2x.png';
import expand from '../assets/images/fullscreen-expand2x.png';
const props = defineProps({
  title: {
    type: String,
    default: 'AT 助手',
  },
  width: {
    type: String,
    default: '336px',
  },
  height: {
    type: String,
    default: '260px',
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
const showIcon = ref(1);
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const startPos = ref({ x: 0, y: 0 });
const dragStartOffset = ref({ x: 0, y: 0 });
const windowSize = ref({ width: 0, height: 0 });

const isExpand = computed(() => showIcon.value === 1);

const updateWindowSize = () => {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  // 新增：窗口尺寸更新时保持居中（可选）
  const dialogWidth = parseInt(props.width) || 0;
  const dialogHeight = parseInt(props.height) || 0;
  position.value.x = Math.max(0, (windowSize.value.width - dialogWidth) / 2);
  position.value.y = Math.max(0, (windowSize.value.height - dialogHeight) / 2);
};

const startDrag = (e) => {
  if (props.axis === 'none') return;
  isDragging.value = true;
  startPos.value = { x: e.clientX, y: e.clientY };
  dragStartOffset.value = { x: position.value.x, y: position.value.y };
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;

  let dx = e.clientX - startPos.value.x;
  let dy = e.clientY - startPos.value.y;

  // 应用方向限制
  if (props.axis === 'x') dy = 0;
  if (props.axis === 'y') dx = 0;

  let newX = dragStartOffset.value.x + dx;
  let newY = dragStartOffset.value.y + dy;

  // 边界限制
  if (props.boundary) {
    const dialogWidth = parseInt(props.width) || 400;
    const dialogHeight = parseInt(props.height) || 300;
    newX = Math.max(0, Math.min(newX, windowSize.value.width - dialogWidth));
    newY = Math.max(0, Math.min(newY, windowSize.value.height - dialogHeight));
  }

  position.value = { x: newX, y: newY };
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

onMounted(() => {
  updateWindowSize();
  window.addEventListener('resize', updateWindowSize);
  // 新增：初始化居中计算
  const dialogWidth = parseInt(props.width) || 0;
  const dialogHeight = parseInt(props.height) || 0;
  position.value = {
    x: (windowSize.value.width - dialogWidth) / 2,
    y: (windowSize.value.height - dialogHeight) / 2,
  };

  // 应用边界限制
  if (props.boundary) {
    position.value.x = Math.max(
      0,
      Math.min(position.value.x, windowSize.value.width - dialogWidth)
    );
    position.value.y = Math.max(
      0,
      Math.min(position.value.y, windowSize.value.height - dialogHeight)
    );
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize);
});
</script>

<style lang="scss" scoped>
.draggable-dialog {
  position: fixed;
  top: 0;
  left: 0;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 9999;
  padding: 10px 14px;
  .icon {
    width: 16px;
    height: 16px;

    margin-left: auto;
    cursor: pointer;
  }
  .header-flex {
    display: flex;
    align-items: center;
  }
  .isexpand {
    margin-bottom: 8px;
    border-bottom: 0.5px solid #ccc;
    padding-bottom: 4px;
  }
  .draggable-title {
    cursor: move;

    .avatar-name {
      display: flex;
      align-items: center;
      .avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-right: 5px;
      }
      .name {
        height: 30px;
        line-height: 30px;
        font-size: 12px;
        font-weight: bold;
      }
    }
  }
}
</style>
