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

// TODO
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

// TODO
const store = useStore();
const {
  setApprover,

  setApproverConfig,
} = store;

const _uid = getCurrentInstance()?.uid;

function open() {
  // TODO
  setApprover(true);
  setApproverConfig({
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
    @update-data="updateParentData"
    :uid="_uid"
    store-data-key="approverConfigData"
    place-holder-method-name="setApproverStr"
    check-method-name="checkApproval"
    @open="open"
    :node-config="nodeConfig"
  />
</template>

<style scoped lang="less"></style>
