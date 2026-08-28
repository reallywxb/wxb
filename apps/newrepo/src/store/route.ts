import { ref } from 'vue';

import { defineStore } from 'pinia';

export const useRouteStore = defineStore('route', () => {
  // 当前路由的menuId
  const currentMenuPageId = ref<string>('');

  // 设置当前路由的menuId
  const setCurrentMenuId = (menuId: string) => {
    currentMenuPageId.value = menuId;
  };

  // 获取当前路由的menuId
  const getCurrentMenuId = () => {
    return currentMenuPageId.value;
  };

  // 重置store状态
  const $reset = () => {
    currentMenuPageId.value = '';
  };

  return {
    currentMenuPageId,
    setCurrentMenuId,
    getCurrentMenuId,
    $reset,
  };
});
