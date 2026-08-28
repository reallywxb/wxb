<script setup lang="ts">
// import type { UserInfoExt } from './types';

import { computed } from 'vue';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { useAuthStore } from '#/store';

import ProfilePanel from './profile-panel.vue';
import SettingPanel from './setting-panel.vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const profile = computed((): UserInfoExt => {
  return userStore.userInfo as UserInfoExt;
});
/**
 * ToDo 接口重复
 */
async function handleUploadFinish() {
  // 更新store
  await authStore.fetchUserInfo();
  // 重新加载用户信息
  // loadProfile();
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-[16px] lg:flex-row">
      <!-- 左侧 -->
      <ProfilePanel :profile="profile" @upload-finish="handleUploadFinish" />
      <!-- 右侧 -->
      <SettingPanel
        v-if="profile"
        :profile="profile"
        class="flex-1 overflow-hidden"
      />
    </div>
  </Page>
</template>
