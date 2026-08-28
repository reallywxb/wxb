/**
 * @copy https://github.com/element-plus/element-plus/blob/dev/packages/hooks/use-draggable/index.ts
 * 调整部分细节
 */

import type { ComputedRef, Ref } from 'vue';

import { onBeforeUnmount, onMounted, reactive, ref, watchEffect } from 'vue';

import { unrefElement } from '@vueuse/core';

export function useDraggable(
  dragRef: Ref<HTMLElement | undefined>,
  draggable: ComputedRef<boolean>,
  dragCallBack?: (changePosition: boolean) => void,
) {
  const transform = reactive({
    offsetX: 0,
    offsetY: 0,
  });

  const dragging = ref(false);
  const startPosition = ref({
    x: 0,
    y: 0,
  });
  const onMousedown = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // console.log('e.target', e.target);
    startPosition.value.x = e.clientX;
    startPosition.value.y = e.clientY;
    const downX = e.clientX;
    const downY = e.clientY;

    if (!dragRef.value) {
      return;
    }

    const targetRect = dragRef.value.getBoundingClientRect();

    const { offsetX, offsetY } = transform;
    const targetLeft = targetRect.left;
    const targetTop = targetRect.top;
    const targetWidth = targetRect.width;
    const targetHeight = targetRect.height;
    const docElement = document.documentElement;
    const clientWidth = docElement.clientWidth;
    const clientHeight = docElement.clientHeight;

    const minLeft = -targetLeft + offsetX;
    const minTop = -targetTop + offsetY;
    const maxLeft = clientWidth - targetLeft - targetWidth + offsetX;
    const maxTop = clientHeight - targetTop - targetHeight + offsetY;

    const onMousemove = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      let moveX = offsetX + e.clientX - downX;
      let moveY = offsetY + e.clientY - downY;

      moveX = Math.min(Math.max(moveX, minLeft), maxLeft);
      moveY = Math.min(Math.max(moveY, minTop), maxTop);

      transform.offsetX = moveX;
      transform.offsetY = moveY;

      if (dragRef.value) {
        dragRef.value.style.cursor = 'move';
        dragRef.value.style.transform = `translate(${moveX}px, ${moveY}px)`;
        dragging.value = true;
      }
    };

    const onMouseup = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (dragCallBack && typeof dragCallBack === 'function') {
        if (
          e.clientX === startPosition.value.x &&
          e.clientY === startPosition.value.y
        ) {
          // console.log('click', e.target);
          if ((e.target as Element).tagName === 'IMG') {
            dragCallBack(false);
          }
          // if (
          //   e.target &&
          //   (e.target as Element).parentElement &&
          //   (e.target as Element).parentElement?.tagName !== 'BODY'
          // ) {
          //   //
          // } else {
          //   dragCallBack(false);
          // }
        } else {
          dragCallBack(true);
        }
      }
      if (dragRef.value) {
        dragRef.value.style.cursor = 'pointer';
      }

      dragging.value = false;
      document.removeEventListener('mousemove', onMousemove);
      document.removeEventListener('mouseup', onMouseup);
    };

    document.addEventListener('mousemove', onMousemove);
    document.addEventListener('mouseup', onMouseup);
  };

  const onDraggable = () => {
    const dragDom = unrefElement(dragRef);
    if (dragDom && dragRef.value) {
      dragDom.addEventListener('mousedown', onMousedown);
    }
  };

  const offDraggable = () => {
    const dragDom = unrefElement(dragRef);
    if (dragDom && dragRef.value) {
      dragDom.removeEventListener('mousedown', onMousedown);
    }
  };

  const resetPosition = () => {
    transform.offsetX = 0;
    transform.offsetY = 0;

    const target = unrefElement(dragRef);
    if (target) {
      target.style.transform = 'none';
    }
  };

  onMounted(() => {
    watchEffect(() => {
      if (draggable.value) {
        onDraggable();
      } else {
        offDraggable();
      }
    });
  });

  onBeforeUnmount(() => {
    offDraggable();
  });

  return {
    dragging,
    resetPosition,
    transform,
  };
}
