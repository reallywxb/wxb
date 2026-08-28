<script setup lang="ts">
import { computed, getCurrentInstance, isReactive, toRaw, watch } from 'vue';

import { cloneDeep } from 'lodash-es';

import { useStore } from '#/store/drawer';
import { useFlowStore } from '#/store/flow';

import NodeTemplate from './node-template.vue';

const props = defineProps({
  nodeConfig: {
    type: Object,
    default: () => {},
  },
});

const emits = defineEmits(['updateData']);

const flowStore = useFlowStore();

const step2FormList = computed(() => {
  const step2 = flowStore.step2;
  return step2;
});

// TODO 6
watch(
  () => step2FormList.value,
  (val) => {
    const nodeConfig = props.nodeConfig;

    if (
      nodeConfig.type === 1 && // 审批人
      nodeConfig.assignedType === 8
    ) {
      // 表单人员
      const formUserId = nodeConfig.formUserId;
      const length = val.filter((res) => res.id === formUserId).length;
      if (length === 0) {
        nodeConfig.formUserId = '';
        nodeConfig.formUserName = '';
        nodeConfig.error = true;
        nodeConfig.errorMsg = '请选择表单人员';
      }
    }
  },
);

const updateParentData = (d) => {
  emits('updateData', d);
};

const store = useStore();
const {
  // TODO 2
  setCopyer,

  setCopyerConfig,
} = store;

const _uid = getCurrentInstance().uid;

function open() {
  // TODO 4
  setCopyer(true);
  setCopyerConfig({
    value: cloneDeep(
      isReactive(props.nodeConfig) ? toRaw(props.nodeConfig) : props.nodeConfig,
    ),

    flag: false,
    id: _uid,
  });
}
</script>

<template>
  <NodeTemplate
    :uid="_uid"
    store-data-key="copyerConfig1"
    @update-data="updateParentData"
    place-holder-method-name="copyerStr"
    check-method-name="checkCopy"
    @open="open"
    :node-config="nodeConfig"
  />
</template>

<style scoped lang="less"></style>
