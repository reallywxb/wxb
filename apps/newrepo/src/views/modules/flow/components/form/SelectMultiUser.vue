<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { computed, onMounted } from 'vue';

import { Plus } from '@vben/chc-icons';
import { useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';

import selectShow from '../orgselect/selectAndShow.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'D',
  },

  form: {
    type: Object,
    default: () => {},
  },
});

const userStore = useUserStore();

const currentUserId = computed(() => {
  return userStore.userInfo.id;
});

// 禁止选择的用户id
const disableUserIdList = computed(() => {
  const self = props.form.props.self;
  // 不能选择自己
  return self ? [] : [currentUserId.value];
});

onMounted(() => {});
</script>
<template>
  <div>
    <Button v-if="mode === 'D'" disabled shape="circle">
      <Plus />
    </Button>

    <select-show
      v-else
      :disabled="form.perm === 'R'"
      v-model:org-list="form.props.value"
      type="user"
      :multiple="form.props.multi"
      :disable-user="disableUserIdList"
    />
  </div>
</template>
<style scoped lang="less"></style>
