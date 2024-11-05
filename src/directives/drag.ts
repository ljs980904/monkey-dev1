import { onBeforeUnmount } from 'vue';

const drag = {
  mounted(el, binding) {
    const { value: headerSelector } = binding; // 获取绑定值作为头部选择器
    const header = el.querySelector(headerSelector); // 根据选择器查找头部元素

    const addV = (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1]];
    const minusV = (v1, v2) => [v2[0] - v1[0], v2[1] - v1[1]];
    const formatV = (v, range) => [
      Math.max(Math.min(v[0], range[3]), range[2]),
      Math.max(Math.min(v[1], range[1]), range[0]),
    ];
    const setTranslatePosition = (v) => `translate(${v[0]}px, ${v[1]}px)`;
    const getPosition = (e) => [e.pageX, e.pageY];

    const enableDrag = (element) => {
      let startTransform = window.getComputedStyle(element).transform;
      let startPosition = null;
      let draggingMoveVectorRange = null;
      let draggedMoveVector = [0, 0];
      let draggingMoveVector = [0, 0];

      const onMouseDown = (e) => {
        e.stopPropagation();
        startPosition = getPosition(e);
        const outerElementRect = document.body.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        draggingMoveVectorRange = [
          outerElementRect.top - elementRect.top,
          outerElementRect.bottom - elementRect.bottom,
          outerElementRect.left - elementRect.left,
          outerElementRect.right - elementRect.right,
        ];
      };

      const onMouseMove = (e) => {
        if (startPosition && draggingMoveVectorRange) {
          const endPosition = getPosition(e);
          const currentMoveVector = formatV(
            minusV(startPosition, endPosition),
            draggingMoveVectorRange
          );
          draggingMoveVector = addV(draggedMoveVector, currentMoveVector);
          element.style.transform = setTranslatePosition(draggingMoveVector);
        }
      };

      const onMouseUp = (e) => {
        if (startPosition && draggingMoveVectorRange) {
          draggedMoveVector = draggingMoveVector;
        }
        startPosition = null;
      };

      const addEventListeners = () => {
        if (header) {
          header.addEventListener('mousedown', onMouseDown);
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        }
      };

      const removeEventListeners = () => {
        if (header) {
          header.removeEventListener('mousedown', onMouseDown);
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }
      };

      addEventListeners();

      // 使用 Vue 3 的 onBeforeUnmount 钩子来移除事件监听器
      onBeforeUnmount(removeEventListeners);
    };

    enableDrag(el);
  },
  unmounted(el, binding, vnode, prevVnode) {
    // 在 unmounted 钩子中不需要额外的操作，因为已经在 mounted 钩子中处理了
  },
};

export default drag;
