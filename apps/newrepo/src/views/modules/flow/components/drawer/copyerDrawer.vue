<script setup>
import { computed, ref, watch } from 'vue';

import { Drawer, TabPane, Tabs } from 'ant-design-vue';

import { useStore } from '#/store/drawer';
import { useFlowStore } from '#/store/flow';
import { nodeData } from '#/utils/flow/const.js';
import $func from '#/utils/flow/index.js';
import { deepCopy } from '#/utils/flow/objutil.js';

import FormPerm from './components/formPerm.vue';
import TitleHandler from './components/titleHandler.vue';
import UserConfig from './components/userConfig.vue';

const copyerConfig = ref({});

const flowStore = useFlowStore();

const step2FormList = computed(() => {
  const step2 = flowStore.step2;

  return step2;
});

const store = useStore();
const { setCopyerConfig, setCopyer } = store;
const copyerDrawer = computed(() => store.copyerDrawer);
const copyerConfig1 = computed(() => store.copyerConfig1);
const visible = computed({
  get() {
    return copyerDrawer.value;
  },
  set() {
    closeDrawer();
  },
});
watch(copyerConfig1, (val) => {
  copyerConfig.value = { ...deepCopy(nodeData[val.value.type]), ...val.value };
});

const openEvent = () => {
  const value = step2FormList.value;
  const arr = {};
  const formPerms = copyerConfig.value.formPerms;

  for (const item of value) {
    arr[item.id] = 'R';

    if (formPerms[item.id]) {
      arr[item.id] = formPerms[item.id];
    }
  }
  copyerConfig.value.formPerms = arr;
};

const saveCopyer = () => {
  copyerConfig.value.error = !$func.checkCopy(copyerConfig.value).ok;
  copyerConfig.value.errorMsg = $func.checkCopy(copyerConfig.value).msg;
  setCopyerConfig({
    value: copyerConfig.value,
    flag: true,
    id: copyerConfig1.value.id,
  });
  closeDrawer();
};
const closeDrawer = () => {
  setCopyer(false);
};

watch(
  () => visible.value,
  (val) => {
    setTimeout(() => {
      if (val) {
        openEvent();
      } else {
        saveCopyer();
      }
    });
  },
);
</script>
<template>
  <Drawer
    v-model:open="visible"
    class="set_copyer"
    :closable="false"
    :width="650"
  >
    <template #title>
      <TitleHandler :node-config="copyerConfig" />
    </template>

    <Tabs type="border-card">
      <TabPane tab="设置抄送人" key="1">
        <UserConfig
          :approver-config="copyerConfig"
          :exclude-assign-type="[11, 4, 12, 14]"
        />
      </TabPane>
      <TabPane tab="表单权限" key="2">
        <FormPerm :hide-key="['E']" :form-perm="copyerConfig.formPerms" />
      </TabPane>
    </Tabs>
  </Drawer>
</template>

<style lang="less" scoped></style>
