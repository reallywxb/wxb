<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import {
  DatePicker,
  Drawer,
  Input,
  Select,
  SelectOption,
  Switch,
} from 'ant-design-vue';

import { useStore } from '#/store/drawer';
import { delayUnitOpts, nodeData } from '#/utils/flow/const.js';
import $func from '#/utils/flow/index.js';

import TitleHandler from './components/titleHandler.vue';

const config = ref({});

const store = useStore();
const { setDelayConfig, setDelay } = store;
const delayDrawer = computed(() => store.delayDrawer);
const delayConfigData = computed(() => store.delayConfigData);
const visible = computed({
  get() {
    return delayDrawer.value;
  },
  set() {
    closeDrawer();
  },
});
watch(delayConfigData, (val) => {
  config.value = { ...nodeData[val.value.type], ...val.value };
});

const changeMode = () => {
  config.value.value = '';
};

const openEvent = () => {};

const saveDelay = () => {
  config.value.error = !$func.checkDelay(config.value).ok;
  config.value.errorMsg = $func.checkDelay(config.value).msg;
  setDelayConfig({
    value: config.value,
    flag: true,
    id: delayConfigData.value.id,
  });
  closeDrawer();
};
const closeDrawer = () => {
  setDelay(false);
};

watch(
  () => visible.value,
  (val) => {
    setTimeout(() => {
      if (val) {
        openEvent();
      } else {
        saveDelay();
      }
    });
  },
);
</script>
<template>
  <Drawer
    :append-to-body="true"
    v-model:open="visible"
    class="set_copyer"
    :closable="false"
    :width="650"
  >
    <template #title>
      <TitleHandler :node-config="config" />
    </template>

    <Switch
      style="margin: 10px 0"
      v-model:checked="config.mode"
      @change="changeMode"
      checked-children="固定时长"
      un-checked-children="固定时间点"
    />

    <div>
      <template v-if="config.mode">
        <Input
          v-model:value="config.value"
          type="number"
          placeholder="请输入时长"
          style="width: 250px"
        >
          <template #addonBefore>
            <Select
              v-model:value="config.delayUnit"
              placeholder="Select"
              style="width: 115px"
            >
              <SelectOption v-for="item in delayUnitOpts" :key="item.value">
                {{ item.label }}
              </SelectOption>
            </Select>
          </template>
        </Input>
        <span class="append-text"> 后进入下一节点 </span>
      </template>
      <template v-else>
        <DatePicker
          v-model:value="config.value"
          show-time
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择时间点"
        />
        <span class="append-text"> 进入下一节点 </span>
      </template>
    </div>
  </Drawer>
</template>

<style lang="less" scoped>
.append-text {
  line-height: 30px;
}
</style>
