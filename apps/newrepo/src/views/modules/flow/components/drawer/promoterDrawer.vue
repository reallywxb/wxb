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

const store = useStore();

const starterConfig = ref({});
const flowStore = useFlowStore();

const starterConfigData = computed(() => store.starterConfigData);
watch(starterConfigData, (val) => {
  starterConfig.value = { ...deepCopy(nodeData[val.value.type]), ...val.value };
});
const step2FormList = computed(() => {
  const step2 = flowStore.step2;

  return step2;
});

const openEvent = () => {
  const value = step2FormList.value;
  const arr = {};
  const formPerms = starterConfig.value.formPerms;
  for (const item of value) {
    arr[item.id] = 'E';

    if (formPerms[item.id]) {
      arr[item.id] = formPerms[item.id];
    }
  }
  starterConfig.value.formPerms = arr;
};

const { setPromoter, setStarterConfig } = store;
const promoterDrawer = computed(() => store.promoterDrawer);
const visible = computed({
  get() {
    return promoterDrawer.value;
  },
  set() {
    closeDrawer();
  },
});

const savePromoter = () => {
  // starterConfig.value.error = !$func.checkStarter(starterConfig.value);

  starterConfig.value.error = !$func.checkStarter(starterConfig.value).ok;
  starterConfig.value.errorMsg = $func.checkStarter(starterConfig.value).msg;
  setStarterConfig({
    value: starterConfig.value,
    flag: true,
    id: starterConfigData.value.id,
  });
  closeDrawer();
};
const closeDrawer = () => {
  setPromoter(false);
};

watch(
  () => visible.value,
  (val) => {
    setTimeout(() => {
      if (val) {
        openEvent();
      } else {
        savePromoter();
      }
    });
  },
);
</script>
<template>
  <Drawer
    v-model:open="visible"
    class="set_promoter"
    :closable="false"
    :width="650"
  >
    <template #title>
      <TitleHandler :node-config="starterConfig" />
    </template>

    <div class="demo-drawer__content">
      <Tabs type="border-card">
        <TabPane tab="表单权限" key="1">
          <FormPerm :form-perm="starterConfig.formPerms" />
        </TabPane>
      </Tabs>
    </div>
  </Drawer>
</template>
<style lang="less" scoped></style>
